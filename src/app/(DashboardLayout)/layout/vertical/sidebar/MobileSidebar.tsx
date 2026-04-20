"use client";
import React, { useContext } from "react";
import { Sidebar, SidebarItemGroup, SidebarItems } from "flowbite-react";
import { StudentSidebar, TeacherSidebar, AdminSidebar } from "./Sidebaritems";
import NavItems from "./NavItems";
import NavCollapse from "./NavCollapse";
import SimpleBar from "simplebar-react";
import { Icon } from "@iconify/react";
import AuthContext from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

const MobileSidebar = () => {
  const router = useRouter();
  const { logout, user } = useContext(AuthContext);

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  const sidebarItems =
    user?.role === "ADMIN"
      ? AdminSidebar
      : user?.role === "TEACHER"
      ? TeacherSidebar
      : StudentSidebar;

  return (
    <div className="flex">
      <Sidebar
        className="fixed menu-sidebar pt-0 bg-white dark:bg-dark z-[10]"
        aria-label="Sidebar"
      >
        <div className="px-6 flex items-center brand-logo overflow-hidden">
          <div className="flex items-center gap-2 py-1">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Icon icon="tabler:brain" className="text-white" width={18} />
            </div>
            <span className="text-lg font-bold text-dark dark:text-white">psikosun</span>
          </div>
        </div>

        <SimpleBar className="h-[calc(100vh_-_200px)]">
          <SidebarItems className="px-6">
            <SidebarItemGroup className="sidebar-nav">
              {sidebarItems.map((item, index) => (
                <React.Fragment key={index}>
                  <h5 className="text-link font-bold text-xs dark:text-darklink caption">
                    <span className="hide-menu leading-21">{item.heading?.toUpperCase()}</span>
                    <Icon
                      icon="tabler:dots"
                      className="text-ld block mx-auto leading-6 dark:text-opacity-60 hide-icon"
                      height={18}
                    />
                  </h5>
                  {item.children?.map((child, i) => (
                    <React.Fragment key={child.id ?? i}>
                      {child.children ? (
                        <div className="collpase-items">
                          <NavCollapse item={child} />
                        </div>
                      ) : (
                        <NavItems item={child} />
                      )}
                    </React.Fragment>
                  ))}
                </React.Fragment>
              ))}
            </SidebarItemGroup>
          </SidebarItems>
        </SimpleBar>

        <div className="px-5 pb-5 mt-auto">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Icon icon="tabler:user" className="text-primary" width={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-dark dark:text-white truncate">{user?.displayName}</p>
              <p className="text-xs text-gray-400 capitalize">{
                user?.role === "TEACHER" ? "Öğretmen" :
                user?.role === "ADMIN" ? "Yönetici" : "Öğrenci"
              }</p>
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-error transition-colors">
              <Icon icon="tabler:logout" width={18} />
            </button>
          </div>
        </div>
      </Sidebar>
    </div>
  );
};

export default MobileSidebar;
