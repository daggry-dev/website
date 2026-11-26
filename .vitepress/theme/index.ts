import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import '@fontsource-variable/inter'
import '@fontsource/instrument-serif'
import '@fontsource/instrument-serif/400-italic.css'
import '@fontsource-variable/jetbrains-mono'
import './style.css'
import './diagram.css'
import '@fontsource-variable/outfit'
import './airy.css'
import Landing from './Landing.vue'
import Overnight from './Overnight.vue'
import Architecture from './Architecture.vue'
import Modules from './Modules.vue'
import ChainDiagram from './ChainDiagram.vue'
import WorkflowGraph from './WorkflowGraph.vue'
import Compare from './Compare.vue'
import MorningTrail from './MorningTrail.vue'
import HowItWorks from './HowItWorks.vue'
import SealFlow from './SealFlow.vue'
import CheckFlow from './CheckFlow.vue'
import ValidatorFlow from './ValidatorFlow.vue'
import LoopGate from './LoopGate.vue'
import HumanWait from './HumanWait.vue'
import Boundary from './Boundary.vue'
import Notice from './Notice.vue'
import Signup from './Signup.vue'
import KitDiagram from './KitDiagram.vue'
import ExampleGallery from './ExampleGallery.vue'
import FeatureGrid from './FeatureGrid.vue'
import ConfigFiles from './ConfigFiles.vue'
import FileTree from './FileTree.vue'
import SealedRecord from './SealedRecord.vue'
import ModelOverview from './ModelOverview.vue'
import WhereThingsLive from './WhereThingsLive.vue'
import WorkflowAnatomy from './WorkflowAnatomy.vue'
import StepTrail from './StepTrail.vue'
import Lookup from './Lookup.vue'
import Missions from './Missions.vue'
import PersonaReceives from './PersonaReceives.vue'
import LoopRounds from './LoopRounds.vue'
import BatchOrItems from './BatchOrItems.vue'
import IssueThread from './IssueThread.vue'
import TeamFlow from './TeamFlow.vue'
import TriggerRouting from './TriggerRouting.vue'
import AutonomyLevels from './AutonomyLevels.vue'
import RunStates from './RunStates.vue'
import CliFlow from './CliFlow.vue'
import PathMap from './PathMap.vue'
import GateRead from './GateRead.vue'
import JudgeKinds from './JudgeKinds.vue'
import KindMap from './KindMap.vue'
import ProjectConfigMap from './ProjectConfigMap.vue'
import TenantConfigMap from './TenantConfigMap.vue'
import VerifyFlow from './VerifyFlow.vue'

export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, { 'layout-top': () => h(Notice) }),
  enhanceApp({ app }) {
    app.component('Landing', Landing)
    app.component('Overnight', Overnight)
    app.component('Architecture', Architecture)
    app.component('Modules', Modules)
    app.component('ChainDiagram', ChainDiagram)
    app.component('WorkflowGraph', WorkflowGraph)
    app.component('Compare', Compare)
    app.component('MorningTrail', MorningTrail)
    app.component('HowItWorks', HowItWorks)
    app.component('SealFlow', SealFlow)
    app.component('CheckFlow', CheckFlow)
    app.component('ValidatorFlow', ValidatorFlow)
    app.component('LoopGate', LoopGate)
    app.component('HumanWait', HumanWait)
    app.component('Boundary', Boundary)
    app.component('Signup', Signup)
    app.component('KitDiagram', KitDiagram)
    app.component('ExampleGallery', ExampleGallery)
    app.component('FeatureGrid', FeatureGrid)
    app.component('ConfigFiles', ConfigFiles)
    app.component('FileTree', FileTree)
    app.component('SealedRecord', SealedRecord)
    app.component('ModelOverview', ModelOverview)
    app.component('WhereThingsLive', WhereThingsLive)
    app.component('WorkflowAnatomy', WorkflowAnatomy)
    app.component('StepTrail', StepTrail)
    app.component('Lookup', Lookup)
    app.component('Missions', Missions)
    app.component('PersonaReceives', PersonaReceives)
    app.component('LoopRounds', LoopRounds)
    app.component('BatchOrItems', BatchOrItems)
    app.component('IssueThread', IssueThread)
    app.component('TeamFlow', TeamFlow)
    app.component('TriggerRouting', TriggerRouting)
    app.component('AutonomyLevels', AutonomyLevels)
    app.component('RunStates', RunStates)
    app.component('CliFlow', CliFlow)
    app.component('PathMap', PathMap)
    app.component('GateRead', GateRead)
    app.component('JudgeKinds', JudgeKinds)
    app.component('KindMap', KindMap)
    app.component('ProjectConfigMap', ProjectConfigMap)
    app.component('TenantConfigMap', TenantConfigMap)
    app.component('VerifyFlow', VerifyFlow)
  },
} satisfies Theme
