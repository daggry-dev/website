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
    <template v-else-if="name === 'doc'">
      <path d="M4.5 2.5h5l2.5 2.5v8.5h-7.5z" />
      <path d="M9.5 2.5V5H12M6.5 8.5h3M6.5 11h3" />
    </template>
    <template v-else-if="name === 'data'">
      <ellipse cx="8" cy="4.5" rx="4.5" ry="2" />
      <path d="M3.5 4.5v7c0 1.1 2 2 4.5 2s4.5-.9 4.5-2v-7M3.5 8c0 1.1 2 2 4.5 2s4.5-.9 4.5-2" />
    </template>
    <template v-else-if="name === 'branch'">
      <circle cx="4.5" cy="4" r="1.5" />
      <circle cx="4.5" cy="12" r="1.5" />
      <circle cx="11.5" cy="12" r="1.5" />
      <path d="M4.5 5.5v5M11.5 10.5V7a2 2 0 0 0-2-2H8" />
    </template>
    <path v-else-if="name === 'list'" d="M6.5 4.5h6M6.5 8h6M6.5 11.5h6M3.5 4.5h.01M3.5 8h.01M3.5 11.5h.01" />
    <path v-else-if="name === 'stack'" d="M8 2.5 13.5 5.5 8 8.5 2.5 5.5zM2.5 8.5 8 11.5l5.5-3M2.5 11 8 14l5.5-3" />
    <path v-else-if="name === 'pen'" d="M3 13l.7-2.8 7-7a1.5 1.5 0 0 1 2.1 2.1l-7 7zM9.7 4.2l2.1 2.1" />
    <path v-else-if="name === 'tag'" d="M2.5 8.2V3.5a1 1 0 0 1 1-1h4.7l5.3 5.3a1 1 0 0 1 0 1.4l-4.3 4.3a1 1 0 0 1-1.4 0zM5.5 5.5h.01" />
    <template v-else-if="name === 'search'">
      <circle cx="7" cy="7" r="4" />
      <path d="M10 10l3.5 3.5" />
    </template>
    <template v-else-if="name === 'flow'">
      <rect x="2" y="2.5" width="4" height="4" rx="1" />
      <rect x="10" y="9.5" width="4" height="4" rx="1" />
      <path d="M6 4.5h3a3 3 0 0 1 3 3v2" />
    </template>
    <path v-else-if="name === 'box'" d="M2.5 5 8 2.5 13.5 5v6L8 13.5 2.5 11zM2.5 5 8 7.5 13.5 5M8 7.5v6" />
    <path v-else-if="name === 'folder'" d="M2 4.5a1 1 0 0 1 1-1h3l1.5 1.5H13a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z" />
    <template v-else-if="name === 'key'">
      <circle cx="5" cy="11" r="2.5" />
      <path d="M7 9l5.5-5.5M10.5 5.5 12 7M9 7l1.2 1.2" />
    </template>
  </svg>
</template>
<script setup lang="ts">
defineProps<{
  name:
    | 'tick' | 'link' | 'lock' | 'stop' | 'back' | 'person'
    | 'doc' | 'data' | 'branch' | 'list' | 'stack' | 'pen' | 'tag' | 'search' | 'flow' | 'box' | 'folder' | 'key'
}>()
</script>
