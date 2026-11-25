<script setup lang="ts">
import DgArrow from './DgArrow.vue'
import DgIcon from './DgIcon.vue'

const steps = [
  { who: 'agent', t: 'Write the proof', d: 'a test for the next plan item', c: 'cool' },
  { who: 'code', t: 'Shown to fail', d: 'before the work', c: '' },
  { who: 'agent', t: 'Do the work', d: 'change the paths in scope', c: 'cool' },
  { who: 'code', t: 'Run again on a clean copy', d: 'every validator', c: 'warm' },
]
</script>

<template>
  <figure class="dgm lg">
    <div class="dg-body grid">
      <div class="loop">
        <p class="lt">One iteration for each plan item, up to the loop limit</p>
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
        <p class="back"><DgIcon name="back" />Plan items left, or this one failed: another iteration</p>
      </div>

      <DgArrow hot class="to-gate" />

      <div class="gate">
        <div class="g">
          <b>Gate</b>
          <span>the rule that lets the loop stop</span>
        </div>
        <ul class="exits">
          <li class="dg-node ok">
            <span class="dg-who">every plan item covered</span>
            <b>Next step</b>
          </li>
          <li class="dg-node rose">
            <span class="dg-who">loop limit reached</span>
            <b><DgIcon name="person" class="pi" />Fails, or a person decides</b>
          </li>
        </ul>
      </div>
    </div>
    <figcaption class="cap">
      Each iteration takes one plan item through four steps, two by the agent and two by code: the agent writes a proof,
      code shows that the proof fails before the work, the agent does the work, and code runs every validator on a clean
      copy. The gate lets the run go on only when every plan item is covered. At the loop limit, the run fails, or it
      waits for you at the <code>human</code> step the workflow names. In software, the proof is a test.
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
