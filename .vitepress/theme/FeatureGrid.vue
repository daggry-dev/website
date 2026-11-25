<script setup lang="ts">
import DgIcon from './DgIcon.vue'

// The six features, in the fixed order, each with the problem it removes.
const features = [
  { i: 'flow', t: 'Workflows', p: 'An agent that chooses its own process can skip the part you care about.' },
  { i: 'tick', t: 'Validators', p: 'An agent that reports on its own work can report a pass that did not happen.' },
  { i: 'person', t: 'Approvals', p: 'Some decisions are yours, and a wrong guess can waste a night.' },
  { i: 'lock', t: 'Protected paths', p: 'The easiest way to pass a test is to change the test.' },
  { i: 'link', t: 'Evidence trail', p: 'A record that someone can edit later proves nothing.' },
  { i: 'box', t: 'Isolated runners', p: 'Whatever an agent can reach, it can misuse.' },
] as const

const label = 'The six features and the problem each one removes. ' + features.map((f, n) => `${n + 1}. ${f.t}: ${f.p}`).join(' ')
</script>

<template>
  <figure class="dgm feat">
    <div class="dg-body">
      <div class="grid" role="img" :aria-label="label">
        <div v-for="(f, n) in features" :key="f.t" class="dg-node ft">
          <span class="ico"><DgIcon :name="f.i" /></span>
          <b>{{ n + 1 }}. {{ f.t }}</b>
          <span class="dg-who">removes</span>
          <span class="prob">{{ f.p }}</span>
        </div>
      </div>
    </div>
    <figcaption class="cap">
      The six features, each with the problem it removes: workflows, validators, approvals, protected paths, the
      evidence trail and isolated runners. The sections on this page say how each one removes its problem.
    </figcaption>
  </figure>
</template>

<style scoped>
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 10px; }
.dg-node .ico {
  width: 34px; height: 34px; border-radius: 10px; display: grid; place-items: center; margin-bottom: 6px;
  font-size: 18px; color: var(--dg-on-amber);
  background: linear-gradient(135deg, var(--dg-amber-soft), var(--dg-amber));
}
.dg-node b { font-size: 15px; }
.dg-node .dg-who { margin-top: 4px; }
.dg-node .prob { color: var(--dg-ink); }
@media (forced-colors: active) { .dg-node .ico { background: none; color: CanvasText; border: 1px solid CanvasText; } }
</style>
