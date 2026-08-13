| 우선순위 | 위치                                 | 개선 포인트                                                            | Redis 필요               |
| ---- | ---------------------------------- | ----------------------------------------------------------------- | ---------------------- |
| 1    | `SocketIOConfig`                   | `tcpNoDelay(false)`를 `true`로 전환 검토, 접속 대기열 `acceptBackLog(10)` 확대 | 아니오                    |
| 2    | `ConnectionLoginHandler`           | 중복 로그인 처리에서 매번 `new Thread` 생성하는 부분을 공용 스케줄러로 교체                  | 아니오                    |
| 3    | `MessageReadStatusService`         | 메시지마다 `findById` + `save` 반복하는 구조를 MongoDB bulk update로 변경        | 아니오                    |
| 4    | `RoomJoinHandler`, `MessageLoader` | 방 참가/초기 메시지 로딩 시 사용자·파일을 건별 조회하는 N+1을 묶음 조회로 변경                   | 아니오                    |
| 5    | `ChatMessageHandler`               | 메시지마다 Mongo 세션 검증·Rate Limit 읽기/쓰기가 발생                            | 예, Redis 적용 대상         |
| 6    | `SocketIOConfig`의 메모리 Store        | 백엔드 A와 C가 서로 다른 메모리를 쓰는 문제                                        | 예, Redis Pub/Sub 적용 대상 |