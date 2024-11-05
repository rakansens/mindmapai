import React, { useRef, useState, useEffect } from 'react';
import { useMindMapStore } from '../store/mindMapStore';
import { useAIGeneration } from '../hooks/useAIGeneration';
import { CSSTransition } from 'react-transition-group';

interface NodeMenuProps {
  nodeId: string;
  position: { x: number; y: number };
  onClose: () => void;
}

const NodeMenu: React.FC<NodeMenuProps> = ({ nodeId, position, onClose }) => {
  const { setNodeGenerating } = useMindMapStore();
  const { 
    handleQuickGenerate, 
    handleDetailedGenerate,
    handleWhyGenerate 
  } = useAIGeneration();
  const menuRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(true);

  const handleGenerate = async (generator: (nodeId: string) => Promise<void>) => {
    try {
      // ノードの生成状態を設定
      setNodeGenerating(nodeId, true);
      
      // 生成実行
      await generator(nodeId);
      
      // メニューを閉じる
      setIsOpen(false);
      setTimeout(() => {
        onClose();
      }, 200);
    } catch (error) {
      console.error('Generation error:', error);
      alert('生成に失敗しました');
    } finally {
      // 生成状態をリセット
      setNodeGenerating(nodeId, false);
    }
  };

  // メニューの外側をクリックした時の処理
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setTimeout(() => {
          onClose();
        }, 200);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <CSSTransition
      in={isOpen}
      timeout={200}
      classNames="menu-fade"
      unmountOnExit
    >
      <div
        ref={menuRef}
        className="absolute bg-white rounded-lg shadow-lg p-2 z-50"
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        <div className="flex flex-col gap-2">
          <button
            onClick={() => handleGenerate(handleQuickGenerate)}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-md"
          >
            アイデア生成
          </button>
          <button
            onClick={() => handleGenerate(handleDetailedGenerate)}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-md"
          >
            詳細生成
          </button>
          <button
            onClick={() => handleGenerate(handleWhyGenerate)}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-md"
          >
            質問生成
          </button>
        </div>
      </div>
    </CSSTransition>
  );
};

export default NodeMenu;