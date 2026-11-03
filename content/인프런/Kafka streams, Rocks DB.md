Kafka topic의 데이터를 실시간으로 처리하고 ,변환해 어플리케이션으로 만들 수 있게 한다.
별도의 처리 클러스터 (Spark, Flink) 없이 일반 java, scala 어플리케이션 내부에서 (JVM 기반의) 라이브러리로 사용 할 수 있다.

일반 Producer, Consumer 는 직접 상태관리를 하고, 장애를 복구하고 윈도우 처리를 구현해야 하는데..
Kafka Streams는 이를 추상화해서 제공함. 

장점 :  
1. kafka 와 완벽하게 호환이 된다.
	대부분은 로그로 남겨서 logstash 로 보냈을 텐데. 이러한 것들은 버전들의 릴리즈에 대한 호환이 조금 느리다 . 그러나 streams는 다름.
	
2. exactly once를 보장한다.
	1. 거의 유일하게 보장하는 event processing 도구...

3. 별다른 scheduling 이 필요없다.
	1. 기존에 사용하던 spark streams 같은 경우는 마이크로 배치 처리를 하는 이벤트 데이터 어플리케이션을 만들 수 있음.  <- 이런 클러스터 구조들은 yarn 이나 mesos와 같은 관리자, 매니저의 개념이 필요함

4. streams dsl과, 프로세서 api를 제공..
	1. 대부분은 streams dsl을 사용하는데 <- 이벤트 기반 데이터 처리할 때 필요한 map, join, window와 같은 메서드를 사용하기 때문에 사용하기 편리함. (없는게 있으면 processer api..)


streams dsl는 kafka를 스트림 데이터 처리 뿐만 아니라 대규모 key-value 저장소로도 쓸 수 있다.

5. 자체적으로 로컬 상태 저장소를 사용함.
	1. 실시간 데이터 처리에는 1. 상태기반처리, 2. 비상태기반처리가 있음. 
	2. 비상태기반처리는 필터개념이나 데이터를 변환하는 처리
		1. 이거는 데이터가 들어오는 족족 produce하면 되기 때문에 유실이 발생할 가능성이 적다.

	3. 근데 상태기반 처리는.. 이전에 받았던 데이터를 메모리에 저장하면서 다음 데이터가 들어오면 그걸 기반으로 처리해야 하기 때문에 구현이 조금 빡셈

		-> 이걸 돕는게 streams, 로컬에 rocksDB를 설치해서 변경을 도와줌.
		그리고 이 상태에 대한 변환 정보를 kafka의 변경 로그 토픽에 저장함.
		즉, 프로세스에 장애가 발생해도 토픽에 넣어지기 때문에 자연스럽게 장애가 복구가 가능함.


```java
KStream<String, String> paymentStream = builder.stream("payment");
KStream<String, String> filteredStream = paymentStream
							.filter((key, value) -> key.equals("unknown"));
filteredStream.to("unknown-payment");
```

`메시지 키가 unknown인 데이터를 필터링 해서 unknown-payment 토픽으로 보내는 streams 코드`

기존에는 컨슈머로 polling 하거나 프로듀서를 어렵게 구현 할 필요가 없다. 