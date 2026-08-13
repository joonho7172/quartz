## Socket.IO 처리 개선

### Redis 기반 Socket.IO Store 적용

Socket.IO의 세션과 publish/subscribe를 Redis로 공유하도록 변경했습니다.

```
Socket EC2 A
Socket EC2 B
Socket EC2 C
        ↓
공유 Redis
```

사용 기술:

- `RedissonStoreFactory`
- Redis 기반 distributed session store
- Redis 기반 distributed pub/sub

효과:

- 서로 다른 Socket.IO EC2 간 이벤트 공유
- 사용자가 다른 인스턴스로 연결되어도 메시지 전달 가능
- 다중 인스턴스 환경에서 Socket.IO 세션 공유