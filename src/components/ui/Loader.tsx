import React from 'react';

interface LoaderProps {
  label?: string;
  text?: string;
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Loader: React.FC<LoaderProps> = ({
  label,
  text = 'Loading...',
  fullScreen = false,
  size = 'md',
}) => {
  const displayText = label || text;
  const sizeClasses =
    size === 'sm' ? 'w-6 h-6 border-2' : size === 'lg' ? 'w-12 h-12 border-4' : 'w-10 h-10 border-3';

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center ${
        fullScreen ? 'fixed inset-0 bg-white/80 backdrop-blur-xs z-50 min-h-screen' : 'min-h-[300px] h-full w-full'
      }`}
    >
      <div className={`${sizeClasses} border-[#1c3352]/20 border-t-[#1c3352] rounded-full animate-spin mb-3`} />
      {displayText && <p className="text-xs font-bold text-slate-500 tracking-wide">{displayText}</p>}
    </div>
  );
};
