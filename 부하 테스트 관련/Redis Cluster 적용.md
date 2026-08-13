
Redis를 단일 인스턴스에서 3개 Master + 3개 Replica 구조로 확장했습니다.

```
Master 1 ─ Replica 3
Master 2 ─ Replica 1
Master 3 ─ Replica 2
```

- 총 6개 Redis 노드
- 16,384 hash slot 분산
- `6379`: Redis 클라이언트 연결
- `16379`: Redis Cluster Bus
- `6380`, `16380`: 호스트 포트 매핑

검증 결과:

```
[OK] All nodes agree about slots configuration.
[OK] All 16384 slots covered.
```

애플리케이션에서는 다음 설정을 사용했습니다.

```
REDIS_CLUSTER_NODES=10.0.101.192:6379,10.0.102.192:6379,10.0.101.118:6379
REDIS_CLUSTER_MAX_REDIRECTS=8
SOCKETIO_REDIS_ENABLED=true
SESSION_REDIS_ENABLED=true
```