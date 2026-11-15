<template>
  <svg class="dg-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path v-if="name === 'tick'" d="M3.5 8.5 6.5 11.5 12.5 4.5" />
    <template v-else-if="name === 'link'">
      <path d="M6.5 9.5 9.5 6.5" />
      <path d="M7 4.5 8.2 3.3a2.6 2.6 0 0 1 3.7 3.7L10.7 8.2M9 11.5l-1.2 1.2a2.6 2.6 0 0 1-3.7-3.7L5.3 7.8" />
    </template>
    <template v-else-if="name === 'lock'">
      <rect x="3.5" y="7" width="9" height="6.5" rx="1.6" />
      <path d="M5.5 7V5.2a2.5 2.5 0 0 1 5 0V7" />
    </template>
    <template v-else-if="name === 'stop'">
      <circle cx="8" cy="8" r="5.5" />
      <path d="M4.2 11.8 11.8 4.2" />
    </template>
    <template v-else-if="name === 'back'">
      <path d="M6 4 3 7l3 3" />
      <path d="M3 7h6.5a3.5 3.5 0 0 1 0 7H7" />
    </template>
    <template v-else-if="name === 'person'">
      <circle cx="8" cy="5.5" r="2.5" />
      <path d="M3.5 13.5a4.5 4.5 0 0 1 9 0" />
    </template>
  </svg>
</template>
<script setup lang="ts">
defineProps<{ name: 'tick' | 'link' | 'lock' | 'stop' | 'back' | 'person' }>()
</script>
