"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { register } from "@/services/auth.api";

export default function RegisterPage() {
  const { setSession, redirectAfterLogin } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPasswordMatch = useMemo(() => password === confirmPassword, [password, confirmPassword]);
  const isPasswordValid = useMemo(() => password.length >= 8, [password]);
  const canSubmit = useMemo(() => username && email && isPasswordValid && isPasswordMatch, [username, email, isPasswordValid, isPasswordMatch]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isPasswordMatch) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const response = await register({ username, email, password, role: "PATIENT" });
      setSession(response);
      redirectAfterLogin();
    } catch {
      setError("Không thể đăng ký. Email có thể đã tồn tại hoặc thông tin không hợp lệ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_0%_50%,#bae6fd,transparent_35%),radial-gradient(circle_at_100%_100%,#bbf7d0,transparent_35%),linear-gradient(160deg,#f8fafc,#ecfeff)] p-6">
      <div className="w-full max-w-lg rounded-3xl border border-white/70 bg-white/90 p-8 shadow-2xl backdrop-blur">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Nền tảng y học gia đình</p>
        <h1 className="mb-6 text-3xl font-bold text-slate-900">Tạo tài khoản người dùng</h1>

        <form className="space-y-4" onSubmit={onSubmit}>
          <Input
            label="Họ tên"
            placeholder="Nhập họ và tên của bạn"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
          <Input
            label="Email"
            type="email"
            placeholder="example@gmail.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <Input
            label="Mật khẩu (ít nhất 8 ký tự)"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <Input
            label="Xác nhận mật khẩu"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />

          {!isPasswordMatch && confirmPassword && (
            <p className="text-xs text-rose-500 italic">Mật khẩu xác nhận không trùng khớp.</p>
          )}

          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Lưu ý: Tài khoản tự đăng ký mặc định là <b>Bệnh nhân</b>. Đối với tài khoản Bác sĩ/Nhân viên, vui lòng liên hệ Quản trị viên.
          </div>

          {error ? <p className="text-sm text-rose-600 font-medium">{error}</p> : null}

          <Button 
            className="w-full bg-emerald-700 hover:bg-emerald-600 shadow-lg shadow-emerald-200" 
            type="submit" 
            disabled={!canSubmit || loading}
          >
            {loading ? "Đang xử lý..." : "Đăng ký ngay"}
          </Button>
        </form>

        <p className="mt-6 text-sm text-slate-600">
          Đã có tài khoản?{" "}
          <Link className="font-semibold text-emerald-700 hover:text-emerald-600" href="/login">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
