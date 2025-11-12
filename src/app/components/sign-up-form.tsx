"use client";

import { useFormStatus } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionState, useState, useEffect } from "react";
import { signup, requestOtp, validateOtp } from "../actions/auth";
import { PasswordInput } from "./password-input";
import { useRouter } from "next/navigation";

function SignUpButton({ isVerified }: { isVerified: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className={cn(
        "w-full bg-gradient-to-r from-[#11A193] to-[#0C3951] hover:from-[#11A193]/90 hover:to-[#0C3951]/90 cursor-pointer text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
      )}
      aria-disabled={pending || !isVerified}
      disabled={pending || !isVerified}
    >
      {pending ? "Creating account..." : "Create account"}
    </Button>
  );
}

function CheckmarkIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function SignUpPage() {
  const [state, formAction] = useActionState(signup, null);
  const router = useRouter();

  // ALL FORM FIELDS MANAGED WITH STATE
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [emailOtp, setEmailOtp] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");

  const [isEmailOtpSent, setIsEmailOtpSent] = useState(false);
  const [isPhoneOtpSent, setIsPhoneOtpSent] = useState(false);

  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  const [verificationStatus, setVerificationStatus] = useState({
    email: { loading: false, message: "", error: false },
    phone: { loading: false, message: "", error: false },
    emailOtp: { loading: false, message: "", error: false },
    phoneOtp: { loading: false, message: "", error: false },
  });

  // Handle successful account creation
  useEffect(() => {
    if (state?.success === true && state?.redirect) {
      // Show success message and redirect after a short delay
      setTimeout(() => {
        router.push(
          `${state.redirect}?message=${encodeURIComponent(state.message)}`
        );
      }, 1000);
    }
  }, [state, router]);

  // CUSTOM FORM SUBMISSION HANDLER
  const handleFormSubmit = async (formData: FormData) => {
    console.log("🎯 Form submission started");

    // Ensure all form data is set properly
    formData.set("firstName", firstName);
    formData.set("lastName", lastName);
    formData.set("email", email);
    formData.set("countryCode", countryCode);
    formData.set("phoneNumber", phone);
    formData.set("password", password);
    formData.set("confirmPassword", confirmPassword);
    formData.set("emailVerified", isEmailVerified ? "true" : "false");
    formData.set("phoneVerified", isPhoneVerified ? "true" : "false");

    console.log("📝 Form data being submitted:", {
      firstName,
      lastName,
      email,
      countryCode,
      phoneNumber: phone,
      emailVerified: isEmailVerified,
      phoneVerified: isPhoneVerified,
      passwordLength: password.length,
    });

    // Call the server action
    await formAction(formData);
  };

  const handleRequestOtp = async (type: "email" | "phone") => {
    let identifier: string;
    const otpType =
      type === "email" ? "Email Confirmation" : "Phone Number Confirmation";

    if (type === "email") {
      if (!email || !email.includes("@")) {
        setVerificationStatus((prev) => ({
          ...prev,
          [type]: {
            loading: false,
            message: "Please enter a valid email address.",
            error: true,
          },
        }));
        return;
      }
      identifier = email;
    } else {
      if (!countryCode || !phone) {
        setVerificationStatus((prev) => ({
          ...prev,
          [type]: {
            loading: false,
            message: "Please enter both country code and phone number.",
            error: true,
          },
        }));
        return;
      }
      const sanitizedCountryCode = countryCode.startsWith("+")
        ? countryCode
        : `+${countryCode.replace(/\D/g, "")}`;
      const sanitizedPhone = phone.replace(/[\s-()]/g, "");
      identifier = `${sanitizedCountryCode}${sanitizedPhone}`;
    }

    setVerificationStatus((prev) => ({
      ...prev,
      [type]: { loading: true, message: "Sending code...", error: false },
    }));

    const result = await requestOtp(identifier, otpType);

    setVerificationStatus((prev) => ({
      ...prev,
      [type]: {
        loading: false,
        message: result.message,
        error: !result.success,
      },
    }));

    if (result.success) {
      if (type === "email") setIsEmailOtpSent(true);
      else setIsPhoneOtpSent(true);
    }
  };

  const handleValidateOtp = async (type: "email" | "phone") => {
    let identifier: string;
    const otp = type === "email" ? emailOtp : phoneOtp;
    const otpType =
      type === "email" ? "Email Confirmation" : "Phone Number Confirmation";
    const statusKey = type === "email" ? "emailOtp" : "phoneOtp";

    if (!otp || otp.length < 4) {
      setVerificationStatus((prev) => ({
        ...prev,
        [statusKey]: {
          loading: false,
          message: "Please enter a valid verification code.",
          error: true,
        },
      }));
      return;
    }

    if (type === "email") {
      identifier = email;
    } else {
      const sanitizedCountryCode = countryCode.startsWith("+")
        ? countryCode
        : `+${countryCode.replace(/\D/g, "")}`;
      const sanitizedPhone = phone.replace(/[\s-()]/g, "");
      identifier = `${sanitizedCountryCode}${sanitizedPhone}`;
    }

    setVerificationStatus((prev) => ({
      ...prev,
      [statusKey]: { loading: true, message: "Verifying...", error: false },
    }));

    const result = await validateOtp(identifier, otp, otpType);

    setVerificationStatus((prev) => ({
      ...prev,
      [statusKey]: {
        loading: false,
        message: result.message,
        error: !result.success,
      },
    }));

    if (result.success) {
      if (type === "email") setIsEmailVerified(true);
      else setIsPhoneVerified(true);
    }
  };

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
                  src="/create-account.svg"
                  alt="create account"
                  width={400}
                  height={300}
                  className="mx-auto"
                />
              </div>
              <h2 className="text-4xl font-bold mb-4 leading-tight">
                Smarter invoicing is just
                <br />a few clicks away.
              </h2>
              <p className="text-xl text-white/80 max-w-md">
                Join thousands of businesses streamlining their invoicing
                process
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel - Sign Up Form */}
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

            {/* Login Link */}
            <div className="flex justify-end mb-8">
              <Link
                href="/login"
                className={cn(
                  "text-sm font-medium text-[#11A193] hover:text-[#11A193]/80 transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-[#11A193]/5"
                )}
              >
                Login
              </Link>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200/50">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  Create an account
                </h1>
                <p className="text-slate-600">
                  Enter your details below to create your account
                </p>
              </div>

              {/* Form */}
              <form action={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label
                      htmlFor="firstName"
                      className="text-slate-700 font-medium"
                    >
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="John"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="h-12 rounded-xl border-slate-300 focus:border-[#11A193] focus:ring-[#11A193] transition-all duration-200"
                    />
                    {state?.errors?.firstName && (
                      <p className="text-sm font-medium text-destructive">
                        {state.errors.firstName[0]}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label
                      htmlFor="lastName"
                      className="text-slate-700 font-medium"
                    >
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Doe"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="h-12 rounded-xl border-slate-300 focus:border-[#11A193] focus:ring-[#11A193] transition-all duration-200"
                    />
                    {state?.errors?.lastName && (
                      <p className="text-sm font-medium text-destructive">
                        {state.errors.lastName[0]}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email Verification */}
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-slate-700 font-medium">
                    Email
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="email"
                      name="email"
                      placeholder="name@example.com"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isEmailVerified}
                      className="h-12 rounded-xl border-slate-300 focus:border-[#11A193] focus:ring-[#11A193] transition-all duration-200"
                    />
                    {!isEmailVerified && (
                      <Button
                        type="button"
                        onClick={() => handleRequestOtp("email")}
                        disabled={
                          isEmailOtpSent ||
                          verificationStatus.email.loading ||
                          !email
                        }
                        className="bg-[#11A193] hover:bg-[#11A193]/90 text-white px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer"
                      >
                        {verificationStatus.email.loading ? "..." : "Verify"}
                      </Button>
                    )}
                  </div>
                  {state?.errors?.email && (
                    <p className="text-sm font-medium text-destructive">
                      {state.errors.email[0]}
                    </p>
                  )}
                  {verificationStatus.email.message && !isEmailVerified && (
                    <p
                      className={`text-sm mt-2 ${
                        verificationStatus.email.error
                          ? "text-red-500"
                          : "text-green-600"
                      }`}
                    >
                      {verificationStatus.email.message}
                    </p>
                  )}
                </div>

                {isEmailVerified && (
                  <div className="flex items-center gap-2 text-sm font-medium text-green-600 bg-green-50 p-3 rounded-xl border border-green-200">
                    <CheckmarkIcon />
                    <span>Email successfully verified!</span>
                  </div>
                )}

                {isEmailOtpSent && !isEmailVerified && (
                  <div className="grid gap-2">
                    <Label
                      htmlFor="emailOtp"
                      className="text-slate-700 font-medium"
                    >
                      Email Verification Code
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="emailOtp"
                        name="emailOtp"
                        placeholder="123456"
                        value={emailOtp}
                        onChange={(e) => setEmailOtp(e.target.value)}
                        className="h-12 rounded-xl border-slate-300 focus:border-[#11A193] focus:ring-[#11A193] transition-all duration-200"
                      />
                      <Button
                        type="button"
                        onClick={() => handleValidateOtp("email")}
                        disabled={
                          verificationStatus.emailOtp.loading || !emailOtp
                        }
                        className="bg-[#11A193] hover:bg-[#11A193]/90 text-white px-4 py-3 rounded-xl transition-all duration-200"
                      >
                        {verificationStatus.emailOtp.loading ? "..." : "Check"}
                      </Button>
                    </div>
                    {verificationStatus.emailOtp.message && (
                      <p
                        className={`text-sm mt-2 ${
                          verificationStatus.emailOtp.error
                            ? "text-red-500"
                            : "text-green-600"
                        }`}
                      >
                        {verificationStatus.emailOtp.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Phone Verification */}
                <div className="grid gap-2">
                  <Label className="text-slate-700 font-medium">
                    Phone Number
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="grid gap-2 col-span-1">
                      <Label htmlFor="countryCode" className="sr-only">
                        Country Code
                      </Label>
                      <Input
                        id="countryCode"
                        name="countryCode"
                        placeholder="+1"
                        required
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        disabled={isPhoneVerified}
                        className="h-12 rounded-xl border-slate-300 focus:border-[#11A193] focus:ring-[#11A193] transition-all duration-200"
                      />
                    </div>
                    <div className="grid gap-2 col-span-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="phoneNumber" className="sr-only">
                          Phone Number
                        </Label>
                        <Input
                          id="phoneNumber"
                          name="phoneNumber"
                          placeholder="234 567 890"
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          disabled={isPhoneVerified}
                          className="h-12 rounded-xl border-slate-300 focus:border-[#11A193] focus:ring-[#11A193] transition-all duration-200"
                        />
                        {!isPhoneVerified && (
                          <Button
                            type="button"
                            onClick={() => handleRequestOtp("phone")}
                            disabled={
                              isPhoneOtpSent ||
                              verificationStatus.phone.loading ||
                              !countryCode ||
                              !phone
                            }
                            className="bg-[#11A193] hover:bg-[#11A193]/90 text-white px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer"
                          >
                            {verificationStatus.phone.loading
                              ? "..."
                              : "Verify"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  {(state?.errors?.countryCode ||
                    state?.errors?.phoneNumber) && (
                    <p className="text-sm font-medium text-destructive">
                      {state.errors.countryCode?.[0] ||
                        state.errors.phoneNumber?.[0]}
                    </p>
                  )}
                  {verificationStatus.phone.message && !isPhoneVerified && (
                    <p
                      className={`text-sm -mt-2 ${
                        verificationStatus.phone.error
                          ? "text-red-500"
                          : "text-green-600"
                      }`}
                    >
                      {verificationStatus.phone.message}
                    </p>
                  )}
                </div>

                {isPhoneVerified && (
                  <div className="flex items-center gap-2 text-sm font-medium text-green-600 bg-green-50 p-3 rounded-xl border border-green-200">
                    <CheckmarkIcon />
                    <span>Phone number successfully verified!</span>
                  </div>
                )}

                {isPhoneOtpSent && !isPhoneVerified && (
                  <div className="grid gap-2">
                    <Label
                      htmlFor="phoneOtp"
                      className="text-slate-700 font-medium"
                    >
                      Phone Verification Code
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="phoneOtp"
                        name="phoneOtp"
                        placeholder="123456"
                        value={phoneOtp}
                        onChange={(e) => setPhoneOtp(e.target.value)}
                        className="h-12 rounded-xl border-slate-300 focus:border-[#11A193] focus:ring-[#11A193] transition-all duration-200"
                      />
                      <Button
                        type="button"
                        onClick={() => handleValidateOtp("phone")}
                        disabled={
                          verificationStatus.phoneOtp.loading || !phoneOtp
                        }
                        className="bg-[#11A193] hover:bg-[#11A193]/90 text-white px-4 py-3 rounded-xl transition-all duration-200"
                      >
                        {verificationStatus.phoneOtp.loading ? "..." : "Check"}
                      </Button>
                    </div>
                    {verificationStatus.phoneOtp.message && (
                      <p
                        className={`text-sm mt-2 ${
                          verificationStatus.phoneOtp.error
                            ? "text-red-500"
                            : "text-green-600"
                        }`}
                      >
                        {verificationStatus.phoneOtp.message}
                      </p>
                    )}
                  </div>
                )}

                <div className="grid gap-2">
                  <Label
                    htmlFor="password"
                    className="text-slate-700 font-medium"
                  >
                    Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter at least 6 characters"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 rounded-xl border-slate-300 focus:border-[#11A193] focus:ring-[#11A193] transition-all duration-200"
                  />
                  {state?.errors?.password && (
                    <p className="text-sm font-medium text-destructive">
                      {state.errors.password[0]}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-slate-700 font-medium"
                  >
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 rounded-xl border-slate-300 focus:border-[#11A193] focus:ring-[#11A193] transition-all duration-200"
                  />
                  {state?.errors?.confirmPassword && (
                    <p className="text-sm font-medium text-destructive">
                      {state.errors.confirmPassword[0]}
                    </p>
                  )}
                </div>

                {/* Hidden fields to pass verification status */}
                <input
                  type="hidden"
                  name="emailVerified"
                  value={isEmailVerified ? "true" : "false"}
                />
                <input
                  type="hidden"
                  name="phoneVerified"
                  value={isPhoneVerified ? "true" : "false"}
                />

                {/* Validation Messages */}
                {password &&
                  confirmPassword &&
                  password !== confirmPassword && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                      <p className="text-sm font-medium text-red-800 text-center">
                        Passwords do not match.
                      </p>
                    </div>
                  )}

                {!(isEmailVerified && isPhoneVerified) && (
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                    <p className="text-sm font-medium text-blue-800 text-center">
                      Please verify your email and phone number to create your
                      account.
                    </p>
                  </div>
                )}

                {isEmailVerified &&
                  isPhoneVerified &&
                  firstName &&
                  lastName &&
                  email &&
                  password &&
                  confirmPassword &&
                  countryCode &&
                  phone &&
                  password === confirmPassword && (
                    <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                      <p className="text-sm font-medium text-green-800 text-center">
                        ✓ All requirements met! Ready to create your account.
                      </p>
                    </div>
                  )}

                <div className="pt-2">
                  <SignUpButton
                    isVerified={
                      isEmailVerified &&
                      isPhoneVerified &&
                      firstName.trim() !== "" &&
                      lastName.trim() !== "" &&
                      email.trim() !== "" &&
                      password.length >= 6 &&
                      confirmPassword === password &&
                      countryCode.trim() !== "" &&
                      phone.trim() !== ""
                    }
                  />
                </div>

                {state?.success === true && (
                  <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                    <p className="text-sm font-medium text-green-800 text-center">
                      ✅ {state.message} Redirecting to login...
                    </p>
                  </div>
                )}

                {state?.success === false && state.message && !state.errors && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                    <p className="text-sm font-medium text-red-800 text-center">
                      {state.message}
                    </p>
                  </div>
                )}
              </form>

              {/* Terms and Privacy */}
              <div className="mt-6 text-center">
                <p className="text-sm text-slate-600">
                  By creating an account, you agree to our{" "}
                  <Link
                    href="/terms"
                    className="font-medium text-[#11A193] hover:text-[#11A193]/80 transition-colors duration-200"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="font-medium text-[#11A193] hover:text-[#11A193]/80 transition-colors duration-200"
                  >
                    Privacy Policy
                  </Link>
                  .
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
