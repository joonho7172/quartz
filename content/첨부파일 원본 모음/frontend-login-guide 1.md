# Next.js + TypeScript 로그인 연동 가이드

현재 백엔드 구현을 기준으로 작성한 프론트엔드 연동 문서입니다.

> 실제 API 경로는 /api/auth가 아니라 /auth입니다.

## 1. 먼저 확인할 계약

| 항목 | 현재 값 |
| --- | --- |
| 백엔드 기본 주소 | http://localhost:8080 |
| Kakao Redirect URI | http://localhost:8080/auth/kakao/callback |
| 로그인 후 프론트 주소 | http://localhost:3000 |
| OAuth state 만료 | 300초 |
| Access Token 만료 | 900초 |
| Refresh Token 만료 | 14일 |
| 실제 API prefix | /auth |

백엔드 환경변수 FRONTEND_REDIRECT_URI가 로그인 후 이동할 프론트 주소를 결정합니다.
개발 중에는 localhost와 127.0.0.1을 섞지 마세요. 쿠키가 호스트별로 저장됩니다.

프론트와 백엔드가 서로 다른 포트이므로 쿠키가 필요한 요청에는 반드시
credentials: "include"를 사용해야 합니다. 브라우저에서 직접 호출한다면 백엔드 CORS도
프론트 origin에 대해 credentials를 허용해야 합니다.

## 2. 기본 로그인 흐름

현재 기본 흐름은 프론트가 인가 코드를 직접 받지 않고, Kakao가 백엔드 callback으로
바로 이동하는 방식입니다.

```
프론트
  │
  ├─ GET /auth/oauth/state ────────────────▶ 백엔드
  │   ◀─ state JSON + oauth_state 쿠키 ─────┤
  │
  ├─ Kakao authorize URL로 브라우저 이동 ──▶ Kakao
  │   ◀─ 백엔드 callback으로 redirect ──────┤
  │
  │                 GET /auth/kakao/callback?code=...&state=...
  │                 ────────────────────────▶ 백엔드
  │                 ◀─ 302 + refresh_token 쿠키
  │
  ├─ POST /auth/refresh ───────────────────▶ 백엔드
  │   ◀─ Access Token JSON ─────────────────┤
  │
  └─ Authorization: Bearer <Access Token>으로 API 호출
```

## 3. 로그인 시작: OAuth state 발급

로그인 버튼 클릭 시 백엔드에 state를 요청합니다.

```http
GET /auth/oauth/state
```

```ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

const response = await fetch(`${API_BASE_URL}/auth/oauth/state`, {
  credentials: "include",
});

const body = (await response.json()) as ApiResponse<OAuthStateResponse>;
const state = body.data?.state;

if (!response.ok || !state) {
  throw new Error("OAuth state 발급에 실패했습니다.");
}
```

백엔드는 원본 state의 SHA-256 해시를 저장하고, 5분 동안 한 번만 사용할 수 있게 합니다.

응답은 다음과 같습니다.

```http
HTTP/1.1 200 OK
Set-Cookie: oauth_state=<state>; HttpOnly; Secure; SameSite=Lax; Path=/auth; Max-Age=300
```

```json
{
  "data": {
    "state": "<state>",
    "expiresIn": 300
  },
  "error": null
}
```

oauth_state 쿠키는 HttpOnly이므로 JavaScript로 읽지 않습니다. 응답 body의 state만
Kakao authorize URL 생성에 사용합니다.

## 4. Kakao 로그인 페이지로 이동

```ts
const kakaoAuthorizeUrl = new URL("https://kauth.kakao.com/oauth/authorize");
kakaoAuthorizeUrl.searchParams.set(
  "client_id",
  process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY!,
);
kakaoAuthorizeUrl.searchParams.set(
  "redirect_uri",
  process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI!,
);
kakaoAuthorizeUrl.searchParams.set("response_type", "code");
kakaoAuthorizeUrl.searchParams.set("state", state);

window.location.assign(kakaoAuthorizeUrl.toString());
```

