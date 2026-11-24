# Tenant config

*Reference*

Proposed standard; see the [Roadmap](/roadmap) for status.

For the idea, read [The tenant defines the factory](/guide/concepts/tenant) and [Where it runs](/guide/concepts/architecture).

The tenant config is one YAML document that says how a tenant's factory works: which workflows it offers, how work is orchestrated, which agents work and with what autonomy, which runners run the steps and which repositories it serves. This page defines the standard layout and the precedence rule. It is for people who run a tenant and for people who write a reader of the document.

The format is open. It follows the same layout rules as the [Project config](/reference/project-config): a `format` header, named sections and namespaced extension keys.

The documents on this page are illustrative. In examples, `<engine>` stands for the identifier of a coding-agent engine your installation provides.

## Download

The tenant config has a published JSON Schema (draft 2020-12).

| Schema | File |
|---|---|
| `daggry/tenant@1` | [daggry-tenant-v1.json](/schemas/daggry-tenant-v1.json) |

## Today

Today the settings of this kind are chart values. The cluster admin sets them once for the whole installation, not for one tenant. See [Deploy Daggry](/guide/how-to/deploy).

| Chart value | Default | Meaning | Section of the standard |
|---|---|---|---|
| `leaseSeconds` | `60` | Length of a job lease. | `orchestration.lease_seconds` |
| `concurrencyCap` | `1` | Global cap on concurrent attempts. | `orchestration.concurrency_cap` |
| `images.job` | placeholder | Default image for every job, by digest. | `runners.images` |
| `modelSecret` | a Secret name | Secret that holds the model credential. | `agents.engines[].credential` |

A workflow reaches the control plane as a file given to `daggry run`. See [CLI](/reference/cli). The roster of agents is on the [Roadmap](/roadmap).

## The standard

### Layout

A tenant config has three parts.

