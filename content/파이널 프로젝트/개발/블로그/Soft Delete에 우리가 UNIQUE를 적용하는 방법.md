
# 배경

보통의 API에서는 `exists` 조회로 같은 이름의 조건이 있는지 먼저 확인할 수 있습니다. 이미 사용 중인 이름이라면 저장 전에 안내할 수 있어 편리하지만 이 검사만으로 데이터의 유일성을 보장할 수는 없습니다.

아직 존재하지 않는 이름인 `카카오테크 부트캠프`로 두 요청이 동시에 그룹을 생성한다고 가정을 해봅시다.

| 순서 | 요청 A | 요청 B |
| --- | --- | --- |
| 1 | 이름 존재 여부 조회 → `false` | |
| 2 | | 이름 존재 여부 조회 → `false` |
| 3 | 그룹 저장 | |
| 4 | | 같은 이름으로 그룹 저장 |

두 요청 모두 사전 검사를 통과합니다. 일반적인 `exists` 조회와 저장을 `@Transactional`로 묶는 것만으로도 이 경쟁 조건이 사라지지는 않습니다. DB에 중복을 제한하는 제약이 없다면 두 행이 모두 저장될 수 있습니다.

따라서 DB 레벨의 UNIQUE 제약은 동시 요청이 들어와도 중복 데이터가 확정되지 않도록 보장합니다. 동일한 키를 저장하려는 트랜잭션은 다른 트랜잭션의 결과를 기다릴 수 있으며, 먼저 저장한 트랜잭션이 커밋되면 뒤따르는 저장은 중복 오류로 실패합니다.

저희 프로젝트에서도 그룹 이름의 중복을 막기 위해 UNIQUE 제약이 필요했습니다. 문제는 삭제된 그룹의 이름을 다시 사용하려 할 때 사용하는 Soft Delete 방식을 적용 하려 할 때 나타났습니다.

## 삭제 이력은 남기되, 이름은 다시 사용할 수 있어야 한다

현재 프로젝트는 행을 물리적으로 삭제하는 대신 `deleted_at`에 삭제 시각을 기록하는 Soft Delete 방식을 사용합니다. 삭제 이력을 보존하고 복구를 고려할 수 있지만, 삭제된 행도 테이블과 인덱스에 남습니다. 데이터가 쌓이는 만큼 보관 정책과 조회 조건도 함께 관리해야 합니다.
`(현재 글에서는 Soft delete에 대해서 자세히 다루지는 않겠습니다)`

`group_name`에 UNIQUE 제약을 걸면 삭제된 그룹도 이름을 계속 점유합니다. 
`카카오테크 부트캠프`를 삭제한 뒤 같은 이름의 그룹을 생성해도, DB에는 기존 행이 남아 있으므로 중복 오류가 발생합니다.

우리가 지켜야 할 규칙은 다음과 같습니다.

> 삭제되지 않은 그룹 사이에서만 이름이 유일해야 한다. 삭제된 그룹의 이름은 재사용할 수 있다.

현재 저희 프로젝트에서는 `deleted_at IS NULL`인 행을 활성 그룹으로 정의합니다. 

## 복합 UNIQUE 인덱스만으로 해결되지 않은 이유

PostgreSQL에서는 조건을 만족하는 행에만 적용되는 부분 유일 인덱스(partial unique index)로 이 규칙을 표현할 수 있습니다.

```sql
-- PostgreSQL 예시
CREATE UNIQUE INDEX uq_active_group_name
ON groups (group_name)
WHERE deleted_at IS NULL;
```

그러나 저희 프로젝트의 DB인 MySQL은 위와 같은 `WHERE` 조건의 인덱스 문법을 지원하지 않습니다. 처음에는 삭제 시각과 이름을 함께 묶으면 활성 그룹의 중복도 막을 수 있을 것이라 생각해 복합 UNIQUE 인덱스를 확인했습니다.

![[Pasted image 20261004124314.png]]

같은 이름과 `NULL`인 삭제 시각으로 두 행을 저장했지만, 두 INSERT 모두 성공했습니다.

