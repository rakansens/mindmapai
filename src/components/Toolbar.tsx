import React from 'react';
import { Panel } from 'reactflow';
import { ZoomIn, ZoomOut, Maximize, Plus, Layout, ArrowRight, ArrowDown, Circle } from 'lucide-react';
import { useReactFlow } from 'reactflow';
import { useMindMapStore } from '../store/mindMapStore';

export function Toolbar() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { addNode, setLayout, calculateLayout } = useMindMapStore();

  const handleAddRootNode = () => {
    addNode(null, 'New Topic');
    setTimeout(() => {
      fitView({ 
        duration: 400,
        padding: 0.3,
      });
    }, 100);
  };

  const handleLayoutChange = (layout: 'horizontal' | 'vertical' | 'radial') => {
    setLayout(layout);
    setTimeout(() => {
      fitView({ 
        duration: 800,
        padding: 0.3,
        minZoom: 0.4,
        maxZoom: 1,
      });
    }, 100);
  };

  return (
    <Panel position="top-right" className="flex gap-2">
      <button
        className="p-2 rounded bg-white shadow-md hover:bg-gray-50 tooltip"
        onClick={handleAddRootNode}
        title="新しいルートノードを追加"
      >
        <Plus size={20} />
      </button>
      <div className="relative group">
        <button
          className="p-2 rounded bg-white shadow-md hover:bg-gray-50 tooltip"
          title="レイアウトを変更"
        >
          <Layout size={20} />
        </button>
        <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
            onClick={() => handleLayoutChange('horizontal')}
          >
            <ArrowRight size={16} />
            <span>横方向レイアウト</span>
          </button>
          <button
            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
            onClick={() => handleLayoutChange('vertical')}
          >
            <ArrowDown size={16} />
            <span>縦方向レイアウト</span>
          </button>
          <button
            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
            onClick={() => handleLayoutChange('radial')}
          >
            <Circle size={16} />
            <span>放射状レイアウト</span>
          </button>
        </div>
      </div>
      <button
        className="p-2 rounded bg-white shadow-md hover:bg-gray-50 tooltip"
        onClick={() => {
          calculateLayout();
          setTimeout(() => {
            fitView({ 
              duration: 400,
              padding: 0.3,
            });
          }, 100);
        }}
        title="レイアウトを整列"
      >
        <Layout size={20} />
      </button>
      <button
        className="p-2 rounded bg-white shadow-md hover:bg-gray-50 tooltip"
        onClick={() => zoomIn()}
        title="拡大"
      >
        <ZoomIn size={20} />
      </button>
      <button
        className="p-2 rounded bg-white shadow-md hover:bg-gray-50 tooltip"
        onClick={() => zoomOut()}
        title="縮小"
      >
        <ZoomOut size={20} />
      </button>
      <button
        className="p-2 rounded bg-white shadow-md hover:bg-gray-50 tooltip"
        onClick={() => fitView()}
        title="全体を表示"
      >
        <Maximize size={20} />
      </button>
    </Panel>
  );
}