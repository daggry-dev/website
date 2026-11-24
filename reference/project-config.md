# Project config

*Reference*

Proposed standard; see the [Roadmap](/roadmap) for status.

For the idea, read [Open standards](/guide/concepts/standards) and [What an agent cannot change](/guide/concepts/protection).

The project config is one YAML file in a repository. It describes the project itself: what it is, how to check it, which areas it has and what an agent may never write. It is the deterministic interface between a project and a factory. A workflow can assume that a verification step exists, and the factory knows how to run it, whether the project uses `cargo test`, vitest, `dotnet test` or a script of its own.

The file says nothing about the factory. A project does not know which workflows run on it, which agents work on it or where a person must approve. Those are the tenant's decisions. See [Tenant config](/reference/tenant-config).

This page defines the standard layout, the checks, the result contracts and the extension rules. It is for people who set up a repository and for people who write a reader of the file.

The files on this page are illustrative. Each one is valid against the published schema. See [Validation](#validation).

## Download

The project config has a published JSON Schema (draft 2020-12).

| Schema | File |
|---|---|
| `daggry/project@1` | [daggry-project-v1.json](/schemas/daggry-project-v1.json) |

## Today

The file that is read today is the [Project profile](/reference/profile), `.daggry/profile.yaml`. It holds one key, `verify.test`, and has no `format` header. Its reader, its output contract and its refusal messages are defined on that page and are unchanged by this one.

The standard below generalises the profile. See [Relation to the profile](#relation-to-the-profile).

## The standard

### Layout

A project config has three parts.

| Part | Keys | Rule |
|---|---|---|
| Header | `format` | Required. Names the standard and its major version. |
| Sections | `project`, `checks`, `verification`, `scope`, `protect` | Each is optional. Each appears at most once. |
| Extensions | `<namespace>/<key>` | Any number. See [Extension keys](#extension-keys). |

Each section answers one question a factory asks about a repository.

| Section | Question | Verb |
|---|---|---|
| `project` | What is this project? | Orient |
| `checks` | What can run and decide something about it? | Verify |
| `verification` | Which check is the evidence? | Verify |
| `scope` | Which areas does it have? | Scope |
| `protect` | What may an agent never write? | Protect |

Every object is closed: a key that is not listed on this page and is not an extension key is refused.

### Header

| Key | Type | Required | Meaning |
|---|---|---|---|
| `format` | string | yes | Always `daggry/project@1`. |

`format` follows the form `<namespace>/<name>@<major>`, the same form as an artifact kind. A reader refuses a missing `format`, a malformed one and a major version it does not know. A breaking change to the layout is a new major.

### project

What the project is. A factory reads this section to orient, and it grants and limits nothing.

| Key | Type | Required | Meaning |
|---|---|---|---|
| `project.name` | string | no | The project's name. Non-empty. |
| `project.languages` | array of labels | no | The languages the project is written in, for example `rust` or `typescript`. |
| `project.toolchains` | array of labels | no | The toolchains the project is built with, for example `rust-1.90` or `node-22`. |
| `project.layout` | map from a label to an array of globs | no | Hints about where things are, for example `source`, `tests` and `docs`. |
| `project.setup` | array of commands | no | Commands that prepare a fresh copy of the repository, in order, such as installing dependencies. |
| `project.build` | array of commands | no | Commands that build the project, in order. |
| `project.entry_points` | array of paths | no | The files a reader starts from, such as a main source file. |

A label is a short name made of ASCII letters, digits, `.`, `_` and `-`. Labels are an open vocabulary. A reader that does not know a label keeps it and applies nothing.

A command has the form defined in [Commands](#commands). On a clean copy, a reader runs `project.setup` and then `project.build` before the first check.

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
| `libtest-lines` | Standard output and standard error, by the rules in [Output contract](/reference/profile#output-contract). | One record per test: passed, failed or ignored. |
| `junit-xml` | The JUnit XML report at `result.path`. | One record per `testcase` element: passed, failed, or ignored when skipped. |
| `tap` | Standard output, as Test Anything Protocol version 13 or 14. | One record per test point: passed for `ok`, failed for `not ok`, ignored for a `SKIP` directive. |
| `sarif` | A SARIF 2.1.0 document at `result.path`, or on standard output when no path is given. | One finding per result, with its rule, level and location. |
| `json` | A JSON document at `result.path`, or on standard output when no path is given. | The document, once it is valid against `result.schema`. |

Rules for every contract:

- The exit code is always recorded, whatever the contract.
- Output that does not follow the contract gives no records. A report that is missing or does not parse makes the check fail.
- A reader refuses a contract it has no parser for. An extension contract is `<namespace>/<name>`, and the party that owns the namespace publishes its format.
- The three test contracts, `libtest-lines`, `junit-xml` and `tap`, give the same per-test records. A record's name is the test's name in the report.

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

### scope

The areas of the repository. An area is a named group of paths. A factory orients by areas and can limit a run to some of them.

| Key | Type | Required | Meaning |
|---|---|---|---|
| `scope.areas` | map from an area name to an array of globs | no | The areas. A name follows the rule for a check name. Each glob is non-empty. |

The project only names its areas. The tenant decides whether a run is limited to some of them, in `projects[].areas` of the [Tenant config](/reference/tenant-config#projects). A step's own `scope` applies inside that limit, with the meanings in [Scope](/reference/workflow-schema#scope). A path that no area holds is outside every limit that names areas.

### protect

Paths that no step may write, in addition to the always-protected set in [Protected paths](/reference/protected-paths).

| Key | Type | Required | Meaning |
|---|---|---|---|
| `protect.paths` | array of glob strings | no | Each non-empty. Added to the protected set for every run on this repository. |

Two things are protected by default, with no entry in `protect.paths`:

- **The config file itself.** `.daggry/**` is always protected, so no step writes `.daggry/project.yaml`.
- **The scripts a check runs.** Every string in a command of `checks`, `project.setup` or `project.build` that is the path of a file in the base commit is a protected path. With `run: scripts/lint-docs.sh` the script is protected, and with `run: [node, scripts/verify.mjs]` so is `scripts/verify.mjs`.

The default covers the files a command names, not the files those programs read. A command such as `[npm, run, lint]` runs a script that `package.json` defines, and `package.json` is not protected by default. Either list such a file in `protect.paths`, or name the tool and its arguments in `run`.

This section only adds. No key removes a path from the protected set.

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
| Protected | `.daggry/**` is a protected path, so no step and no grant writes the file. |
| Changed by | A pull request that a person merges. The change takes effect in the next run after the merge. |

An agent's edit to the file changes nothing for its own run, for the reasons in [Where it is read from](/reference/profile#where-it-is-read-from).

### Precedence

Three documents set rules for a run: the tenant config, the project config and the workflow. The tenant's rule wins over the project's, and the project's wins over the workflow's.

| Document | May | May not |
|---|---|---|
| [Tenant config](/reference/tenant-config) | Set every limit, and decide which workflows run on which repository. | - |
| Project config | Describe the repository: its checks, its canonical check, its areas and its protected paths. | Choose a workflow, an engine or an approval rule. Widen a tenant rule. |
| [Workflow](/reference/workflow-schema) | Narrow further: a step's scope inside the limit, and a check called by name. | Replace the canonical check. Widen a project or tenant rule. |

Only a person widens a rule: by changing the tenant config, by merging a change to the project config, or by a grant such as [unfreeze](/reference/protected-paths#unfreeze-grant).

## Worked examples

### A Node project with vitest

The canonical check runs vitest and writes a JUnit XML report. The linter runs through an npm script, so the file protects `package.json`.

```yaml
format: daggry/project@1

project:
  name: shop-web
  languages: [typescript]
  toolchains: [node-22]
  layout:
    source: ["src/**"]
    tests: ["src/**/*.test.ts"]
  setup:
    - [npm, ci]
  build:
    - [npm, run, build]
  entry_points: [src/main.ts]

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

scope:
  areas:
    app: ["src/**"]
    docs: ["docs/**"]

protect:
  paths:
    - "package.json"
    - "vitest.config.ts"
```

### A Rust project

`cargo test` prints libtest lines, so the canonical check needs no report file. This is the shape that matches a profile of today.

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

scope:
  areas:
    crates: ["crates/**", "Cargo.*"]
    docs: ["docs/**"]

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

scope:
  areas:
    api: ["src/Shop.Api/**"]
    tests: ["tests/**"]
```

### A custom lint script and a custom verifier

This repository holds documents, not a program. Its canonical check is a script of its own that prints one TAP test point for each rule it verifies. A second script lints the prose, and the agent may preview it. A scan needs a variable from the factory and a runner that reaches the network. The file carries one extension key.

```yaml
format: daggry/project@1

project:
  name: handbook
  layout:
    docs: ["handbook/**"]

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

scope:
  areas:
    handbook: ["handbook/**"]

acme/review:
  owner: docs-team
```

| Value | Meaning |
|---|---|
| `verify` | The canonical check. `scripts/verify-handbook.sh` is protected by default. |
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

Every YAML example on this page was checked against [daggry-project-v1.json](/schemas/daggry-project-v1.json) with a draft 2020-12 validator, and each one is valid. The rules that a schema cannot state were checked too: every name in `canonical`, `also` and a threshold is a check in the same file.

To check a file of your own, give the schema and the file to any validator that supports draft 2020-12.

## Examples a reader refuses

| Input | Refusal |
|---|---|
| No `format` key | Missing `format`. |
| `format: daggry/project@2` | Unknown major. |
| `cheks:` at the top level | Unknown key without a namespace: a misspelt `checks`. |
| `workflows:` at the top level | Unknown key without a namespace. A project does not choose workflows. |
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

## Relation to the profile

The profile is one check with the `libtest-lines` contract, made canonical, in a file of its own.

| Point | Profile | Project config |
|---|---|---|
| Path | `.daggry/profile.yaml` | `.daggry/project.yaml` |
| Header | None. | `format: daggry/project@1` |
| The command | `verify.test`, a shell line. | `checks.test.run`, an argument list or a script path. |
| How output is read | [Output contract](/reference/profile#output-contract) | `result.contract: libtest-lines`, the same contract. |
| Which check is the evidence | The one command. | `verification.canonical: test` |
| Other top-level keys | Skipped. | Refused, unless a section of this page or an extension key. |
| Read from | The base commit. | The base commit. |

To move from a profile to a project config, write the command as an argument list. A profile with `test: sh check.sh` becomes the file in [Smallest file](#smallest-file). A command that uses shell syntax moves into a script in the repository.

## Next steps

- For the tenant's side, including which workflows run on a repository, see [Tenant config](/reference/tenant-config).
- For the lines of the `libtest-lines` contract, see [Project profile](/reference/profile).
- For what another factory implements to read this file, see [Conformance](/reference/conformance).
