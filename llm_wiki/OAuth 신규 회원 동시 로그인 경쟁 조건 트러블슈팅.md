
## 문제 상황

아직 회원으로 가입하지 않은 동일한 OAuth 계정이 거의 동시에 로그인 요청을 보낼 수 있다.

두 요청이 각각 다음 흐름을 실행한다.

~~~text
T1: SocialAccount 조회 → 없음
T2: SocialAccount 조회 → 없음

T1: User 생성 + SocialAccount 생성 성공
T2: User 생성 + SocialAccount 생성 시도
    → (provider, provider_user_id) UNIQUE 제약조건 위반
~~~

조회와 생성을 순서대로 실행하더라도, 서로 다른 트랜잭션은 상대 트랜잭션의 INSERT를 즉시 보지 못할 수 있다.

## 원인: phantom read인가?

엄밀히는 전형적인 phantom read라기보다 check-then-act race condition에 가깝다.

phantom read는 같은 트랜잭션에서 동일한 범위 조회를 다시 했을 때 다른 row가 나타나는 현상이다. 이번 문제는 같은 조회를 반복한 것이 아니라, 조회 결과가 없음인 상태에서 두 트랜잭션이 동시에 생성을 시도한 경쟁 조건이다.

REPEATABLE READ로 올려도 두 트랜잭션이 같은 snapshot에서 모두 없음으로 볼 수 있으므로 근본 해결이 아니다. SERIALIZABLE은 한 트랜잭션을 중단시킬 수 있지만, 중단된 트랜잭션은 결국 rollback 후 재시도해야 한다.

## 필수 전제: DB UNIQUE 제약조건

애플리케이션 조회만으로 중복을 막으면 안 된다. 최종 방어선은 DB 제약조건이어야 한다.

~~~java
@Table(
    name = "social_accounts",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_social_account_provider_user",
        columnNames = {"provider", "provider_user_id"}
    )
)
~~~

중복 기준은 다음 조합이다.

~~~text
(provider, provider_user_id)
~~~

## 권장 해결 방법

현재 구조에서는 UNIQUE 제약조건과 rollback 후 새 트랜잭션에서 재조회하는 방식이 가장 단순하고 안전하다.

### 최초 트랜잭션

~~~java
SocialAccount account = socialAccountRepository
        .findByProviderAndProviderUserId(provider, providerUserId)
        .orElse(null);

if (account != null) {
    User user = userRepository.findActiveById(account.getUser().getId())
            .orElseThrow(() -> new IllegalStateException("user is not active"));
    return new AccountResult(user, false);
}

User user = userRepository.save(new User(nickname));
socialAccountRepository.saveAndFlush(
        new SocialAccount(user, provider, providerUserId)
);
return new AccountResult(user, true);
~~~

saveAndFlush()는 UNIQUE 충돌을 트랜잭션 종료 시점까지 미루지 않고 현재 흐름에서 감지하기 위한 것이다. 충돌한 트랜잭션은 User와 SocialAccount를 포함해 전체 rollback되어야 한다.

### retryAfterDuplicate의 역할

retryAfterDuplicate()는 INSERT를 무작정 다시 시도하는 메서드가 아니다.

~~~text
1. 최초 트랜잭션 A에서 UNIQUE 충돌 발생
2. 트랜잭션 A 전체 rollback
3. 실패한 트랜잭션 밖에서 중복 키 예외를 catch
4. 새 트랜잭션 B 시작
5. findOrCreate() 전체를 다시 실행
6. 먼저 성공한 요청이 만든 SocialAccount 발견
7. 활성 User 조회
8. AccountResult(user, false) 반환
9. 기존 회원으로 토큰 발급
~~~

~~~java
@Transactional(propagation = Propagation.REQUIRES_NEW)
public AuthTokenResult retryAfterDuplicate(...) {
    AccountResult result =
            accountProvisioningService.findOrCreate(userInfo);

    return issueTokens(result);
}
~~~

경쟁 요청의 트랜잭션도 rollback되어 실제 row가 남지 않았다면, 새 트랜잭션에서 신규 회원을 생성할 수도 있다. 따라서 기존 회원 조회만 재시도하는 것이 아니라 회원 프로비저닝 전체를 한 번 재시도하는 구조다.

