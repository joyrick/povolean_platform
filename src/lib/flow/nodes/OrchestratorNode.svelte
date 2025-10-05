<script>
  import BaseNode from './BaseNode.svelte';
  
  let { data = {}, id = '', type = '' } = $props();
</script>

<BaseNode
  icon="🎯"
  title="Orchestrator"
  subtitle={data.strategy || 'Comparing 0 responses'}
  inputs={2}
  outputs={1}
  {id}
  {type}
  {data}
>
  {#snippet children()}
    <div class="node-content">
      <div class="scoring">
        Scoring: Correctness, Completeness, Clarity, Citations
      </div>
      <div class="status">Idle</div>
    </div>
  {/snippet}
</BaseNode>

<style>
  .node-content {
    padding: 8px;
  }
  
  .scoring {
    font-size: 11px;
    color: #666;
    margin-bottom: 4px;
    line-height: 1.3;
  }
  
  .status {
    font-size: 12px;
    color: #888;
  }
</style>
