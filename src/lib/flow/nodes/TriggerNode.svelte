<script>
  import BaseNode from './BaseNode.svelte';
  
  let { data = {}, id = '', type = '' } = $props();
  
  // Determine trigger type from node ID or data
  function getTriggerInfo(nodeId, nodeData) {
    if (nodeId.includes('newProject') || nodeData.type === 'newProject') {
      return { icon: '📁', title: 'New Project', subtitle: 'Revit/Archicad trigger' };
    }
    if (nodeId.includes('scheduleUpdate') || nodeData.type === 'scheduleUpdate') {
      return { icon: '📅', title: 'Schedule Updated', subtitle: 'Revit schedule trigger' };
    }
    if (nodeId.includes('bimRevision') || nodeData.type === 'bimRevision') {
      return { icon: '📋', title: 'BIM Model Revision', subtitle: 'Model upload trigger' };
    }
    if (nodeId.includes('costUpdate') || nodeData.type === 'costUpdate') {
      return { icon: '$', title: 'Cost Estimate Updated', subtitle: 'Cost change trigger' };
    }
    if (nodeId.includes('deadline') || nodeData.type === 'deadline') {
      return { icon: '📅', title: 'Deadline Approaching', subtitle: 'Time-based trigger' };
    }
    if (nodeId.includes('formSubmit') || nodeData.type === 'formSubmit') {
      return { icon: '📋', title: 'Form Submitted', subtitle: 'Povolean form trigger' };
    }
    if (nodeId.includes('inspection') || nodeData.type === 'inspection') {
      return { icon: '✅', title: 'New Inspection Report', subtitle: 'Inspection trigger' };
    }
    if (nodeId.includes('safety') || nodeData.type === 'safety') {
      return { icon: '🛡️', title: 'Safety Incident', subtitle: 'Safety alert trigger' };
    }
    if (nodeId.includes('comment') || nodeData.type === 'comment') {
      return { icon: '🔔', title: 'New Comment/Revision', subtitle: 'Feedback trigger' };
    }
    
    // Default trigger
    return { icon: '⚡', title: 'Trigger', subtitle: 'Event-based trigger' };
  }
  
  const triggerInfo = getTriggerInfo(id, data);
</script>

<BaseNode
  icon={triggerInfo.icon}
  title={triggerInfo.title}
  subtitle={triggerInfo.subtitle}
  inputs={0}
  outputs={1}
  {id}
  {type}
  {data}
>
  {#snippet children()}
    <div class="trigger-content">
      <div class="trigger-status">
        <span class="status-dot active"></span>
        <span class="status-text">Active</span>
      </div>
      {#if data.config}
        <div class="trigger-config">
          <div class="config-item">
            <strong>Source:</strong> {data.config.source || 'Default'}
          </div>
          {#if data.config.conditions}
            <div class="config-item">
              <strong>Conditions:</strong> {data.config.conditions}
            </div>
          {/if}
        </div>
      {/if}
    </div>
  {/snippet}
</BaseNode>

<style>
  .trigger-content {
    padding: 8px 12px;
  }
  
  .trigger-status {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 8px;
  }
  
  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #666;
  }
  
  .status-dot.active {
    background: #4ade80;
    box-shadow: 0 0 8px rgba(74, 222, 128, 0.3);
  }
  
  .status-text {
    font-size: 11px;
    color: #4ade80;
    font-weight: 500;
  }
  
  .trigger-config {
    font-size: 11px;
    color: #999;
    line-height: 1.4;
  }
  
  .config-item {
    margin-bottom: 4px;
  }
  
  .config-item strong {
    color: #ccc;
  }
</style>
