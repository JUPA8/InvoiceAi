import { ChevronRight } from "lucide-react";
import { GridContainer } from "../GridContainer";
import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section
      id="home"
      className="py-16 xl:pt-24 xl:pb-0 bg-[url('/background.svg')] bg-cover bg-center"
    >
      <GridContainer>
        <div className="text-center flex flex-col items-center mb-16">
          <h1 className="text-4xl xl:text-6xl font-bold text-gray-900 mt-4 mb-6">
            Beautifully Simple Invoice <br /> Automation.
          </h1>
          <p className="text-lg/relaxed xl:text-xl/6 text-gray-600 max-w-3xl mx-auto mb-12">
            Powerful, self-serve product and growth analytics to help you
            convert, engage, and retain more users. Trusted by over 4,000
            startups.
          </p>
          <Link href="/login">
            <button className="w-full sm:w-auto xl:w-auto flex items-center justify-center gap-3 py-4 px-7 bg-[#11A193] rounded-lg text-lg font-medium text-white hover:bg-[#116E65] transition-colors cursor-pointer">
              Get started
              <ChevronRight />
            </button>
          </Link>
        </div>

        <Image
          src="/macbook.svg"
          width={768}
          height={448}
          alt="mac"
          className="hidden md:block xl:block mx-auto"
        />

        <Image
          src="/macbook-mobile.svg"
          width={343}
          height={280}
          alt="mac mobile"
          className="block md:hidden xl:hidden mx-auto"
        />
      </GridContainer>
    </section>
  );
}
