# OAuth 2.0 PKCE Flow with Next.js BFF

현재 프로젝트는 **Next.js Page Router**를 기반으로 **BFF (Backend For Frontend)** 패턴과 **PKCE (Proof Key for Code Exchange)** 보안 흐름을 완벽하게 구현한 예제입니다.

모든 인증 로직은 클라이언트(브라우저 JavaScript)가 아닌 **BFF(API Routes)와 미들웨어**에서 처리되므로, 보안성이 매우 뛰어납니다.

---

## 1. 전체 아키텍처 (Architecture)

### 핵심 개념

- **BFF (Backend For Frontend)**: Next.js API Routes가 백엔드 역할을 수행하여, Access Token 등 민감한 정보를 브라우저에 노출하지 않고 **HttpOnly Cookie**로 관리합니다.
- **PKCE (Pixy)**: Code Exchange 과정에서 `code_verifier`를 사용하여 탈취된 인증 코드로 토큰을 발급받는 Replay Attack을 방지합니다.
- **Automatic Login Flow**: 미인증 사용자는 별도의 로그인 클릭 과정 없이 즉시 인증 서버로 리다이렉트됩니다.

### 주요 파일 구성

- `middleware.ts`: 인증 여부 감지 및 리다이렉트 (문지기)
- `pages/api/auth/signin.ts`: 로그인 개시 (PKCE 생성, 쿠키 설정)
- `pages/api/auth/callback.ts`: 로그인 완료 처리 (PKCE 검증, 토큰 발급, 세션 쿠키 설정)
- `pages/provider/signin.tsx`: (Mock) 외부 인증 제공자의 로그인 화면

---

## 2. 상세 인증 흐름 (Detailed Flow)

사용자가 `/` (대시보드)에 접속했다고 가정했을 때의 흐름입니다.

### Step 1. 미들웨어의 감지 및 납치 (Hijack)

1.  **Request**: 사용자가 `http://localhost:3000/` 접속.
2.  **Check**: `middleware.ts`가 `session_token` 쿠키 유무 확인.
3.  **Action**: 토큰이 없으므로, **`/api/auth/signin`**으로 강제 302 Redirect.

### Step 2. 로그인 세션 초기화 (BFF Initiation)

1.  **Endpoint**: `/api/auth/signin` 실행.
2.  **PKCE 생성**:
    - `code_verifier`: 랜덤 문자열 생성 (암호).
    - `code_challenge`: `verifier`를 SHA256 해싱 및 Base64Url 인코딩.
3.  **Cookie 설정 (HttpOnly)**:
    - `oauth_state`: CSRF 방지용 등대 값.
    - `code_verifier`: 나중에 검증하기 위해 잠시 저장.
4.  **Redirect**: Provider의 로그인 페이지(`/provider/signin`)로 이동.
    - Query Params: `client_id`, `redirect_uri`, `state`, **`code_challenge`**

### Step 3. 사용자 로그인 (Provider Side)

1.  **Page**: `/provider/signin` (Mock Google/Kakao 로그인 화면).
2.  **Action**: 사용자가 ID/PW 입력 후 제출.
3.  **Authenticate**: `/api/oauth/authenticate` 호출.
4.  **Code Issue**:
    - ID/PW 검증 성공 시 `authorization_code` 발급.
    - **중요**: 이때 `code`와 함께 `code_challenge`를 메모리(DB)에 저장해둠.
5.  **Redirect**: Client가 지정한 `redirect_uri`인 **`/api/auth/callback`**으로 이동.
    - Query Params: `code`, `state`

### Step 4. 토큰 교환 및 세션 발급 (BFF Finalize)

1.  **Endpoint**: `/api/auth/callback` 실행.
2.  **Validation**:
    - URL의 `state` vs 쿠키의 `oauth_state` 비교 (CSRF 방어).
    - 쿠키의 `code_verifier` 존재 여부 확인.
3.  **Token Request**: Provider(`/api/oauth/token`)에게 토큰 요청.
    - Payload: `code`, `client_secret`, **`code_verifier`** (쿠키에서 꺼낸 원본).
4.  **Token Verification (Provider Side)**:
    - Provider는 저장해둔 `code_challenge`와, 지금 받은 `code_verifier`를 해싱한 값이 일치하는지 검증.
    - 일치하면 `access_token`, `refresh_token` 발급.
5.  **Session Cookie Bake**:
    - 받은 토큰을 **HttpOnly Cookie** (`session_token`, `refresh_token`)로 구움.
    - 임시 사용한 `oauth_state`, `code_verifier` 쿠키는 삭제 (Max-Age=0).
6.  **Redirect**: 최종 목적지인 **`/` (대시보드)**로 이동.

### Step 5. 로그인 완료

1.  **Request**: 다시 `http://localhost:3000/` 접속.
2.  **Check**: `middleware.ts`가 `session_token` 쿠키 발견 -> **통과(Pass)**.
3.  **Render**: `pages/index.tsx`가 렌더링되며, `getServerSideProps`를 통해 쿠키에 담긴 토큰 정보를 디코딩하여 화면에 뿌려줌.

---

## 3. 보안 특징 (Security Features)

1.  **No Client-Side Code**: 인증 과정에서 브라우저 JavaScript가 토큰이나 암호를 다루는 로직이 전무합니다. XSS 공격으로부터 매우 안전합니다.
2.  **HttpOnly & Lax Cookies**: 세션 쿠키는 JS 접근이 불가능하며, CSRF 공격을 방어하기 위해 `Lax` 모드로 설정되었습니다.
3.  **PKCE Standard**: Authorization Code가 탈취되더라도, `code_verifier`가 쿠키에만 저장되어 있어 해커가 토큰으로 교환할 수 없습니다.
4.  **State Parameter**: Login CSRF 공격을 방어하기 위해 난수 State를 검증합니다.
5.  **Strict Middleware**: 인증되지 않은 접근을 원천 차단하고 중앙에서 관리합니다.
