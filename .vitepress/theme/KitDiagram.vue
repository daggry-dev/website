<script setup lang="ts">
import ScrollFrame from './ScrollFrame.vue'

// The three files you write, in the fixed order. Each is 200 wide.
const files = [
  { x: 20, t: 'Workflow', d: 'the steps of the work' },
  { x: 240, t: 'Project config', d: 'how to check one project' },
  { x: 460, t: 'Tenant config', d: 'how your factory works' },
]

// The parts in the order work passes through them. x and w are the slot; the
// part sits 6 inside it. The forge is drawn twice: work in, result out.
const parts = [
  { x: 30, w: 100, c: 'box', t: 'Forge', d: ['work item', 'comes in'] },
  { x: 162, w: 120, c: 'box', t: 'Conductor', d: ['picks the next', 'step and starts', 'a runner'] },
  { x: 314, w: 150, c: 'rose', t: 'Runner', d: ['does the work,', 'then is thrown away'], in: { t: 'Engine', d: 'runs the agent' } },
  { x: 496, w: 120, c: 'cool', t: 'Validators', d: ['check the work', 'as code:', 'pass or fail'] },
  { x: 648, w: 150, c: 'warm', t: 'Control plane', d: ['holds the keys,', 'signs the result'], in: { t: 'Store', d: 'keeps the trail' } },
  { x: 830, w: 100, c: 'box', t: 'Forge', d: ['result', 'goes out'] },
]
</script>

<template>
  <figure class="dgm">
    <ScrollFrame label="Factory kit diagram">
    <svg viewBox="0 0 960 440" role="img" aria-label="The factory kit. On top, the three files you write: workflow, project config and tenant config. In the middle, seven modules in a row, each in a slot you can refill: work comes in from the forge, the conductor picks the next step and starts a runner, the runner does the work on an engine, validators check the work as code, the control plane holds the keys, signs the result and keeps it in the store, and the checked result goes out to the forge. Below, the evidence trail, which Daggry writes.">
      <defs>
        <marker id="kit-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" class="arrow"/></marker>
        <marker id="kit-ah-hot" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" class="arrow hot"/></marker>
      </defs>

      <!-- the three files you write -->
      <text x="20" y="26" class="md">You write three files</text>
      <g v-for="f in files" :key="f.t">
        <path :d="`M${f.x + 10} 40H${f.x + 184}L${f.x + 200} 56V86a10 10 0 0 1-10 10H${f.x + 10}a10 10 0 0 1-10-10V50a10 10 0 0 1 10-10z`" class="cool"/>
        <path :d="`M${f.x + 184} 40V56H${f.x + 200}`" class="fold"/>
        <text :x="f.x + 16" y="65" class="md">{{ f.t }}</text>
        <text :x="f.x + 16" y="83" class="sm">{{ f.d }}</text>
        <path :d="`M${f.x + 100} 96V116`" class="edge" marker-end="url(#kit-ah)"/>
      </g>
      <text x="682" y="63" class="sm">The modules read these files.</text>
      <text x="682" y="81" class="sm">An agent can change none of them.</text>

      <!-- the tray of seven modules -->
      <rect x="14" y="120" width="932" height="204" rx="24" class="tray"/>
      <text x="30" y="146" class="md">Work in</text>
      <text x="480" y="146" text-anchor="middle" class="sm">Seven modules, one job each</text>
      <text x="930" y="146" text-anchor="end" class="md">Checked result out</text>
      <g v-for="(p, i) in parts" :key="i">
        <rect :x="p.x" y="160" :width="p.w" height="148" rx="16" class="slot"/>
        <rect :x="p.x + 6" y="166" :width="p.w - 12" height="136" rx="12" :class="p.c"/>
        <text :x="p.x + p.w / 2" y="190" text-anchor="middle" class="md">{{ p.t }}</text>
        <text v-for="(l, j) in p.d" :key="j" :x="p.x + p.w / 2" :y="208 + j * 16" text-anchor="middle" class="sm">{{ l }}</text>
        <template v-if="p.in">
          <rect :x="p.x + 14" y="238" :width="p.w - 28" height="54" rx="10" class="box"/>
          <text :x="p.x + p.w / 2" y="260" text-anchor="middle" class="md">{{ p.in.t }}</text>
          <text :x="p.x + p.w / 2" y="278" text-anchor="middle" class="sm">{{ p.in.d }}</text>
        </template>
        <path v-if="i < parts.length - 1" :d="`M${p.x + p.w + 3} 234H${parts[i + 1].x - 3}`" class="edge hot" marker-end="url(#kit-ah-hot)"/>
      </g>

      <!-- the evidence trail Daggry writes -->
      <path d="M723 308V352" class="edge hot" marker-end="url(#kit-ah-hot)"/>
      <text x="733" y="344" class="sm">writes</text>
      <rect x="500" y="356" width="430" height="68" rx="14" class="warm"/>
      <text x="520" y="385" class="md">Evidence trail</text>
      <text x="520" y="405" class="sm">Daggry writes it: signed, linked records.</text>
      <path d="M854 390H904" class="chain"/>
      <rect v-for="n in 4" :key="n" :x="816 + n * 22" y="382" width="16" height="16" rx="4" :class="n === 4 ? 'rec new' : 'rec'"/>

      <!-- legend -->
      <rect x="30" y="366" width="30" height="20" rx="6" class="slot"/>
      <text x="70" y="380" class="sm">A slot. You can replace the part in it with your own.</text>
      <text x="30" y="410" class="sm">The forge is drawn twice: work comes in, the result goes out.</text>
    </svg>
    </ScrollFrame>
    <figcaption class="cap">
      The factory kit. You write three files: the workflow, the project config and the tenant config. Seven
      modules read them, and each sits in a slot you can refill with your own: conductor, control plane, runner,
      engine, forge, store and validators. Work comes in from the forge. The conductor picks the next step, the
      runner does the work on an engine, validators check it as code, and the control plane signs the result and
      keeps it in the store. The checked result goes back to the forge. Daggry writes the evidence trail.
    </figcaption>
  </figure>
</template>

<style scoped>
.tray { fill: var(--dg-bubble); stroke: var(--dg-surface-stroke); stroke-width: 1.2; }
.slot { fill: none; stroke: var(--dg-edge); stroke-width: 1.2; stroke-dasharray: 4 4; }
.fold { fill: none; stroke: var(--dg-cool-stroke); }
.chain { fill: none; stroke: var(--dg-warm-stroke); stroke-width: 1.4; }
.rec { fill: var(--dg-surface); stroke: var(--dg-warm-stroke); }
.rec.new { fill: var(--dg-amber); stroke: var(--dg-edge-hot); }
</style>
