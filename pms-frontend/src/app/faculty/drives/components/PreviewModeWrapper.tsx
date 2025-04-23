import React from 'react';

// Common wrapper component to handle preview mode styling
export const PreviewModeWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
      {children}
    </div>
  );
};

// Helper to create read-only form fields
export const ReadOnlyField = ({ label, value }: { label: string; value: string | number | null | undefined }) => {
  return (
    <div className="mb-4">
      <div className="text-sm font-medium text-gray-600 mb-1">{label}</div>
      <div className="text-gray-900 bg-white p-2 rounded border border-gray-200 min-h-[2rem]">
        {value || '-'}
      </div>
    </div>
  );
};