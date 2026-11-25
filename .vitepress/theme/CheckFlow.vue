<script setup lang="ts">
import DgArrow from './DgArrow.vue'
import DgIcon from './DgIcon.vue'
</script>

<template>
  <figure class="dgm chk">
    <div class="dg-body">
      <ol class="dg-flow">
        <li>
          <div class="dg-node warm">
            <span class="dg-who">reads</span>
            <b>Sealed records</b>
            <span>Results code already checked and signed.</span>
          </div>
          <DgArrow hot />
        </li>
        <li>
          <div class="dg-node cool check">
            <span class="dg-who">runs</span>
            <b>A check written as code</b>
            <span>For example: every planned item has a check that failed before the work and passes after it.</span>
          </div>
          <DgArrow hot />
        </li>
        <li>
          <div class="dg-node">
            <span class="dg-who">decides</span>
            <b>Verdict</b>
            <span>Same records, same verdict, every time.</span>
            <span class="dg-chip ok v"><DgIcon name="tick" />pass</span>
          </div>
          <DgArrow hot />
        </li>
        <li>
          <div class="gates">
            <div class="dg-node ok">
              <b>Gate opens</b>
              <span>The next step starts.</span>
            </div>
            <div class="dg-node rose">
              <b>Gate stays closed</b>
              <span>On a fail, the run stops or loops back.</span>
            </div>
          </div>
        </li>
      </ol>

      <div class="claim">
        <div class="bubble">
          <span class="dg-who">the agent says</span>
          <q>Done, all checks pass.</q>
        </div>
        <div class="bounce">
          <DgIcon name="back" class="bi" />
          <span><b>Bounced.</b> No sealed record backs it, so the check never sees it. A claim on its own opens no gate.</span>
        </div>
      </div>
    </div>
    <figcaption class="cap">
      A check written as code reads only sealed records and gives a verdict; the gate opens only on a pass.
      What the agent says about its own work is not a record, so it cannot open a gate.
    </figcaption>
  </figure>
</template>

<style scoped>
.v { align-self: flex-start; margin-top: 6px; }
.gates { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 8px; }
.gates .dg-node { flex: 1 1 auto; }
.check { box-shadow: 0 0 0 3px var(--dg-cool-fill); }

.claim { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 16px; margin-top: 18px; padding-top: 18px; border-top: 1px dashed var(--dg-surface-stroke); }
.bubble { min-width: 0; padding: 10px 16px; border-radius: 16px 16px 16px 4px; background: var(--dg-bubble); display: flex; flex-direction: column; gap: 2px; }
.bubble q { font-size: 14px; color: var(--dg-ink); text-decoration: line-through; text-decoration-color: var(--dg-no); text-decoration-thickness: 1.5px; }
.bounce { flex: 1 1 260px; min-width: 0; display: flex; align-items: flex-start; gap: 8px; font-size: 13px; line-height: 1.55; color: var(--dg-muted); }
.bounce b { color: var(--dg-no); font-weight: 600; }
.bi { flex: none; width: 18px; height: 18px; margin-top: 1px; color: var(--dg-no); }
</style>