![[Pasted image 20261004124434.png]]

MySQL의 공식문서에 따르면 UNIQUE 인덱스는 `NULL`이 포함된 키의 중복을 허용합니다. 따라서 `(NULL, '카카오테크 부트캠프')`는 여러 번 저장될 수 있습니다..
컬럼 순서를 바꿔 `(group_name, deleted_at)`으로 구성해도 결과는 같았습니다.

그래서 저희는, 이러한 SoftDelete를 이용하려면 활성 행에는 이름을 중복 검사할 수 있는 값을 넣고, 삭제된 행에는 `NULL`을 넣어야 합니다. 이후 살펴볼 세 방식은 모두 이 규칙을 구현합니다. 차이는 그 값을 누가 계산하고 어디에 표현하느냐에 있습니다.

## 1. Functional UNIQUE Index: 표현식의 결과에 제약을 건다

### 적용 방법

MySQL 8.0.13부터 지원하는 기능 인덱스(Functional Index)는 표현식의 결과를 인덱스 키로 사용할 수 있습니다. 활성 그룹에는 이름을 반환하고, 삭제된 그룹에는 `NULL`을 반환하는 식에 UNIQUE를 적용합니다.

```sql
CREATE TABLE group_unique_func_demo (
    group_id BIGINT NOT NULL AUTO_INCREMENT,
    group_name VARCHAR(30) NOT NULL,
    deleted_at DATETIME NULL,
    PRIMARY KEY (group_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;

CREATE UNIQUE INDEX uq_active_group_name
ON group_unique_func_demo ((
    CASE
        WHEN deleted_at IS NULL THEN group_name
        ELSE NULL
    END
));
```

![[Pasted image 20261004195527.png]]
EXPLAIN을 통해서 key값이 정확히 적용이 되었는지 볼 수 있습니다.

### 저장과 삭제 시의 동작

활성 그룹을 저장하면 인덱스 식은 `카카오테크 부트캠프`를 반환합니다. 같은 이름의 활성 그룹을 다시 저장하면 인덱스 키가 겹치므로 중복 오류가 발생합니다.

![[Pasted image 20261004130606.png]]

기존 그룹을 Soft Delete하면 식의 결과가 이름에서 `NULL`로 바뀝니다. 이후 같은 이름의 새 그룹을 생성할 수 있습니다.

![[Pasted image 20261004130806.png]]

여기서 `NULL`의 중복 규칙이 달라진 것은 아닙니다. 활성 그룹의 이름이 UNIQUE 검사 대상이 되고, 삭제된 행은 `NULL` 중복을 허용하는 기존 규칙을 따릅니다.

### 내부 구조와 운영 시 고려사항

MySQL은 functional index 를 숨겨진 가상 생성 컬럼으로 구현합니다. 다음 명령을 실행해 내부 컬럼 정보를 확인할 수 있습니다.

```sql
SHOW EXTENDED COLUMNS FROM group_unique_func_demo;
SHOW CREATE TABLE group_unique_func_demo;
SHOW INDEX FROM group_unique_func_demo;
```

다음은 같은 정의로 만든 별도 실습 테이블 `functional_unique_lab`의 결과입니다. `Extra`에 `VIRTUAL GENERATED`가 표시된 숨김 컬럼과 UNIQUE 키 정보를 확인할 수 있습니다.

![[Pasted image 20261004132942.png]]

MySQL이 식으로 계산한 값은 InnoDB의 UNIQUE 보조 인덱스 키로 사용됩니다. 가상 컬럼의 값을 일반 행 데이터에 별도로 저장하지는 않지만, 인덱스에는 계산된 값이 저장됩니다. 따라서 인덱스 공간과 쓰기 시 갱신 비용은 발생합니다. 삭제된 행도 `NULL` 키로 인덱스에 남으므로, 활성 행만 담는 부분 인덱스와 물리적인 구성까지 같지는 않습니다.

이 구조에서도 동일한 활성 이름을 다시 저장하면 다음과 같이 실패합니다.

