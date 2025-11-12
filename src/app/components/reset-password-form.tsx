// "use client";

// import { useFormStatus } from "react-dom";
// import Link from "next/link";
// import Image from "next/image";
// import { useState, useActionState } from "react";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   requestPasswordResetOtp,
//   validatePasswordResetOtp,
//   setNewPassword,
// } from "../actions/auth";
// import { PasswordInput } from "./password-input";

// function SubmitButton({ children }: { children: React.ReactNode }) {
//   const { pending } = useFormStatus();
//   return (
//     <Button
//       type="submit"
//       className="w-full bg-[#0283FA] hover:bg-[#0283FA]/90"
//       disabled={pending}
//       aria-disabled={pending}
//     >
//       {pending ? "Please wait..." : children}
//     </Button>
//   );
// }

// export default function ResetPasswordPage() {
//   const [formState, formAction] = useActionState(setNewPassword, {
//     message: "",
//     success: false,
//     errors: undefined,
//   });

//   const [email, setEmail] = useState("");
//   const [otp, setOtp] = useState("");

//   const [isOtpSent, setIsOtpSent] = useState(false);
//   const [isOtpVerified, setIsOtpVerified] = useState(false);

//   const [status, setStatus] = useState({
//     loading: false,
//     message: "",
//     error: false,
//   });

//   const handleSendCode = async () => {
//     setStatus({ loading: true, message: "Sending code...", error: false });
//     const result = await requestPasswordResetOtp(email);
//     setStatus({
//       loading: false,
//       message:sage: r.message,      error: !result.success,
//     });
//     if (result.success) {
//       setIsOtpSent(true);
//     }
//   };

//   const handleVerifyOtp = async () => {
//     setStatus({ loading: true, message: "Verifying code...", error: false });
//     const result = await validatePasswordResetOtp(email, otp);
//     setStatus({
//       loading: false,
//       message:sage: r.message,      error: !result.success,
//     });
//     if (result.success) {
//       setIsOtpVerified(true);
//     }
//   };

//   const handleReset = () => {
//     setIsOtpSent(false);
//     setStatus({ loading: false, message: "", error: false });
//   };

//   return (
//     <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
//       <div className="mx-auto w-full max-w-md space-y-8">
//         <div className="text-center">
//           <Image
//             src="/forgot-password.svg"
//             alt="Forgot password illustration"
//             width={300}
//             height={150}
//             className="mx-auto mb-6"
//           />
//           <h1 className="text-3xl font-bold tracking-tight text-foreground">
//             {isOtpVerified ? "Set Your New Password" : "Forgot Your Password?"}
//           </h1>
//           <p className="mt-2 text-sm text-muted-foreground">
//             {isOtpVerified
//               ? "Your identity has been confirmed. Now create a new password."
//               : "No problem. Enter your email to receive a verification code."}
//           </p>
//         </div>

//         {!isOtpVerified ? (
//           <div className="space-y-6">
//             <div className="space-y-2">
//               <div className="flex justify-between items-center">
//                 <Label htmlFor="email">Email address</Label>
//                 {isOtpSent && (
//                   <button
//                     type="button"
//                     onClick={handleReset}
//                     className="text-sm text-[#0283FA] hover:underline font-medium"
//                   >
//                     Change
//                   </button>
//                 )}
//               </div>
//               <div className="flex items-center gap-2">
//                 <Input
//                   id="email"
//                   name="email"
//                   type="email"
//                   autoComplete="email"
//                   required
//                   placeholder="your@email.com"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   disabled={isOtpSent}
//                 />
//                 {!isOtpSent && (
//                   <Button
//                     type="button"
//                     onClick={handleSendCode}
//                     disabled={status.loading || !email}
//                     className="bg-[#0283FA] hover:bg-[#0283FA]/90"
//                   >
//                     {status.loading ? "..." : "Send Code"}
//                   </Button>
//                 )}
//               </div>
//             </div>

//             {isOtpSent && (
//               <div className="space-y-2">
//                 <Label htmlFor="otp">Verification Code</Label>
//                 <div className="flex items-center gap-2">
//                   <Input
//                     id="otp"
//                     name="otp"
//                     required
//                     placeholder="123456"
//                     value={otp}
//                     onChange={(e) => setOtp(e.target.value)}
//                   />
//                   <Button
//                     type="button"
//                     onClick={handleVerifyOtp}
//                     disabled={status.loading || !otp}
//                     className="bg-[#0283FA] hover:bg-[#0283FA]/90"
//                   >
//                     {status.loading ? "..." : "Verify"}
//                   </Button>
//                 </div>
//               </div>
//             )}

//             {status.message && (
//               <p
//                 className={`mt-2 text-center text-sm ${
//                   status.error ? "text-red-600" : "text-green-600"
//                 }`}
//               >
//                 {status.message}
//               </p>
//             )}
//           </div>
//         ) : (
//           <form action={formAction} className="space-y-6">
//             <Input type="hidden" name="email" value={email} />
//             <div className="grid gap-2">
//               <Label htmlFor="newPassword">New Password</Label>
//               <PasswordInput id="newPassword" name="newPassword" required />
//               {formState.errors?.newPassword && (
//                 <p className="text-sm font-medium text-destructive">
//                   {formState.errors.newPassword[0]}
//                 </p>
//               )}
//             </div>
//             <div className="grid gap-2">
//               <Label htmlFor="confirmPassword">Confirm New Password</Label>
//               <PasswordInput
//                 id="confirmPassword"
//                 name="confirmPassword"
//                 required
//               />
//               {formState.errors?.confirmPassword && (
//                 <p className="text-sm font-medium text-destructive">
//                   {formState.errors.confirmPassword[0]}
//                 </p>
//               )}
//             </div>

//             <SubmitButton>Reset Password</SubmitButton>

//             {formState.message && !formState.errors && (
//               <p
//                 className={`mt-2 text-center text-sm ${
//                   formState.success ? "text-green-600" : "text-red-600"
//                 }`}
//               >
//                 {formState.message}
//               </p>
//             )}
//           </form>
//         )}

//         <div className="text-center">
//           <Link
//             href="/login"
//             className="text-sm font-medium text-[#0283FA] hover:text-[#0283FA]/90"
//           >
//             Back to Login
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }
