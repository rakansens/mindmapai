import { Edge, Node as ReactFlowNode } from 'reactflow';
import { HierarchyItem, TopicTree } from '../types/common';
import { theme } from '../styles/theme';

// ノードのレベルを計算
export const getNodeLevel = (edges: Edge[], nodeId: string): number => {
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

// TopicTreeをHierarchyItemに変換
export const parseTopicTree = (topicTree: TopicTree): HierarchyItem[] => {
  const hierarchy: HierarchyItem[] = [];
  
  const processNode = (node: TopicTree, level: number = 0): HierarchyItem => {
    const item: HierarchyItem = {
      level,
      text: node.label,
      children: []
    };
    
    if (node.children && node.children.length > 0) {
      item.children = node.children.map(child => processNode(child, level + 1));
    }
    
    return item;
  };

  if (topicTree.children) {
    hierarchy.push(...topicTree.children.map(child => processNode(child, 0)));
  }

  return hierarchy;
};

// ノードの位置を計算
export const calculateNodePosition = (
  parentNode: ReactFlowNode | null,
  index: number,
  totalSiblings: number,
  layout: 'horizontal' | 'vertical' | 'radial'
) => {
  if (!parentNode) {
    return { x: window.innerWidth / 2, y: window.innerHeight / 3 };
  }

  const { spacing } = theme;
  const verticalOffset = ((index - (totalSiblings - 1) / 2) * spacing.node[layout].sub);
  
  switch (layout) {
    case 'vertical':
      return {
        x: parentNode.position.x + ((index - (totalSiblings - 1) / 2) * spacing.node.vertical.sub),
        y: parentNode.position.y + spacing.node.vertical.main,
      };
    case 'radial':
      const angleStep = (Math.PI * 0.8) / Math.max(totalSiblings - 1, 1);
      const startAngle = -Math.PI * 0.4;
      const angle = startAngle + (index * angleStep);
      const radius = spacing.node.radial.main;
      return {
        x: parentNode.position.x + Math.cos(angle) * radius,
        y: parentNode.position.y + Math.sin(angle) * radius,
      };
    default: // horizontal
      return {
        x: parentNode.position.x + spacing.node.horizontal.main,
        y: parentNode.position.y + verticalOffset,
      };
  }
};

// ノードスタイルを取得
export const getNodeStyle = (level: number) => {
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