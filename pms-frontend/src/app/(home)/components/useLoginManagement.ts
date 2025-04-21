// components/useLoginManagement.tsx
'use client';

import { useState, useCallback, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { loginUserAPI } from "./API";


// interface LoginResponse {
//   access_token: string;
//   role: UserRole;
//   status: UserStatus;
// }
type UserRole = "faculty" | "student" | "admin" | "alumni" | string; // Allow string for potential future roles
// type UserStatus = "Active" | "Inactive";

class ApiError extends Error {
constructor(message: string, public statusCode?: number) {
  super(message);
  this.name = 'ApiError';
}
}

// --- Constants ---
const COOKIE_NAME = 'access_token';
const COOKIE_EXPIRY_DAYS = 0.5; // 12 hours
const USER_STATUS_INACTIVE = "Inactive";

const ROLE_REDIRECT_MAP: Record<UserRole, string | null> = {
  faculty: "/faculty/profile",
  student: "/students/profile",
  admin: "/faculty/profile",
  alumni: "/alumni/profile",
};

const TOAST_MESSAGES = {
    LOGIN_SUCCESS: "Login successful",
    ACCOUNT_INACTIVE: "Your account is inactive. Please contact the admin.",
    INVALID_ROLE: "Login successful, but user role is invalid or not configured for redirection.",
    LOGIN_FAILED: "Failed to login:", // Prefix for specific errors
    LOGIN_FAILED_GENERIC: "Failed to login. Please try again.", // Generic fallback
};


export const useLoginManagement = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  const toggleVisibility = useCallback(() => {
    setVisible(prev => !prev);
  }, []);

  /**
   * Handles the form submission for logging in.
   * Performs API call, handles response, sets cookie, and redirects on success.
   * Manages loading and error states.
   */
  const handleLogin = useCallback(async (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault(); // Allow calling without event for potential future use cases
    setLoading(true);
    setError(""); // Clear previous errors

    try {
      const data = await loginUserAPI(email, password);

      // Check user status
      if (data.status === USER_STATUS_INACTIVE) {
        toast.error(TOAST_MESSAGES.ACCOUNT_INACTIVE);
        setError(TOAST_MESSAGES.ACCOUNT_INACTIVE); 
        return; 
      }

      // Set authentication cookie
      Cookies.set(COOKIE_NAME, data.access_token, {
        expires: COOKIE_EXPIRY_DAYS,
        path: "/",
        secure: true, // Often only secure in prod
        sameSite: 'Strict'
      });

      toast.success(TOAST_MESSAGES.LOGIN_SUCCESS);

      // Determine redirection path based on role
      const redirectPath = ROLE_REDIRECT_MAP[data.role];

      if (redirectPath) {
        router.push(redirectPath);
      } else {
          // Handle unknown or unmapped roles
          setError(TOAST_MESSAGES.INVALID_ROLE);
          toast.warn(TOAST_MESSAGES.INVALID_ROLE);
          console.warn(`Unknown or unmapped role encountered: ${data.role}`);
          // Optional: redirect to a default dashboard or show an error page
          // router.push('/dashboard');
      }

    } catch (err) {
      let errorMessage = TOAST_MESSAGES.LOGIN_FAILED_GENERIC;
      if (err instanceof ApiError) {
        errorMessage = err.message;
        console.error(`${TOAST_MESSAGES.LOGIN_FAILED} ${errorMessage}`);
      } else if (err instanceof Error) {
        errorMessage = err.message;
        console.error(`${TOAST_MESSAGES.LOGIN_FAILED} ${errorMessage}`);
      } else {
        console.error("An unknown error occurred during login:", err);
      }
      setError(errorMessage); 
      toast.error(`${TOAST_MESSAGES.LOGIN_FAILED} ${errorMessage}`); 
    } finally {
      setLoading(false); 
    }
  }, [email, password, router]); 

  return {
    email, setEmail,
    password, setPassword,
    error, 
    loading,
    visible,
    toggleVisibility,
    handleLogin,
   };
};