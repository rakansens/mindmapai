import { Node } from 'reactflow';

export interface CopiedSubtree {
  root: Node;
  children: Node[];
}

export interface TopicTree {
  label: string;
  children: TopicTree[];
  description?: string;
} 