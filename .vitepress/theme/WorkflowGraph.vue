<script setup lang="ts">
import ScrollFrame from './ScrollFrame.vue'
const before = [
  { k: 'agent', t: 'Plan', d: 'criteria with ids', c: 'cool' },
  { k: 'human', t: 'Approve', d: 'waiting_for: approval', c: 'rose' },
]
const loop = [
  { k: 'agent', t: 'Write test', d: 'next criterion', c: 'cool' },
  { k: 'runner', t: 'Red proof', d: 'fails on base', c: 'box' },
  { k: 'agent', t: 'Implement', d: 'make it green', c: 'cool' },
  { k: 'verify', t: 'Measure', d: 'fresh worktree', c: 'warm' },
]
const after = [
  { k: 'effect', t: 'Open PR', d: 'daggry/<run-id>', c: 'warm' },
]
</script>

<template>
  <figure class="dgm wf">
    <ScrollFrame label="Delivery workflow">
      <div class="row">
        <template v-for="s in before" :key="s.t"><div :class="['n', s.c]"><small>{{ s.k }}</small><b>{{ s.t }}</b><em>{{ s.d }}</em></div><span class="a" aria-hidden="true">→</span></template>
        <div class="loop">
          <small class="lt">loop · until all criteria covered · bounded</small>
          <div class="lrow">
            <template v-for="(s, i) in loop" :key="s.t"><div :class="['n', s.c]"><small>{{ s.k }}</small><b>{{ s.t }}</b><em>{{ s.d }}</em></div><span v-if="i < loop.length - 1" class="a" aria-hidden="true">→</span></template>
          </div>
          <small class="back">↺ red? repeat the item · exhausted → fail or ask a human</small>
        </div>
        <template v-for="s in after" :key="s.t"><span class="a" aria-hidden="true">→</span><div :class="['n', s.c]"><small>{{ s.k }}</small><b>{{ s.t }}</b><em>{{ s.d }}</em></div></template>
      </div>
    </ScrollFrame>
    <figcaption class="cap">The shape of a delivery workflow: a plan, a human approval, a bounded red-then-green loop that hands to a person when it runs out, and a pull request.</figcaption>
  </figure>
</template>

<style scoped>
/* Wide panels: the designed single row, scrolling sideways inside the frame. */
.row { display: flex; align-items: center; gap: 10px; min-width: 1040px; }
.n { display: flex; flex-direction: column; gap: 3px; padding: 14px 16px; border-radius: 14px; border: 1px solid var(--dg-surface-stroke); background: var(--dg-surface); min-width: 112px; }
.n.warm { background: var(--dg-warm-fill); border-color: var(--dg-warm-stroke); }
.n.cool { background: var(--dg-cool-fill); border-color: var(--dg-cool-stroke); }
.n.rose { background: var(--dg-rose-fill); border-color: var(--dg-rose-stroke); }
.n small { font: 500 10px var(--vp-font-family-mono); letter-spacing: .1em; text-transform: uppercase; color: var(--dg-muted); }
.n b { font-size: 14px; color: var(--dg-ink); }
.n em { font-style: normal; font-size: 11px; color: var(--dg-muted); }
.a { color: var(--dg-edge); font-size: 18px; line-height: 1; }
.loop { border: 1.4px dashed var(--dg-edge-hot); border-radius: 22px; padding: 12px 16px 10px; display: flex; flex-direction: column; gap: 10px; }
.lrow { display: flex; align-items: center; gap: 10px; }
.lt, .back { font: 500 10px var(--vp-font-family-mono); letter-spacing: .06em; color: var(--vp-c-brand-1); }
.back { color: var(--dg-muted); }

/* Narrow panels (phones): the same graph as a vertical column, no sideways scroll. */
@container dgm (max-width: 600px) {
  .row, .lrow { flex-direction: column; align-items: stretch; min-width: 0; gap: 6px; }
  .a { align-self: center; transform: rotate(90deg); }
  .n {
    min-width: 0; display: grid; grid-template-columns: 4.6rem minmax(0, 1fr);
    column-gap: 12px; row-gap: 2px; align-items: baseline; padding: 11px 14px;
  }
  .n small { grid-row: 1 / span 2; }
  .n b, .n em { grid-column: 2; overflow-wrap: anywhere; }
  .loop { padding: 12px 12px 10px; border-radius: 18px; }
  .lt, .back { line-height: 1.5; }
}
</style>
