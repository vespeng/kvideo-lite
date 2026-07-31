import React, { forwardRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  children,
  className = '',
  ...props
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center px-4 py-2.5 md:px-6 md:py-3 font-semibold text-sm md:text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] touch-manipulation cursor-pointer";

  const variants = {
    primary: `
      bg-[var(--accent-color)] 
      text-white 
      border-none 
      rounded-[var(--radius-2xl)] 
      shadow-[0_2px_8px_color-mix(in_srgb,var(--shadow-color)_50%,transparent)]
      hover:brightness-110 
      hover:shadow-[0_4px_12px_color-mix(in_srgb,var(--shadow-color)_70%,transparent)]
      active:scale-[0.98] 
      active:brightness-95
    `,
    secondary: `
      bg-[var(--glass-bg)] 
      backdrop-blur-xl
      [-webkit-backdrop-filter:blur(25px)_saturate(180%)]
      saturate-[180%]
      border 
      border-[var(--glass-border)] 
      rounded-[var(--radius-2xl)]
      text-[var(--text-color)]
      shadow-[0_2px_8px_color-mix(in_srgb,var(--shadow-color)_50%,transparent)]
      hover:shadow-[0_4px_12px_color-mix(in_srgb,var(--shadow-color)_70%,transparent)]
      active:scale-[0.98]
    `,
    ghost: `
      bg-transparent
      text-[var(--text-color)]
      hover:bg-[var(--glass-border)]
      active:scale-[0.98]
    `,
  };

  return (
    <button
      ref={ref}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';


