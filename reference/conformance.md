# Conformance

*Reference*

This page lists what a tool of your own must do to read Daggry's files and trail the same way Daggry does, at three levels with a checklist for each. It also says which of Daggry's choices are its own policy and which are not confirmed. Read it if you build a verifier, a signer, a factory or a module of your own. If you only use Daggry, you can skip it.

An implementation conforms when it accepts, refuses and produces what the rules on this page say, and passes the published test vectors. The work can be of any kind. For the four formats, see [Open formats](/reference/open-formats).

## The one rule

Every level and every contract keeps one rule: no agent grades its own work. Code measures, a judge decides from the evidence trail, and a gate reads only what code or an approved rubric produced. See [Judges](/reference/judges#the-model).

## The rules an implementation follows

Every level rests on the same five rules of the evidence format. Each is defined in full in [Evidence envelope](/reference/envelope).

| Rule | What it fixes | Defined in |
|---|---|---|
| Envelope | The fields of a sealed artifact, which of them a draft holds, and the refusal of unknown fields and unknown `format` majors. | [Fields](/reference/envelope#fields) |
| Canonical JSON | The exact bytes of an artifact: no whitespace, keys sorted by UTF-8 bytes, integers only. | [Canonical JSON](/reference/envelope#canonical-json) |
| Digest | SHA-256 of the canonical bytes of every field except `digest` and `signature`, as 64 lowercase hex digits. | [Digest](/reference/envelope#digest) |
| Chain link | SHA-256 of the 32 bytes of `prev` followed by the 32 bytes of the digest. The first `prev` is the genesis digest. | [Chain link](/reference/envelope#chain-link) |
| Signature | An Ed25519 signature over the 32 bytes of the link, checked strictly, with a key id derived from the public key. | [Signature and key id](/reference/envelope#signature-and-key-id) |

Kinds follow one naming rule: `<namespace>/<name>@<major>`. See [Kinds](#kinds).

## Test vectors

An implementation proves the five rules against the published vectors. They are on the [Evidence envelope](/reference/envelope) page.

| Vector | Proves | Where |
|---|---|---|
| Canonical JSON vectors | An input gives the exact canonical bytes and their SHA-256. A non-integer number is refused. | [Canonical JSON](/reference/envelope#canonical-json) |
| Two-entry chain | Two digests, two links, the chain head, the key id and two signatures, from a published test-only key. | [Worked example](/reference/envelope#worked-example-recompute-a-digest-and-a-link) |

The signing key in the chain vector is for tests only. It signs nothing real.

## Kinds

The table lists the rules for kinds.

| Rule | Detail |
|---|---|
| Form | `<namespace>/<name>@<major>`. A breaking change to a kind is a new major. |
| The `evidence` namespace | Holds the kinds of the standard: `plan`, `measurement`, `verdict` and `approval`. An implementation uses them unchanged and adds none. |
| A factory's own kinds | Live in the factory's own namespace, as Daggry's live in `daggry`. |
| Schemas | Every kind an implementation seals has a published JSON Schema (draft 2020-12) for its `body`, with the kind as its `$id`. |
| Unknown kinds | A reader that has no schema for a kind still verifies the envelope, the digest, the link and the signature. It does not judge the body. |

The schemas of the standard's kinds and of Daggry's own are in [Artifact kinds](/reference/kinds).

## Conformance levels

There are three levels. Each level includes the one before it.

| Level | Name | What the implementation does |
|---|---|---|
| 1 | Verifier | Reads a chain and says whether it holds. |
| 2 | Signer | Produces a chain that any verifier accepts. |
| 3 | Factory | Runs work from the same workflow, project config and tenant config, and produces such a chain. |

### Level 1: verifier

A verifier reads a log and checks it. It needs the public key and no secret.

- Reads the envelope and refuses an unknown top-level field.
- Refuses a missing `format`, a malformed one and a major it does not know.
- Refuses hex that is uppercase or of the wrong length.
- Writes canonical JSON by the rules, and refuses a number that is not an integer.
- Recomputes each artifact digest from the covered fields, with `meta` included only when it is present.
- Recomputes each link from `prev` and the digest, starting from the genesis digest.
- Derives the key id from the public key, and checks each Ed25519 signature strictly over the 32 bytes of the link.
- Checks each entry in the order link, digest, signature, and stops at the first failure.
- Re-hashes every referenced blob and compares it with its digest.
- Passes the canonical JSON vectors and the two-entry chain vector.

### Level 2: signer

A signer seals artifacts and appends them to a chain.

- Meets every item of level 1.
- Accepts a draft that holds `kind`, `id` and `body` only, and adds every other field in code.
- Validates `body` against the kind's schema before it seals.
- Stamps `meta` by the rules: namespaced keys, scalar values, at most 4096 canonical bytes, absent when empty.
- Keeps one chain for each tenant and only appends to it.
- Signs the link of each entry with an Ed25519 key, and names the key by its key id.
- Keeps the signing key away from whatever produced the draft.
- Gives a verifier the public key for a key id.
- Uses the `evidence` kinds unchanged and puts its own kinds in its own namespace.
- Publishes a JSON Schema for every kind it seals.
- Reproduces the digests, links, head and signatures of the two-entry chain vector from the vector's test key.

### Level 3: factory

A factory runs work and seals what the work produced.

- Meets every item of level 2.
- Reads a workflow by the [Workflow file](/reference/workflow-schema) reference: the same keys, the same refusals, the same strict YAML subset. Refuses a missing `format` and an unknown major.
- Reads a gate by the grammar in [Gate expressions](/reference/gates), and lets a gate read `derived` fields, and `judged` fields once a person approves the rubric.
- Reads a [Project config](/reference/project-config) from the baseline, and refuses a missing `format` and an unknown major.
- Looks up every area name that a step, the tenant config or a run request gives in the project config of the baseline, and refuses the run when a name is unknown.
- Reads a [Tenant config](/reference/tenant-config), and refuses a missing `format` and an unknown major.
- Implements the [validators](/reference/validators#a-validator-is-a-command): resolves every name a `verify` step gives (the project config of the baseline first, then the tenant config), runs each validator on a clean copy of the workspace, gives every judge the same input, the evidence trail of the run so far, and seals one verdict for each judge.
- Counts a validator you define as evidence only when it is read from the pinned baseline or revision, and not from a project when the tenant sets `trust_project: false`. Runs only validators that a project config or the tenant config declares.
- Reads a validator's output by its [`output`](/reference/project-config#output-formats): `exit-code`, a [result document](/reference/project-config#result-document) or a known tool format. Refuses any other value, and seals each result as a [measurement](/reference/kinds#evidence-measurement-1).
- Applies the precedence tenant, then project, then workflow, and lets only a person widen a rule.
- Follows the extension rule in all three documents: ignores and preserves a namespaced key it does not know, and refuses an unknown key without a namespace.
- Runs each step in what its kind names, the deterministic runner, the agent runner or the control plane, and refuses a kind that is not registered.
- Takes a credential by reference only.
- Seals a record only after code has checked it.

## Verification internals

These are the exact rules behind the judges and the verdicts a `verify` step seals. A factory applies them to conform. If you only write a workflow or a validator, you can skip them. For the judges themselves, see [Judges](/reference/judges).

### Facts and verdict rules

These rules apply to every verdict.

- A verdict carries `derived` facts, and `judged` facts from a rubric judge, never `claimed` ones.
- Every judge is given the evidence trail of the run so far, without the verdicts that the same step's judges seal. See [What every judge is given](/reference/judges#what-every-judge-is-given).
- A fact value is a boolean, an integer or a string.
- A fact name starts with a letter or `_`, then holds letters, digits, `_` or `-`, and is unique within a verdict.
- The same trail gives an equal verdict from a command judge. A judge reads nothing but the trail: no workspace, no clock, no network and no state of its own.
- When an input is missing or malformed, the verdict is `error` with no facts, and it is still sealed.
- Only the verdicts the control plane seals open gates. See [Gate expressions](/reference/gates).

### Coverage and the carry rule

A criterion is covered when a finding with the outcome `pass` in the canonical validator's `head` measurement carries its id. A finding with any other outcome covers nothing. One passing finding among several that carry the id is enough. A repeated plan id counts once.

A finding carries an id when, after lowercasing the criterion id and the finding id and replacing every non-alphanumeric character with `_`, the criterion id occurs in the finding id standing between characters that are not letters or digits, or at an end. So `AC-1` is carried by `ac_1_rejects_empty` and is not carried by a finding for `AC-10`. An id with no alphanumeric character carries nothing.

### Baseline proof

A baseline proof shows that a criterion's proof says something about the work: the proof fails on the baseline and passes after the work. A `red` measurement is the canonical validator's result on the baseline with a proof step's new frozen paths overlaid. It is red when the exit code is not 0 and a finding that carries the criterion id has the outcome `fail`. A measurement with no findings is not red. The table lists the findings of a proof that is not red.

| Finding | Meaning |
|---|---|
| `no findings` | The measurement holds no finding. |
| `exit code is zero` | The validator passed on the baseline. |
| `no finding carries <id>` | No finding id carries the criterion id. |
| `no finding carrying <id> failed` | The findings that carry the id did not fail. |

The fact `red` and the label `red` name this proof. In a workspace of programs the proof is a failing test: see [Bindings](/reference/bindings#the-software-binding).

### No-regression facts

The `no_regression` judge emits two facts.

| Fact | Counts |
|---|---|
| `findings_removed` | Finding ids in the base measurement that are absent from the head. A renamed id counts. |
| `findings_newly_skipped` | Finding ids that are `skip` in head and not in base. |

A finding id that appears twice in one measurement counts as its last record.

### Malformed measurements

One malformed measurement makes every verdict that reads it have the outcome `error`. A measurement is malformed when:

- `label` is not `base`, `head` or `red`.
- `criterion` is missing on `red`, or present on `base` or `head`.
- `revision` is not in the form the workspace's binding gives a version.
- `exit_code` is missing or mistyped.
- `validator`, `output`, `outcome`, `findings` or `metrics` is present and mistyped.

### Versioning

A run pins the name and version of every validator it uses, as `validator` and `version`, and of every judge it uses, as `judge` and `version`, in two arrays of its [run lock](/reference/kinds#daggry-run-lock-1). A verdict names its judge and that judge's version. The table lists what the version is and what pins it.

| Validator or judge | Version | Pinned by |
|---|---|---|
| Daggry's own: the default judge and the named judges | The version Daggry ships. | The run lock. |
| One you define, in a project | The baseline it is read from. | The run, which reads the project config from the baseline only. |
| One you define, in the tenant | `source.revision` in its declaration. | The tenant config. |

A breaking change to what a judge reads or to the facts it emits is a new version. A gate that reads a fact a judge no longer emits never holds.

## Contracts as conformance surfaces

Every row of the table in [Module contracts](/reference/contracts#the-contracts) is a conformance surface. A module is replaceable when it passes the published tests of each contract it implements: a conductor, a runner, an engine adapter, a validator, a judge, an adapter, a store or a forge. A replacement changes no other contract.

## What is not standard

The standard says how to write things down. It does not say what a factory must decide. Each row of the table is one factory's policy, and a factory conforms whatever it chooses.

| Policy | Daggry's choice | Read more |
|---|---|---|
| The always-protected paths | The always-protected set, such as `.daggry/**` and agent instruction files. | [Protected paths](/reference/protected-paths) |
| The validators and judges a factory ships | The validators and custom judges it declares in its tenant config, and the named judges `coverage` and `no_regression`. | [Judges](/reference/judges) |
| The bindings a factory offers | The software binding. | [Bindings](/reference/bindings) |
| A factory's own kinds | The four kinds in the `daggry` namespace. | [Artifact kinds](/reference/kinds) |
| The values in a tenant config | The limits, the agents, the engines and the approval points. | [Tenant config](/reference/tenant-config) |
| Where keys are kept and who holds them | The control plane holds the signing key. It never enters a pod. | [The modules and where they run](/guide/concepts/modules) |
| How a verifier gets the public key | A route of the HTTP API. | [HTTP API](/reference/api) |
| Where it runs and where it stores | The installation's choice of runners, log store and blob store. | [Install Daggry](/guide/how-to/deploy) |
| The interfaces | The `daggry` commands and the HTTP routes. | [CLI](/reference/cli) |
| The text of an error message | The messages on the reference pages. The cases that are refused are standard. The wording is not. | [Verification errors](/reference/envelope#verification-errors) |

## Specification choices not confirmed

The reference pages are complete, so they make a choice where the design gives a direction and no detail. The table lists those choices. Each one is inferred and not confirmed, and each can change before it is built. For build status, see the [Roadmap](/roadmap).

| Choice | What the reference pages state | Where |
|---|---|---|
| The facts of every verdict | `findings_fail`, `findings_error`, `findings_skip` and `thresholds_missed`. | [Facts a judge emits](/reference/judges#facts-a-judge-emits) |
| The conductor, runner, forge and store contracts | The rules of each interface and the conformance test named for each. | [Module contracts](/reference/contracts) |
| `projects.<workspace>.binding` | A project entry names its binding, and the key is optional when the tenant registers one binding. | [projects](/reference/tenant-config#projects) |
| The version of a validator you define | A project's validator is versioned by the baseline, and a tenant's by `source.revision`. | [Versioning](/reference/conformance#versioning) |
| The forms of a finding id | `threshold:<read>` for a threshold, and `uncovered: <id>`, `removed: <id>` and `newly skipped: <id>` in a verdict. | [Threshold findings](/reference/kinds#threshold-findings) |
| The outcomes of the `sarif` format | A result at level `error` is a `fail`, and every other level is a `pass`. | [Output formats](/reference/bindings#output-formats) |

## Next steps

The list names the pages to read next.

- For every field and rule of a record, see [Evidence envelope](/reference/envelope).
- For the kinds and their schemas, see [Artifact kinds](/reference/kinds).
- For every contract and what can replace each module, see [Module contracts](/reference/contracts).
- For the two configuration files, see [Project config](/reference/project-config) and [Tenant config](/reference/tenant-config).
