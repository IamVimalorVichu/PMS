import React from 'react';

interface MetricDisplayProps {
    label: string;
    value: string | number | undefined | null;
    unit?: string; // Optional unit like '%' or 'Jobs'
    isLoading?: boolean; // Optional: Show skeleton/placeholder if loading
    className?: string; // Allow custom styling
}

/**
 * A simple component to display a labeled metric value.
 * Handles basic formatting and optional loading state.
 */
const MetricDisplay: React.FC<MetricDisplayProps> = ({
    label,
    value,
    unit = '',
    isLoading = false,
    className = '',
}) => {
    const displayValue = value ?? '-'; // Show '-' if value is null or undefined

    if (isLoading) {
        return (
            <div className={`p-3 border rounded-lg bg-gray-50 ${className}`}>
                <div className="text-sm font-medium text-gray-500">{label}</div>
                <div className="mt-1 h-6 w-1/2 animate-pulse rounded bg-gray-300"></div>
            </div>
        );
    }

    return (
        <div className={`p-3 border rounded-lg bg-gray-50 ${className}`}>
            <dt className="text-sm font-medium text-gray-500 truncate">{label}</dt>
            <dd className="mt-1 text-xl font-semibold text-gray-900">
                {displayValue}
                {unit && value != null ? `${unit}` : ''}
            </dd>
        </div>
    );
};

export default MetricDisplay;