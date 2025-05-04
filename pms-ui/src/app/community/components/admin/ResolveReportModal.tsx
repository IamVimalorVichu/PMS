// app/community/components/admin/ResolveReportModal.tsx
"use client";

import React, { useState, useEffect, FormEvent } from 'react';
// Assuming Modal, Button, Input, Textarea, Checkbox are correctly imported from HeroUI or your common components
import { Modal } from '@/app/community/components/common/modal'; // Adjust path if using HeroUI/common modal
import { Button, Input, Textarea, Checkbox } from '@heroui/react'; // Example HeroUI imports
import { useAuth } from '@/app/components/services/useAuth'; // Adjust path
import { ReportRead, ReportUpdate } from '@/app/community/types/report'; // Adjust path
// Import the API functions and payload type
import { applyUserRestrictionsAPI, resolveReportAPI } from '@/app/community/services/adminAPI'; // Adjust path
import { deleteCommentAPI, deletePostAPI } from '../../services/postAPI';
import { ApplyRestrictionsPayload } from '@/app/community/types/auth'; // Adjust path
import { sendSystemMessageAPI } from '../../services/dmAPI';

interface ResolveReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ReportRead | null; // Pass the full report object, including target_user_id
  // Callback when the entire resolution process is done
  onResolutionComplete: (reportId: string, finalStatus: 'resolved' | 'dismissed') => void;
}

