"use client";

import { Icon } from "@iconify/react";
import { Button, Dropdown, DropdownItem, Spinner } from "flowbite-react";
import React, { useState, useContext } from "react";
import * as profileData from "./Data";
import Link from "next/link";
import Image from "next/image";
import SimpleBar from "simplebar-react";
import { useRouter } from "next/navigation";
import AuthContext from "@/app/context/AuthContext";

const Profile = () => {
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { logout, user } = useContext(AuthContext);

  const userName = user?.displayName || "Kullanıcı";

  const handleLogout = async () => {
    setIsLoading(true);
    await logout();
    router.push('/auth/login');
  };

  return (
    <div className="relative group/menu ps-15 shrink-0">
      <Dropdown
        label=""
        className="w-screen sm:w-[200px] pb-6 pt-4 rounded-sm"
        dismissOnClick={false}
        renderTrigger={() => (
          <div className="hover:text-primary hover:bg-lightprimary rounded-full flex justify-center items-center cursor-pointer group-hover/menu:bg-lightprimary group-hover/menu:text-primary">
            {user?.avatar ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={user.avatar}
                alt={userName}
                className="size-[35px] rounded-full object-cover"
              />
            ) : (
              <span className="size-[35px] rounded-full bg-lightprimary flex items-center justify-center text-primary border border-primary text-lg font-medium">
                {userName?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
        )}
      >
        <div className="px-4 pb-3 border-b border-border dark:border-darkborder">
          <p className="text-sm font-semibold text-dark dark:text-white truncate">{userName}</p>
          {user?.email && <p className="text-xs text-gray-400 truncate">{user.email}</p>}
        </div>
        <SimpleBar>
          {profileData.profileDD.map((items, index) => (
            <DropdownItem
              as={Link}
              href={items.url}
              className="px-4 py-2 flex justify-between items-center bg-hover group/link w-full"
              key={index}
            >
              <div className="w-full">
                <div className="ps-0 flex items-center gap-3 w-full">
                  <Icon
                    icon={items.icon}
                    className="text-lg text-bodytext dark:text-darklink group-hover/link:text-primary"
                  />
                  <div className="w-3/4 ">
                    <h5 className="mb-0 text-sm text-bodytext dark:text-darklink group-hover/link:text-primary">
                      {items.title}
                    </h5>
                    {items.subtitle && (
                      <span className="text-xs text-gray-400">{items.subtitle}</span>
                    )}
                  </div>
                </div>
              </div>
            </DropdownItem>
          ))}
        </SimpleBar>

        <div className="pt-2 px-4">
          <Button
            color={"outlineprimary"}
            size={"md"}
            disabled={isLoading}
            className="w-full rounded-md py-0 flex items-center gap-2 disabled:hover:bg-none"
            onClick={handleLogout}
          >
            {isLoading ? <Spinner aria-label="Çıkış yapılıyor" size="sm" /> : null}
            Çıkış Yap
          </Button>
        </div>
      </Dropdown>
    </div>
  );
};

export default Profile;
