### 방 목록 캐시

방 목록처럼 읽기 비중이 높은 API에 Redis 캐시를 적용했습니다.

```
ROOMS_CACHE_TTL_SECONDS=30
```

효과:

- 반복적인 방 목록 MongoDB 조회 감소
- 다중 사용자가 동시에 방 목록을 요청할 때 DB 부하 감소
- 짧은 TTL로 최신 데이터와 성능 사이의 균형 유지

발생했던 문제:

```
GenericJacksonJsonRedisSerializer SerializationException
```

원인:

- 기존 Redis에 저장된 캐시 데이터와 변경된 객체 구조가 충돌
- 서로 다른 인스턴스에서 캐시 직렬화 형식이 달랐을 가능성

대응:

- 캐시 직렬화 설정 통일
- 캐시 오류 시 애플리케이션이 MongoDB로 fallback하도록 구성
- 캐시 키와 데이터 구조 변경 시 기존 키 정리 필요

### Socket.IO 사용자 캐시

Socket 인증 및 방 입장 과정에서 반복되는 사용자 조회를 줄이기 위해 사용자 정보를 Redis에 캐시했습니다.

효과:

- Socket.IO 연결마다 MongoDB 사용자 조회하는 비용 감소
- 방 입장 시 사용자 정보 조회 부하 감소
- 다중 Socket 인스턴스에서 동일한 사용자 정보 공유