1 순위로는 rate limit 
### 1순위: Rate Limit

현재 [RateLimitService.java](/Users/kim/Desktop/ktb-BootcampChat_/apps/backend/src/main/java/com/ktb/chatapp/service/RateLimitService.java)는 요청마다:

```
Mongo 조회
→ count 증가
→ Mongo 저장
```

을 수행합니다.

Redis에서는 다음처럼 처리하는 것이 좋습니다.

```
INCR rate-limit:{clientId}
EXPIRE rate-limit:{clientId} 60
```

장점:

- MongoDB 조회·저장 제거
- 원자적 카운터 처리
- 여러 백엔드 EC2에서 동일한 제한 공유
- 부하 테스트 시 DB 부하 감소


### 2순위: 세션

현재 [SessionService.java](/Users/kim/Documents/New project/apps/backend/src/main/java/com/ktb/chatapp/service/SessionService.java)는 세션 검증 때 Mongo를 조회하고 `lastActivity`를 다시 저장합니다.

세션은 Redis에 TTL과 함께 저장하기 적합합니다.

```
session:{userId}
TTL: 30분
```

장점:

- 로그인 검증 지연 감소
- `lastActivity` 갱신 시 Mongo 전체 문서 저장 방지
- 여러 백엔드 인스턴스에서 세션 공유

단, 현재 세션 정책이 “사용자당 하나의 세션”이므로 그 정책은 그대로 유지해야 합니다.



일단은 한거 
- [RedisCacheConfig.java (line 21)](/Users/kim/Desktop/ktb-BootcampChat_/apps/backend/src/main/java/com/ktb/chatapp/config/RedisCacheConfig.java:21)  
    Spring Cache용 RedisCacheManager, TTL 기본 10초
- [RoomService.java (line 40)](/Users/kim/Desktop/ktb-BootcampChat_/apps/backend/src/main/java/com/ktb/chatapp/service/RoomService.java:40)  
    `getAllRooms(name)` 결과를 사용자별로 캐시
- [RoomService.java (line 128)](/Users/kim/Desktop/ktb-BootcampChat_/apps/backend/src/main/java/com/ktb/chatapp/service/RoomService.java:128)  
    방 생성·참여 시 방 목록 캐시 전체 삭제
- [SocketIOConfig.java (line 101)](/Users/kim/Desktop/ktb-BootcampChat_/apps/backend/src/main/java/com/ktb/chatapp/config/SocketIOConfig.java:101)  
    기존 Redisson 기반 Socket.IO 세션 저장·Pub/Sub

부하테스트 결과 분석입니다. (Artillery + Playwright 브라우저 엔진 기반, 25개 pod에서 분산 실행, run id `st-45d875f8`)

**전체 요약**

| 항목 | 값 |
|---|---|
| 생성된 VU | 100 |
| 완료 | 87 |
| 실패 | 13 (13%) |
| 총 HTTP 요청 | 38,441 |
| 200 / 201 | 38,210 / 192 |
| 401 | 104 |
| 403 | 1 |
| 404 | 19 |

**실패 원인 (vusers.failed=13과 정확히 일치)**

| 에러 | 건수 |
|---|---|
| pw_failed_assertion.toBeVisible | 7 |
| [chatRoomCreationScenario] page.waitForURL 타임아웃(30s) | 4 |
| [forbiddenWordScenario] locator.click 타임아웃(30s) | 2 |

채팅방 생성 시나리오와 금칙어 필터링 시나리오에서 UI 요소가 예상 시간 내 나타나지 않아 실패한 경우입니다. 부하가 걸린 상태에서 특정 인터랙션(방 생성 후 리다이렉트, 버튼 클릭 대상)이 늦어졌다는 뜻입니다.

**페이지별 Core Web Vitals (25개 pod 최신 run 기준)**

| 페이지 | LCP 평균 | LCP p99 | TTFB 평균 |
|---|---|---|---|
| `/chat/<roomId>` | 985ms | **4065ms** | 25ms |
| `/chat` | 373ms | 907ms | 14ms |
| `/` | 131ms | 376ms | 13ms |
| `/chat/new` | 224ms | 302ms | 14ms |
| `/profile` | 79ms | 194ms | 13ms |
| `/register` | 100ms | 116ms | 11ms |

TTFB는 전체적으로 매우 낮아(대부분 10~25ms) 서버/CDN 응답 자체는 빠릅니다. 반면 **채팅방 상세 페이지(`/chat/<roomId>`)만 LCP p99가 4초를 넘습니다** — Core Web Vitals 기준 "Poor"(4초 이상) 구간입니다. 이 페이지에서만 메시지 목록 렌더링이나 WebSocket 연결 대기 등으로 최대 콘텐츠 렌더링이 지연되는 것으로 보입니다.

CLS는 대부분 0이지만 일부 케이스에서 p99가 1.7까지 튀는 이상치가 있어(양호 기준 0.1 미만), 특정 상황에서 레이아웃이 크게 흔들리는 페이지가 있다는 신호입니다. INP는 평균 32ms로 전반적으로 양호합니다.

**주목할 점**

- **401이 104건**으로 적지 않습니다. 인증 흐름(로그인 세션, 토큰 만료) 관련 로직이 부하 상황에서 정상 동작하는지 확인이 필요합니다. 단순 미인증 접근 테스트 시나리오라면 정상일 수 있지만, 의도치 않은 세션 끊김이라면 문제입니다.
- **HTTP 엔진 시나리오 지표(엔드포인트별 응답시간)는 기록되지 않았습니다** — 이 테스트가 브라우저(Playwright) 엔진으로만 실행되어서 API 엔드포인트 단위 분석은 이 리포트만으로는 불가능합니다. 백엔드 API 응답시간까지 보려면 HTTP 엔진 시나리오를 추가하거나 서버 쪽 APM/Prometheus 지표와 교차 분석이 필요합니다.

정리하면, 전체 성공률(87%)과 대부분 페이지 성능은 양호하지만 **채팅방 상세 페이지의 LCP 스파이크와 chatRoomCreationScenario 타임아웃**이 이번 테스트의 핵심 병목입니다. 100 VU 규모에서는 크리티컬하지 않지만, VU 수를 늘려가는 다음 단계 테스트에서 이 두 지점이 먼저 무너질 가능성이 높습니다.