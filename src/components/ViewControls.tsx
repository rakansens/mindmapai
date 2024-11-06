import React from 'react';
import { useReactFlow } from 'reactflow';
import { FiZoomIn, FiZoomOut, FiMaximize2, FiGrid } from 'react-icons/fi';
import { useMindMapStore } from '../store/mindMapStore';

export const ViewControls: React.FC = () => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { cycleLayout } = useMindMapStore();

  const handleClick = (callback: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    callback();
  };

  return (
    <div 
      className="absolute bottom-4 right-4 flex flex-col gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg z-50"
      onMouseDown={e => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <button
        onClick={handleClick(() => zoomIn())}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        title="ズームイン"
      >
        <FiZoomIn className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>
      <button
        onClick={handleClick(() => zoomOut())}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        title="ズームアウト"
      >
        <FiZoomOut className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>
      <button
        onClick={handleClick(() => fitView())}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        title="全体を表示"
      >
        <FiMaximize2 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>
      <button
        onClick={handleClick(() => cycleLayout())}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        title="レイアウトを変更"
      >
        <FiGrid className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>
    </div>
  );
}; 