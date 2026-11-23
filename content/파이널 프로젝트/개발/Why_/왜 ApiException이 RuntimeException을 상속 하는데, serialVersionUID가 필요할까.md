이유는 RuntimeException이 [[serializable]]를 구현하기 때문이다, 
serialVersionUID가 하는 역할은, [[serializeable]]을 구현한 클래스를 직렬화 했을 때, 그 객체를 바이트로 저장할 때의 버전 서명을 같이 하는 것이다.
```java
public class ApiResponse extends RuntimeException{
    private static final Long serialVersionUID = 1L;
}
```

나중이 이 바이트를 역직렬화 할 때, [[JVM]]이 지금 클래스 PATH안에 있는 UID 와 저장되어 있는 바이트 안의 UID가 같은지 비교하고, 다르면 InvalidClassException을 던지면서 즉시 실패한다.

그럼 serialVersionUID를 붙이지 않는다면? 
명시적으로 serialVersionUID를 붙이지 않는다면, [[JVM]]이 자동으로 HASH 값을 계산해서 쓴다.
	문제는 이게 Compiler, [[JVM]] 마다, 값이 달라질 수 있다는 것.
예시로 서버 A에서 직렬화 해서 저장했는데, 서버 B에서 역직렬화 하면 InvalidClassException이 발생 할 수 있다는 것이다.


이게 왜 중요하지?
	원격 API 호출을 할 때나, 메시지 큐, 서로 다른 JVM 프로세스 간에 직렬화 되어 전달되는 경우 꽤 흔하게 나타나는 문제..
