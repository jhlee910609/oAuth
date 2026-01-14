# Mock OAuth 2.0 Flow Project

이 프로젝트는 OAuth 2.0 Authorization Code Flow (PKCE 포함)를 학습하고 테스트하기 위해 구축된 Mock 환경입니다.
특히 **Headless Authorization Server** 패턴(Custom Login UI)을 구현하여, 프론트엔드(`Client`)가 로그인 화면을 직접 제공하면서도 OAuth 표준 흐름을 따르는 구조를 갖추고 있습니다.

## 🚀 인증 프로세스 (Architecture Flow)

### 1. 진입 및 납치 (Middleware)

- **User**: 메인 페이지(`http://localhost:3000/`) 접속 시도.
- **Middleware**: `session_token` 쿠키 확인.
  - 없다면? -> **`/api/auth/signin`**으로 강제 리다이렉트 (Login Flow 시작).
- **Security**: 이미 로그인된 사용자가 `/login` 등에 접근하면 메인으로 튕겨냄.

### 2. OAuth 시작 (BFF - Signin API)

- **Path**: `/api/auth/signin`
- **Role**: 인증 요청 준비 (Client -> Provider).
- **Action**:
  - `state` (CSRF 방지), `code_verifier` (PKCE 암호) 생성.
  - 이를 `HttpOnly Cookie`에 저장.
  - Provider의 **`/api/oauth/authorize`**로 리다이렉트.

### 3. 로그인 UI 위임 (Headless Pattern)

- **Path**: `/api/oauth/authorize` (Provider)
- **Role**: 로그인 여부 확인 및 UI 위임.
- **Action**:
  - 로그인이 안 되어 있다면?
  - **"로그인 화면은 Client 네가 띄워라"** 하고 Client의 **`/login`** 페이지로 리다이렉트.
  - 이때 OAuth 파라미터(`client_id`, `redirect_uri`, `state`, `code_challenge` 등)를 그대로 전달.

### 4. 사용자 로그인 (Custom Login UI)

- **Path**: `/login` (Client Page)
- **Role**: 사용자에게 ID/PW 입력받기.
- **Action**:
  - 사용자가 ID(`user`) / PW(`password`) 입력.
  - **Provider의 인증 API (`/api/oauth/authenticate`)**를 직접 호출 (`POST`).
  - (회원가입이 필요한 경우 `/provider/signup`으로 이동 가능).

### 5. 인증 및 코드 발급 (Provider API)

- **Path**: `/api/oauth/authenticate`
- **Role**: ID/PW 검증 및 승인.
- **Action**:
  - 검증 성공 시 **Authorization Code** 생성.
  - Client가 처음에 요청했던 `redirect_uri` (= **`/api/auth/callback`**)로 리다이렉트 URL 반환.
  - Client UI는 이 URL로 `window.location.href` 이동.

### 6. 토큰 교환 및 세션 생성 (BFF - Callback API)

- **Path**: `/api/auth/callback`
- **Role**: 입장권 교환 (Code -> Token).
- **Action**:
  - URL에서 `code`와 `state` 추출.
  - 쿠키에서 `verifier` 꺼내서 **Provider Token Endpoint (`/api/oauth/token`)** 호출.
  - **Server-to-Server** 통신으로 `Access Token` 발급받음.
  - 이를 브라우저 `session_token` 쿠키로 굽고 **메인 페이지(`/`)**로 최종 리다이렉트.

---

## 📂 주요 파일 구조

```
pages/
├── index.tsx                # 메인 페이지 (로그인 후 접근 가능)
├── login/
│   └── index.tsx            # [Client] 커스텀 로그인 페이지 (ID/PW 입력)
├── provider/
│   └── signup.tsx           # [Provider] 회원가입 페이지 (Link from Login)
└── api/
    ├── auth/
    │   ├── signin.ts        # [Client] OAuth 시작점
    │   └── callback.ts      # [Client] 토큰 교환 및 세션 생성
    └── oauth/
        ├── authorize.ts     # [Provider] 인증 요청 처리 (-> /login 위임)
        ├── authenticate.ts  # [Provider] ID/PW 검증 및 Code 발급
        ├── token.ts         # [Provider] Code 검증 및 Token 발급
        └── register.ts      # [Provider] 회원가입 처리
middleware.ts                # 세션 검사 및 라우팅 보호
```

## 🛠 테스트 계정

- **ID**: `user`
- **PW**: `password`
- 또는 `/login` 화면 하단 링크를 통해 회원가입 가능.
