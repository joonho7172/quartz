BaseEntity와 SoftDeletableEntity는 아래와 같이 추상 클래스이다.

```java
public abstract class BaseEntity{

}

public abstract class SoftDeletableEntity extends BaseEntity{

}
```


일단 구체적으로 사용이 되는 도메인 엔티티가 아니기 때문에 추상 클래스로 선언함으로써
BaseEntity(), SoftDeletableEntity ()를 사용할 일이 없음을 명시와,
다른 Entity들의 부모 클래스로 내부의 createdAt, updateAt, deletedAt 등의 필드를 제공만 하는 클래스이기 때문