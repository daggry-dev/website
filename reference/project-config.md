# Project config

*Reference*

The project config is one YAML file in the workspace, `.daggry/project.yaml`. It says which validators check the project and which paths no agent can change. Daggry only uses what `.daggry/project.yaml` names: it never finds a script, a path group or a file by its folder or its file name. This is the one file Daggry looks for. Read this page to look up a key, or if you write a tool that reads the file. To write your first one, follow [Set up a project](/guide/how-to/set-up-a-project).

The file holds no workflow, agent or approval rule. The table names the pages that do.

| Topic | Page |
|---|---|
| What a validator is, how Daggry reads its output and how a step names one | [Validators](/reference/validators) |
| The workflows, agents, approval rules and scope of a run on a workspace | [Tenant config](/reference/tenant-config) |
| What a workspace is made of, and which tool formats a validator's output can have | [Bindings](/reference/bindings) |

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
| Sections | `project`, `areas`, `validators`, `judges`, `verification`, `protect` | Each is optional. Each appears at most once. |
| Extensions | `<namespace>/<key>` | Any number. See [Extension keys](#extension-keys). |

Each section answers one question a factory asks about a workspace.

| Section | Question |
|---|---|
| `project` | What is this project, and how is a copy of it prepared? |
| `areas` | Which parts does the workspace have? |
| `validators` | Which scripts of its own check it? |
| `judges` | Which judges of its own decide on the evidence trail? |
| `verification` | Which validators does `project` stand for? |
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
| Scope of a run | The tenant, in `projects.<workspace>.areas`, or a run request. | The run can change only paths inside the named areas. | [projects](/reference/tenant-config#projects) |
| Protect | The project, in `protect.paths`, as `area:<name>`. | No step can change a path the area holds. | [protect](#protect) |

These rules apply to areas.

- **The project names, others choose.** The project says which areas exist. It never says which of them a run can change. A workflow chooses the scope of a step, and the tenant or the run request chooses the scope of a run.
- **A name must exist.** A step, a tenant entry, a run request or a `protect.paths` entry that names an area this section lacks is refused. For the first three the run is refused when it starts.
- **Areas can overlap.** A path can be in more than one area. A path is inside a scope when at least one named area holds it, and it is protected when at least one protected area holds it.
- **A path in no area** is outside the scope of every run that names areas.
- **A role is a label.** A reader that does not know a role keeps it and applies nothing. Frozen paths come from a step's `freeze` key. See [Frozen paths](/reference/protected-paths#frozen-paths).

How a scope is judged, and how the scope of a run and the scope of a step combine, is in [Scope](/reference/protected-paths#scope).

### Commands

A command is one form everywhere it appears: the `run` of a [command step](/reference/workflow-schema#command), the `run` of a validator you define in the project config and the tenant config, and each entry of `project.setup`. It is an array of non-empty strings, at least one. The first string is the program, and the rest are its arguments.

No shell reads the array, so no quoting, pipe or variable expansion applies. A command that needs a shell names it: `[sh, -c, "make test > out.txt"]`. A command that needs more than a line runs a script in the workspace: `[sh, scripts/check.sh]`. The working directory is the workspace root.

### validators

The `validators` section holds the project's validators you define. A validator exists only as an entry here. `validators` is a map from a validator name to its declaration. A name starts with a lowercase letter and holds lowercase letters, digits, `-` and `_`. `project`, `daggry`, `coverage`, `no_regression` and `baseline_proof` are reserved and cannot be a validator name.

A `verify` step refers to a validator of this section by its bare name. See [Validators](/reference/validators#referring-to-a-validator). A validator you define counts as evidence by default. See [Validators](/reference/validators#when-a-validator-counts-as-evidence).

The shortest declaration is `run` alone. `output` defaults to `exit-code` and `role` to `custom`.

```yaml
validators:
  review:
    run: [sh, scripts/review.sh]
```

The table lists the keys of a declared validator.

| Key | Type | Required | Meaning |
|---|---|---|---|
| `run` | command | yes | What runs. See [Commands](#commands). The files it names are protected. |
| `role` | label | no | What the validator looks at. Open vocabulary. Default `custom`. A binding names the roles of its work. See [Bindings](/reference/bindings). |
| `output` | string | no | How Daggry reads the output: `exit-code`, `document` or the name of a tool format. Default `exit-code`. See [Output formats](#output-formats). |
| `output_file` | path | no | The file the validator writes its output to, relative to the workspace root. Absent: standard output. |
| `timeout` | integer | no | 1 or more. The longest the validator can run, in seconds. One that runs longer is stopped and counts as failed. |
| `env` | array of names | no | The allow-list of environment variables the factory can pass to the validator's process. The file holds names, never values. |
| `needs.tools` | array of labels | no | The tools the validator needs in its runner, by the same labels as `project.tools`. |
| `needs.runner` | string | no | The class of runner the validator needs, by name. The factory matches the name to a runner class it offers. |
| `expose` | string | no | Who can call the validator: `factory` or `agent`. Absent means `factory`. See [Who runs a validator](#who-runs-a-validator). |

A validator that names a tool or a runner class the factory does not offer cannot run. A reader refuses the run when a validator the run uses cannot run.

### judges

The `judges` section holds the project's custom and rubric judges, as a map from a judge name to its declaration. A `verify` step names a judge in its `judges` key. The default judge, `coverage` and `no_regression` need no declaration. See [Judges](/reference/judges).

A declaration is a custom judge when it has `run`, and a rubric judge when it has `rubric` and `engine`. A declaration holds one form, never both. The table lists the keys.

| Key | Type | Required | Meaning |
|---|---|---|---|
| `run` | command | custom judge | What runs. See [Commands](#commands). The files it names are protected. Daggry writes the evidence trail to its standard input and reads a verdict body from its standard output. See [Custom judge](/reference/judges#custom-judge). |
| `timeout` | integer | no | 1 or more. The longest a custom judge can run, in seconds. |
| `criterion` | string | no | A rubric judge: a fixed criterion id of the plan. Absent: the current criterion of the enclosing loop over the plan's criteria. Absent outside such a loop, Daggry refuses the run when it starts. |
| `rubric` | path | rubric judge | The rubric file, relative to the workspace root. A person approves it, and Daggry pins its digest. |
| `engine` | string | rubric judge | The name of an engine in the tenant config. |

```yaml
judges:
  plan-size:
    run: [node, scripts/judge-plan-size.mjs]
```

For when a judge's verdict counts as evidence, see [When a judge's verdict counts](/reference/judges#when-a-judges-verdict-counts).

### Output formats

The `output` key says how Daggry reads what a validator reported. The table lists its values.

| Value | Reads | Gives |
|---|---|---|
| `exit-code` | The exit code only. This is the default. | Pass when the code is 0, fail otherwise. No findings and no metrics. |
| `document` | A [result document](#result-document), `daggry/result@1`, that the validator writes to `output_file` or to standard output. | The outcome, the findings and the metrics the document holds. |
| A tool format, such as `junit` or `sarif` | The validator's own output, in `output_file` or on standard output, through the reader for that format. | The result document the reader writes from that output. |

A tool format is a plain name. The software binding ships `junit`, `sarif`, `tap` and `libtest`. A tenant can register more under `extensions.adapters` of the [Tenant config](/reference/tenant-config#extensions), keyed by the format name. A reader for a format is a deterministic program that turns one tool's output into a result document. See [Bindings](/reference/bindings#output-formats).

These rules apply to every output format.

- The exit code is always recorded.
- Output that Daggry cannot read gives no findings. A result document that is missing, does not parse or is not valid against the schema makes the result an `error`.
- The result of every validator you define a `verify` step runs is sealed in one form: a [measurement](/reference/kinds#evidence-measurement-1) that names the validator and its `output` and holds the exit code, an outcome, the findings and the metrics.
- A format reader runs in the deterministic runner, after the validator's process has ended. It reads the validator's output and nothing else.
- A reader refuses an `output` that is not `exit-code`, `document` or a known tool format. The run is refused when it starts.

### Result document

A result document is the one standard form of a check's result. A validator you define writes it directly with `output: document`, and a format reader writes it for a tool that has a format of its own. The table lists its keys.

| Key | Type | Required | Meaning |
|---|---|---|---|
| `format` | string | yes | Always `daggry/result@1`. |
| `outcome` | string | yes | What the validator reported: `pass`, `fail` or `error`. |
| `findings` | array of objects | no | What the validator found, one finding for each thing it inspected or each thing it reports. Can be empty. |
| `findings[].id` | string | yes | The name of the finding, such as the name of a rule or of the item inspected. Non-empty. |
| `findings[].outcome` | string | yes | `pass`, `fail`, `error` or `skip`. `skip` says the validator did not inspect the item. |
| `findings[].locator` | string | no | Where the finding is. A path relative to the workspace root, a path with a position as `<path>:<line>` or `<path>:<line>:<column>`, or any other string that names a place. Non-empty. |
| `findings[].message` | string | yes | Any string, can be empty. |
| `metrics` | map | no | Numbers the validator measured, from a name to a number. A name starts with a lowercase letter and holds lowercase letters, digits and `_`. |

These rules apply to a result document.

- **The outcome is the validator's decision.** Findings and metrics explain it and do not change it.
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

The `verification` section is the default set of validators for the reference `project`: the canonical validator, the others measured with it, and the thresholds. A project has many validators and exactly one canonical validator. The table lists the keys.

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

| `read` | The number | Output formats that give it |
|---|---|---|
| `exit_code` | The exit code. | Every format. |
| `findings` | The count of findings. | `document` and every tool format. |
| `findings.pass`, `findings.fail`, `findings.error`, `findings.skip` | The count of findings with that outcome. | `document` and every tool format. |
| `metrics.<name>` | The metric of that name. | `document` and every tool format. |

These rules apply to `verification`.

- **`project` is the project's default set of validators.** A [`verify` step](/reference/workflow-schema#verify) that names `project` runs the canonical validator and each validator in `also` on a clean copy of the sealed version of the workspace. Each result is sealed as a [measurement](/reference/kinds#evidence-measurement-1) of its own.
- **A threshold is a finding.** The result of each threshold is sealed as a finding in the measurement of the validator it reads. See [Threshold findings](/reference/kinds#threshold-findings).
- **A workflow can assume it.** A workflow names `project` and holds no command and no tool. The project config supplies the command, and the factory knows how to read the result.
- **A name must exist.** A name in `canonical`, `also` or a threshold that `validators` does not hold is refused.
- **A missed threshold makes the verdict `fail`.** The verdict is `pass` when the canonical validator passes, every validator in `also` passes and every threshold holds.
- **Criterion rules need findings.** Criterion coverage and the baseline proof read the findings of the canonical validator. See [Coverage and the carry rule](/reference/conformance#coverage-and-the-carry-rule). They need a canonical validator with `output: document` or a tool format. One with `exit-code` gives a pass or a fail and covers no criterion.

A workflow whose `verify` step names `project` needs this section.

### Who runs a validator

A validator you define is declared once and is used in the two ways in the table. Only a `verify` step produces evidence.

| Use | Started by | Where it runs | Evidence |
|---|---|---|---|
| `verify` step | A `verify` step that names `project` or a validator by name. See [Referring to a validator](/reference/validators#referring-to-a-validator). | The deterministic runner, on a clean copy of the sealed version, as an unprivileged user, after any agent process has ended. | Yes: one measurement for each validator, and the verdict the control plane derives from it. |
| Preview | An agent, for a validator with `expose: agent`. | The agent's pod, on the working copy. | Never. |

`expose` says who can start a validator, with one of two values.

| Value | Meaning |
|---|---|
| `factory` | Only the factory's deterministic components call the validator. The agent cannot start it. |
| `agent` | The agent can also call the validator by name, as a preview. |

A validator with `expose: agent` can also be the canonical validator: the agent previews it, and the factory measures it.

### protect

The `protect` section holds the paths this project adds to the protected set. The always-protected paths, the default protection of the files a validator you define runs and the boundary check that enforces all of it are defined in [Protected paths](/reference/protected-paths). This section defines only the project's own additions, in one key.

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

A step that edits the file changes nothing for its own run: the edit is put back and recorded, and the validators come from the baseline. The baseline proof uses the baseline's canonical validator too. See [Baseline proof](/reference/conformance#baseline-proof).

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
    role: style
    output: document
    output_file: reports/review.json
    timeout: 300
    needs:
      tools: [pandoc-3]
  citations:
    run: [sh, scripts/check-citations.sh]
    role: citations
    output: document
    expose: agent
  links:
    run: [sh, scripts/check-links.sh]
    role: custom
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
| `review` | The canonical validator. It writes its result document to `reports/review.json`, set by `output_file`. `scripts/review-handbook.sh` is protected by default. See [What a project adds](/reference/protected-paths#what-a-project-adds). |
| `citations` | A supporting validator that runs a script. It writes its result document on standard output. The agent can run it as a preview. |
| `links` | A validator with the default `exit-code` output. It is in neither `canonical` nor `also`, so it runs only when a `verify` step names `links`. |
| `metrics.reading_grade` | A metric the `review` validator writes. The verdict is `fail` when it is above 9. |
| `findings.skip` | The count of citations the validator did not inspect. The verdict is `fail` when it is above 0. |
| `area:style` | An area reference. No step changes the house style the validators read. |
| `LINK_CHECK_TOKEN` | The name of a variable the factory can pass. The file holds no value. |
| `networked` | The name of a runner class. The factory matches it to a class it offers. |
| `acme/review` | A section defined under the namespace `acme`. A reader that does not know it ignores it and preserves it. |

### Smallest file

The smallest project config that a `verify` step can use makes one validator canonical. The validator is declared with `run` alone. It reads the exit code, and its role is `custom`.

```yaml
format: daggry/project@1
validators:
  review:
    run: [sh, scripts/review.sh]
verification:
  canonical: review
```

## Examples under the software binding

The three files in this section are for workspaces that hold programs. Each tool they name, each tool format, each `kind` and each `role` belongs to the software binding and is defined in [Bindings](/reference/bindings#the-software-binding). The standard on this page defines none of them.

### Software binding: a Node project

The canonical validator runs vitest, which writes a JUnit XML report. The `junit` format reads the report. The linter runs through an npm script that `package.json` defines. The [default protection](/reference/protected-paths#what-a-project-adds) covers the files a command names and not the files those programs read, so the file protects `package.json` itself, through an area.

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
    role: tests
    output: junit
    output_file: reports/junit.xml
    timeout: 600
    needs:
      tools: [node-22]
    expose: agent
  lint:
    run: [npm, run, lint]
    role: lint
    expose: agent
  types:
    run: [npx, tsc, --noEmit]
    role: types

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
| `junit` | An output format of the software binding. It gives one finding for each test in the report. |
| `tooling` | An area for the files the validators read. |
| `area:tooling` | An area reference. No step changes `package.json` or `vitest.config.ts`. |

### Software binding: a Rust project

`cargo test` prints one result line for each test, and the `libtest` format reads those lines from standard output, so the canonical validator needs no report file. A threshold refuses a skipped test. One entry of `protect.paths` is a glob.

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
    role: tests
    output: libtest
    timeout: 1200
  clippy:
    run: [cargo, clippy, --workspace, --, -D, warnings]
    role: lint
    expose: agent
  fmt:
    run: [cargo, fmt, --check]
    role: format
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

`dotnet test` writes a JUnit XML report through a logger that the test project references, and the `junit` format reads it. A second validator is a script that writes a result document with one metric, the share of lines the tests cover, and a threshold sets a floor on it.

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
    role: tests
    output: junit
    output_file: reports/junit.xml
    needs:
      tools: [dotnet-9]
  line-coverage:
    run: [sh, scripts/coverage-summary.sh]
    role: coverage
    output: document
    output_file: reports/coverage.json
  format:
    run: [dotnet, format, --verify-no-changes]
    role: format
    expose: agent

verification:
  canonical: test
  also: [line-coverage]
  thresholds:
    - validator: line-coverage
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

To check a file of your own, give the schema and the file to any validator that supports draft 2020-12. The schema does not check that a tool format is known: that needs the tenant config.

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
| `run: sh check.sh --all` | A string. A command is a list of strings, so `[sh, check.sh, --all]`. |
| `run: []` | A command holds at least one string, the program. |
| A declared validator with no `run` | Nothing to run. The file is refused. |
| `validators:` with a key named `project` or `daggry` | Reserved name. |
| `role: Style Review` | Not a label. |
| `output: report` where no binding ships a `report` format and the tenant registers none | Unknown format. The run is refused when it starts. |
| `output: acme/sheet` | Not a format name. A name holds lowercase letters, digits, `-` and `_`. |
| `output_file: /tmp/out.json` | Not a path relative to the workspace root. |
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

- For what a validator is, how Daggry reads its output and how a step names one, see [Validators](/reference/validators).
- For what a binding adds for one kind of work, including the output formats of the software binding, see [Bindings](/reference/bindings).
- For the tenant's side, including which workflows run on a workspace, see [Tenant config](/reference/tenant-config).
- For the always-protected paths and the boundary check, see [Protected paths](/reference/protected-paths).
- For what another factory implements to read this file, see [Conformance](/reference/conformance).
