import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function ProviderSignIn() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { client_id, redirect_uri, state } = router.query;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/oauth/authenticate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        password,
        client_id,
        redirect_uri,
        state,
      }),
    });

    const data = await res.json();

    if (res.ok && data.redirect_to) {
      window.location.href = data.redirect_to;
    } else {
      setLoading(false);
      alert("로그인 실패: " + data.error);
    }
  };

  if (!router.isReady) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#fcfcfc] font-sans selection:bg-blue-100">
      <Head>
        <title>로그인 | 인가 서버</title>
      </Head>

      <div className="w-full max-w-[440px] px-6 animate-fade-in">
        <div className="bg-white border border-gray-200/60 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[2rem] p-12 relative overflow-hidden">
          {/* Accent bar at the top */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-blue-600"></div>

          <div className="mb-10 text-center">
            <h1 className="text-3xl font-black text-slate-900 tracking-tightest mb-2 italic">
              MOCK AUTH
            </h1>
            <div className="inline-block py-1.5 px-3 bg-blue-50 rounded-full">
              <p className="text-blue-600 text-[11px] font-bold uppercase tracking-wider tabular-nums">
                Protected by OAuth 2.0
              </p>
            </div>
            <p className="mt-6 text-slate-500 font-medium leading-relaxed">
              <span className="text-black font-bold">{client_id}</span> 서비스가
              당신의 계정 권한을 요청합니다.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 ml-1 uppercase">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-300 font-medium"
                placeholder="user 입력"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 ml-1 uppercase">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-300 font-medium"
                placeholder="password 입력"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "인증 토큰 요청 중..." : "동의하고 로그인"}
            </button>
          </form>

          <div className="mt-10 flex flex-col items-center gap-2">
            <p className="text-[11px] text-slate-400 font-medium">
              테스트 계정 정보를 입력하세요
            </p>
            <div className="flex gap-4">
              <span className="text-[11px] px-2 py-1 bg-slate-100 rounded-md font-bold text-slate-500">
                ID: user
              </span>
              <span className="text-[11px] px-2 py-1 bg-slate-100 rounded-md font-bold text-slate-500">
                PW: password
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-6">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Privacy Policy
          </span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Terms of Service
          </span>
        </div>
      </div>
    </div>
  );
}
