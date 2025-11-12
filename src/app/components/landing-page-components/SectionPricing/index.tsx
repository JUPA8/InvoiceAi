import { GridContainer } from "../GridContainer";
import PricingTable from "./PricingTable";

export function Pricing() {
  return (
    <section id="pricing">
      <GridContainer>
        <div className="text-center mb-20 mxl:b-16">
          <span className="inline-block py-1 px-3 mb-6 bg-[#11A193] rounded-2xl text-sm/snug text-white">
            Pricing
          </span>
          <h2 className="text-3xl xl:text-4xl font-semibold text-gray-900 mt-4 mb-6">
            Find Your Perfect Plan
          </h2>
          <p className="mx-auto text-lg/relaxed xl:text-xl/normal text-gray-600 max-w-3xl">
            Choose the plan that fits your needs today and upgrade anytime as
            your business evolves.
          </p>
        </div>

        <PricingTable />
      </GridContainer>
      
    </section>
  );
}
