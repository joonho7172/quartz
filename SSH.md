ssh -i ~/.ssh/ktb-8-load-test.pem ubuntu@3.36.55.170


REDIS_CLUSTER_NODES=10.0.101.192:6379,10.0.102.192:6379,10.0.101.118:6379
REDIS_CLUSTER_MAX_REDIRECTS=8
REDIS_PASSWORD=ktb
SESSION_REDIS_ENABLED=true
SOCKETIO_REDIS_ENABLED=true

# ── 필수: 반드시 실제 값으로 교체 ────────────────────────────────
JWT_SECRET=ac0lZrKy8tb2PUCxL9QW5WDuX07+zHxaDm3VpG/onPJSo62GkSwQwWBmmbLls8NX
  

# openssl rand -hex 32

ENCRYPTION_KEY=dfc65bdd819a0b2afcae18c1f50df08fc03bd3a86c4bc5814e21b2a375843c69

  

# openssl rand -hex 16

ENCRYPTION_SALT=996ce24b0991d4173efa5e52838dc5fc

  

# openssl rand -base64 48

JWT_SECRET=MvbFcYeplwmqXvIMYhzlSLhFkJk7PCVT/6QfTr46971y+xnbQt6Mph0ylGySVu/m

  

# ktb-8-db-2a private IP: 10.0.101.78

MONGO_URI=mongodb://10.0.101.78:27017/bootcamp-chat

  

PORT=5001

WS_PORT=5002

  

OPENAI_API_KEY=sk-proj-AlwaXE1XsNRTbORKcoYqEK-1GMPtiBNiDdlGimR3j6XZKNw9aeXpJvbV>

# ── 선택: application.properties에 기본값이 있지만 운영 환경에서는 ──

# ── 명시적으로 지정하는 걸 권장하는 값들 ────────────────────────

  

# 기본값 "*"는 SecurityConfig가 부팅 시 보안 경고를 찍음. 프론트 배포 도메인으[>

CORS_ALLOWED_ORIGINS=https://chat.goorm-ktb-008.goorm.team

  

# 위와 같은 이유로 Socket.IO 쪽도 프론트 도메인으로 제한 권장 (기본값 "*")

SOCKETIO_SERVER_ORIGIN=https://chat.goorm-ktb-008.goorm.team

  

# 운영에서 Swagger UI/OpenAPI 문서를 계속 열어둘지 여부 (기본값 true)

SWAGGER_ENABLED=false

  

# 기본값 when_authorized 유지 권장 — 인증 안 된 상태에서 헬스 상세 노출 방지

MANAGEMENT_HEALTH_SHOW_DETAILS=when_authorized

  

# local | gridfs — 현재 local 구현체만 있음(StoragePort/LocalStorage).

# AI 멘션 기능 튜닝용, 특별한 이유 없으면 기본값 유지 가능

OPENAI_MODEL=gpt-4.1-mini

OPENAI_TEMPERATURE=0.7

#redis 환경 변수 

REDIS_HOST=10.0.101.192

REDIS_PORT=6379

REDIS_PASSWORD=ktb

SOCKETIO_REDIS_ENABLED=true

  

#방 목록 캐시 TTL

ROOMS_CACHE_TTL_SECONDS=30

  

#s3 환경 변수

FILE_STORAGE_TYPE=s3

AWS_REGION=ap-northeast-2

S3_BUCKET=ktb-8-chat-files-849241211897-ap-northeast-2-an