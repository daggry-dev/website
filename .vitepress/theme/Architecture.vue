<template>
  <figure class="dgm">
    <ScrollFrame label="Architecture diagram">
    <svg viewBox="0 0 960 440" role="img" aria-label="Architecture: on your Kubernetes cluster, the control plane holds the trail and the keys and starts a throwaway pod for each job. The pod holds the agent and the checks, a token for one repository and the model credential, never the signing key. GitHub sends work in and receives the pull request. You use the CLI on your machine.">
      <defs><marker id="arch-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" class="arrow"/></marker></defs>
      <!-- GitHub -->
      <rect x="20" y="110" width="130" height="220" rx="16" class="box"/>
      <text x="85" y="136" text-anchor="middle" class="lbl">GitHub</text>
      <rect x="34" y="152" width="102" height="44" rx="10" class="cool"/><text x="85" y="179" text-anchor="middle" class="md">Issue</text>
      <rect x="34" y="256" width="102" height="44" rx="10" class="warm"/><text x="85" y="283" text-anchor="middle" class="md">Pull request</text>
      <!-- your cluster -->
      <rect x="220" y="24" width="730" height="296" rx="24" class="edge dash"/>
      <text x="240" y="47" class="lbl">Your Kubernetes cluster</text>
      <!-- control plane -->
      <rect x="260" y="60" width="260" height="240" rx="18" class="warm"/>
      <text x="390" y="90" text-anchor="middle" class="md">Control plane</text>
      <text x="390" y="110" text-anchor="middle" class="sm">schedules steps · seals results</text>
      <rect x="280" y="126" width="220" height="56" rx="12" class="cool"/>
      <text x="390" y="150" text-anchor="middle" class="md">The trail</text>
      <text x="390" y="168" text-anchor="middle" class="sm">every sealed record</text>
      <rect x="280" y="196" width="220" height="84" rx="12" class="box"/>
      <text x="390" y="222" text-anchor="middle" class="md">The keys stay here</text>
      <text x="390" y="242" text-anchor="middle" class="sm">the signing key</text>
      <text x="390" y="260" text-anchor="middle" class="sm">the GitHub App key</text>
      <!-- pod -->
      <rect x="610" y="60" width="320" height="240" rx="18" class="rose"/>
      <text x="770" y="88" text-anchor="middle" class="lbl">Throwaway pod · one job</text>
      <rect x="634" y="104" width="134" height="64" rx="12" class="box"/><text x="701" y="131" text-anchor="middle" class="md">Agent</text><text x="701" y="150" text-anchor="middle" class="sm">does the work</text>
      <rect x="782" y="104" width="134" height="64" rx="12" class="box"/><text x="849" y="131" text-anchor="middle" class="md">Checks</text><text x="849" y="150" text-anchor="middle" class="sm">on a clean copy</text>
      <text x="770" y="196" text-anchor="middle" class="sm">holds a token for one repository</text>
      <text x="770" y="214" text-anchor="middle" class="sm">and the model credential</text>
      <text x="770" y="248" text-anchor="middle" class="md">The signing key never enters the pod</text>
      <text x="770" y="278" text-anchor="middle" class="sm">dials out to the control plane · nothing dials in</text>
      <!-- CLI -->
      <rect x="310" y="356" width="160" height="60" rx="14" class="box"/>
      <text x="390" y="381" text-anchor="middle" class="md">CLI</text>
      <text x="390" y="400" text-anchor="middle" class="sm">on your machine</text>
      <!-- edges -->
      <path d="M136 174 H260" class="edge hot" marker-end="url(#arch-ah)"/>
      <text x="185" y="166" text-anchor="middle" class="sm">new work</text>
      <path d="M260 278 H136" class="edge hot" marker-end="url(#arch-ah)"/>
      <text x="185" y="296" text-anchor="middle" class="sm">opens a PR</text>
      <path d="M520 120 H610" class="edge hot" marker-end="url(#arch-ah)"/>
      <text x="565" y="112" text-anchor="middle" class="sm">creates</text>
      <path d="M610 240 H520" class="edge" marker-end="url(#arch-ah)"/>
      <text x="565" y="232" text-anchor="middle" class="sm">results</text>
      <path d="M390 356 V300" class="edge" marker-end="url(#arch-ah)"/>
      <text x="402" y="334" class="sm">start · approve · verify</text>
    </svg>
    </ScrollFrame>
    <figcaption class="cap">
      Three parts: the control plane, a throwaway pod for each job, and the CLI. The control plane keeps the trail and the
      keys; the signing key never enters the pod. What the pod sends back is only a claim until the control plane checks it
      and seals it.
    </figcaption>
  </figure>
</template>
<script setup lang="ts">
import ScrollFrame from './ScrollFrame.vue'
</script>
