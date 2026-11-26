# Conformance and module contracts

*Reference*

This page lists what a tool of your own must do to read Daggry's files and its evidence trail the way Daggry does, and what a replacement for a module must keep. Read it if you build a verifier, a signer, a factory or a module. If you only use Daggry, you can skip it.

An implementation conforms when it accepts, refuses and produces what this page says, and passes the published test vectors. Every level keeps one rule: no agent grades its own work. Code measures, a judge decides from the evidence trail, and only a sealed record opens a gate. For the formats, see [Formats and versioning](/reference/open-formats).

## Conformance levels

There are three levels, and each includes the one before it. The table lists them.

| Level | Name | What the implementation does |
|---|---|---|
| 1 | Verifier | Reads an evidence trail and says whether it holds. |
| 2 | Signer | Produces a trail that any verifier accepts. |
| 3 | Factory | Runs work from the same workflow, project config and tenant config, and produces such a trail. |

Every level rests on the five rules of the [Evidence envelope](/reference/envelope): the envelope fields, canonical JSON, the digest, the chain link and the signature. An implementation proves them against the test vectors on that page: the [canonical JSON vectors](/reference/envelope#canonical-json) and the [two-entry chain](/reference/envelope#worked-example-recompute-a-digest-and-a-link). The signing key in the chain vector is for tests only.

### Level 1: verifier

A verifier reads a trail and checks it. It needs the public key and no secret. The list is its checklist.

- Reads the envelope and refuses an unknown top-level field, a missing or malformed `format` and a major it does not know.
- Refuses hex that is uppercase or of the wrong length, and a number that is not an integer.
- Recomputes each digest from the covered fields, with `meta` included only when it is present.
- Recomputes each link from `prev` and the digest, starting from the genesis digest.
- Derives the key id from the public key, and checks each Ed25519 signature strictly over the 32 bytes of the link.
- Checks each entry in the order link, digest, signature, and stops at the first failure.
- Hashes every referenced blob again and compares it with its digest.

### Level 2: signer

A signer seals records and appends them to a trail. The list is its checklist.

- Meets every item of level 1.
- Accepts a draft that holds `kind`, `id` and `body` only, and adds every other field in code.
- Validates `body` against the kind's schema before it seals.
- Stamps `meta` by the [rules](/reference/envelope#meta).
- Keeps one chain for each tenant and only appends to it.
- Signs the link of each entry with an Ed25519 key, names the key by its key id and gives a verifier the public key.
- Keeps the signing key away from whatever produced the draft.
- Uses the `evidence` kinds unchanged, puts any kind of its own in its own namespace and publishes a JSON Schema for each. See [Artifact kinds](/reference/kinds).

### Level 3: factory

A factory runs work and seals what the work produced. The list is its checklist.

- Meets every item of level 2.
- Reads a workflow by the [Workflow file](/reference/workflow-schema) and the [Workflow rules](/reference/workflow-rules): the same keys, the same refusals, the same strict YAML subset.
- Reads a gate by the grammar in [Gate expressions](/reference/gates). A gate reads `derived` fields, and `judged` fields once a person approves the rubric.
- Reads the [Project config](/reference/project-config) from the baseline and the [Tenant config](/reference/tenant-config), and refuses a missing `format` and an unknown major in each.
- Resolves every persona, validator, judge and area name when a run starts, in the project config of the baseline first and then in the tenant config, and refuses the run when a name matches nothing.
- Pins what a run uses in its [run lock](/reference/kinds#daggry-run-lock-1), and stamps the persona and the digest of its instructions on every record an `agent` step seals.
- Runs each validator on a clean copy of the workspace, reads its output by its [`output`](/reference/project-config#output-formats) and seals each result as a measurement.
- Gives every judge the same input, the evidence trail of the run so far, and seals one verdict for each judge.
- Counts a validator or a judge you define as evidence only when it is read from the pinned baseline or revision, and not from a project when the tenant sets `trust_project: false`.
- Applies the precedence tenant, then project, then workflow, and lets only a person widen a rule.
- Follows the [extension-key rule](/reference/open-formats#extension-keys) in all three files.
- Takes a credential by reference only, and seals a record only after code has checked it.

## Verification internals

These are the exact rules behind the verdicts a `verify` step seals. A factory applies them to conform. If you only write a workflow or a validator, you can skip them. For the judges themselves, see [Judges](/reference/judges).

### Facts and verdict rules

These rules apply to every verdict.

- A verdict carries `derived` facts, and `judged` facts from a rubric judge, never `claimed` ones.
- A fact value is a boolean, an integer or a string. A fact name starts with a letter or `_`, then holds letters, digits, `_` or `-`, and is unique within a verdict.
- The same trail gives an equal verdict from a judge that is a command. Such a judge reads nothing but the trail.
- When an input is missing or malformed, the verdict is `error` with no facts, and it is still sealed.
- One malformed measurement makes every verdict that reads it an `error`. A measurement is malformed when its `label` is not `base`, `head` or `red`, when `criterion` is missing on `red` or present on another label, or when a field is missing or mistyped.

### Coverage and the carry rule

A criterion is covered when a finding with the outcome `pass` in the canonical validator's `head` measurement carries its id. A finding with any other outcome covers nothing. One passing finding among several that carry the id is enough. A repeated criterion id counts once.

A finding carries an id when, after lowercasing both ids and replacing every non-alphanumeric character with `_`, the criterion id occurs in the finding id between characters that are not letters or digits, or at an end. An id with no alphanumeric character carries nothing.

For a software project, a finding is a test, and its id is the test's name. So `AC-1` is carried by the test `tests::ac_1_rejects_empty` and is not carried by a test for `AC-10`.

### Baseline proof

A baseline proof shows that a criterion's proof says something about the work: the proof fails on the baseline and passes after the work. A `red` measurement is the canonical validator's result on the baseline with a proof step's new frozen paths overlaid. It is red when the exit code is not 0 and, for every criterion the proof step covers, a finding that carries the criterion id has the outcome `fail`. By default a proof step covers every criterion of the plan. In a loop with `over`, it covers the current criterion. The `baseline_proof` judge seals the verdict with the fact `red`.

For a software project, the proof is a new test that fails on the base commit. A run with no test results, such as a compile failure, is not red.

The table lists the findings of a proof that is not red.

| Finding | Meaning |
|---|---|
| `no findings` | The measurement holds no finding. |
| `exit code is zero` | The validator passed on the baseline. |
| `no finding carries <id>` | No finding id carries the criterion id. |
| `no finding carrying <id> failed` | The findings that carry the id did not fail. |

### No-regression facts

The `no_regression` judge compares the `base` measurement with the `head` measurement and emits two facts. For a software project, they count tests.

| Fact | Counts |
|---|---|
| `findings_removed` | Finding ids in the base measurement that are absent from the head. A renamed id counts. |
| `findings_newly_skipped` | Finding ids that are `skip` in the head and not in the base. |

A finding id that appears twice in one measurement counts as its last record.

### Versioning

A run pins every validator, judge and persona it uses in its [run lock](/reference/kinds#daggry-run-lock-1), and a verdict names its judge and that judge's version. The table lists what the version is.

| What is pinned | Version |
|---|---|
| The default judge and the named judges | The version Daggry ships. |
| A validator or a judge you define, in a project | The baseline it is read from. |
| A validator or a judge you define, in the tenant | `source.revision` in its declaration. |
| A persona | The digest of its instructions. |

A breaking change to what a judge reads or to the facts it emits is a new version. A gate that reads a fact a judge no longer emits never holds.

## Module contracts

A contract is the published interface between two parts of Daggry, and a replacement for a part must keep it. This section says what you can replace and what a replacement must do. For what each module does and what it holds, read [The modules and where they run](/guide/concepts/modules).

### Replace a module

A replacement passes the tests of every contract it implements and changes no other contract. Nothing in a contract depends on a language, a database or a cluster. The table lists what you can replace.

| You bring | It replaces | Contract |
|---|---|---|
| An engine for another coding-agent program | The engine | [Engine interface](#engine-interface) |
| A forge for another source of work | The forge | [Forge and effect interface](#forge-and-effect-interface) |
| A store for another database | The store | [Store interfaces](#store-interfaces) |
| A runner for another execution environment | The runner | [Runner protocol](#runner-protocol) |
| A scheduler of your own | The conductor | [Conductor interface](#conductor-interface) |
| A validator or a judge of your own | No module: you add it | [Validators](/reference/validators#write-a-validator), [Judges](/reference/judges#custom-judge) |

The files are contracts too: the [Workflow file](/reference/workflow-schema), the [Project config](/reference/project-config), the [Tenant config](/reference/tenant-config), the [result document](/reference/project-config#result-document) and the [Evidence envelope](/reference/envelope) with its [kinds](/reference/kinds). Each is tested by its published schema and its refusal cases.

### Conductor interface

The conductor reads the workflow, the tenant's orchestration limits and the sealed state of the run. It decides the next step and when a new attempt starts, and leases one attempt to one runner for a limited time. The lease is the one authority on liveness. A replacement gives the same sealed trail for the same workflow and the same step results.

### Runner protocol

A runner claims an attempt, runs its steps and reports. The table lists the operations.

| Operation | Rule |
|---|---|
| Claim | A runner asks for an attempt and receives a lease, the steps to run and the version of the workspace to start from. |
| Heartbeat | The runner renews the lease while it works. A lease that lapses ends the attempt, and a new attempt starts from the last sealed version. |
| Report | The runner hands in each step's records as drafts. The control plane checks and seals them. |
| Release | The runner gives the attempt back when its steps end or when a step waits for a person. |

The deterministic runner runs `command` and `verify` steps, validators and format readers, and never holds a model credential. The agent runner runs `agent` steps through an engine adapter.

### Engine interface

An engine does the work of an `agent` step. The agent runner drives every engine the same way, through an engine adapter, so a tenant can replace an engine. The table lists what the adapter gives the engine.

| The adapter gives the engine | Rule |
|---|---|
| Instructions | The instructions of the step's persona, in a file the engine cannot change. |
| Tools | `submit`, to hand in a record, and `validate`, to preview a validator. A preview answers with the findings and the tail of the command's output. |
| A working copy | The workspace. The step's scope says what it can change. |
| A credential | By reference, from the tenant config. |

Whatever the engine hands in is a claim. An engine never seals a record and never reaches the signing key.

### Forge and effect interface

The forge reads work items and delivers a change. For a software project the forge is a git host. The table lists the operations.

| Operation | Rule |
|---|---|
| Read a work item | The control plane fetches the request a run is for and seals it as a `work-item`. |
| Store a version | A runner hands a change to the workspace store with a credential scoped to one workspace. |
| Recheck | The control plane reads the change back from the store's own view before it accepts a step. |
| Effect | An idempotent side effect that an `effect` step names. The idempotency key is the run id plus the step id. The control plane seals the delivery as an [observation](/reference/kinds#daggry-observation-1). |

### Store interfaces

The control plane keeps two stores, and the table gives the rule for each.

| Store | Holds | Rule |
|---|---|---|
| Log | The evidence trail: one chain of sealed entries for each tenant. | Append only. An entry is never changed or removed. |
| Blobs | Bytes named by the SHA-256 of their content, such as a workflow file. | A blob read back hashes to its name. |

### Identity and credentials

Each request carries a tenant token, and a token reaches one tenant. The author of an approval is the identity of the token that approved. A file names a stored secret by reference and never holds its value. The signing key stays in the control plane, and a verifier needs the public key only.

## What is not standard

The formats say how to write things down. They do not say what a factory must decide. Each row of the table is one factory's policy, and a factory conforms whatever it chooses.

| Policy | Daggry's choice | Read more |
|---|---|---|
| The always-protected paths | `.daggry/**`, agent instruction files and the rest of the always-protected set. | [Protected paths](/reference/protected-paths) |
| The judges and tool formats a factory ships | The named judges `coverage` and `no_regression`, and the formats `junit`, `sarif`, `tap` and `libtest`. | [Judges](/reference/judges), [Output formats](/reference/project-config#output-formats) |
| A factory's own kinds | The four kinds in the `daggry` namespace. | [Artifact kinds](/reference/kinds) |
| The values in a tenant config | The limits, the personas, the engines and the approval points. | [Tenant config](/reference/tenant-config) |
| Where keys are kept | The control plane holds the signing key. It never enters a pod. | [The modules and where they run](/guide/concepts/modules) |
| How a verifier gets the public key | A route of the HTTP API. | [HTTP API](/reference/api) |
| Where it runs and where it stores | The installation's choice of runners, log store and blob store. | [Install Daggry](/guide/how-to/deploy) |
| The text of an error message | The cases that are refused are fixed. The wording is not. | [Verification errors](/reference/envelope#verification-errors) |

## Specification choices not confirmed

Where the design gives a direction and no detail, the reference pages make a choice. The table lists those choices. Each can change before it is built. For build status, see the [Roadmap](/roadmap).

| Choice | What the reference pages state | Where |
|---|---|---|
| The facts of every verdict | `findings_fail`, `findings_error`, `findings_skip` and `thresholds_missed`. | [Facts a judge emits](/reference/judges#facts-a-judge-emits) |
| The conductor as a part of its own, and the conductor, runner, forge and store contracts | The rules of each interface. | [Module contracts](#module-contracts) |
| The version of a validator you define | A project's validator is versioned by the baseline, and a tenant's by `source.revision`. | [Versioning](#versioning) |
| The forms of a finding id | `threshold:<read>` for a threshold, and `uncovered: <id>`, `removed: <id>` and `newly skipped: <id>` in a verdict. | [Threshold findings](/reference/kinds#threshold-findings) |
| The outcomes of the `sarif` format | A result at level `error` is a `fail`, and every other level is a `pass`. | [Output formats](/reference/project-config#output-formats) |
| The record of an effect | An `effect-delivered` observation names the step, the effect and what was delivered. | [daggry/observation@1](/reference/kinds#daggry-observation-1) |
| How a record names its persona | Two `meta` keys, `daggry/persona` and `daggry/persona_digest`, and the `personas` of the run lock. | [Stamped keys](/reference/envelope#stamped-keys) |