![[Pasted image 20261004162236.png]]

JPA는 `group_name`과 `deleted_at`만 저장하면 됩니다. 인덱스는 Flyway나 Liquibase 등의 마이그레이션으로 생성하고, 숨김 컬럼은 엔티티에 매핑하지 않습니다. 원본 값에 따라 키가 계산되므로 직접 실행한 SQL에서도 같은 규칙이 적용됩니다.

다만 조회 성능은 별도로 판단해야 합니다. `WHERE group_name = ? AND deleted_at IS NULL`이 이 기능 인덱스를 자동으로 활용한다고 가정할 수는 없습니다. 쿼리의 표현식과 인덱스 식의 일치 여부, 옵티마이저의 비용 판단 등을 `EXPLAIN`으로 확인해야 합니다. 중복을 차단하는 기능은 SELECT 실행 계획과 관계없이 적용됩니다.

## 2. Nullable 보조 컬럼 + UNIQUE: 애플리케이션에서 키를 관리한다

### 적용 방법

현재 프로젝트의 `Group` 엔티티는 일반 컬럼인 `active_group_name`을 추가하고, 이 컬럼에 UNIQUE를 설정하는 방식입니다. 활성 그룹은 이름을 복사하고, 삭제할 때는 `NULL`로 변경합니다.

핵심 필드만 남긴 테이블 구조는 다음과 같습니다.

```sql
CREATE TABLE group_unique_nullable_demo (
    group_id BIGINT NOT NULL AUTO_INCREMENT,
    group_name VARCHAR(30) NOT NULL,
    deleted_at DATETIME NULL,
    active_group_name VARCHAR(30) NULL,
    PRIMARY KEY (group_id),
    UNIQUE KEY uq_active_group_name (active_group_name)
)
```

엔티티에서는 이 일반 컬럼을 직접 매핑합니다.

```java
@Column(name = "active_group_name", length = 30, unique = true)
private String activeGroupName;
```

생성자에서 검증한 그룹 이름을 두 필드에 설정하고, 삭제 메서드에서 보조 컬럼과 삭제 시각을 함께 변경합니다. 아래는 기존 엔티티의 관련 로직을 발췌한 코드입니다.

```java
// 생성자 내부
this.groupName = requireText(groupName, "groupName", 30);
this.activeGroupName = this.groupName;
```

```java
public void delete() {
    if (!isDeleted()) {
        this.activeGroupName = null;
        markDeleted(LocalDateTime.now());
    }
}
```

### 저장과 삭제 시의 동작

이 방식에서 DB가 중복을 검사하는 대상은 `active_group_name`입니다. 삭제된 그룹과 새로 생성한 그룹은 다음과 같이 공존할 수 있습니다.

| group_id | group_name | deleted_at | active_group_name |
| --- | --- | --- | --- |
| 1 | 카카오테크 부트캠프 | 2026-10-04 13:00:00 | `NULL` |
| 2 | 카카오테크 부트캠프 | 2026-10-04 14:00:00 | `NULL` |
| 3 | 카카오테크 부트캠프 | `NULL` | 카카오테크 부트캠프 |

삭제된 두 행의 `NULL`은 허용됩니다. 세 번째 행이 활성 이름을 점유하고 있으므로, 같은 `active_group_name`을 가진 네 번째 행을 저장하면 UNIQUE 제약에 걸립니다.

DB 관점에서 삭제는 다음과 같이 두 컬럼을 함께 변경하는 작업입니다.

```sql
UPDATE group_unique_nullable_demo
SET deleted_at = NOW(),
    active_group_name = NULL
WHERE group_id = 3;
```

### 내부 구조와 운영 시 고려사항

`active_group_name`은 값이 테이블에 저장되는 일반 컬럼입니다. 인덱스에도 키가 저장되며, 애플리케이션이 그 값을 직접 관리합니다. 엔티티에서 구조를 이해하기 쉽고, JPA만으로도 표현이 가능하며 MySQL의 표현식 인덱스 문법에 의존하지 않는다는 장점이 있습니다.

