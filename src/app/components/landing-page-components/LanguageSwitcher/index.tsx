"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";

const LanguageSwitcher = () => {
  const t = useTranslations("LanguageSwitcher");
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  // Idiomas suportados
  const languages = [
    { code: "en", label: t("english") },
    { code: "de", label: t("german") },
    { code: "es", label: t("spanish") },
    { code: "fr", label: t("french") },
    { code: "pt", label: t("portuguese") },
    { code: "zh", label: t("chinese") },
    { code: "hi", label: t("hindi") },
  ];

  // Função para mudar o idioma
  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    router.push(`/${lang}`); // Redireciona para a URL com o idioma selecionado
  };

  return (
    <div className="relative">
      <button className="flex items-center space-x-2 py-2 px-4 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors">
        <span>{t("language")}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          fill="currentColor"
          className="bi bi-caret-down-fill"
          viewBox="0 0 16 16"
        >
          <path d="M3.5 5h9a.5.5 0 0 1 .354.854l-4.5 4.5a.5.5 0 0 1-.708 0l-4.5-4.5A.5.5 0 0 1 3.5 5z" />
        </svg>
      </button>

      {/* Dropdown para escolher o idioma */}
      <div className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
        <div className="py-1">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`block px-4 py-2 text-sm text-gray-700 w-full text-left ${
                selectedLanguage === language.code
                  ? "bg-blue-500 text-white"
                  : ""
              } hover:bg-blue-100 transition-colors`}
            >
              {language.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LanguageSwitcher;
