// components/useLoginManagement.tsx
'use client';

import { useState, useCallback, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Cookies from "../../../../node_modules/@types/js-cookie";
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
    PASSWORD_INCORRECT: "Incorrect password. Please try again.",
    EMAIL_NOT_FOUND: "Email not found. Please check your email address.",
    NETWORK_ERROR: "Connection error. Please check your internet connection.",
    RESET_REQUIRED: "Your account needs to be activated. Please reset your password.",
};


export const useLoginManagement = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
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
      // Pre-fetch the next page data while logging in
      const data = await loginUserAPI(email, password);

      // Check user status and show reset password
      if (data.status === USER_STATUS_INACTIVE) {
        toast.info(TOAST_MESSAGES.RESET_REQUIRED);
        setShowResetPassword(true);
        setLoading(false);
        return;
      }

      // Set authentication cookie
      Cookies.set(COOKIE_NAME, data.access_token, {
        expires: COOKIE_EXPIRY_DAYS,
        path: "/",
        secure: true, // Often only secure in prod
        sameSite: 'Strict'
      });

      const redirectPath = ROLE_REDIRECT_MAP[data.role];
      if (!redirectPath) {
        throw new Error(TOAST_MESSAGES.INVALID_ROLE);
      }

      // Use router.prefetch before actual navigation
      await router.prefetch(redirectPath);
      
      toast.success(TOAST_MESSAGES.LOGIN_SUCCESS);
      
      // Force a hard navigation to ensure fresh data
      window.location.href = redirectPath;

    } catch (err) {
      let errorMessage = TOAST_MESSAGES.LOGIN_FAILED_GENERIC;
      
      if (err instanceof Error) {
        // Parse the backend error message
        try {
          const errorObj = JSON.parse(err.message);
          if (errorObj.detail?.error) {
            if (errorObj.detail.error.includes("Incorrect password")) {
              errorMessage = TOAST_MESSAGES.PASSWORD_INCORRECT;
            } else if (errorObj.detail.error.includes("User not found")) {
              errorMessage = TOAST_MESSAGES.EMAIL_NOT_FOUND;
            }
          }
        } catch {
          // If error message isn't JSON, use it directly
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
      });
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
    showResetPassword,
    setShowResetPassword,
   };
};