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
import { Zap, FileText, HelpCircle, ListChecks } from 'lucide-react';
import { ChevronUp, ChevronDown } from 'lucide-react';

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
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [inputValue, setInputValue] = useState(data.label);
  const [descriptionValue, setDescriptionValue] = useState(data.description || '');
  const [showDescription, setShowDescription] = useState(false);
  
  const [showGenerateButton, setShowGenerateButton] = useState(false);
  
  const { activeMenuNodeId, setActiveMenuNodeId } = useMenuStore();
  const showGenerateMenu = activeMenuNodeId === id;

  const { 
    handleQuickGenerate, 
    handleDetailedGenerate,
    handleWhyGenerate,
    handleHowGenerate 
  } = useAIGeneration();

  const { setNodeGenerating } = useMindMapStore();
  
  // 生成ハンドラー
  const handleGenerate = async (generator: (nodeId: string) => Promise<void>) => {
    try {
      setNodeGenerating(id, true);
      await generator(id);
      setActiveMenuNodeId(null);
    } catch (error) {
      console.error('Generation failed:', error);
      alert('生成に失敗しました');
    } finally {
      setNodeGenerating(id, false);
    }
  };

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
      
      // メニューにマウスが移動する時間を保するため、遅延を設定
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
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isEditing) {
      store.selectNode(id);
    }
  }, [isEditing, id, store]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isEditing) {
      setInputValue(data.label);
      setIsEditing(true);
      setShowDescription(false);
      store.selectNode(id);
    }
  }, [isEditing, data.label, id, store]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (isEditing) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (inputValue.trim() !== '') {
          store.updateNodeData(id, {
            ...data,
            label: inputValue,
          });
          store.addSiblingNode(id);
        }
        setIsEditing(false);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        if (inputValue.trim() !== '') {
          store.updateNodeData(id, {
            ...data,
            label: inputValue,
          });
          store.addChildNode(id);
        }
        setIsEditing(false);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setInputValue(data.label);
        setIsEditing(false);
      }
    }
  }, [isEditing, inputValue, data, id, store]);

  const handleDescriptionClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isEditing && !isEditingDescription) {
      setIsEditingDescription(true);
      setDescriptionValue(data.description || '');
    }
  };

  const handleDescriptionBlur = () => {
    store.updateNodeData(id, {
      ...data,
      description: descriptionValue
    });
    setIsEditingDescription(false);
  };

  // 編集終了時のハンドラーを追加
  const handleBlur = useCallback(() => {
    if (inputValue.trim() !== '') {
      store.updateNodeData(id, {
        ...data,
        label: inputValue,
      });
    } else {
      setInputValue(data.label);
    }
    setIsEditing(false);
  }, [inputValue, data, id, store]);

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
          className={`relative min-w-[100px] rounded-lg shadow-lg
            transition-all duration-300 transform
            ${getNodeStyle(level)}
            ${data.selected ? 'ring-2 ring-blue-500' : ''}
            ${data.isGenerating ? 'generating-animation' : ''}
            ${showDescription && !isEditing ? 'p-2.5' : 'p-2'}
            hover:shadow-xl`}
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {isEditing ? (
            <input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent outline-none text-white text-sm"
              autoFocus
            />
          ) : (
            <div className={`flex flex-col ${showDescription ? 'gap-1.5' : 'gap-0.5'}`}>
              <div className="text-white flex items-center justify-between text-sm">
                <span>{data.label}</span>
                {data.isGenerating && (
                  <div className="flex items-center gap-1 ml-2">
                    <Sparkles 
                      size={14} 
                      className="text-blue-400 sparkle-animation" 
                    />
                    <span className="text-xs text-blue-400 generating-text typing-animation">
                      生成中...
                    </span>
                  </div>
                )}
              </div>

              {data.description && !isEditing && (
                <div className="mt-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDescription(!showDescription);
                    }}
                    className="text-xs text-blue-300/80 hover:text-blue-200 
                      flex items-center gap-1 px-2 py-0.5 rounded-md
                      hover:bg-white/5 transition-colors"
                  >
                    {showDescription ? (
                      <>
                        <ChevronUp size={12} />
                        <span className="text-[10px]">説明を閉じる</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown size={12} />
                        <span className="text-[10px]">説明を表示</span>
                      </>
                    )}
                  </button>

                  {showDescription && (
                    <div 
                      className={`mt-1.5 text-xs leading-relaxed text-white/90 
                        bg-black/10 backdrop-blur-sm
                        rounded-lg p-2.5 
                        border border-white/10
                        min-w-[400px] max-w-[500px] h-[150px]
                        whitespace-pre-wrap
                        hover:bg-black/20 transition-colors cursor-text`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!isEditingDescription) {
                          setIsEditingDescription(true);
                          setDescriptionValue(data.description || '');
                        }
                      }}
                    >
                      {isEditingDescription ? (
                        <textarea
                          value={descriptionValue}
                          onChange={(e) => setDescriptionValue(e.target.value)}
                          onBlur={handleDescriptionBlur}
                          className="w-full h-full bg-transparent rounded 
                            text-white text-xs outline-none resize-none
                            overflow-y-auto"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <div className="h-full overflow-y-auto">
                          {data.description.split('\n').map((line, index) => (
                            <React.Fragment key={index}>
                              {line.startsWith('•') ? (
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
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 生成ボタン - ホバー時のみ表示 (右側に配置) */}
        {showGenerateButton && (
          <button
            ref={buttonRef}
            onMouseEnter={handleGenerateButtonMouseEnter}
            className={`absolute top-1/2 -right-12 -translate-y-1/2
              ${nodeStyles.button} ${nodeStyles.generateButton}
              transition-opacity duration-200
              ${showGenerateButton ? 'opacity-100' : 'opacity-0'}`}
            title="AI成メニューを開く"
          >
            <Sparkles size={16} />
          </button>
        )}

        {/* 生成メニュー (下に配置) */}
        {showGenerateMenu && (
          <div
            ref={generateMenuRef}
            onMouseLeave={handleGenerateMenuMouseLeave}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-4 z-50"
          >
            <div className="flex gap-2 p-2 bg-white/90 dark:bg-gray-800/90
              rounded-xl shadow-lg border border-gray-200 dark:border-gray-700
              backdrop-blur-sm backdrop-saturate-150
              transition-all duration-300"
            >
              <GenerateMenuButton
                onClick={() => handleGenerate(handleQuickGenerate)}
                icon={<Zap size={20} className="stroke-2" />}
                tooltip="シンプル生成: 3階層の単語ツリー"
                color="blue"
              />
              <GenerateMenuButton
                onClick={() => handleGenerate(handleDetailedGenerate)}
                icon={<FileText size={20} className="stroke-2" />}
                tooltip="詳細生成: 説明文付きの展開"
                color="purple"
              />
              <GenerateMenuButton
                onClick={() => handleGenerate(handleWhyGenerate)}
                icon={<HelpCircle size={20} className="stroke-2" />}
                tooltip="Why分析: 理由の展開"
                color="green"
              />
              <GenerateMenuButton
                onClick={() => handleGenerate(handleHowGenerate)}
                icon={<ListChecks size={20} className="stroke-2" />}
                tooltip="How分析: 手順の展開"
                color="orange"
              />
            </div>
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} />
    </>
  );
};

// 生成メニューボタンのコンポーネント
interface GenerateMenuButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  tooltip: string;
  color: 'blue' | 'purple' | 'green' | 'orange';
}

const GenerateMenuButton: React.FC<GenerateMenuButtonProps> = ({
  onClick,
  icon,
  tooltip,
  color
}) => {
  const colorStyles = {
    blue: 'hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    purple: 'hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    green: 'hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400',
    orange: 'hover:bg-orange-50 dark:hover:bg-orange-900/20 text-orange-600 dark:text-orange-400',
  };

  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={`p-2.5 rounded-lg
        transition-all duration-200
        ${colorStyles[color]}
        hover:scale-110 hover:shadow-md
        group relative
        tooltip-trigger`}
    >
      {icon}
    </button>
  );
};

export default CustomNode;