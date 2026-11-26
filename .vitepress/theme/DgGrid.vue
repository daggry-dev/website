<script setup lang="ts">
// Columns of cards, each a titled list. It wraps to fewer columns on narrow panels.
defineProps<{ cols: { who?: string; t: string; tone?: string; d?: string; items?: string[]; chip?: string }[]; min?: number }>()
</script>

<template>
  <figure class="dgm">
    <div class="dg-body">
      <div class="grid" :style="{ '--min': (min ?? 190) + 'px' }">
        <div v-for="c in cols" :key="c.t" class="dg-node" :class="c.tone">
          <span v-if="c.who" class="dg-who">{{ c.who }}</span>
          <b>{{ c.t }}</b>
          <span v-if="c.d">{{ c.d }}</span>
          <ul v-if="c.items">
            <li v-for="it in c.items" :key="it">{{ it }}</li>
          </ul>
          <span v-if="c.chip" class="dg-chip">{{ c.chip }}</span>
        </div>
      </div>
      <slot name="below" />
    </div>
    <figcaption class="cap"><slot /></figcaption>
  </figure>
</template>

<style scoped>
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(var(--min), 100%), 1fr)); gap: 10px; }
.dgm ul { list-style: none; margin: 4px 0 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.dgm ul li { margin: 0; padding: 4px 9px; border-radius: 8px; font-size: 12.5px; line-height: 1.45; background: var(--dg-surface); border: 1px solid var(--dg-surface-stroke); color: var(--dg-ink); overflow-wrap: anywhere; }
.dg-chip { align-self: flex-start; margin-top: 6px; }
</style>
