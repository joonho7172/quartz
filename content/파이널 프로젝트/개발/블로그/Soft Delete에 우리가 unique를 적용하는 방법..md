
# 배경
현재 프로젝트에서는 soft_delete 방식을 사용하고 있다.
	 soft_delete?
	 
	 데이터를 삭제 할 때, 물리적으로 delete 하는 것이 아닌, 논리적으로 삭제 해, 기록을 유지 할 수도 있고, 필요시에 복원이 가능하다는 장점이 있지만 쓰레기 데이터가 누적되거나 테이블 용량이 비대해지고, 성능 저하까지도 발생 할 수 있다는 tradeOff가 있다.
	 
여기에서 문제가 나타났다.

그룹 이름의 중복을 막기 위해 group_name에 unique키 칼럼을 적용했다.
후에 softdeleted를 통해 삭제 처리가 된 group_name을 다시 생성하자니, unique 제약 조건과 충돌 되는 것이었다.

PostgreSQL 같은 경우에는 삭제되지 않은 행끼리만 UNIQUE 제약을 두는 partial unique index를 두는 방식으로 해결한다.

```PostgreSQL
CREATE TABLE users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email TEXT NOT NULL,
  deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX users_email_active_uq
  ON users (email)
  WHERE deleted_at IS NULL; /*deleted_at이 NULL 인 애들에 대해서 UNIQUE 적용을 한다 */
```


MySQL에서도 같은 방법으로 해결하면 되겠지 라는 생각에 복합 UNIQUE 인덱스를 적용해봤습니다.
![[Pasted image 20261004124314.png]]

결과는 아래와 같았습니다.
![[Pasted image 20261004124434.png]]

여기서 확인 할 수 있는 점은 MySQL에서는 NULL 값에 대해서 중복을 허용한다는 점이었습니다.

이러한 문제를 해결하기 위해서, 첫번째 대안은 functional index 적용이었습니다.
# Functional index
```MySQL
CREATE TABLE group_unique_func_demo (
group_id BIGINT NOT NULL AUTO_INCREMENT,
group_name VARCHAR(30) NOT NULL,
deleted_at DATETIME NULL,
PRIMARY KEY (group_id)
);

CREATE UNIQUE INDEX uq_active_group_name
ON group_unique_func_demo ((CASE WHEN deleted_at IS NULL THEN group_name ELSE NULL END));
```

위와 같이 Functional UNIQUE 인덱스를 선언하고, 같은 행을 2개 넣으면,

![[Pasted image 20261004130606.png]]

NULL 값 또한, 같이 UNIQUE 적용이 되는걸 볼 수 있습니다.

### 만약 SoftDeleted한 상태에서 같은 값을 넣으면?

![[Pasted image 20261004130806.png]]
잘 적용이 되는 것을 볼 수 있습니다.

## 어떻게 functional index가 작동하는가

![[Pasted image 20261004132942.png]]
`EXTENDED`를 적용해서 보면, 내부적으로 Extra가 `VIRTUAL GENERATED`로 숨겨져 있는, 가상의 칼럼을 볼 수 있습니다.

기존에 UNIQUE로 적용하면 중복 NULL을 허용하던 MySQL이, functional index를 적용하면, 내부 엔진인 innoDB에서, 가상의 컬럼을 생성하여, deleted_at이 NULL인 경우의 group_name을, 가상의 컬럼으로 넣고, 그 내용을 UNIQUE로 적용하는 방식입니다.

![[Pasted image 20261004162236.png]]

(가상의 UNIQUE 컬럼에 의해서 같은 이름의 행 적용이 안되는 모습.)

# Nullalbe 보조 컬럼을 unique 매핑하기


Nullable 보조 컬럼을 unqiue로 매핑하는 것은 다음과 같다.

기본의 group_name을 두고, deleted_at이 null인 경우에는 active_group_name을 group_name과 같게,
deleted_at이 등록되면, NULL로 변환 시키는것으로, 실질적으로 확인하는 것은 active_group_name이다.

|group_name|deleted_at|active_group_name|
|---|---|---|
|카카오테크 부트캠프|`NULL`|카카오테크 부트캠프|
|카카오테크 부트캠프|삭제 시각|`NULL`|
|카카오테크 부트캠프|`NULL`|카카오테크 부트캠프|




```
이번 주말에 softDelete 관련해서 unique 칼럼 적용에 대해서 문제가 있었는데,
기존에는 PostgreSQL로 기술 선정을 했어서, delatedAt과 name(uk) 를 partial index 적용을 해 해결을 하려고 설계에서 잡았었는데, 기술 선정이 Mysql로 바뀌면서 부분 인덱스 적용을 못하게 되었습니다.(null값이 중복 되기 때문)

해결법을 찾아보고 AI 도움을 받아서 
1. functional unique index 사용하기
2. generated column + unique index
3. nullable 보조 칼럼을 unique 매핑하기
로 좁혀졋는데, 이런 것들을 적용하기 위해서는 migration 도구인 flyway 등등을 같이 사용하면 좋다라고 하더라구요. 

결론은 이 부분 시간 써서 공부하고 따로 만드는 팀 블로그에다가 정리 하려고 하는데, 괜찮은 주제일까요? 매력적이지 않은 주제이거나, 약간 시간낭비 라고 생각되시면 간단하게 몇 줄 적고 끝내고 이어서 개발하려고 합니다!


1. 좋기는 한데 1번이랑 2번의 차이가 뭐가 있는지 보시고 펑셔널 인덱스가 내부적으로 어떻게 구현되어 있는지 보시면 더 의미가 있을것 같네요. SHOW CREATE TABLE이나 EXPLAIN으로 직접 확인해보세요. 그리고 JPA 붙였을때 어떻게 되는지도 보셔야합니다. 그리고 DB 레벨 유니크자체가 왜 필요한지도 보세요. 그냥 어플리케이션 레벨에서 exists로 체크할 수 있는데 쓰는 이유. 동시에 요청 들어왔을때를 그려보세요.
```