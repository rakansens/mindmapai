import React, { useState } from 'react';
import { useMindMapStore } from '../store/mindMapStore';
import { cn } from '../utils/cn';

// ツールチップの位置を調整
const Tooltip: React.FC<{ text: string; children: React.ReactNode; position?: 'top' | 'bottom' | 'left' }> = ({ 
  text, 
  children, 
  position = 'top' 
}) => {
  const positionClasses = {
    top: '-top-10 left-1/2 -translate-x-1/2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  };

  const arrowClasses = {
    top: '-bottom-1 left-1/2 -translate-x-1/2 border-t-gray-900/90',
    bottom: '-top-1 left-1/2 -translate-x-1/2 border-b-gray-900/90',
    left: '-right-1 top-1/2 -translate-y-1/2 border-l-gray-900/90',
  };

  return (
    <div className="group relative">
      {children}
      <div className={`absolute ${positionClasses[position]} px-3 py-1.5 
        bg-gray-900/90 text-white text-sm rounded-lg opacity-0 invisible
        group-hover:opacity-100 group-hover:visible transition-all duration-200
        whitespace-nowrap backdrop-blur-sm shadow-lg z-50`}
      >
        {text}
        <div className={`absolute ${arrowClasses[position]} 
          border-4 border-transparent`}
        />
      </div>
    </div>
  );
};

// レイアウトボタンの定義
const layouts = [
  {
    id: 'horizontal',
    icon: '⇔',
    label: '水平レイアウト'
  },
  {
    id: 'vertical',
    icon: '⇕',
    label: '垂直レイアウト'
  },
  {
    id: 'radial',
    icon: '☆',
    label: '放射状レイアウト'
  },
  {
    id: 'tree',
    icon: '⋈',
    label: 'ツリーレイアウト'
  }
] as const;

export const Toolbar: React.FC = () => {
  const store = useMindMapStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        store.importFromJSON(content);
      };
      reader.readAsText(file);
    }
  };

  const preventEvent = (e: React.MouseEvent | React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target instanceof HTMLElement) {
      e.target.style.pointerEvents = 'auto';
    }
  };

  return (
    <div
      className="absolute top-4 right-4 z-50"
      onMouseDown={preventEvent}
      onPointerDown={preventEvent}
      onClick={preventEvent}
      onDragStart={preventEvent}
      style={{ pointerEvents: 'auto' }}
    >
      {/* メインボタン - 左側にツールチップを表示 */}
      <Tooltip text="ツールメニューを開く" position="left">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl
            border border-blue-100 hover:border-blue-300 hover:bg-blue-50
            transform transition-all duration-300
            ${isOpen ? 'rotate-90 bg-blue-50' : ''}
          `}
          style={{ pointerEvents: 'auto', cursor: 'pointer' }}
        >
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </Tooltip>

      {/* ツールバーメニュー */}
      <div
        className={`
          absolute top-0 right-16
          transform transition-all duration-300 origin-right
          flex items-center gap-2
          ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
        `}
      >
        <div className="flex gap-2 items-center backdrop-blur-sm bg-white/80 p-2 rounded-xl shadow-lg border border-blue-100">
          {/* レイアウトボタン */}
          <div className="flex gap-1">
            {layouts.map((item) => (
              <Tooltip key={item.id} text={item.label} position="bottom">
                <button
                  onClick={() => store.setLayout(item.id as any)}
                  className={cn(
                    "w-9 h-9 rounded-lg border text-lg flex items-center justify-center",
                    "transition-all duration-200",
                    store.layout === item.id
                      ? "border-blue-500 bg-blue-50 text-blue-600"
                      : "border-gray-200 text-gray-600 hover:bg-blue-50/50"
                  )}
                >
                  {item.icon}
                </button>
              </Tooltip>
            ))}
          </div>

          <div className="w-px h-8 bg-blue-100/50" />

          {/* Save & Load */}
          <div className="flex gap-1">
            <Tooltip text="マインドマップを保存" position="bottom">
              <button
                onClick={(e) => {
                  preventEvent(e);
                  store.saveMap();
                }}
                className="p-2 rounded-lg hover:bg-blue-100/50 text-blue-500 transition-colors"
                title="保存"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              </button>
            </Tooltip>
            <Tooltip text="保存したマインドマップを復元" position="bottom">
              <button
                onClick={(e) => {
                  preventEvent(e);
                  store.loadMap();
                }}
                className="p-2 rounded-lg hover:bg-blue-100/50 text-blue-500 transition-colors"
                title="復元"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            </Tooltip>
          </div>

          <div className="w-px h-8 bg-blue-100/50" />

          {/* Export */}
          <div className="flex gap-1">
            <Tooltip text="画像として保存 (PNG)" position="bottom">
              <button
                onClick={(e) => {
                  preventEvent(e);
                  store.exportAsImage();
                }}
                className="p-2 rounded-lg hover:bg-emerald-100/50 text-emerald-500 transition-colors"
                title="画像出力"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
            </Tooltip>
            <Tooltip text="PDFとして保存" position="bottom">
              <button
                onClick={(e) => {
                  preventEvent(e);
                  store.exportAsPDF();
                }}
                className="p-2 rounded-lg hover:bg-rose-100/50 text-rose-500 transition-colors"
                title="PDF出力"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </button>
            </Tooltip>
          </div>

          <div className="w-px h-8 bg-blue-100/50" />

          {/* JSON Import/Export - ボタンサイズを統一 */}
          <div className="flex gap-1">
            <Tooltip text="JSONファイルとして出力" position="bottom">
              <button
                onClick={(e) => {
                  preventEvent(e);
                  store.exportAsJSON();
                }}
                className="p-2 rounded-lg hover:bg-violet-100/50 text-violet-500 transition-colors w-9 h-9 flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            </Tooltip>
            <Tooltip text="JSONファイルから読み込み" position="bottom">
              <label
                htmlFor="import-json"
                className="p-2 rounded-lg hover:bg-amber-100/50 text-amber-500 transition-colors cursor-pointer w-9 h-9 flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </label>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
                id="import-json"
              />
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
};
