

```java
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "items")
public class Items extends BaseEntity{
}
```
먼저 AccessLevel을 protect로 설정하는 이유에 대해서는 크게 다음과 같다. 
**아무런 매개변수가 없는 생성자를 생성하되, 외부에서 생성된 생성자의 접근을 허가하지 않는다는 뜻**

그렇다면 왜 외부에서의 생성자 접근을 허용하지 않는 것일까..
생각해보면 Entity의 지연로딩이 있다.

Entity의 지연로딩은 직접 접근이 아닌, proxy의 접근을 통해서 이루어지므로,
기본 설정인 private로 두게 되면 프록시의 접근이 안되는 것이다.

이 이유에 대해서는 [[왜 proxy의 접근이 private에서는 되지 않을까]] 에서 확인 하도록..


