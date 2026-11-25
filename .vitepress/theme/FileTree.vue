<script setup lang="ts">
// A tiny tree that shows where a config file lives. Two fixed trees, picked by `kind`.
import { computed } from 'vue'
import DgIcon from './DgIcon.vue'

const props = defineProps<{ kind: 'project' | 'tenant' }>()

type Row = { d: number; n: string; i: 'folder' | 'doc' | 'box' | null; hot?: boolean; note: string }

const trees: Record<'project' | 'tenant', { rows: Row[]; cap: string }> = {
  project: {
    rows: [
      { d: 0, n: 'your-project/', i: 'folder', note: 'the workspace, under version control' },
      { d: 1, n: '.daggry/', i: 'folder', note: 'always protected' },
      { d: 2, n: 'project.yaml', i: 'doc', hot: true, note: 'the project config' },
      { d: 1, n: 'check.sh', i: 'doc', note: 'your validator script, protected because a validator runs it' },
      { d: 1, n: '…', i: null, note: 'the work: the files a run changes' },
    ],
    cap: 'Where the project config lives. The project is a workspace under version control. In it, the folder .daggry holds project.yaml, the project config, and Daggry always protects that folder. The validator script, here check.sh, lives in the project too, and Daggry protects it because a validator runs it. The other files are the work a run changes.',
  },
  tenant: {
    rows: [
      { d: 0, n: 'control plane', i: 'box', note: 'outside every runner' },
      { d: 1, n: 'tenant config', i: 'doc', hot: true, note: 'one YAML file; the cluster admin installs it' },
      { d: 0, n: 'factory-workflows/', i: 'folder', note: 'a workspace the tenant config names' },
      { d: 1, n: 'workflows/review.yaml', i: 'doc', note: 'a workflow you offer, at one exact version' },
      { d: 0, n: 'handbook/', i: 'folder', note: 'a project you serve' },
      { d: 1, n: '.daggry/project.yaml', i: 'doc', note: 'its project config, written by the project owner' },
    ],
    cap: 'Where each file of the example lives. The tenant config is one YAML file that the cluster admin installs in the control plane, outside every runner. It names a workspace, factory-workflows, that holds the workflow you offer, workflows/review.yaml, at one exact version. It also names handbook, a project you serve, which keeps its own project config in .daggry/project.yaml.',
  },
}
const tree = computed(() => trees[props.kind])
</script>

<template>
  <figure class="dgm tree">
    <div class="dg-body">
      <div class="rows" role="img" :aria-label="tree.cap">
        <div v-for="(r, i) in tree.rows" :key="i" class="row" :class="{ hot: r.hot }" :style="{ '--d': r.d }">
          <span class="lead"><i v-if="r.d" class="elbow" /><span class="name"><DgIcon v-if="r.i" :name="r.i" />{{ r.n }}</span></span>
          <span class="note">{{ r.note }}</span>
        </div>
      </div>
    </div>
    <figcaption class="cap">{{ tree.cap }}</figcaption>
  </figure>
</template>

<style scoped>
.rows { display: flex; flex-direction: column; gap: 4px; padding: 14px 16px; border-radius: 14px; background: var(--dg-code-bg); border: 1px solid var(--dg-surface-stroke); }
.row { display: flex; flex-wrap: wrap; align-items: baseline; gap: 2px 16px; min-width: 0; padding-left: max(0px, calc(var(--d) * 22px - 16px)); }
.lead { flex: none; max-width: 100%; display: inline-flex; align-items: center; gap: 6px; }
.name { min-width: 0; display: inline-flex; align-items: center; gap: 6px; font: 500 13px/1.7 var(--vp-font-family-mono); color: var(--dg-ink); overflow-wrap: anywhere; }
.name svg { width: 14px; height: 14px; color: var(--dg-edge); }
.elbow { flex: none; width: 10px; height: 10px; margin-top: -8px; border-left: 1.4px solid var(--dg-edge); border-bottom: 1.4px solid var(--dg-edge); border-bottom-left-radius: 4px; }
.note { flex: 1 1 200px; min-width: 0; font-size: 12.5px; line-height: 1.5; color: var(--dg-muted); overflow-wrap: anywhere; }
.row.hot .name { padding: 0 8px; border-radius: 8px; background: var(--dg-warm-fill); box-shadow: inset 0 0 0 1px var(--dg-warm-stroke); }
.row.hot .name svg { color: var(--dg-edge-hot); }
.row.hot .note { color: var(--dg-ink); }
@media (forced-colors: active) { .row.hot .name { box-shadow: inset 0 0 0 1px CanvasText; } }
</style>
