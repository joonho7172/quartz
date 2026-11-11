# 8일차(Lambda, Optional, throw, throws, try with resources, GC)

**8일차 5/22 금요일**

7일차 복습

ReentrantLock

재진입 가능한 락

어떤 스레드가 메소드A를 호출해서 락을 획득하고 메소드 A내부 로직에서 메소드 B를 호출해야하고 메소드 B도 같은 락을 필요로 하면, 즉, 재진입을 허용하지 않으면 락이 또 필요한 상태

락을 획득한 스레드가 누군지, 그리고 몇번이나 획득했는지 기억하는 count를 갖고 있다.

반대로 unlock()호출하면 count 가 감소.. 0이 될 때 해제가 됨

예시 1. tryLock()

예시 2. lockinterruptibly() 인터럽트 감지 하는 락.

Reflection

Class<?>로 동적로딩함.

그 후 객체를 생성하려면 Constructor<?>로 실행하기도 함

메소드 조회하고 싶으면 invoke

setAccessible은 private무시하고 접근. 결국 프레임 워크 단계에서 사용하고, 테스트 코드 작성 할 때 사용하기도 함

성능이 느립니다~

**Lambda**

정의 : 코드 블록을 값처럼 다룰 수 있도록 해주는 익명 함수 표현 방식

익명 함수

- > 말 그대로 이름이 없는 함수, 보통 메소드 만들때 이름을 붙혀주지만. 람다는 이름이 필요가 없다. -> 한번 쓰고 버릴 것이기 때문.

Runnable lambdaTask = () -> System.out.println(“작업 실행”)

Why?? 코드의 가독성과 유지보수를 높이고, 데이터 처리 흐름을 직관적으로 표현 할 수 있도록 하기 위해서.

굳이 필요로 하는 인터페이스나 메소드 이름을 적을 필요가 없다.

실행 방법은 매개변수 -> 실행문 형태로 작성됨

축약 규칙도 제공함.

주의할 점.

1. 반드시 함수형 인터페이스를 구현할 때만 사용 가능 함.
2. 람다 내부에서는 외부 지역 변수의 값을 변경 불가능함.
3. 수정하려고 하면 컴파일 오류가 발생한다.
4. 람다 안에서 쓰는 변수는 final로 간주하기 때문

**Optional**

NullPointerException을 해결하기 위해서 나온거임.

정의 : 프로그램, 함수, 시스템 등에서 사용자가 선택하거나 설정할 수 있는 다양한 선택지나 설정 값

값이 없을 때, undefined나 null 사용하는 상황이 있음 -> 자바는 메소드가 값을 반환 할 때 그 값이 없을 수도 있다면 무조건 null을 반환했음 -> 호출 하는 쪽에서 not null을 조건에 추가하는 등 검사를 했어야 함 -> 이걸 해결하기 위한게 optional (값이 없을 수도 있다고 개발자에게 명시해주는 것)

Null 이 될 수 있는 값을 명시적으로 감싸는 래퍼 클래스이다.

- > Optional은 상자 같은 개념으로 진짜 객체가 있을 수도, 없을 수도 있다.
- > 중요한건 이걸 호출한 개발자가 그것을 인지하고
- > 상자를 열어보기 전까지는 내용물을 쓸 수 없도록 문법적으로 막아 둔 것임

사용방법

| **Optional** | Optional.ofNullable(값) 형태로 생성하고, orElse(), map(), ifPresent() 등을 통해 값의 유무에 따라 안전하게 처리 |
| --- | --- |

Optional<타입> 변수명 = Optional.of(값); ->null이 아님을 보장

Optional<타입> 변수명 = Optional.ofNullable(값); ->널일수도?

Optional<타입> 변수명 = Optional.empty(값); ->null값임을 보장

Optional<String> plateNumber = Optional.ofNullable(car.getPlateNumber());

plateNumber.isPresent();                          // 차량 번호가 있으면 true, 없으면 false

plateNumber.get();                                // 차량 번호가 없으면 예외 발생 (주의)

plateNumber.orElse("미등록 차량");                 // 없으면 "미등록 차량" 반환

plateNumber.orElseGet(() -> "임시번호-0000");       // Supplier로 기본값 동적 생성

- *plateNumber.orElseThrow(() -> new IllegalArgumentException("차량 번호가 없습니다"));

Why?? — 메소드가 반환할 값을 없음을 명시적으로 표현하기 위해서 사용. 호출하는 쪽에서 NPE 방지하고, 안전한 예외처리나 기본값 처리 강제하기 위해서 써야함.

결론

- Optional 은 null 이 될 수 있는 값을 안전하게 감싸는 래퍼클래스
- NPE를 구조적으로 예방하고 코드의 가독성을 높여준다
- 값 꺼낼 때는 get()대신 orElse, orElseThrow 쓴다.

**Throw, Throws**

throw는 의도적으로 예외 객체를 생성하고 발생시킴.

