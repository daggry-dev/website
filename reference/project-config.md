# Project config

*Reference*

Proposed standard; see the [Roadmap](/roadmap) for status.

For the idea, read [Open standards](/guide/concepts/standards) and [What an agent cannot change](/guide/concepts/protection).

The project config is one YAML file in a repository, `.daggry/project.yaml`. It describes the project itself: what it is, which areas it has, how to check it and which paths it protects. It is the deterministic interface between a project and a factory. A workflow can assume that a verification step exists, and the factory knows how to run it, whether the project uses `cargo test`, vitest, `dotnet test` or a script of its own.

The file says what exists and what is protected. It never says what a run may change: a workflow chooses the scope of each step, and the tenant or the run request chooses the scope of a run. The file also names no workflow, no agent and no approval rule. Those are the tenant's decisions. See [Tenant config](/reference/tenant-config).

This page defines the sections of the file, the checks, the result contracts and the extension rules. It is for people who set up a repository and for people who write a reader of the file.

The files on this page are illustrative. Each one is valid against the published schema. See [Validation](#validation).

## Download

The project config has a published JSON Schema (draft 2020-12).

| Schema | File |
|---|---|
| `daggry/project@1` | [daggry-project-v1.json](/schemas/daggry-project-v1.json) |

## Today

The reader of today reads the profile, `.daggry/profile.yaml`: the earlier name and the earlier form of this file. It holds one check, a test command, and nothing else.

```yaml
verify:
  test: <command>
```

| Key | Type | Required | Meaning |
|---|---|---|---|
| `verify` | block mapping | yes | The verification block. Appears once. |
| `verify.test` | string | yes | The shell line that runs the project's tests. |

A `verify` step runs `verify.test` from the base commit. The exit code is the measurement's `exit_code`, and a command that exits non-zero is a measurement, not an error. The output is read by the [`libtest-lines`](#libtest-lines) contract.

Each part of the profile has a place in the standard.

| Profile | Project config | Note |
|---|---|---|
| `.daggry/profile.yaml` | `.daggry/project.yaml` | The same folder. |
| No header. | `format: daggry/project@1` | Required. |
| `verify.test`, a shell line. | `checks.test.run` | An argument list or a script path. A line that uses shell syntax, such as a pipe, moves into a script in the repository. |
| Output is read as libtest lines. | `checks.test.result.contract: libtest-lines` | The same lines and the same records. |
| The one command is the evidence. | `verification.canonical: test` | Names the one check a `verify` step measures. |
| Other top-level keys are skipped. | A key without a namespace that this page does not define is refused. | `name: example` beside `verify` is accepted in a profile and is an error in a project config. |
| No areas and no protected paths of its own. | `areas` and `protect` | The always-protected set applies to both. See [Protected paths](/reference/protected-paths). |

A profile with `test: sh check.sh` becomes the file in [Smallest file](#smallest-file).

The profile reader accepts one fixed shape, not full YAML.

| Rule | Detail |
|---|---|
| `verify:` | Stands alone on an unindented line, once. |
| Other top-level keys | Skipped, with their indented lines, blank lines and comment lines. |
| Block under `verify:` | Holds `test:` and nothing else, once. A space follows the colon. |
| Indentation | Spaces only. A tab is refused. |
| Command | Stands on the `test:` line, as a plain scalar or in single or double quotes. |
| Quotes | No escapes. A quoted command cannot contain its own quote character. A double-quoted one cannot contain a backslash. |
| Plain command | Refused when it starts with one of ``[ { & * ! | > % @ ` #`` or contains ` #` or `: `. Put such a command in quotes. |
| Empty command | Refused. |
| Missing `verify.test` | Refused. |

A refused profile is a profile error with the message `profile: <reason>`. The `verify` step then measures nothing. A base commit with no profile file also stops the step.

| Message | Cause |
|---|---|
| `` `verify:` must be a block mapping `` | A value on the same line as `verify:`, such as `verify: {test: x}`. |
| `` `verify:` appears twice `` | A second `verify:` line. |
| `` `verify:` holds `test:` only `` | A key other than `test:` in the block. |
| `tabs are not indentation` | A tab used as indentation. |
| ``profile: no `verify.test` `` | The block has no `test:`. |

## The standard

### Layout

A project config has three parts.

| Part | Keys | Rule |
|---|---|---|
| Header | `format` | Required. Names the standard and its major version. |
| Sections | `project`, `areas`, `checks`, `verification`, `protect` | Each is optional. Each appears at most once. |
| Extensions | `<namespace>/<key>` | Any number. See [Extension keys](#extension-keys). |

Each section answers one question a factory asks about a repository.

| Section | Question |
|---|---|
| `project` | What is this project, and how is it built? |
| `areas` | Which parts does the repository have? |
| `checks` | What can run and decide something about it? |
| `verification` | Which check is the evidence? |
| `protect` | Which paths does the project add to the protected set? |

Every object is closed: a key that is not listed on this page and is not an extension key is refused.

### Header

| Key | Type | Required | Meaning |
|---|---|---|---|
| `format` | string | yes | Always `daggry/project@1`. |

`format` follows the form `<namespace>/<name>@<major>`, the same form as an artifact kind. A reader refuses a missing `format`, a malformed one and a major version it does not know. A breaking change to the layout is a new major.

### project

The project's identity and toolchain. A factory reads this section to orient and to prepare a copy of the repository. It names no path group: the parts of the repository are in [`areas`](#areas).

| Key | Type | Required | Meaning |
|---|---|---|---|
| `project.name` | string | no | The project's name. Non-empty. |
| `project.languages` | array of labels | no | The languages the project is written in, for example `rust` or `typescript`. |
| `project.toolchains` | array of labels | no | The toolchains the project is built with, for example `rust-1.90` or `node-22`. |
| `project.setup` | array of commands | no | Commands that prepare a fresh copy of the repository, in order, such as installing dependencies. |
| `project.build` | array of commands | no | Commands that build the project, in order. |
| `project.entry_points` | array of paths | no | The files a reader starts from, such as a main source file. |

A label is a short name made of ASCII letters, digits, `.`, `_` and `-`. Labels are an open vocabulary. A reader that does not know a label keeps it and applies nothing.

A command has the form defined in [Commands](#commands). On a clean copy, a reader runs `project.setup` and then `project.build` before the first check.

### areas

The parts of the repository. An area is a named group of paths. `areas` is a map from an area name to an area, and it is the only place in the four standards that gives a group of paths a name. A name follows the rule for a [check name](#checks).

| Key | Type | Required | Meaning |
|---|---|---|---|
| `paths` | array of globs | yes | The paths the area holds. At least one glob, each non-empty. |
| `role` | label | no | What the paths are for. Open vocabulary. The recommended set is `source`, `tests`, `docs`, `config`, `generated`, `vendor` and `infrastructure`. |
| `description` | string | no | One or two sentences for a reader, person or agent. Non-empty. |

An area has three uses. Each one refers to the area by its name.

| Use | Who names the area | Effect | Defined in |
|---|---|---|---|
| Orient | Nobody. The factory reads every name, `role` and `description`. | None. An area on its own grants and limits nothing. | This section. |
| Scope | A workflow step, in `scope`, as `area:<name>`. | The step may change only the paths its scope holds. | [Areas by name](/reference/workflow-schema#areas-by-name) |
| Scope | The tenant, in `projects[].areas`, or a run request. | The run may change only paths inside the named areas. | [projects](/reference/tenant-config#projects) |
| Protect | The project, in `protect.paths`, as `area:<name>`. | No step may change a path the area holds. | [protect](#protect) |

Rules:

- **The project names, others choose.** The project says which areas exist. It never says which of them a run may change. A workflow chooses the scope of a step, and the tenant or the run request chooses the scope of a run.
- **A name must exist.** A step, a tenant entry, a run request or a `protect.paths` entry that names an area this section lacks is refused. For the first three the run is refused when it starts.
- **Areas may overlap.** A path can be in more than one area, for example in one with `role: source` and one with `role: tests`. A path is inside a scope when at least one named area holds it, and it is protected when at least one protected area holds it.
- **A path in no area** is outside the scope of every run that names areas.
- **A role is a label.** A reader that does not know a role keeps it and applies nothing. `role: tests` does not freeze a path. Frozen tests come from a step's `tests` key. See [Frozen tests](/reference/protected-paths#frozen-tests).

How a scope is judged, and how the scope of a run and the scope of a step combine, is in [Scope](/reference/protected-paths#scope).

### Commands

A command is written in one of two forms. Neither is a shell line.

| Form | YAML | Meaning |
|---|---|---|
| Argument list | An array of non-empty strings, at least one. | The first string is the program, and the rest are its arguments. No shell reads them, so no quoting, pipe or variable expansion applies. |
| Script path | One string with no whitespace. | The path of a script in the repository, relative to the repository root. The reader runs the file with no arguments. |

A path is never absolute and never holds `..`. The working directory is the repository root. A command that needs a pipe or a loop is a script in the repository.

### checks

The things that can run and decide something about the project: tests, a linter, a type checker, a build, a coverage report, a security scan or a script of the project's own. `checks` is a map from a check name to a check. A name starts with a lowercase letter and holds lowercase letters, digits, `-` and `_`.

Tests are one kind of check among several. Any deterministic program that the project can run is a check.

| Key | Type | Required | Meaning |
|---|---|---|---|
| `run` | command | yes | What runs. See [Commands](#commands). |
| `kind` | string | yes | What kind of result the check gives. Open vocabulary. The recommended set is `tests`, `lint`, `format`, `types`, `build`, `coverage`, `security` and `custom`. |
| `result` | object | no | How the output is read. Absent means `contract: exit-code`. See [Result contracts](#result-contracts). |
| `timeout` | integer | no | 1 or more. The longest the check may run, in seconds. A check that runs longer is stopped and counts as failed. |
| `env` | array of names | no | The allow-list of environment variables the factory may pass to the check's process. The file holds names, never values. |
| `needs.toolchains` | array of labels | no | The toolchains the check needs in its runner, by the same labels as `project.toolchains`. |
| `needs.runner` | string | no | The class of runner the check needs, by name. The factory matches the name to a runner class it offers. |
| `expose` | string | no | Who may call the check: `factory` or `agent`. Absent means `factory`. See [Who runs a check](#who-runs-a-check). |

A check that names a toolchain or a runner class the factory does not offer cannot run. A reader refuses the run when the canonical check cannot run.

### Result contracts

A result contract names the published format of a check's output and the parser that reads it. The contract is what makes a check deterministic to a factory: the same output always gives the same records.

| Key | Type | Required | Meaning |
|---|---|---|---|
| `result.contract` | string | yes | One of the names below, or `<namespace>/<name>` for a contract another party defines. |
| `result.path` | path | for `junit-xml` | The file the check writes its report to, relative to the repository root. |
| `result.schema` | string | for `json` | The URL of the JSON Schema the output follows. |

| Contract | Reads | Gives |
|---|---|---|
| `exit-code` | The exit code only. | Pass when the code is 0, fail otherwise. No per-item records. |
| `libtest-lines` | Standard output and standard error, by the rules in [libtest-lines](#libtest-lines). | One record per test: passed, failed or ignored. |
| `junit-xml` | The JUnit XML report at `result.path`. | One record per `testcase` element: passed, failed, or ignored when skipped. |
| `tap` | Standard output, as Test Anything Protocol version 13 or 14. | One record per test point: passed for `ok`, failed for `not ok`, ignored for a `SKIP` directive. |
| `sarif` | A SARIF 2.1.0 document at `result.path`, or on standard output when no path is given. | One finding per result, with its rule, level and location. |
| `json` | A JSON document at `result.path`, or on standard output when no path is given. | The document, once it is valid against `result.schema`. |

Rules for every contract:

- The exit code is always recorded, whatever the contract.
- Output that does not follow the contract gives no records. A report that is missing or does not parse makes the check fail.
- A reader refuses a contract it has no parser for. An extension contract is `<namespace>/<name>`, and the party that owns the namespace publishes its format.
- The three test contracts, `libtest-lines`, `junit-xml` and `tap`, give the same per-test records. A record's name is the test's name in the report.

#### libtest-lines

The reader keeps one record for each result line that the check prints to standard output or standard error. The format is the one that Rust's test harness prints, so `cargo test` works with no change. Any other program can print the same lines.

| Line | Record |
|---|---|
| `test <name> ... ok` | A passed test called `<name>`. |
| `test <name> ... FAILED` | A failed test. |
| `test <name> ... ignored` or `test <name> ... ignored, <reason>` | An ignored test. |

The reader skips every other line, such as headers, summaries and log output. It drops a ` - should panic` suffix from a name. It also skips the lines between a line that reads `failures:` and the next line that starts with `test result:`, because a failed test prints its captured output there.

The exit code and the records are independent: a check that exits non-zero and prints `ok` lines for some tests still gives passed records for those tests.

What the records prove, such as which plan criterion a test covers, is defined in [Coverage and the carry rule](/reference/kinds#coverage-and-the-carry-rule) and [Red proof](/reference/kinds#red-proof).

To use a test runner that prints another format, choose another contract, or wrap the runner in a script that prints the lines above. This script is illustrative. It runs each test file under `tests/`, prints one result line for it and exits non-zero if any test failed. A test file name carries the criterion id, for example `tests/c1-expired-token.sh`.

```sh
#!/bin/sh
# check.sh: print one libtest-style line per test file.
status=0
for t in tests/*.sh; do
  name=$(basename "$t" .sh)
  if sh "$t" >/dev/null 2>&1; then
    echo "test $name ... ok"
  else
    echo "test $name ... FAILED"
    status=1
  fi
done
exit $status
```

### verification

Which check is the evidence. A project has many checks and exactly one canonical check.

| Key | Type | Required | Meaning |
|---|---|---|---|
| `verification.canonical` | check name | yes, when `verification` is present | The one check whose result is the verification evidence. |
| `verification.also` | array of check names | no | Checks that are measured with the canonical check, as supporting evidence. No name appears twice, and none is the canonical check. |
| `verification.thresholds` | array of objects | no | Limits on numbers that the measured checks give. |
| `verification.thresholds[].check` | check name | yes | The canonical check or a check in `also`. |
| `verification.thresholds[].read` | string | yes | The number to read. See the table below. |
| `verification.thresholds[].min` | number | one of the two | The lowest value that passes. |
| `verification.thresholds[].max` | number | one of the two | The highest value that passes. |

What `read` can name depends on the check's result contract.

| Contract | `read` values |
|---|---|
| `exit-code` | `exit_code`. |
| `libtest-lines`, `junit-xml`, `tap` | `passed`, `failed`, `ignored`: the count of records with that outcome. |
| `sarif` | `findings`: the count of results. `errors`, `warnings`: the count at that level. |
| `json` | A JSON Pointer to a number in the document, such as `/total/lines/pct`. |

Rules:

- **The canonical check is the measurement.** A [`verify` step](/reference/workflow-schema#verify) has no command of its own. It runs the canonical check on a clean copy of the sealed commit, and the result is sealed as a [measurement](/reference/kinds#evidence-measurement-1).
- **A workflow can assume it.** A workflow says `kind: verify` and names no command and no language. The project config supplies the command, and the factory knows how to read the result.
- **A name must exist.** A name in `canonical`, `also` or a threshold that `checks` does not hold is refused.
- **A missed threshold fails verification.** The verification is green when the canonical check passes, every check in `also` passes and every threshold holds.
- **Test rules need test records.** Criterion coverage and the red proof read per-test records. See [Coverage and the carry rule](/reference/kinds#coverage-and-the-carry-rule). They need a canonical check with a test contract. A canonical check with `exit-code` gives a pass or a fail and covers no criterion.

A workflow with a `verify` step needs this section.

### Who runs a check

A check is declared once and can be used in four ways. Only the first two produce evidence.

| Use | Started by | Where it runs | Evidence |
|---|---|---|---|
| Canonical | A `verify` step. | The deterministic runner, on a clean copy of the sealed commit, after any agent process has ended. | Yes. This is the verification evidence. |
| Supporting | The same `verify` step, for each check in `verification.also`. | The same place. | Yes, as supporting evidence beside the canonical result. |
| Optional run | A workflow step that calls the check by name. See [Checks by name](/reference/workflow-schema#checks-by-name). | The deterministic runner, on a clean copy. | No. The result decides the step and is not the verification evidence. |
| Preview | An agent, for a check with `expose: agent`. | The agent's pod, on the working tree. | Never. |

`expose` says who may start a check.

| Value | Meaning |
|---|---|
| `factory` | Only the factory's deterministic components call the check. The agent cannot start it. |
| `agent` | The agent may also call the check by name, as a preview. |

A preview gives the agent fast feedback, for example the lint findings before it hands in its change. A preview is never evidence, because it runs where the agent can write. The factory measures the same check again on a clean copy when the result counts.

Every check is available to the factory. A check with `expose: agent` can also be the canonical check: the agent previews it, and the factory measures it.

### protect

The paths this project adds to the protected set. The always-protected paths, the default protection of the scripts a check runs and the boundary check that enforces all of it are defined in [Protected paths](/reference/protected-paths). This section defines only the project's own additions.

| Key | Type | Required | Meaning |
|---|---|---|---|
| `protect.paths` | array of entries | no | Each entry is a glob or an area reference, `area:<name>`. Added to the protected set for every run on this repository. |

Rules:

- **An entry that starts with `area:` is an area reference.** It protects every path the area holds. A name that [`areas`](#areas) lacks is refused. Every other entry is a glob.
- **This section only adds.** No key removes a path from the protected set.
- **A protected path is in no scope.** A step whose scope names an area does not change the area's protected paths.

### Extension keys

An extension key carries a section or a value that the standard does not define.

| Rule | Detail |
|---|---|
| Form | `<namespace>/<key>`. Pattern `^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$`. |
| Namespace | Names the party that defines the key. One party owns every key under its namespace. It is the same form as a key of the envelope's [meta](/reference/envelope#meta). |
| Place | At the top level and inside any section object, including a check. |
| Value | Any YAML value in the strict subset. |
| A reader that knows the key | Applies it. |
| A reader that does not know the key | Ignores the value and preserves it: a tool that rewrites the file writes the key back unchanged. |
| A key without a namespace | Refused, unless this page defines it. |
| Limit | An extension narrows or adds. It never widens a rule of the standard, the project or the tenant, and never changes the meaning of a key this page defines. |

A misspelt standard key is therefore an error, and a key in a namespace the reader does not know is not.

### YAML subset

The file uses the same strict subset of YAML as a workflow file: no anchors, aliases, tags or merge keys, and no duplicate mapping key. See [YAML subset](/reference/workflow-schema#yaml-subset).

### Where it lives

| Rule | Detail |
|---|---|
| Folder | `.daggry/` in the repository. |
| Path | `.daggry/project.yaml`. |
| Read from | The base commit: the commit a run starts from. Never the head or the working tree. |
| Protected | `.daggry/**` is always protected, so no step and no grant changes the file. See [Protected paths](/reference/protected-paths). |
| Changed by | A pull request that a person merges. The change takes effect in the next run after the merge. |

A step that edits the file changes nothing for its own run: the edit is put back and recorded, and the checks come from the base commit. The red proof uses the base commit's canonical check too. See [Red proof](/reference/kinds#red-proof).

### Precedence

Three documents set rules for a run: the tenant config, the project config and the workflow. The tenant's rule wins over the project's, and the project's wins over the workflow's. The full table is in [Precedence](/reference/tenant-config#precedence).

The project config describes the repository: its areas, its checks, its canonical check and the paths it protects. It never chooses a workflow, an engine, an approval rule or the scope of a run, and it never widens a tenant rule.

## Worked examples

### A Node project with vitest

The canonical check runs vitest and writes a JUnit XML report. The linter runs through an npm script that `package.json` defines. The [default protection](/reference/protected-paths#what-a-project-adds) covers the files a command names and not the files those programs read, so the file protects `package.json` itself, through an area.

```yaml
format: daggry/project@1

project:
  name: shop-web
  languages: [typescript]
  toolchains: [node-22]
  setup:
    - [npm, ci]
  build:
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

checks:
  test:
    run: [npx, vitest, run, --reporter=junit, --outputFile=reports/junit.xml]
    kind: tests
    result:
      contract: junit-xml
      path: reports/junit.xml
    timeout: 600
    needs:
      toolchains: [node-22]
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

| Value | Meaning |
|---|---|
| `app`, `tests` | Two areas that overlap: a test file under `src/` is in both. |
| `tooling` | An area for the files the checks read. |
| `area:tooling` | An area reference. No step changes `package.json` or `vitest.config.ts`. |

### A Rust project

`cargo test` prints libtest lines, so the canonical check needs no report file. One entry of `protect.paths` is a glob.

```yaml
format: daggry/project@1

project:
  name: shop-core
  languages: [rust]
  toolchains: [rust-1.90]
  build:
    - [cargo, build, --workspace]

checks:
  test:
    run: [cargo, test, --workspace]
    kind: tests
    result:
      contract: libtest-lines
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
    - check: test
      read: ignored
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

### A .NET project

`dotnet test` writes a JUnit XML report through a logger that the test project references. A second check reads a coverage summary as JSON and sets a threshold on it.

```yaml
format: daggry/project@1

project:
  name: shop-api
  languages: [csharp]
  toolchains: [dotnet-9]
  setup:
    - [dotnet, restore]
  build:
    - [dotnet, build, --no-restore]
  entry_points: [src/Shop.Api/Program.cs]

checks:
  test:
    run: [dotnet, test, --no-build, --logger, "junit;LogFilePath=reports/junit.xml"]
    kind: tests
    result:
      contract: junit-xml
      path: reports/junit.xml
    needs:
      toolchains: [dotnet-9]
  coverage:
    run: scripts/coverage-summary.sh
    kind: coverage
    result:
      contract: json
      path: reports/coverage.json
      schema: https://example.com/schemas/coverage-summary-v1.json
  format:
    run: [dotnet, format, --verify-no-changes]
    kind: format
    expose: agent

verification:
  canonical: test
  also: [coverage]
  thresholds:
    - check: coverage
      read: /total/lines/pct
      min: 80

areas:
  api:
    paths: ["src/Shop.Api/**"]
    role: source
  tests:
    paths: ["tests/**"]
    role: tests
```

### A custom lint script and a custom verifier

This repository holds documents, not a program. Its canonical check is a script of its own that prints one TAP test point for each rule it verifies. A second script lints the prose, and the agent may preview it. A scan needs a variable from the factory and a runner that reaches the network. The file carries one extension key.

```yaml
format: daggry/project@1

project:
  name: handbook

checks:
  verify:
    run: [sh, scripts/verify-handbook.sh]
    kind: custom
    result:
      contract: tap
    timeout: 300
  prose:
    run: scripts/lint-prose.sh
    kind: lint
    expose: agent
  links:
    run: [node, scripts/check-links.mjs, --report, reports/links.sarif]
    kind: custom
    result:
      contract: sarif
      path: reports/links.sarif
    env: [LINK_CHECK_TOKEN]
    needs:
      runner: networked

verification:
  canonical: verify
  also: [prose]

areas:
  handbook:
    paths: ["handbook/**"]
    role: docs
    description: One page for each policy. Each page is one Markdown file.

acme/review:
  owner: docs-team
```

| Value | Meaning |
|---|---|
| `verify` | The canonical check. `scripts/verify-handbook.sh` is protected by default. See [What a project adds](/reference/protected-paths#what-a-project-adds). |
| `prose` | A custom lint script, given as a script path. The agent may run it as a preview. |
| `links` | An optional run. It is in neither `canonical` nor `also`, so it runs only when a workflow step calls it by name. |
| `LINK_CHECK_TOKEN` | The name of a variable the factory may pass. The file holds no value. |
| `networked` | The name of a runner class. The factory matches it to a class it offers. |
| `acme/review` | A section defined under the namespace `acme`. A reader that does not know it ignores it and preserves it. |

### Smallest file

The smallest project config that a `verify` step can use names one check and makes it canonical.

```yaml
format: daggry/project@1
checks:
  test:
    run: [sh, check.sh]
    kind: tests
    result:
      contract: libtest-lines
verification:
  canonical: test
```

## Validation

Every YAML example on this page was checked against [daggry-project-v1.json](/schemas/daggry-project-v1.json) with a draft 2020-12 validator, and each one is valid. The rules that a schema cannot state were checked too: every name in `canonical`, `also` and a threshold is a check in the same file, and every area reference in `protect.paths` names an area in the same file.

To check a file of your own, give the schema and the file to any validator that supports draft 2020-12.

## Examples a reader refuses

| Input | Refusal |
|---|---|
| No `format` key | Missing `format`. |
| `format: daggry/project@2` | Unknown major. |
| `cheks:` at the top level | Unknown key without a namespace: a misspelt `checks`. |
| `workflows:` at the top level | Unknown key without a namespace. A project does not choose workflows. |
| `layout:` in `project` | Unknown key. A path group is an area, in the top-level `areas` section. |
| `scope:` at the top level | Unknown key without a namespace. A project names its areas, and a workflow or the tenant chooses a scope. |
| `areas:` with `app: ["src/**"]` | Not an object. The globs go in `paths`. |
| An area with no `paths`, or with `paths: []` | An area holds at least one glob. |
| `protect.paths` with `area:web` where `areas` holds no `web` | No such area. |
| `protect.paths` with `area:Web App` | Not an area name. |
| `run: cargo test --workspace` | A shell line. A command is an argument list or one script path. |
| `run: /usr/local/bin/check` | An absolute path. |
| A check with no `kind` | Missing `kind`. |
| `result:` with `contract: junit-xml` and no `path` | `junit-xml` needs `result.path`. |
| `result:` with `contract: json` and no `schema` | `json` needs `result.schema`. |
| `expose: everyone` | Not `factory` or `agent`. |
| `env:` with `TOKEN=abc` | Not a variable name. The file holds names, never values. |
| `verification:` with no `canonical` | Missing `canonical`. |
| `canonical: tests` where `checks` holds `test` | No such check. |
| `canonical:` with a list of two names | One check is canonical. The others go in `also`. |
| A threshold with neither `min` nor `max` | A threshold needs a limit. |

## Open points

The standard leaves these points open. Each one is listed on the [Roadmap](/roadmap).

- **Records for contracts other than tests.** A [measurement](/reference/kinds#evidence-measurement-1) holds an exit code and per-test records. The record that carries the findings of `sarif` or the document of `json` is not defined yet.
- **Records for supporting checks and thresholds.** How the results of `verification.also` and of each threshold are sealed beside the canonical measurement is not defined yet.
- **Facts for a gate.** Which derived facts a gate reads from a check other than the canonical one is not defined yet.
- **Areas in a run request.** The key by which a run request names areas is not defined yet.
- **Areas in the run lock.** How an area reference and the scope of a run are written into the boundary rules of a [run lock](/reference/kinds#daggry-run-lock-1) is not defined yet.

## Next steps

- For the tenant's side, including which workflows run on a repository, see [Tenant config](/reference/tenant-config).
- For the always-protected paths and the boundary check, see [Protected paths](/reference/protected-paths).
- For what another factory implements to read this file, see [Conformance](/reference/conformance).
