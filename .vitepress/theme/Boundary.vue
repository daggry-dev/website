<script setup lang="ts">
import DgIcon from './DgIcon.vue'

const editable = [
  { f: 'handbook/leave.md', d: 'in this step\'s scope' },
  { f: 'handbook/pay.md', d: 'in this step\'s scope' },
  { f: 'handbook/index.md', d: 'in this step\'s scope' },
]
const protectedItems = [
  { t: 'Its proofs', d: 'frozen paths: a proof sealed earlier in the run stays exactly as it was' },
  { t: 'Its own instructions', d: "the workflow, its persona's instructions and the files that tell agents what to do" },
  { t: 'Its validators and limits', d: 'which validators check the work, and what it can write' },
]
</script>

<template>
  <figure class="dgm bd">
    <div class="dg-body">
      <div class="pod">
        <p class="podl">Throwaway runner: one job, one workspace</p>
        <div class="agent"><span class="av" aria-hidden="true">A</span>The agent</div>
        <span class="stem" aria-hidden="true" />
        <div class="zones">
          <div class="zone">
            <p class="link go"><span class="ln" aria-hidden="true" />writes</p>
            <div class="box can">
              <p class="bt">The agent can change</p>
              <ul>
                <li v-for="e in editable" :key="e.f"><code>{{ e.f }}</code><span>{{ e.d }}</span></li>
              </ul>
            </div>
          </div>
          <div class="zone">
            <p class="link no"><span class="ln" aria-hidden="true" /><DgIcon name="stop" class="si" />blocked by code</p>
            <div class="box prot">
              <p class="bt"><DgIcon name="lock" class="li" />Protected</p>
              <ul>
                <li v-for="p in protectedItems" :key="p.t"><b>{{ p.t }}</b><span>{{ p.d }}</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <p class="outside">Never in the runner: the signing key and the forge key. The runner's token works for this one workspace only.</p>
    </div>
    <figcaption class="cap">
      What an agent can change. Inside its runner it can edit the files in its step's scope. Its proofs, its
      instructions, its validators and its limits are protected: an edit there is restored, and the step fails
      if anything protected changed. Code enforces the rule. In software, the proofs are tests.
    </figcaption>
  </figure>
</template>

<style scoped>
.pod { position: relative; border: 1.6px dashed var(--dg-edge); border-radius: 22px; padding: 16px 18px 18px; }
.podl { margin: 0 0 14px; font-size: 12.5px; font-weight: 500; color: var(--dg-muted); }
.agent {
  display: flex; align-items: center; gap: 10px; width: fit-content; max-width: 100%; margin: 0 auto;
  padding: 8px 16px 8px 8px; border-radius: 999px; background: var(--dg-cool-fill); border: 1px solid var(--dg-cool-stroke);
  font-size: 14px; font-weight: 600; color: var(--dg-ink);
}
.av { width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; font: 600 12px var(--vp-font-family-mono); background: var(--dg-surface); border: 1px solid var(--dg-cool-stroke); }
.stem { display: block; width: 2px; height: 12px; margin: 0 auto; background: var(--dg-edge); }
.zones { position: relative; padding-top: 12px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.zones::before { content: ''; position: absolute; top: 0; left: 25%; right: 25%; height: 12px; border: 2px solid var(--dg-edge); border-bottom: 0; border-radius: 10px 10px 0 0; }
.zone { min-width: 0; display: flex; flex-direction: column; align-items: center; }

/* Connector from the agent down to each zone. */
.link { display: flex; flex-direction: column; align-items: center; gap: 2px; margin: 0; padding-bottom: 6px; font: 500 11.5px var(--vp-font-family-mono); }
.ln { display: block; width: 0; height: 26px; border-left: 2px solid currentColor; }
.go { color: var(--dg-ok); }
.go .ln { position: relative; }
.go .ln::after { content: ''; position: absolute; left: -6px; bottom: -2px; border: 5px solid transparent; border-top: 7px solid currentColor; border-bottom: 0; }
.no { color: var(--dg-no); }
.no .ln { border-left-style: dashed; height: 18px; }
.si { width: 18px; height: 18px; }

.box { align-self: stretch; flex: 1 1 auto; min-width: 0; padding: 14px 16px; border-radius: 16px; border: 1px solid; overflow-wrap: anywhere; }
.can { background: var(--dg-ok-fill); border-color: var(--dg-ok-stroke); }
.prot { background: var(--dg-rose-fill); border-color: var(--dg-rose-stroke); }
.box .bt { display: flex; align-items: center; gap: 6px; margin: 0 0 10px; font-size: 14px; line-height: 1.4; font-weight: 600; color: var(--dg-ink); }
.li { width: 15px; height: 15px; color: var(--dg-no); }
.box ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.box li { margin: 0; display: flex; flex-direction: column; gap: 1px; padding: 8px 10px; border-radius: 10px; background: var(--dg-surface); border: 1px solid var(--dg-surface-stroke); }
.box li code { font: 500 12px var(--vp-font-family-mono); color: var(--dg-ink); background: transparent; padding: 0; }
.box li b { font-size: 13px; color: var(--dg-ink); }
.box li span { font-size: 12px; line-height: 1.45; color: var(--dg-muted); }
.outside { margin: 12px 0 0; font-size: 12.5px; line-height: 1.55; color: var(--dg-muted); }

@container dgm (max-width: 560px) {
  .pod { padding: 14px 12px 14px; }
  .zones { grid-template-columns: minmax(0, 1fr); gap: 4px; padding-top: 0; }
  .zones::before { display: none; }
}
</style>
