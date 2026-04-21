"use client";
import CardBox from "@/app/components/shared/CardBox";
import { Profile } from "@/app/components/user-profile/Profile";
import AvatarUpload from "@/app/components/user-profile/AvatarUpload";
import useAuth from "@/app/guards/authGuard/UseAuth";

const Page = () => {
  const { user } = useAuth();
  const roleLabel =
    user?.role === "TEACHER" ? "Öğretmen" : user?.role === "ADMIN" ? "Yönetici" : "Öğrenci";

  if (!user?.id) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <CardBox>
        <div className="pb-6 mb-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-5">
            <div>
              <h2 className="text-xl font-semibold text-dark dark:text-white">
                {user.displayName ?? "Profilim"}
              </h2>
              <p className="text-sm text-gray-400">{roleLabel}</p>
            </div>
          </div>
          <AvatarUpload
            userId={user.id}
            initialUrl={user.avatar || null}
            displayName={user.displayName || "?"}
          />
        </div>
        <Profile />
      </CardBox>
    </div>
  );
};

export default Page;
