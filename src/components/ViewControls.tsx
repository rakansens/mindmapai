import React from 'react';
import { MiniMap } from 'reactflow';
import { useMindMapStore } from '../store/mindMapStore';

const ViewControls: React.FC = () => {
  const { 
    theme, 
    setTheme, 
    showMinimap, 
    toggleMinimap,
    zoomIn,
    zoomOut,
    fitView,
  } = useMindMapStore();

  // イベント伝播を防止する関数
  const preventEvent = (e: React.MouseEvent | React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target instanceof HTMLElement) {
      e.target.style.pointerEvents = 'auto';
    }
  };

  return (
    <>
      {/* 表示コントロール */}
      <div 
        className="absolute bottom-4 right-4 flex flex-col gap-2"
        onMouseDown={preventEvent}
        onPointerDown={preventEvent}
        onClick={preventEvent}
        onDragStart={preventEvent}
        style={{ pointerEvents: 'auto', zIndex: 1000 }}
      >
        <div className="flex gap-2 items-center backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 p-2 rounded-xl shadow-lg border border-blue-100 dark:border-blue-500/30">
          {/* ズームコントロール */}
          <div className="flex gap-1">
            <button
              onClick={(e) => {
                preventEvent(e);
                zoomIn();
              }}
              className="p-2 rounded-lg hover:bg-blue-100/50 text-blue-500 transition-colors"
              title="ズームイン"
              style={{ cursor: 'pointer' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                preventEvent(e);
                zoomOut();
              }}
              className="p-2 rounded-lg hover:bg-blue-100/50 text-blue-500 transition-colors"
              title="ズームアウト"
              style={{ cursor: 'pointer' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                preventEvent(e);
                fitView();
              }}
              className="p-2 rounded-lg hover:bg-blue-100/50 text-blue-500 transition-colors"
              title="全体表示"
              style={{ cursor: 'pointer' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          </div>

          <div className="w-px h-8 bg-blue-100/50" />

          {/* テーマ切り替え */}
          <div className="flex gap-1">
            <button
              onClick={(e) => {
                preventEvent(e);
                setTheme('light');
              }}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'light' 
                  ? 'bg-blue-100/50 text-blue-600' 
                  : 'hover:bg-blue-100/50 text-blue-500'
              }`}
              title="ライトテーマ"
              style={{ cursor: 'pointer' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                preventEvent(e);
                setTheme('dark');
              }}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'bg-blue-100/50 text-blue-600'
                  : 'hover:bg-blue-100/50 text-blue-500'
              }`}
              title="ダークテーマ"
              style={{ cursor: 'pointer' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>
          </div>

          <div className="w-px h-8 bg-blue-100/50" />

          {/* ミニマップ切り替え */}
          <button
            onClick={(e) => {
              preventEvent(e);
              toggleMinimap();
            }}
            className={`p-2 rounded-lg transition-colors ${
              showMinimap
                ? 'bg-blue-100/50 text-blue-600'
                : 'hover:bg-blue-100/50 text-blue-500'
            }`}
            title="ミニマップ表示"
            style={{ cursor: 'pointer' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* ミニマップ */}
      {showMinimap && (
        <MiniMap
          className="bg-white/80 backdrop-blur-sm rounded-xl border border-blue-100"
          maskColor="rgba(0, 0, 0, 0.1)"
          nodeColor={(node) => {
            return node.data?.color || '#ffffff';
          }}
        />
      )}
    </>
  );
};

export default ViewControls; 