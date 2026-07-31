import React, { memo } from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const BadgeComponent = memo(function Badge({
  children,
  variant = 'primary',
  className = '',
  icon,
  iconPosition = 'left'
}: BadgeProps) {
  const variants = {
    primary: "bg-[var(--accent-color)] text-white shadow-[var(--shadow-sm)]",
    secondary: "bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-color)]",
  };

  const iconElement = icon && (
    <span
      className={`inline-flex items-center justify-center ${iconPosition === 'left' ? 'mr-1' : 'ml-1'
        }`}
      style={{
        width: '0.875em',
        height: '0.875em',
        transform: 'translateZ(0)',
        willChange: 'auto',
      }}
    >
      {icon}
    </span>
  );

  return (
    <span
      className={`
        inline-flex items-center justify-center
        px-1.5 py-0.5
        rounded-[var(--radius-full)]
        text-[10px] font-semibold
        ${variants[variant]}
        ${className}
      `}
      style={{
        transform: 'translateZ(0)',
        willChange: 'auto',
      }}
    >
      {icon && iconPosition === 'left' && iconElement}
      {children}
      {icon && iconPosition === 'right' && iconElement}
    </span>
  );
});

// Export both named and default for compatibility
export const Badge = BadgeComponent;


