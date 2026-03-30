import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

interface OGQInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: ReactNode;
}

export const OGQInput = forwardRef<HTMLInputElement, OGQInputProps>(
  ({ label, helperText, error, leftIcon, className = "", ...props }, ref) => (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-[#262d2e] dark:text-gray-200 mb-1.5">{label}</label>}
      <div className="relative">
        {leftIcon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a7b6b9]">{leftIcon}</span>}
        <input
          ref={ref}
          className={`w-full bg-white dark:bg-gray-900 border rounded-[10px] text-sm text-[#262d2e] dark:text-white placeholder:text-[#a7b6b9] transition-all outline-none ${leftIcon ? "pl-10" : "pl-3"} pr-3 py-2.5 ${error ? "border-[#e21235] focus:ring-2 focus:ring-[#e21235]/20" : "border-[#d8dfdf] dark:border-gray-700 focus:border-[#00c389] focus:ring-2 focus:ring-[#00c389]/20"} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-[#e21235] mt-1">{error}</p>}
      {helperText && !error && <p className="text-xs text-[#a7b6b9] mt-1">{helperText}</p>}
    </div>
  )
);
OGQInput.displayName = "OGQInput";
