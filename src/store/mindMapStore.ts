import { create } from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  Node as ReactFlowNode,
  NodeChange,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  ReactFlowInstance,
} from 'reactflow';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import * as dagre from 'dagre';
import { TopicTree, TopicTreeNode } from '../types/common';

type LayoutType = 'horizontal' | 'vertical' | 'radial' | 'tree';
type LayoutDirection = 'TB' | 'BT' | 'LR' | 'RL';
type EdgeStyle = 'bezier' | 'smoothstep' | 'organic';

interface CopiedSubtree {
  root: ReactFlowNode;
  children: ReactFlowNode[];
}

interface MindMapState {
  nodes: ReactFlowNode[];
  edges: Edge[];
  layout: LayoutType;
  edgeStyle: EdgeStyle;
  history: HistoryState;
  isEditing: boolean;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (parentNode: ReactFlowNode | null, label: string, index?: number, totalSiblings?: number) => ReactFlowNode;
  updateNodeText: (id: string, text: string, withAnimation?: boolean) => void;
  updateNodePosition: (id: string, position: { x: number; y: number }) => void;
  setLayout: (layout: LayoutType) => void;
  setEdgeStyle: (style: EdgeStyle) => void;
  calculateLayout: () => void;
  updateNodeLabel: (id: string, newLabel: string) => void;
  updateNodesWithHistory: (nodes: ReactFlowNode[]) => void;
  undo: () => void;
  exitEditMode: () => void;
  deleteNode: (nodeId: string) => void;
  toggleCollapse: (nodeId: string) => void;
  copyNode: (nodeId: string) => void;
  pasteNode: (parentNodeId: string) => void;
  updateNodeColor: (nodeId: string, color: string) => void;
  copiedNode: CopiedSubtree | null;
  saveMap: () => void;
  loadMap: () => void;
  exportAsImage: () => void;
  exportAsPDF: () => void;
  exportAsJSON: () => void;
  importFromJSON: (jsonData: string) => void;
  autoSave: () => void;
  theme: 'light' | 'dark' | 'system';
  showMinimap: boolean;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleMinimap: () => void;
  focusNode: (nodeId: string) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  fitView: () => void;
  flowInstance: ReactFlowInstance | null;
  setFlowInstance: (instance: ReactFlowInstance) => void;
  updateNodeData: (id: string, data: any) => void;
  selectNode: (nodeId: string) => void;
  setNodeGenerating: (nodeId: string, isGenerating: boolean) => void;
  createNodesFromAIResponse: (parentId: string, response: TopicTree) => Promise<void>;
  addChildNode: (parentId: string) => void;
  addSiblingNode: (currentId: string) => void;
  autoLayout: () => void;
  layoutDirection: LayoutDirection;
  cycleLayout: () => void;
}

interface HistoryState {
  past: ReactFlowNode[][];
  present: ReactFlowNode[];
  future: ReactFlowNode[][];
}

const HORIZONTAL_SPACING = {
  horizontal: { main: 250, sub: 200 },
  vertical: { main: 200, sub: 150 },
  radial: { main: 250, sub: 200 },
  tree: { main: 250, sub: 200 },
};

const VERTICAL_SPACING = {
  horizontal: { main: 100, sub: 80 },
  vertical: { main: 120, sub: 100 },
  radial: { main: 100, sub: 80 },
  tree: { main: 120, sub: 100 },
};

export const useMindMapStore = create<MindMapState>((set, get) => ({
  nodes: [
    {
      id: '1',
      type: 'mindNode',
      data: { label: 'Central Topic' },
      position: { x: window.innerWidth / 2, y: window.innerHeight / 3 },
    },
  ],
  edges: [],
  layout: 'horizontal',
  edgeStyle: 'organic',
  history: {
    past: [],
    present: [],
    future: [],
  },
  isEditing: false,
  copiedNode: null,
  theme: 'light',
  showMinimap: false,
  flowInstance: null,
  layoutDirection: 'TB',

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection) => {
    set({
      edges: addEdge({
        ...connection,
        type: get().edgeStyle,
      }, get().edges),
    });
  },

  setEdgeStyle: (style: EdgeStyle) => {
    set((state) => ({
      edgeStyle: style,
      edges: state.edges.map(edge => ({
        ...edge,
        type: style
      }))
    }));
  },

  autoLayout: () => {
    const { nodes, edges, layoutDirection } = get();
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    
    const settings: Record<LayoutDirection, { nodesep: number; ranksep: number }> = {
      TB: { nodesep: 100, ranksep: 150 },
      BT: { nodesep: 100, ranksep: 150 },
      LR: { nodesep: 60, ranksep: 250 },
      RL: { nodesep: 60, ranksep: 250 },
    };

    dagreGraph.setGraph({ 
      rankdir: layoutDirection,
      ...settings[layoutDirection],
      align: 'DL',
      ranker: 'tight-tree',
      edgesep: 50,
      marginx: 20,
      marginy: 20,
      acyclicer: 'greedy'
    });

    nodes.forEach((node: ReactFlowNode) => {
      dagreGraph.setNode(node.id, { 
        width: 180, 
        height: layoutDirection === 'TB' || layoutDirection === 'BT' ? 60 : 80
      });
    });

    edges.forEach((edge: Edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const newNodes = nodes.map((node: ReactFlowNode) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - 90,
          y: nodeWithPosition.y - (layoutDirection === 'TB' || layoutDirection === 'BT' ? 30 : 40),
        },
      };
    });

    const newEdges = edges.map(edge => ({
      ...edge,
      type: get().edgeStyle,
      animated: false,
      style: {
        stroke: '#2563eb',
        strokeWidth: 2,
      },
    }));

    set({ 
      nodes: newNodes,
      edges: newEdges
    });
  },

  cycleLayout: () => {
    const directions: LayoutDirection[] = ['TB', 'LR', 'RL', 'BT'];
    const currentDirection = get().layoutDirection;
    const currentIndex = directions.indexOf(currentDirection);
    const nextDirection = directions[(currentIndex + 1) % directions.length];
    set({ layoutDirection: nextDirection });
    get().autoLayout();
  }
}));

// 自動保存の設定
if (typeof window !== 'undefined') {
  setInterval(() => {
    useMindMapStore.getState().autoSave();
  }, 60000); // 1分ごとに自動保存
}
