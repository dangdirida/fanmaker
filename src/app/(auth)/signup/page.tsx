"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("모든 필드를 입력해주세요.");
      return;
    }

    if (password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error);
        setLoading(false);
        return;
      }

      // 회원가입 성공 → 자동 로그인
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("로그인에 실패했습니다. 로그인 페이지에서 다시 시도해주세요.");
        setLoading(false);
        return;
      }

      window.location.href = "/onboarding";
    } catch {
      setError("네트워크 오류가 발생했습니다.");
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    signIn("google", { callbackUrl: "/feed" });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* 로고 */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#ff3d7f] to-[#c084fc] bg-clip-text text-transparent">
            FanMaker
          </h1>
          <p className="text-gray-400">회원가입</p>
        </div>

        {/* 회원가입 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm text-gray-400 mb-1 block">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력하세요"
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ff3d7f] transition-colors"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ff3d7f] transition-colors"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6자 이상"
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ff3d7f] transition-colors"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">비밀번호 확인</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호를 다시 입력하세요"
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ff3d7f] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ff3d7f] text-white font-medium py-3 px-4 rounded-xl hover:bg-[#e6356f] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            회원가입
          </button>
        </form>

        {/* 구분선 */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-800" />
          <span className="text-gray-600 text-xs">또는</span>
          <div className="flex-1 h-px bg-gray-800" />
        </div>

        {/* 구글 로그인 */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-medium py-3 px-4 rounded-xl hover:bg-gray-100 disabled:opacity-50 transition-colors"
        >
          {googleLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          Google로 계속하기
        </button>

        {/* 로그인 링크 */}
        <p className="text-center text-gray-500 text-sm">
          이미 계정이 있나요?{" "}
          <Link href="/login" className="text-[#ff3d7f] hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
