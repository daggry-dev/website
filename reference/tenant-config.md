# Tenant config

*Reference*

For the idea, read [The tenant defines the factory](/guide/concepts/tenant) and [Where it runs](/guide/concepts/architecture).

The tenant config is one YAML document that says how a tenant's factory works: which workflows it offers, how work is orchestrated, which agents work and with what autonomy, which runners run the steps, which validators count as evidence, which workspaces it serves and which workflows run on each workspace. This page defines the standard layout and the precedence rule. It is for people who run a tenant and for people who write a reader of the document.

The format is open. It follows the same layout rules as the [Project config](/reference/project-config): a `format` header, named sections and namespaced extension keys.

The documents on this page are illustrative. In examples, `<engine>` stands for the identifier of an agent engine your installation provides.

## Download

The tenant config has a published JSON Schema (draft 2020-12). The table links the file.

| Schema | File |
|---|---|
| `daggry/tenant@1` | [daggry-tenant-v1.json](/schemas/daggry-tenant-v1.json) |

## The standard

### Layout

A tenant config has three parts.

| Part | Keys | Rule |
|---|---|---|
| Header | `format` | Required. Names the standard and its major version. |
| Sections | `workflows`, `orchestration`, `agents`, `runners`, `validators`, `projects`, `extensions` | Each is optional. Each appears at most once. |
| Extension keys | `<namespace>/<key>` | Any number. The rules are in [Extension keys](/reference/project-config#extension-keys). |

Every object is closed: a key that is not listed on this page and is not an extension key is refused. The document uses the strict [YAML subset](/reference/workflow-schema#yaml-subset).

### Header

The header has one key.

| Key | Type | Required | Meaning |
|---|---|---|---|
| `format` | string | yes | Always `daggry/tenant@1`. |

A reader refuses a missing `format`, a malformed one and a major version it does not know.

### workflows

The `workflows` section is the catalogue: the workflows the tenant offers, and where each one comes from. The table lists its keys.

| Key | Type | Required | Meaning |
|---|---|---|---|
| `workflows` | array of objects | no | The catalogue. Names are unique. |
| `workflows[].name` | string | yes | The name a project entry uses to assign the workflow. Non-empty. See [projects](#projects). |
| `workflows[].source.workspace` | string | yes | The workspace that holds the workflow file. Non-empty. The tenant chooses it. |
| `workflows[].source.path` | string | yes | The path of the workflow file in that workspace. Non-empty. |
| `workflows[].source.revision` | string | yes | The version of the workspace the file is read from, in the form the binding gives. Non-empty. |

A workflow is pinned to one version, so a catalogue entry names exactly one file content. The file itself follows the [Workflow schema](/reference/workflow-schema). A run uses only a workflow from the catalogue.

The source can be a workspace of workflows, or the workspace the work is done on. In both cases the tenant names it here, and the workspace itself assigns nothing.

### orchestration

The `orchestration` section holds the rules the conductor follows when it gives work to runners. The table lists its keys.

| Key | Type | Required | Meaning |
|---|---|---|---|
| `orchestration.concurrency_cap` | integer | no | 1 or more. The most attempts that run at one time for this tenant. |
| `orchestration.lease_seconds` | integer | no | 1 or more. The length of a job lease. |
| `orchestration.attempts.max` | integer | no | 1 or more. The most attempts one job can have. A job that needs one more fails the run. |
| `orchestration.retry.backoff_seconds` | integer | no | 0 or more. The wait before a new attempt starts after a lapsed lease. |
| `orchestration.parking.max_seconds` | integer | no | 1 or more. The longest a run stays `parked` before it fails. |

A run is `parked` when a limit is reached and the work waits for it to reset. For the states, see [HTTP API](/reference/api#states-and-reasons).

### agents

The `agents` section says which engines and agents work for the tenant, and when a person must decide. The table lists its keys.

| Key | Type | Required | Meaning |
|---|---|---|---|
| `agents.engines` | array of objects | no | The registered engines. An `engine` value in a workflow must name one of them. |
| `agents.engines[].name` | string | yes | The engine identifier. Non-empty. Unique. |
| `agents.engines[].credential.ref` | string | yes | The name of the stored secret the engine uses. Non-empty. |
| `agents.roster` | array of objects | no | The named agents. |
| `agents.roster[].name` | string | yes | The agent's name. Non-empty. Unique. |
| `agents.roster[].engine` | string | yes | The name of a registered engine. |
| `agents.roster[].instructions` | string | no | The path of the agent's instruction file in the workflow's source workspace. |
| `agents.approval.require` | array of strings | no | The points where a run always waits for a person. Each is `plan` or `effect`. |

Two rules hold for this section:

- **A credential is a reference, never a value.** `credential.ref` names a secret that the control plane stores. The document has no key that takes a secret value.
- **Approval rules bind every workflow.** With `plan` in `agents.approval.require`, a workflow whose agent step delivers a `plan` must have a `human` step with `waiting_for: approval` before any later step. With `effect`, a `human` step must come before every `effect` step. A catalogue workflow that does not fit is refused.

### runners

The `runners` section holds the images that run steps, and the isolation class of each kind of runner. The table lists its keys.

| Key | Type | Required | Meaning |
|---|---|---|---|
| `runners.images` | array of objects | no | The images the tenant offers. |
| `runners.images[].name` | string | yes | The name a project entry uses in `projects[].image`. Non-empty. Unique. |
| `runners.images[].image` | string | yes | The image reference, by digest. |
| `runners.images[].tools` | array of labels | no | The tools the image holds, by the labels a project config uses in `needs.tools`. |
| `runners.images[].default` | boolean | no | `true` on at most one image: the one a workspace gets when its project entry names none. |
| `runners.classes` | array of objects | no | The isolation classes. |
| `runners.classes[].name` | string | yes | The class name. Non-empty. Unique. A script validator asks for a class by this name in `needs.runner`. |
| `runners.classes[].module` | string | yes | `deterministic-runner` or `agent-runner`: the kind of step execution the class applies to. |
| `runners.classes[].network` | string | yes | `none` or `open`: whether a pod of the class reaches the network. |
| `runners.classes[].model_credential` | boolean | yes | Whether a pod of the class holds an engine's credential. `false` is required for `deterministic-runner`. |

The deterministic runner runs what a person wrote into the workflow, the project or the tenant, and never holds a model credential. The agent runner runs an agent engine and whatever that engine generates. No class gives a pod the signing key.

### validators

The `validators` section says which validators count as evidence for this tenant, beyond the built-in ones. The validator contract and the three sources are defined in [Validators](/reference/validators). The table lists the keys.

| Key | Type | Required | Meaning |
|---|---|---|---|
| `validators.scripts` | map | no | The tenant's script validators, from a validator name to a declaration. A workflow refers to one as `tenant/<name>`. |
| `validators.scripts.<name>.source.workspace` | string | yes | The workspace that holds the script. Non-empty. |
| `validators.scripts.<name>.source.revision` | string | yes | The version of that workspace the script is read from. Non-empty. |
| `validators.scripts.<name>.run` | command | yes | What runs, with paths relative to the root of the source. See [Commands](/reference/project-config#commands). |
| `validators.scripts.<name>.kind` | label | yes | What the validator looks at. |
| `validators.scripts.<name>.result`, `timeout`, `env`, `needs` | | no | The same keys as a project's script validator. See [validators](/reference/project-config#validators). |
| `validators.native` | array of objects | no | The native validators the tenant admits. |
| `validators.native[].name` | string | yes | `<namespace>/<name>`, in a namespace other than `daggry`, `tenant` and `project`. A workflow refers to it by this name. |
| `validators.native[].version` | string | yes | The exact version admitted. Non-empty. |
| `validators.native[].digest` | string | yes | The SHA-256 of the validator as installed: 64 lowercase hex digits. |

These rules apply to the section.

- **A tenant's script validator runs on the project's workspace.** It runs in the deterministic runner, on a clean copy of the sealed version, with the files of its source beside it and read-only.
- **A native validator is admitted, not installed, here.** The cluster admin installs it with the factory. The tenant admits it by name, version and digest, and one whose digest differs is refused.
- **A project's own validators are admitted for each workspace.** See `projects[].validators.admit` in [projects](#projects).

### projects

The `projects` section lists the workspaces the tenant's factory works on, and what the tenant decided for each one. This section is where a workflow is assigned to a workspace. The table lists the keys of a project entry.

| Key | Type | Required | Meaning |
|---|---|---|---|
| `projects` | array of objects | no | The workspaces. |
| `projects[].workspace` | string | yes | The workspace, named in the form its binding gives. Non-empty. Unique. |
| `projects[].binding` | label | no | The name of a binding from `extensions.bindings`. It says what the workspace is and how its versions, work items and changes are named. Absent is valid when the tenant registers exactly one binding. |
| `projects[].workflows.allowed` | array of strings | no | Names from the catalogue that can run on this workspace. Absent means the whole catalogue. |
| `projects[].workflows.default` | string | no | The workflow a run uses when it names none. One of the allowed names. |
| `projects[].agents.engines` | array of strings | no | Names from `agents.engines` that can work on this workspace. Absent means every registered engine. |
| `projects[].agents.roster` | array of strings | no | Names from `agents.roster` that can work on this workspace. Absent means the whole roster. |
| `projects[].approval.require` | array of strings | no | Points where a run on this workspace always waits for a person, added to `agents.approval.require`. Each is `plan` or `effect`. |
| `projects[].validators.admit` | string or array of names | no | Which of the project's own script validators count as evidence: `all`, `none`, or a list of validator names, none twice. Absent means `none`. |
| `projects[].areas` | array of area names | no | Names of areas that the workspace's project config defines in [`areas`](/reference/project-config#areas). At least one name, none twice. Together they are the scope of every run on this workspace: a run changes paths inside those areas only. Absent means the tenant sets no scope for runs on the workspace. |
| `projects[].image` | string | no | The name of a runner image from `runners.images`. Absent means the default image. |

These rules apply to a project entry.

- **A run starts only for a listed workspace.**
- **The tenant assigns, the project does not.** A run on a workspace uses a workflow from `workflows.allowed`. The workspace's own [Project config](/reference/project-config) has no key that names a workflow, an engine or an approval rule.
- **The tenant decides which project scripts are evidence.** A `verify` step runs a project's validator only when `validators.admit` admits it, and a run that names one it does not admit is refused when it starts. A validator the tenant has not admitted still runs as a preview for the agent when the project exposes it. See [Admission](/reference/project-config#admission).
- **A project entry narrows the tenant's own lists.** A name that the catalogue, the engines, the roster, the images or the bindings lack is refused.
- **Approval rules only add.** A project entry can require one more approval point than the tenant-wide rule. It cannot remove one.
- **A workflow must fit the workspace.** A workflow whose `verify` step names `project` runs only on a workspace whose project config names a canonical validator. A run that does not fit is refused when it starts.
- **An area must exist.** The names in `areas` are looked up in the project config of the baseline when a run starts. A run on a workspace whose project config lacks one of the names is refused. A run request can name areas from the list to narrow the scope of that run, and a name outside the list refuses the run. See [The scope of a run](/reference/protected-paths#the-scope-of-a-run).
- **An image must hold what the validators need.** When a validator that a run uses names a tool in `needs.tools` that the workspace's image does not list, or a runner class in `needs.runner` that `runners.classes` lacks, the run is refused when it starts.

What is true of the workspace itself, such as its areas, its validators and the paths it protects, is in its project config. The project config defines the areas, and this section chooses among them.

### extensions

The `extensions` section holds what the tenant registers beyond the standard. A binding brings most of these entries. See [Bindings](/reference/bindings). The table lists the keys.

| Key | Type | Required | Meaning |
|---|---|---|---|
| `extensions.bindings` | array of objects | no | The bindings the tenant uses. Each has a `name` (a label) and a `version`. |
| `extensions.adapters` | array of objects | no | The adapters that read a tool's own output into a result document. Each has a `name`, `<namespace>/<adapter>`, and a `version`. A `result.contract` names one. |
| `extensions.effects` | array of objects | no | The effects an `effect` step can name in `do`. Each has a `name`, bare or `<namespace>/<name>`, and a `version`. |
| `extensions.step_kinds` | array of objects | no | Step kinds besides the five of the standard. |
| `extensions.step_kinds[].kind` | string | yes | `<namespace>/<name>`. See [Extensibility](/reference/workflow-schema#extensibility). |
| `extensions.step_kinds[].module` | string | yes | What runs the step: `deterministic-runner`, `agent-runner` or `control-plane`. |
| `extensions.step_kinds[].schema` | string | yes | The URL of the JSON Schema for the step's keys. |
| `extensions.artifact_kinds` | array of objects | no | Artifact kinds besides the eight in [Kinds and schemas](/reference/kinds). |
| `extensions.artifact_kinds[].kind` | string | yes | `<namespace>/<name>@<major>`, in a namespace other than `evidence` and `daggry`. |
| `extensions.artifact_kinds[].schema` | string | yes | The URL of the JSON Schema for the kind's `body`. |

This section is the registry. A binding, an adapter, an effect, a step kind or an artifact kind that is neither part of the standard nor listed here is refused. Validators have a section of their own: see [validators](#validators).

### Where it lives

The table says where the document is held and who changes it.

| Rule | Detail |
|---|---|
| Held by | The control plane, outside every pod and every workspace. |
| Changed by | A person. No run, no step and no agent writes it. |

### Precedence

Three documents set rules for a run. The order is tenant, then project, then workflow: the tenant's rule wins over the project's, and the project's wins over the workflow's. The table lists what each document sets.

| Document | Sets | Cannot |
|---|---|---|
| Tenant config | Every limit: the catalogue, the engines, the images, the approval points and the orchestration limits. Which workflows, agents, approval points, areas and admitted validators apply to each workspace. | - |
| [Project config](/reference/project-config) | What is true of one workspace: its areas, its validators, its canonical validator and the paths it protects. | Choose a workflow, an engine, an approval rule or the scope of a run. Admit its own validators. Widen a tenant rule. |
| [Workflow](/reference/workflow-schema) | Narrower rules for one step: its scope inside the scope of the run, and the validators a `verify` step names. | Name a validator the tenant has not admitted. Widen a project or tenant rule. |

Only a person widens a rule: by changing the tenant config, by accepting a change to the project config, or by a grant such as [unfreeze](/reference/protected-paths#unfreeze-grant). An agent, a workflow and an extension key narrow or add, and never widen.

### Worked example

This tenant offers two workflows, runs at most four attempts at once, registers one engine and two agents, requires a person before work builds on a plan, and serves two workspaces under two bindings. It defines one script validator of its own and admits one native validator. For the first workspace it admits every validator the project declares. For the second it admits three by name, requires a person before any effect and sets the scope of every run to one area.

```yaml
format: daggry/tenant@1

workflows:
  - name: delivery
    source:
      workspace: factory-workflows
      path: workflows/delivery.yaml
      revision: v-0017
  - name: translate
    source:
      workspace: factory-workflows
      path: workflows/translate.yaml
      revision: v-0017

orchestration:
  concurrency_cap: 4
  lease_seconds: 60
  attempts:
    max: 3
  retry:
    backoff_seconds: 30
  parking:
    max_seconds: 21600

agents:
  engines:
    - name: <engine>
      credential:
        ref: model-credential
  roster:
    - name: lead
      engine: <engine>
      instructions: agents/lead.md
    - name: reviewer
      engine: <engine>
      instructions: agents/reviewer.md
  approval:
    require: [plan]

runners:
  images:
    - name: documents
      image: registry.example/jobs/documents@sha256:<digest>
      tools: [pandoc-3]
      default: true
    - name: programs
      image: registry.example/jobs/programs@sha256:<digest>
      tools: [node-22]
  classes:
    - name: checks
      module: deterministic-runner
      network: none
      model_credential: false
    - name: networked
      module: deterministic-runner
      network: open
      model_credential: false
    - name: agents
      module: agent-runner
      network: open
      model_credential: true

validators:
  scripts:
    licence-terms:
      source:
        workspace: factory-validators
        revision: v-0009
      run: [sh, licence/check.sh]
      kind: custom
      result:
        contract: document
      timeout: 120
  native:
    - name: acme/contract-clauses
      version: "1.2.0"
      digest: 3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855e

projects:
  - workspace: handbook
    binding: review
    workflows:
      allowed: [delivery, translate]
      default: delivery
    validators:
      admit: all
    image: documents
  - workspace: example/shop-web
    binding: software
    workflows:
      allowed: [delivery]
      default: delivery
    agents:
      roster: [lead]
    approval:
      require: [effect]
    validators:
      admit: [test, lint, types]
    areas: [app]
    image: programs

extensions:
  bindings:
    - name: review
      version: "1.0.0"
    - name: software
      version: "1.0.0"
  adapters:
    - name: review/citations
      version: "1.0.0"
    - name: software/junit
      version: "1.0.0"
  effects:
    - name: publish
      version: "1.0.0"
    - name: open-pr
      version: "1.0.0"
  step_kinds:
    - kind: acme/scan
      module: deterministic-runner
      schema: https://acme.example/schemas/scan-step-v1.json
  artifact_kinds:
    - kind: acme/scan-report@1
      schema: https://acme.example/schemas/scan-report-v1.json

acme/billing:
  cost_centre: platform
```

The table explains the values.

| Value | Meaning |
|---|---|
| `<engine>` | The identifier of an agent engine your installation provides. |
| `v-0017`, `v-0009` | Version ids in the form the workspace's binding gives. |
| `tenant/licence-terms` | How a workflow refers to the tenant's script validator. |
| `admit: [test, lint, types]` | The validators of `example/shop-web` that count as evidence, by name. The reference `project` needs all three: the canonical validator and the two in `also`. |
| `networked` | A class of deterministic runner that reaches the network. A script validator asks for it in `needs.runner`. |
| `<digest>` | The 64-digit digest of the image. |
| `model-credential` | The name of a stored secret. The document never holds the secret. |
| `app` | The name of an area that the project config of `example/shop-web` defines. A run on that workspace changes paths inside `app` only. |

### Examples a reader refuses

A reader refuses each input in the table.

| Input | Refusal |
|---|---|
| No `format` key | Missing `format`. |
| `format: daggry/tenant@2` | Unknown major. |
| `orchestration:` with `concurrency_cap: 0` | Below the minimum of 1. |
| `agents.engines[]` with `credential: {value: ...}` | Unknown key. A credential is given by `ref` only. |
| A roster entry whose `engine` is not in `agents.engines` | Unknown engine. |
| A class with `module: deterministic-runner` and `model_credential: true` | A deterministic runner never holds a model credential. |
| `extensions.artifact_kinds[]` with `kind: evidence/scan@1` | The `evidence` namespace takes no added kinds. |
| `validators.native[]` with `name: daggry/extra` | The `daggry` namespace holds the built-in validators only. |
| `validators.native[]` with no `digest` | Missing `digest`. A native validator is admitted by name, version and digest. |
| `validators.scripts` with an entry that has no `source` | Missing `source`. |
| A project entry with `validators: {admit: some}` | Not `all`, `none` or a list of names. |
| A project entry whose `binding` is not in `extensions.bindings` | Unknown binding. |
| A project entry whose `workflows.allowed` names a workflow the catalogue lacks | Unknown workflow. |
| A project entry whose `workflows.default` is not an allowed name | The default is not allowed on the workspace. |
| A project entry whose `image` is not in `runners.images` | Unknown image. |
| A project entry with `areas: []` | An entry names at least one area. |
| A project entry with `areas: ["src/**"]` | Not an area name. A path group is defined in the project config and named here. |
| `retries: 3` at the top level | Unknown key without a namespace. |

## Next steps

The list names the pages to read next.

- For what a workspace says about itself, see [Project config](/reference/project-config).
- For the validator contract and the three sources of a validator, see [Validators](/reference/validators).
- For the workflow file a catalogue entry points to, see [Workflow schema](/reference/workflow-schema).
- For what another factory implements to use the same documents, see [Conformance](/reference/conformance).
