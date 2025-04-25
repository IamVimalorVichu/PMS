// app/community/components/common/ReportmodalTrigger.tsx
"use client";

import React, { useState, FormEvent, ReactNode } from 'react';
import { Modal } from '@/app/community/components/common/modal'; // Adjust path to your Modal component
import { useAuth } from '@/app/components/services/useAuth'; // Adjust path to global useAuth
import { submitReportAPI } from '@/app/community/services/reportAPI'; // Adjust path
import { ReportCreate } from '@/app/community/types/report'; // Adjust path

interface ReportmodalTriggerProps {
  itemId: string;
  itemType: 'post' | 'comment' | 'user';
  reportedItemDescription: string; // For display in modal
  triggerElement?: ReactNode; // Optional custom trigger
}

interface ReportButtonProps {
  onClick: () => void;
  disabled: boolean;
  itemType: string;
  className?: string;
}

const ReportButton = ({ onClick, disabled, itemType, className = "" }: ReportButtonProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`text-xs text-gray-500 hover:text-red-600 dark:hover:text-red-400 
      disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    title={disabled ? "Log in to report" : `Report this ${itemType}`}
  >
    Report
  </button>
);

export function ReportModalTrigger({
  itemId,
  itemType,
  reportedItemDescription,
  triggerElement
}: ReportmodalTriggerProps) {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const openModal = () => {
    if (!isAuthenticated) {
      // Optionally show a message or redirect to login
      alert("Please log in to report content.");
      return;
    }
    setError(null);
    setSuccessMessage(null);
    setReason(''); // Reset reason when opening
    console.log(`Opening report modal for ${itemType} with ID: ${itemId}`);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) return; // Prevent closing while submitting
    setIsModalOpen(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?._id || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const reportData: ReportCreate = {
      reported_item_id: itemId,
      item_type: itemType,
      reason: reason.trim() || null, // Send null if reason is empty/whitespace
    };

    try {
      const result = await submitReportAPI(reportData, user._id);
      setSuccessMessage(result?.message || "Report submitted successfully. Thank you.");
      // Close modal after a delay
      setTimeout(() => {
        closeModal();
      }, 2000);
    } catch (err: unknown) {
      console.error("Failed to submit report:", err);
      setError((err as Error).message || "Could not submit report.");
      setIsSubmitting(false); // Re-enable form on error
    }
    // Don't set submitting false on success, as modal will close
  };

  return (
    <>
      {triggerElement ? (
        // Custom trigger
        <div onClick={openModal}>
          {triggerElement}
        </div>
      ) : (
        // Default button trigger
        <ReportButton 
          onClick={openModal}
          disabled={isAuthLoading || !isAuthenticated}
          itemType={itemType}
        />
      )}

      {/* The modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={`Report ${itemType}`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            You are reporting: <span className="font-medium">{reportedItemDescription}</span>
          </p>

          <div>
            <label htmlFor={`reportReason-${itemId}-${itemType}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reason (Optional):
            </label>
            <textarea
              id={`reportReason-${itemId}-${itemType}`}
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isSubmitting}
              placeholder={`Why are you reporting this ${itemType}?`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 disabled:opacity-50"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          {successMessage && (
            <p className="text-sm text-green-600">{successMessage}</p>
          )}

          {/* modal Footer Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}