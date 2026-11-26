<script setup lang="ts">
import DgArrow from './DgArrow.vue'
// Rows that pair a left side (a snippet or a label) with what it leads to on the right.
defineProps<{
  left: string
  right: string
  rows: { code?: string; t?: string; d?: string; tone?: string; note?: string; chips?: { t: string; tone?: string }[] }[]
}>()
</script>

<template>
  <figure class="dgm">
    <div class="dg-body">
      <div class="head"><span class="dg-who">{{ left }}</span><span /><span class="dg-who">{{ right }}</span></div>
      <div v-for="(r, i) in rows" :key="i" class="row">
        <div class="dg-node" :class="r.tone">
          <b v-if="r.t">{{ r.t }}</b>
          <span v-if="r.code" class="dg-mono code">{{ r.code }}</span>
          <span v-if="r.d">{{ r.d }}</span>
        </div>
        <DgArrow hot />
        <div class="out">
          <span v-for="c in r.chips" :key="c.t" class="dg-chip" :class="c.tone">{{ c.t }}</span>
          <span v-if="r.note" class="note">{{ r.note }}</span>
        </div>
      </div>
      <slot name="below" />
    </div>
    <figcaption class="cap"><slot /></figcaption>
  </figure>
</template>

<style scoped>
.head, .row { display: grid; grid-template-columns: minmax(0, 5fr) 18px minmax(0, 6fr); gap: 10px; align-items: center; }
.head { margin-bottom: 8px; }
.row + .row { margin-top: 8px; }
.code { white-space: pre; overflow-x: auto; color: var(--dg-ink); }
.out { display: flex; flex-wrap: wrap; align-items: center; gap: 5px; min-width: 0; }
.note { flex: 1 1 100%; font-size: 12.5px; line-height: 1.5; color: var(--dg-muted); }
@container dgm (max-width: 560px) {
  .head { display: none; }
  .row { grid-template-columns: minmax(0, 1fr); gap: 4px; padding-bottom: 8px; border-bottom: 1px dashed var(--dg-surface-stroke); }
  .row > .dg-arrow { justify-self: center; transform: rotate(90deg); }
}
</style>