프론트 환경변수 예시:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_KAKAO_REST_API_KEY=<Kakao REST API 키>
NEXT_PUBLIC_KAKAO_REDIRECT_URI=http://localhost:8080/auth/kakao/callback
```

Kakao REST API 키는 공개 클라이언트 값이지만, Kakao client secret은 프론트에 넣으면
안 됩니다. client secret은 백엔드 환경변수로만 관리합니다.

## 5. 백엔드 Kakao callback

Kakao 인증이 끝나면 브라우저가 자동으로 다음 요청을 보냅니다.

```http
GET /auth/kakao/callback?code=<authorizationCode>&state=<state>
Cookie: oauth_state=<same-state>
```

백엔드는 다음 순서로 처리합니다.

1. query의 state와 oauth_state 쿠키가 같은지 확인합니다.
2. state를 DB에서 검증하고 한 번만 사용 처리합니다.
3. Kakao token API로 Kakao Access Token을 받습니다.
4. Kakao user API에서 사용자 정보를 받습니다.
5. 기존 소셜 계정을 찾거나 최초 로그인 시 User와 SocialAccount을 생성합니다.
6. 우리 서비스의 Access Token과 Refresh Token을 발급합니다.

성공 응답은 JSON이 아니라 redirect입니다.

```http
HTTP/1.1 302 Found
Location: http://localhost:3000
Set-Cookie: refresh_token=<refreshToken>; HttpOnly; Secure; SameSite=Lax; Path=/auth; Max-Age=1209600
```

프론트가 callback query의 code를 처리하는 것이 아니며, callback 응답 body에도
Access Token이 없습니다. 프론트 페이지가 로드된 뒤 /auth/refresh를 호출해야 합니다.

## 6. Access Token 받기

로그인 후 redirect된 Next.js 페이지에서 Refresh Token 쿠키로 Access Token을 요청합니다.

```http
POST /auth/refresh
Cookie: refresh_token=<refreshToken>
```

```ts
async function refreshAccessToken(): Promise<string | null> {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }

  const body = (await response.json()) as ApiResponse<TokenReissueResponse>;
  if (!response.ok || !body.data) {
    throw new Error(body.error?.message ?? "Access Token 재발급에 실패했습니다.");
  }

  return body.data.accessToken;
}
```

성공 응답:

```json
{
  "data": {
    "accessToken": "<our-access-token>",
    "tokenType": "Bearer",
    "expiresIn": 900
  },
  "error": null
}
```

Refresh Token은 HttpOnly 쿠키이므로 localStorage나 document.cookie에서 읽지 않습니다.
Access Token은 프론트 상태나 메모리에 보관하고 API 요청에 사용하면 됩니다.

## 7. 보호된 API 호출

Access Token이 필요한 API에는 다음 헤더를 추가합니다.

```http
Authorization: Bearer <accessToken>
```

```ts
async function fetchWithAccessToken(
  path: string,
  accessToken: string,
  init: RequestInit = {},
) {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);
  headers.set("Accept", "application/json");

  return fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });
}
```

백엔드는 JWT의 서명, 만료 시간, 사용자 ID, role을 검증한 뒤 요청을 처리합니다.
서버 세션을 사용하지 않는 stateless 인증입니다.

Access Token이 만료되어 보호된 API가 401을 반환하면 다음 순서로 처리합니다.

1. POST /auth/refresh
2. 새 accessToken 저장
3. 원래 API를 한 번만 재요청
4. refresh도 401이면 로그인 화면으로 이동

무한 재시도를 막기 위해 같은 요청의 refresh/retry는 한 번만 수행하세요.

## 8. 로그아웃

/auth/logout은 Access Token 인증이 필요한 API입니다.

### 요청

```http
POST /auth/logout
Authorization: Bearer <accessToken>
Cookie: refresh_token=<refreshToken>
```

```ts
await fetch(`${API_BASE_URL}/auth/logout`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
  credentials: "include",
});

// 성공 후 프론트의 accessToken 상태도 삭제합니다.
```

성공 응답:

```http
HTTP/1.1 204 No Content
Set-Cookie: refresh_token=; Max-Age=0
```

## 9. 직접 POST /auth/oauth 하는 대체 방식

Kakao Redirect URI를 프론트엔드로 설정해 프론트가 code를 직접 받는 구조라면
프론트가 다음 요청을 보낼 수 있습니다. 현재 기본 callback 방식에서는 이 요청을
사용하지 않습니다.

### 요청

```http
POST /auth/oauth
Content-Type: application/json
Cookie: oauth_state=<state>
```

```json
{
  "provider": "KAKAO",
  "authorizationCode": "<authorizationCode>",
  "state": "<state>"
}
```

```ts
const response = await fetch(`${API_BASE_URL}/auth/oauth`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include",
  body: JSON.stringify({
    provider: "KAKAO",
    authorizationCode,
    state,
  }),
});
```

신규 사용자는 201 Created, 기존 사용자는 200 OK입니다.

```json
{
  "data": {
    "accessToken": "<our-access-token>",
    "tokenType": "Bearer",
    "expiresIn": 900,
    "isNewUser": true,
    "user": {
      "userId": 1,
      "nickname": "사용자",
      "profileImageUrl": "https://..."
    }
  },
  "error": null
}
```

이 방식도 Refresh Token은 JSON이 아니라 Set-Cookie로만 전달됩니다.

## 10. 공통 TypeScript 타입

```ts
export type ApiErrorDetail = {
  field: string;
  reason: string;
};

