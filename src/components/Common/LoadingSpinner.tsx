import React from 'react';
import { clsx } from 'clsx';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'white' | 'gray';
  className?: string;
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className,
  text,
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  const colorClasses = {
    primary: 'border-police-600',
    white: 'border-white',
    gray: 'border-gray-600',
  };

  const spinnerClasses = clsx(
    'animate-spin rounded-full border-2 border-t-transparent',
    sizeClasses[size],
    colorClasses[color],
    className
  );

  if (text) {
    return (
      <div className="flex flex-col items-center justify-center space-y-2">
        <div className={spinnerClasses} />
        <p className="text-sm text-gray-600">{text}</p>
      </div>
    );
  }

  return <div className={spinnerClasses} />;
};

export default LoadingSpinner;