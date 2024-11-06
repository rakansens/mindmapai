import { Node as ReactFlowNode } from 'reactflow';

export interface HierarchyItem {
  level: number;
  text: string;
  children: HierarchyItem[];
}

export interface CopiedSubtree {
  root: ReactFlowNode;
  children: ReactFlowNode[];
}

export interface TopicTree {
  label: string;
  children: TopicTreeNode[];
}

export interface TopicTreeNode {
  label: string;
  description?: string;
  children: TopicTreeNode[];
}

export interface GenerateOptions {
  mode: 'quick' | 'detailed' | 'why' | 'how' | 'ideas';
  style?: string;
  depth?: number;
  count?: number;
}

// color プロパティの型を拡張
export type ButtonColorType = 'blue' | 'purple' | 'green' | 'orange' | 'yellow';

export interface GenerateMenuButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  tooltip: string;
  color: ButtonColorType;
} 