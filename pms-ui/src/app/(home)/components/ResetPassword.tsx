'use client';

import { useState, FormEvent } from 'react';
import { Input, Button, Form } from "@heroui/react";
import { toast } from "react-toastify";
import { resetPasswordAPI } from './API';

interface ResetPasswordProps {
  email: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const STRINGS = {
  TITLE: "Reset Password",
  SUBTITLE: "Create a new password to activate your account",
  NEW_PASSWORD_LABEL: "New Password",
  CONFIRM_PASSWORD_LABEL: "Confirm Password",
  SUBMIT_BUTTON: "Reset Password",
  CANCEL_BUTTON: "Cancel",
  PASSWORD_REQUIREMENTS: "Password must contain at least 3 numbers and 5 letters",
};

const validatePassword = (password: string) => {
  const numbers = (password.match(/\d/g) || []).length;
  const letters = (password.match(/[a-zA-Z]/g) || []).length;
  return numbers >= 3 && letters >= 5;
};

export function ResetPassword({ email, onSuccess, onCancel }: ResetPasswordProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!validatePassword(newPassword)) {
      setError(STRINGS.PASSWORD_REQUIREMENTS);
      return;
    }

    setLoading(true);

    try {
      await resetPasswordAPI(email, newPassword);
      toast.success('Password reset successful. Please log in with your new password.');
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 bg-white rounded-xl p-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">{STRINGS.TITLE}</h2>
        <p className="mt-2 text-sm text-gray-600">{STRINGS.SUBTITLE}</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <Form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="password"
          label={STRINGS.NEW_PASSWORD_LABEL}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          className="block w-full rounded-lg"
        />

        <Input
          type="password"
          label={STRINGS.CONFIRM_PASSWORD_LABEL}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="block w-full rounded-lg"
        />

        <p className="text-xs text-gray-500">{STRINGS.PASSWORD_REQUIREMENTS}</p>

        <div className="flex gap-3">
          <Button
            type="submit"
            color="primary"
            className="flex-1 py-2"
            disabled={loading}
          >
            {loading ? 'Processing...' : STRINGS.SUBMIT_BUTTON}
          </Button>
          
          <Button
            type="button"
            color="secondary"
            className="flex-1 py-2"
            onClick={onCancel}
            disabled={loading}
          >
            {STRINGS.CANCEL_BUTTON}
          </Button>
        </div>
      </Form>
    </div>
  );
}