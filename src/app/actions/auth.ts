"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SessionPayload, setSession } from "@/lib/session";

interface ApiResponse {
  succeeded?: boolean;
  isSuccess?: boolean;
  message?: string;
  data?: any;
  errors?: any;
  messages?: string[];
  statusCode?: number;
}

interface LoginApiResponseData {
  userKey: string;
  clientId?: string | number;
  clientKey?: string;
}

interface LoginApiResponse extends ApiResponse {
  data?: LoginApiResponseData;
}

interface TempUserData {
  firstName: string;
  lastName: string;
  email: string;
  timestamp: number;
}

function extractUserKeyFromSetCookie(
  setCookieHeader: string | null
): string | null {
  if (!setCookieHeader) return null;
  const userKeyMatch = setCookieHeader.match(/UserKey=([^;]+)/);
  if (userKeyMatch) {
    try {
      return decodeURIComponent(userKeyMatch[1]);
    } catch {
      return userKeyMatch[1];
    }
  }
  return null;
}

async function saveSession(payload: SessionPayload) {
  await setSession(payload);
}

async function saveTempUserData(
  firstName: string,
  lastName: string,
  email: string
) {
  const cookieStore = await cookies();
  const tempData: TempUserData = {
    firstName,
    lastName,
    email,
    timestamp: Date.now(),
  };

  cookieStore.set("temp_user_signup", JSON.stringify(tempData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 10 * 60,
    path: "/",
    sameSite: "strict",
  });
}

async function getTempUserData(
  email: string
): Promise<{ firstName: string; lastName: string } | null> {
  const cookieStore = await cookies();
  const tempCookie = cookieStore.get("temp_user_signup");

  if (!tempCookie?.value) return null;

  try {
    const tempData: TempUserData = JSON.parse(tempCookie.value);

    if (tempData.email !== email) return null;

    const ageInMinutes = (Date.now() - tempData.timestamp) / (1000 * 60);
    if (ageInMinutes > 10) {
      cookieStore.delete("temp_user_signup");
      return null;
    }

    cookieStore.delete("temp_user_signup");

    return {
      firstName: tempData.firstName,
      lastName: tempData.lastName,
    };
  } catch (error) {
    cookieStore.delete("temp_user_signup");
    return null;
  }
}

