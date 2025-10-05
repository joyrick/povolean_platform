<script>
  import BaseNode from './BaseNode.svelte';
  
  let { data = {}, id = '', type = '' } = $props();
  
  // Determine action type from node ID or data
  function getActionInfo(nodeId, nodeData) {
    if (nodeId.includes('autoFillPermit') || nodeData.type === 'autoFillPermit') {
      return { icon: '📋', title: 'Auto-fill Permit', subtitle: 'Building permit automation' };
    }
    if (nodeId.includes('extractBimData') || nodeData.type === 'extractBimData') {
      return { icon: '📋', title: 'Extract BIM Data', subtitle: 'BIM model data extraction' };
    }
    if (nodeId.includes('updateSchedule') || nodeData.type === 'updateSchedule') {
      return { icon: '📅', title: 'Update Schedule', subtitle: 'Primavera/MS Project sync' };
    }
    if (nodeId.includes('pushToSheets') || nodeData.type === 'pushToSheets') {
      return { icon: '📊', title: 'Push to Sheets', subtitle: 'Excel/Google Sheets export' };
    }
    if (nodeId.includes('sendApproval') || nodeData.type === 'sendApproval') {
      return { icon: '✉️', title: 'Send Approval', subtitle: 'Approval request automation' };
    }
    if (nodeId.includes('generateReport') || nodeData.type === 'generateReport') {
      return { icon: '📋', title: 'Generate Report', subtitle: 'Compliance report creation' };
    }
    if (nodeId.includes('uploadDocs') || nodeData.type === 'uploadDocs') {
      return { icon: '📋', title: 'Upload Documents', subtitle: 'BIM 360/SharePoint sync' };
    }
    if (nodeId.includes('syncCostData') || nodeData.type === 'syncCostData') {
      return { icon: '$', title: 'Sync Cost Data', subtitle: 'Archicad/Excel integration' };
    }
    if (nodeId.includes('notifyStakeholders') || nodeData.type === 'notifyStakeholders') {
      return { icon: '🔔', title: 'Notify Stakeholders', subtitle: 'Team notification system' };
    }
    if (nodeId.includes('createTask') || nodeData.type === 'createTask') {
      return { icon: '✅', title: 'Create Task', subtitle: 'Asana/Trello automation' };
    }
    
    // Default action
    return { icon: '🔧', title: 'Action', subtitle: 'Automated workflow action' };
  }
  
  const actionInfo = getActionInfo(id, data);
</script>

<BaseNode
  icon={actionInfo.icon}
  title={actionInfo.title}
  subtitle={actionInfo.subtitle}
  inputs={1}
  outputs={1}
  {id}
  {type}
  {data}
>
  {#snippet children()}
    <div class="action-content">
      <div class="action-status">
        <span class="status-dot ready"></span>
        <span class="status-text">Ready</span>
      </div>
      {#if data.config}
        <div class="action-config">
          {#if data.config.target}
            <div class="config-item">
              <strong>Target:</strong> {data.config.target}
            </div>
          {/if}
          {#if data.config.template}
            <div class="config-item">
              <strong>Template:</strong> {data.config.template}
            </div>
          {/if}
          {#if data.config.format}
            <div class="config-item">
              <strong>Format:</strong> {data.config.format}
            </div>
          {/if}
        </div>
      {/if}
    </div>
  {/snippet}
</BaseNode>

<style>
  .action-content {
    padding: 8px 12px;
  }
  
  .action-status {
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
  
  .status-dot.ready {
    background: #60a5fa;
    box-shadow: 0 0 8px rgba(96, 165, 250, 0.3);
  }
  
  .status-text {
    font-size: 11px;
    color: #60a5fa;
    font-weight: 500;
  }
  
  .action-config {
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
