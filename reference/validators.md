# Validators

*Reference*

For the idea, read [Why you can trust a run](/guide/concepts/trust).

A validator is the part of a factory that checks work. It takes sealed artifacts, and for a script validator a clean copy of the workspace, and yields a result and a verdict. It is the extension point of verification: a `verify` step names one or more validators, the platform runs them, and you can plug in your own. This page defines the validator contract, the three sources of a validator, where each runs, how a workflow refers to one and how to write one. It is for people who write workflows, people who write validators and people who build a factory.

The examples on this page are illustrative.

## The invariant

Code runs every check and judges every result. No agent and no model grades its own work.

- A verdict comes from code: a validator, run by the platform, over inputs the platform sealed.
- An agent's output is a claim. A claim is an input to a validator and never a verdict.
- A model produces a validator's input only when a person or a check that code derives bounds what the model can say. The one such case is the `judged` fact class: a verdict under a rubric a person approved for one named criterion. See [Fact classes](/reference/gates#fact-classes).

## The validator contract

A validator is defined by what it is given and what it yields. Nothing in the contract names a tool, a language or a kind of work. The table lists its parts.

| Part | Rule |
|---|---|
| Inputs | Sealed artifacts, named by kind and passed with their digests. A script validator is also given a clean copy of the workspace at one sealed version. |
| Result | What a check found, in the one standard form: an outcome, findings and metrics. See [Result document](/reference/project-config#result-document). Only a script validator yields a result. |
| Verdict | A status of `pass`, `fail` or `inconclusive`, findings and derived facts. The control plane seals it as a [verdict](/reference/kinds#evidence-verdict-1) whose parents are the inputs. |
| Determinism | The same inputs give an equal verdict. A validator reads nothing but its inputs: no clock, no network and no state of its own. |
| Missing input | When an input is missing or malformed, the verdict is `inconclusive` with no facts, and it is still sealed. |
| Identity | A name and a version. A run pins both in its [run lock](/reference/kinds#daggry-run-lock-1). |

### Result and verdict

A result says what a check found. A verdict says whether the work is accepted. They are two records, and code writes both, as the table lists.

| Record | Written by | Sealed as |
|---|---|---|
| Result | A script validator, as a result document, or an adapter, from a tool's own output. | A [measurement](/reference/kinds#evidence-measurement-1), by the control plane. |
| Verdict | A built-in or a native validator. For a script validator, the built-in `daggry/result-gate` derives it from the sealed measurement. | A [verdict](/reference/kinds#evidence-verdict-1), by the control plane. |

A script validator never writes its own verdict. Whatever its output claims, the control plane reads the outcome through the result contract and derives the verdict in code.

### Verdict rules

These rules apply to every verdict.

- A validator emits `derived` facts only, never `claimed` ones.
- A fact value is a boolean, an integer or a string.
- A fact name starts with a letter or `_`, then holds letters, digits, `_` or `-`, and is unique within a verdict.
- Only the verdicts the control plane seals open gates. See [Gate expressions](/reference/gates).

## The three sources

A validator comes from one of three sources.

| Source | Reference | Declared in | Runs in | Reads |
|---|---|---|---|---|
| Built-in | `daggry/<name>` | The platform. See [Built-in validators](#built-in-validators). | The control plane. | Sealed artifacts only. |
| Script | `project/<name>` or `tenant/<name>` | The `validators` section of the [Project config](/reference/project-config#validators), or `validators.scripts` of the [Tenant config](/reference/tenant-config#validators). | The deterministic runner, on a clean copy of the workspace, as an unprivileged user, after any agent process has ended. | The clean copy. Its output is read by its [result contract](/reference/project-config#result-contracts). |
| Native | `<namespace>/<name>` | The party that owns the namespace. The tenant admits it by name, version and digest in `validators.native` of the [Tenant config](/reference/tenant-config#validators). | With the control plane, as a pure function. | Sealed artifacts only. Never the workspace. |

### Trust

The table lists, for each source, who decides that a validator counts and what keeps it honest.

| Source | Who decides that it counts | What keeps it honest |
|---|---|---|
| Built-in | The platform ships it. The run lock pins its version. | It reads sealed inputs only. |
| Script, from the tenant | The tenant, by declaring it. | It is read from a pinned version of a workspace the tenant chooses. It runs where no agent can write. |
| Script, from the project | The tenant, in `projects[].validators.admit`. The default admits none. | It is read from the baseline, and its files are protected paths. See [What a project adds](/reference/protected-paths#what-a-project-adds). |
| Native | The cluster admin installs it, and the tenant admits it by name, version and digest. | A loaded validator whose digest differs from the admitted one is refused. It never reads the workspace. |

A project's script validator that the tenant has not admitted still runs as a preview for the agent when it has `expose: agent`. A preview is never evidence.

## Referring to a validator

A `verify` step names its validators in `validators`. See [verify](/reference/workflow-schema#verify). The table lists the forms of a reference.

| Reference | Resolves to |
|---|---|
| `project` | The project's verification: the canonical validator, each validator in `verification.also` and the thresholds. See [verification](/reference/project-config#verification). |
| `project/<name>` | The script validator of that name in the project config of the baseline. |
| `tenant/<name>` | The script validator of that name in the tenant config. |
| `daggry/<name>` | A built-in validator. |
| `<namespace>/<name>` | A native validator the tenant admits. |

Every reference is resolved when the run starts. The run is refused when a reference names nothing, names a project validator the tenant has not admitted, or names a native validator the tenant has not admitted.

```yaml
- id: check
  kind: verify
  validators: [project, tenant/licence-terms, daggry/criterion-coverage, acme/contract-clauses]
```

## Versioning

The table lists what the version of a validator is and what pins it.

| Source | Version | Pinned by |
|---|---|---|
| Built-in | The version the platform ships. | The run lock. |
| Script, from the project | The baseline it is read from. | The run, which reads the project config from the baseline only. |
| Script, from the tenant | `source.revision` in its declaration. | The tenant config. |
| Native | The exact version and digest in `validators.native`. | The tenant config and the run lock. |

A breaking change to what a validator reads or to the facts it emits is a new version. A gate that reads a fact a validator no longer emits never holds.

## Built-in validators

The platform ships these validators. This table is the one list of them.

| Validator | Reads | Facts | Status |
|---|---|---|---|
| `daggry/result-gate` | One measurement. | `findings_fail`, `findings_error`, `findings_skip`, `thresholds_missed` (integers) | `pass` when the measurement's outcome is `pass`, else `fail`. |
| `daggry/criterion-coverage` | One `plan` and the `head` measurement of the canonical validator. | `criteria_covered` (integer), `criteria_uncovered` (integer), `all_covered` (boolean) | `pass` when every criterion is covered, else `fail`. Uncovered ids go to findings as `uncovered: <id>`, sorted. |
| `daggry/baseline-proof` | One `red` measurement. | `red` (boolean) | `pass` when red, else `fail` with the first reason as a finding. |
| `daggry/base-relative` | One `base` measurement and the `head` measurement of the canonical validator. | `findings_removed` (integer), `findings_newly_skipped` (integer) | `fail` when either count is not 0, else `pass`. Ids go to findings as `removed: <id>` and `newly skipped: <id>`, sorted. |

The table lists when each one runs.

| Validator | Runs |
|---|---|
| `daggry/result-gate` | For every script validator a `verify` step runs. A workflow does not name it. |
| `daggry/baseline-proof` | When the control plane accepts a proof step in a loop. A workflow does not name it. See [Red then green](/reference/workflow-schema#red-then-green). |
| `daggry/criterion-coverage`, `daggry/base-relative` | When a `verify` step names them. `daggry/base-relative` makes the step measure the baseline too. |

The platform also ships the two readers of the standard result contracts, `exit-code` and `document`. Every other output format is read by an adapter. See [Result contracts](/reference/project-config#result-contracts).

### Coverage and the carry rule

A criterion is covered when a finding with the outcome `pass` in the canonical validator's `head` measurement carries its id. A finding with any other outcome covers nothing. One passing finding among several that carry the id is enough. A repeated plan id counts once.

A finding carries an id when, after lowercasing the criterion id and the finding id and replacing every non-alphanumeric character with `_`, the criterion id occurs in the finding id standing between characters that are not letters or digits, or at an end. So `AC-1` is carried by `ac_1_rejects_empty` and is not carried by a finding for `AC-10`. An id with no alphanumeric character carries nothing.

### Baseline proof

A baseline proof shows that a criterion's check says something about the work: the check fails on the baseline and passes after the work. A `red` measurement is the canonical validator's result on the baseline with a proof step's new frozen paths overlaid. It is red when the exit code is not 0 and a finding that carries the criterion id has the outcome `fail`. A measurement with no findings is not red. The table lists the findings of a proof that is not red.

| Finding | Meaning |
|---|---|
| `no findings` | The measurement holds no finding. |
| `exit code is zero` | The validator passed on the baseline. |
| `no finding carries <id>` | No finding id carries the criterion id. |
| `no finding carrying <id> failed` | The findings that carry the id did not fail. |

The fact `red` and the label `red` name this proof. In a workspace of programs the proof is a failing test: see [Bindings](/reference/bindings#the-software-binding).

### Base-relative facts

`daggry/base-relative` emits two facts.

| Fact | Counts |
|---|---|
| `findings_removed` | Finding ids in the base measurement that are absent from the head. A renamed id counts. |
| `findings_newly_skipped` | Finding ids that are `skip` in head and not in base. |

A finding id that appears twice in one measurement counts as its last record. The validator emits each count under a second name too, `tests_removed` and `tests_newly_skipped`, with the same values.

### Malformed measurements

One malformed measurement makes every validator that reads it return `inconclusive`. A measurement is malformed when:

- `label` is not `base`, `head` or `red`.
- `criterion` is missing on `red`, or present on `base` or `head`.
- `revision` is not in the form the workspace's binding gives a version.
- `exit_code` is missing or mistyped.
- `check`, `contract`, `outcome`, `findings`, `metrics` or `tests` is present and mistyped.

## Measure, preview and judge

Verification has three parts, and two of them produce evidence.

| Part | Where | What | Counts as evidence |
|---|---|---|---|
| measure | A `verify` step, in the deterministic runner. | Runs each script validator the step names on a clean copy of the sealed version, as a different unprivileged user, after the agent process has ended. Reads each output by its result contract. | Yes, once the control plane seals it as a `measurement`. |
| preview | The agent's pod, through the `validate` tool or a validator with `expose: agent`. | Runs the same validators on the working copy, for fast feedback. `validate` answers `status` and `findings` only. | No. Nothing is sealed. |
| judge | The control plane. | Runs built-in and native validators over the sealed records and seals a `verdict` whose parents are the inputs. | Yes. The only verdicts that open gates. |

The witness rule makes a reviewer's finding gate only when code can confirm what it cites: a quoted passage inside the change, or a failing finding that a validator produces. Any other finding is advice. A finding that cannot be confirmed never accepts work.

## Write a script validator

A script validator is an executable or a script. It inspects the clean copy it is started in and reports by its result contract.

1. Write the script. It reads files under the working directory, which is the root of the clean copy. It writes a [result document](/reference/project-config#result-document) and exits with 0 when the work passes.

   ```sh
   #!/bin/sh
   # scripts/check-summaries.sh: every page has a summary line.
   fail=0; findings=""
   for page in handbook/*.md; do
     if grep -q '^Summary: ' "$page"; then outcome=pass; else outcome=fail; fail=1; fi
     findings="$findings{\"id\":\"summary\",\"outcome\":\"$outcome\",\"locator\":\"$page\",\"message\":\"\"},"
   done
   [ $fail -eq 0 ] && outcome=pass || outcome=fail
   printf '{"format":"daggry/result@1","outcome":"%s","findings":[%s]}\n' "$outcome" "${findings%,}"
   exit $fail
   ```

2. Declare it. In a project, add it to `validators` in `.daggry/project.yaml`. In a tenant, add it to `validators.scripts` of the tenant config.

   ```yaml
   validators:
     summaries:
       run: scripts/check-summaries.sh
       kind: custom
       result:
         contract: document
   ```

3. Admit it. A project's validator counts as evidence when the tenant lists it in `projects[].validators.admit`.
4. Name it in a `verify` step, as `project/summaries` or `tenant/summaries`.

A tool that has an output format of its own needs no wrapper script when the tenant registers an adapter for the format. See [Bindings](/reference/bindings).

## Write a native validator

A native validator implements the validator contract as a pure function over sealed inputs. It is loaded in-process with the control plane, or it runs as a service outside the control plane's process and speaks the validator protocol. It can be written in any language.

The contract has the two operations in the table.

| Operation | Given | Gives |
|---|---|---|
| describe | Nothing. | The validator's name, its version and the kinds of artifact it reads. |
| validate | The sealed artifacts of those kinds, each with its digest. | A status, findings and derived facts. |

The validator protocol carries the same two operations as a request and a response with JSON bodies. The request of validate holds the sealed envelopes. The response holds the fields of a verdict body.

These rules apply to a native validator.

- A native validator reads nothing but the artifacts it is given. It is never given the workspace, a credential or the signing key.
- It returns facts and a status. The control plane seals the verdict. A native validator seals nothing.
- The cluster admin installs it, and the tenant admits it by name, version and digest. See [validators](/reference/tenant-config#validators).

The reference implementation loads an in-process native validator as a Rust library. This block is the native extension interface in that form.

```rust
// The native extension interface, in the reference implementation's in-process form.
pub trait Validator {
    /// The name, the version and the kinds of artifact this validator reads.
    fn describe(&self) -> Description;
    /// A pure function: the same sealed inputs give an equal verdict.
    fn validate(&self, inputs: &[SealedArtifact]) -> Verdict;
}
```

## Next steps

The list names the pages to read next.

- For the keys of a `verify` step, see [Workflow schema](/reference/workflow-schema#verify).
- For declaring a script validator, see [Project config](/reference/project-config#validators) and [Tenant config](/reference/tenant-config#validators).
- For the adapters and validators one kind of work adds, see [Bindings](/reference/bindings).
- For every interface a part of the platform is defined by, see [Contracts](/reference/contracts).
