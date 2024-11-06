import React from 'react';
import { DESCRIPTION_BOX_STYLES } from '../../styles/commonStyles';

interface NodeDescriptionProps {
  description: string;
  isEditing: boolean;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
}

export const NodeDescription: React.FC<NodeDescriptionProps> = ({
  description,
  isEditing,
  value,
  onChange,
  onBlur,
  onKeyDown,
  onDoubleClick,
}) => {
  if (isEditing) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        onDoubleClick={onDoubleClick}
        className={`w-full bg-transparent rounded 
          text-white text-xs outline-none resize-none
          overflow-y-auto`}
        style={DESCRIPTION_BOX_STYLES}
        autoFocus
      />
    );
  }

  return (
    <div 
      className="text-xs leading-relaxed text-white/90 overflow-y-auto"
      style={DESCRIPTION_BOX_STYLES}
    >
      {description.split('\n').map((line, index) => (
        <React.Fragment key={index}>
          {line.startsWith('') ? (
            <div className="flex items-start gap-1.5 mt-1">
              <span className="text-blue-400/80 mt-0.5">•</span>
              <span>{line.substring(1).trim()}</span>
            </div>
          ) : (
            <p className="mb-1.5">{line}</p>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}; 