async function getAdminToken(): Promise<string | null> {
  try {
    const adminUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/Account/Login`;
    const response = await fetch(adminUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        username: process.env.NEXT_PUBLIC_DEFAULT_USERNAME,
        password: process.env.NEXT_PUBLIC_DEFAULT_PASSWORD,
      }),
      cache: "no-store",
    });

    if (!response.ok) return null;

    const setCookieHeader = response.headers.get("set-cookie");
    const cookieUserKey = extractUserKeyFromSetCookie(setCookieHeader);
    const result: LoginApiResponse = await response.json();
    const bodyUserKey = result.data?.userKey;

    const token = cookieUserKey || bodyUserKey;
    if (result.isSuccess && token) return token;
    return null;
  } catch {
    return null;
  }
}

export async function login(prevState: any, formData: FormData) {
  const schema = z.object({
    email: z.string().email("Invalid email format."),
    password: z.string().min(1, "Password cannot be empty."),
  });

  const validatedFields = schema.safeParse(Object.fromEntries(formData));

  if (!validatedFields.success) {
    return { success: false, message: "Invalid fields." };
  }

  const { email, password } = validatedFields.data;

  try {
    const loginUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/Account/Login`;

    const response = await fetch(loginUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ username: email, password }),
    });

    const setCookieHeader = response.headers.get("set-cookie");
    const cookieUserKey = extractUserKeyFromSetCookie(setCookieHeader);

    if (!response.ok) {
      return {
        success: false,
        message: "Login failed. Please check your credentials.",
      };
    }

    const result: LoginApiResponse = await response.json();
    const responseData = result.data;
    const userKey = cookieUserKey || responseData?.userKey;
    const clientId = responseData?.clientId
      ? String(responseData.clientId)
      : null;
    const clientKey = responseData?.clientKey;

    if (result.isSuccess && userKey && clientId && clientKey) {
      const basicAuth = btoa(`${email}:${password}`);

      let userName = "";
      let userEmail = email;

      const tempData = await getTempUserData(email);

      if (tempData) {
        userName = `${tempData.firstName} ${tempData.lastName}`.trim();
      } else {
        try {
          const adminToken = await getAdminToken();
          if (adminToken) {
            const adminCredentials = btoa(
              `${process.env.NEXT_PUBLIC_DEFAULT_USERNAME}:${process.env.NEXT_PUBLIC_DEFAULT_PASSWORD}`
            );

            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/v1/clients/${clientId}/users`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                  Authorization: `Basic ${adminCredentials}`,
                  "X-USER-KEY": adminToken,
                },
              }
            );

            if (response.ok) {
              const result = await response.json();

              if (result.isSuccess || result.succeeded) {
                const users = Array.isArray(result.data)
                  ? result.data
                  : [result.data];

                for (const userData of users) {
                  if (
                    userData &&
                    (userData.email === email ||
                      userData.normalizedEmail === email.toUpperCase() ||
                      userData.userName === email)
                  ) {
                    const firstName = userData.firstName;
                    const lastName = userData.lastName;

                    if (firstName && lastName) {
                      userName = `${firstName} ${lastName}`.trim();
                      break;
                    }
                  }
                }

                if (
                  !userName &&
                  users.length === 1 &&
                  users[0]?.firstName &&
                  users[0]?.lastName
                ) {
                  const userData = users[0];
                  userName =
                    `${userData.firstName} ${userData.lastName}`.trim();
                }
              }
            }
          }
        } catch (error) {
          // Silent fail
        }

        if (!userName) {
          try {
            const adminToken = await getAdminToken();
            if (adminToken) {
              const adminCredentials = btoa(
                `${process.env.NEXT_PUBLIC_DEFAULT_USERNAME}:${process.env.NEXT_PUBLIC_DEFAULT_PASSWORD}`
              );

              const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/v1/Clients/${clientId}`,
                {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Basic ${adminCredentials}`,
                    "X-USER-KEY": adminToken,
                  },
                }
              );

              if (response.ok) {
                const result = await response.json();
                if (
                  result.isSuccess &&
                  result.data?.name &&
                  !result.data.name.includes("@")
                ) {
                  userName = result.data.name;
                }
              }
            }
          } catch (error) {
            // Silent fail
          }
        }

        if (!userName) {
          userName = email.split("@")[0];
        }
      }

      await saveSession({
        userKey,
        basicAuth,
        clientId,
        clientKey,
        userName,
        userEmail,
      });
    } else {
      return {
        success: false,
        message: result.message || "Login failed.",
      };
    }
  } catch (error) {
    return { success: false, message: "An unexpected error occurred." };
  }

  redirect("/dashboard");
}

export async function signup(prevState: any, formData: FormData) {
  const formEntries = Object.fromEntries(formData);
  const schema = z
    .object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      email: z.string().email(),
      countryCode: z.string().min(1),
      phoneNumber: z.string().min(1),
      password: z.string().min(6),
      confirmPassword: z.string().min(6),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });

  const validatedFields = schema.safeParse(formEntries);

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Please check all required fields and try again.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const {
    email,
    password,
    confirmPassword,
    countryCode,
    phoneNumber,
    firstName,
    lastName,
  } = validatedFields.data;

  try {
    const adminToken = await getAdminToken();
    if (!adminToken) {
      return {
        success: false,
        message: "System error: Could not obtain admin credentials.",
      };
    }

    const adminCredentials = btoa(
      `${process.env.NEXT_PUBLIC_DEFAULT_USERNAME}:${process.env.NEXT_PUBLIC_DEFAULT_PASSWORD}`
    );

    const fullPhoneNumber = `${countryCode.replace(
      /\D/g,
      ""
    )}${phoneNumber.replace(/\D/g, "")}`;

    const payload = {
      name: `${firstName} ${lastName}`,
      timezoneOffset: new Date().getTimezoneOffset() / -60,
      isActive: true,
      user: {
        email,
        password,
        confirmPassword,
        phoneNumber: fullPhoneNumber,
        firstName,
        lastName,
      },
    };

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/Clients`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Basic ${adminCredentials}`,
          "X-USER-KEY": adminToken,
        },
        body: JSON.stringify(payload),
      }
    );

    const responseText = await response.text();

    if (!response.ok) {
      return {
        success: false,
        message: "Failed to create account. Please try again.",
      };
    }

    const result: ApiResponse = JSON.parse(responseText);
    if (result.isSuccess) {
      await saveTempUserData(firstName, lastName, email);

      return {
        success: true,
        message: "Account created successfully! Please log in.",
        redirect: "/login",
      };
    } else {
      return {
        success: false,
        message: result.messages?.join("; ") || "Failed to create account.",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "An unexpected error occurred during signup.",
    };
  }
}

export async function requestOtp(
  identifier: string,
  otpType: "Email Confirmation" | "Phone Number Confirmation"
) {
  try {
    const adminToken = await getAdminToken();
    if (!adminToken)
      return {
        success: false,
        message: "System error: Could not obtain admin credentials.",
      };

    const adminCredentials = btoa(
      `${process.env.NEXT_PUBLIC_DEFAULT_USERNAME}:${process.env.NEXT_PUBLIC_DEFAULT_PASSWORD}`
    );

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/Account/request-otp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Basic ${adminCredentials}`,
          "X-USER-KEY": adminToken,
        },
        body: JSON.stringify({ identifier, otpType }),
      }
    );

    const result = await response.json();
    if (!response.ok || !(result.succeeded || result.isSuccess)) {
      return {
        success: false,
        message: result.message || "Failed to send verification code.",
      };
    }

    return {
      success: true,
      message: `A verification code has been sent to ${identifier}.`,
    };
  } catch {
    return {
      success: false,
      message: "An unexpected API response was received.",
    };
  }
}

export async function validateOtp(
  identifier: string,
  otp: string,
  otpType: "Email Confirmation" | "Phone Number Confirmation"
) {
  try {
    const adminToken = await getAdminToken();
    if (!adminToken)
      return {
        success: false,
        message: "System error: Could not obtain admin credentials.",
      };

    const adminCredentials = btoa(
      `${process.env.NEXT_PUBLIC_DEFAULT_USERNAME}:${process.env.NEXT_PUBLIC_DEFAULT_PASSWORD}`
    );

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/Account/validate-otp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Basic ${adminCredentials}`,
          "X-USER-KEY": adminToken,
        },
        body: JSON.stringify({ identifier, otp, otpType }),
      }
    );

    const result = await response.json();
    if (!response.ok || !(result.succeeded || result.isSuccess)) {
      return {
        success: false,
        message: result.message || "Invalid or expired verification code.",
      };
    }

    return { success: true, message: "Verification successful." };
  } catch {
    return {
      success: false,
      message: "An unexpected API response was received.",
    };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("session_data");
  cookieStore.delete("temp_user_signup");
  redirect("/login");
}
