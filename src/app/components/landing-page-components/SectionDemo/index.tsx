"use client";

import { Calendar, Check, AlertCircle } from "lucide-react";
import { useState, useActionState } from "react";
import { submitDemoRequest } from "@/app/actions/demo";

export function DemoSection() {
  const [isDemoSubmitted, setIsDemoSubmitted] = useState(false);
  const [state, formAction, isPending] = useActionState(
    submitDemoRequest,
    null
  );

  if (state?.success && !isDemoSubmitted) {
    setIsDemoSubmitted(true);
  }

  const resetForm = () => {
    setIsDemoSubmitted(false);
  };

  return (
    <section id="book-a-demo" className="pt-16 xl:pt-24 mb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 xl:mb-16">
          <span className="inline-block py-1 px-3 mb-6 bg-[#11A193] rounded-2xl text-sm/snug text-white">
            Book a Demo
          </span>
          <h2 className="text-3xl xl:text-4xl font-semibold text-gray-900 mt-4 mb-6">
            See Invoice AI in Action
          </h2>
          <p className="mx-auto text-lg/relaxed xl:text-xl/normal text-gray-600 max-w-3xl">
            Schedule a demo and discover how Invoice AI can transform your
            business workflow.
          </p>
        </div>

        <div className="bg-gray-50 rounded-3xl shadow-xl p-8 md:p-12">
          {isDemoSubmitted ? (
            <div className="text-center py-12">
              <Calendar className="w-20 h-20 text-[#11A193] mx-auto mb-6" />
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Demo Request Received!
              </h3>
              <p className="text-xl text-gray-600 mb-8">
                Our team will contact you within 24 hours to schedule your demo.
              </p>
              <div className="inline-flex items-center px-6 py-3 bg-blue-50 rounded-lg text-[#11A193] font-medium mb-6">
                <Check className="w-5 h-5 mr-2" />
                We'll be in touch soon
              </div>
            </div>
          ) : (
            <form action={formAction} className="space-y-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Request Your Demo
                </h3>
                <p className="text-gray-600">
                  Tell us about your needs and we'll customize the demo for you
                </p>
              </div>

              {state && !state.success && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-red-700 text-sm">
                    {state.message}
                    {state.errors && (
                      <ul className="mt-2 list-disc list-inside">
                        {Object.entries(state.errors).map(([field, errors]) => (
                          <li key={field}>
                            {Array.isArray(errors) ? errors.join(", ") : errors}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {state?.success && !isDemoSubmitted && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-green-700 text-sm">{state.message}</div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                    disabled={isPending}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                    disabled={isPending}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    placeholder="Enter your mobile number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                    disabled={isPending}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Preferred Contact Method
                  </label>
                  <select
                    name="favoritConnectionMethod"
                    defaultValue="Email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    disabled={isPending}
                  >
                    <option value="Email">Email</option>
                    <option value="Phone">Phone</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="SMS">SMS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  placeholder="Tell us about your current invoice process and what you'd like to see in the demo..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  disabled={isPending}
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-[#11A193] cursor-pointer text-white py-4 px-8 rounded-lg font-semibold text-lg hover:bg-[#116E65] transform hover:scale-[1.02] transition-all duration-200 shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Calendar className="w-5 h-5 mr-2" />
                {isPending ? "Submitting..." : "Request Demo"}
              </button>

              <p className="text-sm text-gray-500 text-center">
                Our team typically responds within 24 hours to schedule your
                personalized demo.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
