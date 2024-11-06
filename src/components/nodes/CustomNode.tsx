import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useMindMapStore } from '../../store/mindMapStore';
import { Handle, Position } from 'reactflow';
import { Sparkles } from 'lucide-react';
import { useAIGeneration } from '../../hooks/useAIGeneration';
import { getNodeLevel, getNodeStyle } from '../../utils/nodeUtils';
import { useMenuStore } from '../../store/menuStore';
import { Zap, FileText, HelpCircle, ListChecks, Lightbulb, Image, Type, Trash, ChevronUp, ChevronDown } from 'lucide-react';
import { FiPlus } from 'react-icons/fi';
import { useGenerationStore } from '../../store/generationStore';
import { LoadingIndicator } from '../../components/common/LoadingIndicator';
import { animationClasses } from '../../styles/animations';
import classNames from 'classnames';

interface CustomNodeProps {
  data: {
    label: string;
    isEditing?: boolean;
    isGenerating?: boolean;
    isCollapsed?: boolean;
    color?: string;
    description?: string;
    selected?: boolean;
    images?: string[];
  };
  id: string;
}

// ノード内の画像表示コンポーネント
const NodeImage: React.FC<{ 
  url: string; 
  label: string;
  isGenerating?: boolean;
}> = ({ url, label, isGenerating }) => (
  <div className="mt-2 w-full rounded-md overflow-hidden bg-gray-800/20 relative">
    {isGenerating ? (
      <div className="w-full h-[120px] flex items-center justify-center bg-gray-800/50">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
      </div>
    ) : (
      <img
        src={url}
        alt={`Image for ${label}`}
        className="w-full h-[120px] object-cover hover:scale-105 transition-transform duration-200"
        onClick={(e) => {
          e.stopPropagation();
          window.open(url, '_blank');
        }}
      />
    )}
  </div>
);

