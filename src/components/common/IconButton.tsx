import React from 'react';
import { ButtonColorType } from '../../types/common';

interface IconButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  className?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  onClick,
  icon,
  title,
  className = ''
}) => {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
        text-gray-700 dark:text-gray-300
        transition-colors duration-200 ${className}`}
      title={title}
    >
      {icon}
    </button>
  );
}; 