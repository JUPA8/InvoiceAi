"use client";

import { useState, useEffect } from "react";

interface UserData {
  userName: string;
  userEmail: string;
  isAuthenticated: boolean;
  userKey?: string;
  clientId?: string;
}

interface UseUserReturn {
  user: UserData;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<UserData>({
    userName: "",
    userEmail: "",
    isAuthenticated: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/auth/session");

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();

      setUser({
        userName: data.userName || "User",
        userEmail: data.userEmail || "",
        isAuthenticated: data.isAuthenticated || false,
        userKey: data.userKey,
        clientId: data.clientId,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setUser({
        userName: "User",
        userEmail: "",
        isAuthenticated: false,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return {
    user,
    loading,
    error,
    refetch: fetchUser,
  };
}
