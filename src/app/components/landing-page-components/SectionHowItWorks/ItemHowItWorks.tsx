import { ReactNode } from "react";
import { GridContainer } from "../GridContainer";
import Image from "next/image";

interface ItemHowItWorksProps {
  title: string;
  description: string;
  features: string[];
  imageSrc: string;
  imageLeft?: boolean;
  imageWidth?: number;
  imageHeight?: number;
}

export function ItemHowItWorks({
  title,
  description,
  features,
  imageSrc,
  imageLeft = false,
  imageWidth,
  imageHeight,
}: ItemHowItWorksProps) {
  return (
    <div
      className={`flex flex-col ${
        imageLeft
          ? "lg:flex-row-reverse xl:flex-row-reverse"
          : "lg:flex-row xl:flex-row"
      } gap-12 lg:gap-0 xl:gap-0 justify-between items-center`}
    >
      <div className="w-full max-w-2xl mb-16">
        <h2 className="text-3xl xl:text-4xl font-semibold text-gray-900 -tracking-[0.72px] mb-5">
          {title}
        </h2>
        <p className="text-lg xl:text-xl text-gray-600 mb-8">{description}</p>

        <div className="flex flex-col gap-5 pl-8 xl:pl-4 lg:pl-4">
          {features.map((feature, index) => (
            <div key={index} className="flex gap-3">
              <Image width={28} height={28} src="/check-icon.svg" alt="check" />
              <p className="text-lg/relaxed xl:text-xl text-gray-600 text-start">
                {feature}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="hidden xl:block lg:block">
        <Image
          width={imageWidth}
          height={imageHeight}
          src={imageSrc}
          alt="feature-image"
        />
      </div>
    </div>
  );
}
