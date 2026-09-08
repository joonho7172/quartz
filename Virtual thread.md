JDK 21부터 공식적으로 지원하는 경량 [[Thread]] 이다.
JDK21 이전에도 virtual thread가 없었던 것은 아니나, 그 전에는 네이티브 메소드로 동작하던 park와 unpark 로직에 JDK21 이후에서부터는 virtual thread 분기를 추가해, 기존 [[Thread]]  방식에서 특별한 코드 수정 없이 컨텍스트 스위칭을 가능하게 하였다.

생성 과정 
요청량이 급격하게 증가하는 서버에서 더 많은 [[Thread]] 를 요구하게 되었고, 메모리가 한정 적일 때, 스레드 수도 한정적, 스레드가 많아지면서 컨텍스트 스위칭 비용도 기하급수적으로 늘었다.

이를 해결하기 위해서 나타난 [[Thread]] 모델이 [[Virtual thread]] 이다.

![[Pasted image 20260908151231.png]]기존에는 [[kernel]] level에 있는 [[Thread]] 를 user level의 [[Thread]] 로 1대1 매핑 시키는데, virtual thread는 [[Thread]] 위에서 여러개의 virtual thread가 번갈아 가면서 실행된다.

가장 큰 특징은 virtual thread는 컨텍스트 스위칭 비용이 thread에 비해 매우 저렴하다는 점.
