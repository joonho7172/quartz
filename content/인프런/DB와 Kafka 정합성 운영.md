
# DB작업과 kafka 토픽 발행의 원자성?

```java
@Transactional
public void createGroup(...){
	groupRepository.save(group); //
	kafkaTemplate.send("group-create", message);

}
```

이렇게 DB commit과 kafka event pub이 맞물리지 않을 때 (네트워크 이슈 등등..)

DB commit O | Kafka event publish X
DB commit O | Kafka event publish O | DB rollback O

각자 다른 PC이기 때문에 현실적으로 같은 트랜잭션으로 묶기가 어렵다.

# Outbox

@Transactional
1. groupTable 에 Insert
2. OutboxTable 에도 Insert

[Relay, publisher] 가 outbox를 조회 -> kafka event publish -> 완료 표시

DB 트랜잭션 하나로, Commit 상태 변경과 이벤트 기록이 원자적으로 처리.

```SQL
CREATE TABLE outbox (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    aggregate_type VARCHAR(100) NOT NULL,   -- 예: "Order"
    aggregate_id   VARCHAR(100) NOT NULL,   -- 예: 주문 ID (Kafka key로 사용)
    event_type     VARCHAR(100) NOT NULL,   -- 예: "OrderCreated"
    payload        JSON NOT NULL,
    status         VARCHAR(20) NOT NULL DEFAULT 'PENDING',  -- PENDING / SENT
    created_at     DATETIME NOT NULL,
    sent_at        DATETIME NULL,
    INDEX idx_status_id (status, id)
);
```

(outbox 테이블 예시)


```java
@Transactional public Long createGroup(...) { 
	Group group = groupRepository.save();
	outboxRepository.save(OutboxEvent.builder()
		.aggregateType("Group")
		.aggregateId(group.getId().toString())
		.eventType("GroupCreated")
		.payload(objectMapper.writeValueAsString(new OrderCreatedEvent(group)))
		.status(OutboxStatus.PENDING)
		.build());
		return group.getId(); }
```

이렇게 하면 outbox와 그룹 저장이 하나의 트랜잭션


# Relay는 어떤 식으로?

### 1. Polling publisher 

```java
@Scheduled(fixedDelay = DELAYmSECONDS)
@Transactional
public void publish(){
	List<OutboxEvent> events = outboxRepository.find(OutboxStatus.PENDING);
	
	for(OutboxEvent e : events){
		try{..
		} catch(){..
		}
	}
}
```

장점 : 구현이 단순하다. 스케줄러 이기 때문에, 언제 시작하고 언제 끝났는지 알 수 있다. 
처리에 소요된 시간을 알 수 있다.

단점 : 여러 인스턴스가 동시에 publish 를 돌면 같은 레코드가 중복 발행 될 수 있다
(행 단위 락, ShedLock, 파티셔닝)이 필요함..


### 2. CDC (Change Data Capture) (Debezium)

DB의 binlog / WAL 을 읽어서 outbox의 insert 감지 -> kafka로 자동 발행

장점 : 어플리케이션에 relay 코드가 없고, polling 부하가 없으며, 지연이 낮음.

단점 : kafka connect와 Debezium 인프라 운영.



### 주의사항
Outbox 는 at-least-once 전달을 보장하기ㄷ 때문에, 중복처리를 보장해야함.
(relay 가 kafka로 전달하고 sent를 보내기 전에 lag이 걸리거나..)

consumer는 idempotency 를 갖춰야 함. 

SENT 레코드를 주기적으로 삭제 or 아카이빙




# 여기서 보는 CDC의 best practice?

1. Source-to-Target Latency: 원천 데이터베이스에서 Target System으로 Event를 보내는데 걸리는 시간
2. Events Per Second: 초당 처리할 수 있는 데이터의 양
3. CDC Pipeline Scalability: 새로운 CDC 파이프라인을 만드는데 소요되는 시간
4. Data Consistency: CDC Pipeline을 통해 만든 데이터의 정합성


![[Pasted image 20261020001705.png]]

각각의 connector로 이동하는 시간을 측정해서 개선..


시간을 근데 어떻게 측정 할 것인가?
Source connector 에서 Sink connector까지 가는 이벤트 들이 언제 처리되었는지 추적하기가 어려움. (consumer lag이 쌓였을 때)

Debezium에서는 master DB에서 event가 발생한 시각을 `source.ts_ms` 라는 필드로 제공
이것이 event의 생명주기 첫단계. 
event의 생명 주기 마지막인, Sink connector에서 `source.ts_ms`를 비교 -> Sink connector에서 Target System에 write한 시간을 비교해서 metric으로 나타내면 파이프라인의 속도를 알 수 있다..


![[Pasted image 20261020002245.png]]


