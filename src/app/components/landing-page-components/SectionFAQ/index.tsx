import { GridContainer } from "../GridContainer";
import { Question } from "./Question";

export function FAQ() {
  return (
    <section id="faq" className="pt-16 xl:pt-24 pb-16 w-full">
      <GridContainer>
        <div className="text-center mb-20 mxl:b-16">
          <span className="inline-block py-1 px-3 mb-6 bg-[#11A193] rounded-2xl text-sm/snug text-white">
            FAQ
          </span>
          <h2 className="text-3xl xl:text-4xl font-semibold text-gray-900 mt-4 mb-6">
            Got Questions? We’ve Got Answers
          </h2>
          <p className="mx-auto text-lg/relaxed xl:text-xl/normal text-gray-600 max-w-3xl">
            Everything you need to know about AI-powered invoicing and
            automating your billing processes.
          </p>
        </div>
        <div className="w-full max-w-3xl mx-auto">
          <Question
            title="What is Invoice AI?"
            response="Invoice AI is a smart invoicing platform that uses artificial intelligence to automate and streamline the entire billing and transaction process for businesses of all sizes."
          />
          <Question
            title="How does the AI automation work?"
            response="Our AI scans, processes, and validates invoice data, reducing manual input and human error. It learns from past data to improve accuracy and speed over time."
          />
          <Question
            title="Is Invoice AI suitable for small businesses?"
            response="Absolutely. Invoice AI is designed to scale with your business, offering flexible tools that support both startups and large enterprises."
          />
          <Question
            title="Can Invoice AI integrate with my existing software?"
            response="Yes. We offer seamless integrations with popular ERP systems, accounting software, and cloud platforms like SAP, Oracle, Microsoft Dynamics, and more."
          />
          <Question
            title="Can I try Invoice AI before committing?"
            response="Of course! You can request a free demo to explore how Invoice AI fits your business needs."
          />
        </div>
      </GridContainer>
    </section>
  );
}
