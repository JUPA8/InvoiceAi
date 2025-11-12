"use client";

import { GridContainer } from "../GridContainer";
import { ItemHowItWorks } from "./ItemHowItWorks";

const sections = [
  {
    title: "Capture and extract invoice data",
    description:
      "Take a photo of your invoice with your phone or upload a PDF or image file. AI Invoice immediately reads and extracts all key information, organizing it accurately without any manual effort. Fast, simple, and error-free.",
    features: [
      "No manual data entry",
      "Capture invoices anywhere, anytime",
      "Faster and more accurate processing",
    ],
    imageSrc: "/how-it-works-1.svg",
    imageLeft: false,
    imageWidth: 377,
    imageHeight: 445,
  },
  {
    title: "Automate expense management",
    description:
      "Seamlessly integrate with your accounting software and eliminate the hassle of manual uploads. Our AI ensures every transaction is recorded accurately and instantly.",
    features: [
      "Connect with accounting tools",
      "Automatic categorization",
      "Reduce human error",
    ],
    imageSrc: "/how-it-works-2.svg",
    imageLeft: true,
    imageWidth: 458,
    imageHeight: 398,
  },
  {
    title: "Gain real-time insights",
    description:
      "Visualize your expenses in real time and make informed business decisions with AI-powered analytics and dashboards.",
    features: [
      "Real-time dashboards",
      "Customizable reports",
      "AI-powered insights",
    ],
    imageSrc: "/how-it-works-3.svg",
    imageLeft: false,
    imageWidth: 578,
    imageHeight: 360,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works">
      <GridContainer>
        <div className="text-center py-16 xl:py-24">
          <span className="inline-block py-1 px-3 mb-6 bg-[#11A193] rounded-2xl text-sm/snug text-white">
            How it Works
          </span>
          <h2 className="text-3xl xl:text-4xl font-semibold text-gray-900 mt-4 mb-6">
            Simple Steps. Powerful Results.
          </h2>
          <p className="mx-auto text-lg/relaxed xl:text-xl/normal text-gray-600 max-w-3xl">
            From capturing invoices to automated payments, see how we simplify
            your workflow in just a few steps.
          </p>
        </div>

        <div className="space-y-0 xl:space-y-30 lg:space-y-30 text-center lg:text-start xl:text-start">
          {sections.map((section, index) => (
            <ItemHowItWorks
              key={index}
              title={section.title}
              description={section.description}
              features={section.features}
              imageSrc={section.imageSrc}
              imageLeft={section.imageLeft}
              imageWidth={section.imageWidth}
              imageHeight={section.imageHeight}
            />
          ))}
        </div>
      </GridContainer>
    </section>
  );
}
