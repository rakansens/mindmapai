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
  children: TopicTree[];
  description?: string;
} 