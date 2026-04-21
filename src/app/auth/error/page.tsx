import Image from "next/image";
import React from "react";
import ErrorImg from "/public/images/backgrounds/errorimg.svg";
import { Button } from "flowbite-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sayfa Bulunamadı — psikosun",
};

const Error = () => (
  <div className="h-screen flex items-center justify-center bg-white dark:bg-dark">
    <div className="text-center">
      <Image src={ErrorImg} alt="hata" className="mb-4" width={500} />
      <h1 className="text-ld text-4xl mb-6">Üzgünüz!</h1>
      <h6 className="text-xl text-ld">Aradığınız sayfa bulunamadı.</h6>
      <Button color="primary" as={Link} href="/" className="w-fit mt-6 mx-auto rounded-md">
        Ana Sayfaya Dön
      </Button>
    </div>
  </div>
);

export default Error;
