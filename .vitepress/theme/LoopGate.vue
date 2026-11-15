<script setup lang="ts">
import DgArrow from './DgArrow.vue'
import DgIcon from './DgIcon.vue'

const steps = [
  { who: 'agent', t: 'Write a test', d: 'for the next item in the plan', c: 'cool' },
  { who: 'code', t: 'Shown to fail', d: 'on the code as it was', c: '' },
  { who: 'agent', t: 'Make it pass', d: 'change the code in scope', c: 'cool' },
  { who: 'code', t: 'Re-run on a clean copy', d: 'every test, fresh checkout', c: 'warm' },
]
</script>

<template>
  <figure class="dgm lg">
    <div class="dg-body grid">
      <div class="loop">
        <p class="lt">One pass of the loop, once per item, with a fixed number of tries</p>
        <ol class="dg-flow">
          <li v-for="(s, i) in steps" :key="s.t">
            <div :class="['dg-node', s.c]">
              <span class="dg-who">{{ s.who }}</span>
              <b>{{ s.t }}</b>
              <span>{{ s.d }}</span>
            </div>
            <DgArrow v-if="i < steps.length - 1" />
          </li>
        </ol>
        <p class="back"><DgIcon name="back" />Items left, or this one failed: go round again</p>
      </div>

      <DgArrow hot class="to-gate" />

      <div class="gate">
        <div class="g">
          <b>Gate</b>
          <span>a check written as code</span>
        </div>
        <ul class="exits">
          <li class="dg-node ok">
            <span class="dg-who">all items covered</span>
            <b>Next step</b>
          </li>
          <li class="dg-node rose">
            <span class="dg-who">runs out of tries</span>
            <b><DgIcon name="person" class="pi" />Fails, or a person decides</b>
          </li>
        </ul>
      </div>
    </div>
    <figcaption class="cap">
      Each pass takes one planned item through four steps, two by the agent and two by code. The gate lets the run go on
      only when every item is covered. If the tries run out, the run does not loop all night: it fails, or it waits for a
      person at the human step the workflow names.
    </figcaption>
  </figure>
</template>

<style scoped>
.grid { display: flex; align-items: center; gap: 10px; }
.loop { flex: 1 1 auto; min-width: 0; border: 1.4px dashed var(--dg-edge-hot); border-radius: 20px; padding: 12px 14px; display: flex; flex-direction: column; gap: 10px; }
.lt, .back { margin: 0; font-size: 12px; line-height: 1.5; color: var(--vp-c-brand-1); font-weight: 500; }
.back { display: flex; align-items: center; gap: 6px; color: var(--dg-muted); font-weight: 400; }
.back svg { width: 14px; height: 14px; flex: none; color: var(--dg-edge-hot); }
.to-gate { flex: none; }

.gate { flex: 0 0 210px; min-width: 0; display: flex; flex-direction: column; gap: 10px; }
.g {
  display: flex; flex-direction: column; align-items: center; text-align: center; gap: 2px;
  padding: 12px; border-radius: 14px; border: 1.6px solid var(--dg-edge-hot); background: var(--dg-warm-fill);
}
.g b { font-size: 14px; color: var(--dg-ink); }
.g span { font-size: 12px; color: var(--dg-muted); }
.exits { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.exits li { margin: 0; }
.exits b { display: inline-flex; align-items: center; gap: 6px; }
.pi { width: 15px; height: 15px; flex: none; }

/* Medium panels: the loop on top, the gate and its two exits below. */
@container dgm (max-width: 1000px) {
  .grid { flex-direction: column; align-items: stretch; }
  .to-gate { align-self: center; transform: rotate(90deg); }
  .gate { flex: none; }
  .exits { flex-direction: row; }
  .exits li { flex: 1 1 0; min-width: 0; }
}
@container dgm (max-width: 480px) {
  .exits { flex-direction: column; }
}
</style>
