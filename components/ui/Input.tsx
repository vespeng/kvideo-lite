import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[var(--text-color)] mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-3 md:px-6 md:py-4
            text-base md:text-[var(--text-color)]
            bg-[var(--glass-bg)]
            backdrop-blur-[10px]
            saturate-[150%]
            [-webkit-backdrop-filter:blur(10px)_saturate(150%)]
            border
            border-[var(--glass-border)]
            rounded-[var(--radius-2xl)]
            text-[var(--text-color)]
            placeholder:text-[var(--text-color-secondary)]
            focus:outline-none
            focus:border-[var(--accent-color)]
            focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent-color)_30%,transparent)]
            transition-all
            duration-[var(--transition-fluid)]
            touch-manipulation
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

