import React, { useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  NodeTypes,
  ReactFlowProvider,
  ConnectionLineType,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { MindNode } from './components/MindNode';
import { Toolbar } from './components/Toolbar';
import { ApiKeyInput } from './components/ApiKeyInput';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useMindMapStore } from './store/mindMapStore';
import { useMenuStore } from './store/menuStore';
import { useOpenAI } from './utils/openai';
import CustomNode from './components/CustomNode';
import CustomEdge from './components/CustomEdge';
import ViewControls from './components/ViewControls';

const nodeTypes: NodeTypes = {
  mindNode: CustomNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

function Flow() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setFlowInstance,
  } = useMindMapStore();
  const { setApiKey } = useOpenAI();
  const { setActiveMenuNodeId } = useMenuStore();

  useKeyboardShortcuts();

  const handlePaneClick = () => {
    setActiveMenuNodeId(null);
  };

  return (
    <>
      <ApiKeyInput onSave={setApiKey} />
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
        className="bg-blue-50"
        onInit={setFlowInstance}
        onPaneClick={handlePaneClick}
      >
        <Background color="#2563eb" gap={16} size={1} />
        <Controls />
        <Toolbar />
        <ViewControls />
      </ReactFlow>
    </>
  );
}

function App() {
  useEffect(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  return (
    <div className="w-screen h-screen dark:bg-gray-900">
      <ReactFlowProvider>
        <Flow />
      </ReactFlowProvider>
    </div>
  );
}

export default App;