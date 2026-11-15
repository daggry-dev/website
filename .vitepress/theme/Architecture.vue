<template>
  <figure class="dgm">
    <ScrollFrame label="Architecture diagram">
    <svg viewBox="0 0 960 440" role="img" aria-label="Architecture: GitHub issue to control plane to launcher to pod to pull request">
      <defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" class="arrow"/></marker></defs>
      <!-- left: GitHub -->
      <rect x="20" y="130" width="150" height="180" rx="16" class="box"/>
      <text x="95" y="156" text-anchor="middle" class="lbl">GitHub</text>
      <rect x="40" y="172" width="110" height="44" rx="10" class="cool"/><text x="95" y="199" text-anchor="middle" class="md">Issue</text>
      <rect x="40" y="244" width="110" height="44" rx="10" class="warm"/><text x="95" y="271" text-anchor="middle" class="md">Pull request</text>
      <!-- control plane -->
      <rect x="230" y="40" width="300" height="360" rx="20" class="box"/>
      <text x="380" y="68" text-anchor="middle" class="lbl">Cluster · control plane</text>
      <rect x="254" y="86" width="252" height="86" rx="14" class="warm"/>
      <text x="380" y="112" text-anchor="middle" class="md">Control plane</text>
      <text x="380" y="132" text-anchor="middle" class="sm">decides the next step · seals · judges</text>
      <text x="380" y="152" text-anchor="middle" class="sm mono">holds the seal key</text>
      <rect x="254" y="196" width="118" height="64" rx="12" class="cool"/><text x="313" y="224" text-anchor="middle" class="md">Log</text><text x="313" y="243" text-anchor="middle" class="sm">hash-chained</text>
      <rect x="388" y="196" width="118" height="64" rx="12" class="cool"/><text x="447" y="224" text-anchor="middle" class="md">Blobs</text><text x="447" y="243" text-anchor="middle" class="sm">by digest</text>
      <rect x="254" y="290" width="252" height="86" rx="14" class="box"/>
      <text x="380" y="316" text-anchor="middle" class="md">Launcher</text>
      <text x="380" y="336" text-anchor="middle" class="sm">creates, watches, deletes pods</text>
      <text x="380" y="356" text-anchor="middle" class="sm">never reads the graph</text>
      <!-- pod -->
      <rect x="610" y="90" width="330" height="260" rx="20" class="rose"/>
      <text x="775" y="118" text-anchor="middle" class="lbl">Sandboxed pod · one job</text>
      <rect x="634" y="136" width="282" height="64" rx="12" class="box"/><text x="775" y="163" text-anchor="middle" class="md">Runner</text><text x="775" y="182" text-anchor="middle" class="sm mono">PID 1 of the pod</text>
      <rect x="634" y="214" width="134" height="64" rx="12" class="box"/><text x="701" y="241" text-anchor="middle" class="md">Engine</text><text x="701" y="260" text-anchor="middle" class="sm">coding agent</text>
      <rect x="782" y="214" width="134" height="64" rx="12" class="box"/><text x="849" y="241" text-anchor="middle" class="md">Verify</text><text x="849" y="260" text-anchor="middle" class="sm">fresh worktree</text>
      <text x="775" y="318" text-anchor="middle" class="sm">connects outward · nothing dials in</text>
      <!-- edges -->
      <path d="M170 194 H254" class="edge hot" marker-end="url(#ah)"/>
      <text x="212" y="186" text-anchor="middle" class="sm">intake</text>
      <path d="M380 172 V196" class="edge" marker-end="url(#ah)"/>
      <path d="M380 260 V290" class="edge" marker-end="url(#ah)"/>
      <path d="M506 333 H558 V168 H634" class="edge hot" marker-end="url(#ah)"/>
      <text x="580" y="250" text-anchor="middle" class="sm" transform="rotate(-90 580 250)">launch</text>
      <path d="M254 140 H212 V266 H170" class="edge hot" marker-end="url(#ah)"/>
      <text x="212" y="296" text-anchor="middle" class="sm">open PR</text>
      <path d="M634 190 H590 V150 H506" class="edge" marker-end="url(#ah)"/>
      <text x="548" y="180" text-anchor="middle" class="sm">claims</text>
    </svg>
    </ScrollFrame>
    <figcaption class="cap">The pod holds a model credential and a scoped GitHub token, never the seal key. Results travel back as claims; only the control plane turns them into evidence.</figcaption>
  </figure>
</template>
<script setup lang="ts">
import ScrollFrame from './ScrollFrame.vue'
</script>
