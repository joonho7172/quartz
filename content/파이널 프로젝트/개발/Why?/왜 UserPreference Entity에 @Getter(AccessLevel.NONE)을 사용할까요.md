
의문은 AI가 갑작스레 짜준 코드 @Getter(AccessLevel.NONE) 에서 왔다. 

```java
@OrderColumn(name = "answer_order")
@Getter(AccessLevel.NONE)
private List<UserPreferenceAnswer> answers = new ArrayList<>();
```
AccessLevel이 protected 였던것은 보아도 NONE은 무슨 의미가 있는지 알아보기 위해서 찾아봤다.
결론 부터 말하면, AccessLevel이 NONE이면 lombok의 getter 자동 생성에서 막아진다는 것이었다.

@Setter 주입은 지양하는 것을 알고 있고,, (캡슐화의 의미가 깨질 수 있기 때문)
왜 @Getter 주입도 막는 것인가?
원인은 간단 했다. @Getter로 가져오고 , clear()나, add()의 메소드로 값을 바꿀 수 있기 때문,

그렇다면 거의 모든 Entity에 @Getter(AccessLevel.NONE)을 붙히는게 이득이 아닌가.. 싶지만, 
String, Long, Bigdecimal 등의 일반 값에는 일반 getter 사용을 하되, 변경이 가능한 컬렉션인 List, set 같은 경우는 직접 노출하지 않고 복사본을 반환하는 목표로 AccessLevel.NONE을 사용, User, Item 같은 연관 엔티티는 필요에 따라서 getter를 막는다.
