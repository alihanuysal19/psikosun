"use client";
import "flowbite";
import React, { useState, useEffect, useContext } from "react";
import { Button, DarkThemeToggle, DrawerItems, Navbar, NavbarCollapse } from "flowbite-react";
import { Icon } from "@iconify/react";
import Profile from "./Profile";
import { Drawer } from "flowbite-react";
import MobileSidebar from "../sidebar/MobileSidebar";
import Link from "next/link";
import Notifications from "./Notifications";



const Header = () => {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);



  const [mobileMenu, setMobileMenu] = useState("");

  const handleMobileMenu = () => {
    if (mobileMenu === "active") {
      setMobileMenu("");
    } else {
      setMobileMenu("active");
    }
  };


  // mobile-sidebar
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);
  return (
    <>
      <header
        className={`sticky top-0 z-[2] ${isSticky
          ? "bg-white dark:bg-dark shadow-md fixed w-full"
          : "bg-transparent"
          }`}
      >
        <Navbar
          fluid
          className={`rounded-none bg-transparent dark:bg-transparent py-4 sm:ps-6 !max-w-full sm:pe-10 px-6`}
        >
          {/* Mobile Toggle Icon */}
          <span
            onClick={() => setIsOpen(true)}
            className="lg:px-[15px] px-0 hover:text-primary dark:hover:text-primary text-link dark:text-darklink relative after:absolute after:w-10 after:h-10 after:rounded-full hover:after:bg-lightprimary  after:bg-transparent rounded-full xl:hidden flex justify-center items-center cursor-pointer"
          >
            <Icon icon="tabler:menu-2" height={20} />
          </span>
          {/* Toggle Icon   */}
          <NavbarCollapse className="xl:block ">
            <div className="flex gap-0 items-center relative">
              {/* Chat */}
               <Notifications/>
            </div>
          </NavbarCollapse>


          <div className="block">
            <div className="flex gap-1 sm:gap-3 items-center">
              <Link
                href="/"
                aria-label="Ana Sayfa"
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 text-primary hover:bg-primary hover:text-white transition-colors px-3 py-1.5 text-xs sm:text-sm font-medium"
              >
                <Icon icon="tabler:home" width={16} />
                <span className="hidden sm:inline">Ana Sayfa</span>
              </Link>
              <Profile />
            </div>
          </div>
        </Navbar>
      </header>

      {/* Mobile Sidebar */}
      <Drawer open={isOpen} onClose={handleClose} className="w-[268px]">
        <DrawerItems>
          <MobileSidebar />
        </DrawerItems>
      </Drawer>
    </>
  );
};

export default Header;
