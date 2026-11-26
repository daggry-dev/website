<script setup lang="ts">
import DgIcon from './DgIcon.vue'

const label =
  'One sealed record, in four layers. The result: what the step produced, with its kind, its id and its body. ' +
  'Added by code at sealing: who produced it, when, which records it builds on and which key signs it. For an agent step, who is the persona and the digest of its instructions. ' +
  'The digest: a short code computed from everything above it. ' +
  'The signature: made with the signing key, which never enters a runner. ' +
  'A seal proves that a validator ran and that the record is unchanged. ' +
  'It does not prove that you chose the right validators.'
</script>

<template>
  <figure class="dgm rec">
    <div class="dg-body">
      <div class="lay" role="img" :aria-label="label">
        <div class="sheet">
          <span class="seal">sealed</span>
          <div class="dg-node">
            <span class="dg-who">the result</span>
            <b>What the step produced</b>
            <span>Its kind, its id and its body.</span>
          </div>
          <div class="dg-node cool">
            <span class="dg-who">added by code at sealing</span>
            <b>Who, when and from what</b>
            <span>Who produced it, when, which records it builds on and which key signs it. For an agent step, who is the persona and the digest of its instructions.</span>
          </div>
          <div class="dg-node cool">
            <span class="dg-who">digest</span>
            <b><span class="dg-mono">e0d3…</span></b>
            <span>A short code computed from everything above it.</span>
          </div>
          <div class="dg-node rose">
            <span class="dg-who">signature</span>
            <b><DgIcon name="key" />Signed with a key</b>
            <span>The signing key never enters a runner.</span>
          </div>
        </div>
        <div class="says">
          <div class="dg-node ok">
            <b>A seal proves</b>
            <span class="pt"><DgIcon name="tick" />A validator ran.</span>
            <span class="pt"><DgIcon name="tick" />The record is unchanged.</span>
          </div>
          <div class="dg-node">
            <b>A seal does not prove</b>
            <span class="pt no"><DgIcon name="stop" />That you chose the right validators.</span>
          </div>
        </div>
      </div>
    </div>
    <figcaption class="cap">
      What a sealed record contains. The result is what the step produced: its kind, its id and its body. Code
      adds who produced it, when, which records it builds on and which key signs it. For an agent step, who is
      the persona and the digest of its instructions. The digest is computed
      from all of that, and the signature is made with a key that never enters a runner. A seal proves that a
      validator ran and that the record is unchanged. It does not prove that you chose the right validators.
    </figcaption>
  </figure>
</template>

<style scoped>
.lay { display: grid; grid-template-columns: minmax(0, 3fr) minmax(0, 2fr); gap: 14px; align-items: start; }
/* The record is one sheet of paper: its four layers stack with no gap. */
.sheet { position: relative; min-width: 0; display: flex; flex-direction: column; border-radius: 14px; }
.sheet .dg-node { border-radius: 0; }
.sheet .dg-node + .dg-node { border-top: 0; }
.sheet .dg-node:first-of-type { border-radius: 14px 14px 0 0; padding-right: 72px; }
.sheet .dg-node:last-of-type { border-radius: 0 0 14px 14px; }
.dg-node b { display: flex; align-items: center; gap: 7px; }
.dg-node b .dg-mono { font-size: 13px; color: var(--dg-ink); }
.seal {
  position: absolute; right: 12px; top: 10px; z-index: 1; width: 50px; height: 50px; border-radius: 50%;
  display: grid; place-items: center; transform: rotate(-12deg);
  font: 600 10px var(--vp-font-family-mono); color: var(--dg-on-amber);
  background: radial-gradient(circle at 35% 30%, var(--dg-amber-soft), var(--dg-amber));
  box-shadow: 0 0 0 3px var(--dg-surface), 0 0 0 4px var(--dg-warm-stroke);
}
.says { min-width: 0; display: flex; flex-direction: column; gap: 8px; }
.dg-node .pt { display: flex; align-items: flex-start; gap: 7px; color: var(--dg-ink); }
.pt svg { margin-top: 3px; width: 13px; height: 13px; color: var(--dg-ok); }
.pt.no svg { color: var(--dg-no); }
@container dgm (max-width: 560px) { .lay { grid-template-columns: minmax(0, 1fr); } }
@media (forced-colors: active) { .seal { background: none; color: CanvasText; border: 1px solid CanvasText; } }
</style>