Throws 는 메서드를 발생 시킬 수 있는 예외를 선언. 호출한 쪽에서 처리하도록 명시

Throw -> 능동적임 -> 개발자가 정상적인 상황이 아니라고 판단 될 때, throw new Exception처럼 던져버리는것.

Throws -> 메소드 선언부에 붙어서 실행하다보면 특정 예외가 발생할 수 있으니 나를 호출하는 쪽에서 알아서 처리하라고 경고하고 위임하는 키워드 -> 경고 표지판, 책임 전가

WHY?? - 예외가 발생한 위치에서 처리 할 수 있지만 전체 프로그램 흐름을 제어하는 상위 로직에서 일관되게 처리하기 위해서, 책임 분리

Unchecked와 checked의 차이

Unchecked는 개발자의 실수, NPE나 ArrayIndexOut,, 예외.

- > 이런것들은 try catch나 throws를 안해도 됨 -> 체크를 안해도 된다고 해서 언체크드 익셉션

반대로 Runtime Excep.. Checked는 는 예외처리를 무조건 해야됨

IO 나 Sql, file 등… 이 예외들은 처리를 안하면 컴파일러가 처리를 강제함.

**Try - with - resources**

정의 : 반드시 닫아야 하는 자원을 자동으로 정리해주는 예외처리 구문

여기서의 resources란 jvm내부 메모리 만으로 처리 할 수 없어서 os 권한 빌려서 가져와야하는 대상

- > 파일, 하드디스크에 있는 파일 읽으려면 os에게 요청해야한다.
- > 네트워크 소켓, 외부 서버와 통신하기 위해 port 열어달라고 요청
- > DB커넥션. DB랑 연결 통로 만드는 것.

반드시 close()라는 메소드를 호출해 닫아줘야하는 상황이 있음.

- > 그러나 try with resources는 직접 호출하지않아도 try블록이 끝나는 순간 알아서 자원을 반납해주는 도구

사용방법 : 그냥 try() 구문 안에서 객체 선언하기만 하면됨

AutoCloseable 구현한 클래스 여야함!

try (FileReader fr = new FileReader("test.txt")) { // 읽기 로직 }

FileReader fr = new FileReader("test.txt"); try { // 파일 읽기... } 의 차이이기 때문

결론 :

- 파일, 네트워크 db커넥션 같은 운영체제 자원은 반드시 해제해야하고 그렇지 않으면 누수 발생

**Garbage Collention 복습**

GC는 하나가 아니라 버전별로 여러개가 있다.

- > 실제로 개발할 때 95% 이상은 G1GC라는 것을 쓴다. 특별히 코드하는 건 없음.

그러나 GC튜닝하거나 설정값 다룰 때는 차이가 있다.

GC는 더 이상 사용하지 않는 메모리를 제거하는 jvm의 관리 기능

힙에는 에덴영역..(영 제러네리션 영역임) 그리고 올드 제너레이션 영역이 있다.

Survival 0과 survival1 영역을 왔다갔다 하면서 오래동안 살아남다 보면은 old 제너레이션으로 이동함

Old generation은 오래 살아남다 보니까 메모리 공간도 young generation보다 넓게 할당됨

Major gc는 stop the world (jvm이 일시적으로 중단 시키는것임, 정밀하게 gc하기 위함)가 발생할 수 있다…

GC root에서 힙에 가서 객체들에 도달을 하고 도달하지 못한 객체들은 싹 다 지움.

그리고 나서 메모리 단편화를 위해서 살아남은 객체들을 왼쪽으로 싹 밀어줌 (불규칙한 공간 제거) 이러한 과정에서 young generation 과 old generation간의 승격이 왔다갔다 함

gc는 정해진 주기로 발생하지 않음.  강제로 실행은 안됨

**Parallel GC**

지금은 안씀 java8 까지는 기본으로 사용되었던 gc

처리량 극대화에 초점이 맞춰져 있었음.

**G1GC**

자바 9부터의 기본 GC

힙영역을 바둑판 처럼 나누는 것. Old, eden, unuse 영역 등..

동적으로 상황에 따라서 지역이 eden 이 되기도 하고 suvivor가 되기도 함

원리 : 전체 힙을 뒤지는것 보다 garbage가 가장 많은 구역을 찾아서 순차적으로 청소함.

장점 : STW(stop the world)의 정지시간을 예측가능하도록 제어 가능.

-> JVM옵션으로 최대 정지 목표시간을 지정할 수 있다.

-> 그 시간을 지키기 위해서 스스로 동작을 조절할 수 있음..

나중에라도 G1GC 어떻게 돌아가는지 나중에라도 한번 알아 볼 것

수업에서 가져가야 할 핵심

- 예외를 직접 발생시키는 것이 throw, 예외 처리를 “호출자”에게 위임하는 throws의 명확한 역할 구분
- Checked exception과 unchecked Exception
-