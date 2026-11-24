<script setup lang="ts">
import { withBase } from 'vitepress'
import { SIGNUP_OPEN } from './features'
</script>

<template>
  <div class="notice" role="note">
    <span class="dot" aria-hidden="true"></span>
    <span class="txt"><strong>Private preview.</strong> Daggry is not publicly released.</span>
    <a class="go" :href="withBase('/roadmap')">Roadmap</a>
    <a v-if="SIGNUP_OPEN" class="go" :href="withBase('/#signup')">Join the public beta list</a>
  </div>
</template>

<style scoped>
.notice {
  position: fixed; top: 0; left: 0; right: 0; z-index: var(--vp-z-index-layout-top, 40);
  height: var(--vp-layout-top-height); box-sizing: border-box; padding: 0 16px;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  background: var(--dg-warm-fill); border-bottom: 1px solid var(--dg-warm-stroke);
  color: var(--dg-ink); font-size: .85rem; line-height: 1; white-space: nowrap; overflow: hidden;
}
.dot { flex: none; width: 8px; height: 8px; border-radius: 50%; background: var(--dg-amber); }
.txt { overflow: hidden; text-overflow: ellipsis; min-width: 0; }
.go { flex: none; color: var(--vp-c-brand-1); font-weight: 500; text-decoration: none; }
.go:hover { text-decoration: underline; text-underline-offset: 3px; }
@media (max-width: 560px) { .txt .rest { display: none; } .notice { font-size: .8rem; gap: 8px; padding: 0 12px; } }
</style>
