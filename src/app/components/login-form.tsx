"use client";

import Link from "next/link";
import Image from "next/image";
import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import { cn } from "@/lib/utils";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "../actions/auth";
import { PasswordInput } from "./password-input";

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className={cn(
        "w-full bg-gradient-to-r from-[#11A193] to-[#0C3951] hover:from-[#11A193]/90 hover:to-[#0C3951]/90 cursor-pointer text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
      )}
      aria-disabled={pending}
      disabled={pending}
    >
      {pending ? "Signing in..." : "Login"}
    </Button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useActionState(login, null);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
        {/* Left Panel - Hero Section */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#11A193] via-[#0C3951] to-[#0C3951]" />
          <div className="absolute inset-0 bg-black/10" />

          {/* Decorative elements */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl" />
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-white/10 rounded-full blur-xl" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Image
                  src="/logo-wize-invoice.svg"
                  alt="logo"
                  width={24}
                  height={24}
                />
              </div>
              <span className="text-2xl font-bold">Invoice AI</span>
            </div>

            {/* Hero Content */}
            <div className="flex-1 flex flex-col justify-center items-center text-center py-16">
              <div className="mb-8 p-8 bg-white/10 backdrop-blur-sm rounded-3xl">
                <Image
                  src="/invoices.svg"
                  alt="invoices"
                  width={400}
                  height={300}
                  className="mx-auto"
                />
              </div>
              <h2 className="text-2xl font-bold mb-4 leading-tight">
                AI-powered. Time-saving. Stress-free.
              </h2>
              <p className="text-xl text-white/80 max-w-md">
                Transform your invoicing workflow with intelligent automation
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                  <Image
                    src="/logo-wize-invoice.svg"
                    alt="logo"
                    width={30}
                    height={30}
                  />
                </div>
                <span className="text-3xl font-bold text-[#0C3951]">
                  Invoice <span className="text-[#11A193]">AI</span>
                </span>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="flex justify-end mb-8">
              <Link
                href="/create-account"
                className={cn(
                  "text-sm font-medium text-[#11A193] hover:text-[#11A193]/80 transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-[#11A193]/5"
                )}
              >
                Sign Up
              </Link>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200/50">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  Welcome back
                </h1>
                <p className="text-slate-600">
                  Enter your credentials to access your account
                </p>
              </div>

              {/* Form */}
              <form action={formAction} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    placeholder="name@example.com"
                    type="email"
                    autoComplete="email"
                    required
                    className="h-12 rounded-xl border-slate-300 focus:border-[#11A193] focus:ring-[#11A193] transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="password"
                      className="text-slate-700 font-medium"
                    >
                      Password
                    </Label>
                    <Link
                      href="/reset-password"
                      className="text-sm text-[#11A193] hover:text-[#11A193]/80 font-medium transition-colors duration-200"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <PasswordInput
                    id="password"
                    name="password"
                    required
                    className="h-12 rounded-xl border-slate-300 focus:border-[#11A193] focus:ring-[#11A193] transition-all duration-200"
                  />
                </div>

                <div className="pt-2">
                  <LoginButton />
                </div>

                {state?.success === false && state.message && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm font-medium text-red-600 text-center">
                      {state.message}
                    </p>
                  </div>
                )}
              </form>

              {/* Sign Up Link */}
              <div className="mt-8 text-center">
                <p className="text-slate-600">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/create-account"
                    className="font-medium text-[#11A193] hover:text-[#11A193]/80 transition-colors duration-200"
                  >
                    Sign up for free
                  </Link>
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-slate-500 text-sm">
              <p>© 2025 Invoice AI. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
