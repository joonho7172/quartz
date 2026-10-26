캐싱 전략에서 write - behind 라는 전략이 있다..

무수히 많은 트래픽들이 들어올 때, DB에 그대로 보내버리면 DB가 서버가 지연되고, DB의 일시적 장애는 수많은 연쇄 장애를 낳을 것이 뻔하기 때문에
쓰기 요청이 오면, Redis 캐시에 먼저 쓰고, 바로 성공 응답을 내려 둔 뒤, DB 적재는 비동기 kafka consumer로 적재한다는 뜻..

client -> redis (write) -> 즉시 응답 -> kafka consumer Or redis stream -> DB 적재

1. write through - redis 쓰기 와 Db 적재를 동시에 하고, DB 적재가 끝나면 성공 응답 반응
	1. DB 속도에 강하게 묶인다는 점이 있다.
2. write behind - reids에서만 쓰고, 응답하면서 DB는 뒤따라 오는 전략. 응답이 빠르고 같은 key 에 대한 batch 처리 하면, DB에 한번에 적용이 가능하다.


그럼 여기서 생길 수 있는 문제점.. 원래는 Db가 진실된 source이고 redis가 복제본이라,
redis가 날아가도 DB에서 다시 값을 덮어씌우면 되는데, 이러한 현상이 역전 된다..

wirte-behind에서는 redis를 1차 SSOT로 두고, DB를 최종 적재 장소로 두는 것. 

주의 사항 :
1. 유실 위험 : 결국 휘발성 메모리인 Redis 가 1차 ssot이므로 db에 적재가 안될 수 있음.. Aof나 복제, redis stream 을 두어서 고가용성 확보
2. 캐시 miss의 의미 변화 : 기존의 cache miss는 DB에서 값을 꺼내오면 되지만 여기서는 redis 가 DB보다 앞선 버전이기 떄문에 miss는 곧 유실을 의미한다. hit rate를 보고 eviction으로 key가 밀려나지 않도록 할 것.
3. 삭제 주의 : DB에 적재되지 않은 키를 지우면 영구 소실 되므로, 큰 키를 지울 때는 블로킹을 피하려고 UNLINK를 쓰되, 적재 완료 확인 여부를 꼭 해야 한다.
4. 클러스터 장애 : Redis 가 곧 원본이라, fail over 때, 클라이언트가 새 master 를 찾지 못하면 쓰기 실패가 된다.



### Redis
1. Universal Data - 공유 사용자에게 보여지는 값
2. User-Speciic Data - 특정 사용자에게 보여지는 값

Universal 은 트래픽이 몰릴 수록 get 커맨드가 매우 많이 발생함. -> 이중 캐싱 전략..
local cache를 통해, universal Data를 서버 내에서 전부 캐싱하는 방법으로 redis 사용량 줄이기
- redis의 pub/sub으로 빠르게 universal Data의 local cache 초기화 하기

포인트 지급에서도.. RedLock 걸어서 API 요청에 대한 distributed Lock 을 통해서 동시성 제어, 
중복 지급 내역에 대해서도, Redis에 하나의 키에 적립 내역을 append 하고, 데이터베이스에 적립 내역 저장, 
바로 저장하지 못하는 이유는.. 순간적으로 트래픽이 몰리면 insertQPL이 넘어 dB 부하로 이어지기 때문

그래서 kafka로 조절 함. consumer에서 throttling 을 걸어서 최대 QPS에 도달하지 않도록 한다.

선착순 쿠폰 같은 경우도,,.increment 를 통해서 특정 cap에 도달하였는지를 판단함.

![[Pasted image 20261026234126.png]]

redis 의 명령어는 single thread 이기 때문에 increment에서는 thread-safe하다.

근데 너무 많은 요청이 생기면 thread가 밀려 cpu 부하 상승 -> 이부분은 local cache로 counting 한 후, 특정 시점에 schedulJOB을 통해서 redis에 flush 한다. (이 부분은 hard한 capping이 아니긴 함.. )

![[Pasted image 20261026234139.png]]