# Glossary

*Reference*

This page gives each term one definition and a link to the page that explains it. Read the first table if you are new: its terms cover the whole guide. Use the second table when a reference page uses a term you do not know.

## Words every page uses

The table lists the terms in the order you meet them: Daggry and its parts, workflows, checking, and the evidence trail.

| Term | Definition | Read more |
|---|---|---|
| Daggry | A factory kit: modules you set up as your own factory, where agents do the work and code checks it. | [What is Daggry?](/guide/) |
| factory | What you run with Daggry: it takes in work, puts agents on it and hands back checked results. | [What is Daggry?](/guide/) |
| module | One of Daggry's seven building blocks, each with one job: conductor, control plane, runner, engine, forge, store and validators. | [The modules and where they run](/guide/concepts/modules) |
| control plane | The module that holds the keys, checks results and writes the evidence trail. | [The modules and where they run](/guide/concepts/modules) |
| runner | The throwaway environment that runs one job. It never holds the signing key. | [The modules and where they run](/guide/concepts/modules) |
| engine | The coding-agent program a persona runs on. | [Tenant config](/reference/tenant-config#agents) |
| tenant | A team with its own factory: its own personas, settings and evidence trail. | [Tenant config](/reference/tenant-config) |
| project | A body of work with its own project config. | [Project config](/reference/project-config) |
| workspace | A project's versioned files, where a run works. For software, a git repository. | [Workspaces and work items](/reference/project-config#workspaces-and-work-items) |
| objective | What a run is asked to do: the text of an issue, a trigger's standing text or the text you give `daggry run`. Daggry seals it when the run starts, and every persona reads it. | [daggry/work-item@1](/reference/kinds#daggry-work-item-1) |
| work item | The sealed record of a run's objective and where it came from. For software, usually an issue. | [daggry/work-item@1](/reference/kinds#daggry-work-item-1) |
| tenant config | The document that says how a tenant's factory works: personas, workflows, shared validators, approval rules and projects. | [Tenant config](/reference/tenant-config) |
| project config | The file `.daggry/project.yaml`. It says what is true of one project: areas, validators, judges, personas of its own and protected paths. | [Project config](/reference/project-config) |
| workflow | A file that lists the steps of a piece of work, in order. | [Workflow file](/reference/workflow-schema) |
| run | One execution of a workflow for one work item. | [CLI](/reference/cli) |
| step | One unit of work in a workflow. Its kind is `agent`, `command`, `verify`, `human` or `effect`. | [Steps](/reference/workflow-schema#steps) |
| persona | A named agent your team defines once: an engine and the instructions it works under. It says who works and how. The objective says what to do. An `agent` step names one. | [personas](/reference/tenant-config#personas) |
| output | What a step hands in, such as a `plan` or a `change`. | [agent](/reference/workflow-schema#agent) |
| scope | The paths a step can write. | [Scope](/reference/workflow-schema#scope) |
| loop | Steps that repeat until a gate holds, up to a limit. With `over`, one iteration for each criterion. | [Loop](/reference/workflow-schema#loop) |
| gate | The expression in a loop's `until`. It reads sealed verdicts and decides whether the loop ends. | [Gate expressions](/reference/gates) |
| approval | The sealed record of an approver's yes, bound to the digest of what was approved. | [human](/reference/workflow-schema#human) |
| effect | The step that delivers the result, for example by opening a pull request. | [effect](/reference/workflow-schema#effect) |
| trigger | What starts a run without a command: a label or a type on an issue, a new pull request or a schedule. | [Triggers](/reference/tenant-config#triggers) |
| plan | The list of criteria an agent proposes and you approve. | [Artifact kinds](/reference/kinds#evidence-plan-1) |
| input | Something said in the thread of a run, sealed when it arrives: a comment, a review comment or a reviewer persona's finding. | [Comments and approvals](/reference/conversation) |
| checkpoint | A `human` step. A yes continues the run, and any other reply sends the run back to the step its `of` names. | [human](/reference/workflow-schema#human) |
| default team | The personas and the workflow Daggry ships: `planner`, `developer`, `reviewer` and `idea-to-pr`. | [The default team](/reference/tenant-config#the-default-team) |
| criterion | One entry of a plan, with an id. A loop repeats until every criterion is covered. | [Loop](/reference/workflow-schema#loop) |
| change | A set of differences a step made to the workspace, and the sealed record of it. | [Artifact kinds](/reference/kinds#daggry-change-1) |
| validator | A command you declare. It measures the work, and Daggry seals what it reports. | [Validators](/reference/validators) |
| main validator | The guide's name for the canonical validator: the one the name `project` stands for. | [verification](/reference/project-config#verification) |
| judge | Decides pass or fail from the evidence trail. Daggry seals its verdict. | [Judges](/reference/judges) |
| measurement | What a validator reported, sealed. | [Artifact kinds](/reference/kinds#evidence-measurement-1) |
| verdict | What a judge decided, sealed. | [Artifact kinds](/reference/kinds#evidence-verdict-1) |
| proof | A check the run writes that fails before the work and passes after it. | [Red then green](/reference/workflow-schema#red-then-green) |
| protected path | A path no step can change, whatever its scope. | [Protected paths](/reference/protected-paths) |
| frozen path | A proof file that no later step can change once it is sealed. | [Frozen paths](/reference/protected-paths#frozen-paths) |
| claim | What an agent says it did, before code has checked it. A claim is never evidence. | [Why you can trust a run](/guide/concepts/trust) |
| seal | To check a result with code, then sign it so that a later change shows. | [Why you can trust a run](/guide/concepts/trust) |
| record | One sealed result. | [Evidence envelope](/reference/envelope) |
| evidence | Sealed records, as opposed to claims. | [Why you can trust a run](/guide/concepts/trust) |
| evidence trail | Every record of a tenant, signed and linked in order. | [Why you can trust a run](/guide/concepts/trust) |
| digest | The SHA-256 hash that names a record by its content. | [Evidence envelope](/reference/envelope) |
| signing key | The key that signs records. It stays in the control plane. | [The modules and where they run](/guide/concepts/modules) |

## Reference terms

The table lists, in alphabetical order, the terms that only the reference pages use.

| Term | Definition | Read more |
|---|---|---|
| area | A named group of paths in a workspace. | [areas](/reference/project-config#areas) |
| artifact | The reference pages' word for a record: a sealed value with a kind. | [Evidence envelope](/reference/envelope) |
| approver | A person on the tenant's `approvers` list. Only an approver can start, steer and approve a run. | [Who Daggry listens to](/reference/conversation#who-daggry-listens-to) |
| attempt | One try of a job. A new runner that takes over starts a new one. | [HTTP API](/reference/api#states-and-reasons) |
| baseline | The version of the workspace a run starts from. The project config is read from it. | [Where it lives](/reference/project-config#where-it-lives) |
| baseline proof | The check that a proof fails on the baseline, which shows it says something about the work. | [Baseline proof](/reference/conformance#baseline-proof) |
| boundary check | The check of a step's change against the protected paths, the frozen paths and the scope. | [Enforcement](/reference/protected-paths#enforcement) |
| canonical validator | The validator a project names in `verification.canonical`. | [verification](/reference/project-config#verification) |
| clean copy | A fresh copy of the workspace at one sealed version, where no agent can write. Validators run on one. | [Validators](/reference/validators#a-validator-is-a-command) |
| conductor | The module that decides which step runs next and starts runners. It holds no key and seals nothing. | [The modules and where they run](/guide/concepts/modules) |
| envelope | The one JSON shape every record has. | [Evidence envelope](/reference/envelope) |
| extension key | A key of your own, written `<namespace>/<key>`. Daggry ignores it and keeps it. | [Extension keys](/reference/open-formats#extension-keys) |
| fact | A named value in a verdict that a gate can read. | [Facts a judge emits](/reference/judges#facts-a-judge-emits) |
| fact class | Whether a field is `claimed` (an agent wrote it), `derived` (code computed it) or `judged` (a rubric judge answered). | [Fact classes](/reference/gates#fact-classes) |
| finding | One thing a validator or a judge reports: an id, an outcome and a message. | [Result document](/reference/project-config#result-document) |
| forge | Where work comes from and where results go. For software, a git host. | [The modules and where they run](/guide/concepts/modules) |
| job | A group of steps that share one runner. A run is one job by default. | [HTTP API](/reference/api#states-and-reasons) |
| kind | The name and major version of a record's schema, such as `evidence/plan@1`. | [Artifact kinds](/reference/kinds) |
| link | The hash that ties a record to the one before it. The signature covers it. | [Chain link](/reference/envelope#chain-link) |
| meta | Values that code stamps on a record when it seals it, such as the run, the step and the persona. | [Stamped keys](/reference/envelope#stamped-keys) |
| metric | A named number a validator measured. | [Result document](/reference/project-config#result-document) |
| observation | A sealed record of something that happened: a delivery, a path put back or a failed step. | [Artifact kinds](/reference/kinds#daggry-observation-1) |
| outcome | `pass`, `fail` or `error`. A finding can also be `skip`. | [Result document](/reference/project-config#result-document) |
| output format | How Daggry reads a validator's output: `exit-code`, `document` or a tool format such as `junit`. | [Output formats](/reference/project-config#output-formats) |
| preview | A validator run on the agent's working copy for fast feedback. It is never evidence. | [Who runs a validator](/reference/project-config#who-runs-a-validator) |
| proof step | An `agent` step with `freeze`, in a loop. It runs once and writes the proofs for the plan's criteria. | [Red then green](/reference/workflow-schema#red-then-green) |
| result document | What a validator writes with `output: document`: an outcome, findings and metrics. | [Result document](/reference/project-config#result-document) |
| revision | The name of one version of a workspace. For software, a commit. | [Workspaces and work items](/reference/project-config#workspaces-and-work-items) |
| run lock | The first record of a run: what the run pinned, including the workflow, the personas, the validators and the judges. | [Artifact kinds](/reference/kinds#daggry-run-lock-1) |
| store | The module that keeps the evidence trail. | [The modules and where they run](/guide/concepts/modules) |
| threshold | A limit on a number a validator gives. A missed threshold fails the verdict. | [verification](/reference/project-config#verification) |
| unfreeze | A person's grant that opens one frozen path for one iteration. | [Unfreeze grant](/reference/protected-paths#unfreeze-grant) |
| verify step | The step where validators and judges run. It is not the `daggry verify` command, which checks the evidence trail. | [verify](/reference/workflow-schema#verify) |
