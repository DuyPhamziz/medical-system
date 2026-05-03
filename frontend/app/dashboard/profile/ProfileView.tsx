"use client";

import { useState } from "react";
import { UserProfile } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";

export function ProfileView({ initialProfile }: { initialProfile: UserProfile }) {
  const [profile, setProfile] = useState(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const { register, handleSubmit } = useForm<UserProfile>({ defaultValues: initialProfile });

  const onUpdate = async (data: UserProfile) => {
    toast.info("Gửi dữ liệu cập nhật về Backend...");
    setProfile(data);
    setIsEditing(false);
    toast.success("Cập nhật thành công!");
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      className="grid gap-8 md:grid-cols-3"
    >
      <div className="space-y-6">
        <Card className="p-8 text-center bg-white border-slate-200 shadow-sm">
           <div className="h-32 w-32 mx-auto rounded-full bg-cyan-100 flex items-center justify-center text-4xl font-bold text-cyan-700 shadow-inner">
              {profile.fullName?.charAt(0).toUpperCase() || profile.username?.charAt(0).toUpperCase()}
           </div>
           <h2 className="mt-4 text-2xl font-bold text-slate-900">{profile.fullName || profile.username}</h2>
           <div className="mt-2 inline-flex px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-bold uppercase">
             {profile.role}
           </div>
        </Card>
        
        <Button onClick={() => setIsEditing(!isEditing)} className="w-full bg-slate-900">
          {isEditing ? "Hủy chỉnh sửa" : "Chỉnh sửa hồ sơ"}
        </Button>
      </div>

      <div className="md:col-span-2">
        <Card className="p-8 border-slate-200 shadow-sm">
          <form onSubmit={handleSubmit(onUpdate)} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <EditableField label="Họ và tên" value={profile.fullName} editing={isEditing} {...register("fullName")} />
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Email</label>
                <p className="h-11 flex items-center px-4 bg-slate-50 rounded-xl text-slate-400 border border-slate-100 italic">{profile.email}</p>
              </div>
              <EditableField label="Số điện thoại" value={profile.phoneNumber} editing={isEditing} {...register("phoneNumber")} />
              <EditableField label="Ngày sinh" value={profile.dateOfBirth} editing={isEditing} type="date" {...register("dateOfBirth")} />
              <div className="sm:col-span-2">
                <EditableField label="Địa chỉ" value={profile.address} editing={isEditing} isTextArea {...register("address")} />
              </div>
            </div>
            
            <AnimatePresence>
              {isEditing && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: "auto" }} 
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">Lưu tất cả thay đổi</Button>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </Card>
      </div>
    </motion.div>
  );
}

function EditableField({ label, value, editing, type = "text", isTextArea, ...props }: any) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      {editing ? (
        isTextArea ? (
          <textarea {...props} rows={3} className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none transition" />
        ) : (
          <input type={type} {...props} className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none transition" />
        )
      ) : (
        <p className="h-11 flex items-center px-4 bg-slate-50 rounded-xl text-slate-900">{value || "Chưa cập nhật"}</p>
      )}
    </div>
  );
}
