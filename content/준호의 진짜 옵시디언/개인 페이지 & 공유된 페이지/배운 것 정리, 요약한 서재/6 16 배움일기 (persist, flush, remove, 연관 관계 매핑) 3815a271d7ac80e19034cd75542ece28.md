# 6/16 배움일기 (persist, flush, remove, 연관 관계 매핑)

# Persist

persist() 메소드는 새로 생성한 엔티티를 영속성 컨텍스트에 등록해 JPA가 관리하도록 만드는 메소드이다.

```java
User user = new user(”test”);
em.persist(user); //사용 예시
```

new 로 만든 User는 단순 자바의 객체이지만 persist()를 통해 영속상태로 전환된 상태이다.

- persist 는 DB에 바로 INSERT 하는 메소드가 아닌 영속성 컨텍스트의 쓰기 지연 저장소에 저장되었다가, Flush나 Commit 단계에서 실행 되는 것이다.

그러나 MySQL 의 AUTO_INCREMENT를 사용하는 IDENTITY 전략에는 예외적으로 INSERT SQL 쿼리가 실행 될 수 있다. (DB에 값이 있어야 AUTO_INCREMENT가 작동하기 때문).

여기에서 핵심은 DB에 INSERT가 된 것일 뿐이지 트랜잭션이 커밋된 상태는 아니다.

#### persist 사용 이유 :

- JPA에게 엔티티 관리를 맡기기 위함. (JPA를 사용하는 이유와 비슷)

# Flush

영속성 컨텍스트의 변경 내용을 DB에 SQL을 보내 동기화 하는 메소드이다.

```java
em.flush(); //사용 예시
```

- flush는 영속성 컨텍스트에 쌓인 여러 INSERT, DELETE, UPDATE 와 같은 SQL을 개발자가 수동으로 DB에 보내는 것이다.

여기에서 핵심은 flush와 commit은 다르다는 뜻이다. 즉, 롤백이 가능하다.

flush 이후에도 영속성 컨테이너의 1차 캐시는 남아있으므로 OOM 처리를 위해 영속성 컨테이너를 비워줘야 한다면 Clear() 메소드를 사용해 비워주기도 함

#### flush() 사용 이유 :

- 미리 예외(DB 제약 조건)를 확인하기 위해.
- 네이티브 쿼리(레거시 SQL) 실행 전에 DB와의 동기화를 위해.
- 대용량 배치 처리를 하기 위해 - 너무 많은 persist로 1차 캐시가 넘치려 할 때, flush와 clear를 통해 처리한다.

# Remove

영속 상태인 엔티티를 삭제 예정으로 만드는 메소드이다.

```java
User user = em.find(User.class, 1L); //DB에서 조회해서 영속상태로 만듦
em.remove(user); //사용 예시
```

- remove도 persist와 마찬가지로 DELETE SQL이 바로 나가는 것이 아닌 영속성 컨텍스트에서 삭제 예정으로 표시되는 것이다. 이후 flush나 commit 단계에서 실행된다.

여기에서 핵심은 영속 상태의 엔티티에만 적용이 가능하다는 것이다. 

#### Remove() 사용 이유:

- 영속성 컨텍스트와의 일관성 유지. - 네이티브 쿼리로 DELETE 하면, 영속성 컨텍스트의 1차 캐시와 DB의 데이터 불일치가 발생 할 수 있음.

> 소프트 딜리트란?
> 

데이터를 “실제로 삭제 하는 것”이 아닌 “삭제 한 것 처럼” 표시하는 방식

DELETE SQL 쿼리처럼 물리 삭제가 아닌 delete = true 등으로 논리 삭제 하는 방식.

사용 이유 :

- 삭제 된 데이터를 복구 해야 할 수도 있을 때.
- 기록이 있어야 할 때. 등등

주의 점 : 실제로 삭제 한 것이 아니기 때문에 조회 조건을 항상 신경 써야 함. (UNIQUE 제약 조건 등..)

# 연관 관계 매핑

DB는 외래키로, Java는 참조로 관계를 맺는다. 이러한 간극을 해소하기 위한 관계 매핑.

```java
@Entity
public class Post {

    @ManyToOne // 사용 예시 (사용자 하나는 여러개의 Post를 가진다)
    @JoinColumn(name = "user_id") // 사용 예시 (user_id의 외래키로)
    private User user; //(user 테이블과 매핑한다, 차후 나올 양방향 관계의 기반)
}
```

단순히 숫자만 다루는 것이 아닌 도메인 관계를 객체로 표현 한 것.

post.getUser().getName(); 와 같이 DB에서는 Join을 이용하지만, 객체 그래프 탐색을 이용해 참조를 따라 갈 수 있다는 장점이 있다. 

### 단방향 관계

위와 같은 코드는 Post → User 접근이 가능하지만, User → Post 접근이 불가하다. 이러한 관계를 단방향 관계라고 한다.

### 양방향 관계

```java
@Entity
public class User {

    @OneToMany(mappedBy = "user") //사용 예시 (Post 클래스의 user 필드에 의해서 map 되었다.
    private List<Post> posts = new ArrayList<>(); //작성한 Post 목록
}
```

위와 같은 코드가 있으면 User → Post 접근이 가능해지며 양방향 관계가 성립된다.

### 연관 관계의 주인

그럼 양방향 관계에서의 연관 관계의 주인은 누구인가? 

- 결론은 DB에서 외래키를 가진 필드가 주인.
- 통상 1(사용자):N(게시글) 관계 에서 N 쪽이 외래키를 가지고 있으므로 게시글, Post 필드가 주인이다.

따라서 주인이 아닌 쪽은 위의 코드와 같이 mappedBy를 통해 JPA에게 명시하는 것이다.

왜 N이 주인이어야 하는가?

post 쪽에서 user_id의 외래키를 들고 있으므로, post에서 update나 select가 이루어지는게 자연스러움.

만약 User 쪽이 주인이라면 OneToMany 관계가 만들어지는데, 이런 관계가 이루어지면 객체는 User가 관리하지만, 실제 외래키는 Post가 들고 있기 때문에 Post에 INSERT 후, User 에서 UPDATE가 추가로 이루어지는 성능 저하가 발생 할 수 있다.