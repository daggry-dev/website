# Roadmap

Every other page of this site describes Daggry as designed, so you cannot tell from them what works today. This page is the one place that states build status: what is built, what is not built, the three waves with their exit tests and the points the design leaves open. Read it before you plan to depend on a feature.

Daggry is not publicly released. Installation is from source, for early users.

## What you can do today

The list names what an early user can do with what is built.

- Install Daggry on your Kubernetes cluster from source, with the Helm charts.
- Start a run from a workflow file, a Git repository and an issue, with `daggry run`.
- Follow the run with `daggry status` and `daggry logs`, and approve its plan with `daggry approve`.
- Verify the evidence trail on your own machine with `daggry verify`.
- Work on software only: an issue becomes a pull request.

To try it, follow [Run your first workflow](/guide/getting-started).

## Build status

The table lists, for each area, what is built and what is not built. What is built is software work only: a git repository as the workspace, an issue as the work item and a pull request as the delivered change.

Status as of 2026-11-25. No wave exit test has passed, and the shapes of the schemas can still change.

| Area | Built | Not built |
|---|---|---|
| Evidence | The envelope, digests, the signed chain, one log per tenant, fact classes, all eight kinds with schemas and `daggry verify`. | The signed head, revocation, tombstoning and older-major decoding. Lineage by `parents` is filled for `verdict` and `approval` only. Kinds from a namespace other than `evidence` and `daggry` are refused as unknown. |
| Measurement | A measurement with a label, a revision, an exit code and one record for each test, in a `tests` field. | The `validator`, `output`, `outcome`, `findings` and `metrics` fields, one measurement for each validator you define, and threshold findings. |
| Validators | The `verify` step runs one command of the project on a clean copy of the workspace, as a different unix user. `criterion-coverage` and `red-proof` run in a run, under those names and in their test form. | `validators` on a `verify` step and validator references. Validators you define in the project config and from the tenant, `trust_project`, the neutral form of the baseline proof, the witness rule and `judged` facts. |
| Judges | The `criterion-coverage` and `red-proof` checks run in a run, under those names. | The `judges` key of a `verify` step, the default judge, the named judges `coverage` and `no_regression`, custom judges (a command declared in `judges`, in the project config or the tenant config) and rubric judges. See [Judges](/reference/judges). |
| Result document | Nothing. | `daggry/result@1`, and the `output` values `document` and `exit-code`. |
| Output formats | The reader of libtest-style result lines, built into the runner. | The `output` key, the `junit`, `tap` and `sarif` formats, and formats a tenant registers. |
| Kinds of work | Software: a git repository, a commit, an issue and the `open-pr` effect. | The general forms of `work-item` and `change`, effects other than `open-pr`, the `effect-delivered` record and any work that is not software. |
| Triggers and comments | A run starts with `daggry run`, and a person answers with `daggry approve`. | Triggers, status comments on the issue, replies in comments sealed as `input` or `approval`, the approver list, loops without a list, `merge-pr` and `auto_when`. |
| Personas | An `agent` step names an `engine` and holds its own `prompt`. | Personas in the tenant config and the project config, `persona` on a step, the persona and its instructions digest on each record, and personas in the run lock. |
| Workflow | Strict YAML, the five step kinds, bounded loops, a published schema, `approve` and `approve --unfreeze`, and the `open-pr` effect. The loader reads a file that holds `steps` only. Frozen paths are named by a step's `tests` key, and a command step's `run` is a shell line. | The `format` header, `run` as a list of a program and its arguments, extension keys, extension step kinds, `validators` on a `verify` step, `freeze`, registered effects and area references in a scope. Delegation to other agents, a review of the finished run and parallel steps. |
| Gates | The gate grammar and the reads of derived fields. | Reads of `meta` in a gate. |
| Project config | A file in the workspace that holds one verification command. | `.daggry/project.yaml`: the `format` header, `project`, `areas`, named validators you define, the canonical validator, supporting validators, thresholds, `protect.paths`, validators exposed to the agent and extension keys. |
| Tenant config | You set the lease length, the concurrency cap, the job image and the model credential once for the whole installation. A workflow reaches the control plane as a file given to `daggry run --workflow <file>`. | The tenant config document: the workflows on offer, orchestration limits for each tenant, personas, runner images and classes, the `validators` and `judges` sections, project entries and the `extensions` section. |
| Protection | The always-protected paths, the scope of a step, frozen paths, restore in the pod and a recheck in the control plane. Daggry's own instructions are read-only in the pod. A project's own agent config is read from the working copy and protected by the boundary check. | The paths a project adds, the default protection of the files a validator you define runs, the scope of a run, and a human grant for protected paths other than `.daggry/**`. |
| Modules | The control plane holds the keys, seals, judges and serves the API. It also decides the next step and manages leases, and a launcher turns each job attempt into a pod. A lapsed lease starts a new attempt from the last sealed version. One runner in one pod runs commands, validators and the engine. | The conductor as its own module behind the conductor interface. Separate runner classes for the deterministic runner and the agent runner. Runners other than Kubernetes pods. A forge other than a git host. Published tests for each contract. |
| Engine | The engine adapter, the replay engine, one live engine and the tool server that offers `submit` and `validate`. Two live smoke runs passed on 2026-11-16. | `ask_human` and `delegate`. |
| Conformance | The published test vectors. | A conformance suite, with tests for each row of the contracts table. |
| Interfaces and deployment | The CLI commands `run`, `status`, `logs`, `verify` and `approve`. `run` takes `--repo <owner>/<name>` and an issue URL. Helm charts with a SQLite log and filesystem blobs. | `--workspace` on `run`. `stop`, `retry`, `doctor` and `update`. Postgres and S3 storage. |

