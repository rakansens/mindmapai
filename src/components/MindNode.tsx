import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Plus, Sparkles } from 'lucide-react';
import { useMindMapStore } from '../store/mindMapStore';
import { useTypingAnimation } from '../hooks/useTypingAnimation';
import { useOpenAI } from '../utils/openai';
import { useReactFlow } from 'reactflow';

const getNodeLevel = (edges: any[], nodeId: string): number => {
  let level = 0;
  let currentId = nodeId;

  while (true) {
    const parentEdge = edges.find(edge => edge.target === currentId);
    if (!parentEdge) break;
    level++;
    currentId = parentEdge.source;
  }

  return level;
};

export function MindNode({ id, data }: NodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [inputValue, setInputValue] = useState(data.label);
  const inputRef = useRef<HTMLInputElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<number>();
  const { updateNodeText, addNode, nodes, edges } = useMindMapStore();
  const { displayText, startTyping } = useTypingAnimation(data.label);
  const { generateMindMap, apiKey } = useOpenAI();
  const { fitView } = useReactFlow();

  const currentNode = nodes.find((n) => n.id === id);
  const level = getNodeLevel(edges, id);

  useEffect(() => {
    if (data.isNew) {
      startTyping();
    }
  }, [data.isNew, startTyping]);

  useEffect(() => {
    setInputValue(data.label);
  }, [data.label]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    setShowButtons(true);
  };

  const handleMouseLeave = () => {
    hideTimeoutRef.current = window.setTimeout(() => {
      setShowButtons(false);
    }, 300);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleBlur = () => {
    if (inputValue.trim() !== '') {
      updateNodeText(id, inputValue);
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

  const handleAddChild = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentNode) {
      const newNode = addNode(currentNode, 'New Topic');
      setTimeout(() => {
        fitView({ 
          duration: 400,
          padding: 0.3,
        });
      }, 100);
    }
  };

  const parseHierarchy = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    const hierarchy: { level: number; text: string; children: any[] }[] = [];
    let currentMain: any = null;
    let currentSub: any = null;

    lines.forEach(line => {
      const cleanText = line.replace(/^[└├│\s─]+/, '').trim();
      if (!cleanText || cleanText.startsWith('テーマ：')) return;

      if (line.startsWith('メインブランチ')) {
        currentMain = { level: 0, text: cleanText, children: [] };
        hierarchy.push(currentMain);
        currentSub = null;
      } else if (line.match(/^[└├]──\s/)) {
        currentSub = { level: 1, text: cleanText, children: [] };
        if (currentMain) currentMain.children.push(currentSub);
      } else if (line.match(/^\s+[└├]──\s/)) {
        const grandChild = { level: 2, text: cleanText, children: [] };
        if (currentSub) currentSub.children.push(grandChild);
      }
    });

    return hierarchy;
  };

  const generateNodes = async (
    parentNode: any,
    items: { text: string; children: any[] }[],
    level: number = 0
  ) => {
    for (const item of items) {
      await new Promise(resolve => setTimeout(resolve, 150));

      const newNode = addNode(parentNode, item.text);

      if (item.children && item.children.length > 0) {
        await generateNodes(newNode, item.children, level + 1);
      }

      if (level <= 1) {
        setTimeout(() => {
          fitView({
            duration: 400,
            padding: Math.max(0.1, 0.5 - (level * 0.1)),
            minZoom: 0.4,
            maxZoom: 1,
          });
        }, 50);
      }
    }
  };

  const handleGenerate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!apiKey) {
      alert('OpenAI APIキーを設定してください');
      return;
    }

    try {
      setIsGenerating(true);
      const response = await generateMindMap(data.label);
      const hierarchy = parseHierarchy(response);

      if (currentNode) {
        await generateNodes(currentNode, hierarchy);

        setTimeout(() => {
          fitView({ 
            duration: 800,
            padding: 0.3,
            minZoom: 0.4,
            maxZoom: 1,
          });
        }, 1000);
      }
    } catch (error) {
      console.error('AI生成エラー:', error);
      alert('マインドマップの生成に失敗しました');
    } finally {
      setIsGenerating(false);
    }
  };

  const getNodeStyle = () => {
    switch(level) {
      case 0:
        return 'bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-lg shadow-blue-200';
      case 1:
        return 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-semibold shadow-indigo-200';
      case 2:
        return 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-purple-200';
      default:
        return 'bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-violet-200';
    }
  };

  return (
    <div
      ref={nodeRef}
      className="relative group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Handle 
        type="target" 
        position={Position.Left} 
        className={`w-3 h-3 transition-all duration-300 ${showButtons ? 'scale-125' : ''}`} 
      />
      <div 
        className={`min-w-[120px] rounded-xl shadow-lg p-4 transition-all duration-300 transform
          ${getNodeStyle()}
          ${showButtons ? 'scale-105' : ''}
          ${data.isNew ? 'animate-fadeIn' : ''}
          hover:shadow-xl`}
        onClick={handleClick}
      >
        {isEditing ? (
          <input
            ref={inputRef}
            className="w-full bg-transparent outline-none text-white placeholder-white/70 focus:ring-2 focus:ring-white/30 rounded px-1"
            value={inputValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        ) : (
          <div className={`cursor-text ${data.isNew ? 'typing-cursor' : ''} font-medium`}>
            {data.isNew ? displayText : data.label}
          </div>
        )}
      </div>
      <Handle 
        type="source" 
        position={Position.Right} 
        className={`w-3 h-3 transition-all duration-300 ${showButtons ? 'scale-125' : ''}`} 
      />
      {showButtons && (
        <div className="absolute -right-24 top-1/2 -translate-y-1/2 flex gap-2 animate-fadeIn">
          <button
            className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full text-white 
              hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg
              hover:shadow-xl hover:scale-110"
            onClick={handleAddChild}
            onMouseEnter={handleMouseEnter}
            title="子ノードを追加"
          >
            <Plus size={16} />
          </button>
          <button
            className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full text-white 
              hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg
              hover:shadow-xl hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleGenerate}
            onMouseEnter={handleMouseEnter}
            disabled={isGenerating}
            title="AIで展開"
          >
            {isGenerating ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <Sparkles size={16} />
            )}
          </button>
        </div>
      )}
    </div>
  );
}