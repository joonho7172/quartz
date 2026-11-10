Mq와 kafka의 큰 차이점 중 하나는
MQ는 pushing 방식, kafka 는 pulling 방식.

Consumer 가 소화하지 못할 정도로 pushing 하지 않고,
Consumer 가 소화 할 만큼만 Poll() 해서 가져가기 때문에, 과부하로 죽는 일은 거의 없음.

대신 partition에 이벤트들이 쌓이면서 lag(처리 못한 메시지 수)로 쌓임 -> 이전에 말한 batch 처리나, parellel consumer ... confluent 등등으로 해결이 가능하다.. 


### 1. producer 에서 broker 나 network 이 따라오지 못할 때.
producer는 send() 시에, 내부 버퍼에 모았다가 batch 처리를 하는데... broker가 지연이 되면 이 버퍼가 차고, 여기에서 backpressure가 발생.

	buffer가 가득 차면, send가 블로킹 되기 떄문에 어플리케이션이 느려지게 된다.

##### 해결
1. `max.block.ms` 의 시간을 짧게 한다. -> buffer가 가득 찼을 때 send 가 블로킹 되는 시간.
2. 짧게 했을 때를 고려해서, 예외 폴백이나, 거절, 재처리 큐 등의 상황 고려,


### 2. consumer 쪽에서 처리 속도가 유입을 따라가지 못할 때
가장 문제가 발생하는 곳이기도 함. 

##### 해결
1. `max.poll.records` (기본 500) 한 번에 가져오는 record 수를 조절하여 해결. (너무 오래 걸리면 줄이는게 답이 될 수도 있음)
2. `fetch.min.bytes` , `fetch.max.wait.ms` 브로커가 응답을 모았다가 주는 정도.
3. `fetch.max.bytes`, `max.partition.fetch.bytes` - 한 번에 받는 데이터의 상한. 메모리 사용량이 많아지면 이 값을 줄이기도 한다.

4. 또는 pause() 와 resume()으로 해당 파티션의 레코드 조절

##### 문제
poll() 호출 간격이 max.poll.inteval.ms (기본 5분)을 넘으면, consumer 가 죽은 것으로 간주 되어, rebalance가 발생.

처리 지연 -> 리밸런스 -> 처리 중단 -> 더 많은 lag 발생 -> 재시작 후 더 많은 처리 -> 처리 지연....
max.poll.records를 줄여서 배치 처리 기간을 단축시켜 max.poll.interval.ms 이하로 맞춘다..



producer 의 send()가 느려지거나 timeout 문제
	buffer.memory, max.block.ms 점검, 배치, 데이터 크기 압축 등등..

consumer 가 유입량을 따라가지 못하는 문제
	파티션 증설, 처리 로직 최적화, max.poll.records 조절

내부 worker로 넘기는 구조 문제
	제한된 큐 / pause(), resume()

잦은 rebalance 문제
	max.poll.interval.ms, 처리 시간 점검

잦은 재시도, 잦은 실패 문제
	DLT(DLQ), 재시도 토픽 분리

lag 누적 문제
	describe 통해서 보거나, consumer metric, records-lag, exporter, Kafka ui 등등..




