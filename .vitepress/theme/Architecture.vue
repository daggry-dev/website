<template>
  <figure class="dgm">
    <ScrollFrame label="Architecture diagram">
    <svg viewBox="0 0 960 440" role="img" aria-label="Architecture: on your Kubernetes cluster, the control plane holds the trail and the keys, and the conductor orders the steps and starts a throwaway pod for each job. The pod holds the agent and the checks, a token for one repository and the model credential, never the signing key. GitHub sends work in and receives the pull request. You use the CLI on your machine.">
      <defs>
        <marker id="arch-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" class="arrow"/></marker>
        <marker id="arch-ah-hot" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" class="arrow hot"/></marker>
      </defs>
      <!-- GitHub -->
      <rect x="10" y="110" width="110" height="220" rx="16" class="box"/>
      <text x="65" y="136" text-anchor="middle" class="lbl">GitHub</text>
      <rect x="20" y="152" width="90" height="44" rx="10" class="cool"/><text x="65" y="179" text-anchor="middle" class="md">Issue</text>
      <rect x="20" y="256" width="90" height="44" rx="10" class="warm"/><text x="65" y="283" text-anchor="middle" class="md">Pull request</text>
      <!-- your cluster -->
      <rect x="190" y="24" width="760" height="296" rx="24" class="edge dash"/>
      <text x="210" y="47" class="lbl">Your Kubernetes cluster</text>
      <!-- control plane -->
      <rect x="210" y="60" width="230" height="240" rx="18" class="warm"/>
      <text x="325" y="90" text-anchor="middle" class="md">Control plane</text>
      <text x="325" y="110" text-anchor="middle" class="sm">seals results · serves the API</text>
      <rect x="226" y="126" width="198" height="56" rx="12" class="cool"/>
      <text x="325" y="150" text-anchor="middle" class="md">The trail</text>
      <text x="325" y="168" text-anchor="middle" class="sm">every sealed record</text>
      <rect x="226" y="196" width="198" height="84" rx="12" class="box"/>
      <text x="325" y="222" text-anchor="middle" class="md">The keys stay here</text>
      <text x="325" y="242" text-anchor="middle" class="sm">the signing key</text>
      <text x="325" y="260" text-anchor="middle" class="sm">the GitHub App key</text>
      <!-- conductor -->
      <rect x="480" y="60" width="140" height="130" rx="18" class="box"/>
      <text x="550" y="90" text-anchor="middle" class="md">Conductor</text>
      <text x="550" y="112" text-anchor="middle" class="sm">orders the steps</text>
      <text x="550" y="130" text-anchor="middle" class="sm">starts a pod per job</text>
      <text x="550" y="148" text-anchor="middle" class="sm">liveness by lease</text>
      <text x="550" y="172" text-anchor="middle" class="sm">holds no key</text>
      <!-- pod -->
      <rect x="648" y="60" width="292" height="240" rx="18" class="rose"/>
      <text x="794" y="88" text-anchor="middle" class="lbl">Throwaway pod · one job</text>
      <rect x="662" y="104" width="128" height="64" rx="12" class="box"/><text x="726" y="131" text-anchor="middle" class="md">Agent</text><text x="726" y="150" text-anchor="middle" class="sm">does the work</text>
      <rect x="798" y="104" width="128" height="64" rx="12" class="box"/><text x="862" y="131" text-anchor="middle" class="md">Checks</text><text x="862" y="150" text-anchor="middle" class="sm">on a clean copy</text>
      <text x="794" y="196" text-anchor="middle" class="sm">holds a token for one repository</text>
      <text x="794" y="214" text-anchor="middle" class="sm">and the model credential</text>
      <text x="794" y="246" text-anchor="middle" class="md">The signing key never enters the pod</text>
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
      <text x="155" y="296" text-anchor="middle" class="sm">opens a PR</text>
      <path d="M440 125 H480" class="edge" marker-end="url(#arch-ah)"/>
      <path d="M620 125 H648" class="edge hot" marker-end="url(#arch-ah-hot)"/>
      <path d="M648 240 H440" class="edge" marker-end="url(#arch-ah)"/>
      <text x="544" y="232" text-anchor="middle" class="sm">results, as claims</text>
      <path d="M325 356 V300" class="edge" marker-end="url(#arch-ah)"/>
      <text x="337" y="334" class="sm">start · approve · verify</text>
    </svg>
    </ScrollFrame>
    <figcaption class="cap">
      Four parts: the control plane, the conductor, a throwaway pod for each job, and the CLI. The control plane keeps the
      trail and the keys; the conductor orders the steps and starts the pods; the signing key never enters a pod. What the
      pod sends back is only a claim until the control plane checks it and seals it.
    </figcaption>
  </figure>
</template>
<script setup lang="ts">
import ScrollFrame from './ScrollFrame.vue'
</script>
