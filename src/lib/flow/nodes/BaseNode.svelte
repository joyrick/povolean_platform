<script>
  import { Handle, Position } from '@xyflow/svelte';
  import { getContext } from 'svelte';
  
  let { 
    icon = '⚙️',
    title = 'Node',
    subtitle = '',
    inputs = 1,
    outputs = 1,
    children,
    id = '',
    type = '',
    data = {}
  } = $props();

  // Get action handler from context
  const nodeActionHandler = getContext('nodeActionHandler');

  let dropdownOpen = $state(false);
  let dropdownRef;

  // Close dropdown when clicking outside
  function handleClickOutside(event) {
    if (dropdownRef && !dropdownRef.contains(event.target)) {
      dropdownOpen = false;
    }
  }

  // Handle dropdown actions
  function handleAction(action) {
    dropdownOpen = false;
    if (nodeActionHandler) {
      nodeActionHandler(action, id, type);
    }
  }
</script>

<svelte:window onclick={handleClickOutside} />

<div class="node-shell" class:active={data?.isActive}>
  <div class="node-title">
    <span>{icon}</span>
    <span>{title}</span>
    <span class="badge">Idle</span>
    <div class="dropdown-container" bind:this={dropdownRef}>
      <button 
        class="dropdown-toggle" 
        onclick={(e) => {
          e.stopPropagation();
          dropdownOpen = !dropdownOpen;
        }}
        title="Node Actions"
      >
        ⋮
      </button>
      {#if dropdownOpen}
        <div class="dropdown-menu">
          <button class="dropdown-item" onclick={() => handleAction('run')}>
            <span class="dropdown-icon">⚡</span>
            Run Node
          </button>
          <button class="dropdown-item" onclick={() => handleAction('duplicate')}>
            <span class="dropdown-icon">📋</span>
            Duplicate
          </button>
          <button class="dropdown-item" onclick={() => handleAction('properties')}>
            <span class="dropdown-icon">⚙️</span>
            Properties
          </button>
          <hr class="dropdown-divider" />
          <button class="dropdown-item" onclick={() => handleAction('disable')}>
            <span class="dropdown-icon">⏸️</span>
            Disable Node
          </button>
          <button class="dropdown-item danger" onclick={() => handleAction('delete')}>
            <span class="dropdown-icon">🗑️</span>
            Delete Node
          </button>
        </div>
      {/if}
    </div>
  </div>
  {#if subtitle}<div class="node-sub">{subtitle}</div>{/if}
  {@render children?.()}
</div>

{#each Array(inputs) as _, i}
  <Handle type="target" position={Position.Left} style={`top:${30 + i*20}px`} />
{/each}
{#each Array(outputs) as _, i}
  <Handle type="source" position={Position.Right} style={`top:${30 + i*20}px`} />
{/each}

<style>
  .node-shell {
    background: #2a2a2a;
    border: 1px solid #444;
    border-radius: 8px;
    min-width: 180px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    transition: all 0.3s ease;
  }

  .node-shell.active {
    border-color: #4a9eff;
    box-shadow: 
      0 0 12px rgba(74, 158, 255, 0.4),
      0 0 24px rgba(74, 158, 255, 0.2),
      0 2px 8px rgba(0,0,0,0.3);
    animation: nodeActiveGlow 2s infinite alternate;
  }

  @keyframes nodeActiveGlow {
    0% {
      box-shadow: 
        0 0 12px rgba(74, 158, 255, 0.4),
        0 0 24px rgba(74, 158, 255, 0.2),
        0 2px 8px rgba(0,0,0,0.3);
    }
    100% {
      box-shadow: 
        0 0 16px rgba(74, 158, 255, 0.6),
        0 0 32px rgba(74, 158, 255, 0.3),
        0 2px 8px rgba(0,0,0,0.3);
    }
  }

  .node-title {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background: #333;
    border-bottom: 1px solid #444;
    border-radius: 8px 8px 0 0;
    font-size: 14px;
    font-weight: 500;
    color: #fff;
    position: relative;
    gap: 8px;
  }

  .node-sub {
    padding: 4px 12px 8px;
    font-size: 11px;
    color: #999;
    border-bottom: 1px solid #444;
  }

  .badge {
    background: #4a9eff;
    color: #fff;
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 10px;
    margin-left: auto;
  }

  /* Dropdown Styles */
  .dropdown-container {
    position: relative;
    margin-left: 8px;
  }

  .dropdown-toggle {
    background: transparent;
    border: none;
    color: #ccc;
    cursor: pointer;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 16px;
    font-weight: bold;
    line-height: 1;
    transition: all 0.2s ease;
  }

  .dropdown-toggle:hover {
    background: #444;
    color: #fff;
  }

  .dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    background: #2a2a2a;
    border: 1px solid #444;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    min-width: 160px;
    z-index: 1000;
    padding: 4px 0;
    margin-top: 4px;
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 8px 12px;
    background: transparent;
    border: none;
    color: #ccc;
    cursor: pointer;
    font-size: 12px;
    text-align: left;
    gap: 8px;
    transition: background-color 0.15s ease;
  }

  .dropdown-item:hover {
    background: #333;
    color: #fff;
  }

  .dropdown-item.danger {
    color: #ff6b6b;
  }

  .dropdown-item.danger:hover {
    background: #ff6b6b;
    color: #fff;
  }

  .dropdown-icon {
    font-size: 11px;
    width: 14px;
    text-align: center;
  }

  .dropdown-divider {
    border: none;
    border-top: 1px solid #444;
    margin: 4px 0;
  }

  :global(.svelte-flow .svelte-flow__handle) {
    width: 8px;
    height: 8px;
    background: #666;
    border: 2px solid #333;
    border-radius: 50%;
  }

  :global(.svelte-flow .svelte-flow__handle.svelte-flow__handle-left) {
    left: -4px;
  }

  :global(.svelte-flow .svelte-flow__handle.svelte-flow__handle-right) {
    right: -4px;
  }

  :global(.svelte-flow .svelte-flow__handle:hover) {
    background: #4a9eff;
  }
</style>