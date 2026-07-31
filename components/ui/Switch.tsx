'use client';

/**
 * Switch - A reusable toggle switch component
 * Following Liquid Glass design system
 */

import React from 'react';

interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    ariaLabel?: string;
    className?: string;
    disabled?: boolean;
}

export function Switch({
    checked,
    onChange,
    ariaLabel,
    className = "",
    disabled = false,
}: SwitchProps) {
    return (
        <label
            className={`
        switch relative inline-flex items-center cursor-pointer 
        h-[30px] w-[50px] shrink-0
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
        >
            <input
                type="checkbox"
                className="sr-only peer"
                checked={checked}
                onChange={(e) => !disabled && onChange(e.target.checked)}
                aria-label={ariaLabel}
                disabled={disabled}
            />
            <div
                className={`
          switch-slider w-full h-full rounded-[var(--radius-full)] 
          bg-[color-mix(in_srgb,var(--text-color)_20%,transparent)] 
          peer-checked:bg-[var(--accent-color)] 
          transition-colors duration-[0.4s] cubic-bezier(0.2,0.8,0.2,1) 
          before:content-[''] before:absolute before:h-[26px] before:w-[26px] 
          before:left-[2px] before:bottom-[2px] 
          before:bg-white before:rounded-[var(--radius-full)] 
          before:transition-transform before:duration-[0.4s] 
          before:cubic-bezier(0.2,0.8,0.2,1) 
          before:shadow-[0_1px_3px_rgba(0,0,0,0.2)] 
          peer-checked:before:translate-x-[20px]
          active:before:scale-95
        `}
            ></div>
        </label>
    );
}
