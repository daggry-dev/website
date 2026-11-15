import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import '@fontsource-variable/inter'
import '@fontsource/instrument-serif'
import '@fontsource/instrument-serif/400-italic.css'
import '@fontsource-variable/jetbrains-mono'
import './style.css'
import './diagram.css'
import Landing from './Landing.vue'
import Overnight from './Overnight.vue'
import Architecture from './Architecture.vue'
import ChainDiagram from './ChainDiagram.vue'
import WorkflowGraph from './WorkflowGraph.vue'
import Compare from './Compare.vue'
import MorningTrail from './MorningTrail.vue'
import HowItWorks from './HowItWorks.vue'
import SealFlow from './SealFlow.vue'
import CheckFlow from './CheckFlow.vue'
import LoopGate from './LoopGate.vue'
import HumanWait from './HumanWait.vue'
import Boundary from './Boundary.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('Landing', Landing)
    app.component('Overnight', Overnight)
    app.component('Architecture', Architecture)
    app.component('ChainDiagram', ChainDiagram)
    app.component('WorkflowGraph', WorkflowGraph)
    app.component('Compare', Compare)
    app.component('MorningTrail', MorningTrail)
    app.component('HowItWorks', HowItWorks)
    app.component('SealFlow', SealFlow)
    app.component('CheckFlow', CheckFlow)
    app.component('LoopGate', LoopGate)
    app.component('HumanWait', HumanWait)
    app.component('Boundary', Boundary)
  },
} satisfies Theme
