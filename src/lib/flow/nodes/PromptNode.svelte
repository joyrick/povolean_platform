<script>
  import BaseNode from './BaseNode.svelte';
  
  let { data = {}, id = '', type = '' } = $props();
</script>

<BaseNode
  icon="💬"
  title="Prompt"
  subtitle={data.hint || 'Text input with variable support'}
  inputs={0}
  outputs={1}
  {id}
  {type}
  {data}
>
  {#snippet children()}
    <div class="node-content">
      <div class="prompt-text">
        {data.prompt || 'Compare the environmental impact of electric vehic...'}
      </div>
    </div>
  {/snippet}
</BaseNode>

<style>
  .node-content {
    padding: 8px;
  }
  
  .prompt-text {
    font-size: 12px;
    color: #888;
    line-height: 1.4;
    max-width: 180px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
  }
</style>
