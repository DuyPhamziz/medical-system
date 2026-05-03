import { getServerProfile } from "@/services/auth.server";
import { ProfileView } from "./ProfileView";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const profile = await getServerProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-6">
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Hồ sơ cá nhân</h1>
        <p className="text-slate-500 mt-2">Dữ liệu được tải an toàn từ Server.</p>
      </div>

      <ProfileView initialProfile={profile} />
    </div>
  );
}
