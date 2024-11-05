import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useMindMapStore } from '../store/mindMapStore';
import { Handle, Position } from 'reactflow';
import { Sparkles } from 'lucide-react';
import { useAIGeneration } from '../hooks/useAIGeneration';
import { getNodeLevel, getNodeStyle } from '../utils/nodeUtils';
import { nodeStyles } from '../styles/commonStyles';
import { useMenuStore } from '../store/menuStore';
import { HierarchyItem } from '../types/common';
import { GenerateMenu } from './GenerateMenu';

interface CustomNodeProps {
  data: {
    label: string;
    isEditing?: boolean;
    isGenerating?: boolean;
    isCollapsed?: boolean;
    color?: string;
    description?: string;
    selected?: boolean;
  };
  id: string;
}

const CustomNode: React.FC<CustomNodeProps> = ({ data, id }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [inputValue, setInputValue] = useState(data.label);
  const [showGenerateButton, setShowGenerateButton] = useState(false);
  
  const { activeMenuNodeId, setActiveMenuNodeId } = useMenuStore();
  const showGenerateMenu = activeMenuNodeId === id;

  const inputRef = useRef<HTMLInputElement>(null);
  const generateMenuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const store = useMindMapStore();
  const level = getNodeLevel(store.edges, id);

  // ボタン表示用のタイマー
  const buttonTimeoutRef = useRef<NodeJS.Timeout>();
  // メニュー用のタイマー
  const menuTimeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseEnter = () => {
    // 既存のタイマーをクリア
    if (buttonTimeoutRef.current) {
      clearTimeout(buttonTimeoutRef.current);
    }
    setShowGenerateButton(true);
  };

  const handleMouseLeave = () => {
    // ボタンの表示を1秒間維持
    buttonTimeoutRef.current = setTimeout(() => {
      setShowGenerateButton(false);
      
      // メニューにマウスが移動する時間を確保するため、遅延を設定
      menuTimeoutRef.current = setTimeout(() => {
        if (!generateMenuRef.current?.matches(':hover')) {
          setActiveMenuNodeId(null);
        }
      }, 300);
    }, 1000); // 1秒のディレイ
  };

  const handleGenerateButtonMouseEnter = () => {
    // 両方のタイマーをクリア
    if (buttonTimeoutRef.current) {
      clearTimeout(buttonTimeoutRef.current);
    }
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current);
    }
    setShowGenerateButton(true);
    setActiveMenuNodeId(id);
  };

  const handleGenerateMenuMouseLeave = () => {
    setActiveMenuNodeId(null);
  };

  // 基本的なハンドラー
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
    store.selectNode(id);
  };

  const handleBlur = () => {
    if (inputValue.trim() !== '') {
      store.updateNodeText(id, inputValue);
    } else {
      setInputValue(data.label);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setInputValue(data.label);
      setIsEditing(false);
    }
  };

  // コンポーネントのクリーンアップ
  useEffect(() => {
    return () => {
      if (buttonTimeoutRef.current) {
        clearTimeout(buttonTimeoutRef.current);
      }
      if (menuTimeoutRef.current) {
        clearTimeout(menuTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <Handle type="target" position={Position.Left} />
      <div 
        className="relative group"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div 
          className={`relative min-w-[120px] rounded-xl shadow-lg p-4 
            transition-all duration-300 transform
            ${getNodeStyle(level)}
            ${data.selected ? 'ring-2 ring-blue-500' : ''}
            hover:shadow-xl`}
          onClick={handleClick}
        >
          {isEditing ? (
            <input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent outline-none text-white placeholder-white/70"
              autoFocus
            />
          ) : (
            <div className="text-white">
              {data.label}
            </div>
          )}
        </div>

        {/* 生成ボタン - ホバー時のみ表示 */}
        {showGenerateButton && (
          <button
            ref={buttonRef}
            onMouseEnter={handleGenerateButtonMouseEnter}
            className={`absolute -right-12 top-1/2 -translate-y-1/2 
              ${nodeStyles.button} ${nodeStyles.generateButton}
              transition-opacity duration-200
              ${showGenerateButton ? 'opacity-100' : 'opacity-0'}`}
            title="AI生成メニューを開く"
          >
            <Sparkles size={16} />
          </button>
        )}

        {/* 生成メニュー */}
        {showGenerateMenu && (
          <div
            ref={generateMenuRef}
            onMouseLeave={handleGenerateMenuMouseLeave}
          >
            <GenerateMenu nodeId={id} />
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} />
    </>
  );
};

export default CustomNode;