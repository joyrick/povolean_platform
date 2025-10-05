<script>
  import { SvelteFlow, Controls, Background, MiniMap, addEdge } from '@xyflow/svelte';
  
  // Import node components
  import PromptNode from './nodes/PromptNode.svelte';
  import OpenAINode from './nodes/OpenAINode.svelte';
  import GeminiNode from './nodes/GeminiNode.svelte';
  import OrchestratorNode from './nodes/OrchestratorNode.svelte';
  import OutputViewerNode from './nodes/OutputViewerNode.svelte';
  import TriggerNode from './nodes/TriggerNode.svelte';
  import ActionNode from './nodes/ActionNode.svelte';
  
  // Import node definitions
  import { NodeKinds, defaultNodes, defaultEdges } from './types.js';
  
  // Define node types
  const nodeTypes = {
    [NodeKinds.PROMPT]: PromptNode,
    [NodeKinds.LLM_OPENAI]: OpenAINode,
    [NodeKinds.LLM_GEMINI]: GeminiNode,
    [NodeKinds.ORCHESTRATOR]: OrchestratorNode,
    [NodeKinds.OUTPUT]: OutputViewerNode,
    
    // Trigger nodes
    [NodeKinds.TRIGGER_NEW_PROJECT]: TriggerNode,
    [NodeKinds.TRIGGER_SCHEDULE_UPDATE]: TriggerNode,
    [NodeKinds.TRIGGER_BIM_REVISION]: TriggerNode,
    [NodeKinds.TRIGGER_COST_UPDATE]: TriggerNode,
    [NodeKinds.TRIGGER_DEADLINE]: TriggerNode,
    [NodeKinds.TRIGGER_FORM_SUBMIT]: TriggerNode,
    [NodeKinds.TRIGGER_INSPECTION]: TriggerNode,
    [NodeKinds.TRIGGER_SAFETY_INCIDENT]: TriggerNode,
    [NodeKinds.TRIGGER_COMMENT]: TriggerNode,
    
    // Action nodes
    [NodeKinds.ACTION_AUTO_FILL_PERMIT]: ActionNode,
    [NodeKinds.ACTION_EXTRACT_BIM_DATA]: ActionNode,
    [NodeKinds.ACTION_UPDATE_SCHEDULE]: ActionNode,
    [NodeKinds.ACTION_PUSH_TO_SHEETS]: ActionNode,
    [NodeKinds.ACTION_SEND_APPROVAL]: ActionNode,
    [NodeKinds.ACTION_GENERATE_REPORT]: ActionNode,
    [NodeKinds.ACTION_UPLOAD_DOCS]: ActionNode,
    [NodeKinds.ACTION_SYNC_COST_DATA]: ActionNode,
    [NodeKinds.ACTION_NOTIFY_STAKEHOLDERS]: ActionNode,
    [NodeKinds.ACTION_CREATE_TASK]: ActionNode
  };
  
  // Create reactive stores
  import { writable } from 'svelte/store';
  // Add workflow logs store
  const workflowLogs = writable([]);
  function addLog(msg) {
    const timestamp = new Date().toLocaleTimeString();
    workflowLogs.update(l => [...l, `[${timestamp}] ${msg}`].slice(-500));
  }
  
  // Import applyNodeChanges for controlled node dragging
  import { applyNodeChanges } from '@xyflow/svelte';
  
  // Relax types so we can push dynamic nodes from DnD without TS narrowing issues
  /** @type {any} */
  const nodes = writable(/** @type {any[]} */ ([...defaultNodes]));
  const edges = writable([...defaultEdges]);
  
  // Handle connection creation
  function onConnect(connection) {
    edges.update(eds => addEdge(connection, eds));
  }

  
  // Node palette items - regular reactive variable
  let paletteItems = [
    { 
      type: 'triggers',
      icon: '⚡', 
      title: 'Triggers', 
      description: 'Event-based workflow starters',
      count: 9,
      expanded: true,
      items: [
        { icon: '📁', title: 'New Project in Revit/Archicad', description: 'Trigger when new project is created' },
        { icon: '📅', title: 'Schedule Updated in Revit', description: 'Trigger when project schedule changes' },
        { icon: '📋', title: 'BIM Model Revision Uploaded', description: 'Trigger when new model revision is uploaded' },
        { icon: '$', title: 'Cost Estimate Updated', description: 'Trigger when cost estimates change' },
        { icon: '📅', title: 'Deadline Approaching', description: 'Trigger when deadlines are near' },
        { icon: '📋', title: 'Form Submitted to Povolean', description: 'Trigger when forms are submitted' },
        { icon: '✅', title: 'New Inspection Report', description: 'Trigger when inspection is completed' },
        { icon: '🛡️', title: 'Safety Incident Logged', description: 'Trigger when safety incident occurs' },
        { icon: '🔔', title: 'New Comment/Revision Request', description: 'Trigger when feedback is received' }
      ]
    },
    { 
      type: 'actions',
      icon: '🔧', 
      title: 'Actions', 
      description: 'Automated workflow actions',
      count: 10,
      expanded: true,
      items: [
        { icon: '📋', title: 'Auto-fill Building Permit', description: 'Automatically fill permit applications' },
        { icon: '📋', title: 'Extract Data from BIM Model', description: 'Extract data and metadata from BIM files' },
        { icon: '📅', title: 'Update Schedule in Primavera/MS Project', description: 'Update project schedules automatically' },
        { icon: '📊', title: 'Push Data to Excel/Google Sheets', description: 'Export data to spreadsheets' },
        { icon: '✉️', title: 'Send Approval Request', description: 'Send approval requests to stakeholders' },
        { icon: '📋', title: 'Generate Compliance Report', description: 'Create regulatory compliance reports' },
        { icon: '📋', title: 'Upload Docs to BIM 360/SharePoint', description: 'Upload documents to cloud storage' },
        { icon: '$', title: 'Sync Cost Data with Archicad/Excel', description: 'Synchronize cost information' },
        { icon: '🔔', title: 'Notify Stakeholders', description: 'Send notifications to project team' },
        { icon: '✅', title: 'Auto-create Task in Asana/Trello', description: 'Create tasks in project management tools' }
      ]
    },
    { 
      type: 'input',
      icon: '💬', 
      title: 'Prompt', 
      description: 'Text input with variable support',
      count: 3,
      expanded: false
    },
    { 
      type: 'llms',
      icon: '🤖', 
      title: 'LLMs', 
      description: 'AI Language Models',
      count: 5,
      expanded: false,
      items: [
        { icon: '🤖', title: 'OpenAI', description: 'GPT-4, GPT-3.5 models' },
        { icon: '✨', title: 'Gemini', description: 'Google\'s Gemini models' },
        { icon: '🔶', title: 'Claude', description: 'Anthropic\'s Claude models' },
        { icon: '🏠', title: 'Local (Ollama)', description: 'Local LLM inference' },
        { icon: '☁️', title: 'Azure OpenAI', description: 'Microsoft Azure OpenAI' }
      ]
    },
    { 
      type: 'logic',
      icon: '⚡', 
      title: 'Logic', 
      description: 'Conditional and control flow',
      count: 7,
      expanded: false
    }
  ];
  
  let selectedNode = null;
  let selectedNodeId = null;
  let rfInstance;
  let isDragging = false;
  let dragCounter = 0;
  let searchQuery = '';
  let nodeOutput = null;
  let isRunning = false;
  let isTestRunning = false;
  let activeNodeId = null;
  let animatingEdges = new Set();
  let userInteracting = false;
  let terminalEl;
  
  // Use simple reactive statements but with object identity preservation
  $: enhancedNodes = $nodes.map(node => {
    const isActive = activeNodeId === node.id;
    const currentIsActive = node.data?.isActive;
    const currentIsTestRunning = node.data?.isTestRunning;
    
    // Return same object if no changes needed
    if (currentIsActive === isActive && currentIsTestRunning === isTestRunning) {
      return node;
    }
    
    // Only create new object when actually needed
    return {
      ...node,
      data: {
        ...node.data,
        isActive,
        isTestRunning
      }
    };
  });
  
  $: enhancedEdges = $edges.map(edge => {
    const isAnimated = animatingEdges.has(edge.id);
    const currentIsAnimated = edge.animated;
    
    // Return same object if no changes needed
    if (currentIsAnimated === isAnimated) {
      return edge;
    }
    
    // Only create new object when actually needed
    return {
      ...edge,
      animated: isAnimated,
      style: isAnimated ? 
        'stroke: #4a9eff; stroke-width: 4px; filter: drop-shadow(0 0 4px #4a9eff);' : 
        undefined,
      className: isAnimated ? 'animated' : undefined
    };
  });

  // Provide node action handler to all child components
  setContext('nodeActionHandler', handleNodeAction);

  function onInit(e) {
    rfInstance = e.detail;
  }

  // Handle node selection
  function onNodeClick(event, node) {
    selectedNodeId = node.id;
    selectedNode = { ...node }; // Create a copy to ensure reactivity
  }

  // Handle canvas click (deselect nodes)
  function onPaneClick() {
    selectedNodeId = null;
    selectedNode = null;
  }

  // Update node properties
  function updateNodeData(field, value) {
    if (!selectedNode) return;
    
    let updatedNode;
    nodes.update(nds => {
      return nds.map(node => {
        if (node.id === selectedNode.id) {
          if (field === 'position.x' || field === 'position.y') {
            const [, axis] = field.split('.');
            updatedNode = {
              ...node,
              position: {
                ...node.position,
                [axis]: parseFloat(value) || 0
              }
            };
            return updatedNode;
          } else if (field === 'name') {
            updatedNode = {
              ...node,
              data: {
                ...node.data,
                title: value || node.data.title
              }
            };
            return updatedNode;
          } else {
            updatedNode = {
              ...node,
              data: {
                ...node.data,
                [field]: value
              }
            };
            return updatedNode;
          }
        }
        return node;
      });
    });
    
    // Update selectedNode to reflect changes immediately
    if (updatedNode) {
      selectedNode = updatedNode;
    }
  }

  // Get node type display name
  function getNodeTypeDisplay(nodeType) {
    const typeMap = {
      [NodeKinds.PROMPT]: { icon: '💬', name: 'Prompt Node' },
      [NodeKinds.LLM_OPENAI]: { icon: '🤖', name: 'OpenAI LLM' },
      [NodeKinds.LLM_GEMINI]: { icon: '✨', name: 'Gemini LLM' },
      [NodeKinds.ORCHESTRATOR]: { icon: '⚡', name: 'Orchestrator' },
      [NodeKinds.OUTPUT]: { icon: '📄', name: 'Output Viewer' },
      [NodeKinds.TRIGGER_NEW_PROJECT]: { icon: '📁', name: 'New Project Trigger' },
      [NodeKinds.TRIGGER_SCHEDULE_UPDATE]: { icon: '📅', name: 'Schedule Update Trigger' },
      [NodeKinds.TRIGGER_BIM_REVISION]: { icon: '📋', name: 'BIM Revision Trigger' },
      [NodeKinds.ACTION_AUTO_FILL_PERMIT]: { icon: '📋', name: 'Auto-fill Permit Action' },
      [NodeKinds.ACTION_EXTRACT_BIM_DATA]: { icon: '📋', name: 'Extract BIM Data Action' }
    };
    
    return typeMap[nodeType] || { icon: '🔧', name: 'Unknown Node' };
  }

  // Handle node dropdown actions
  function handleNodeAction(action, nodeId, nodeType) {
    const node = $nodes.find(n => n.id === nodeId);
    if (!node) return;

    switch (action) {
      case 'run':
        selectedNode = node;
        selectedNodeId = nodeId;
        runNode();
        break;
      
      case 'duplicate':
        duplicateNode(node);
        break;
      
      case 'properties':
        selectedNode = { ...node };
        selectedNodeId = nodeId;
        break;
      
      case 'disable':
        toggleNodeDisabled(nodeId);
        break;
      
      case 'delete':
        deleteNode(nodeId);
        break;
    }
  }

  // Duplicate a node
  function duplicateNode(originalNode) {
    const newNode = {
      ...originalNode,
      id: `${originalNode.type}-${Date.now()}`,
      position: {
        x: originalNode.position.x + 50,
        y: originalNode.position.y + 50
      }
    };
    
    nodes.update(nds => [...nds, newNode]);
  }

  // Toggle node disabled state
  function toggleNodeDisabled(nodeId) {
    nodes.update(nds => 
      nds.map(node => 
        node.id === nodeId 
          ? { ...node, data: { ...node.data, disabled: !node.data.disabled } }
          : node
      )
    );
  }

  // Delete a node
  function deleteNode(nodeId) {
    // Remove the node
    nodes.update(nds => nds.filter(node => node.id !== nodeId));
    
    // Remove connected edges
    edges.update(eds => eds.filter(edge => 
      edge.source !== nodeId && edge.target !== nodeId
    ));
    
    // Clear selection if deleted node was selected
    if (selectedNodeId === nodeId) {
      selectedNode = null;
      selectedNodeId = null;
    }
  }

  // Run individual node
  async function runNode() {
    if (!selectedNode || isRunning) return;
    
    isRunning = true;
    nodeOutput = null;
    
    try {
      // Simulate node execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock output based on node type
      switch (selectedNode.type) {
        case NodeKinds.LLM_OPENAI:
        case NodeKinds.LLM_GEMINI:
          nodeOutput = {
            type: 'text',
            content: 'This is a sample LLM response. In a real implementation, this would be the actual AI-generated content based on the input prompt and model configuration.',
            timestamp: new Date().toLocaleTimeString(),
            tokens: Math.floor(Math.random() * 500) + 100
          };
          break;
        case NodeKinds.PROMPT:
          nodeOutput = {
            type: 'prompt',
            content: selectedNode.data.title || 'Sample prompt text',
            timestamp: new Date().toLocaleTimeString()
          };
          break;
        case NodeKinds.TRIGGER_NEW_PROJECT:
          nodeOutput = {
            type: 'trigger',
            content: 'Project "Building Alpha" detected in Revit. Trigger activated.',
            timestamp: new Date().toLocaleTimeString(),
            projectId: 'proj_' + Math.random().toString(36).substr(2, 9)
          };
          break;
        default:
          nodeOutput = {
            type: 'generic',
            content: 'Node executed successfully',
            timestamp: new Date().toLocaleTimeString()
          };
      }
    } catch (error) {
      nodeOutput = {
        type: 'error',
        content: 'Error executing node: ' + error.message,
        timestamp: new Date().toLocaleTimeString()
      };
    } finally {
      isRunning = false;
    }
  }

  // Test run workflow animation
  async function testRunWorkflow() {
    if (isTestRunning || isRunning) return;
    // Wait if user currently dragging to avoid race where old position re-applies
    if (userInteracting) {
      while (userInteracting) {
        await new Promise(r => setTimeout(r, 40));
      }
    }
    
    isTestRunning = true;
    activeNodeId = null;
    animatingEdges = new Set();
    addLog('Test run started');
    try {
      // Get all nodes and edges for the workflow
      const currentNodes = $nodes;
      const currentEdges = $edges;
      
      if (currentNodes.length === 0) {
        addLog('No nodes to animate');
        return;
      }
      
      // Build adjacency map for connected path traversal
      const adjacencyMap = new Map();
      const edgeMap = new Map(); // Map from source->target to edge ID
      
      // Initialize adjacency map
      currentNodes.forEach(node => {
        adjacencyMap.set(node.id, []);
      });
      
      // Build adjacency list with edge information
      currentEdges.forEach(edge => {
        if (adjacencyMap.has(edge.source) && adjacencyMap.has(edge.target)) {
          adjacencyMap.get(edge.source).push(edge.target);
          edgeMap.set(`${edge.source}->${edge.target}`, edge.id);
        }
      });
      
      // Find starting nodes (nodes with no incoming edges)
      const incomingNodes = new Set(currentEdges.map(e => e.target));
      const startingNodes = currentNodes.filter(node => !incomingNodes.has(node.id));
      
      // If no clear starting nodes, find the leftmost node or use the first node
      let rootNode;
      if (startingNodes.length > 0) {
        rootNode = startingNodes[0];
      } else if (currentNodes.length > 0) {
        // Find the node with the smallest X coordinate as starting point
        rootNode = currentNodes.reduce((min, node) => 
          node.position.x < min.position.x ? node : min
        );
      } else {
        return;
      }
      
      // Perform depth-first traversal to get connected execution order
      const executionOrder = [];
      const visited = new Set();
      
      async function traverseDepthFirst(nodeId, incomingEdgeId = null) {
        if (visited.has(nodeId)) return;
        
        visited.add(nodeId);
        const node = currentNodes.find(n => n.id === nodeId);
        if (!node) return;
        
        // Add this node to execution order
        executionOrder.push({
          node,
          incomingEdge: incomingEdgeId
        });
        
        // Get all connected nodes and traverse them
        const connectedNodes = adjacencyMap.get(nodeId) || [];
        for (const targetNodeId of connectedNodes) {
          const edgeId = edgeMap.get(`${nodeId}->${targetNodeId}`);
          await traverseDepthFirst(targetNodeId, edgeId);
        }
      }
      
      // Start traversal from root node
      await traverseDepthFirst(rootNode.id);
      
      // If there are unvisited nodes (disconnected components), add them
      for (const node of currentNodes) {
        if (!visited.has(node.id)) {
          await traverseDepthFirst(node.id);
        }
      }
      
      addLog(`Execution order: ${executionOrder.map(e => e.node.data?.title || e.node.id).join(' -> ')}`);
      
      // Animate the execution following the connected path
      for (let i = 0; i < executionOrder.length; i++) {
        if (userInteracting) { addLog('Test run cancelled by user interaction'); break; }
        const { node: currentNode, incomingEdge } = executionOrder[i];
        
        addLog(`Step ${i+1}: ${currentNode.data?.title || currentNode.id}`);
        
        // Clear previous node
        activeNodeId = null;
        
        // First animate the incoming edge if it exists
        if (incomingEdge) {
          animatingEdges.add(incomingEdge);
          // Edge animation duration - show data flowing
          await new Promise(resolve => setTimeout(resolve, 400));
        }
        
        // Then highlight the current node while edge is still glowing
        activeNodeId = currentNode.id;
        
        // Keep both edge and node active briefly to show connection
        await new Promise(resolve => setTimeout(resolve, 250));
        
        // Clear the edge animation
        if (incomingEdge) {
          animatingEdges.delete(incomingEdge);
        }
        
        // Node stays active a bit longer to show processing
        await new Promise(resolve => setTimeout(resolve, 400));
        
        // Small pause before moving to next node (node will be cleared at start of next iteration)
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Clear active state
      activeNodeId = null;
      addLog('Test run finished');
    } catch (error) {
      addLog('Test run error: ' + error.message);
      console.error(error);
    } finally {
      isTestRunning = false;
      animatingEdges.clear();
    }
  }

  // Toggle section expansion
  function toggleSection(sectionIndex) {
    paletteItems[sectionIndex].expanded = !paletteItems[sectionIndex].expanded;
  }

  // Filter sections based on search query
  $: filteredPaletteItems = searchQuery 
    ? paletteItems.map(section => ({
        ...section,
        items: section.items ? section.items.filter(item => 
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
        ) : undefined
      })).filter(section => 
        section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (section.items && section.items.length > 0)
      )
    : paletteItems;

  function toNodeKind(section, item) {
    const name = (item?.title || section.title) || '';
    
    // Trigger nodes
    if (name === 'New Project in Revit/Archicad') return NodeKinds.TRIGGER_NEW_PROJECT;
    if (name === 'Schedule Updated in Revit') return NodeKinds.TRIGGER_SCHEDULE_UPDATE;
    if (name === 'BIM Model Revision Uploaded') return NodeKinds.TRIGGER_BIM_REVISION;
    if (name === 'Cost Estimate Updated') return NodeKinds.TRIGGER_COST_UPDATE;
    if (name === 'Deadline Approaching') return NodeKinds.TRIGGER_DEADLINE;
    if (name === 'Form Submitted to Povolean') return NodeKinds.TRIGGER_FORM_SUBMIT;
    if (name === 'New Inspection Report') return NodeKinds.TRIGGER_INSPECTION;
    if (name === 'Safety Incident Logged') return NodeKinds.TRIGGER_SAFETY_INCIDENT;
    if (name === 'New Comment/Revision Request') return NodeKinds.TRIGGER_COMMENT;
    
    // Action nodes
    if (name === 'Auto-fill Building Permit') return NodeKinds.ACTION_AUTO_FILL_PERMIT;
    if (name === 'Extract Data from BIM Model') return NodeKinds.ACTION_EXTRACT_BIM_DATA;
    if (name === 'Update Schedule in Primavera/MS Project') return NodeKinds.ACTION_UPDATE_SCHEDULE;
    if (name === 'Push Data to Excel/Google Sheets') return NodeKinds.ACTION_PUSH_TO_SHEETS;
    if (name === 'Send Approval Request') return NodeKinds.ACTION_SEND_APPROVAL;
    if (name === 'Generate Compliance Report') return NodeKinds.ACTION_GENERATE_REPORT;
    if (name === 'Upload Docs to BIM 360/SharePoint') return NodeKinds.ACTION_UPLOAD_DOCS;
    if (name === 'Sync Cost Data with Archicad/Excel') return NodeKinds.ACTION_SYNC_COST_DATA;
    if (name === 'Notify Stakeholders') return NodeKinds.ACTION_NOTIFY_STAKEHOLDERS;
    if (name === 'Auto-create Task in Asana/Trello') return NodeKinds.ACTION_CREATE_TASK;
    
    // Core nodes
    if (name === 'Prompt') return NodeKinds.PROMPT;
    if (name === 'OpenAI') return NodeKinds.LLM_OPENAI;
    if (name === 'Gemini') return NodeKinds.LLM_GEMINI;
    
    // Placeholder mappings for LLMs
    if (name === 'Claude') return NodeKinds.LLM_GEMINI;
    if (name === 'Local (Ollama)') return NodeKinds.LLM_OPENAI;
    if (name === 'Azure OpenAI') return NodeKinds.LLM_OPENAI;
    
    return null;
  }

  function onDragStart(event, section, item) {
    const kind = toNodeKind(section, item);
    
    if (!kind) return;
    
    isDragging = true;
    
    // Set the drag data
    if (event.dataTransfer) {
      event.dataTransfer.setData('application/llmflow-node', kind);
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  function onDragEnd(event) {
    isDragging = false;
  }

  function onDragEnter(event) {
    event.preventDefault();
    dragCounter++;
  }

  function onDragLeave(event) {
    event.preventDefault();
    dragCounter--;
  }

  function onDragOver(event) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  // Handle node drag start
  function onNodeDragStart(event, node) {
    userInteracting = true;
  }

  // NEW: continuous drag handler to persist live position (prevents snap-back)
  function onNodeDrag(event, node) {
    // Update only the dragged node's position in the store so controlled state matches visual drag
    nodes.update(nds => nds.map(n => n.id === node.id ? { ...n, position: { ...node.position } } : n));
    if (selectedNode && selectedNode.id === node.id) {
      selectedNode = { ...selectedNode, position: { ...node.position } };
    }
  }

  // Handle node drag stop
  function onNodeDragStop(event, node) {
    userInteracting = false;
    
    // Update the node position in our store
    nodes.update(nds => 
      nds.map(n => 
        n.id === node.id 
          ? { ...n, position: { ...node.position } }
          : n
      )
    );
    
    // Update selected node if it's the one being dragged
    if (selectedNode && selectedNode.id === node.id) {
      selectedNode = { ...selectedNode, position: { ...node.position } };
    }
  }

  function defaultDataFor(kind) {
    switch (kind) {
      // Core nodes
      case NodeKinds.PROMPT: return { title: 'Prompt', hint: 'Text input with variable support' };
      case NodeKinds.LLM_OPENAI: return { model: 'gpt-4.*', provider: 'OpenAI' };
      case NodeKinds.LLM_GEMINI: return { model: 'Gemini 1.5', provider: 'Google' };
      case NodeKinds.ORCHESTRATOR: return { strategy: 'Compare correctness, completeness, citations' };
      case NodeKinds.OUTPUT: return { title: 'Output Viewer' };
      
      // Trigger nodes
      case NodeKinds.TRIGGER_NEW_PROJECT: return { type: 'newProject', config: { source: 'Revit/Archicad' } };
      case NodeKinds.TRIGGER_SCHEDULE_UPDATE: return { type: 'scheduleUpdate', config: { source: 'Revit', conditions: 'Schedule changes' } };
      case NodeKinds.TRIGGER_BIM_REVISION: return { type: 'bimRevision', config: { source: 'BIM 360', conditions: 'New revision uploaded' } };
      case NodeKinds.TRIGGER_COST_UPDATE: return { type: 'costUpdate', config: { source: 'Cost Database', conditions: 'Estimate modified' } };
      case NodeKinds.TRIGGER_DEADLINE: return { type: 'deadline', config: { source: 'Project Schedule', conditions: '7 days before deadline' } };
      case NodeKinds.TRIGGER_FORM_SUBMIT: return { type: 'formSubmit', config: { source: 'Povolean Platform' } };
      case NodeKinds.TRIGGER_INSPECTION: return { type: 'inspection', config: { source: 'Inspection System' } };
      case NodeKinds.TRIGGER_SAFETY_INCIDENT: return { type: 'safety', config: { source: 'Safety Management System' } };
      case NodeKinds.TRIGGER_COMMENT: return { type: 'comment', config: { source: 'BIM 360/SharePoint' } };
      
      // Action nodes
      case NodeKinds.ACTION_AUTO_FILL_PERMIT: return { type: 'autoFillPermit', config: { target: 'Building Authority Portal', template: 'Standard Permit' } };
      case NodeKinds.ACTION_EXTRACT_BIM_DATA: return { type: 'extractBimData', config: { target: 'Database', format: 'JSON/CSV' } };
      case NodeKinds.ACTION_UPDATE_SCHEDULE: return { type: 'updateSchedule', config: { target: 'Primavera/MS Project', format: 'XML/MPP' } };
      case NodeKinds.ACTION_PUSH_TO_SHEETS: return { type: 'pushToSheets', config: { target: 'Google Sheets/Excel', format: 'Spreadsheet' } };
      case NodeKinds.ACTION_SEND_APPROVAL: return { type: 'sendApproval', config: { target: 'Email/Slack', template: 'Approval Request' } };
      case NodeKinds.ACTION_GENERATE_REPORT: return { type: 'generateReport', config: { target: 'PDF Report', template: 'Compliance Template' } };
      case NodeKinds.ACTION_UPLOAD_DOCS: return { type: 'uploadDocs', config: { target: 'BIM 360/SharePoint', format: 'Original' } };
      case NodeKinds.ACTION_SYNC_COST_DATA: return { type: 'syncCostData', config: { target: 'Archicad/Excel', format: 'Cost Database' } };
      case NodeKinds.ACTION_NOTIFY_STAKEHOLDERS: return { type: 'notifyStakeholders', config: { target: 'Team Members', template: 'Notification' } };
      case NodeKinds.ACTION_CREATE_TASK: return { type: 'createTask', config: { target: 'Asana/Trello', template: 'Task Template' } };
      
      default: return {};
    }
  }

  function onDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    
    // Reset drag state
    dragCounter = 0;
    isDragging = false;
    
    const kind = event.dataTransfer?.getData('application/llmflow-node');
    if (!kind) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    let position;
    
    // Try to use the most accurate positioning method available
    if (rfInstance?.screenToFlowPosition) {
      position = rfInstance.screenToFlowPosition({ 
        x: event.clientX, 
        y: event.clientY 
      });
    } else {
      // Fallback to manual calculation
      position = { 
        x: event.clientX - bounds.left - 100, // Offset to center the node
        y: event.clientY - bounds.top - 50 
      };
    }

    const id = `${kind}-${Date.now()}`;
    const data = defaultDataFor(kind);
    const newNode = { id, type: kind, position, data };
    
    nodes.update((ns /** @type {any[]} */) => {
      return [...ns, /** @type {any} */ (newNode)];
    });
  }

  import { onMount } from 'svelte';

  // Ensure terminal auto-scroll
  onMount(() => {
    const unsub = workflowLogs.subscribe(() => {
      if (terminalEl) {
        terminalEl.scrollTop = terminalEl.scrollHeight;
      }
    });
    return () => unsub();
  });

  // Add missing onNodesChange implementation (referenced in markup)
  function onNodesChange(event) {
    const changes = event.detail;
    nodes.update(nds => applyNodeChanges(changes, nds));
    if (selectedNode) {
      const updated = $nodes.find(n => n.id === selectedNode.id);
      if (updated) selectedNode = { ...updated };
    }
  }
</script>

<div class="app-container">
  <!-- Left Sidebar - Node Palette -->
  <div class="sidebar">
    <div class="sidebar-header">
      <div class="app-title">
        <div class="app-icon">
          <img src="/iba_biele_logo-23.png" alt="Povolean Logo" />
        </div>
        <span>LLM Flow</span>
      </div>
      <div class="header-buttons">
        <button 
          class="test-run-btn" 
          class:running={isTestRunning}
          disabled={isTestRunning || isRunning}
          onclick={testRunWorkflow}
          title="Test run workflow with animation"
        >
          {isTestRunning ? '⏳' : '🧪'} Test
        </button>
        <button class="run-btn" disabled={isTestRunning}>▶ Run</button>
      </div>
    </div>
    
    <div class="palette-header">
      <h3>WORKFLOW NODES</h3>
      <div class="search-container">
        <input 
          type="text" 
          placeholder="Search nodes..." 
          class="search-input"
          bind:value={searchQuery}
        />
      </div>
    </div>
    
    <div class="palette-content">
      {#each filteredPaletteItems as section, index (section.title)}
        <div class="palette-section" class:expanded={section.expanded}>
          <div 
            class="section-header" 
            role="button" 
            tabindex="0"
            onclick={() => {
              const originalIndex = paletteItems.findIndex(item => item.title === section.title);
              toggleSection(originalIndex);
            }}
            onkeydown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                const originalIndex = paletteItems.findIndex(item => item.title === section.title);
                toggleSection(originalIndex);
              }
            }}
          >
            <span class="section-icon">{section.icon}</span>
            <span class="section-title">{section.title}</span>
            <span class="section-count">{section.count}</span>
            <span class="expand-icon">{section.expanded ? '▼' : '▶'}</span>
          </div>
          
          {#if section.expanded}
            {#if section.items}
              {#each section.items as item (item.title)}
                <div 
                  class="palette-item"
                  class:disabled={!toNodeKind(section, item)}
                  draggable={!!toNodeKind(section, item)}
                  role="button"
                  tabindex="0"
                  ondragstart={(e) => onDragStart(e, section, item)}
                  ondragend={onDragEnd}
                >
                  <span class="item-icon">{item.icon}</span>
                  <div class="item-info">
                    <div class="item-title">{item.title}</div>
                    <div class="item-description">{item.description}</div>
                  </div>
                </div>
              {/each}
            {:else}
              <div 
                class="palette-item"
                class:disabled={!toNodeKind(section, null)}
                draggable={!!toNodeKind(section, null)}
                role="button"
                tabindex="0"
                ondragstart={(e) => onDragStart(e, section, null)}
                ondragend={onDragEnd}
              >
                <span class="item-icon">{section.icon}</span>
                <div class="item-info">
                  <div class="item-title">{section.title}</div>
                  <div class="item-description">{section.description}</div>
                </div>
              </div>
            {/if}
          {/if}
        </div>
      {/each}
    </div>
  </div>
  
  <!-- Main Flow Canvas -->
  <div class="flow-container">
    <div class="toolbar">
      <div class="toolbar-controls">
        <button class="tool-btn" title="Reset View">🔄</button>
        <button class="tool-btn" title="Fit to Screen">⊞</button>
      </div>
      <div class="toolbar-actions">
        <button class="action-btn">💾 Save</button>
        <button class="action-btn">📂 Load</button>
        <button class="action-btn">📤 Export</button>
        <button class="action-btn">⚙️</button>
        <button class="action-btn">❓</button>
      </div>
    </div>
    
    <div 
      class="flow-area" 
      class:drag-over={dragCounter > 0} 
      role="application" 
      ondragenter={onDragEnter}
      ondragleave={onDragLeave}
      ondragover={onDragOver} 
      ondrop={onDrop}
    >
      <SvelteFlow 
        nodes={enhancedNodes}
        edges={enhancedEdges}
        {nodeTypes}
        onconnect={onConnect}
        oninit={onInit}
        onnodeclick={onNodeClick}
        onpaneclick={onPaneClick}
        onnodedragstart={onNodeDragStart}
        onnodedragstop={onNodeDragStop}
        onnodeschange={onNodesChange}
        fitView={false}
      >
        <Background />
        <Controls />
        <MiniMap />
      </SvelteFlow>
    </div>
  </div>
  
  <!-- Right Sidebar - Properties -->
  <div class="properties-panel">
    {#if selectedNode}
      {@const nodeType = getNodeTypeDisplay(selectedNode.type)}
      <div class="properties-header">
        <h3>{nodeType.icon} {nodeType.name}</h3>
        <div class="node-id">ID: {selectedNode.id}</div>
      </div>
      
      <div class="properties-content">
        <div class="property-group">
          <h4>BASIC PROPERTIES</h4>
          
          <div class="property-field">
            <label for="node-name">Node Name</label>
            <input 
              id="node-name" 
              type="text" 
              value={selectedNode.data.title || selectedNode.id}
              oninput={(e) => updateNodeData('name', e.currentTarget.value)}
            />
          </div>
          
          <div class="property-row">
            <div class="property-field">
              <label for="x-position">X Position</label>
              <input 
                id="x-position" 
                type="number" 
                value={Math.round(selectedNode.position.x)}
                oninput={(e) => updateNodeData('position.x', e.currentTarget.value)}
              />
            </div>
            <div class="property-field">
              <label for="y-position">Y Position</label>
              <input 
                id="y-position" 
                type="number" 
                value={Math.round(selectedNode.position.y)}
                oninput={(e) => updateNodeData('position.y', e.currentTarget.value)}
              />
            </div>
          </div>

          <!-- Node-specific properties -->
          {#if selectedNode.type === NodeKinds.LLM_OPENAI || selectedNode.type === NodeKinds.LLM_GEMINI}
            <div class="property-field">
              <label for="model">Model</label>
              <input 
                id="model" 
                type="text" 
                value={selectedNode.data.model || 'gpt-4'}
                oninput={(e) => updateNodeData('model', e.currentTarget.value)}
              />
            </div>
            <div class="property-field">
              <label for="temperature">Temperature</label>
              <input 
                id="temperature" 
                type="number" 
                step="0.1" 
                min="0" 
                max="2"
                value={selectedNode.data.temperature || 0.7}
                oninput={(e) => updateNodeData('temperature', e.currentTarget.value)}
              />
            </div>
          {/if}

          {#if selectedNode.type === NodeKinds.PROMPT}
            <div class="property-field">
              <label for="prompt-text">Prompt Text</label>
              <textarea 
                id="prompt-text" 
                rows="4"
                value={selectedNode.data.prompt || ''}
                oninput={(e) => updateNodeData('prompt', e.currentTarget.value)}
              ></textarea>
            </div>
          {/if}

          {#if selectedNode.type.startsWith('trigger')}
            <div class="property-field">
              <label for="trigger-config">Trigger Configuration</label>
              <textarea 
                id="trigger-config" 
                rows="3"
                value={JSON.stringify(selectedNode.data.config || {}, null, 2)}
                oninput={(e) => {
                  try {
                    updateNodeData('config', JSON.parse(e.currentTarget.value));
                  } catch (err) {
                    // Invalid JSON, ignore
                  }
                }}
              ></textarea>
            </div>
          {/if}

          {#if selectedNode.type.startsWith('action')}
            <div class="property-field">
              <label for="action-config">Action Configuration</label>
              <textarea 
                id="action-config" 
                rows="3"
                value={JSON.stringify(selectedNode.data.config || {}, null, 2)}
                oninput={(e) => {
                  try {
                    updateNodeData('config', JSON.parse(e.currentTarget.value));
                  } catch (err) {
                    // Invalid JSON, ignore
                  }
                }}
              ></textarea>
            </div>
          {/if}
          
          <div class="actions-section">
            <button 
              class="run-node-btn" 
              class:running={isRunning}
              disabled={isRunning}
              onclick={runNode}
            >
              {isRunning ? '⏳ Running...' : '⚡ Run Node'}
            </button>
            
            {#if nodeOutput}
              <button class="view-output-btn" onclick={() => nodeOutput = null}>
                📄 Clear Output
              </button>
            {/if}
          </div>

          {#if nodeOutput}
            <div class="output-viewer">
              <h4>Output Viewer ▶</h4>
              <div class="output-content">
                <div class="output-meta">
                  <span class="output-type">{nodeOutput.type}</span>
                  <span class="output-time">{nodeOutput.timestamp}</span>
                </div>
                <div class="output-text">{nodeOutput.content}</div>
                {#if nodeOutput.tokens}
                  <div class="output-tokens">Tokens: {nodeOutput.tokens}</div>
                {/if}
                {#if nodeOutput.projectId}
                  <div class="output-project">Project ID: {nodeOutput.projectId}</div>
                {/if}
              </div>
            </div>
          {/if}
        </div>
      </div>
    {:else}
      <div class="properties-header">
        <h3>🔧 Node Properties</h3>
        <div class="node-id">Select a node to view properties</div>
      </div>
      
      <div class="properties-content">
        <div class="no-selection">
          <p>Click on a node in the canvas to view and edit its properties.</p>
          <p>You can modify node settings, run individual nodes, and view their outputs here.</p>
        </div>
      </div>
    {/if}

    <!-- Add workflow logs terminal inside properties panel -->
    <div class="workflow-logs-panel">
      <h4>WORKFLOW LOGS</h4>
      <div class="workflow-terminal" bind:this={terminalEl}>
        {#each $workflowLogs as line}
          <div class="log-line">{line}</div>
        {/each}
      </div>
      <div class="log-actions">
        <button class="clear-logs-btn" onclick={() => workflowLogs.set([])}>Clear Logs</button>
      </div>
    </div>
  </div>
</div>

<style>
  .app-container {
    display: flex;
    height: 100vh;
    background: #1a1a1a;
    color: #fff;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  /* Sidebar Styles */
  .sidebar {
    width: 280px;
    background: #2a2a2a;
    border-right: 1px solid #444;
    display: flex;
    flex-direction: column;
  }

  .sidebar-header {
    padding: 16px;
    border-bottom: 1px solid #444;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .app-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
  }

  .app-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
  }

  .app-icon img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: brightness(1.2) contrast(1.1);
  }

  .header-buttons {
    display: flex;
    gap: 6px;
  }

  .run-btn, .test-run-btn {
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-weight: 500;
  }

  .run-btn {
    background: #4a9eff;
    color: white;
  }

  .run-btn:hover:not(:disabled) {
    background: #357abd;
  }

  .run-btn:disabled {
    background: #666;
    cursor: not-allowed;
    opacity: 0.7;
  }

  .test-run-btn {
    background: #ff6b35;
    color: white;
  }

  .test-run-btn:hover:not(:disabled) {
    background: #e55a2b;
  }

  .test-run-btn:disabled {
    background: #666;
    cursor: not-allowed;
    opacity: 0.7;
  }

  .test-run-btn.running {
    background: #ff9500;
    animation: pulse 1.5s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }

  .palette-header {
    padding: 12px 16px 8px;
    border-bottom: 1px solid #444;
  }

  .palette-header h3 {
    margin: 0 0 8px 0;
    font-size: 12px;
    color: #999;
    font-weight: 500;
  }

  .search-container {
    margin-bottom: 8px;
  }

  .search-input {
    width: 100%;
    background: #333;
    border: 1px solid #444;
    color: #fff;
    padding: 6px 8px;
    border-radius: 4px;
    font-size: 12px;
    box-sizing: border-box;
  }

  .search-input:focus {
    outline: none;
    border-color: #4a9eff;
    box-shadow: 0 0 0 2px rgba(74, 158, 255, 0.2);
  }

  .search-input::placeholder {
    color: #666;
  }

  .palette-content {
    flex: 1;
    overflow-y: auto;
  }

  .palette-section {
    border-bottom: 1px solid #333;
  }

  .section-header {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    cursor: pointer;
    gap: 8px;
    transition: background-color 0.2s ease;
    border-radius: 4px;
    margin: 2px;
  }

  .section-header:hover {
    background: #333;
  }

  .section-header:focus {
    outline: 2px solid #4a9eff;
    outline-offset: 2px;
    background: #333;
  }

  .section-header:active {
    background: #444;
  }

  .section-icon {
    font-size: 16px;
  }

  .section-title {
    flex: 1;
    font-size: 14px;
    font-weight: 500;
  }

  .section-count {
    font-size: 12px;
    color: #666;
  }

  .expand-icon {
    font-size: 10px;
    color: #666;
  }

  .palette-item {
    display: flex;
    align-items: center;
    padding: 8px 32px;
    gap: 8px;
    cursor: pointer;
  }

  .palette-item:hover {
    background: #333;
  }

  .item-icon {
    font-size: 14px;
  }

  .item-info {
    flex: 1;
  }

  .item-title {
    font-size: 13px;
    color: #fff;
  }

  .item-description {
    font-size: 11px;
    color: #999;
  }

  .palette-item.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .palette-item:not(.disabled) {
    cursor: grab;
  }

  .palette-item:active {
    cursor: grabbing;
    opacity: 0.7;
  }

  .palette-item[draggable="true"]:hover {
    background: #444;
    transform: translateX(2px);
  }

  /* Flow Container */
  .flow-container {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px;
    background: #1a1a1a;
    border-bottom: 1px solid #444;
  }

  .toolbar-controls,
  .toolbar-actions {
    display: flex;
    gap: 4px;
  }

  .tool-btn,
  .action-btn {
    background: transparent;
    border: 1px solid #444;
    color: #ccc;
    padding: 6px 8px;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
  }

  .tool-btn:hover,
  .action-btn:hover {
    background: #333;
  }

  .flow-area {
    flex: 1;
    position: relative;
    transition: all 0.2s ease;
  }

  .flow-area.drag-over {
    background: rgba(74, 158, 255, 0.1);
    border: 2px dashed #4a9eff;
    border-radius: 8px;
  }

  .flow-area.drag-over::before {
    content: "Drop node here";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #4a9eff;
    font-size: 18px;
    font-weight: 600;
    pointer-events: none;
    z-index: 1000;
  }

  :global(.svelte-flow) {
    background: #1a1a1a !important;
  }

  :global(.svelte-flow .svelte-flow__background) {
    background-color: #1a1a1a !important;
  }

  :global(.svelte-flow .svelte-flow__edge-path) {
    stroke: #666;
    stroke-width: 2;
  }

  :global(.svelte-flow .svelte-flow__edge.selected .svelte-flow__edge-path) {
    stroke: #4a9eff;
  }

  /* Animated edge styling */
  :global(.svelte-flow .svelte-flow__edge.animated .svelte-flow__edge-path) {
    stroke: #4a9eff !important;
    stroke-width: 4px !important;
    filter: drop-shadow(0 0 4px #4a9eff) drop-shadow(0 0 8px #4a9eff);
    animation: flowAnimation 0.8s infinite linear, edgeGlow 1.5s infinite alternate;
  }

  @keyframes flowAnimation {
    0% {
      stroke-dasharray: 8 4;
      stroke-dashoffset: 0;
    }
    100% {
      stroke-dasharray: 8 4;
      stroke-dashoffset: -12;
    }
  }

  @keyframes edgeGlow {
    0% {
      stroke-width: 4px;
      filter: drop-shadow(0 0 4px #4a9eff) drop-shadow(0 0 8px #4a9eff);
    }
    100% {
      stroke-width: 5px;
      filter: drop-shadow(0 0 8px #4a9eff) drop-shadow(0 0 16px #4a9eff);
    }
  }

  /* Active node glow effect */
  :global(.svelte-flow .svelte-flow__node.active) {
    filter: drop-shadow(0 0 8px #4a9eff) drop-shadow(0 0 16px #4a9eff);
    animation: nodeGlow 2s infinite alternate;
  }

  @keyframes nodeGlow {
    0% {
      filter: drop-shadow(0 0 8px #4a9eff) drop-shadow(0 0 16px #4a9eff);
    }
    100% {
      filter: drop-shadow(0 0 12px #4a9eff) drop-shadow(0 0 24px #4a9eff);
    }
  }

  /* SvelteFlow Controls Styling */
  :global(.svelte-flow .svelte-flow__controls) {
    bottom: 20px !important;
    left: 20px !important;
    background: #2a2a2a !important;
    border: 1px solid #444 !important;
    border-radius: 8px !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
    padding: 4px !important;
  }

  :global(.svelte-flow .svelte-flow__controls-button) {
    background: #333 !important;
    border: 1px solid #444 !important;
    color: #ccc !important;
    width: 32px !important;
    height: 32px !important;
    margin: 2px !important;
    border-radius: 4px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    font-size: 16px !important;
    font-weight: bold !important;
    cursor: pointer !important;
    transition: all 0.2s ease !important;
    position: relative !important;
  }

  :global(.svelte-flow .svelte-flow__controls-button:hover) {
    background: #444 !important;
    color: #fff !important;
    border-color: #555 !important;
  }

  /* Additional fallback styling for control visibility */
  :global(.svelte-flow .svelte-flow__controls-button) {
    position: relative !important;
  }

  /* Fallback text content for buttons if SVGs don't show */
  :global(.svelte-flow .svelte-flow__controls-zoomin:empty::after) {
    content: '+' !important;
    position: absolute !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    font-size: 18px !important;
    font-weight: bold !important;
    color: #ccc !important;
  }

  :global(.svelte-flow .svelte-flow__controls-zoomout:empty::after) {
    content: '−' !important;
    position: absolute !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    font-size: 20px !important;
    font-weight: bold !important;
    color: #ccc !important;
  }

  :global(.svelte-flow .svelte-flow__controls-fitview:empty::after) {
    content: '⌘' !important;
    position: absolute !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    font-size: 14px !important;
    color: #ccc !important;
  }

  :global(.svelte-flow .svelte-flow__controls-interactive:empty::after) {
    content: '☰' !important;
    position: absolute !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    font-size: 14px !important;
    color: #ccc !important;
  }

  /* Ensure SVG elements are properly styled */
  :global(.svelte-flow .svelte-flow__controls svg) {
    fill: #ccc !important;
    stroke: #ccc !important;
    width: 16px !important;
    height: 16px !important;
    display: block !important;
    opacity: 1 !important;
    visibility: visible !important;
  }

  /* Button hover states with fallback content */
  :global(.svelte-flow .svelte-flow__controls-button:hover::after) {
    color: #4a9eff !important;
  }

  /* MiniMap Styling */
  :global(.svelte-flow .svelte-flow__minimap) {
    background: #2a2a2a !important;
    border: 1px solid #444 !important;
    border-radius: 8px !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
  }

  :global(.svelte-flow .svelte-flow__minimap-mask) {
    fill: rgba(74, 158, 255, 0.2) !important;
    stroke: #4a9eff !important;
    stroke-width: 2 !important;
  }

  :global(.svelte-flow .svelte-flow__minimap-node) {
    fill: #444 !important;
    stroke: #666 !important;
  }

  /* Properties Panel */
  .properties-panel {
    width: 300px;
    background: #2a2a2a;
    border-left: 1px solid #444;
    display: flex;
    flex-direction: column;
  }

  .properties-header {
    padding: 16px;
    border-bottom: 1px solid #444;
  }

  .properties-header h3 {
    margin: 0 0 4px 0;
    font-size: 14px;
    font-weight: 500;
  }

  .node-id {
    font-size: 12px;
    color: #999;
  }

  .properties-content {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
  }

  .property-group h4 {
    margin: 0 0 16px 0;
    font-size: 12px;
    color: #999;
    font-weight: 500;
  }

  .no-selection {
    text-align: center;
    color: #666;
    padding: 40px 20px;
  }

  .no-selection p {
    margin: 8px 0;
    font-size: 14px;
    line-height: 1.4;
  }

  .property-field {
    margin-bottom: 12px;
  }

  .property-field label {
    display: block;
    font-size: 12px;
    color: #ccc;
    margin-bottom: 4px;
  }

  .property-field input,
  .property-field textarea {
    width: 100%;
    background: #333;
    border: 1px solid #444;
    color: #fff;
    padding: 6px 8px;
    border-radius: 4px;
    font-size: 12px;
    box-sizing: border-box;
    font-family: inherit;
    resize: vertical;
  }

  .property-field input:focus,
  .property-field textarea:focus {
    outline: none;
    border-color: #4a9eff;
    box-shadow: 0 0 0 2px rgba(74, 158, 255, 0.2);
  }

  .property-row {
    display: flex;
    gap: 8px;
  }

  .property-row .property-field {
    flex: 1;
  }

  .actions-section {
    margin: 20px 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .output-viewer {
    margin: 16px 0 0 0;
    padding: 12px;
    background: #333;
    border-radius: 4px;
    border: 1px solid #444;
  }

  .output-viewer h4 {
    margin: 0 0 8px 0;
    font-size: 12px;
    color: #4a9eff;
  }

  .output-content {
    font-size: 12px;
  }

  .output-meta {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    padding-bottom: 6px;
    border-bottom: 1px solid #444;
  }

  .output-type {
    background: #4a9eff;
    color: #fff;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 10px;
    text-transform: uppercase;
    font-weight: 500;
  }

  .output-time {
    color: #999;
    font-size: 10px;
  }

  .output-text {
    background: #2a2a2a;
    padding: 8px;
    border-radius: 3px;
    border: 1px solid #444;
    white-space: pre-wrap;
    word-wrap: break-word;
    line-height: 1.4;
    color: #ccc;
    margin: 8px 0;
  }

  .output-tokens,
  .output-project {
    font-size: 10px;
    color: #666;
    margin-top: 4px;
  }

  .run-node-btn,
  .view-output-btn {
    width: 100%;
    padding: 8px;
    border: none;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .run-node-btn {
    background: #4a9eff;
    color: white;
  }

  .run-node-btn:hover:not(:disabled) {
    background: #357abd;
  }

  .run-node-btn:disabled {
    background: #666;
    cursor: not-allowed;
    opacity: 0.7;
  }

  .run-node-btn.running {
    background: #ff9500;
  }

  .view-output-btn {
    background: #333;
    color: #ccc;
    border: 1px solid #444;
  }

  .view-output-btn:hover {
    background: #444;
    border-color: #555;
  }

  /* Workflow Logs Panel */
  .workflow-logs-panel {
    border-top: 1px solid #444;
    padding: 12px 16px;
  }

  .workflow-logs-panel h4 {
    margin: 0 0 8px 0;
    font-size: 12px;
    color: #999;
    font-weight: 500;
  }

  .workflow-terminal {
    background:#111;
    border:1px solid #333;
    border-radius:4px;
    font-family:Menlo, monospace;
    font-size:11px;
    padding:8px;
    height:160px;
    overflow-y:auto;
    line-height:1.4;
  }

  .workflow-terminal::-webkit-scrollbar {
    width: 6px;
  }

  .workflow-terminal::-webkit-scrollbar-thumb {
    background:#444;
    border-radius:3px;
  }

  .log-line {
    white-space: pre-wrap;
    word-break: break-word;
    color:#ccc;
  }

  .log-actions {
    margin-top:8px;
    text-align:right;
  }

  .clear-logs-btn {
    background:#333;
    color:#ccc;
    border:1px solid #444;
    padding:4px 8px;
    font-size:11px;
    border-radius:4px;
    cursor:pointer;
  }

  .clear-logs-btn:hover {
    background:#444;
  }
</style>