### Names the binary still uses

The pages describe one design with one name for each thing. A few names in the built binary differ from it, and the next change to the binary adopts the design's name. Until then, an early user writes the built name.

| Built today | The design, and every other page | Where |
|---|---|---|
| A command step's `run` is a shell line, such as `run: echo hello > hello.txt`. | `run` is a list: a program and its arguments, such as `[sh, -c, "echo hello > hello.txt"]`. | [Commands](/reference/project-config#commands) |
| A step's `tests` key names the frozen paths. | `freeze`. | [agent](/reference/workflow-schema#agent) |
| An `agent` step names an `engine` and holds a `prompt`. A step on the `replay` engine holds a `transcript`. | `persona`. The persona holds the engine and the instructions, in the tenant config or the project config. A step holds no instructions. | [agent](/reference/workflow-schema#agent), [personas](/reference/tenant-config#personas) |
| The platform's plan calls a named agent a specialist: a folder with a settings file and an instruction file, on a team roster. | A persona, as an entry of the `personas` map. `agents.roster` of an earlier form of the tenant config is retired. | [personas](/reference/tenant-config#personas) |
| An earlier form of this site grouped output formats, effects and naming rules as a binding, with `projects.<workspace>.binding` and `extensions.bindings`. | None. The concept is retired. The output formats and the `open-pr` effect ship with Daggry, and a software project is a git repository, an issue and a pull request. | [Workspaces and work items](/reference/project-config#workspaces-and-work-items) |
| An effect seals no record. | An `observation` with the event `effect-delivered`. | [daggry/observation@1](/reference/kinds#daggry-observation-1) |
| A measurement's `tests` field, with the outcomes `passed`, `failed` and `ignored`. | `findings`, with the outcomes `pass`, `fail` and `skip`. | [evidence/measurement@1](/reference/kinds#evidence-measurement-1) |
| A verdict's `status`, with the value `inconclusive`. | `outcome`, with the value `error`. | [evidence/verdict@1](/reference/kinds#evidence-verdict-1) |
| A verdict's `findings`, each only a `message`, such as `uncovered: AC-2`. | Each finding has an `id`, an `outcome` and a `message`, as in a measurement. | [evidence/verdict@1](/reference/kinds#evidence-verdict-1) |
| A run lock lists each validator as `name` and `version`. | `validator` and `version`. | [daggry/run-lock@1](/reference/kinds#daggry-run-lock-1) |
| The checks are `criterion-coverage` and `red-proof`. | The named judge `coverage`, and the `baseline_proof` judge that Daggry applies itself. | [Judges](/reference/judges#named-judges) |
| A validator is referred to as `project/<name>`, `tenant/<name>` or `daggry/<name>`. | A bare `<name>`. The project config of the baseline is searched first, then the tenant config. `project` and `daggry` are reserved. | [Referring to a validator](/reference/validators#referring-to-a-validator) |
| A validator's `result.contract` and `result.path`. | `output` and `output_file`. `output` is `exit-code`, `document` or a plain tool format name such as `junit`. | [Output formats](/reference/project-config#output-formats) |
| A measurement's `contract` field, and a tool format written as `software/junit`. | `output`, and `junit`. | [evidence/measurement@1](/reference/kinds#evidence-measurement-1) |
| `projects.<workspace>.validators.admit` (`all`, `none` or a list). | None: a project's validators count by default. `projects.<workspace>.trust_project: false` is the one switch. | [projects](/reference/tenant-config#projects) |
| `daggry/criterion-coverage` and `daggry/base-relative` in a `validators` list. | `judges: [coverage, no_regression]` on the `verify` step. | [verify](/reference/workflow-schema#verify) |
| `coverage: true` and `no_regression: true` on a `verify` step, in an earlier form of the design. | `judges: [coverage, no_regression]`. The two boolean keys are retired. | [verify](/reference/workflow-schema#verify) |
| An observation's `record` field. | `event`. | [daggry/observation@1](/reference/kinds#daggry-observation-1) |

### Designed on this site, to be adopted by the platform

This site is the newest form of the design. The list names what the pages describe and the platform's own design does not hold yet. Each item is a change the platform adopts.

- **The three files.** The tenant config and the project config as documents, the `format` header of every file and extension keys.
- **Personas.** The `personas` maps, `persona` on an `agent` step in place of `engine` and `prompt`, the persona and the digest of its instructions on every record of an `agent` step, and `personas` in the run lock.
- **Validators and judges by name.** `validators` and `judges` on a `verify` step, the four kinds of judge, the result document with `outcome` and `findings`, the output formats, thresholds and `trust_project`.
- **Areas.** Named groups of paths, as the scope of a step and of a run.
- **Commands as lists.** `run` as a program and its arguments.
- **A record for an effect.** The `effect-delivered` observation.
- **The seven modules.** The conductor as a module of its own beside the control plane, and a published contract for each module.
- **Starting work from GitHub.** `triggers` and `approvers` in the tenant config: a label, an issue type, a new pull request or a schedule starts a workflow, and removing the label or closing the issue stops the run.
- **One thread for each run.** Every comment from a person with write access is sealed as the new `input` kind at any time, a persona can ask, and an approver says yes with a reaction, an approving review or plain words. Only an approver starts a run, and an issue has one run at a time. The platform's plan holds verified comments for wave 2, and this site describes that plan in full. The status comment at each step boundary is also new.
- **Objectives.** `objective`, `origin`, `trigger` and `event` on the work item, `objective` on a trigger, `--objective` on `daggry run` and `objective` in the run request. The built work item holds the repository and the issue only.
- **Checkpoints.** A `human` step has one key, `of`. A yes continues, and any other reply sends the run back to `of`. `waiting_for` and a loop's `on_exhausted` are retired: the built binary still takes both.
- **The default team.** The shipped personas `planner`, `developer` and `reviewer` and the shipped workflow `idea-to-pr`, pinned in the run lock.
- **A merge that lands.** `merge-pr` updates the branch, re-runs the validators, waits for the repository's required checks and squashes. A failed merge goes back to the team as input.
- **Fixed waits.** A reminder after 2 days and a stop after 14 days.
- **Iterate until done.** A loop is `until`, `max` and `steps`. `over` and `as` are optional, and the default red-then-green loop writes the proofs for every criterion once and repeats the work on what still fails. The built loop always takes one criterion in each iteration, with `over` required.
- **Autonomy.** The `merge-pr` effect, `auto_when` on an effect, the `run` facts and the `auto-allowed` observation.
- **The `extensions` section.** Output formats, effects, step kinds and artifact kinds that a tenant registers.

## The three waves

A wave is a milestone, accepted when its exit test passes. The exit test is written first. The design gives no dates. The table lists what each wave adds, in terms of what you can do.

| Wave | What you can do |
|---|---|
| 1. Spine | Install Daggry on Kubernetes with Helm charts. Describe work as a YAML workflow and run it with `run`, `status`, `logs`, `verify` and `approve`. Turn a work item into a delivered change with the red-then-green loop: an agent step writes the plan and its criteria, you approve the plan, each criterion's check is shown to fail first, and code re-checks the result. The agent runs through the live agent adapter or the replay engine. Wave 1 builds software work only: an issue becomes a pull request, and facts are measured against the base commit for Rust projects. |
| 2. Team and conversation | Define personas for your team and let a lead hand parts of the work to a delegate. Apply a project's own agent instructions on top of a run. Approve a plan or answer a question by a verified comment on the work item. Hold a dialogue with the agent on a work item, and let an agent ask a person a question with `ask_human`. Settle a disagreement about a frozen path in a dispute step. |
| 3. Judge and review | Let a model judge one criterion you name, under rules you approve, labelled `judged`. Set a check mode for each plan criterion. Keep transcripts with secrets scrubbed. Run a review of a finished run that opens a work item whose citations code confirms. |

### Exit tests

A wave is accepted when its exit test passes.

- **Wave 1.** For a software project, a real issue becomes a pull request with no human input beyond approving the plan, a step cannot tamper with the log, the stored files or a protected path, the validator measures exactly the version that is delivered, and a runner that is killed mid-run is taken over by a second attempt.
- **Wave 2.** A real work item runs with a lead and one delegate, a project's own persona can act as a delegate only, and a plan dialogue of several turns ends in an approval bound to the plan's digest.
- **Wave 3.** An approved plan with a `judged` criterion gates a delivered change, and a review of a finished run opens a work item whose citations code confirms.

::: details What does the design hold beyond the three waves?
The design holds more than the three waves build. No item in the table belongs to a wave.

| Area | Design |
|---|---|
| Modules and open formats | The project config, the tenant config, the workflow `format` header and its extensions, the output formats, the conductor as its own module and the separate runner classes. See [The modules and where they run](/guide/concepts/modules) and [Formats and versioning](/reference/open-formats). |
| Kinds of work other than software | The result document, the output formats and work that is not software. See [Workspaces and work items](/reference/project-config#workspaces-and-work-items). |
| Personas | Named agents in the tenant config and the project config, which a workflow step names in place of a prompt. See [personas](/reference/tenant-config#personas). |
| Your own validators | Validator names on a `verify` step, validators you define from the tenant and the project, and the `trust_project` switch. See [Validators](/reference/validators). |
| Your own judges | The `judges` key: named judges, custom judges from the project and the tenant, and rubric judges with their person-approved rubric. See [Judges](/reference/judges). |
| Replaceable modules | Each module behind a published contract with published tests. See [Module contracts](/reference/conformance#module-contracts). |
| Signed head | A signed chain head kept outside the cluster, so that dropping entries from the end of a chain is visible. |
| Witness rule | A reviewer's finding gates work only when code confirms what it cites. |
| Gate reads of `meta` | A gate reads the values that code stamps in an artifact's `meta`. |
| Revocation and tombstoning | Revoking an approval as its own artifact. Removing a transcript blob without breaking the chain. |
| Older-major decoding | A reader decodes an older major of a kind for audit only. |
| Validator extension SDK | A way for a party outside Daggry to ship validators that read sealed records. |
| `stop` and `retry` | CLI commands to stop a run and to retry one. |
| `doctor` and `update` | Commands to repair an installation and to update it with a health-gated rollback. |
| `harness-change` workflow | The one path for changing agent instruction and tool-setting files. |
| More approval reasons | `answer-to-question` and `review-of-handover`, the second being a review of what one step passes to the next. |
| Parallel steps and join | Deferred until a workflow needs them. |

The design lists these as non-goals: a web interface, a policy language, a code index, agent memory, evaluations and a plugin marketplace.
:::

## Open points

The design leaves three points undecided. The other pages state none of them. You need them if you build on personas, the run lock or areas.

- **A project's persona.** On this site a project's persona wins over a tenant persona of the same name. The platform's plan admits a project's own agent as a delegate only, and layers a project's instructions on top of the tenant's instead of replacing them. Which rule holds is open. See [personas](/reference/project-config#personas).
- **Tenant config in the run lock.** The fields of a run lock are the validators, the judges, the personas, the boundary rules, the image digest and the workflow digest. Whether a run also pins the tenant config it started under is open. See [run lock](/reference/kinds#daggry-run-lock-1) and [Where it lives](/reference/tenant-config#where-it-lives).
- **Areas in a run request.** A run request can name areas to narrow the scope of a run. The key by which it names them is open. See [The scope of a run](/reference/protected-paths#the-scope-of-a-run) and [HTTP API](/reference/api#routes).

Three more points follow from these and are not defined on the reference pages.

- **Areas in the run lock.** How an area reference and the scope of a run are written into the boundary rules of a [run lock](/reference/kinds#daggry-run-lock-1).
- **A workflow from the tenant config in a run request.** The tenant config says a run uses a workflow it offers, by name or by the workspace's default. `daggry run` and the run request take the workflow as a file. How a run request names such a workflow is not defined.
- **Gate reads of several measurements.** A `verify` step seals one measurement for each validator you define it runs. Which of them a `steps.<id>.measurement` read in a gate takes is not defined.

Where the design gives a direction and no detail, the reference pages make a choice. For those choices, see [Specification choices not confirmed](/reference/conformance#specification-choices-not-confirmed).