export type ApiError = {
  code: string;
  message: string;
  details: ApiErrorDetail[];
};

export type ApiResponse<T> = {
  data: T | null;
  error: ApiError | null;
};

export type OAuthStateResponse = {
  state: string;
  expiresIn: number;
};

export type UserProfile = {
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
};

export type AuthResponse = {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  isNewUser: boolean;
  user: UserProfile;
};

export type TokenReissueResponse = {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
};
```

## 11. 실패 응답

모든 JSON 오류 응답은 다음 형식입니다.

```json
{
  "data": null,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "인증에 실패했습니다.",
    "details": []
  }
}
```

| 상태 코드 | 주요 상황 | 프론트 처리 |
| ---: | --- | --- |
| 400 | 필수 값 누락, 잘못된 JSON | 입력값 또는 요청 형식 확인 |
| 401 | state/code/Access Token/Refresh Token 인증 실패 | 로그인 재시도 또는 로그인 화면 이동 |
| 403 | 권한 부족 | 권한 없음 화면 표시 |
| 409 | 소셜 계정 연결 충돌 | 사용자에게 계정 연결 문제 안내 |
| 500 | 서버 또는 외부 Kakao API 처리 오류 | 일반 오류 안내 및 재시도 |

특히 다음 상황은 401입니다.

- oauth_state 쿠키 누락 또는 body/query state와 불일치
- 만료되거나 이미 사용한 state
- 만료되거나 이미 사용한 Kakao authorization code
- Refresh Token 쿠키 누락, 만료 또는 폐기
- 보호된 API의 Access Token 누락, 만료 또는 위조

## 12. Next.js에서 적용할 위치

- 로그인 버튼: Client Component에서 state 발급 후 window.location.assign() 실행
- 로그인 후 초기화: FRONTEND_REDIRECT_URI로 이동한 페이지에서 refreshAccessToken() 실행
- Access Token 보관: React Context, Zustand 등 현재 프로젝트 상태 관리 방식에 저장
- API 호출: 공통 fetch 함수에서 Authorization 헤더 추가
- 로그아웃: /auth/logout 성공 후 Access Token 상태 초기화

window, document를 사용하는 코드는 Server Component에서 실행하지 말고 Client
Component 또는 클라이언트 전용 모듈에서 실행하세요.

## 13. 구현 체크리스트

- [ ] Kakao 콘솔 Redirect URI가 http://localhost:8080/auth/kakao/callback과 일치한다.
- [ ] 백엔드 FRONTEND_REDIRECT_URI가 Next.js 주소를 가리킨다.
- [ ] /auth/oauth/state 요청에 credentials: "include"를 사용한다.
- [ ] callback 이후 /auth/refresh를 호출한다.
- [ ] Refresh Token을 프론트 코드에서 직접 읽으려 하지 않는다.
- [ ] 보호된 API에 Authorization: Bearer <accessToken>을 사용한다.
- [ ] Access Token 만료 시 refresh 후 원래 요청을 한 번만 재시도한다.
- [ ] 로그아웃 시 credentials: "include"와 Access Token을 함께 보낸다.
- [ ] localhost와 127.0.0.1을 혼용하지 않는다.

관련 백엔드 구현은 [AuthController.java](/Users/kim/Desktop/KTB-Agile-backend/src/main/java/com/example/KTB_Agile_backend/auth/controller/AuthController.java),
[AuthService.java](/Users/kim/Desktop/KTB-Agile-backend/src/main/java/com/example/KTB_Agile_backend/auth/service/AuthService.java),
[SecurityConfig.java](/Users/kim/Desktop/KTB-Agile-backend/src/main/java/com/example/KTB_Agile_backend/security/SecurityConfig.java)를 참고하세요.