이 방식에서 관리해야 할 부분은 두 컬럼 사이의 일관성입니다. 그룹 이름 변경 시에는 보조 컬럼도 바꿔야 하고, 삭제 시에는 비워야 합니다. 복구 시에는 다시 이름을 채워야 합니다. 이미 다른 활성 그룹이 이름을 사용 중이면 복구 과정에서도 중복 오류가 발생할 수 있습니다.

JPA의 UNIQUE 제약만으로는 `group_name`, `deleted_at`, `active_group_name`의 관계까지 검사하지 않습니다. 활성 행의 보조 컬럼을 실수로 `NULL`로 저장하면 이름 중복이 허용될 수 있고, 삭제한 행의 보조 컬럼을 남겨 두면 이름 재사용이 막힙니다. 배치나 직접 실행한 SQL, 벌크 업데이트도 같은 규칙을 지켜야 합니다.

또한 `@Column(unique = true)`는 스키마 생성에 사용되는 매핑 정보입니다. 실제 중복을 막는 것은 DB에 생성된 UNIQUE 제약이므로, 마이그레이션으로 스키마를 관리한다면 그 정의에도 제약을 포함해야 합니다.

## 3. 가상 생성 컬럼 + UNIQUE: 키 계산을 DB에 맡기고 컬럼을 명시한다

### 적용 방법

보조 컬럼을 테이블에 명시하면서도 값의 계산을 DB에 맡길 수 있습니다. `GENERATED ALWAYS AS`로 계산식을 정의하고 `VIRTUAL`을 지정한 뒤, 해당 컬럼에 UNIQUE 인덱스를 만듭니다.

```sql
CREATE TABLE group_unique_generated_demo (
    group_id BIGINT NOT NULL AUTO_INCREMENT,
    group_name VARCHAR(30) NOT NULL,
    deleted_at DATETIME NULL,
    active_group_name VARCHAR(30)
        GENERATED ALWAYS AS (
            CASE
                WHEN deleted_at IS NULL THEN group_name
                ELSE NULL
            END
        ) VIRTUAL,
    PRIMARY KEY (group_id),
    UNIQUE KEY uq_active_group_name (active_group_name)
) 
```

앞선 일반 보조 컬럼과 이름은 같지만, 이 컬럼의 값은 애플리케이션이 넣지 않습니다. INSERT와 UPDATE에는 원본 컬럼만 지정합니다.

### 저장과 삭제 시의 동작

아래는 새 테이블에서 생성과 삭제, 이름 재사용을 확인하는 예시입니다.

```sql
-- 활성 그룹 생성: active_group_name은 DB가 계산한다.
INSERT INTO group_unique_generated_demo (group_name)
VALUES ('카카오테크 부트캠프');

-- 삭제 시각만 바꾸면 계산 결과도 NULL로 바뀐다.
UPDATE group_unique_generated_demo
SET deleted_at = NOW()
WHERE group_id = 1;

-- 같은 이름으로 새 활성 그룹을 생성한다.
INSERT INTO group_unique_generated_demo (group_name)
VALUES ('카카오테크 부트캠프');

SELECT group_id, group_name, deleted_at, active_group_name
FROM group_unique_generated_demo
ORDER BY group_id;
```

예상 결과는 첫 번째 행의 `active_group_name`이 `NULL`, 두 번째 행의 값이 `카카오테크 부트캠프`인 상태입니다. 여기서 같은 이름의 활성 그룹을 한 번 더 INSERT하면 UNIQUE 제약으로 실패합니다. 이름을 변경하거나 삭제 상태를 바꿀 때도 DB가 식에 맞춰 인덱스 키를 갱신합니다.

![[Pasted image 20261004200118.png]]
active_group_name이 `VIRTUAL GENERATED`로 지정 된 것을 볼 수 있고,


![[Pasted image 20261004195955.png]]
화면과 같이 가상 컬럼인 active_group_name이 바뀌는 것을 볼 수 있습니다. 

