# Tenant config

*Reference*

The tenant config is one YAML document that says how a tenant's factory works: which workflows it offers, how work is scheduled, which agents work and where a person must approve, which runners run the steps, which validators projects share, which projects it serves and which workflows run on each. Read this page to look up a key or the precedence rule, or if you write a tool that reads the document. For the steps, follow [Set up a tenant](/guide/how-to/set-up-a-tenant).

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
| Sections | `workflows`, `orchestration`, `agents`, `runners`, `validators`, `judges`, `projects`, `extensions` | Each is optional. Each appears at most once. |
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
| `workflows` | map | no | The catalogue, from a workflow name to its entry. The name is what a project entry uses to assign the workflow. Non-empty. See [projects](#projects). |
| `workflows.<name>.source.workspace` | string | yes | The workspace that holds the workflow file. Non-empty. The tenant chooses it. |
| `workflows.<name>.source.path` | string | yes | The path of the workflow file in that workspace. Non-empty. |
| `workflows.<name>.source.revision` | string | yes | The version of the workspace the file is read from, in the form the binding gives. Non-empty. |

A workflow is pinned to one version, so a catalogue entry names exactly one file content. The file itself follows the [Workflow file](/reference/workflow-schema). A run uses only a workflow from the catalogue.

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
| `agents.engines` | map | no | The registered engines, from an engine identifier to its entry. An `engine` value in a workflow must name one of them. |
| `agents.engines.<name>.credential.ref` | string | yes | The name of the stored secret the engine uses. Non-empty. |
| `agents.roster` | map | no | The named agents, from an agent's name to its entry. |
| `agents.roster.<name>.engine` | string | yes | The name of a registered engine. |
| `agents.roster.<name>.instructions` | string | no | The path of the agent's instruction file in the workflow's source workspace. |
| `agents.approval.require` | array of strings | no | The points where a run always waits for a person. Each is `plan` or `effect`. |

Two rules hold for this section:

- **A credential is a reference, never a value.** `credential.ref` names a secret that the control plane stores. The document has no key that takes a secret value.
- **Approval rules bind every workflow.** With `plan` in `agents.approval.require`, a workflow whose agent step delivers a `plan` must have a `human` step with `waiting_for: approval` before any later step. With `effect`, a `human` step must come before every `effect` step. A catalogue workflow that does not fit is refused.

### runners

The `runners` section holds the images that run steps, and the isolation class of each kind of runner. The table lists its keys.

| Key | Type | Required | Meaning |
|---|---|---|---|
| `runners.images` | map | no | The images the tenant offers, from an image name to its entry. A project entry uses the name in `projects.<workspace>.image`. |
| `runners.images.<name>.image` | string | yes | The image reference, by digest. |
| `runners.images.<name>.tools` | array of labels | no | The tools the image holds, by the labels a project config uses in `needs.tools`. |
| `runners.images.<name>.default` | boolean | no | `true` on at most one image: the one a workspace gets when its project entry names none. |
| `runners.classes` | map | no | The isolation classes, from a class name to its entry. A validator you define asks for a class by this name in `needs.runner`. |
| `runners.classes.<name>.module` | string | yes | `deterministic-runner` or `agent-runner`: the kind of step execution the class applies to. |
| `runners.classes.<name>.network` | string | yes | `none` or `open`: whether a pod of the class reaches the network. |
| `runners.classes.<name>.model_credential` | boolean | yes | Whether a pod of the class holds an engine's credential. `false` is required for `deterministic-runner`. |

The deterministic runner runs what a person wrote into the workflow, the project or the tenant, and never holds a model credential. The agent runner runs an agent engine and whatever that engine generates. No class gives a pod the signing key.

### validators

The `validators` section holds validators that projects share, each pinned to a repository revision. They count as evidence because the tenant config is held outside every run. See [Validators](/reference/validators). The table lists the keys.

| Key | Type | Required | Meaning |
|---|---|---|---|
| `validators.scripts` | map | no | The tenant's validators you define, from a validator name to a declaration. A workflow refers to one by its bare name. A project validator of the same name wins. See [Referring to a validator](/reference/validators#referring-to-a-validator). |
| `validators.scripts.<name>.source.workspace` | string | yes | The workspace that holds the script. Non-empty. |
| `validators.scripts.<name>.source.revision` | string | yes | The version of that workspace the script is read from. Non-empty. |
| `validators.scripts.<name>.run` | command | yes | What runs, with paths relative to the root of the source. See [Commands](/reference/project-config#commands). |
| `validators.scripts.<name>.role` | label | no | What the validator looks at. Default `custom`. |
| `validators.scripts.<name>.output`, `output_file`, `timeout`, `env`, `needs` | | no | The same keys as a project's validator you define. See [validators](/reference/project-config#validators). |

These rules apply to the section.

- **A tenant's validator you define runs on the project's workspace.** It runs in the deterministic runner, on a clean copy of the sealed version, with the files of its source beside it and read-only.
- **A name cannot be `project`, `daggry`, `coverage`, `no_regression` and `baseline_proof`.** They are reserved.

### judges

The `judges` section holds custom judges that projects share, each pinned to a repository revision. They count as evidence because the tenant config is held outside every run. See [Judges](/reference/judges). The table lists the keys.

| Key | Type | Required | Meaning |
|---|---|---|---|
| `judges.scripts` | map | no | The tenant's custom judges, from a judge name to a declaration. A `verify` step refers to one by its bare name. A project judge of the same name wins. |
| `judges.scripts.<name>.source.workspace` | string | yes | The workspace that holds the script. Non-empty. |
| `judges.scripts.<name>.source.revision` | string | yes | The version of that workspace the script is read from. Non-empty. |
| `judges.scripts.<name>.run` | command | yes | What runs, with paths relative to the root of the source. See [Commands](/reference/project-config#commands). |
| `judges.scripts.<name>.timeout` | integer | no | 1 or more. The longest the judge can run, in seconds. |

The names in [Referring to a validator](/reference/validators#referring-to-a-validator) are reserved. A tenant has no rubric judge: rubric judges are declared in the project config.

### projects

The `projects` section lists the workspaces the factory works on and what the tenant decided for each. A workflow is assigned to a workspace here. The table lists the keys of a project entry.

| Key | Type | Required | Meaning |
|---|---|---|---|
| `projects` | map | no | The workspaces, from a workspace, named in the form its binding gives, to its entry. |
| `projects.<workspace>.binding` | label | no | The name of a binding from `extensions.bindings`. It says what the workspace is and how its versions, work items and changes are named. Absent is valid when the tenant registers exactly one binding. |
| `projects.<workspace>.workflows.allowed` | array of strings | no | Names from the catalogue that can run on this workspace. Absent means the whole catalogue. |
| `projects.<workspace>.workflows.default` | string | no | The workflow a run uses when it names none. One of the allowed names. |
| `projects.<workspace>.agents.engines` | array of strings | no | Names from `agents.engines` that can work on this workspace. Absent means every registered engine. |
| `projects.<workspace>.agents.roster` | array of strings | no | Names from `agents.roster` that can work on this workspace. Absent means the whole roster. |
| `projects.<workspace>.agents.approval.require` | array of strings | no | Points where a run on this workspace always waits for a person, added to `agents.approval.require`. Each is `plan` or `effect`. |
| `projects.<workspace>.trust_project` | boolean | no | Default `true`: the validators and judges of the project config count as evidence. `false`: only validators and judges that the tenant config declares count. |
| `projects.<workspace>.areas` | array of area names | no | Names of areas that the workspace's project config defines in [`areas`](/reference/project-config#areas). At least one name, none twice. Together they are the scope of every run on this workspace: a run changes paths inside those areas only. Absent means the tenant sets no scope for runs on the workspace. |
| `projects.<workspace>.image` | string | no | The name of a runner image from `runners.images`. Absent means the default image. |

These rules apply to a project entry.

- **A run starts only for a listed workspace.**
- **The tenant assigns, the project does not.** A run on a workspace uses a workflow from `workflows.allowed`. The workspace's own [Project config](/reference/project-config) has no key that names a workflow, an engine or an approval rule.
- **A project's validators and judges count by default.** Set `trust_project: false` for a locked-down workspace. A run on it that names a project's validator, a project's judge, or `project`, is refused when it starts, and the validator still runs as a preview when the project exposes it. See [When a validator counts as evidence](/reference/validators#when-a-validator-counts-as-evidence).
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
| `extensions.bindings` | map | no | The bindings the tenant uses, from a name (a label) to its entry, which holds a `version`. |
| `extensions.adapters` | map | no | The readers for tool output formats. They read a tool's own output into a result document, from the plain format name, such as `junit`, to its entry, which holds a `version`. A validator's `output` names one. |
| `extensions.effects` | map | no | The effects an `effect` step can name in `do`, from a name, bare or `<namespace>/<name>`, to its entry, which holds a `version`. |
| `extensions.step_kinds` | map | no | Step kinds besides the five of the standard, from a name, `<namespace>/<name>`, to its entry. See [Extensibility](/reference/workflow-schema#extensibility). |
| `extensions.step_kinds.<name>.module` | string | yes | What runs the step: `deterministic-runner`, `agent-runner` or `control-plane`. |
| `extensions.step_kinds.<name>.schema` | string | yes | The URL of the JSON Schema for the step's keys. |
| `extensions.artifact_kinds` | map | no | Artifact kinds besides the eight in [Artifact kinds](/reference/kinds), from a name, `<namespace>/<name>@<major>`, in a namespace other than `evidence` and `daggry`, to its entry. |
| `extensions.artifact_kinds.<name>.schema` | string | yes | The URL of the JSON Schema for the kind's `body`. |

This section is the registry. A binding, an output format, an effect, a step kind or an artifact kind that is neither part of the standard nor listed here is refused. Validators have a section of their own: see [validators](#validators).

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
| Tenant config | Every limit: the catalogue, the engines, the images, the approval points and the orchestration limits. Which workflows, agents, approval points and areas apply to each workspace, and whether a project's own validators count. | - |
| [Project config](/reference/project-config) | What is true of one workspace: its areas, its validators, its canonical validator and the paths it protects. | Choose a workflow, an engine, an approval rule or the scope of a run. Widen a tenant rule. |
| [Workflow](/reference/workflow-schema) | Narrower rules for one step: its scope inside the scope of the run, and the validators a `verify` step names. | Widen a project or tenant rule. |

A project or a workflow can add limits. A project can protect more paths, and a workflow can give a step a smaller scope inside the scope of the run. The scope of a run is the tenant's choice among the areas the project defines.

Only a person widens a rule. An agent, a workflow and an extension key narrow or add, and never widen. The table says who can widen each rule.

| To widen | Who decides | How |
|---|---|---|
| A limit in the tenant config | The tenant admin | By changing the tenant config. |
| A limit in the project config | The project owner, inside what the tenant allows | By an accepted change to the project config. It applies from the next run. |
| A rule inside one run | A person, by a grant | By an approval that is sealed as evidence and opens one thing once, such as [unfreeze](/reference/protected-paths#unfreeze-grant). |

An agent is never in that table. The control plane holds the tenant config outside every runner, and a run reads the project config from the baseline, so an edit by a step changes nothing for the run. Every run records the configuration it started under, and a later change applies to new runs only.

### Worked example

This tenant offers two workflows, runs at most four attempts at once, registers one engine and two agents, requires a person before work builds on a plan, and serves two workspaces under two bindings. It defines one validator of its own for every project. For the first workspace only tenant validators count as evidence. The second workspace uses its project's validators, requires a person before any effect and sets the scope of every run to one area.

```yaml
format: daggry/tenant@1

workflows:
  delivery:
    source:
      workspace: factory-workflows
      path: workflows/delivery.yaml
      revision: v-0017
  translate:
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
    <engine>:
      credential:
        ref: model-credential
  roster:
    lead:
      engine: <engine>
      instructions: agents/lead.md
    reviewer:
      engine: <engine>
      instructions: agents/reviewer.md
  approval:
    require: [plan]

runners:
  images:
    documents:
      image: registry.example/jobs/documents@sha256:<digest>
      tools: [pandoc-3]
      default: true
    programs:
      image: registry.example/jobs/programs@sha256:<digest>
      tools: [node-22]
  classes:
    checks:
      module: deterministic-runner
      network: none
      model_credential: false
    networked:
      module: deterministic-runner
      network: open
      model_credential: false
    agents:
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
      output: document
      timeout: 120

projects:
  handbook:
    binding: review
    workflows:
      allowed: [delivery, translate]
      default: delivery
    trust_project: false
    image: documents
  example/shop-web:
    binding: software
    workflows:
      allowed: [delivery]
      default: delivery
    agents:
      roster: [lead]
      approval:
        require: [effect]
    areas: [app]
    image: programs

extensions:
  bindings:
    review:
      version: "1.0.0"
    software:
      version: "1.0.0"
  adapters:
    citations:
      version: "1.0.0"
    junit:
      version: "1.0.0"
  effects:
    publish:
      version: "1.0.0"
    open-pr:
      version: "1.0.0"
  step_kinds:
    acme/scan:
      module: deterministic-runner
      schema: https://acme.example/schemas/scan-step-v1.json
  artifact_kinds:
    acme/scan-report@1:
      schema: https://acme.example/schemas/scan-report-v1.json

acme/billing:
  cost_centre: platform
```

The table explains the values.

| Value | Meaning |
|---|---|
| `<engine>` | The identifier of an agent engine your installation provides. |
| `v-0017`, `v-0009` | Version ids in the form the workspace's binding gives. |
| `licence-terms` | How a workflow refers to the tenant's validator you define. |
| `trust_project: false` | On `handbook`, only validators and judges the tenant config declares count as evidence. Its workflows name tenant validators such as `licence-terms`. |
| `networked` | A class of deterministic runner that reaches the network. A validator you define asks for it in `needs.runner`. |
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
| An `agents.engines` entry with `credential: {value: ...}` | Unknown key. A credential is given by `ref` only. |
| A roster entry whose `engine` is not in `agents.engines` | Unknown engine. |
| A class with `module: deterministic-runner` and `model_credential: true` | A deterministic runner never holds a model credential. |
| An `extensions.artifact_kinds` entry named `evidence/scan@1` | The `evidence` namespace takes no added kinds. |
| `validators.scripts` with an entry that has no `source` | Missing `source`. |
| A project entry with `trust_project: no` | Not a boolean. |
| `validators.scripts` with an entry named `project` | Reserved name. |
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
- For the two kinds of validator, see [Validators](/reference/validators).
- For the workflow file a catalogue entry points to, see [Workflow file](/reference/workflow-schema).
- For what another factory implements to use the same documents, see [Conformance](/reference/conformance).
