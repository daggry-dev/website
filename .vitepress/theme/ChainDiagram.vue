<template>
  <figure class="dgm">
    <ScrollFrame label="Hash-chain diagram">
    <svg viewBox="0 0 960 330" role="img" aria-label="Hash-chained log: each entry's link is the hash of the previous link and the artifact digest; the signature covers the link">
      <defs><marker id="ah2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" class="arrow hot"/></marker></defs>
      <text x="20" y="96" class="lbl">genesis</text>
      <rect x="20" y="106" width="90" height="34" rx="9" class="box"/><text x="65" y="128" text-anchor="middle" class="sm mono">0000…0000</text>
      <path d="M110 123 H150" class="edge hot" marker-end="url(#ah2)"/>
      <text x="130" y="116" text-anchor="middle" class="sm">prev</text>

      <g v-for="(e, i) in entries" :key="i">
        <rect :x="e.x" y="60" width="240" height="210" rx="18" class="box"/>
        <text :x="e.x + 20" y="88" class="lbl">entry {{ i }}</text>
        <rect :x="e.x + 16" y="100" width="208" height="46" rx="9" class="cool"/>
        <text :x="e.x + 28" y="118" class="sm">artifact digest</text>
        <text :x="e.x + 28" y="136" class="sm mono">{{ e.d }}…</text>
        <rect :x="e.x + 16" y="156" width="208" height="46" rx="9" class="warm"/>
        <text :x="e.x + 28" y="174" class="sm">link = SHA-256(prev ‖ digest)</text>
        <text :x="e.x + 28" y="192" class="sm mono">{{ e.l }}…</text>
        <rect :x="e.x + 16" y="212" width="208" height="42" rx="9" class="rose"/>
        <text :x="e.x + 28" y="230" class="sm">signature</text>
        <text :x="e.x + 28" y="245" class="sm">Ed25519 over the link</text>
      </g>
      <path d="M390 179 H430" class="edge hot" marker-end="url(#ah2)"/>
      <text x="410" y="170" text-anchor="middle" class="sm">prev</text>
      <path d="M670 179 H710" class="edge hot" marker-end="url(#ah2)"/>
      <rect x="710" y="100" width="230" height="130" rx="18" class="warm"/>
      <text x="825" y="130" text-anchor="middle" class="lbl">head</text>
      <text x="825" y="158" text-anchor="middle" class="sm mono">3a77b48c…bd3e</text>
      <text x="825" y="184" text-anchor="middle" class="sm">signed, kept outside the cluster</text>
      <text x="825" y="202" text-anchor="middle" class="sm">catches dropped newest entries</text>
      <text x="480" y="308" text-anchor="middle" class="sm">Change any byte in entry 0 and every later link and signature stops matching.</text>
    </svg>
    </ScrollFrame>
    <figcaption class="cap">Two entries from the published test vector, shortened. For the status of the signed head kept outside the cluster, see the <a :href="withBase('/roadmap')">roadmap</a>.</figcaption>
  </figure>
</template>
<script setup lang="ts">
import { withBase } from 'vitepress'
import ScrollFrame from './ScrollFrame.vue'
const entries = [
  { x: 150, d: '8f1ffe80a26e8b0c', l: '7fc34ebfe846fffe' },
  { x: 430, d: 'f8b0387d375d474d', l: '3a77b48ce8bbf843' },
]
</script>