const CustomNode: React.FC<CustomNodeProps> = ({ data, id }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [inputValue, setInputValue] = useState(data.label);
  const [descriptionValue, setDescriptionValue] = useState(data.description || '');
  const [showDescription, setShowDescription] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const { activeMenuNodeId, setActiveMenuNodeId } = useMenuStore();
  const showGenerateMenu = activeMenuNodeId === id;

  const { 
    handleQuickGenerate, 
    handleDetailedGenerate,
    handleWhyGenerate,
    handleHowGenerate,
    handleIdeaGenerate,
    handleImageGenerate,
  } = useAIGeneration();

  const { setNodeGenerating, addChildNode } = useMindMapStore();

  // generationStoreを使用
  const { isNodeGenerating } = useGenerationStore();
  const isGenerating = isNodeGenerating(id);

  // 生成ハンドラーを修正
  const handleGenerate = async (generator: (nodeId: string) => Promise<void>) => {
    try {
      // 生成状態を設定する前にアニメーションクラスを追加
      const nodeElement = document.querySelector(`[data-node-id="${id}"]`);
      if (nodeElement) {
        nodeElement.classList.add(animationClasses.generating);
      }

      // 生成状態を設定
      setNodeGenerating(id, true);

      await generator(id);
      setActiveMenuNodeId(null);
    } catch (error) {
      console.error('Generation failed:', error);
      alert('生成に失敗しました');
    } finally {
      // 生成状態をリセット
      setNodeGenerating(id, false);
      
      // アニメーションクラスを削除
      const nodeElement = document.querySelector(`[data-node-id="${id}"]`);
      if (nodeElement) {
        nodeElement.classList.remove(animationClasses.generating);
      }
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

  // マウスイベントハンドラーを修正
  const handleMouseEnter = () => {
    if (buttonTimeoutRef.current) {
      clearTimeout(buttonTimeoutRef.current);
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    buttonTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
      
      menuTimeoutRef.current = setTimeout(() => {
        if (!generateMenuRef.current?.matches(':hover')) {
          setActiveMenuNodeId(null);
        }
      }, 300);
    }, 1000);
  };

  const handleGenerateButtonMouseEnter = () => {
    if (buttonTimeoutRef.current) {
      clearTimeout(buttonTimeoutRef.current);
    }
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current);
    }
    setActiveMenuNodeId(id);
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
        e.stopPropagation();
        if (inputValue.trim() !== '') {
          store.updateNodeData(id, {
            ...data,
            label: inputValue,
          });
          setIsEditing(false);
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        e.stopPropagation();
        if (inputValue.trim() !== '') {
          store.updateNodeData(id, {
            ...data,
            label: inputValue,
          });
          setIsEditing(false);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        setInputValue(data.label);
        setIsEditing(false);
      }
    }
  }, [isEditing, inputValue, data, id, store]);

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

  const handleAddChild = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    addChildNode(id);
  }, [id, addChildNode]);

  // 説明文の追加/編集/削除ハンドラー
  const handleAddDescription = () => {
    // 既存の説明文をクリア
    setDescriptionValue('説明を入力してください');
    setShowDescription(true);
    setIsEditingDescription(true);
    setShowContextMenu(false);

    // 新説明を追加
    store.updateNodeData(id, {
      ...data,
      description: '明を入力してくだい'
    });
    
    // 説明を追加した後、すぐに編集モードを開始
    setTimeout(() => {
      const textArea = document.querySelector(`textarea[data-node-id="${id}"]`) as HTMLTextAreaElement;
      if (textArea) {
        textArea.focus();
        textArea.select();
      }
    }, 0);
  };

  const handleRemoveDescription = () => {
    // 説明文関連の全ての状態をリセット
    setDescriptionValue('');
    setShowDescription(false);
    setIsEditingDescription(false);
    setShowContextMenu(false);

    // ノードデータから説明を完全に削除
    store.updateNodeData(id, {
      ...data,
      description: undefined  // undefinedを設定して完全に削除
    });
  };

  // コンキストメニューを閉じるためのイベントリスナーを追加
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showContextMenu) {
        const target = e.target as HTMLElement;
        const menuElement = document.querySelector(`[data-context-menu="${id}"]`);
        if (menuElement && !menuElement.contains(target)) {
          setShowContextMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showContextMenu, id]);

  // 右クリックメニューハンドラーを修正
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // クリックされた要素の相対位置を取得
    const rect = e.currentTarget.getBoundingClientRect();
    setContextMenuPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setShowContextMenu(true);
  };

  // 説明文のードハンドラーを追加
  const handleDescriptionKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleDescriptionBlur();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newValue = descriptionValue.substring(0, start) + '\n' + descriptionValue.substring(end);
      setDescriptionValue(newValue);
      // カーソル位置を調整
      setTimeout(() => {
        e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 1;
      }, 0);
    }
  };

  // 画像生成用の独立したハンドラーを修正
  const handleGenerateImage = async () => {
    try {
      console.log('Starting image generation for node:', id);
      setIsGeneratingImage(true);
      
      await handleImageGenerate(id);
      
      // 生成後のノードデータを確認
      const updatedNode = store.nodes.find(n => n.id === id);
      console.log('Node data after generation:', {
        nodeId: id,
        data: updatedNode?.data
      });
      
    } catch (error) {
      console.error('Image generation failed:', error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // 説明文エリアのスタイルを定数として定義
  const DESCRIPTION_BOX_STYLES = `
    w-[300px] h-[120px]  // 固定サイズを設定
    bg-black/10 backdrop-blur-sm 
    rounded-lg p-2.5 
    border border-white/10 
    transition-all duration-200
  `;

  // nodeElementのstyle設定用のヘルパー関数
  const setNodeWidth = (element: Element | null, width: number) => {
    if (element instanceof HTMLElement) {
      element.style.width = `${width}px`;
    }
  };

  // 入力フィールドの変更ハンドラーを修正
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (inputRef.current) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (context) {
        context.font = '14px sans-serif';
        const metrics = context.measureText(e.target.value);
        const textWidth = metrics.width;
        const padding = 32;
        const minWidth = 120;
        const maxWidth = 400;
        const width = Math.min(maxWidth, Math.max(minWidth, textWidth + padding));
        
        const nodeElement = inputRef.current.closest('.node-container');
        setNodeWidth(nodeElement, width);
        
        if (inputRef.current) {
          inputRef.current.style.width = `${width - padding}px`;
        }
      }
    }
  };

  // メニューのマウスリーブハンドラーを追加
  const handleGenerateMenuMouseLeave = () => {
    menuTimeoutRef.current = setTimeout(() => {
      setActiveMenuNodeId(null);
    }, 300);
  };

  // アニメーション状態の管理を改善
  const [isAnimating, setIsAnimating] = useState(false);

  // 生成態に応じたクラスの適用
  const nodeClasses = classNames(
    'relative rounded-lg shadow-lg node-container',
    'transition-all duration-300 transform',
    getNodeStyle(level),  // ノードの階層に応じたスタイルを追加
    {
      'ring-2 ring-blue-500': data.selected,
      'border-2 border-purple-500': isGenerating,  // 生成中のボーダーを追加
      'bg-opacity-90 backdrop-blur-sm': isGenerating,  // 生成中はブラー効果
      'p-2.5': showDescription && !isEditing,
      'p-2': !(showDescription && !isEditing),
      'hover:shadow-xl': true
    }
  );

  return (
    <>
      <Handle type="target" position={Position.Left} />
      <div 
        className="relative group"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onContextMenu={handleContextMenu}
      >
        <div 
          data-node-id={id}  // ID属性を追加
          className={nodeClasses}  // 修正したクラスを適用
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
        >
          {/* ノードの内容 */}
          <div className="flex flex-col">
            {/* テキスト部分と説明トグルボタン */}
            <div className="flex items-start gap-2 px-2">
              <div className="flex-grow">
                {isEditing ? (
                  <div className="w-full">
                    <input
                      ref={inputRef}
                      value={inputValue}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      onKeyDown={handleKeyDown}
                      className="bg-transparent outline-none text-white text-sm py-1
                        min-w-[120px] max-w-[400px]"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                      onDoubleClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.currentTarget.select();
                      }}
                    />
                  </div>
                ) : (
                  <div 
                    className={`text-white text-sm
                      ${isGenerating ? 
                        'overflow-hidden whitespace-nowrap border-r-2 animate-typing animate-blink-caret' : 
                        'break-words'}`}
                    style={{
                      width: isGenerating ? '0%' : 'auto',  // 初期幅を0に設定
                      maxWidth: (() => {
                        const canvas = document.createElement('canvas');
                        const context = canvas.getContext('2d');
                        if (context) {
                          context.font = '14px sans-serif';
                          const metrics = context.measureText(data.label);
                          const textWidth = metrics.width;
                          const padding = 32;
                          const minWidth = 120;
                          const maxWidth = 400;
                          return `${Math.min(maxWidth, Math.max(minWidth, textWidth + padding))}px`;
                        }
                        return 'auto';
                      })(),
                    }}
                  >
                    <span className={isGenerating ? 'inline-block' : ''}>
                      {data.label}
                    </span>
                  </div>
                )}
                
                {/* 説明文インジケーターと説明文 */}
                {data.description && (
                  <div className="mt-1.5">
                    <div className="flex items-center gap-2">
                      <div 
                        className={`text-xs text-blue-300/80 cursor-pointer
                          flex items-center gap-1 hover:text-blue-200 transition-colors
                          ${showDescription ? 'text-blue-400' : 'text-blue-300/60'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDescription(!showDescription);
                        }}
                      >
                        {showDescription ? (
                          <>
                            <ChevronUp size={12} />
                            <span className="text-[10px] font-medium">説明を閉じる</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown size={12} />
                            <span className="text-[10px] font-medium">説明を表示</span>
                          </>
                        )}
                      </div>
                      {/* 編集ボタン */}
                      {showDescription && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsEditingDescription(true);
                          }}
                          className="text-xs text-blue-300/60 hover:text-blue-200 transition-colors"
                        >
                          <Type size={12} />
                        </button>
                      )}
                    </div>

                    {/* 説明文エリア */}
                    {showDescription && (
                      <div className="mt-2 bg-black/10 backdrop-blur-sm rounded-lg">
                        {isEditingDescription ? (
                          <textarea
                            data-node-id={id}
                            value={descriptionValue}
                            onChange={(e) => setDescriptionValue(e.target.value)}
                            onBlur={handleDescriptionBlur}
                            onKeyDown={handleDescriptionKeyDown}
                            onDoubleClick={(e) => {
                              e.preventDefault();  // デフォルトの動作を防止
                              e.stopPropagation();  // イベントの伝播を停止
                              e.currentTarget.select();  // テキストを全選択
                            }}
                            className={`${DESCRIPTION_BOX_STYLES}
                              text-white text-xs outline-none resize-none
                              overflow-y-auto bg-transparent
                              w-full`}
                            autoFocus
                            onClick={(e) => {
                              e.stopPropagation();  // クリックイベントの伝播を停止
                            }}
                            style={{
                              lineHeight: '1.5',
                              padding: '10px'
                            }}
                          />
                        ) : (
                          <div 
                            className={`${DESCRIPTION_BOX_STYLES}
                              text-xs leading-relaxed text-white/90 
                              overflow-y-auto cursor-text`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setIsEditingDescription(true);
                            }}
                            style={{
                              lineHeight: '1.5',
                              padding: '10px'
                            }}
                          >
                            {data.description.split('\n').map((line, index) => (
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
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 画像部分 */}
            {(data.images && data.images.length > 0 || isGeneratingImage) && !isEditing && (
              <NodeImage 
                url={data.images?.[0] || ''} 
                label={data.label}
                isGenerating={isGeneratingImage}
              />
            )}
          </div>

          {/* 生成中のインジケーター */}
          {isGenerating && (
            <div className="absolute inset-0 bg-black/30 rounded-lg 
              flex items-center justify-center backdrop-blur-sm">
              <LoadingIndicator 
                size="md"
                color="blue"
                className={animationClasses.loading}
              />
            </div>
          )}

          {/* サイドボタングループ */}
          {isHovered && (
            <div className="absolute -right-8 top-1/2 -translate-y-1/2 flex flex-col gap-2">
              {/* プラスボタン */}
              <button
                onClick={handleAddChild}
                className="p-1.5 rounded-full bg-blue-500 hover:bg-blue-600 
                  text-white shadow-lg transition-all z-10"
                title="子ノードを追加"
              >
                <FiPlus className="w-4 h-4" />
              </button>

              {/* AIアクションボタン */}
              <button
                ref={buttonRef}
                onMouseEnter={handleGenerateButtonMouseEnter}
                className={`p-1.5 rounded-full bg-purple-500 hover:bg-purple-600 
                  text-white shadow-lg transition-all z-10
                  ${isGenerating ? 'animate-pulse-scale' : ''}`}  // パルスアニメーション
                title="AI生成メニューを開く"
              >
                <Sparkles size={16} />
              </button>
            </div>
          )}
          {/* 生成メニュー - ツールチップ形式 */}
          {showGenerateMenu && (
            <div
              ref={generateMenuRef}
              onMouseLeave={handleGenerateMenuMouseLeave}
              className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full 
                mt-2 z-50 animate-fade-in"
            >
              <div className="flex gap-2 p-2 mt-2 bg-white/90 dark:bg-gray-800/90
                rounded-xl shadow-lg border border-gray-200 dark:border-gray-700
                backdrop-blur-sm backdrop-saturate-150"
              >
                <button
                  onClick={() => handleGenerate(handleQuickGenerate)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
                    text-gray-700 dark:text-gray-300 transition-colors"
                  title="クイック生成"
                >
                  <Zap className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleGenerate(handleDetailedGenerate)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
                    text-gray-700 dark:text-gray-300 transition-colors"
                  title="詳細生成"
                >
                  <FileText className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleGenerate(handleWhyGenerate)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
                    text-gray-700 dark:text-gray-300 transition-colors"
                  title="Why分析"
                >
                  <HelpCircle className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleGenerate(handleHowGenerate)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
                    text-gray-700 dark:text-gray-300 transition-colors"
                  title="How分析"
                >
                  <ListChecks className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleGenerate(handleIdeaGenerate)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
                    text-gray-700 dark:text-gray-300 transition-colors"
                  title="アイデア生成"
                >
                  <Lightbulb className="w-5 h-5" />
                </button>
                <button
                  onClick={handleGenerateImage}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
                    text-gray-700 dark:text-gray-300 transition-colors"
                  title="画像生成"
                >
                  <Image className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* コンテキストメニュー */}
          {showContextMenu && (
            <div 
              data-context-menu={id}
              className="absolute z-[9999] min-w-[160px] bg-white dark:bg-gray-800 
                rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 
                p-1 animate-fade-in"
              style={{
                left: `${contextMenuPosition.x}px`,
                top: `${contextMenuPosition.y}px`
              }}
              onClick={e => e.stopPropagation()}
            >
              {!data.description ? (
                <button
                  onClick={handleAddDescription}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm
                    text-gray-700 dark:text-gray-300 hover:bg-gray-100 
                    dark:hover:bg-gray-700 rounded-md"
                >
                  <FileText size={16} />
                  <span>説明を追加</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsEditingDescription(true);
                      setShowDescription(true);
                      setShowContextMenu(false);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm
                      text-gray-700 dark:text-gray-300 hover:bg-gray-100 
                      dark:hover:bg-gray-700 rounded-md"
                  >
                    <Type size={16} />
                    <span>説明を編集</span>
                  </button>
                  <button
                    onClick={handleRemoveDescription}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm
                      text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 
                      rounded-md"
                  >
                    <Trash size={16} />
                    <span>説明を削除</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Right} />
    </>
  );
};

export default CustomNode;