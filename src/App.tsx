import React from 'react';
import ReactFlow, {
  Background,
  Controls,
  NodeTypes,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { MindNode } from './components/MindNode';
import { Toolbar } from './components/Toolbar';
import { ApiKeyInput } from './components/ApiKeyInput';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useMindMapStore } from './store/mindMapStore';
import { useOpenAI } from './utils/openai';

const nodeTypes: NodeTypes = {
  mindNode: MindNode,
};

function Flow() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
  } = useMindMapStore();
  const { setApiKey } = useOpenAI();

  useKeyboardShortcuts();

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
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
        }}
        fitView
        className="bg-gray-50"
      >
        <Background />
        <Controls />
        <Toolbar />
      </ReactFlow>
    </>
  );
}

function App() {
  return (
    <div className="w-screen h-screen">
      <ReactFlowProvider>
        <Flow />
      </ReactFlowProvider>
    </div>
  );
}

export default App;