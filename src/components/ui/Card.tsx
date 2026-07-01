import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  glow?: boolean;
  scanline?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className = '',
  header,
  footer,
  glow = false,
  scanline = false,
  children,
  ...props
}) => {
  return (
    <div
      className={`cyber-panel rounded-[3px] border border-cyber-blue/15 overflow-hidden ${
        glow ? 'shadow-[0_0_25px_rgba(0,240,255,0.06)]' : ''
      } ${scanline ? 'scanline-static' : ''} ${className}`}
      {...props}
    >
      {/* HUD Corners */}
      <span className="hud-corner hud-tl"></span>
      <span className="hud-corner hud-tr"></span>
      <span className="hud-corner hud-bl"></span>
      <span className="hud-corner hud-br"></span>

      {header && (
        <div className="cyber-panel-header px-4 py-3 border-b border-cyber-blue/10 font-mono text-xs font-semibold tracking-wider text-cyber-blue flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-cyber-blue rounded-full cyber-pulse"></span>
            {header}
          </div>
          <span className="text-[10px] opacity-40">SYS.ON // CODE_HEARHIM</span>
        </div>
      )}
      
      <div className="p-5 relative z-10">
        {children}
      </div>

      {footer && (
        <div className="px-4 py-2.5 bg-slate-950/50 border-t border-cyber-blue/10 font-mono text-[10px] text-slate-500 flex items-center justify-between select-none">
          {footer}
        </div>
      )}
    </div>
  );
};
