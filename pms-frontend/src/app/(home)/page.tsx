// Login.tsx
"use client";

import { useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { Input, Button, Form, Spinner } from "@heroui/react"; // Grouped third-party UI
import { IoMdEye, IoMdEyeOff } from "react-icons/io"; // Grouped icons
import { ResetPassword } from "./components/ResetPassword";

import { useLoginManagement } from "./components/useLoginManagement"; // Local hook

// Constants for strings
const STRINGS = {
  WELCOME_TITLE: "Welcome to PMS",
  LOADING_USERS: "Loading users...",
  EMAIL_PLACEHOLDER: "Email",
  EMAIL_LABEL: "Email Address",
  PASSWORD_PLACEHOLDER: "Password",
  PASSWORD_LABEL: "Password",
  TOGGLE_VISIBILITY_LABEL: "Toggle password visibility",
  SUBMIT_BUTTON_DEFAULT: "Enter PMS",
  SUBMIT_BUTTON_LOADING: "Loading...",
};

/**
 * Renders the login page component.
 * Handles user authentication input, displays loading/error states,
 * and processes toast messages passed via URL parameters.
 */
export default function Login() {
  const searchParams = useSearchParams();
  const toastMessage = searchParams.get('toast');
  
  // Manage login state and actions via custom hook
  const {
    email, setEmail,
    password, setPassword,
    error,
    loading,
    visible,
    toggleVisibility,
    handleLogin,
    showResetPassword,  // Add this
    setShowResetPassword, // Add this
  } = useLoginManagement();

  // Effect to display toast messages from URL parameters
  useEffect(() => {
    if (toastMessage) {
      // Consider adding different toast types (info, warning) if needed
      toast.error(toastMessage);
    }
  }, [toastMessage]);

  const handleResetSuccess = useCallback(() => {
    setShowResetPassword(false);
    toast.success("Password reset successful. You can now log in.");
  }, [setShowResetPassword]);

  const handleResetCancel = useCallback(() => {
    setShowResetPassword(false);
  }, [setShowResetPassword]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        {showResetPassword ? (
          <ResetPassword
            email={email}
            onSuccess={handleResetSuccess}
            onCancel={handleResetCancel}
          />
        ) : (
          <>
            {/* Logo/Brand Section */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                {STRINGS.WELCOME_TITLE}
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Please sign in to your account
              </p>
            </div>

            {/* Status Messages */}
            {loading && (
              <div className="flex items-center justify-center text-sm text-blue-600">
                <Spinner size="sm" className="mr-2" />
                {STRINGS.LOADING_USERS}
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Login Form */}
            <Form 
              onSubmit={handleLogin}
              className="mt-8 space-y-6"
            >
              <Input
                type="email"
                label={STRINGS.EMAIL_LABEL}
                placeholder={STRINGS.EMAIL_PLACEHOLDER}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-lg border-gray-300 shadow-sm
                          focus:border-primary focus:ring-primary sm:text-sm"
                autoComplete="email"
                required
              />

              <Input
                type={visible ? "text" : "password"}
                label={STRINGS.PASSWORD_LABEL}
                placeholder={STRINGS.PASSWORD_PLACEHOLDER}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-lg border-gray-300 shadow-sm
                          focus:border-primary focus:ring-primary sm:text-sm"
                autoComplete="current-password"
                required
                endContent={
                  <Button
                    isIconOnly
                    variant="light"
                    onPress={toggleVisibility}
                    aria-label={STRINGS.TOGGLE_VISIBILITY_LABEL}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {visible ? <IoMdEyeOff size={20} /> : <IoMdEye size={20} />}
                  </Button>
                }
              />

                {/* Submit Button styled above */}
                <Button
                type="submit"
                isLoading={loading}
                className="w-full bg-primary text-white font-medium py-2 px-4 rounded-lg shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                {loading ? STRINGS.SUBMIT_BUTTON_LOADING : STRINGS.SUBMIT_BUTTON_DEFAULT}
                </Button>
            </Form>
          </>
        )}
      </div>
    </div>
  );
}