| Part | Keys | Rule |
|---|---|---|
| Header | `format` | Required. Names the standard and its major version. |
| Sections | `workflows`, `orchestration`, `agents`, `runners`, `projects`, `extensions` | Each is optional. Each appears at most once. |
| Extension keys | `<namespace>/<key>` | Any number. The rules are in [Extension keys](/reference/project-config#extension-keys). |

Every object is closed: a key that is not listed on this page and is not an extension key is refused. The document uses the strict [YAML subset](/reference/workflow-schema#yaml-subset).

### Header

| Key | Type | Required | Meaning |
|---|---|---|---|
| `format` | string | yes | Always `daggry/tenant@1`. |

A reader refuses a missing `format`, a malformed one and a major version it does not know.

### workflows

The catalogue: the workflows the tenant offers, and where each one comes from.

| Key | Type | Required | Meaning |
|---|---|---|---|
| `workflows` | array of objects | no | The catalogue. Names are unique. |
| `workflows[].name` | string | yes | The name a project uses to pick the workflow. Non-empty. |
| `workflows[].source.repository` | string | yes | The repository that holds the workflow file, as `<owner>/<name>`. |
| `workflows[].source.path` | string | yes | The path of the workflow file in that repository. |
| `workflows[].source.revision` | string | yes | The commit the file is read from: 40 lowercase hex digits. |

A workflow is pinned to a commit, so a catalogue entry names exactly one file content. The file itself follows the [Workflow schema](/reference/workflow-schema). A run uses only a workflow from the catalogue.

### orchestration

The rules the conductor follows when it gives work to runners.

| Key | Type | Required | Meaning |
|---|---|---|---|
| `orchestration.concurrency_cap` | integer | no | 1 or more. The most attempts that run at one time for this tenant. |
| `orchestration.lease_seconds` | integer | no | 1 or more. The length of a job lease. |
| `orchestration.attempts.max` | integer | no | 1 or more. The most attempts one job may have. A job that needs one more fails the run. |
| `orchestration.retry.backoff_seconds` | integer | no | 0 or more. The wait before a new attempt starts after a lapsed lease. |
| `orchestration.parking.max_seconds` | integer | no | 1 or more. The longest a run stays `parked` before it fails. |

A run is `parked` when a limit is reached and the work waits for it to reset. For the states, see [HTTP API](/reference/api#states-and-reasons).

### agents

Which agents work for the tenant, what each one runs on, and when a person must decide.

| Key | Type | Required | Meaning |
|---|---|---|---|
| `agents.engines` | array of objects | no | The registered engines. A workflow's `engine` value must name one of them. |
| `agents.engines[].name` | string | yes | The engine identifier. Non-empty. Unique. |
| `agents.engines[].credential.ref` | string | yes | The name of the stored secret the engine uses. Non-empty. |
| `agents.roster` | array of objects | no | The named agents. |
| `agents.roster[].name` | string | yes | The agent's name. Non-empty. Unique. |
| `agents.roster[].engine` | string | yes | The name of a registered engine. |
| `agents.roster[].instructions` | string | no | The path of the agent's instruction file in the workflow's source repository. |
| `agents.approval.require` | array of strings | no | The points where a run always waits for a person. Each is `plan` or `effect`. |

Two rules hold for this section:

- **A credential is a reference, never a value.** `credential.ref` names a secret that the control plane stores. The document has no key that takes a secret value.
- **Approval rules bind every workflow.** With `plan` in `agents.approval.require`, a workflow whose agent step delivers a `plan` must have a `human` step with `waiting_for: approval` before any later step. With `effect`, a `human` step must come before every `effect` step. A catalogue workflow that does not fit is refused.

Autonomy is what is left: between the points where a person decides, the agents work without one.

### runners

The images that run steps, and the isolation class of each kind of runner.

| Key | Type | Required | Meaning |
|---|---|---|---|
| `runners.images` | array of objects | no | The images the tenant offers. |
| `runners.images[].name` | string | yes | The name a project uses in `runner.image`. Non-empty. Unique. |
| `runners.images[].image` | string | yes | The image reference, by digest. |
| `runners.images[].default` | boolean | no | `true` on at most one image: the one a project gets when it names none. |
| `runners.classes` | array of objects | no | The isolation classes. |
| `runners.classes[].name` | string | yes | The class name. Non-empty. Unique. |
| `runners.classes[].module` | string | yes | `deterministic-runner` or `agent-runner`: the module the class applies to. |
| `runners.classes[].network` | string | yes | `none` or `open`: whether a pod of the class reaches the network. |
| `runners.classes[].model_credential` | boolean | yes | Whether a pod of the class holds an engine's credential. `false` is required for `deterministic-runner`. |

The two runner modules are isolated differently because they run different things. The deterministic runner runs code a person wrote into the workflow or the project, and never holds a model credential. The agent runner runs a coding-agent engine and whatever that engine generates. No class gives a pod the signing key.

### projects

The repositories the tenant's factory works on.

| Key | Type | Required | Meaning |
|---|---|---|---|
| `projects` | array of objects | no | The repositories. |
| `projects[].repository` | string | yes | The repository, as `<owner>/<name>`. Unique. |
| `projects[].workflows` | array of strings | no | Names from the catalogue this repository may use. Absent means the whole catalogue. |

A run starts only for a listed repository. The repository's own rules are in its [Project config](/reference/project-config).

### extensions

What the tenant admits beyond the standard.

| Key | Type | Required | Meaning |
|---|---|---|---|
| `extensions.step_kinds` | array of objects | no | Step kinds besides the five built-in ones. |
| `extensions.step_kinds[].kind` | string | yes | `<namespace>/<name>`. See [Extensibility](/reference/workflow-schema#extensibility). |
| `extensions.step_kinds[].module` | string | yes | The module that runs the step: `deterministic-runner`, `agent-runner` or `control-plane`. |
| `extensions.step_kinds[].schema` | string | yes | The URL of the JSON Schema for the step's keys. |
| `extensions.artifact_kinds` | array of objects | no | Artifact kinds besides the eight in [Kinds and schemas](/reference/kinds). |
| `extensions.artifact_kinds[].kind` | string | yes | `<namespace>/<name>@<major>`, in a namespace other than `evidence` and `daggry`. |
| `extensions.artifact_kinds[].schema` | string | yes | The URL of the JSON Schema for the kind's `body`. |
| `extensions.validators` | array of objects | no | Validators from outside the platform. |
| `extensions.validators[].name` | string | yes | The validator's name. Non-empty. |
| `extensions.validators[].version` | string | yes | The exact version admitted. Non-empty. |

This section is the registry. A step kind, an artifact kind or a validator that is neither part of the standard nor listed here is refused.

### Where it lives

| Rule | Detail |
|---|---|
| Held by | The control plane, outside every pod and every workspace. |
| Changed by | A person. No run, no step and no agent writes it. |
| Pinned | A run records the configuration it started under in its run lock, so a later change applies to new runs only. |

### Precedence

Three documents set rules for a run. The order is tenant, then project, then workflow: the tenant's rule wins over the project's, and the project's wins over the workflow's.

| Document | Sets | May not |
|---|---|---|
| Tenant config | Every limit: the catalogue, the engines, the images, the approval points and the orchestration limits. | - |
| [Project config](/reference/project-config) | Narrower rules for one repository, picked from what the tenant offers. | Widen a tenant rule. |
| [Workflow](/reference/workflow-schema) | Narrower rules for one step. | Widen a project or tenant rule. |

Only a person widens a rule. An agent, a workflow and an extension key narrow or add, and never widen.

### Worked example

This tenant offers two workflows, runs at most four attempts at once, registers one engine and two agents, requires a person before work builds on a plan and before any effect, and serves one repository.

```yaml
format: daggry/tenant@1

workflows:
  - name: delivery
    source:
      repository: example/factory-workflows
      path: workflows/delivery.yaml
      revision: 0123456789abcdef0123456789abcdef01234567
  - name: translate-docs
    source:
      repository: example/factory-workflows
      path: workflows/translate-docs.yaml
      revision: 0123456789abcdef0123456789abcdef01234567

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
    - name: tester
      engine: <engine>
      instructions: agents/tester.md
  approval:
    require: [plan, effect]

runners:
  images:
    - name: rust-stable
      image: registry.example/jobs/rust@sha256:<digest>
      default: true
  classes:
    - name: checks
      module: deterministic-runner
      network: none
      model_credential: false
    - name: agents
      module: agent-runner
      network: open
      model_credential: true

projects:
  - repository: example/shop
    workflows: [delivery, translate-docs]

extensions:
  step_kinds:
    - kind: acme/scan
      module: deterministic-runner
      schema: https://acme.example/schemas/scan-step-v1.json
  artifact_kinds:
    - kind: acme/scan-report@1
      schema: https://acme.example/schemas/scan-report-v1.json
  validators:
    - name: acme-scan-clean
      version: "1.2.0"

acme/billing:
  cost_centre: platform
```

| Placeholder | Meaning |
|---|---|
| `<engine>` | The identifier of a coding-agent engine your installation provides. |
| `<digest>` | The 64-digit digest of the image. |
| `model-credential` | The name of a stored secret. The document never holds the secret. |

### Examples a reader refuses

| Input | Refusal |
|---|---|
| No `format` key | Missing `format`. |
| `format: daggry/tenant@2` | Unknown major. |
| `orchestration:` with `concurrency_cap: 0` | Below the minimum of 1. |
| `agents.engines[]` with `credential: {value: ...}` | Unknown key. A credential is given by `ref` only. |
| A roster entry whose `engine` is not in `agents.engines` | Unknown engine. |
| A class with `module: deterministic-runner` and `model_credential: true` | A deterministic runner never holds a model credential. |
| `extensions.artifact_kinds[]` with `kind: evidence/scan@1` | The `evidence` namespace takes no added kinds. |
| `retries: 3` at the top level | Unknown key without a namespace. |

## Next steps

- For one repository's rules, see [Project config](/reference/project-config).
- For the workflow file a catalogue entry points to, see [Workflow schema](/reference/workflow-schema).
- For what another factory implements to use the same documents, see [Conformance](/reference/conformance).
