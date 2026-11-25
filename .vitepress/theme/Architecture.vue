<template>
  <figure class="dgm">
    <ScrollFrame label="Architecture diagram">
    <svg viewBox="0 0 960 440" role="img" aria-label="Architecture: on your cluster, the control plane holds the store and the keys, and the conductor orders the steps and starts a throwaway runner for each job. The runner holds the engine and the script validators, a token for one workspace and the model credential, never the signing key. The forge sends work in and takes the result. You use the CLI on your machine. The boxes are the kit's parts.">
      <defs>
        <marker id="arch-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" class="arrow"/></marker>
        <marker id="arch-ah-hot" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" class="arrow hot"/></marker>
      </defs>
      <!-- forge -->
      <rect x="10" y="110" width="110" height="220" rx="16" class="box"/>
      <text x="65" y="136" text-anchor="middle" class="lbl">Forge</text>
      <rect x="20" y="152" width="90" height="44" rx="10" class="cool"/><text x="65" y="179" text-anchor="middle" class="md">Work item</text>
      <rect x="20" y="256" width="90" height="44" rx="10" class="warm"/><text x="65" y="283" text-anchor="middle" class="md">Result</text>
      <!-- your cluster -->
      <rect x="190" y="24" width="760" height="296" rx="24" class="edge dash"/>
      <text x="210" y="47" class="lbl">Your cluster</text>
      <!-- control plane -->
      <rect x="210" y="60" width="230" height="240" rx="18" class="warm"/>
      <text x="325" y="90" text-anchor="middle" class="md">Control plane</text>
      <text x="325" y="110" text-anchor="middle" class="sm">seals · judges · serves the API</text>
      <rect x="226" y="126" width="198" height="56" rx="12" class="cool"/>
      <text x="325" y="150" text-anchor="middle" class="md">Store</text>
      <text x="325" y="168" text-anchor="middle" class="sm">the trail · every sealed record</text>
      <rect x="226" y="196" width="198" height="84" rx="12" class="box"/>
      <text x="325" y="222" text-anchor="middle" class="md">The keys stay here</text>
      <text x="325" y="242" text-anchor="middle" class="sm">the signing key</text>
      <text x="325" y="260" text-anchor="middle" class="sm">the forge key</text>
      <!-- conductor -->
      <rect x="480" y="60" width="140" height="130" rx="18" class="box"/>
      <text x="550" y="90" text-anchor="middle" class="md">Conductor</text>
      <text x="550" y="112" text-anchor="middle" class="sm">orders the steps</text>
      <text x="550" y="130" text-anchor="middle" class="sm">a runner per job</text>
      <text x="550" y="148" text-anchor="middle" class="sm">liveness by lease</text>
      <text x="550" y="172" text-anchor="middle" class="sm">holds no key</text>
      <!-- pod -->
      <rect x="648" y="60" width="292" height="240" rx="18" class="rose"/>
      <text x="794" y="88" text-anchor="middle" class="lbl">Runner · throwaway · one job</text>
      <rect x="662" y="104" width="128" height="64" rx="12" class="box"/><text x="726" y="131" text-anchor="middle" class="md">Engine</text><text x="726" y="150" text-anchor="middle" class="sm">the agent at work</text>
      <rect x="798" y="104" width="128" height="64" rx="12" class="box"/><text x="862" y="131" text-anchor="middle" class="md">Validators</text><text x="862" y="150" text-anchor="middle" class="sm">on a clean copy</text>
      <text x="794" y="196" text-anchor="middle" class="sm">holds a token for one workspace</text>
      <text x="794" y="214" text-anchor="middle" class="sm">and the model credential</text>
      <text x="794" y="246" text-anchor="middle" class="md">The signing key never enters the runner</text>
      <text x="794" y="270" text-anchor="middle" class="sm">dials out to the control plane</text>
      <text x="794" y="286" text-anchor="middle" class="sm">nothing dials in</text>
      <!-- CLI -->
      <rect x="245" y="356" width="160" height="60" rx="14" class="box"/>
      <text x="325" y="381" text-anchor="middle" class="md">CLI</text>
      <text x="325" y="400" text-anchor="middle" class="sm">on your machine</text>
      <!-- edges -->
      <path d="M110 174 H210" class="edge hot" marker-end="url(#arch-ah-hot)"/>
      <text x="155" y="166" text-anchor="middle" class="sm">new work</text>
      <path d="M210 278 H110" class="edge hot" marker-end="url(#arch-ah-hot)"/>
      <text x="155" y="296" text-anchor="middle" class="sm">hands over</text>
      <path d="M440 125 H480" class="edge" marker-end="url(#arch-ah)"/>
      <path d="M620 125 H648" class="edge hot" marker-end="url(#arch-ah-hot)"/>
      <path d="M648 240 H440" class="edge" marker-end="url(#arch-ah)"/>
      <text x="544" y="232" text-anchor="middle" class="sm">results, as claims</text>
      <path d="M325 356 V300" class="edge" marker-end="url(#arch-ah)"/>
      <text x="337" y="334" class="sm">start · approve · verify</text>
      <!-- legend -->
      <text x="695" y="390" text-anchor="middle" class="lbl">The kit's parts, where each one runs</text>
    </svg>
    </ScrollFrame>
    <figcaption class="cap">
      The kit's parts by role: the forge, the control plane with its store, the conductor, a throwaway runner for each job, and the CLI. The control plane keeps the
      trail and the keys; the conductor orders the steps and starts the runners; the signing key never enters a runner. What the
      runner sends back is only a claim until a validator judges it and the control plane seals it.
    </figcaption>
  </figure>
</template>
<script setup lang="ts">
import ScrollFrame from './ScrollFrame.vue'
</script>
