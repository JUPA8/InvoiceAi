import Link from "next/link";
import { GridContainer } from "../GridContainer";

export function Trial() {
  return (
    <section className="py-16 xl:py-24 bg-gray-50">
      <GridContainer className="text-center">
        <h2 className="text-3xl xl:text-4xl font-semibold text-gray-900 mb-5">
          Start your 14-day free trial
        </h2>
        <p className="text-lg/relaxed xl:text-xl/6 text-gray-600 mb-10">
          Join over 4,000+ startups already growing with Invoice AI.
        </p>
        <div className="flex flex-col-reverse sm:flex-row xl:flex-row w-full xl:w-auto gap-3 justify-center">
          {/* <button className="py-3 px-4 bg-white border border-gray-300 rounded-lg text-gray-700 font-semibold leading-normal hover:bg-gray-100 transition-colors cursor-pointer">
            Learn more
          </button> */}

          <Link href="/login">
            <button className="py-3 px-4 bg-[#11A193] rounded-lg text-white font-semibold leading-normal hover:bg-[#116E65] transition-colors cursor-pointer">
              Get started
            </button>
          </Link>
        </div>
      </GridContainer>
    </section>
  );
}
