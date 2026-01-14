import { useRouter } from "next/router";
import { FormEvent, useState } from "react";
import Link from "next/link";

export default function ProviderSignUp() {
  const router = useRouter();
  // 회원가입 후 다시 원래 하려던 로그인 과정으로 돌아가기 위해 쿼리 파라미터 유지
  const {
    client_id,
    redirect_uri,
    state,
    code_challenge,
    code_challenge_method,
  } = router.query;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/oauth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Registration failed");
      }

      // 가입 성공 시 로그인 페이지(Custom UI)로 이동 (쿼리 파라미터 보존)
      const loginUrl = new URL("/login", window.location.origin);
      if (client_id)
        loginUrl.searchParams.set("client_id", client_id as string);
      if (redirect_uri)
        loginUrl.searchParams.set("redirect_uri", redirect_uri as string);
      if (state) loginUrl.searchParams.set("state", state as string);
      if (code_challenge)
        loginUrl.searchParams.set("code_challenge", code_challenge as string);
      if (code_challenge_method)
        loginUrl.searchParams.set(
          "code_challenge_method",
          code_challenge_method as string
        );

      alert("User registered successfully! Please sign in.");
      router.push(loginUrl.toString());
    } catch (err: any) {
      setError(err.message);
    }
  };

  // 쿼리 스트링 조립 (Sign In 링크용 - Custom UI로 바로 이동)
  const signInQuery = new URLSearchParams();
  if (client_id) signInQuery.set("client_id", client_id as string);
  if (redirect_uri) signInQuery.set("redirect_uri", redirect_uri as string);
  if (state) signInQuery.set("state", state as string);
  if (code_challenge)
    signInQuery.set("code_challenge", code_challenge as string);
  if (code_challenge_method)
    signInQuery.set("code_challenge_method", code_challenge_method as string);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Mock OAuth Sign Up
        </h1>

        <div className="mb-6 mx-auto w-fit px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
          Create New Account
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              New Username
            </label>
            <input
              type="text"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Register
          </button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-sm text-gray-600">
            Already have an account?{" "}
          </span>
          <Link
            href={`/login?${signInQuery.toString()}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
