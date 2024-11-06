import React from 'react';
import { ButtonColorType } from '../../types/common';

interface GenerateButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: ButtonColorType;
}

export const GenerateButton: React.FC<GenerateButtonProps> = ({
  onClick,
  icon,
  title,
  description,
  color
}) => {
  const colorStyles = {
    blue: 'from-blue-500/10 to-blue-600/10 hover:from-blue-500/20 hover:to-blue-600/20',
    purple: 'from-purple-500/10 to-purple-600/10 hover:from-purple-500/20 hover:to-purple-600/20',
    green: 'from-green-500/10 to-green-600/10 hover:from-green-500/20 hover:to-green-600/20',
    orange: 'from-orange-500/10 to-orange-600/10 hover:from-orange-500/20 hover:to-orange-600/20',
    yellow: 'from-yellow-500/10 to-yellow-600/10 hover:from-yellow-500/20 hover:to-yellow-600/20'
  };

  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-xl bg-gradient-to-r ${colorStyles[color]}
        text-left transition-all duration-200 group`}
    >
      <span className={`inline-block p-2 rounded-lg bg-${color}-500 text-white mb-2 
        group-hover:scale-110 transition-transform`}
      >
        {icon}
      </span>
      <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
        {title}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {description}
      </div>
    </button>
  );
}; 