"use client";
import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";

export default function PricingTable() {
  const [selectedPlan, setSelectedPlan] = useState("Business");

  const plans = [
    { name: "Free", price: "14 days" },
    { name: "Starter", price: "$19/mo" },
    { name: "Pro", price: "$49/mo" },
    { name: "Business", price: "$99/mo" },
    { name: "Enterprise", price: "Custom" },
  ];

  const features = [
    { name: "Smart OCR", values: [true, true, true, true, true] },
    {
      name: "Mobile Capture (Photo Upload)",
      values: [true, true, true, true, true],
    },
    { name: "PDF Upload & Parsing", values: [true, true, true, true, true] },
    {
      name: "Automatic Categorization",
      values: [true, "Limited", true, true, true],
    },
    { name: "Custom Categories", values: [true, false, true, true, true] },
    { name: "AI Cost Classification", values: [true, false, true, true, true] },
    { name: "Tax Summary PDF", values: [true, false, true, true, true] },
    { name: "Auto Tax Declaration", values: [true, false, true, true, true] },
    { name: "Audit Trail", values: [true, false, true, true, true] },
    { name: "One-Click Payments", values: [true, false, true, true, true] },
    {
      name: "Scheduled Auto-Payments",
      values: [true, false, false, true, true],
    },
    {
      name: "Payment Link Generator",
      values: [true, false, false, true, true],
    },
    {
      name: "QuickBooks, Xero, Stripe Integration",
      values: [true, false, true, true, true],
    },
    { name: "API Access", values: [true, false, true, true, true] },
    {
      name: "Custom Integration Support",
      values: [true, false, false, "Limited", true],
    },
    { name: "User Seats", values: ["Unlimited", "1", "1", "10", "Unlimited"] },
    { name: "Live Chat Support", values: [true, "Limited", true, true, true] },
    {
      name: "Dedicated Success Manager",
      values: [true, false, false, false, true],
    },
    { name: "SLA & Compliance", values: [true, false, false, false, true] },
  ];

  const renderValue = (value: boolean | string) => {
    if (value === true)
      return <FontAwesomeIcon icon={faCheck} className="text-green-500" />;
    if (value === false)
      return <FontAwesomeIcon icon={faTimes} className="text-red-500" />;
    return <span className="text-gray-600">{value}</span>;
  };

  return (
    <section className="pb-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Mobile - Slider */}
        <div className="block lg:hidden">
          <Swiper
            modules={[Pagination]}
            pagination={{ clickable: true }}
            spaceBetween={16}
            slidesPerView={1}
          >
            {plans.map((plan) => {
              const isSelected = plan.name === selectedPlan;
              return (
                <SwiperSlide key={plan.name}>
                  <div
                    className={`bg-white shadow-sm rounded-lg p-8 ${
                      isSelected ? "border-2 border-[#11A193]" : "border border-slate-200"
                    }`}
                  >
                    <div className="text-xl text-[#181D27] font-semibold text-center">
                      {plan.name}
                    </div>
                    <div className="text-2xl font-bold text-blue-600 text-center mt-1">
                      {plan.price}
                    </div>
                    
                    <ul className="mt-4 space-y-2 text-base text-[#535862]">
                      {features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex justify-between pt-2"
                        >
                          <span>{feature.name}</span>
                          {renderValue(feature.values[plans.indexOf(plan)])}
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => setSelectedPlan(plan.name)}
                      className={`mt-10 mb-10 w-full px-4 py-2 rounded ${
                        isSelected
                          ? "bg-[#11A193] text-white hover:bg-blue-700 cursor-pointer"
                          : "bg-[#D1E9FE] text-[#11A193] font-semibold hover:bg-gray-300 cursor-pointer"
                      }`}
                    >
                      {isSelected ? "Selected" : "Select"}
                    </button>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>

        {/* Desktop - Table */}
        <div className="hidden lg:block">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left p-4 border-b border-[#E9EAEB]"></th>
                {plans.map((plan) => {
                  const isSelected = plan.name === selectedPlan;
                  return (
                    <th
                      key={plan.name}
                      className={`text-start p-4 border-b border-[#E9EAEB] ${
                        isSelected ? "bg-[#F3F3F3]" : ""
                      }`}
                    >
                      <div className="text-lg font-semibold">{plan.name}</div>
                      <div className="text-3xl font-bold text-[#181D27] mt-1">
                        {plan.price}
                      </div>
                      <button
                        onClick={() => setSelectedPlan(plan.name)}
                        className={`mt-3 px-6 py-2 rounded-lg w-full ${
                          isSelected
                            ? "bg-[#11A193] text-white font-medium hover:bg-blue-70 cursor-pointer"
                            : "bg-[#CFECE9] text-[#11A193] font-medium hover:bg-gray-300 cursor-pointer" 
                        }`}
                      >
                        {isSelected ? "Selected" : "Select"}
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {features.map((feature, featureIdx) => (
                <tr key={feature.name}>
                  <td className="p-3 border-t border-[#E9EAEB] text-base font-medium text-[#535862] text-left">
                    {feature.name}
                  </td>
                  {feature.values.map((value, index) => {
                    const isSelected = plans[index].name === selectedPlan;
                    return (
                      <td
                        key={index}
                        className={`text-center p-3 border-t border-[#E9EAEB] ${
                          isSelected ? "bg-[#F3F3F3]" : ""
                        }`}
                      >
                        {renderValue(value)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-center mt-12">
          <button className="w-1/2 px-6 py-3 bg-[#11A193] text-white rounded hover:bg-[#116E65] cursor-pointer rounded-lg">
            Continue
          </button>
        </div>
      </div>
    </section>
  );
}
