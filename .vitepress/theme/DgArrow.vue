<template>
  <svg class="dg-arrow" :class="{ hot }" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
    <path d="M2 9h12M10 4.5 14.5 9 10 13.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>
<script setup lang="ts">
defineProps<{ hot?: boolean }>()
</script>
