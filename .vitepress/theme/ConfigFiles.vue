<script setup lang="ts">
import DgArrow from './DgArrow.vue'
import DgIcon from './DgIcon.vue'

// The three files, in the fixed order: who writes each and where it lives.
const files = [
  { t: 'Workflow', who: 'You, or whoever designs the work', where: 'A YAML file you pass to daggry run, or one the tenant offers' },
  { t: 'Project config', who: 'The project owner', where: '.daggry/project.yaml in the project' },
  { t: 'Tenant config', who: 'The tenant admin', where: 'One YAML file for the tenant' },
]

const label =
  'Three files feed a run. ' +
  files.map((f) => `${f.t}: written by ${f.who.charAt(0).toLowerCase()}${f.who.slice(1)}. ${f.where}.`).join(' ') +
  ' A run uses all three. The tenant config wins over the project config, which wins over the workflow. An agent can change none of them.'
</script>

<template>
  <figure class="dgm cfg">
    <div class="dg-body">
      <div class="lay" role="img" :aria-label="label">
        <div class="files">
          <div v-for="f in files" :key="f.t" class="dg-node cool file">
            <b><DgIcon name="doc" />{{ f.t }}</b>
            <span class="who"><DgIcon name="person" />{{ f.who }}</span>
            <span>{{ f.where }}</span>
          </div>
        </div>
        <DgArrow hot />
        <div class="dg-node warm run">
          <span class="dg-who">feeds</span>
          <b>A run</b>
          <span>A run uses all three files.</span>
          <ol class="wins">
            <li>Tenant config</li>
            <li>Project config</li>
            <li>Workflow</li>
          </ol>
          <span>Where two files disagree, the one higher in this list wins.</span>
          <span class="dg-chip"><DgIcon name="lock" />no agent can change them</span>
        </div>
      </div>
    </div>
    <figcaption class="cap">
      Who writes which file. You, or whoever designs the work, write the workflow: a YAML file you pass to
      <code>daggry run</code>, or one the tenant offers. The project owner writes the project config,
      <code>.daggry/project.yaml</code> in the project. The tenant admin writes the tenant config, one YAML file
      for the tenant. A run uses all three. The tenant config wins over the project config, which wins over the
      workflow, and an agent can change none of them.
    </figcaption>
  </figure>
</template>

<style scoped>
.lay { display: grid; grid-template-columns: minmax(0, 3fr) auto minmax(0, 2fr); gap: 10px; align-items: stretch; }
.files { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.dg-node b { display: flex; align-items: center; gap: 7px; }
.dg-node b svg { color: var(--dg-edge-hot); }
.dg-node .who { display: flex; align-items: flex-start; gap: 6px; color: var(--dg-ink); }
.who svg { margin-top: 3px; width: 12px; height: 12px; }
.run { justify-content: center; }
.dgm .wins { list-style: none; counter-reset: w; margin: 6px 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.dgm .wins li {
  counter-increment: w; margin: 0; padding: 5px 10px; border-radius: 8px; font-size: 12.5px; line-height: 1.5;
  background: var(--dg-surface); border: 1px solid var(--dg-warm-stroke); color: var(--dg-ink);
}
.dgm .wins li::before { content: counter(w) '. '; font-family: var(--vp-font-family-mono); font-size: 11px; color: var(--dg-muted); }
.dg-chip { align-self: flex-start; margin-top: 4px; }
.cap code { font-size: .85em; }
@container dgm (max-width: 560px) {
  .lay { grid-template-columns: minmax(0, 1fr); }
  .lay > .dg-arrow { justify-self: center; transform: rotate(90deg); }
}
</style>
