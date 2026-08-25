import React from 'react';
import logoImg from '../../assets/logo.png';

export interface EdupyeLogoProps {
  className?: string;
}

export const EdupyeLogo: React.FC<EdupyeLogoProps> = ({ className = 'h-8' }) => {
  return (
    <img
      src={logoImg}
      alt="EDUPYE"
      className={`object-contain max-w-full ${className}`}
    />
  );
};
