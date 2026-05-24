import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  ({ children, className = '', ...props }, ref) => (
    <div ref={ref} className={`flex flex-col gap-2 w-full ${className}`} {...props}>
      {children}
    </div>
  )
);
Field.displayName = 'Field';

interface FieldLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

export const FieldLabel = React.forwardRef<HTMLLabelElement, FieldLabelProps>(
  ({ children, className = '', ...props }, ref) => (
    <label
      ref={ref}
      className={`text-xs text-slate-400 font-medium ms-1 block leading-5 ${className}`}
      {...props}
    >
      {children}
    </label>
  )
);
FieldLabel.displayName = 'FieldLabel';

interface FieldErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {
  errors?: (string | undefined | null | { message?: string })[];
}

export const FieldError = React.forwardRef<HTMLParagraphElement, FieldErrorProps>(
  ({ errors, className = '', ...props }, ref) => {
    const error = errors?.[0];
    if (!error) return null;
    
    const message = typeof error === 'string' ? error : error.message;
    if (!message) return null;

    return (
      <p
        ref={ref}
        className={`text-[10px] text-red-400 ms-1 mt-0.5 font-medium ${className}`}
        {...props}
      >
        {message}
      </p>
    );
  }
);
FieldError.displayName = 'FieldError';

interface FieldDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export const FieldDescription = React.forwardRef<HTMLParagraphElement, FieldDescriptionProps>(
  ({ children, className = '', ...props }, ref) => (
    <p
      ref={ref}
      className={`text-xs text-slate-500 ms-1 mt-0.5 ${className}`}
      {...props}
    >
      {children}
    </p>
  )
);
FieldDescription.displayName = 'FieldDescription';

interface FieldGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const FieldGroup = React.forwardRef<HTMLDivElement, FieldGroupProps>(
  ({ children, className = '', ...props }, ref) => (
    <div ref={ref} className={`space-y-5 ${className}`} {...props}>
      {children}
    </div>
  )
);
FieldGroup.displayName = 'FieldGroup';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className = '', icon, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    
    const isInvalid = props['aria-invalid'] === true || props['aria-invalid'] === 'true';

    return (
      <div className="relative">
        {icon ? (
          <div className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none flex items-center justify-center">
            {icon}
          </div>
        ) : null}
        <input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          className={`w-full bg-slate-800 rounded-xl ${
            icon ? 'ps-10' : 'px-4'
          } pe-12 py-3 text-white border focus:outline-none transition-all ${
            isInvalid
              ? 'border-red-500/50 focus:border-red-500'
              : 'border-white/10 focus:border-primary'
          } ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors p-1"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    );
  }
);
PasswordInput.displayName = 'PasswordInput';
