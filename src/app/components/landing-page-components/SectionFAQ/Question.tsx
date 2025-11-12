"use client";

import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

interface QuestionProps {
  title: string;
  response: string;
}

export function Question({ title, response }: QuestionProps) {
  const [open, setOpen] = useState(false);

  function handleOpenQuestion() {
    setOpen(!open);
  }

  return (
    <div className="w-full first:pt-0 last:pb-0 pt-6 pb-2 ">
      <button
        onClick={handleOpenQuestion}
        className={`w-full flex items-center justify-between text-left cursor-pointer bg-[#F3F3F4] p-6 rounded-2xl shadow-custom transition-all
            ${open ? "rounded-b-none shadow-none" : ""}
          `}
      >
        <h3 className="text-gray-900 text-lg/normal font-semibold">{title}</h3>
        {open ? (
          <FontAwesomeIcon icon={faChevronUp} className="text-[#11A193]" />
        ) : (
          <FontAwesomeIcon icon={faChevronDown} className="text-[#11A193]" />
        )}
      </button>

      {open && (
        <div className="w-full flex items-center justify-between text-left cursor-pointer bg-[#F3F3F4] px-6 pb-6 rounded-b-2xl shadow-custom">
          <p className="mt-2 text-gray-600 leading-normal pr-12">{response}</p>
        </div>
      )}
    </div>
  );
}