![[Pasted image 20261004200231.png]]
정확히는 EXPAIN을 통해서 UNIQUE key가 적용된 것을 알 수 있습니다.

### 내부 구조와 운영 시 고려사항

기능 인덱스와 이 방식은 모두 가상 생성 컬럼의 계산 결과에 UNIQUE 인덱스를 적용합니다. 기능 인덱스에서는 MySQL이 숨김 컬럼을 만들고, 이 방식에서는 개발자가 컬럼 이름과 식을 직접 선언합니다.

명시적으로 만든 컬럼은 `SHOW COLUMNS`와 `SHOW CREATE TABLE`에서 확인하고, `SELECT active_group_name`으로 조회할 수 있습니다. 계산된 키를 직접 확인해야 할 때 유용합니다. 
기능 인덱스와 마찬가지로 가상 컬럼 자체를 일반 행 데이터에 저장하지 않지만, 인덱스에는 값이 저장됩니다.

*JPA*에서는 이 컬럼을 매핑하지 않고 `groupName`과 `deletedAt`만 관리할 수 있습니다. 조회를 위해 매핑한다면 `insertable = false`, `updatable = false`로 쓰기 대상에서 제외해야 합니다. 
해당 필드의 메모리 값이 원본 필드 변경 직후 자동으로 동기화되는 것은 아니므로, 즉시 계산된 값이 필요하다면 다시 조회하거나 별도의 생성값 처리 설정이 필요합니다.

생성 컬럼과 인덱스 정의는 마이그레이션 도구(flyway, liquibase)로 관리합니다. DB가 계산을 담당하므로 쓰기 경로마다 보조 컬럼을 맞출 필요는 줄지만, 스키마가 MySQL의 생성 컬럼 기능에 의존한다는 점은 남습니다.

## 현재 구현과 대안을 비교하며

세 방식 모두 활성 이름을 UNIQUE 키로 만들고, 삭제된 이름을 `NULL`로 처리한다는 규칙은 같습니다.

| 비교 항목          | 기능 인덱스           | Nullable 보조 컬럼 + UNIQUE | 가상 생성 컬럼 + UNIQUE |
| -------------- | ---------------- | ----------------------- | ----------------- |
| 키 계산 담당        | DB               | 애플리케이션                  | DB                |
| 보조 컬럼 형태       | 숨겨진 가상 생성 컬럼     | 직접 값을 저장하는 일반 컬럼        | 이름을 선언한 가상 생성 컬럼  |
| 원본 값과의 동기화     | 식에 따라 자동 계산      | 쓰기 경로마다 함께 갱신           | 식에 따라 자동 계산       |
| 보조 값 직접 조회     | 일반 컬럼처럼 조회할 수 없음 | 가능                      | 가능                |
| JPA에서 키를 저장하는가 | 저장하지 않음          | 직접 저장                   | 저장하지 않음           |


기능 인덱스와, 가상 생성 컬럼 + UNIQUE는 MySQL 내부에서 숨겨진 가상 생성 컬럼을 사용합니다.
그래서 **기능 인덱스와 가상 생성 컬럼 방식은 내부 구현과 인덱스 갱신 비용이 대체로 같습니다.**
주요 차이는 생성 컬럼을 직접 선언해 이름을 붙이고 조회할 수 있게 하느냐예요.

Nullable 컬럼으로 UNIQUE 매핑을 하는 것은 JPA에게 지나치게 의존적이고, 데이터 갱신의 쓰기 비용이 크지만 그만큼 한 눈에 알아보기 편하다는 장점이 있습니다.

저희 프로젝트는 데이터의 정합성이 가장 중요하기 때문에 최후의 보루인 DB 제약도 챙겨야 했고, 다른 개발자들도 조회 할 수 있게끔 하며, JPA에서 읽기 전용으로 매핑도 가능해야 했기에, 가상 생성 컬럼 + UNIQUE 제약을 택했지만,
결국 각자 프로젝트의 상황에 맞게 soft delete를 어떻게 구현하느냐가 관건 인 것 같습니다.
