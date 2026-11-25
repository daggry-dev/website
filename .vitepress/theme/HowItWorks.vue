<script setup lang="ts">
import DgArrow from './DgArrow.vue'
import DgIcon from './DgIcon.vue'

const file = ['steps:', '  write a plan', '  wait for your approval', '  for each criterion:', '    do the work, validate it', '  deliver the result']
</script>

<template>
  <figure class="dgm hiw">
    <div class="dg-body">
      <ol class="dg-flow steps">
        <li>
          <div class="step">
            <div class="art file" aria-hidden="true">
              <span class="fname">workflow file</span>
              <span v-for="(l, i) in file" :key="i" class="ln" :class="{ key: i === 0 }">{{ l }}</span>
            </div>
            <h3><span class="n">1</span>Describe</h3>
            <p>You describe the work as a file of fixed steps. The agent follows it and cannot change it.</p>
          </div>
          <DgArrow hot />
        </li>
        <li>
          <div class="step">
            <div class="art pods" aria-hidden="true">
              <div v-for="p in ['plan', 'work', 'validate']" :key="p" class="pod">
                <span class="job">{{ p }}</span>
                <span class="repo"><DgIcon name="lock" />one workspace</span>
              </div>
            </div>
            <h3><span class="n">2</span>Run in isolation</h3>
            <p>Each job runs in a throwaway runner that never holds the signing key.</p>
          </div>
          <DgArrow hot />
        </li>
        <li>
          <div class="step">
            <div class="art recs" aria-hidden="true">
              <div v-for="(r, i) in ['test passes after', 'test failed before', 'plan approved']" :key="r" class="rec" :style="{ '--i': i }">
                <DgIcon name="tick" /><span>{{ r }}</span>
              </div>
              <span class="seal">sealed</span>
            </div>
            <h3><span class="n">3</span>Check and record</h3>
            <p>What an agent says it did is only a claim. Validators measure it as code. A judge decides from the evidence trail and Daggry signs the verdict. You can add your own validators.</p>
          </div>
        </li>
      </ol>
    </div>
    <figcaption class="cap">
      Three steps. You describe the work once. Each job gets its own runner. Nothing moves on until validators have measured it and a judge has returned a verdict that Daggry signed into the evidence trail.
    </figcaption>
  </figure>
</template>

<style scoped>
.step { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; }
.step h3 { display: flex; align-items: center; gap: 10px; margin: 18px 0 6px; font-family: var(--font-display); font-weight: 400; font-size: 1.55rem; line-height: 1.1; letter-spacing: -0.01em; color: var(--dg-ink); }
.n {
  flex: none; width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center;
  font: 600 12px var(--vp-font-family-mono); color: var(--dg-on-amber);
  background: linear-gradient(135deg, var(--dg-amber-soft), var(--dg-amber));
}
.step p { margin: 0; font-size: .92rem; line-height: 1.65; color: var(--dg-muted); }

/* The little pictures share one minimum height, tall enough for the workflow
   file, so the headings line up; any of them may grow if its text needs more. */
.art { min-height: 184px; border-radius: 16px; border: 1px solid var(--dg-surface-stroke); background: var(--dg-surface); padding: 14px; }

.file { display: flex; flex-direction: column; gap: 2px; background: var(--dg-code-bg); font: 12px/1.5 var(--vp-font-family-mono); color: var(--dg-ink); }
.fname { font-size: 11px; color: var(--dg-muted); padding-bottom: 6px; margin-bottom: 4px; border-bottom: 1px solid var(--dg-surface-stroke); }
.ln { white-space: pre; overflow: hidden; text-overflow: ellipsis; }
.ln.key { color: var(--vp-c-brand-1); }

.pods { display: flex; flex-direction: column; gap: 8px; justify-content: center; background: transparent; border-style: dashed; border-color: var(--dg-edge); }
.pod { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 7px 12px; border-radius: 12px; background: var(--dg-rose-fill); border: 1px solid var(--dg-rose-stroke); min-width: 0; }
.job { font-size: 13px; font-weight: 600; color: var(--dg-ink); }
.repo { display: inline-flex; align-items: center; gap: 4px; font: 500 10.5px var(--vp-font-family-mono); color: var(--dg-muted); white-space: nowrap; }
.repo svg { width: 11px; height: 11px; }

.recs { position: relative; display: flex; flex-direction: column; gap: 7px; justify-content: center; background: var(--dg-warm-fill); border-color: var(--dg-warm-stroke); }
.rec { display: flex; align-items: center; gap: 7px; padding: 6px 10px; border-radius: 10px; background: var(--dg-surface); border: 1px solid var(--dg-warm-stroke); font-size: 12px; color: var(--dg-ink); min-width: 0; margin-right: 54px; }
.rec svg { width: 13px; height: 13px; flex: none; color: var(--dg-ok); }
.rec span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.seal {
  position: absolute; right: 12px; bottom: 14px; width: 50px; height: 50px; border-radius: 50%;
  display: grid; place-items: center; transform: rotate(-12deg);
  font: 600 10px var(--vp-font-family-mono); color: var(--dg-on-amber);
  background: radial-gradient(circle at 35% 30%, var(--dg-amber-soft), var(--dg-amber));
  box-shadow: 0 0 0 3px var(--dg-warm-fill), 0 0 0 4px var(--dg-warm-stroke);
}

@container dgm (max-width: 720px) {
  .art { min-height: 0; }
  .steps > li { gap: 4px; }
}
</style>
