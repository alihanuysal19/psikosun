"use client";
import CardBox from "@/app/components/shared/CardBox";
import { Profile } from "@/app/components/user-profile/Profile";
import { Icon } from "@iconify/react/dist/iconify.js";
import useAuth from "@/app/guards/authGuard/UseAuth";

const Page = () => {
  const { user } = useAuth();
  const roleLabel =
    user?.role === "TEACHER" ? "Öğretmen" : user?.role === "ADMIN" ? "Yönetici" : "Öğrenci";

  return (
    <div className="max-w-3xl mx-auto">
      <CardBox>
        <div className="flex items-center gap-4 pb-6 mb-6 border-b border-gray-100 dark:border-gray-800">
          <span className="size-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon icon="tabler:user" width={32} className="text-primary" />
          </span>
          <div>
            <h2 className="text-xl font-semibold text-dark dark:text-white">
              {user?.displayName ?? "Profilim"}
            </h2>
            <p className="text-sm text-gray-400">{roleLabel}</p>
          </div>
        </div>
        <Profile />
      </CardBox>
    </div>
  );
};

export default Page;
