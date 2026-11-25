# Bindings

*Reference*

A binding is a ready-made setup for one kind of work and one set of tools. It says what a workspace, a work item and a result are. This page defines the `software` binding in full, with its output formats, and sketches a binding for work that is not software. Read it if you set up a factory for one kind of work, or if you write a binding of your own.

Everything on the other reference pages holds for every binding. Text that is true of one kind of work only is on this page.

## What a binding is

A binding is a named set of output formats, validators, kinds, effects and conventions. A tenant registers a binding and its parts in the [Tenant config](/reference/tenant-config#extensions), and each project entry names the binding its workspace uses. The table lists what a binding gives.

| A binding gives | Which is | Registered in |
|---|---|---|
| A workspace convention | What a workspace is, how one is named and what names a version of it. | `extensions.bindings`, by the binding's name and version. |
| A work item convention | Where a request comes from and how it is referred to. | The same entry. |
| A change convention | What a change is, and how a person accepts one into the workspace. | The same entry. |
| Output formats | Readers that turn a tool's own output into a [result document](/reference/project-config#result-document). A validator names one in `output`. | `extensions.adapters`, keyed by the plain format name. |
| Effects | The side effects a workflow's `effect` step can name, such as handing a change over. | `extensions.effects`. |
| Labels | Recommended values of a validator's `role` and an area's `role`. | Nowhere. Labels are an open vocabulary. |
| Protected paths | Paths the binding adds to the always-protected set. | With the binding. See [Protected paths](/reference/protected-paths). |

These rules hold for every binding.

- **A binding adds and never changes.** It adds names in its own namespace. It changes no key, no kind and no rule of the open formats.
- **A format is a plain name.** The `software` binding ships `junit`, `sarif`, `tap` and `libtest`. A binding or a tenant that adds a format picks a name no other format uses.
- **Daggry reads no tool's format.** A factory reads `exit-code` and `document` itself. Every other format is a binding's or the tenant's.
- **A workflow stays the same.** A workflow names validators and effects by reference. The same workflow runs under two bindings when both give the names it uses.

### The same names for any work

The open formats use general names, so one set of files describes any kind of work. The table gives the general name for each thing in a software run.

| In the software binding | In every binding |
|---|---|
| An issue | A work item: the request the work answers. |
| A repository | A workspace: the versioned collection of files and data the work lives in. |
| A range of commits | A change: a set of differences made to the workspace. |
| A test that fails, then passes | A baseline proof: a proof that fails before the work and passes after it. |
| Opening a pull request | An effect: the step that delivers the result. |

## The software binding

The `software` binding is for workspaces that hold programs.

### Conventions

The table says what each general term is in the software binding.

| General term | In the software binding |
|---|---|
| Workspace | A git repository on a forge, named `<owner>/<name>`. |
| Version of the workspace | A commit, named by its 40 lowercase hex digits. This is the form of every `revision`. |
| Baseline | The base commit: the commit a run starts from. |
| Change | A commit range on the run's branch, `daggry/<run-id>`. A `change` record holds the last commit, the paths the range changed and the frozen set. A frozen path's digest is the file's git blob id. |
| Work item | An issue on the forge, referred to by its URL: `https://github.com/<owner>/<name>/issues/<n>`. The `work-item` record holds `repository` and `issue`. See [Artifact kinds](/reference/kinds#daggry-work-item-1). |
| Accepting a change | A person merges a pull request. The project config and the other protected files change this way only. |
| Approval by comment | A verified comment on the issue or the pull request. Its id is the `source_ref` of the approval. |
| Forge | The git host that holds the repository, the issues and the pull requests. The runner pushes to the run's branch with a token scoped to one repository, and the control plane rechecks a change from the forge's own view of the commits. The forge's application key never enters a pod. |

### Effects

The software binding defines one effect.

| Effect | What it does |
|---|---|
| `open-pr` | Opens a pull request with head `daggry/<run-id>` and base `main`. The title and body come from the issue. The idempotency key is the run id plus the step id, so a retry returns the same pull request. |

### Output formats

Each format reader reads one tool output format and writes a result document. The three test formats give one finding for each test, and the finding's id is the test's name in the report. The table lists them. `output_file` is the validator's key for the file it writes.

| `output` | Reads | `output_file` | Findings |
|---|---|---|---|
| `libtest` | The result lines that Rust's test harness prints on standard output and standard error. | Not used. | One per result line: `pass` for `ok`, `fail` for `FAILED`, `skip` for `ignored`. |
| `junit` | A JUnit XML report. | Required. | One per `testcase` element: `pass`, `fail`, or `skip` when skipped. |
| `tap` | Test Anything Protocol version 13 or 14, on standard output or at the path. | Optional. | One per test point: `pass` for `ok`, `fail` for `not ok`, `skip` for a `SKIP` directive. |
| `sarif` | A SARIF 2.1.0 document, on standard output or at the path. | Optional. | One per result. The id is the rule id, the outcome is `fail` when the level is `error` and `pass` otherwise, the locator is the first location, and the message is the result's message text. |

Each test format writes no metrics, because `findings.pass`, `findings.fail` and `findings.skip` already count the findings by outcome. It sets the document's outcome to `fail` when a test failed. `sarif` writes `errors` and `warnings` and sets the outcome to `fail` when a result is at level `error`. For all four, a report that is missing or does not parse gives the outcome `error`.

#### libtest

The reader keeps one finding for each result line.

| Line | Finding |
|---|---|
| `test <name> ... ok` | `pass`, with the id `<name>`. |
| `test <name> ... FAILED` | `fail`. |
| `test <name> ... ignored` or `test <name> ... ignored, <reason>` | `skip`. |

The reader skips every other line, such as headers, summaries and log output. It drops a ` - should panic` suffix from a name. It also skips the lines between a line that reads `failures:` and the next line that starts with `test result:`, because a failed test prints its captured output there. The exit code and the findings are independent: a run that exits non-zero and prints `ok` lines for some tests still gives `pass` findings for those tests.

`cargo test` prints these lines with no change. Any other program can print the same lines.

### Validators

The software binding adds no validator of its own. The named judges and the baseline proof each have a test form. The table lists them.

| Named judge | In the software binding |
|---|---|
| `coverage` | A criterion is covered when a passing test carries its id in its name. `AC-1` is carried by `tests::ac_1_rejects_empty`. |
| `baseline_proof` | The red proof: a new test fails on the base commit, which shows that the test says something about the change. A run with no test records, such as a compile failure, is not red. |
| `no_regression` | `findings_removed` counts tests in the base commit's result that the head lacks. `findings_newly_skipped` counts tests that are skipped in the head and not in the base. |

The facts are in [Facts a judge emits](/reference/judges#facts-a-judge-emits).

### Frozen tests

In the software binding the frozen paths of a run are tests. A test step is an `agent` step whose `freeze` globs match test files. After the step is sealed, no later step changes a frozen test. `daggry approve <run-id> --unfreeze <path>` frees one test path for one iteration. The rules are in [Frozen paths](/reference/protected-paths#frozen-paths).

### Labels

The table lists the labels the software binding recommends.

| Label of | Recommended values |
|---|---|
| A validator's `role` | `tests`, `lint`, `format`, `types`, `build`, `coverage`, `security`, `custom`. |
| An area's `role` | `source`, `tests`, `docs`, `config`, `generated`, `vendor`, `infrastructure`. |
| `project.tools` and `needs.tools` | A toolchain and its version, such as `rust-1.90`, `node-22` or `dotnet-9`. |

### Coverage thresholds

A coverage tool's summary becomes a metric. A validator you define writes a result document with the number, and a threshold in `verification.thresholds` sets a floor on it:

```yaml
verification:
  canonical: test
  also: [line-coverage]
  thresholds:
    - validator: line-coverage
      read: metrics.line_coverage_pct
      min: 80
```

A full file is in [Examples under the software binding](/reference/project-config#examples-under-the-software-binding).

### Protected paths

The software binding adds these to the always-protected set.

| Protected | Why |
|---|---|
| `**/.gitmodules`, `**/.gitattributes`, `**/.mailmap` | They change how git reads the repository. |
| The lint and coverage configuration | It decides what the validators report. |

A change that adds a gitlink is a violation. A scope of `anywhere` leaves out the forge's automation folders, such as `.github/**`.

### Registration

This fragment of a tenant config registers the binding and its parts. The versions are illustrative.

```yaml
extensions:
  bindings:
    software:
      version: "1.0.0"
  adapters:
    libtest:
      version: "1.0.0"
    junit:
      version: "1.0.0"
    tap:
      version: "1.0.0"
    sarif:
      version: "1.0.0"
  effects:
    open-pr:
      version: "1.0.0"
```

## A binding for document review

This sketch maps the core onto work that is not software. It defines no output format in full.

| Core term | In a document-review binding |
|---|---|
| Workspace | A versioned folder of documents in a document store. |
| Version of the workspace | The store's version id of the folder. |
| Work item | A review request: which documents to revise and why. |
| Change | The set of documents that differ between two versions of the folder. |
| Validator | A validator you define that checks style and citations and writes a result document: one finding for each rule and each citation. |
| Criterion | One requirement of the review request, such as "every claim in section 3 has a source". |
| Proof step (baseline proof) | The citation check fails for the criterion on the baseline and passes after the work. |
| Approval | A reviewer's sign-off, bound to the digest of the plan or of the change. |
| Effect | `publish`: the accepted version of the folder becomes the published one. |
| Output format | `citations`: turns a citation checker's own report into a result document. |

The workflow is the same shape as for software: an agent plans, a person approves the plan, a loop works through the criteria, a `verify` step names the validators and an `effect` step publishes. The project config for such a workspace is in [A set of documents](/reference/project-config#a-set-of-documents).

## Next steps

The list names the pages to read next.

- For the result document every output format yields, see [Project config](/reference/project-config#result-document).
- For what a validator is and how a step refers to one, see [Validators](/reference/validators).
- For registering a binding and its parts, see [Tenant config](/reference/tenant-config#extensions).
