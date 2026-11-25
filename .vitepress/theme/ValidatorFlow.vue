<script setup lang="ts">
import DgArrow from './DgArrow.vue'
import DgIcon from './DgIcon.vue'
</script>

<template>
  <figure class="dgm vflow">
    <div class="dg-body">
      <ol class="dg-flow">
        <li>
          <div class="dg-node warm">
            <span class="dg-who">goes in</span>
            <b>A clean copy of the workspace</b>
            <span class="dg-mono sample">run: [sh, scripts/links.sh]</span>
            <span>One sealed version. No agent process is running.</span>
          </div>
          <DgArrow />
        </li>
        <li>
          <div class="dg-node cool">
            <span class="dg-who">a validator runs</span>
            <b>Your command</b>
            <span class="dg-mono sample">exit 1</span>
            <span>It measures and never produces a verdict. The exit code always counts. Findings and metrics come with <code>output: document</code> or a tool format.</span>
          </div>
          <DgArrow hot />
        </li>
        <li>
          <div class="dg-node rose">
            <span class="dg-who">sealed as a measurement</span>
            <b>What the validator reported</b>
            <span class="dg-mono sample">exit_code: 1<br>findings: 2 fail<br>metrics: links 41</span>
            <span>Signed and added to the trail.</span>
          </div>
          <DgArrow hot />
        </li>
        <li>
          <div class="dg-node rose">
            <span class="dg-who">a judge decides</span>
            <b>Sealed as a verdict</b>
            <span class="dg-mono sample">outcome: fail<br>findings_fail: 2</span>
            <span>The evidence trail goes in: every sealed record so far. Daggry seals the verdict. The validator never writes it.</span>
          </div>
          <DgArrow hot />
        </li>
        <li>
          <div class="gate">
            <div class="dg-node ok">
              <span class="dg-who">a gate reads</span>
              <b>Facts, not claims</b>
              <span class="dg-mono sample">verdict.outcome == 'pass'</span>
              <span class="dg-chip ok"><DgIcon name="tick" />opens on a pass</span>
            </div>
          </div>
        </li>
      </ol>

      <div class="trail-row">
        <span class="dg-who">recorded, in this order</span>
        <ol class="chain">
          <li class="dg-chip">the change</li>
          <li class="arr" aria-hidden="true">←</li>
          <li class="dg-chip">measurement <code>check-head-links</code></li>
          <li class="arr" aria-hidden="true">←</li>
          <li class="dg-chip">verdict <code>verdict-1</code></li>
        </ol>
        <p>Each record names the one it builds on as its <code>parents</code>, so you can walk from a verdict back to the change.</p>
      </div>

      <div class="notes">
        <div class="note">
          <DgIcon name="stack" class="ni" />
          <span><b>Four kinds of judge.</b> <b>Default:</b> every verify step has it. <b>Named:</b> <code>coverage</code> or <code>no_regression</code>. <b>Custom:</b> your command. <b>Rubric:</b> a bounded model under a rubric a person approved. All four are given the same evidence trail.</span>
        </div>
        <div class="note">
          <DgIcon name="doc" class="ni" />
          <span><b>A fail goes back with context.</b> The agent gets the failing findings and the tail of the command's output. That output is a run log, not sealed and not evidence.</span>
        </div>
        <div class="note">
          <DgIcon name="back" class="ni" />
          <span><b>A preview seals nothing.</b> The agent can run the same command on its working copy. That result is never evidence and opens no gate.</span>
        </div>
      </div>
    </div>
    <figcaption class="cap">
      Validators measure. Judges judge. A gate decides when to stop. A validator takes a clean copy of the workspace and reports an exit code and, optionally, findings.
      Daggry seals the report as a measurement. A judge is given the evidence trail and decides, and Daggry seals the verdict. A gate reads the verdict's facts and runs nothing.
    </figcaption>
  </figure>
</template>

<style scoped>
.sample { display: block; margin: 4px 0; padding: 5px 8px; border-radius: 8px; background: var(--dg-surface); border: 1px solid var(--dg-surface-stroke); color: var(--dg-ink); }
.gate { flex: 1 1 auto; min-width: 0; display: flex; }
.gate .dg-node { flex: 1 1 auto; }
.dg-node :deep(code), .trail-row code, .note code { font-family: var(--vp-font-family-mono); font-size: 11.5px; }
.dg-chip { align-self: flex-start; }

.trail-row { margin-top: 18px; padding-top: 18px; border-top: 1px dashed var(--dg-surface-stroke); display: flex; flex-direction: column; gap: 8px; }
.trail-row p { margin: 0; font-size: 12.5px; line-height: 1.5; color: var(--dg-muted); }
.chain { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; list-style: none; margin: 0; padding: 0; }
.chain li { margin: 0; }
.chain .arr { color: var(--dg-edge-hot); font-size: 14px; }

.notes { margin-top: 18px; padding-top: 18px; border-top: 1px dashed var(--dg-surface-stroke); display: flex; flex-wrap: wrap; gap: 12px 24px; }
.note { flex: 1 1 260px; min-width: 0; display: flex; align-items: flex-start; gap: 8px; font-size: 13px; line-height: 1.55; color: var(--dg-muted); }
.note b { color: var(--dg-ink); font-weight: 600; }
.ni { flex: none; width: 18px; height: 18px; margin-top: 1px; color: var(--dg-edge-hot); }
</style>
