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
  
  // Relax types so we can push dynamic nodes from DnD without TS narrowing issues
  /** @type {any} */
  const nodes = writable(/** @type {any[]} */ (defaultNodes));
  const edges = writable(defaultEdges);
  
  // Handle connection creation
  function onConnect(connection) {
    edges.update(eds => addEdge(connection, eds));
  }
  
  // Node palette items - using writable store to make it reactive
  let paletteItems = $state([
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
  ]);
  
  let selectedNode = null;
  let rfInstance;
  let isDragging = $state(false);
  let dragCounter = $state(0);
  let searchQuery = $state('');

  function onInit(e) {
    rfInstance = e.detail;
  }

  // Toggle section expansion
  function toggleSection(sectionIndex) {
    paletteItems[sectionIndex].expanded = !paletteItems[sectionIndex].expanded;
  }

  // Filter sections based on search query
  let filteredPaletteItems = $derived(searchQuery 
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
    : paletteItems);

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
</script>

<div class="app-container">
  <!-- Left Sidebar - Node Palette -->
  <div class="sidebar">
    <div class="sidebar-header">
      <div class="app-title">
        <div class="app-icon">⚡</div>
        <span>LLM Flow</span>
      </div>
      <button class="run-btn">▶ Run</button>
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
      {#each filteredPaletteItems as section, index}
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
              {#each section.items as item}
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
        <button class="tool-btn">🔍</button>
        <button class="tool-btn">🔍</button>
        <button class="tool-btn">🔄</button>
        <button class="tool-btn">⊞</button>
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
        nodes={$nodes}
        edges={$edges}
        {nodeTypes}
        onconnect={onConnect}
        oninit={onInit}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </SvelteFlow>
    </div>
  </div>
  
  <!-- Right Sidebar - Properties -->
  <div class="properties-panel">
    <div class="properties-header">
      <h3>🧠 GEMINI LLM</h3>
      <div class="node-id">ID: gemini-1</div>
    </div>
    
    <div class="properties-content">
      <div class="property-group">
        <h4>BASIC PROPERTIES</h4>
        
        <div class="property-field">
          <label for="node-name">Node Name</label>
          <input id="node-name" type="text" value="Gemini LLM" />
        </div>
        
        <div class="property-row">
          <div class="property-field">
            <label for="x-position">X Position</label>
            <input id="x-position" type="number" value="400" />
          </div>
          <div class="property-field">
            <label for="y-position">Y Position</label>
            <input id="y-position" type="number" value="380" />
          </div>
        </div>
        
        <div class="output-viewer">
          <h4>Output Viewer ▶</h4>
        </div>
        
        <button class="run-node-btn">⚡ Run Node</button>
        <button class="view-output-btn">📄 View Output</button>
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
    font-size: 20px;
  }

  .run-btn {
    background: #4a9eff;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
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
  }

  .property-group h4 {
    margin: 0 0 16px 0;
    font-size: 12px;
    color: #999;
    font-weight: 500;
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

  .property-field input {
    width: 100%;
    background: #333;
    border: 1px solid #444;
    color: #fff;
    padding: 6px 8px;
    border-radius: 4px;
    font-size: 12px;
  }

  .property-row {
    display: flex;
    gap: 8px;
  }

  .property-row .property-field {
    flex: 1;
  }

  .output-viewer {
    margin: 20px 0;
    padding: 8px;
    background: #333;
    border-radius: 4px;
  }

  .output-viewer h4 {
    margin: 0;
    font-size: 12px;
    color: #4a9eff;
  }

  .run-node-btn,
  .view-output-btn {
    width: 100%;
    padding: 8px;
    margin-bottom: 8px;
    border: none;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
  }

  .run-node-btn {
    background: #4a9eff;
    color: white;
  }

  .view-output-btn {
    background: #333;
    color: #ccc;
    border: 1px solid #444;
  }
</style>
