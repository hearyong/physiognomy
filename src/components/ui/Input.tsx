import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  glow?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', glow = true, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full bg-slate-950/80 border border-cyber-blue/25 rounded-[3px] py-2 px-3 text-sm text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-cyber-blue/60 transition-all duration-300 ${
          glow ? 'focus:shadow-[0_0_8px_rgba(0,240,255,0.2)]' : ''
        } ${className}`}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
