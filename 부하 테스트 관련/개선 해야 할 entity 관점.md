### 1. 채팅방 목록 조회의 N+1

[RoomService.java (line 34)](/Users/kim/Desktop/ktb-BootcampChat_/apps/backend/src/main/java/com/ktb/chatapp/service/RoomService.java:34)에서 전체 방을 조회한 뒤, 방마다 다음 조회를 반복합니다.

- creator 사용자 조회 1회
- participant마다 사용자 조회
- 최근 메시지 수 조회 1회

방이 100개이고 참여자가 많으면 수백 번의 MongoDB 조회가 발생합니다.

같은 문제가 [RoomController.java (line 269)](/Users/kim/Desktop/ktb-BootcampChat_/apps/backend/src/main/java/com/ktb/chatapp/controller/RoomController.java:269)에도 중복되어 있습니다.


### 2. 메시지 조회의 반복 조회

[MessageLoader.java (line 57)](/Users/kim/Desktop/ktb-BootcampChat_/apps/backend/src/main/java/com/ktb/chatapp/websocket/socketio/handler/MessageLoader.java:57)에서 메시지를 가져온 뒤:

- 메시지별 읽음 상태 조회 및 저장
- 메시지별 sender 조회
- 파일이 있으면 메시지별 file 조회

30개 메시지를 불러오면 여러 번의 추가 조회와 저장이 발생합니다.

특히 [MessageResponseMapper.java (line 57)](/Users/kim/Desktop/ktb-BootcampChat_/apps/backend/src/main/java/com/ktb/chatapp/websocket/socketio/handler/MessageResponseMapper.java:57)의 파일 조회와 [MessageReadStatusService.java (line 28)](/Users/kim/Desktop/ktb-BootcampChat_/apps/backend/src/main/java/com/ktb/chatapp/service/MessageReadStatusService.java:28)의 메시지별 저장이 부하 테스트에서 가장 큰 병목 후보입니다.


### 3. 무제한 전체 조회

`roomRepository.findAll()`로 모든 방을 한 번에 가져옵니다. 방 개수가 늘어나면 메모리와 응답 시간이 함께 증가합니다.


### 4. Rate Limit의 조회-저장 경쟁

[RateLimitService.java (line 42)](/Users/kim/Desktop/ktb-BootcampChat_/apps/backend/src/main/java/com/ktb/chatapp/service/RateLimitService.java:42)에서 매 요청마다:

```
findByClientId → count 증가 → save
```

를 수행합니다. 동시 요청이 많으면 원자적 증가가 아니어서 성능과 정확성 문제가 생길 수 있습니다.

## 현재 존재하는 인덱스

이미 있는 인덱스:

- `users.email`
- `sessions(userId, sessionId)`
- `sessions.expiresAt` TTL
- `rate_limits.clientId`
- `rate_limits.expiresAt` TTL

다음 인덱스는 우선 검토 대상입니다.

```
messages(room, timestamp)
messages(file)
files(filename)
rooms(createdAt)
```

관련 쿼리는 다음 파일에 있습니다.

- [MessageRepository.java](/Users/kim/Desktop/ktb-BootcampChat_/apps/backend/src/main/java/com/ktb/chatapp/repository/MessageRepository.java)
- [RoomRepository.java](/Users/kim/Desktop/ktb-BootcampChat_/apps/backend/src/main/java/com/ktb/chatapp/repository/RoomRepository.java)