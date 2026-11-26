<script setup lang="ts">
import DgArrow from './DgArrow.vue'
// A row of cards joined by arrows. It reflows to a column on narrow panels (diagram.css).
defineProps<{ steps: { who?: string; t: string; d?: string; code?: string; tone?: string; chips?: string[] }[] }>()
</script>

<template>
  <figure class="dgm">
    <div class="dg-body">
      <ol class="dg-flow">
        <li v-for="(s, i) in steps" :key="s.t">
          <div class="dg-node" :class="s.tone">
            <span v-if="s.who" class="dg-who">{{ s.who }}</span>
            <b>{{ s.t }}</b>
            <span v-if="s.code" class="dg-mono code">{{ s.code }}</span>
            <span v-if="s.d">{{ s.d }}</span>
            <span v-if="s.chips" class="chips"><span v-for="c in s.chips" :key="c" class="dg-chip">{{ c }}</span></span>
          </div>
          <DgArrow v-if="i < steps.length - 1" hot />
        </li>
      </ol>
      <slot name="below" />
    </div>
    <figcaption class="cap"><slot /></figcaption>
  </figure>
</template>

<style scoped>
.code { display: block; margin: 2px 0; padding: 4px 8px; border-radius: 8px; white-space: pre-wrap; background: var(--dg-surface); border: 1px solid var(--dg-surface-stroke); color: var(--dg-ink); }
.chips { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
</style>
