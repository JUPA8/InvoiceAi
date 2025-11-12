"use server";

import { z } from "zod";

interface ApiResponse {
  succeeded?: boolean;
  isSuccess?: boolean;
  message?: string;
  data?: any;
  errors?: any;
  messages?: string[];
  statusCode?: number;
}

export async function submitDemoRequest(prevState: any, formData: FormData) {
  const schema = z.object({
    fullName: z.string().min(1, "Full name is required."),
    email: z.string().email("Invalid email format."),
    mobileNumber: z.string().min(1, "Mobile number is required."),
    message: z.string().optional(),
    favoritConnectionMethod: z.string().optional().default("Email"),
  });

  const validatedFields = schema.safeParse(Object.fromEntries(formData));

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Please check all required fields and try again.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { fullName, email, mobileNumber, message, favoritConnectionMethod } =
    validatedFields.data;

  try {
    const basicAuth = "YWRtaW5AbG9jYWwuY29tOkFiY0AxMjM0";
    const userKey = process.env.DEMO_USER_KEY || "demo_user_key_here";

    const demoRequestData = {
      fullName: fullName.trim(),
      email: email.trim(),
      mobileNumber: mobileNumber.trim(),
      message: message?.trim() || "",
      favoritConnectionMethod: favoritConnectionMethod || "Email",
    };

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/DemoRequests`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Basic ${basicAuth}`,
          "x-user-key": userKey,
        },
        body: JSON.stringify(demoRequestData),
      }
    );

    if (!response.ok) {
      let errorMessage = "Failed to submit demo request. Please try again.";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.title || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }

      return {
        success: false,
        message: errorMessage,
      };
    }

    const result: ApiResponse = await response.json();

    if (result.succeeded || result.isSuccess) {
      return {
        success: true,
        message:
          "Demo request submitted successfully! Our team will contact you within 24 hours.",
        data: result.data,
      };
    } else {
      return {
        success: false,
        message:
          result.messages?.join("; ") ||
          result.message ||
          "Failed to submit demo request.",
      };
    }
  } catch (error) {
    console.error("Demo request error:", error);
    return {
      success: false,
      message: "An unexpected error occurred during demo request submission.",
    };
  }
}
