"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { login } from "@/services/auth.api";

export default function LoginPage() {
  const { setSession, redirectAfterLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await login({ email, password });
      setSession(response);
      redirectAfterLogin();
    } catch {
      setError("Email hoặc mật khẩu không đúng.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_20%_20%,#d1fae5,transparent_45%),radial-gradient(circle_at_80%_0%,#bfdbfe,transparent_40%),linear-gradient(160deg,#f8fafc,#f1f5f9)] p-6">
      <div className="w-full max-w-md rounded-3xl border border-white/60 bg-white/85 p-8 shadow-2xl backdrop-blur">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Nền tảng y học gia đình</p>
        <h1 className="mb-6 text-3xl font-bold text-slate-900">Đăng nhập hệ thống</h1>

        <form className="space-y-4" onSubmit={onSubmit}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <label className="flex w-full flex-col gap-2 text-sm font-medium text-slate-700">
            <span>Mật khẩu</span>
            <div className="relative">
              <input
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 pr-16 text-slate-900 outline-none ring-cyan-200 transition focus:border-cyan-500 focus:ring-2"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-cyan-700 hover:text-cyan-600"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? "Ẩn" : "Hiện"}
              </button>
            </div>
          </label>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}

          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </Button>
        </form>

        <p className="mt-6 text-sm text-slate-600">
          Chưa có tài khoản?{" "}
          <Link className="font-semibold text-cyan-700 hover:text-cyan-600" href="/register">
            Đăng ký
          </Link>
        </p>
      </div>
    </div>
  );
}
