import axios from "axios";
import { cookies } from "next/headers";

export async function getSessionData() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session_data");

  if (!sessionCookie) {
    return null;
  }

  try {
    const session = JSON.parse(sessionCookie.value);
    return session;
  } catch (error) {
    console.error("Failed to parse session cookie:", error);
    return null;
  }
}

export const fetchData = async (
  method: "get" | "post" | "put" | "delete",
  endpoint: string,
  bodyData: any = null
) => {
  try {
    const session = await getSessionData();

    if (!session) throw new Error("Session not found");

    const token = session.basicAuth;
    const key = session.userKey;

    const config = {
      method,
      url: `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
      headers: {
        Authorization: `Bearer ${token}`,
        "X-USER-KEY": key,
      },
      ...(method !== "get" && { data: bodyData }),
    };

    const response = await axios(config);

    console.log("Data:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Request failed:", error.message);
    throw error;
  }
};
