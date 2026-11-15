<script setup lang="ts">
import DgArrow from './DgArrow.vue'
import DgIcon from './DgIcon.vue'

const cmd = 'daggry approve <run-id>'
const items = ['Limit each API key to 100 requests a minute', 'Return a clear error when the limit is hit', 'Show the limit in the response headers', 'Log every refused request', 'Document the limit']
</script>

<template>
  <figure class="dgm hw">
    <div class="dg-body pair">
      <div class="card wait" role="group" aria-label="Before: waiting for your approval">
        <p class="state"><span class="dot" aria-hidden="true" />Waiting for you</p>
        <p class="ttl">Approve this plan</p>
        <p class="reason"><b>Why it stopped:</b> this workflow asks a person to approve every plan before any code is written.</p>
        <div class="plan">
          <p class="pt">Add rate limiting to the public API</p>
          <ol>
            <li v-for="i in items" :key="i">{{ i }}</li>
          </ol>
          <span class="dg-chip"><DgIcon name="link" />plan fingerprint 9c1e</span>
        </div>
        <p class="acts">
          <span class="how">To approve, run:</span>
          <code><span class="pr" aria-hidden="true">$</span> {{ cmd }}</code>
        </p>
      </div>

      <DgArrow hot class="mid" />

      <div class="card done" role="group" aria-label="After: approved and recorded">
        <p class="state ok"><DgIcon name="tick" />Approved</p>
        <p class="ttl">Approved by you at 22:04</p>
        <p class="reason">Recorded against the plan you saw, not just the plan's name.</p>
        <div class="rec">
          <span class="dg-chip ok"><DgIcon name="tick" />recorded by code</span>
          <span class="dg-chip"><DgIcon name="link" />approves plan 9c1e</span>
        </div>
        <p class="note">If anyone changes the plan afterwards, its fingerprint changes and your approval no longer matches it. The run goes on overnight.</p>
      </div>
    </div>
    <figcaption class="cap">
      An approval. The run stops where the workflow says a person decides, and says why. Your approval is recorded
      against the fingerprint of the exact plan you read, so it cannot be moved to a different plan.
    </figcaption>
  </figure>
</template>

<style scoped>
.pair { display: flex; align-items: center; gap: 12px; }
.card { flex: 1 1 0; min-width: 0; align-self: stretch; padding: 18px 20px; border-radius: 18px; border: 1px solid var(--dg-surface-stroke); background: var(--dg-surface); overflow-wrap: anywhere; }
.wait { border-color: var(--dg-warm-stroke); box-shadow: 0 0 0 3px var(--dg-warm-fill); }
.done { background: var(--dg-ok-fill); border-color: var(--dg-ok-stroke); }
.state { display: inline-flex; align-items: center; gap: 7px; margin: 0; font-size: 12.5px; font-weight: 600; color: var(--vp-c-brand-1); }
.state.ok { color: var(--dg-ok); }
.state svg { width: 14px; height: 14px; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: var(--dg-amber); box-shadow: 0 0 0 3px var(--dg-warm-fill); }
.card .ttl { margin: 8px 0 6px; font-family: var(--font-display); font-weight: 400; font-size: 1.45rem; line-height: 1.15; letter-spacing: -0.01em; color: var(--dg-ink); }
.reason { margin: 0 0 12px; font-size: 13px; line-height: 1.55; color: var(--dg-muted); }
.reason b { color: var(--dg-ink); font-weight: 600; }
.plan { padding: 12px 14px; border-radius: 12px; background: var(--dg-code-bg); border: 1px solid var(--dg-surface-stroke); }
.pt { margin: 0 0 6px; font-size: 13.5px; font-weight: 600; color: var(--dg-ink); }
.plan ol { margin: 0 0 10px; padding-left: 1.3em; font-size: 12.5px; line-height: 1.55; color: var(--dg-muted); }
.plan li { margin: 0; }
.acts { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 10px; margin: 14px 0 0; }
.how { font-size: 12.5px; color: var(--dg-muted); }
.acts code {
  max-width: 100%; overflow-wrap: anywhere; padding: 6px 12px; border-radius: 10px;
  font: 500 12.5px var(--vp-font-family-mono); color: var(--dg-ink);
  background: var(--dg-code-bg); border: 1px solid var(--dg-surface-stroke);
}
.pr { color: var(--dg-muted); margin-right: 4px; }
.rec { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
.note { margin: 0; font-size: 12.5px; line-height: 1.55; color: var(--dg-muted); }
.mid { flex: none; }

@container dgm (max-width: 640px) {
  .pair { flex-direction: column; align-items: stretch; }
  .card { flex: none; }
  .mid { align-self: center; transform: rotate(90deg); }
}
</style>
