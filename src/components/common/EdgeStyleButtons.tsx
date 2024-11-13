import React from 'react';
import { useMindMapStore } from '../../store/mindMapStore';
import { cn } from '../../utils/cn';

const edgeStyles = [
  {
    id: 'bezier',
    icon: '⟿',
    label: 'ベジェ曲線'
  },
  {
    id: 'smoothstep',
    icon: '↝',
    label: '直角曲線'
  },
  {
    id: 'organic',
    icon: '⌇',
    label: '自然曲線'
  }
] as const;

export const EdgeStyleButtons = () => {
  const { edgeStyle, setEdgeStyle } = useMindMapStore();

  return (
    <div className="flex gap-2">
      {edgeStyles.map((style) => (
        <button
          key={style.id}
          onClick={() => setEdgeStyle(style.id)}
          className={cn(
            "w-10 h-10 rounded-lg border text-lg flex items-center justify-center",
            "transition-all duration-200 hover:bg-blue-50",
            edgeStyle === style.id
              ? "border-blue-500 bg-blue-50 text-blue-600"
              : "border-gray-200 text-gray-600"
          )}
          title={style.label}
        >
          {style.icon}
        </button>
      ))}
    </div>
  );
};
