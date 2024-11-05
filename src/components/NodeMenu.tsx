import React, { useRef, useState, useEffect } from 'react';
import { useOpenAI } from '../hooks/useOpenAI';
import { useMindMapStore } from '../store/mindMapStore';
import { toast } from 'react-toastify';
import { CSSTransition } from 'react-transition-group';
import classNames from 'classnames';

interface NodeMenuProps {
  nodeId: string;
  position: { x: number; y: number };
  onClose: () => void;
}

const NodeMenu: React.FC<NodeMenuProps> = ({ nodeId, position, onClose }) => {
  const { generateMindMap } = useOpenAI();
  const { setNodeGenerating } = useMindMapStore();
  const menuRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(true);

  const handleGenerate = async (type: string) => {
    try {
      // ノードの生成状態を設定
      setNodeGenerating(nodeId, true);

      // 生成タイプに応じたプロンプトを設定
      const prompts: { [key: string]: string } = {
        'ideas': '新しいアイデアを3つ生成',
        'details': '詳細な説明を3つ生成',
        'questions': '関連する質問を3つ生成'
      };

      const response = await generateMindMap(prompts[type]);
      // レスポンスの処理
      await useMindMapStore.getState().createNodesFromAIResponse(nodeId, response);
      toast.success('マインドマップを生成しました');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('生成に失敗しました');
    } finally {
      // 生成状態をリセット
      setNodeGenerating(nodeId, false);
      // メニューを閉じる
      onClose();
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
            onClick={() => handleGenerate('ideas')}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-md"
          >
            アイデア生成
          </button>
          <button
            onClick={() => handleGenerate('details')}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-md"
          >
            詳細生成
          </button>
          <button
            onClick={() => handleGenerate('questions')}
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