<script>
  import BaseNode from './BaseNode.svelte';
  
  let { data = {}, id = '', type = '' } = $props();
</script>

<BaseNode
  icon="✨"
  title="Gemini LLM"
  subtitle={data.model || 'Google\'s Gemini models'}
  inputs={1}
  outputs={1}
  {id}
  {type}
  {data}
>
  {#snippet children()}
    <div class="node-content">
      <div class="status">Idle</div>
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
  }
</style>
