

IllegalArgumentException
사용자가 값을 잘못 입력하는 경우에 발생하는 예외
사용자의 잘못으로 발생하는 예외


IllegalStateException
사용자가 값을 제대로 입력 했으나, 소스코드가 값을 처리할 준비가 안된 경우에 발생 하는 예외

(이미 작업의 단위가 끝났는데, 사용자가 값을 입력한다던지)


IllegalAccessException
해당 클래스를 호출하는데 에러가 발생..
-보통 public 붙히면 해결 가능.
- 런타임 오류이기 때문에, 따로 try catch 나 throws를 선언하지 않아도 됨.