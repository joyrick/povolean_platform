<script>
  import BaseNode from './BaseNode.svelte';
  
  let { data = {}, id = '', type = '' } = $props();
</script>

<BaseNode
  icon="📄"
  title="Output Viewer"
  subtitle=""
  inputs={1}
  outputs={0}
  {id}
  {type}
  {data}
>
  {#snippet children()}
    <div class="node-content">
      <div class="status">Waiting for input...</div>
    </div>
  {/snippet}
</BaseNode>

<style>
  .node-content {
    padding: 8px;
  }
  
  .status {
    font-size: 12px;
    color: #888;
    font-style: italic;
  }
</style>
