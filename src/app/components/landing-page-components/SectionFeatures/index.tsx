"use client";

import { GridContainer } from "../GridContainer";
import { ItemFeature } from "./ItemFeature";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faCircleCheck,
  faClock,
  faLink,
  faShield,
  faShieldHalved,
  faThumbTack,
  faZap,
} from "@fortawesome/free-solid-svg-icons";


export function Features() {
  return (
    <section id="features" className="pt-16 xl:pt-24 mb-12">
      <GridContainer>
        <div className="text-center mb-20 mxl:b-16">
          <span className="inline-block py-1 px-3 mb-6 bg-[#11A193] rounded-2xl text-sm/snug text-white">
            Features
          </span>
          <h2 className="text-3xl xl:text-4xl font-semibold text-gray-900 mt-4 mb-6">
            Smarter Invoicing Starts Here
          </h2>
          <p className="mx-auto text-lg/relaxed xl:text-xl/normal text-gray-600 max-w-3xl">
            Discover the AI-powered features that automate, simplify, and speed
            up your entire invoicing process — so your team can focus on growth.
          </p>
        </div>

        <div className="grid grid-cols-1 justify-items-center md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-x-10 gap-y-12 xl:gap-y-20 justify-items-center">
          <ItemFeature
            icon={
              <FontAwesomeIcon
                icon={faZap}
                size="2x"
                className="text-[#11A193]"
              />
            }
            title="1. Automated Data Extraction"
            description="Use AI to instantly capture and organize invoice data from PDFs, scans, and emails — no manual entry required."
          />

          <ItemFeature
            icon={
              <FontAwesomeIcon
                icon={faCircleCheck}
                size="2x"
                className="text-[#11A193]"
              />
            }
            title="2. Smart Approval Flows"
            description="Route invoices to the right people, set custom rules, and keep your approval process fast and compliant."
          />

          <ItemFeature
            icon={
              <FontAwesomeIcon
                icon={faChartLine}
                size="2x"
                className="text-[#11A193]"
              />
            }
            title="3. Real-Time Financial Insights"
            description="Track invoice statuses, cash flow, and trends with intelligent dashboards that update as fast as you move."
          />

          <ItemFeature
            icon={
              <FontAwesomeIcon
                icon={faLink}
                size="2x"
                className="text-[#11A193]"
              />
            }
            title="4. Seamless Integrations"
            description="Connect with your ERP, CRM, or accounting tools in just a few clicks — no dev team needed."
          />

          <ItemFeature
            icon={
              <FontAwesomeIcon
                icon={faShieldHalved}
                size="2x"
                className="text-[#11A193]"
              />
            }
            title="5. AI-Powered Fraud Detection"
            description="Detect duplicates, non-compliant charges, and suspicious vendors automatically before payments go out."
          />

          <ItemFeature
            icon={
              <FontAwesomeIcon
                icon={faClock}
                size="2x"
                className="text-[#11A193]"
              />
            }
            title="6. Accelerated Payments"
            description="Automate vendor communication and schedule payments to keep your partners happy and your cash flow healthy."
          />
        </div>
      </GridContainer>
    </section>
  );
}
