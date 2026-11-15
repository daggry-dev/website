<script setup lang="ts">
// A horizontal scroller for diagrams that are too wide to shrink legibly.
// Edge fades and the hint appear only when the content really overflows,
// and the frame takes keyboard focus only then.
import { ref, onMounted, onBeforeUnmount } from 'vue'

defineProps<{ label: string }>()

const el = ref<HTMLElement | null>(null)
const moreStart = ref(false)
const moreEnd = ref(false)
let ro: ResizeObserver | undefined

function update() {
  const e = el.value
  if (!e) return
  const max = e.scrollWidth - e.clientWidth
  moreStart.value = e.scrollLeft > 1
  moreEnd.value = e.scrollLeft < max - 1
}

onMounted(() => {
  update()
  if (typeof ResizeObserver !== 'undefined' && el.value) {
    ro = new ResizeObserver(update)
    ro.observe(el.value)
    for (const child of Array.from(el.value.children)) ro.observe(child)
  }
})
onBeforeUnmount(() => ro?.disconnect())
</script>

<template>
  <div class="sf-wrap">
    <div class="sf" :class="{ 'more-start': moreStart, 'more-end': moreEnd }">
      <div
        ref="el"
        class="sf-scroll"
        :tabindex="moreStart || moreEnd ? 0 : undefined"
        :role="moreStart || moreEnd ? 'group' : undefined"
        :aria-label="moreStart || moreEnd ? `${label}, scrolls sideways` : undefined"
        @scroll.passive="update"
      >
        <slot />
      </div>
    </div>
    <p v-if="moreStart || moreEnd" class="sf-hint" aria-hidden="true">Scroll sideways to see the whole diagram</p>
  </div>
</template>
