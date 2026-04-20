"use client";
import { useContext } from "react";
import AuthContext from "@/app/context/AuthContext";
import StudentDashboard from "../components/dashboard/StudentDashboard";
import TeacherDashboard from "../components/dashboard/TeacherDashboard";

export default function DashboardPage() {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark dark:text-white">
          Merhaba, {user.displayName} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {user.role === "TEACHER" ? "Öğretmen paneline hoş geldiniz." :
           user.role === "ADMIN" ? "Yönetici paneline hoş geldiniz." :
           "Bugün ne öğrenmek istersiniz?"}
        </p>
      </div>

      {user.role === "TEACHER" || user.role === "ADMIN"
        ? <TeacherDashboard />
        : <StudentDashboard />
      }
    </div>
  );
}
