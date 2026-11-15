<script setup lang="ts">
import DgArrow from './DgArrow.vue'
</script>

<template>
  <figure class="dgm seal">
    <div class="dg-body">
      <ol class="dg-flow">
        <li>
          <div class="dg-node">
            <span class="dg-who">1. record</span>
            <b>A step's result</b>
            <span class="dg-mono sample">tests re-run: 0 failures</span>
            <span>Written by code, not by the agent.</span>
          </div>
          <DgArrow />
        </li>
        <li>
          <div class="dg-node cool">
            <span class="dg-who">2. fingerprint</span>
            <b>A short code from every byte</b>
            <span class="dg-mono sample">e0d3…</span>
            <span>Change one byte and the code changes.</span>
          </div>
          <DgArrow />
        </li>
        <li>
          <div class="dg-node cool">
            <span class="dg-who">3. combine</span>
            <b>Joined with the trail so far</b>
            <span class="dg-mono sample">trail 4b7a… + e0d3… = 5f19…</span>
            <span>The new link vouches for every record before it.</span>
          </div>
          <DgArrow hot />
        </li>
        <li>
          <div class="dg-node rose">
            <span class="dg-who">4. sign</span>
            <b>Signed with a key</b>
            <span class="dg-mono sample">signature over 5f19…</span>
            <span>The key never enters a pod, so no agent can sign.</span>
          </div>
          <DgArrow hot />
        </li>
        <li>
          <div class="dg-node warm">
            <span class="dg-who">5. append</span>
            <b>Added to the end of the trail</b>
            <span class="trail" aria-hidden="true"><i /><i /><i /><i class="new" /></span>
            <span>Nothing can be edited afterwards without it showing.</span>
          </div>
        </li>
      </ol>
    </div>
    <figcaption class="cap">
      Sealing a record: take its fingerprint, combine it with the link that ends the trail so far, sign the new link,
      and add it to the trail. Change any earlier record and every later fingerprint stops matching.
    </figcaption>
  </figure>
</template>

<style scoped>
.sample { display: block; margin: 4px 0; padding: 5px 8px; border-radius: 8px; background: var(--dg-surface); border: 1px solid var(--dg-surface-stroke); color: var(--dg-ink); }
.dg-node:not(.cool):not(.rose):not(.warm) .sample { background: var(--dg-code-bg); }
.trail { display: flex; align-items: center; gap: 4px; margin: 6px 0; }
.trail i { width: 18px; height: 14px; border-radius: 4px; border: 1px solid var(--dg-warm-stroke); background: var(--dg-surface); }
.trail i.new { background: var(--dg-amber); border-color: var(--dg-edge-hot); }
</style>
