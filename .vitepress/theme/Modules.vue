<template>
  <figure class="dgm">
    <ScrollFrame label="Module diagram">
    <svg viewBox="0 0 960 500" role="img" aria-label="Modules: four open formats on top, the modules below. The conductor reads the tenant config and the workflow, and hands each job attempt to a runner under a lease. The runner, drawn as the deterministic runner and the agent runner, reads the project config, runs script validators and the engine, and sends claims to the control plane. The control plane has validators check the claims, seals them as evidence and keeps them in the store. The forge sends work in and takes the result.">
      <defs>
        <marker id="mod-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" class="arrow"/></marker>
        <marker id="mod-ah-hot" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" class="arrow hot"/></marker>
      </defs>
      <!-- the four standards -->
      <text x="20" y="28" class="lbl">Open formats · the files the modules read and write</text>
      <rect x="20" y="44" width="130" height="60" rx="12" class="cool"/>
      <text x="85" y="70" text-anchor="middle" class="md">Tenant config</text>
      <text x="85" y="88" text-anchor="middle" class="sm">how the factory works</text>
      <rect x="170" y="44" width="130" height="60" rx="12" class="cool"/>
      <text x="235" y="70" text-anchor="middle" class="md">Workflow</text>
      <text x="235" y="88" text-anchor="middle" class="sm">the work, as steps</text>
      <rect x="445" y="44" width="150" height="60" rx="12" class="cool"/>
      <text x="520" y="70" text-anchor="middle" class="md">Project config</text>
      <text x="520" y="88" text-anchor="middle" class="sm">true of one project</text>
      <rect x="765" y="44" width="150" height="60" rx="12" class="cool"/>
      <text x="840" y="70" text-anchor="middle" class="md">Evidence</text>
      <text x="840" y="88" text-anchor="middle" class="sm">signed, linked records</text>
      <!-- conductor -->
      <rect x="20" y="170" width="280" height="230" rx="18" class="box"/>
      <text x="160" y="200" text-anchor="middle" class="md">Conductor</text>
      <text x="160" y="220" text-anchor="middle" class="sm">orders steps · schedules job attempts</text>
      <rect x="40" y="240" width="240" height="56" rx="12" class="cool"/>
      <text x="160" y="264" text-anchor="middle" class="md">Leases</text>
      <text x="160" y="282" text-anchor="middle" class="sm">the one authority on liveness</text>
      <text x="160" y="330" text-anchor="middle" class="sm">never holds a key</text>
      <text x="160" y="348" text-anchor="middle" class="sm">never seals a record</text>
      <text x="160" y="366" text-anchor="middle" class="sm">never runs a step's work</text>
      <!-- runners -->
      <rect x="390" y="170" width="260" height="100" rx="18" class="rose"/>
      <text x="520" y="200" text-anchor="middle" class="md">Deterministic runner</text>
      <text x="520" y="220" text-anchor="middle" class="sm">commands · script validators</text>
      <text x="520" y="244" text-anchor="middle" class="sm">never starts a model</text>
      <rect x="390" y="290" width="260" height="110" rx="18" class="rose"/>
      <text x="520" y="318" text-anchor="middle" class="md">Agent runner</text>
      <text x="520" y="338" text-anchor="middle" class="sm">agentic or model-generated work</text>
      <rect x="410" y="350" width="220" height="36" rx="10" class="box"/>
      <text x="520" y="372" text-anchor="middle" class="sm">Engine · any agent, by its adapter</text>
      <!-- control plane -->
      <rect x="740" y="170" width="200" height="230" rx="18" class="warm"/>
      <text x="840" y="200" text-anchor="middle" class="md">Control plane</text>
      <text x="840" y="220" text-anchor="middle" class="sm">seals · holds the keys</text>
      <rect x="754" y="236" width="172" height="56" rx="12" class="cool"/>
      <text x="840" y="260" text-anchor="middle" class="md">Validators</text>
      <text x="840" y="278" text-anchor="middle" class="sm">check as code · add your own</text>
      <rect x="754" y="304" width="172" height="56" rx="12" class="box"/>
      <text x="840" y="328" text-anchor="middle" class="md">Store</text>
      <text x="840" y="346" text-anchor="middle" class="sm">the trail · tenant state</text>
      <text x="840" y="384" text-anchor="middle" class="sm">a claim becomes evidence</text>
      <!-- forge -->
      <rect x="740" y="432" width="200" height="56" rx="14" class="box"/>
      <text x="840" y="456" text-anchor="middle" class="md">Forge</text>
      <text x="840" y="474" text-anchor="middle" class="sm">work in · result out</text>
      <path d="M840 432 V400" class="edge" marker-end="url(#mod-ah)"/>
      <!-- legend -->
      <text x="20" y="464" class="lbl">The seven modules you set up as your factory</text>
      <!-- edges: standards into modules -->
      <path d="M85 104 V170" class="edge" marker-end="url(#mod-ah)"/>
      <text x="95" y="142" class="sm">limits · agents</text>
      <path d="M235 104 V170" class="edge" marker-end="url(#mod-ah)"/>
      <text x="245" y="142" class="sm">steps</text>
      <path d="M520 104 V170" class="edge" marker-end="url(#mod-ah)"/>
      <text x="530" y="142" class="sm">validators · protected paths</text>
      <path d="M840 170 V104" class="edge hot" marker-end="url(#mod-ah-hot)"/>
      <text x="850" y="142" class="sm">writes</text>
      <!-- edges: between modules -->
      <path d="M300 220 H390" class="edge hot" marker-end="url(#mod-ah-hot)"/>
      <text x="345" y="212" text-anchor="middle" class="sm">job attempt</text>
      <text x="345" y="238" text-anchor="middle" class="sm">under a lease</text>
      <path d="M300 340 H390" class="edge hot" marker-end="url(#mod-ah-hot)"/>
      <text x="345" y="332" text-anchor="middle" class="sm">job attempt</text>
      <text x="345" y="358" text-anchor="middle" class="sm">under a lease</text>
      <path d="M650 220 H740" class="edge" marker-end="url(#mod-ah)"/>
      <text x="695" y="212" text-anchor="middle" class="sm">claims</text>
      <path d="M650 340 H740" class="edge" marker-end="url(#mod-ah)"/>
      <text x="695" y="332" text-anchor="middle" class="sm">claims</text>
    </svg>
    </ScrollFrame>
    <figcaption class="cap">
      The seven modules and the four open formats they read and write. The runner is drawn twice, because it runs a step as a script or with an agent. The conductor hands a job attempt to a runner, the runner sends back
      claims, validators check each claim as code, and the control plane seals it as evidence in the store. The forge sends work in and takes the result.
      You can add your own validators: a script, or a native validator in any language.
    </figcaption>
  </figure>
</template>
<script setup lang="ts">
import ScrollFrame from './ScrollFrame.vue'
</script>
