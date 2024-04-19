import React, { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from 'reactflow';

import 'reactflow/dist/style.css';

const initialNodes = [
  { id: '1', position: { x: 10, y: 10 }, data: { label: '1' } },
  { id: '2', position: { x: 10, y: 100 }, data: { label: '2' } },
];
const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodeTitle, setNodeTitle] = useState('');
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [deleteNodePosition, setDeleteNodePosition] = useState({ x: 0, y: 0 });
  const [showDeleteIcon, setShowDeleteIcon] = useState(false);
  const [edgePositions, setEdgePositions] = useState({});
  const [hoveredEdgeId, setHoveredEdgeId] = useState(null);

  useEffect(() => {
    const positions = {};
    edges.forEach((edge) => {
      const sourceNode = nodes.find((node) => node.id === edge.source);
      const targetNode = nodes.find((node) => node.id === edge.target);
      if (sourceNode && targetNode) {
        const sourcePosition = {
          x: sourceNode.position.x,
          y: sourceNode.position.y,
        };
        const targetPosition = {
          x: targetNode.position.x,
          y: targetNode.position.y,
        };
        positions[edge.id] = { sourcePosition, targetPosition };
      }
    });
    setEdgePositions(positions);
  }, [nodes, edges]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleCreateNode = () => {
    const newNodeId = (nodes.length + 1).toString();
    const newNode = {
      id: newNodeId,
      position: { x: 100, y: 100 },
      data: { label: newNodeId },
    };
    setNodes((prevNodes) => [...prevNodes, newNode]);
  };

  const handleNodeClick = (event, node) => {
    setSelectedNode(node);
    setNodeTitle(node.data.label);
  };

  const handleNodeTitleChange = (event) => {
    setNodeTitle(event.target.value);
  };

  const handleSaveNodeTitle = () => {
    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === selectedNode.id ? { ...node, data: { ...node.data, label: nodeTitle } } : node
      )
    );
    setSelectedNode(null);
    setNodeTitle('');
  };

  const handleNodeDelete = (nodeToDelete) => {
    setNodes((prevNodes) => prevNodes.filter((node) => node.id !== nodeToDelete.id));
    setEdges((prevEdges) =>
      prevEdges.filter((edge) => edge.source !== nodeToDelete.id && edge.target !== nodeToDelete.id)
    );
  };

  const handleEdgeDelete = (edgeToDelete) => {
    setEdges((prevEdges) => prevEdges.filter((edge) => edge.id !== edgeToDelete.id));
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: '200px', padding: '20px', display: 'flex', backgroundColor: '#EDF4FF' }}>
        <button style={{ padding: '20px', backgroundColor: 'orange', alignSelf: 'center' }} onClick={handleCreateNode}>
          Create Node
        </button>
      </div>
      <div style={{ flex: 1, position: 'relative' }}>
        <ReactFlow
          elements={nodes.concat(edges)}
          onElementsRemove={(_elementsToRemove, elementsToRemove) => {
            const nodeIdsToRemove = elementsToRemove
              .filter((el) => el.type === 'node')
              .map((el) => el.id);
            setNodes((prevNodes) =>
              prevNodes.filter((node) => !nodeIdsToRemove.includes(node.id))
            );
            setEdges((prevEdges) =>
              prevEdges.filter(
                (edge) =>
                  !(
                    nodeIdsToRemove.includes(edge.source) ||
                    nodeIdsToRemove.includes(edge.target)
                  )
              )
            );
          }}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          onNodeMouseEnter={(event, node) => {
            setHoveredNodeId(node.id);
            setDeleteNodePosition({ x: node.position.x, y: node.position.y });
            setShowDeleteIcon(true);
          }}
          onNodeMouseLeave={() => setShowDeleteIcon(false)}
          onEdgeMouseEnter={(event, edge) => setHoveredEdgeId(edge.id)}
          onEdgeMouseLeave={() => setHoveredEdgeId(null)}
        >
          <Controls />
          <MiniMap />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
        {selectedNode && (
          <div style={{ position: 'absolute', top: 50, right: 50, padding: '40px 20px', backgroundColor: '#F7FADF', border: '1px solid black', zIndex: 999, borderRadius: '4px' }}>
            <input type="text" value={nodeTitle} onChange={handleNodeTitleChange} style={{ padding: '7px', marginRight: '5px' }} />
            <button style={{ padding: '7px', backgroundColor: '#5F7FFF', border: '1px solid blue' }} onClick={handleSaveNodeTitle}>Save</button>
          </div>
        )}
        {showDeleteIcon && (
          <button
            style={{
              position: 'absolute',
              top: deleteNodePosition.y - 20,
              left: deleteNodePosition.x + 140,
              padding: '5px',
              backgroundColor: 'white',
              color: 'red',
              cursor: 'pointer',
              zIndex: 999,
            }}
            onClick={() => handleNodeDelete(nodes.find((node) => node.id === hoveredNodeId))}
            onMouseEnter={() => setShowDeleteIcon(true)}
            onMouseLeave={() => setShowDeleteIcon(false)}
          >
            X
          </button>
        )}
        {hoveredEdgeId && edgePositions[hoveredEdgeId] && (
  <div
    style={{
      position: 'absolute',
      top: (edgePositions[hoveredEdgeId].sourcePosition.y + edgePositions[hoveredEdgeId].targetPosition.y) / 2 ,
      left: (edgePositions[hoveredEdgeId].sourcePosition.x + edgePositions[hoveredEdgeId].targetPosition.x) / 2+50 ,
      zIndex: 999,
    }}
    onMouseEnter={() => setHoveredEdgeId(hoveredEdgeId)}
    onMouseLeave={() => setHoveredEdgeId(null)}
  >
    <button
      style={{
        padding: '5px',
        backgroundColor: 'white',
        color: 'red',
        cursor: 'pointer',
      }}
      onClick={() => handleEdgeDelete(edges.find((edge) => edge.id === hoveredEdgeId))}
    >
      X
    </button>
  </div>
)}

      </div>
    </div>
  );
}
