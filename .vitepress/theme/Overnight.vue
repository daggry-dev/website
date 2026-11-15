<template>
  <figure class="dgm overnight">
    <ScrollFrame label="Overnight timeline">
      <svg viewBox="0 0 960 300" role="img" aria-label="Overnight timeline: you approve a plan at 22:00, agents work unattended while code checks each step, and at 06:30 a pull request and its trail are ready">
        <defs>
          <linearGradient id="sky" x1="0" x2="1">
            <stop offset="0" class="s-lilac"/><stop offset=".45" class="s-sky"/>
            <stop offset=".8" class="s-rose"/><stop offset="1" class="s-peach"/>
          </linearGradient>
          <linearGradient id="sun" x1="0" y1="0" x2="1" y2="1"><stop offset="0" class="s-sun-a"/><stop offset="1" class="s-sun-b"/></linearGradient>
        </defs>
        <rect x="0" y="0" width="960" height="300" rx="18" fill="url(#sky)" opacity=".75"/>
        <!-- horizon -->
        <line x1="40" y1="206" x2="920" y2="206" class="edge"/>
        <!-- sun -->
        <path d="M800 206 a58 58 0 0 1 116 0z" fill="url(#sun)"/>
        <!-- stars -->
        <g class="stars"><circle cx="150" cy="40" r="2"/><circle cx="260" cy="70" r="1.6"/><circle cx="380" cy="32" r="2"/><circle cx="470" cy="62" r="1.5"/><circle cx="560" cy="38" r="2"/></g>
        <!-- stations -->
        <g v-for="s in stops" :key="s.x">
          <circle :cx="s.x" cy="206" r="7" class="station"/>
          <text :x="s.x" y="232" text-anchor="middle" class="lbl">{{ s.t }}</text>
          <text :x="s.x" y="252" text-anchor="middle" class="md">{{ s.h }}</text>
          <text :x="s.x" y="270" text-anchor="middle" class="sm">{{ s.d }}</text>
        </g>
        <!-- the night's work -->
        <rect x="250" y="120" width="440" height="52" rx="14" class="night"/>
        <text x="470" y="142" text-anchor="middle" class="lbl">Unattended</text>
        <text x="470" y="160" text-anchor="middle" class="md">test fails first, make it pass, re-check, seal</text>
      </svg>
    </ScrollFrame>
    <figcaption class="cap">In the morning there is a pull request, and beside it a record of every check that passed on the way. If the run needed you, it stopped and says why.</figcaption>
  </figure>
</template>
<script setup lang="ts">
import ScrollFrame from './ScrollFrame.vue'
const stops = [
  { x: 110, t: '22:00', h: 'Approve the plan', d: 'you, before bed' },
  { x: 470, t: '03:00', h: 'Pods at work', d: 'agents work, code checks' },
  { x: 858, t: '06:30', h: 'Dawn', d: 'pull request and trail' },
]
</script>
<style scoped>
.s-lilac { stop-color: var(--dg-lilac); }
.s-sky { stop-color: var(--dg-sky); }
.s-rose { stop-color: var(--dg-rose); }
.s-peach { stop-color: var(--dg-peach); }
.s-sun-a { stop-color: var(--dg-sun-a); }
.s-sun-b { stop-color: var(--dg-sun-b); }
.stars { fill: var(--dg-star); opacity: .5; }
.station { fill: var(--dg-surface); stroke: var(--dg-ink); stroke-width: 1.5; }
.night { fill: var(--dg-surface); fill-opacity: .8; stroke: var(--dg-night-stroke); }
</style>
