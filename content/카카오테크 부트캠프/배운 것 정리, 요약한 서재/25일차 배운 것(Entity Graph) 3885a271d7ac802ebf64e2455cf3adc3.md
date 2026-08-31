# 25일차 배운 것(Entity Graph)

**25일차 6/19 금요일**

**@Entity Graph**

N+1 해결 위해서 fetch join 함.. 이거 하려면 쿼리 어노테이션 열어서 JPQL 작성해야함.

여기서 더 편하게 쓰는게 entity graph

Jpql 직접 작성하지 않고도 repository 단위로 “로딩 계획을 선언 할 수 있는 기능”

가져가야 할 핵심

- Entitygraph 무엇이고, repository 메소드에 로딩 계획 선언한다는 의미를 의해
- Fetch join, entity graph, batchsize를 어떤 상황에서 구분해서 사용할지 기준.

정의 :

특정 엔티티를 조회할 때, 함께 로딩할 연관 엔티티를 사전에 지정해서 N+1문제를 해결해주는 어노테이션.

- > 지연 로딩.. 거의 디폴트인데
- > 반복문 안에서 지연 로딩된 연관 관계 접근하면 문제 생길수잇음.
- > 이걸 해결하기 위해 fetch join . 적어두면 지연 로딩 설정 예외적으로 무시하고 데이터 한번에 가져옴.
- > entitygraph도 같음. 방식이 다를뿐.

entityGraph는 JPQL 수정하는게아니라 메소드 위에 어노테이션 붙여서 “이 메소드 실행 할 때, 연관속성 함께 로딩 대상으로 포함해달라고 선언 하는거임.

즉, 즉시 로딩으로 바꾸는 기능이 아니라, “특정 조회에서 필요한 연관 관계를 미리 가져오도록 지정하는 것.

사용 이유 :

반복적인 쿼리가 발생하는 N+1 문제를 방지하고 연관 데이터를 한번에 조회하기 위해서.

- > fetch 대신 쓰는 이유?
- > Spring data spa 쓰다보면 findByNickname 처럼 메소드 이름만으로 쿼리를 만들어 주는 것.

N+1 문제 생겨서 연관 데이터도 같이 가져오고 싶다.

그럼 @Query 붙여서 join fetch… JPQL 써야 하는데

- > 메소드 이름 기반 쿼리 생성 이라는 장점을 잃게 됨

근데 그래프 쓰면 기존 쿼리 메소드 장점 유지하면서 연관관계 로딩 계획만 추가

기존에 쓰던 메소드 위에 @EntityGraph(attributePaths = ‘posts’)를 붙이면 이 조회에서 post도 함께 로딩 대상으로 포함하겠다고 의도를 선언 할 수 잇음.

List<User> findAll();

이랑,

@EntityGraph(attributePaths = ‘posts’)

Lish<User> findAllBy();

랑은 다르다는 것임. 위에는 비어있는 프록시 객체.

만약에 user.getPosts().size() 하면 N+1 이 터지는데 아래는. 이미 left outer join 으로 엮어서 함꺼번에 가져 온다는거임.

Fetch join이랑의 차이 : 단순히 연관 관계 가져오고 싶으면 엔티티 그래프로 간결하게, 반대로 조인 조건이 복잡하거나 조인 방식과 조건을 개발자가 세밀하게 제어해야한다면 fetch join이 적합하다.

그리고 entity Graph는 left outer join이 기본임. 만약에 inner join이 필요하다.. 라고 하면 fetch join으로 inner join 써도 됨.