import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  glow?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', glow = false, children, ...props }, ref) => {
    const baseStyles = "relative font-mono uppercase text-xs font-semibold tracking-wider transition-all duration-300 active:scale-97 disabled:opacity-40 disabled:pointer-events-none rounded-[3px] py-2.5 px-5 border cursor-pointer select-none";
    
    let variantStyles = "";
    if (variant === 'primary') {
      variantStyles = "bg-cyber-blue/10 border-cyber-blue/50 text-cyber-blue hover:bg-cyber-blue hover:text-black hover:border-cyber-blue";
      if (glow) variantStyles += " shadow-[0_0_8px_rgba(0,240,255,0.25)] hover:shadow-[0_0_15px_rgba(0,240,255,0.5)]";
    } else if (variant === 'secondary') {
      variantStyles = "bg-electric-teal/10 border-electric-teal/50 text-electric-teal hover:bg-electric-teal hover:text-black hover:border-electric-teal";
      if (glow) variantStyles += " shadow-[0_0_8px_rgba(13,242,201,0.25)] hover:shadow-[0_0_15px_rgba(13,242,201,0.5)]";
    } else if (variant === 'danger') {
      variantStyles = "bg-red-500/10 border-red-500/50 text-red-400 hover:bg-red-500 hover:text-black hover:border-red-500";
      if (glow) variantStyles += " shadow-[0_0_8px_rgba(239,68,68,0.25)] hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]";
    } else if (variant === 'ghost') {
      variantStyles = "bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40";
    }

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles} ${className}`}
        {...props}
      >
        {/* Subtle HUD micro-corners */}
        <span className="absolute top-0 left-0 w-1 h-[2px] bg-current opacity-30"></span>
        <span className="absolute top-0 left-0 w-[2px] h-1 bg-current opacity-30"></span>
        <span className="absolute bottom-0 right-0 w-1 h-[2px] bg-current opacity-30"></span>
        <span className="absolute bottom-0 right-0 w-[2px] h-1 bg-current opacity-30"></span>
        
        <span className="relative z-10 flex items-center justify-center gap-2">
          {children}
        </span>
      </button>
    );
  }
);
Button.displayName = 'Button';