## 트랜잭션 Bean 분리

실패한 트랜잭션 내부에서 예외를 잡고 바로 조회하면 안 된다. 트랜잭션이 이미 rollback-only 상태일 수 있기 때문이다.

또한 REQUIRES_NEW가 적용되려면 호출이 Spring proxy를 통과해야 한다. 같은 클래스 내부에서 자기 메서드를 호출하지 말고 별도 Bean 간 호출로 구성한다.

~~~text
OAuthAuthenticationService/AuthService
    └─ AuthenticationTransactionService.authenticate()
          @Transactional
          └─ AccountProvisioningService.findOrCreate()

중복 키 발생
    └─ 첫 번째 트랜잭션 rollback
    └─ AuthenticationTransactionService.retryAfterDuplicate()
          @Transactional(REQUIRES_NEW)
          └─ AccountProvisioningService.findOrCreate()
~~~

AccountProvisioningService는 별도 트랜잭션을 새로 만드는 것이 아니라 AuthenticationTransactionService가 시작한 트랜잭션에 참여한다. 기본 전파 속성인 REQUIRED를 사용하면 된다.

## 예외 처리 주의사항

모든 DataIntegrityViolationException을 retry하면 안 된다. uk_social_account_provider_user UNIQUE 충돌인 경우만 retry하고, 닉네임 길이 초과나 NULL 제약조건 위반은 그대로 실패시킨다.

retry는 무한 반복하지 않고 한 번만 수행한다.

## 다른 해결 방법

### SERIALIZABLE

DB가 트랜잭션을 직렬화한다. 하지만 serialization failure가 발생하면 결국 rollback 후 retry가 필요하고, 동시성도 낮아질 수 있다.

### 비관적 잠금

SELECT FOR UPDATE를 사용할 수 있지만 신규 OAuth 계정처럼 아직 row가 없으면 잠글 row가 없다. 별도 lock table이 필요하고 lock row 생성의 경쟁 조건도 해결해야 한다.

### DB Upsert

PostgreSQL의 ON CONFLICT DO NOTHING이나 MySQL의 ON DUPLICATE KEY UPDATE를 사용할 수 있다. 다만 User와 SocialAccount를 함께 생성해야 하므로 JPA 흐름보다 복잡하고 DB 종속성이 생긴다. 충돌률이나 성능 문제가 측정될 때 고려한다.

### Redis 분산 락

여러 애플리케이션 인스턴스에서 동일 OAuth 계정의 처리를 직렬화할 수 있다. 하지만 Redis 장애, lock 만료, 재진입 등의 문제가 추가된다. 단순한 회원 생성 경쟁 문제에는 필요하지 않다.

프로세스 내부 synchronized는 여러 서버 인스턴스에서 동작하지 않으므로 해결책이 아니다.

## 결론

1. (provider, provider_user_id) UNIQUE 제약조건을 둔다.
2. findOrCreate()에서 먼저 조회한다.
3. 없으면 User와 SocialAccount를 생성한다.
4. UNIQUE 충돌 시 첫 번째 트랜잭션을 rollback한다.
5. 새 트랜잭션에서 findOrCreate()를 한 번 재실행한다.
6. 이미 생성된 계정을 발견하면 기존 회원으로 로그인한다.

이 방식은 phantom read를 없애는 방식이 아니라, DB가 경쟁을 판정하도록 하고 실패한 트랜잭션을 안전하게 복구하는 방식이다.

#OAuth #Transaction #Concurrency #Spring #JPA


## 현재 구현 범위

현재 코드에서는 동시 신규 로그인 문제에 대해 (provider, provider_user_id) UNIQUE 제약조건만 적용한다.

- 먼저 생성된 요청은 정상 로그인한다.
- 동시에 생성하려던 요청은 UNIQUE 충돌로 로그인 오류가 발생한다.
- 실패 요청을 새 트랜잭션에서 기존 회원으로 재처리하는 retry는 아직 구현하지 않는다.

이후 필요성이 확인되면 다음 중 하나를 검토한다.

- 실패 트랜잭션 롤백 후 새 트랜잭션 재조회
- DB Upsert 또는 identity claim row
- 별도 잠금 테이블 또는 분산 락
