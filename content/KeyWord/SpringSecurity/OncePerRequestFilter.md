한 요청에 대해서 한번만 실행하는 필터 추상 클래스, forwarding 이나 include, error dispatch 가 발생하게 되면, 필터체인이 동작하게 되는데 인증에 대해서 여러번 처리를 하는 것이 불필요하므로 한 번만 처리할 수 있도록 한다.'

예를 들어 logging filter나,authentication filter가 두 번 실행 되면, 인증 체크 로직이 2번 찍히거나, 인증 컨텍스트를 두 번 설정 해버리는 문제가 생길 수 있음.

[[doFilter]] 를 직접 override하는 대신에, doFilterIntenal()을 구현하면 된다.