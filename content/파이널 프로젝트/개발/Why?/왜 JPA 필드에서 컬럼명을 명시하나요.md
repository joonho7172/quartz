이유는 DB변경이 JPA에 영향을 주지 않도록 하기 위해서 이서.
반대로 JPA의 JAVA 필드명이 리팩토링 되어도 DB 컬럼명은 영향 받지 않게 하기 위해서 이다.

```java
@Colmun(name = "user" , nullable = false, length = 20)
Private UserId id;
```
와 같은 경우에도 

```java
@Colmun(name = "user_email" , nullable = false, length = 20)
Private UserId id;
```
로 DB의 필드 명이 바뀌더라도 JPA에서는 그대로 쓸 수 있고,

```java
@Colmun(name = "user", nullable = false, length = 20)
Private UserEmail user_email;
```
 등 DB의 필드가 바뀌더라도 JPA는 영향은 받지 않을 수 있다.
즉, 각각의 DB 스키마와 도메인 모델의 Entity 가 독립성을 보장한다.

**레거시 DB를 다룰 때 유용함**

 