export function ResolveReportModal({ isOpen, onClose, report, onResolutionComplete }: ResolveReportModalProps) {
  const { user } = useAuth(); // Get the admin user performing the action

  // Form state
  const [messageToUser, setMessageToUser] = useState('');
  const [disablePosts, setDisablePosts] = useState(false);
  const [disableComments, setDisableComments] = useState(false);
  const [disableMessaging, setDisableMessaging] = useState(false);
  const [restrictionDays, setRestrictionDays] = useState<number | string>(''); // Use string for input flexibility
  const [finalStatus, setFinalStatus] = useState<'resolved' | 'dismissed'>('resolved'); // Default final status
  const [shouldDelete, setShouldDelete] = useState(true); // Add new state for delete checkbox

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get the target user ID directly from the report object
  const targetUserId = report?.target_user_id || null;

  // Reset form state when the modal opens or the report changes
  useEffect(() => {
    if (isOpen && report) {
      setMessageToUser('');
      setDisablePosts(false);
      setDisableComments(false);
      setDisableMessaging(false);
      setRestrictionDays('');
      setError(null);
      setIsSubmitting(false);
      setShouldDelete(false); // Reset delete checkbox to checked
      // Set initial finalStatus based on current report status if needed, or default
      setFinalStatus(report.status === 'pending' ? 'resolved' : report.status);
    }
  }, [isOpen, report]); // Depend on isOpen and report

  // Calculate if restrictions should be applied
  const days = parseInt(String(restrictionDays), 10);
  const restrictionDuration = !isNaN(days) && days >= 0 ? days : null;
  const applyRestrictions = (disablePosts || disableComments || disableMessaging || restrictionDuration !== null);

  // Handle form submission
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Ensure all necessary data is present
    if (!report || !user?._id || isSubmitting) {
        setError("Cannot submit: Missing required data or already submitting.");
        return;
    }
    // Check if a target user ID is available for restrictions/messaging
    const canTakeUserAction = !!targetUserId;

    setIsSubmitting(true);
    setError(null);

    // Prepare restriction payload
    const days = parseInt(String(restrictionDays), 10);
    const restrictionDuration = !isNaN(days) && days >= 0 ? days : null;
    const restrictionsPayload: ApplyRestrictionsPayload = {
        // Only include if true
        disable_posts: disablePosts || undefined,
        disable_comments: disableComments || undefined,
        disable_messaging: disableMessaging || undefined,
        restriction_days: restrictionDuration,
    };
    const applyRestrictions = canTakeUserAction && (disablePosts || disableComments || disableMessaging || restrictionDuration !== null);

    try {
        // Step 1: Delete Item (if applicable)
        if (shouldDelete && (report.item_type === 'post' || report.item_type === 'comment')) {
            try {
                if (report.item_type === 'post') {
                    await deletePostAPI(report.reported_item_id, user._id);
                } else {
                    await deleteCommentAPI(report.reported_item_id, user._id);
                }
                console.log(`Successfully deleted ${report.item_type}`);
            } catch (deleteError) {
                console.error(`Failed to delete ${report.item_type}:`, deleteError);
                setError(`Failed to delete ${report.item_type}. Please try again.`);
                setIsSubmitting(false);
                return;
            }
        }

        // Step 2: Apply Restrictions (if applicable and target user known)
        if (applyRestrictions && targetUserId) {
            console.log(`Applying restrictions to user ${targetUserId}:`, restrictionsPayload);
            await applyUserRestrictionsAPI(targetUserId, restrictionsPayload, user._id);
        } else if (applyRestrictions && !targetUserId) {
            console.warn("Skipping restrictions: Target user ID not available.");
            // Optionally inform the admin
            // setError("Could not apply restrictions: Target user unknown.");
            // Decide if this should block the whole process or just skip restrictions
        }

        // Step 3: Send Message (Placeholder - Requires Backend Implementation)
        if (messageToUser.trim() && targetUserId) {
            console.log(`Sending message to user ${targetUserId} (API call placeholder):`, messageToUser);
            const messageData = {
                content: messageToUser,
                type: 'text'
            };
            await sendSystemMessageAPI(targetUserId, messageData, user._id);
            // alert("Message sending not implemented yet, but content was: " + messageToUser);
        } else if (messageToUser.trim() && !targetUserId) {
             console.warn("Skipping message: Target user ID not available.");
        }

        // Step 4: Update Report Status (Always perform this)
        console.log(`Updating report ${report._id} status to ${finalStatus}`);
        const reportUpdatePayload: ReportUpdate = { status: finalStatus };
        await resolveReportAPI(report._id, reportUpdatePayload, user._id);

        // Success: Notify parent and close modal
        onResolutionComplete(report._id, finalStatus);
        onClose();

    } catch (err: unknown) { // Use 'any' or 'unknown' and then assert type
        console.error("Failed to resolve report:", err);
        setError((err as Error).message || "An error occurred during resolution.");
        setIsSubmitting(false); // Allow retry on error
    }
    // No finally block needed for isSubmitting if modal closes on success
  };

  // Don't render anything if modal shouldn't be open or no report data
  if (!isOpen || !report) return null;

  return (
    // Assuming HeroUI Modal structure - adjust as needed
    <Modal isOpen={isOpen} onClose={onClose} title={`Resolve Report ID: ${report._id.substring(0, 8)}...`} size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Report Context Display */}
        <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
                Reported Item Type: <span className="font-medium capitalize">{report.item_type}</span>
            </p>
            {/* TODO: Add link to item using getItemLink logic */}
            <p className="text-sm text-gray-600 dark:text-gray-400">
                Reporter: <span className="font-medium">{report.reporter?.user_name || report.reporter_id.substring(0,8)+'...'}</span>
            </p>
            {report.reason && (
                 <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Reason: <span className="italic">{report.reason}</span>
                 </p>
            )}
        </div>

        <hr className="dark:border-gray-600"/>

        {/* Add Delete Checkbox for posts and comments */}
        {report && (report.item_type === 'post' || report.item_type === 'comment') && (
          <div>
            <Checkbox
              checked={shouldDelete}
              onChange={(e) => setShouldDelete(e.target.checked)}
              disabled={isSubmitting}
              color="danger"
            >
              Delete {report.item_type === 'post' ? 'Post' : 'Comment'}
            </Checkbox>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              This will permanently remove the {report.item_type}.
            </p>
          </div>
        )}

        <hr className="dark:border-gray-600"/>

        {/* Optional Message Section */}
        <div>
          <label htmlFor="messageToUser" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Send Message to Target User (Optional)
          </label>
          <Textarea
            id="messageToUser"
            rows={3}
            value={messageToUser}
            onChange={(e) => setMessageToUser(e.target.value)}
            placeholder={targetUserId ? `Optional message explaining the action taken regarding the reported ${report.item_type}...` : "Cannot send message: Target user unknown."}
            disabled={isSubmitting || !targetUserId} // Disable if no target user
            className="w-full"
          />
           {!targetUserId && report.item_type !== 'user' && <p className="text-xs text-yellow-600 mt-1">Cannot determine target user for message/restrictions from this report.</p>}
        </div>

        <hr className="dark:border-gray-600"/>

        {/* Take Action Section */}
        <div>
            <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Take Action (Applies to User: {targetUserId ? targetUserId.substring(0,8)+'...' : <span className='italic text-gray-500'>N/A</span>})
            </h3>
             <div className="space-y-2 pl-2">
                {/* Use HeroUI Checkbox - adjust props/structure as needed */}
                <Checkbox
                    checked={disablePosts}
                    onChange={(e) => setDisablePosts(e.target.checked)}
                    disabled={isSubmitting || !targetUserId}
                    color="danger"
                >
                    Disable Posting
                </Checkbox>
                <Checkbox
                    checked={disableComments}
                    onChange={(e) => setDisableComments(e.target.checked)}
                    disabled={isSubmitting || !targetUserId}
                    color="danger"
                >
                    Disable Commenting
                </Checkbox>
                <Checkbox
                    checked={disableMessaging}
                    onChange={(e) => setDisableMessaging(e.target.checked)}
                    disabled={isSubmitting || !targetUserId}
                    color="danger"
                >
                    Disable Messaging
                </Checkbox>
             </div>
             <div className="mt-3 pl-2">
                 <label htmlFor="restrictionDays" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Restriction Duration (Days)
                 </label>
                 <Input
                    id="restrictionDays"
                    type="number"
                    min="0"
                    step="1"
                    value={restrictionDays.toString()} // Input value is string
                    onChange={(e) => setRestrictionDays(e.target.value)} // Store as string/number
                    placeholder="Optional"
                    // Disable if submitting, no target user, or no restriction type is checked
                    disabled={isSubmitting || !targetUserId || !(disablePosts || disableComments || disableMessaging)}
                    className="w-32"
                 />
                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Leave blank or set &gt 0 for timed restriction. Set 0 for indefinite.</p>
             </div>
        </div>

         <hr className="dark:border-gray-600"/>

         {/* Final Status Selection */}
         <div>
             <label htmlFor="finalStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Set Final Report Status
             </label>
             <select
                id="finalStatus"
                value={finalStatus}
                onChange={(e) => setFinalStatus(e.target.value as 'resolved' | 'dismissed')}
                disabled={isSubmitting}
                className="px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
             >
                <option value="resolved">Resolved (Action Taken/Needed)</option>
                <option value="dismissed">Dismissed (No Action Needed)</option>
             </select>
         </div>

        {/* Error Display */}
        {error && (
          <p className="text-sm text-red-600 text-center mt-2">{error}</p>
        )}

        {/* Modal Footer Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t dark:border-gray-600 mt-4">
          <Button
            type="button"
            variant="ghost" // Example HeroUI variant
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            color="primary" // Example HeroUI color
            isLoading={isSubmitting}
            // Disable submit if submitting OR if trying to apply restrictions without a target user ID
            disabled={isSubmitting || (applyRestrictions && !targetUserId)}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Resolution'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}