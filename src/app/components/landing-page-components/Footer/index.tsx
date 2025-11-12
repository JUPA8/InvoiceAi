import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faCheck,
  faEnvelope,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
import {
  faFacebook,
  faInstagram,
  faLinkedin,
} from "@fortawesome/free-brands-svg-icons";
import { GridContainer } from "../GridContainer";

export function Footer() {
  return (
    <footer className="py-12 xl:pt-16">
      <GridContainer>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8">
            <div className="max-w-md">
              <span className="text-2xl font-bold text-[#0C3951]">Invoice <span className="text-[#11A193]">AI</span></span>
              <p className="text-gray-600 text-sm">
                AI Invoice – The leading invoicing automation platform based in
                Germany, trusted by startups, SMEs, and large enterprises
                worldwide.
              </p>
            </div>

            <div className="flex flex-col gap-4 text-gray-900">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faEnvelope} className="text-[#11A193]" />
                <span className="text-sm">info@invoiceai.com</span>
              </div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faPhone} className="text-[#11A193]" />
                <span className="text-sm">(001) 1231 3435</span>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <a href="#" className="text-gray-700 hover:text-gray-900">
                  <FontAwesomeIcon
                    icon={faLinkedin}
                    className="text-[#0C3951]"
                  />
                </a>
                <a href="#" className="text-gray-700 hover:text-gray-900">
                  <FontAwesomeIcon
                    icon={faInstagram}
                    className="text-[#0C3951]"
                  />
                </a>
                <a href="#" className="text-gray-700 hover:text-gray-900">
                  <FontAwesomeIcon
                    icon={faFacebook}
                    className="text-[#0C3951]"
                  />
                </a>
              </div>
            </div>
          </div>

          <hr className="my-8 border-gray-300" />

          <div className="flex flex-col md:flex-row md:justify-between md:items-center text-sm text-gray-600 gap-4">
            <div className="flex flex-wrap gap-4">
              <a id="home" href="#" className="hover:text-gray-900">
                Home
              </a>
              <a id="features" href="#" className="hover:text-gray-900">
                Features
              </a>
              <a id="how-it-works" href="#" className="hover:text-gray-900">
                How it Works
              </a>
              <a id="pricing" href="#" className="hover:text-gray-900">
                Pricing
              </a>
              <a id="faq" href="#" className="hover:text-gray-900">
                FAQ
              </a>
            </div>
            <p className="text-xs text-gray-500 mt-2 md:mt-0">
              © 2025 Invoice AI – All Right Reserved
            </p>
          </div>
        </div>
      </GridContainer>
    </footer>
  );
}
