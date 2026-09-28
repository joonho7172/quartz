# 배경
운영 환경에서의 GET 요청에 대한 500 서버 오류 발생
![[Pasted image 20260928183951.png]]

사진과 같이 그룹에 속한 물품의 목록을 조회하는 GET  groups/{groupId}/items 요청에서 500 에러가 났다.
엔드포인트가 설정이 되지 않은 것도 아니고 Spring 서버도 정상적인데, 왜 500에러가 나는지 살펴 보았다.


# 원인
Spring 서버의 로그를 살펴보니 아래와 같이 JDBC, jpa 쪽 오류가 발생했다. 

![[Pasted image 20260928183240.png]]

예시만 봐서는 그룹 쪽 조회의 @Transaction(readOnly = true) 안에서 SQL이 동작하지 않는다는 것을 직감 했다.

사실 위의 로그만 봐서는 정확히 어떤 점이 문제인지 모르겠어서 이참에 자세히 찾아보기로 했다.

-----------
먼저, **readOnly** 의 작동에 대해서 살펴보자

![[Pasted image 20260928191453.png]]

spring jpa 내부의 코드를 살펴보니, 위와 같이 설명 되어 있었다.
***it will not necessarily cause failure of write access attempts***.
***A transaction manager which cannot interpret the read-only hint will not throw an exception when asked for a read-only transaction but rather silently ignore the hint.***

read-only를 JDBC 드라이버 구현체에 강제적으로 지킬 필요는 없다는 뜻이고, 해당 작업이 읽기 중심이라는 것을 Spring 과 JPA 에 알린다는 뜻이다.
*실제로 H2 같은 경우는 readOnly 트랜잭션을 ignore 한다* 

```
이것을 왜 알리는지 (HINT)에 대해서도 알아본 결과, JPA에 알려서 DirtyCheck나,flush 동작을 최적화 하기 위함..
```

-----
다음으로 @Lock(LockModeType.pessimistic_WRITE)에 대해서 알아보자 

![[Pasted image 20260928194649.png]]

좀 길지만 살펴보면
***A lock with LockModeType.PESSIMISTIC_WRITE can be obtained on an entity instance to force serialization among transactions attempting to update the entity data***
***A lock with LockModeType.PESSIMISTIC_WRITE can be used when querying data and there is a high likelihood of deadlock or update failure among concurrent updating transactions.

이미 조회한 엔티티에 잠금을 걸면, 같은 데이터를 수정하려는 트랜잭션들에 대기가 걸리고, 순차적으로 실행 된다는 이야기 이다. 더불어, 여러 트랜잭션이 같은 값을 읽고, 동시에 바꾸려는 일이 잦다면, 수정과 조회 사이의 경쟁을 막는데 도움이 된다고 하고 있다.

즉, @Lock(LockModeType.pessimistic_WRITE)은, 조회한 행에 다른 트랜잭션이 수정하지 못하도록 쓰기 잠금을 해놓고,
**조회 메소드에 붙어도 일반 select처럼 읽기만 하는 것이 아니라, DB가 잠금 조회로 처리하도록 한다는 것이다.**

# 그렇다면 왜 Transaction과 lock이 충돌할까

사실 Transaction과 lock 자체가 금지된 조합은 아니다.
그렇다면 왜 Transaction(readOnly = true) 에서는 Lock과 충돌이 일어날까?
먼저, MySQL의 공식 문서를 살펴보자,
![[Pasted image 20260928201045.png]]







'



'
![[Pasted image 20260928183254.png]]