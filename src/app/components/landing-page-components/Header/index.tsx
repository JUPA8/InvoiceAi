"use client";

import { GridContainer } from "../GridContainer";
import Image from "next/image";
import { ItemMenu } from "./ItemMenu";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "../LanguageSwitcher";
import Link from "next/link";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { url: "#home", title: "Home" },
    { url: "#features", title: "Features" },
    { url: "#how-it-works", title: "How It Works" },
    { url: "#pricing", title: "Pricing" },
    { url: "#faq", title: "FAQ" },
    { url: "#book-a-demo", title: "Book a Demo" },
  ];

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="sticky top-0 w-full h-[80px] z-50 bg-white border-b border-b-gray-100 flex items-center">
      <GridContainer className="flex items-center justify-between">
        <div className="w-full xl:w-auto flex items-center justify-between gap-10">
          <div className="flex items-center gap-2">
            <Image src="/logo-wize-invoice.svg" alt="logo" width={40} height={32} />
            <span className="text-xl font-bold text-[#0C3951]">Invoice <span className="text-[#11A193]">AI</span></span>
          </div>

          <nav className="hidden xl:flex items-center gap-8">
            {menuItems.map(({ url, title }, index) => (
              <ItemMenu key={index} url={url} title={title} />
            ))}
          </nav>

          <button onClick={toggleMenu}>
            <Image
              src="/hamburger.svg"
              width={40}
              height={40}
              alt="menu-hamburger"
              className="block xl:hidden cursor-pointer"
            />
          </button>
        </div>

        <div className="gap-9 hidden xl:flex ">
          <Link href="/login">
            <button className="py-3 px-4 bg-[#11A193] rounded-lg text-white font-semibold leading-normal hover:bg-[#116E65] transition-colors cursor-pointer">
              Login
            </button>
          </Link>

          {/* <button className="py-3 px-4 bg-[#11A193] rounded-lg text-white font-semibold leading-normal hover:bg-blue-600 transition-colors cursor-pointer">
            {t("startTrial")}
          </button> */}
        </div>
      </GridContainer>

      {/* Sidebar menu for mobile */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out z-50`}
      >
        <div className="flex flex-col p-6 space-y-4">
          <button onClick={toggleMenu} className="self-end mb-4">
            <FontAwesomeIcon icon={faX} />
          </button>
          {menuItems.map(({ url, title }, index) => (
            <ItemMenu key={index} url={url} title={title} />
          ))}
        </div>
      </div>

      {/* Overlay to close sidebar */}
      {isOpen && (
        <div
          onClick={toggleMenu}
          className="fixed inset-0 bg-black opacity-50 z-40"
        ></div>
      )}

      {/* <LanguageSwitcher /> */}
    </header>
  );
}
