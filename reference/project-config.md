# Project config

*Reference*

For the idea, read [Open standards](/guide/concepts/standards) and [What an agent cannot change](/guide/concepts/protection).

The project config is one YAML file in a workspace, `.daggry/project.yaml`. It describes the workspace: what the project is, which areas it has, which validators check it and which paths it protects. It names no tool, no kind of work, no workflow, no agent and no approval rule.

This page defines the sections of the file, the project's script validators, the result contracts and the extension rules. It is for people who set up a workspace and for people who write a reader of the file. The table names the pages that define what this file leaves out.

| Topic | Page |
|---|---|
| The validator interface, the three sources of a validator and the built-in validators | [Validators](/reference/validators) |
| The workflows, agents, approval rules and scope of a run on a workspace | [Tenant config](/reference/tenant-config) |
| What a workspace is made of, and which tools read a validator's output | [Bindings](/reference/bindings) |

The files on this page are illustrative. Each one is valid against the published schema. See [Validation](#validation).

## Download

The project config and the result document each have a published JSON Schema (draft 2020-12). The table links both files.

| Schema | File |
|---|---|
| `daggry/project@1` | [daggry-project-v1.json](/schemas/daggry-project-v1.json) |
| `daggry/result@1` | [daggry-result-v1.json](/schemas/daggry-result-v1.json) |

## The standard

### Layout

A project config has three parts.

| Part | Keys | Rule |
|---|---|---|
| Header | `format` | Required. Names the standard and its major version. |
| Sections | `project`, `areas`, `validators`, `verification`, `protect` | Each is optional. Each appears at most once. |
| Extensions | `<namespace>/<key>` | Any number. See [Extension keys](#extension-keys). |

Each section answers one question a factory asks about a workspace.

| Section | Question |
|---|---|
| `project` | What is this project, and how is a copy of it prepared? |
| `areas` | Which parts does the workspace have? |
| `validators` | Which scripts of its own check it? |
| `verification` | Which validator is the project's verification? |
| `protect` | Which paths does the project add to the protected set? |

Every object is closed: a key that is not listed on this page and is not an extension key is refused.

### Header

The header has one key.

| Key | Type | Required | Meaning |
|---|---|---|---|
| `format` | string | yes | Always `daggry/project@1`. |

`format` follows the form `<namespace>/<name>@<major>`, the same form as an artifact kind. A reader refuses a missing `format`, a malformed one and a major version it does not know. A breaking change to the layout is a new major.

### project

The `project` section holds the project's identity and what a copy of the workspace needs. It names no path group: the parts of the workspace are in [`areas`](#areas). The table lists its keys.

| Key | Type | Required | Meaning |
|---|---|---|---|
| `project.name` | string | no | The project's name. Non-empty. |
| `project.tools` | array of labels | no | The tools a copy of the workspace needs before its validators can run. Each label names a tool and, when it matters, a version. |
| `project.setup` | array of commands | no | Commands that prepare a fresh copy of the workspace, in order. |
| `project.entry_points` | array of paths | no | The files a reader starts from. |

A label is a short name made of ASCII letters, digits, `.`, `_` and `-`. Labels are an open vocabulary. A reader that does not know a label keeps it and applies nothing.

A command has the form defined in [Commands](#commands). On a clean copy, a reader runs `project.setup` before the first validator.

### areas

The `areas` section names the parts of the workspace. An area is a named group of paths. `areas` is a map from an area name to an area, and it is the only place in the four standards that gives a group of paths a name. A name follows the rule for a [validator name](#validators). The table lists the keys of an area.

| Key | Type | Required | Meaning |
|---|---|---|---|
| `paths` | array of globs | yes | The paths the area holds. At least one glob, each non-empty. |
| `role` | label | no | What the paths are for. Open vocabulary. A binding recommends a set of roles for its kind of work. See [Bindings](/reference/bindings). |
| `description` | string | no | One or two sentences for a reader, person or agent. Non-empty. |

An area has three uses, and the table lists who names the area in each.

| Use | Who names the area | Effect | Defined in |
|---|---|---|---|
| Orient | Nobody. The factory reads every name, `role` and `description`. | None. An area on its own grants and limits nothing. | This section. |
| Scope of a step | A workflow step, in `scope`, as `area:<name>`. | The step can change only the paths its scope holds. | [Areas by name](/reference/workflow-schema#areas-by-name) |
| Scope of a run | The tenant, in `projects[].areas`, or a run request. | The run can change only paths inside the named areas. | [projects](/reference/tenant-config#projects) |
| Protect | The project, in `protect.paths`, as `area:<name>`. | No step can change a path the area holds. | [protect](#protect) |

These rules apply to areas.

- **The project names, others choose.** The project says which areas exist. It never says which of them a run can change. A workflow chooses the scope of a step, and the tenant or the run request chooses the scope of a run.
- **A name must exist.** A step, a tenant entry, a run request or a `protect.paths` entry that names an area this section lacks is refused. For the first three the run is refused when it starts.
- **Areas can overlap.** A path can be in more than one area. A path is inside a scope when at least one named area holds it, and it is protected when at least one protected area holds it.
- **A path in no area** is outside the scope of every run that names areas.
- **A role is a label.** A reader that does not know a role keeps it and applies nothing. No role freezes a path. Frozen paths come from a step's `freeze` key. See [Frozen paths](/reference/protected-paths#frozen-paths).

How a scope is judged, and how the scope of a run and the scope of a step combine, is in [Scope](/reference/protected-paths#scope).

### Commands

A command is written in one of the two forms in the table. Neither is a shell line.

| Form | YAML | Meaning |
|---|---|---|
| Argument list | An array of non-empty strings, at least one. | The first string is the program, and the rest are its arguments. No shell reads them, so no quoting, pipe or variable expansion applies. |
| Script path | One string with no whitespace. | The path of a script in the workspace, relative to the workspace root. The reader runs the file with no arguments. |

A path is never absolute and never holds `..`. The working directory is the workspace root. A command that needs a pipe or a loop is a script in the workspace.

### validators

The `validators` section holds the project's script validators. A script validator is a check the project declares: an executable or a script in the workspace. `validators` is a map from a validator name to a script validator. A name starts with a lowercase letter and holds lowercase letters, digits, `-` and `_`.

A workflow refers to a validator of this section as `project/<name>`. A project's script validator counts as evidence only when the tenant admits it. See [Admission](#admission). What a validator is given, what it yields and where each source of validator runs is in [Validators](/reference/validators). The table lists the keys of a script validator.

| Key | Type | Required | Meaning |
|---|---|---|---|
| `run` | command | yes | What runs. See [Commands](#commands). |
| `kind` | label | yes | What the validator looks at. Open vocabulary. `custom` is the label for one that fits no other. A binding names the kinds of its work. See [Bindings](/reference/bindings). |
| `result` | object | no | How the result is read. Absent means `contract: exit-code`. See [Result contracts](#result-contracts). |
| `timeout` | integer | no | 1 or more. The longest the validator can run, in seconds. One that runs longer is stopped and counts as failed. |
| `env` | array of names | no | The allow-list of environment variables the factory can pass to the validator's process. The file holds names, never values. |
| `needs.tools` | array of labels | no | The tools the validator needs in its runner, by the same labels as `project.tools`. |
| `needs.runner` | string | no | The class of runner the validator needs, by name. The factory matches the name to a runner class it offers. |
| `expose` | string | no | Who can call the validator: `factory` or `agent`. Absent means `factory`. See [Who runs a validator](#who-runs-a-validator). |

A validator that names a tool or a runner class the factory does not offer cannot run. A reader refuses the run when a validator the run uses cannot run.

### Result contracts

A result contract says how a factory reads what a script validator decided. The table lists the keys of `result`.

| Key | Type | Required | Meaning |
|---|---|---|---|
| `result.contract` | string | yes | `exit-code`, `document`, or the name of an adapter, `<namespace>/<adapter>`. |
| `result.path` | path | no | The file the validator writes, relative to the workspace root. Absent means standard output. |

The standard has the three contracts in the table. None of them names a tool.

| Contract | Reads | Gives |
|---|---|---|
| `exit-code` | The exit code only. | Pass when the code is 0, fail otherwise. No findings and no metrics. |
| `document` | A [result document](#result-document), `daggry/result@1`, that the validator writes at `result.path` or on standard output. | The outcome, the findings and the metrics the document holds. |
| `<namespace>/<adapter>` | The validator's own output, at `result.path` or on standard output, through an adapter. | The result document the adapter writes from that output. |

An adapter is a deterministic program that turns one tool's own output format into a result document. The tenant registers each adapter by name in `extensions.adapters` of the [Tenant config](/reference/tenant-config#extensions). The format an adapter reads is defined by the binding that owns its namespace and is no part of this standard. See [Bindings](/reference/bindings).

These rules apply to every contract.

- The exit code is always recorded, whatever the contract.
- Output that the contract cannot read gives no findings. A result document that is missing, does not parse or is not valid against the schema makes the result an `error`.
- The result of every script validator a `verify` step runs is sealed in one form, whatever the contract: a [measurement](/reference/kinds#evidence-measurement-1) that names the validator and the contract and holds the exit code, an outcome, the findings and the metrics.
- Code judges. The control plane derives the verdict from the sealed measurement. A script validator never writes its own verdict. See [Validators](/reference/validators#result-and-verdict).
- An adapter runs in the deterministic runner, after the validator's process has ended. It reads the validator's output and nothing else.
- A reader refuses a contract that is neither `exit-code` nor `document` nor an adapter the tenant registers. The run is refused when it starts.

### Result document

A result document is the one standard form of a check's result. A script validator writes it directly under the `document` contract, and an adapter writes it for a tool that has a format of its own. The table lists its keys.

| Key | Type | Required | Meaning |
|---|---|---|---|
| `format` | string | yes | Always `daggry/result@1`. |
| `outcome` | string | yes | What the check decided: `pass`, `fail` or `error`. |
| `findings` | array of objects | no | What the check found, one finding for each thing it inspected or each thing it reports. Can be empty. |
| `findings[].id` | string | yes | The name of the finding, such as the name of a rule or of the item inspected. Non-empty. |
| `findings[].outcome` | string | yes | `pass`, `fail`, `error` or `skip`. `skip` says the check did not inspect the item. |
| `findings[].locator` | string | no | Where the finding is. A path relative to the workspace root, a path with a position as `<path>:<line>` or `<path>:<line>:<column>`, or any other string that names a place. Non-empty. |
| `findings[].message` | string | yes | Any string, can be empty. |
| `metrics` | map | no | Numbers the check measured, from a name to a number. A name starts with a lowercase letter and holds lowercase letters, digits and `_`. |

These rules apply to a result document.

- **The outcome is the check's decision.** Findings and metrics explain it and do not change it.
- **`error` is no decision.** A check writes `error` when it could not inspect the workspace. An `error` counts as a failed check.
- **An id can repeat.** Two findings can carry one id, for example one rule that fails in two places. A validator that compares findings by id takes the last one.
- **The document is closed.** A key this section does not define and that is not an extension key is refused.

A style check of a set of documents writes this result document.

```json
{
  "format": "daggry/result@1",
  "outcome": "fail",
  "findings": [
    {"id": "heading-order", "outcome": "pass", "locator": "handbook/leave.md", "message": ""},
    {"id": "sentence-length", "outcome": "fail", "locator": "handbook/pay.md:14", "message": "The sentence has 41 words. The limit is 30."},
    {"id": "glossary-terms", "outcome": "skip", "locator": "handbook/drafts/", "message": "Drafts are not inspected."}
  ],
  "metrics": {"pages": 12, "reading_grade": 8}
}
```

### verification

The `verification` section says which validator is canonical, which others are measured with it and which limits hold. A project has many validators and exactly one canonical validator. The table lists the keys.

| Key | Type | Required | Meaning |
|---|---|---|---|
| `verification.canonical` | validator name | yes, when `verification` is present | The validator that the reference `project` resolves to in a workflow. |
| `verification.also` | array of validator names | no | Validators that run with the canonical one, as supporting evidence. No name appears twice, and none is the canonical validator. |
| `verification.thresholds` | array of objects | no | Limits on numbers that those validators give. |
| `verification.thresholds[].validator` | validator name | yes | The canonical validator or one in `also`. |
| `verification.thresholds[].read` | string | yes | The number to read: `exit_code`, `findings`, `findings.<outcome>` or `metrics.<name>`. |
| `verification.thresholds[].min` | number | one of the two | The lowest value that passes. |
| `verification.thresholds[].max` | number | one of the two | The highest value that passes. |

`read` names one number of the validator's result, in one of the forms in the table.

| `read` | The number | Contracts that give it |
|---|---|---|
| `exit_code` | The exit code. | Every contract. |
| `findings` | The count of findings. | `document` and every adapter. |
| `findings.pass`, `findings.fail`, `findings.error`, `findings.skip` | The count of findings with that outcome. | `document` and every adapter. |
| `metrics.<name>` | The metric of that name. | `document` and every adapter. |

These rules apply to `verification`.

- **`project` is the project's verification.** A [`verify` step](/reference/workflow-schema#verify) that names `project` runs the canonical validator and each validator in `also` on a clean copy of the sealed version of the workspace. Each result is sealed as a [measurement](/reference/kinds#evidence-measurement-1) of its own.
- **A threshold is a finding.** The result of each threshold is sealed as a finding in the measurement of the validator it reads. See [Threshold findings](/reference/kinds#threshold-findings).
- **A workflow can assume it.** A workflow names `project` and holds no command and no tool. The project config supplies the command, and the factory knows how to read the result.
- **A name must exist.** A name in `canonical`, `also` or a threshold that `validators` does not hold is refused.
- **A missed threshold fails verification.** The verification is green when the canonical validator passes, every validator in `also` passes and every threshold holds.
- **Criterion rules need findings.** Criterion coverage and the baseline proof read the findings of the canonical validator. See [Coverage and the carry rule](/reference/validators#coverage-and-the-carry-rule). They need a canonical validator with the `document` contract or an adapter. One with `exit-code` gives a pass or a fail and covers no criterion.

A workflow whose `verify` step names `project` needs this section.

### Admission

The tenant decides whether a project's own scripts count as evidence. A project declares its validators here, and the tenant admits all of them, none of them or a named list in `projects[].validators.admit` of the [Tenant config](/reference/tenant-config#projects). The default is none. The table lists what admission changes.

| The validator is | In a `verify` step | As a preview |
|---|---|---|
| Admitted | It runs, and its result is sealed as evidence. | It runs when it has `expose: agent`. |
| Not admitted | The run is refused when it starts. | It runs when it has `expose: agent`. |

`project` needs the canonical validator and every validator in `also` to be admitted.

### Who runs a validator

A script validator is declared once and is used in the two ways in the table. Only verification produces evidence.

| Use | Started by | Where it runs | Evidence |
|---|---|---|---|
| Verification | A `verify` step that names `project` or `project/<name>`. See [Validators by reference](/reference/workflow-schema#validators-by-reference). | The deterministic runner, on a clean copy of the sealed version, as an unprivileged user, after any agent process has ended. | Yes: one measurement for each validator, and the verdict the control plane derives from it. |
| Preview | An agent, for a validator with `expose: agent`. | The agent's pod, on the working copy. | Never. |

`expose` says who can start a validator, with one of two values.

| Value | Meaning |
|---|---|
| `factory` | Only the factory's deterministic components call the validator. The agent cannot start it. |
| `agent` | The agent can also call the validator by name, as a preview. |

A validator with `expose: agent` can also be the canonical validator: the agent previews it, and the factory measures it.

### protect

The `protect` section holds the paths this project adds to the protected set. The always-protected paths, the default protection of the files a script validator runs and the boundary check that enforces all of it are defined in [Protected paths](/reference/protected-paths). This section defines only the project's own additions, in one key.

| Key | Type | Required | Meaning |
|---|---|---|---|
| `protect.paths` | array of entries | no | Each entry is a glob or an area reference, `area:<name>`. Added to the protected set for every run on this workspace. |

These rules apply to `protect.paths`.

- **An entry that starts with `area:` is an area reference.** It protects every path the area holds. A name that [`areas`](#areas) lacks is refused. Every other entry is a glob.
- **This section only adds.** No key removes a path from the protected set.
- **A protected path is in no scope.** A step whose scope names an area does not change the area's protected paths.

### Extension keys

An extension key carries a section or a value that the standard does not define. The table lists the rules.

| Rule | Detail |
|---|---|
| Form | `<namespace>/<key>`. Pattern `^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$`. |
| Namespace | Names the party that defines the key. One party owns every key under its namespace. It is the same form as a key of the envelope's [meta](/reference/envelope#meta). |
| Place | At the top level and inside any section object, including a validator. |
| Value | Any YAML value in the strict subset. |
| A reader that knows the key | Applies it. |
| A reader that does not know the key | Ignores the value and preserves it: a tool that rewrites the file writes the key back unchanged. |
| A key without a namespace | Refused, unless this page defines it. |
| Limit | An extension narrows or adds. It never widens a rule of the standard, the project or the tenant, and never changes the meaning of a key this page defines. |

A misspelt standard key is therefore an error, and a key in a namespace the reader does not know is not.

### YAML subset

The file uses the same strict subset of YAML as a workflow file: no anchors, aliases, tags or merge keys, and no duplicate mapping key. See [YAML subset](/reference/workflow-schema#yaml-subset).

### Where it lives

The table says where the file lives, where it is read from and who changes it.

| Rule | Detail |
|---|---|
| Folder | `.daggry/` in the workspace. |
| Path | `.daggry/project.yaml`. |
| Read from | The baseline: the version of the workspace a run starts from. Never the working copy of a step. |
| Protected | `.daggry/**` is always protected, so no step and no grant changes the file. See [Protected paths](/reference/protected-paths). |
| Changed by | A person, outside every run. The change takes effect in the next run whose baseline holds it. How a person accepts a change into a workspace is the binding's convention. See [Bindings](/reference/bindings). |

A step that edits the file changes nothing for its own run: the edit is put back and recorded, and the validators come from the baseline. The baseline proof uses the baseline's canonical validator too. See [Baseline proof](/reference/validators#baseline-proof).

### Precedence

Three documents set rules for a run: the tenant config, the project config and the workflow. The tenant's rule wins over the project's, and the project's wins over the workflow's. The full table is in [Precedence](/reference/tenant-config#precedence).

The project config never chooses a workflow, an engine, an approval rule or the scope of a run, and it never widens a tenant rule.

## Worked examples

### A set of documents

This workspace holds a handbook, not a program. Its canonical validator is a script of its own that reviews every page against the house style and writes a result document. A second validator verifies the citations, and the agent can preview it. A third needs a variable from the factory and a runner that reaches the network. The file carries one extension key.

```yaml
format: daggry/project@1

project:
  name: handbook
  tools: [pandoc-3]
  entry_points: [handbook/index.md]

areas:
  handbook:
    paths: ["handbook/**"]
    role: content
    description: One page for each policy. Each page is one Markdown file.
  sources:
    paths: ["sources/**"]
    role: reference
  style:
    paths: ["style/**"]
    role: config

validators:
  review:
    run: [sh, scripts/review-handbook.sh]
    kind: style
    result:
      contract: document
      path: reports/review.json
    timeout: 300
    needs:
      tools: [pandoc-3]
  citations:
    run: scripts/check-citations.sh
    kind: citations
    result:
      contract: document
    expose: agent
  links:
    run: [sh, scripts/check-links.sh]
    kind: custom
    env: [LINK_CHECK_TOKEN]
    needs:
      runner: networked

verification:
  canonical: review
  also: [citations]
  thresholds:
    - validator: review
      read: metrics.reading_grade
      max: 9
    - validator: citations
      read: findings.skip
      max: 0

protect:
  paths:
    - "area:style"

acme/review:
  owner: docs-team
```

The table explains the values.

| Value | Meaning |
|---|---|
| `review` | The canonical validator. It writes its result document to `reports/review.json`. `scripts/review-handbook.sh` is protected by default. See [What a project adds](/reference/protected-paths#what-a-project-adds). |
| `citations` | A supporting validator, given as a script path. It writes its result document on standard output. The agent can run it as a preview. |
| `links` | A validator with the `exit-code` contract. It is in neither `canonical` nor `also`, so it runs only when a `verify` step names `project/links`. |
| `metrics.reading_grade` | A metric the `review` validator writes. The verification fails when it is above 9. |
| `findings.skip` | The count of citations the validator did not inspect. The verification fails when it is above 0. |
| `area:style` | An area reference. No step changes the house style the validators read. |
| `LINK_CHECK_TOKEN` | The name of a variable the factory can pass. The file holds no value. |
| `networked` | The name of a runner class. The factory matches it to a class it offers. |
| `acme/review` | A section defined under the namespace `acme`. A reader that does not know it ignores it and preserves it. |

### Smallest file

The smallest project config that a `verify` step can use names one validator and makes it canonical. The validator has the `exit-code` contract.

```yaml
format: daggry/project@1
validators:
  review:
    run: [sh, check.sh]
    kind: custom
verification:
  canonical: review
```

## Examples under the software binding

The three files in this section are for workspaces that hold programs. Each tool they name, each adapter in the `software` namespace, each `kind` and each `role` belongs to the software binding and is defined in [Bindings](/reference/bindings#the-software-binding). The standard on this page defines none of them.

### Software binding: a Node project

The canonical validator runs vitest, which writes a JUnit XML report. The `software/junit` adapter reads the report. The linter runs through an npm script that `package.json` defines. The [default protection](/reference/protected-paths#what-a-project-adds) covers the files a command names and not the files those programs read, so the file protects `package.json` itself, through an area.

```yaml
format: daggry/project@1

project:
  name: shop-web
  tools: [node-22]
  setup:
    - [npm, ci]
    - [npm, run, build]
  entry_points: [src/main.ts]

areas:
  app:
    paths: ["src/**"]
    role: source
    description: The storefront. Pages are under src/pages and shared code under src/lib.
  tests:
    paths: ["src/**/*.test.ts"]
    role: tests
  docs:
    paths: ["docs/**"]
    role: docs
  tooling:
    paths: ["package.json", "vitest.config.ts"]
    role: config

validators:
  test:
    run: [npx, vitest, run, --reporter=junit, --outputFile=reports/junit.xml]
    kind: tests
    result:
      contract: software/junit
      path: reports/junit.xml
    timeout: 600
    needs:
      tools: [node-22]
    expose: agent
  lint:
    run: [npm, run, lint]
    kind: lint
    expose: agent
  types:
    run: [npx, tsc, --noEmit]
    kind: types

verification:
  canonical: test
  also: [lint, types]

protect:
  paths:
    - "area:tooling"
```

The table explains the values.

| Value | Meaning |
|---|---|
| `app`, `tests` | Two areas that overlap: a test file under `src/` is in both. |
| `software/junit` | An adapter of the software binding. It gives one finding for each test in the report. |
| `tooling` | An area for the files the validators read. |
| `area:tooling` | An area reference. No step changes `package.json` or `vitest.config.ts`. |

### Software binding: a Rust project

`cargo test` prints one result line for each test, and the `software/libtest` adapter reads those lines from standard output, so the canonical validator needs no report file. A threshold refuses a skipped test. One entry of `protect.paths` is a glob.

```yaml
format: daggry/project@1

project:
  name: shop-core
  tools: [rust-1.90]
  setup:
    - [cargo, build, --workspace]

validators:
  test:
    run: [cargo, test, --workspace]
    kind: tests
    result:
      contract: software/libtest
    timeout: 1200
  clippy:
    run: [cargo, clippy, --workspace, --, -D, warnings]
    kind: lint
    expose: agent
  fmt:
    run: [cargo, fmt, --check]
    kind: format
    expose: agent

verification:
  canonical: test
  also: [clippy, fmt]
  thresholds:
    - validator: test
      read: findings.skip
      max: 0

areas:
  crates:
    paths: ["crates/**", "Cargo.*"]
    role: source
  docs:
    paths: ["docs/**"]
    role: docs

protect:
  paths:
    - "docs/adr/**"
```

### Software binding: a .NET project

`dotnet test` writes a JUnit XML report through a logger that the test project references, and the `software/junit` adapter reads it. A second validator is a script that writes a result document with one metric, the share of lines the tests cover, and a threshold sets a floor on it.

```yaml
format: daggry/project@1

project:
  name: shop-api
  tools: [dotnet-9]
  setup:
    - [dotnet, restore]
    - [dotnet, build, --no-restore]
  entry_points: [src/Shop.Api/Program.cs]

validators:
  test:
    run: [dotnet, test, --no-build, --logger, "junit;LogFilePath=reports/junit.xml"]
    kind: tests
    result:
      contract: software/junit
      path: reports/junit.xml
    needs:
      tools: [dotnet-9]
  coverage:
    run: scripts/coverage-summary.sh
    kind: coverage
    result:
      contract: document
      path: reports/coverage.json
  format:
    run: [dotnet, format, --verify-no-changes]
    kind: format
    expose: agent

verification:
  canonical: test
  also: [coverage]
  thresholds:
    - validator: coverage
      read: metrics.line_coverage_pct
      min: 80

areas:
  api:
    paths: ["src/Shop.Api/**"]
    role: source
  tests:
    paths: ["tests/**"]
    role: tests
```

## Validation

Every YAML example on this page was checked against [daggry-project-v1.json](/schemas/daggry-project-v1.json) with a draft 2020-12 validator, and each one is valid. The result document was checked against [daggry-result-v1.json](/schemas/daggry-result-v1.json). The rules that a schema cannot state were checked too: every name in `canonical`, `also` and a threshold is a validator in the same file, and every area reference in `protect.paths` names an area in the same file.

To check a file of your own, give the schema and the file to any validator that supports draft 2020-12. The schema does not check that an adapter is registered: that needs the tenant config.

## Examples a reader refuses

A reader refuses each input in the table.

| Input | Refusal |
|---|---|
| No `format` key | Missing `format`. |
| `format: daggry/project@2` | Unknown major. |
| `validatrs:` at the top level | Unknown key without a namespace: a misspelt `validators`. |
| An area with no `paths`, or with `paths: []` | An area holds at least one glob. |
| `protect.paths` with `area:web` where `areas` holds no `web` | No such area. |
| `protect.paths` with `area:Web App` | Not an area name. |
| `run: sh check.sh --all` | A shell line. A command is an argument list or one script path. |
| `run: /usr/local/bin/check` | An absolute path. |
| A validator with no `kind` | Missing `kind`. |
| `kind: Style Review` | Not a label. |
| `result:` with `contract: report` | Not a contract. A contract is `exit-code`, `document` or `<namespace>/<adapter>`. |
| `result:` with `contract: acme/sheet` where the tenant registers no adapter of that name | No such adapter. The run is refused when it starts. |
| `result:` with `schema: https://example.com/s.json` | Unknown key. The form of a result document is fixed. |
| `expose: everyone` | Not `factory` or `agent`. |
| `env:` with `TOKEN=abc` | Not a variable name. The file holds names, never values. |
| `verification:` with no `canonical` | Missing `canonical`. |
| `canonical: reviews` where `validators` holds `review` | No such validator. |
| `canonical:` with a list of two names | One validator is canonical. The others go in `also`. |
| A threshold with neither `min` nor `max` | A threshold needs a limit. |
| A threshold with `read: reading_grade` | Not a `read` form. A metric is read as `metrics.<name>`. |

A result document that a reader refuses makes the result an `error`. The table lists such documents.

| Input | Refusal |
|---|---|
| No `format` key, or `format: daggry/result@2` | Missing `format`, or unknown major. |
| `outcome: skipped` | Not `pass`, `fail` or `error`. |
| A finding with no `message` | Missing `message`. |
| `metrics:` with `pages: "12"` | A metric is a number. |

## Next steps

The list names the pages to read next.

- For the validator interface, the three sources of a validator and the built-in validators, see [Validators](/reference/validators).
- For what a binding adds for one kind of work, including the adapters of the software binding, see [Bindings](/reference/bindings).
- For the tenant's side, including which workflows run on a workspace, see [Tenant config](/reference/tenant-config).
- For the always-protected paths and the boundary check, see [Protected paths](/reference/protected-paths).
- For what another factory implements to read this file, see [Conformance](/reference/conformance).
