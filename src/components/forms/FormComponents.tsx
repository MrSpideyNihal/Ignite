"use client";

import { cn } from "@/lib/utils";
import { forwardRef, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

// Input Component
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, icon, className, ...props }, ref) => {
        return (
            <div className="form-group">
                {label && (
                    <label className="label" htmlFor={props.id}>
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={cn(
                            "input",
                            icon && "pl-10",
                            error && "input-error",
                            className
                        )}
                        {...props}
                    />
                </div>
                {error && <p className="form-error">{error}</p>}
            </div>
        );
    }
);

Input.displayName = "Input";

// Select Component
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
    placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, options, placeholder, className, ...props }, ref) => {
        return (
            <div className="form-group">
                {label && (
                    <label className="label" htmlFor={props.id}>
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <select
                    ref={ref}
                    className={cn("select", error && "input-error", className)}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {error && <p className="form-error">{error}</p>}
            </div>
        );
    }
);

Select.displayName = "Select";

// Textarea Component
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, className, ...props }, ref) => {
        return (
            <div className="form-group">
                {label && (
                    <label className="label" htmlFor={props.id}>
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <textarea
                    ref={ref}
                    className={cn(
                        "input min-h-[100px] resize-y",
                        error && "input-error",
                        className
                    )}
                    {...props}
                />
                {error && <p className="form-error">{error}</p>}
            </div>
        );
    }
);

Textarea.displayName = "Textarea";

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "accent" | "outline" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    loading?: boolean;
    icon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = "primary",
            size = "md",
            loading = false,
            icon,
            children,
            className,
            disabled,
            ...props
        },
        ref
    ) => {
        const variants = {
            primary: "btn-primary",
            secondary: "btn-secondary",
            accent: "btn-accent",
            outline: "btn-outline",
            ghost: "btn-ghost",
            danger: "btn bg-red-500 hover:bg-red-600 text-white focus:ring-red-500",
        };

        const sizes = {
            sm: "px-3 py-1.5 text-xs",
            md: "px-4 py-2.5 text-sm",
            lg: "px-6 py-3 text-base",
        };

        return (
            <button
                ref={ref}
                className={cn(variants[variant], sizes[size], className)}
                disabled={disabled || loading}
                {...props}
            >
                {loading ? (
                    <>
                        <svg
                            className="animate-spin h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                        <span>Loading...</span>
                    </>
                ) : (
                    <>
                        {icon}
                        {children}
                    </>
                )}
            </button>
        );
    }
);

Button.displayName = "Button";

// Checkbox Component
interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    ({ label, description, className, ...props }, ref) => {
        return (
            <label className="flex items-start gap-3 cursor-pointer group">
                <input
                    ref={ref}
                    type="checkbox"
                    className={cn(
                        "mt-1 h-4 w-4 rounded border-gray-300 dark:border-gray-700 text-primary-500 focus:ring-primary-500 cursor-pointer",
                        className
                    )}
                    {...props}
                />
                <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary-500 transition-colors">
                        {label}
                    </span>
                    {description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {description}
                        </p>
                    )}
                </div>
            </label>
        );
    }
);

Checkbox.displayName = "Checkbox";

// Radio Component
interface RadioProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    description?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
    ({ label, description, className, ...props }, ref) => {
        return (
            <label className="flex items-start gap-3 cursor-pointer group">
                <input
                    ref={ref}
                    type="radio"
                    className={cn(
                        "mt-1 h-4 w-4 border-gray-300 dark:border-gray-700 text-primary-500 focus:ring-primary-500 cursor-pointer",
                        className
                    )}
                    {...props}
                />
                <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary-500 transition-colors">
                        {label}
                    </span>
                    {description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {description}
                        </p>
                    )}
                </div>
            </label>
        );
    }
);

Radio.displayName = "Radio";

// FormGroup Component
interface FormGroupProps {
    label: string;
    required?: boolean;
    children: React.ReactNode;
    className?: string;
}

export const FormGroup = ({ label, required, children, className }: FormGroupProps) => {
    return (
        <div className={cn("form-group", className)}>
            <label className="label">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {children}
        </div>
    );
};

