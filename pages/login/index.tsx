import { useRouter } from "next/router";
import { FormEvent, useState, useEffect } from "react";
import Head from "next/head";

/**
 * [CLIENT UI] 로그인 페이지
 * OAuth 서버가 "너네가 로그인 받아서 알려줘"라고 리다이렉트 시킨 곳입니다.
 */
export default function LoginPage() {
  const router = useRouter();
  const [oauthParams, setOauthParams] = useState<any>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (router.isReady) {
      setOauthParams(router.query);

      // 필수 파라미터(redirect_uri)가 없으면, 비정상적인 접근이므로
      // OAuth flow를 처음부터 다시 시작하도록 /api/auth/signin으로 보냅니다.
      if (!router.query.redirect_uri) {
        console.warn("Missing redirect_uri. Restarting OAuth flow...");
        window.location.href = "/api/auth/signin";
      }
    }
  }, [router.isReady, router.query]);

  // form submit handler uses oauthParams state instead of router.query directly
  const {
    client_id,
    redirect_uri,
    state,
    code_challenge,
    code_challenge_method,
  } = oauthParams;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // 1. 입력받은 ID/PW를 들고 OAuth 서버의 인증 API를 호출합니다.
      // (실제로는 프론트에서 바로 때리거나, BFF를 거쳐서 때릴 수 있습니다.)
      const res = await fetch("/api/oauth/authenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          // 중요: OAuth 문맥을 유지하기 위해 파라미터들을 다시 던져줘야 함
          client_id,
          redirect_uri,
          state,
          code_challenge,
          code_challenge_method,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      // 2. 인증 성공 시: OAuth 서버가 시키는 곳(Callback URL)으로 이동
      if (data.redirect_to) {
        window.location.href = data.redirect_to;
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Head>
        <title>Login | My Custom Service</title>
      </Head>

      <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Sign In</h1>
          <p className="text-sm text-gray-500 mt-2">
            To continue to My Service
          </p>
        </div>

        {!mounted ? (
          <div className="flex justify-center p-4">
            Loading login context...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter your ID"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-100 transition-colors"
            >
              Continue
            </button>
          </form>
        )}

        <div className="mt-6 text-center border-t border-gray-100 pt-6">
          <p className="text-xs text-gray-500">Don't have an account?</p>
          <button
            type="button"
            onClick={() => {
              router.push({
                pathname: "/provider/signup",
                query: router.query,
              });
            }}
            className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Create an account
          </button>
        </div>

        <div className="mt-8 text-center text-xs text-gray-400">
          Powered by Custom OAuth UI
        </div>
      </div>
    </div>
  );
}
