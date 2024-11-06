import React from 'react';
import ReactFlow, {
  Background,
  NodeTypes,
  ConnectionLineType,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Toolbar } from './Toolbar';
import CustomNode from './nodes/CustomNode';
import CustomEdge from './nodes/CustomEdge';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useMindMapStore } from '../store/mindMapStore';
import { useMenuStore } from '../store/menuStore';
import { ViewControls } from './ViewControls';

const nodeTypes: NodeTypes = {
  mindNode: CustomNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

function MindMap() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setFlowInstance,
  } = useMindMapStore();

  const { setActiveMenuNodeId } = useMenuStore();

  useKeyboardShortcuts();

  const handlePaneClick = () => {
    setActiveMenuNodeId(null);
  };

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      defaultEdgeOptions={{
        type: 'custom',
        animated: true,
      }}
      connectionLineType={ConnectionLineType.SmoothStep}
      fitView
      className="bg-blue-50 dark:bg-gray-900"
      onInit={setFlowInstance}
      onPaneClick={handlePaneClick}
      proOptions={{ hideAttribution: true }}
    >
      <Background color="#2563eb" gap={16} size={1} />
      <Toolbar />
      <ViewControls />
    </ReactFlow>
  );
}

export default MindMap;