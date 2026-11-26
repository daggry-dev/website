# Project config

*Reference*

The project config is one YAML file in the workspace, `.daggry/project.yaml`. It says what is true of one project: its areas, its validators and judges, its own personas and the paths no agent can change. Read this page to look up a key. To write your first file, follow [Set up a project](/guide/how-to/set-up-a-project).

Daggry uses only what this file names. It never finds a script or a path by its folder or its file name. A run reads the file from the baseline, the version of the workspace the run starts from, and pins what it read in the run lock, the first record of the run. The evidence trail therefore shows which validators, judges and personas a run ran under, and an agent's edit to the file changes nothing for its own run.

The files on this page are illustrative.

<ProjectConfigMap />

The diagram pairs the sections of the file with what each gives a run.

## The file

The smallest file that a `verify` step can use declares one validator and makes it the canonical validator.

```yaml
format: daggry/project@1
validators:
  review:
    run: [sh, scripts/review.sh]
verification:
  canonical: review
```

The table lists the keys of the file. Only `format` is required.

| Key | What it holds |
|---|---|
| `format` | Always `daggry/project@1`. |
| [`project`](#project) | The project's name and what a copy of the workspace needs. |
| [`areas`](#areas) | Named groups of paths. |
| [`personas`](#personas) | Personas of the project's own. |
| [`validators`](#validators) | The commands that measure the work. |
| [`judges`](#judges) | Judges of the project's own. |
| [`verification`](#verification) | Which validators the name `project` stands for, and thresholds. |
| [`protect`](#protect) | Paths the project adds to the protected set. |

The file holds no workflow and no approval rule, and it never says what a run can change. The tenant decides those. See [Tenant config](/reference/tenant-config). Every object is closed: a key this page does not define is refused, unless it is an [extension key](/reference/open-formats#extension-keys). The file uses the strict [YAML subset](/reference/workflow-rules#yaml-subset).

## project

The `project` section says what a fresh copy of the workspace needs before a validator can run. The table lists its keys.

| Key | Type | Meaning |
|---|---|---|
| `project.name` | string | The project's name. |
| `project.tools` | array of labels | The tools a copy needs, such as `node-22` or `pandoc-3`. |
| `project.setup` | array of commands | Commands that prepare a fresh copy, in order. Daggry runs them before the first validator. |
| `project.entry_points` | array of paths | The files a reader starts from. |

A label is a short name of ASCII letters, digits, `.`, `_` and `-`. Labels are an open list: Daggry keeps a label it does not know and applies nothing.

## areas

An area gives a group of paths a name, so a workflow and the tenant can refer to a part of the project without knowing its paths. `areas` is a map from an area name to an area. The table lists the keys of an area.

| Key | Type | Required | Meaning |
|---|---|---|---|
| `paths` | array of globs | yes | The paths the area holds. At least one. |
| `role` | label | no | What the paths are for, such as `source`, `tests`, `docs`, `config`, `generated` or `vendor`. |
| `description` | string | no | One or two sentences for a reader, person or agent. |

An area on its own grants and limits nothing. The table lists who uses an area name.

| Who | Where | Effect |
|---|---|---|
| A workflow step | `scope`, as `area:<name>`. See [Scope](/reference/workflow-schema#scope). | The step can write only the paths its scope holds. |
| The tenant | `projects.<workspace>.areas`. See [projects](/reference/tenant-config#projects). | A run can change only paths inside the named areas. |
| The project | `protect.paths`, as `area:<name>`. See [protect](#protect). | No step can change a path the area holds. |

Areas can overlap. A name that this section lacks is refused: for a step or the tenant, the run is refused when it starts.

## personas

A persona is a named agent: an engine and the instructions it works under. An `agent` step names a persona, and the workflow holds no instructions. Most personas are the tenant's, shared by every project. Declare one here when this project needs a persona of its own, or its own version of a tenant persona. See [personas](/reference/tenant-config#personas) in the tenant config.

```yaml
personas:
  writer:
    description: Writes handbook pages in the house style.
    engine: <engine>
    instructions:
      path: .daggry/personas/writer.md
```

The table lists the keys of a persona.

| Key | Required | Meaning |
|---|---|---|
| `engine` | yes | The name of an engine the tenant offers on this workspace. `<engine>` stands for that name. |
| `instructions.text` | one of the two | The instructions, inline. |
| `instructions.path` | one of the two | The instruction file, relative to the workspace root. |
| `description` | no | One or two sentences that say what the persona is for. |

These rules apply to a project's persona.

- **The project's persona wins.** When the project and the tenant both define a name, a run on this workspace uses the project's.
- **An agent cannot change it.** Daggry reads the persona from the baseline. The instruction file is a protected path.
- **The trail names it.** The run lock pins each persona a run uses, with its engine and the digest of its instructions. Every record an `agent` step seals carries the persona's name and that digest.

::: details A persona for the replay engine
The `replay` engine plays back a recorded session instead of starting a model. A persona on it takes `transcript`, the path of the recording, in place of `instructions`.
:::

## Commands

A command has one form everywhere: the `run` of a validator, a judge or a [command step](/reference/workflow-schema#command), and each entry of `project.setup`. It is a list of strings. The first is the program, and the rest are its arguments.

No shell reads the list, so no quoting, pipe or variable applies. A command that needs a shell names it: `[sh, -c, "make test > out.txt"]`. The working directory is the workspace root.

## validators

A validator is a command that measures the work. It exists only as an entry in this section, a map from a validator name to its declaration. For what a validator is and how a step names one, see [Validators](/reference/validators).

```yaml
validators:
  test:
    run: [npx, vitest, run, --reporter=junit, --outputFile=reports/junit.xml]
    output: junit
    output_file: reports/junit.xml
    timeout: 600
```

The table lists the keys of a validator. Only `run` is required.

| Key | Type | Meaning |
|---|---|---|
| `run` | command | What runs. The files it names are protected paths. |
| `output` | string | How Daggry reads the output: `exit-code`, `document` or a tool format. Default `exit-code`. See [Output formats](#output-formats). |
| `output_file` | path | The file the validator writes, relative to the workspace root. Absent: standard output. |
| `role` | label | What the validator looks at, such as `tests`, `lint`, `format`, `types`, `build`, `coverage` or `security`. Default `custom`. |
| `timeout` | integer | The longest the validator can run, in seconds. One that runs longer is stopped and fails. |
| `env` | array of names | The environment variables Daggry can pass to the validator. The file holds names, never values. |
| `needs.tools` | array of labels | The tools the validator needs, by the labels of `project.tools`. |
| `needs.runner` | string | The runner class the validator needs, by its name in the tenant config. |
| `expose` | string | `factory` (the default) or `agent`. See [Who runs a validator](#who-runs-a-validator). |

A name starts with a lowercase letter and holds lowercase letters, digits, `-` and `_`. The names `project`, `daggry`, `coverage`, `no_regression` and `baseline_proof` are reserved.

### Output formats

The `output` key says how Daggry reads what a validator reported. Whatever the format, Daggry seals the result in one form, a [measurement](/reference/kinds#evidence-measurement-1). The table lists the values.

| `output` | Daggry reads | The measurement holds |
|---|---|---|
| `exit-code` | The exit code only. | Pass for 0, fail otherwise. No findings. |
| `document` | A [result document](#result-document) the validator writes. | The outcome, findings and metrics of the document. |
| `junit` | A JUnit XML report. `output_file` is required. | One finding for each `testcase`. |
| `tap` | Test Anything Protocol, version 13 or 14. | One finding for each test point. |
| `libtest` | The result lines of Rust's test harness, on standard output. | One finding for each result line. |
| `sarif` | A SARIF 2.1.0 document. | One finding for each result: `fail` at level `error`, else `pass`. The metrics `errors` and `warnings`. |

The exit code is always recorded. A report that is missing or does not parse makes the outcome `error`. An `output` that is none of these values refuses the run when it starts.

::: details How the test formats map to findings
In the three test formats, a finding's id is the test's name in the report. The table lists the outcomes.

| Format | `pass` | `fail` | `skip` |
|---|---|---|---|
| `junit` | A `testcase` with no failure. | A `testcase` with a failure or an error. | A skipped `testcase`. |
| `tap` | `ok` | `not ok` | A `SKIP` directive. |
| `libtest` | `test <name> ... ok` | `test <name> ... FAILED` | `test <name> ... ignored` |

The `libtest` reader skips every other line, and the captured output between `failures:` and the next `test result:` line. `cargo test` prints these lines, and any other program can print the same lines.
:::

### Result document

A result document is how a validator reports more than pass or fail. The validator writes it with `output: document`. The table lists its keys.

| Key | Type | Required | Meaning |
|---|---|---|---|
| `format` | string | yes | Always `daggry/result@1`. |
| `outcome` | string | yes | What the validator decided: `pass`, `fail` or `error`. `error` means it could not inspect the workspace, and counts as a fail. |
| `findings` | array | no | What the validator found. |
| `findings[].id` | string | yes | The name of the finding, such as a rule or a test. Two findings can share an id. |
| `findings[].outcome` | string | yes | `pass`, `fail`, `error` or `skip`. |
| `findings[].locator` | string | no | Where the finding is, such as `<path>:<line>`. |
| `findings[].message` | string | yes | Any text. It can be empty. |
| `metrics` | map | no | Numbers the validator measured, from a name to a number. |

```json
{
  "format": "daggry/result@1",
  "outcome": "fail",
  "findings": [
    {"id": "heading-order", "outcome": "pass", "locator": "handbook/leave.md", "message": ""},
    {"id": "sentence-length", "outcome": "fail", "locator": "handbook/pay.md:14", "message": "The sentence has 41 words. The limit is 30."}
  ],
  "metrics": {"pages": 12, "reading_grade": 8}
}
```

The outcome is the validator's decision. Findings and metrics explain it and do not change it.

### Who runs a validator

A validator is declared once and can run in two ways. Only a `verify` step produces evidence. The table lists the two.

| Use | Where it runs | Evidence |
|---|---|---|
| A `verify` step | On a clean copy of the last sealed version, as an unprivileged user, after the agent process has ended. | Yes. One sealed measurement. |
| A preview, for a validator with `expose: agent` | In the agent's runner, on its working copy. | Never. A preview seals nothing. |

## verification

The `verification` section says which validators the name `project` stands for in a `verify` step. The table lists the keys.

| Key | Type | Meaning |
|---|---|---|
| `verification.canonical` | validator name | Required. The project's canonical validator. The guide calls it the main validator. |
| `verification.also` | array of validator names | Validators that run with the canonical one. |
| `verification.thresholds` | array | Limits on numbers those validators give. |
| `verification.thresholds[].validator` | validator name | The canonical validator or one in `also`. |
| `verification.thresholds[].read` | string | The number: `exit_code`, `findings`, `findings.<outcome>` or `metrics.<name>`. |
| `verification.thresholds[].min`, `max` | number | The lowest and the highest value that passes. At least one. |

```yaml
verification:
  canonical: test
  also: [line-coverage]
  thresholds:
    - validator: line-coverage
      read: metrics.line_coverage_pct
      min: 80
```

A `verify` step that names `project` runs the canonical validator and each validator in `also`, and Daggry seals one measurement for each. A missed threshold is sealed as a failing finding, and the default judge's verdict is then `fail`. See [Threshold findings](/reference/kinds#threshold-findings).

The `coverage` and `no_regression` judges and the baseline proof read the findings of the canonical validator. They need one with `output: document` or a tool format: a validator with `exit-code` has no findings and covers no criterion.

## judges

The `judges` section holds the project's custom and rubric judges, as a map from a judge name to its declaration. The default judge, `coverage` and `no_regression` need no declaration. For what each kind of judge does, see [Judges](/reference/judges). The table lists the keys.

| Key | Used by | Meaning |
|---|---|---|
| `run` | A custom judge | The command. It gets the evidence trail on standard input and writes a verdict body. See [Custom judge](/reference/judges#custom-judge). |
| `timeout` | A custom judge | The longest the judge can run, in seconds. |
| `rubric` | A rubric judge | The rubric file. A person approves it, and Daggry pins its digest. |
| `engine` | A rubric judge | The name of an engine in the tenant config. |
| `criterion` | A rubric judge | A fixed criterion id. Absent: the current criterion of the enclosing loop. |

A declaration has `run`, or `rubric` and `engine`, never both.

## protect

The `protect` section adds paths to the protected set. Daggry already protects `.daggry/**` and the files that a validator's or a judge's `run` names. See [Protected paths](/reference/protected-paths).

```yaml
protect:
  paths:
    - "area:style"
    - "templates/**"
```

Each entry of `protect.paths` is a glob or an area, as `area:<name>`. The section only adds: no key removes a path from the protected set, and no scope opens one.

## Workspaces and work items

The files use general names, so the same keys describe any kind of work. The table says what each name is for a software project.

| Name | For a software project |
|---|---|
| Workspace | A git repository, named `<owner>/<name>`. |
| Revision | A commit, named by its 40 hex digits. |
| Baseline | The commit a run starts from. |
| Change | The commits a step adds to the run's branch, `daggry/<run-id>`. |
| Work item | An issue, named by its URL. |
| Delivered result | A pull request, opened by the `open-pr` effect. |
| Accepting a change | A person merges the pull request. The project config changes this way only. |

Other kinds of work use the same names. A handbook or a dataset in a git repository is a workspace, the request to revise it is a work item, and the validators are scripts that check documents or data instead of tests.

## Where it lives

The table says where the file is read from and who changes it.

| Rule | Detail |
|---|---|
| Path | `.daggry/project.yaml` in the workspace. |
| Read from | The baseline. Never the working copy of a step. |
| Protected | `.daggry/**` is always protected. A step that edits the file has its edit put back and recorded. |
| Changed by | A person, outside every run. The change applies from the next run whose baseline holds it. |

The tenant config wins over this file, and this file wins over the workflow. See [Precedence](/reference/tenant-config#precedence).

## Examples

### A handbook

This workspace holds documents. Its canonical validator reviews every page and writes a result document. A second validator checks citations, and the agent can preview it. One threshold limits the reading grade.

```yaml
format: daggry/project@1

project:
  name: handbook
  tools: [pandoc-3]

areas:
  handbook:
    paths: ["handbook/**"]
    role: docs
    description: One Markdown page for each policy.
  style:
    paths: ["style/**"]
    role: config

personas:
  writer:
    description: Writes handbook pages in the house style.
    engine: <engine>
    instructions:
      path: .daggry/personas/writer.md

validators:
  review:
    run: [sh, scripts/review-handbook.sh]
    role: style
    output: document
    output_file: reports/review.json
    timeout: 300
  citations:
    run: [sh, scripts/check-citations.sh]
    role: citations
    output: document
    expose: agent

verification:
  canonical: review
  also: [citations]
  thresholds:
    - validator: review
      read: metrics.reading_grade
      max: 9

protect:
  paths:
    - "area:style"
```

`area:style` protects the house style the validators read. The default protection covers the scripts a `run` names, not the files those scripts read.

### Software project: Node

The canonical validator runs the tests and writes a JUnit report. Lint and types run with it. The `tooling` area protects the files the validators read.

```yaml
format: daggry/project@1

project:
  name: shop-web
  tools: [node-22]
  setup:
    - [npm, ci]

areas:
  app:
    paths: ["src/**"]
    role: source
  tooling:
    paths: ["package.json", "vitest.config.ts"]
    role: config

validators:
  test:
    run: [npx, vitest, run, --reporter=junit, --outputFile=reports/junit.xml]
    role: tests
    output: junit
    output_file: reports/junit.xml
    expose: agent
  lint:
    run: [npm, run, lint]
    role: lint
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

### Software project: Rust

`cargo test` prints one result line for each test, and the `libtest` format reads those lines from standard output, so the validator needs no report file. A threshold refuses a skipped test.

```yaml
format: daggry/project@1

project:
  name: shop-core
  tools: [rust-1.90]

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

verification:
  canonical: test
  also: [clippy]
  thresholds:
    - validator: test
      read: findings.skip
      max: 0
```

::: details Files that Daggry refuses
The table is a short, representative set.

| Input | Refusal |
|---|---|
| No `format` key, or `format: daggry/project@2` | Missing `format`, or an unknown major version. |
| `validatrs:` at the top level | An unknown key: a misspelt `validators`. |
| `run: sh check.sh --all` | A string. A command is a list: `[sh, check.sh, --all]`. |
| A validator with no `run` | Nothing to run. |
| A validator named `project` or `daggry` | A reserved name. |
| `output: report` | An unknown format. The run is refused when it starts. |
| `output_file: /tmp/out.json` | Not a path relative to the workspace root. |
| `env:` with `TOKEN=abc` | Not a variable name. The file holds names, never values. |
| `verification:` with no `canonical`, or with a name `validators` lacks | No canonical validator. |
| A threshold with neither `min` nor `max` | A threshold needs a limit. |
| A persona with both `instructions.text` and `instructions.path`, or with neither | A persona has exactly one. |
| `protect.paths` with `area:web` where `areas` holds no `web` | No such area. |
:::

## Schemas

The project config and the result document each have a published JSON Schema (draft 2020-12): [daggry-project-v1.json](/schemas/daggry-project-v1.json) and [daggry-result-v1.json](/schemas/daggry-result-v1.json). A schema checks shape only. It does not check that a name in `canonical`, `also`, a threshold or an area reference exists.

::: details Schema: project config
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "daggry/project@1",
  "title": "daggry/project@1: the project config",
  "type": "object",
  "required": [
    "format"
  ],
  "additionalProperties": false,
  "patternProperties": {
    "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true
  },
  "properties": {
    "format": {
      "const": "daggry/project@1"
    },
    "project": {
      "type": "object",
      "additionalProperties": false,
      "patternProperties": {
        "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true
      },
      "properties": {
        "name": {
          "$ref": "#/$defs/name"
        },
        "tools": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/label"
          }
        },
        "setup": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/command"
          }
        },
        "entry_points": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/path"
          }
        }
      }
    },
    "areas": {
      "type": "object",
      "additionalProperties": false,
      "patternProperties": {
        "^[a-z][a-z0-9_-]*$": {
          "$ref": "#/$defs/area"
        },
        "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true
      }
    },
    "personas": {
      "type": "object",
      "additionalProperties": false,
      "patternProperties": {
        "^[a-z][a-z0-9_-]*$": {
          "$ref": "#/$defs/persona"
        },
        "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true
      }
    },
    "validators": {
      "type": "object",
      "additionalProperties": false,
      "patternProperties": {
        "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true,
        "^(?!(project|daggry|coverage|no_regression|baseline_proof)$)[a-z][a-z0-9_-]*$": {
          "$ref": "#/$defs/validator"
        }
      }
    },
    "judges": {
      "type": "object",
      "additionalProperties": false,
      "patternProperties": {
        "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true,
        "^(?!(project|daggry|coverage|no_regression|baseline_proof)$)[a-z][a-z0-9_-]*$": {
          "$ref": "#/$defs/judge"
        }
      }
    },
    "verification": {
      "type": "object",
      "additionalProperties": false,
      "patternProperties": {
        "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true
      },
      "properties": {
        "canonical": {
          "$ref": "#/$defs/validatorName"
        },
        "also": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/validatorName"
          },
          "uniqueItems": true
        },
        "thresholds": {
          "type": "array",
          "items": {
            "type": "object",
            "additionalProperties": false,
            "patternProperties": {
              "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true
            },
            "properties": {
              "validator": {
                "$ref": "#/$defs/validatorName"
              },
              "read": {
                "type": "string",
                "pattern": "^(exit_code|findings|findings\\.(pass|fail|error|skip)|metrics\\.[a-z][a-z0-9_]*)$"
              },
              "min": {
                "type": "number"
              },
              "max": {
                "type": "number"
              }
            },
            "required": [
              "validator",
              "read"
            ],
            "anyOf": [
              {
                "required": [
                  "min"
                ]
              },
              {
                "required": [
                  "max"
                ]
              }
            ]
          }
        }
      },
      "required": [
        "canonical"
      ]
    },
    "protect": {
      "type": "object",
      "additionalProperties": false,
      "patternProperties": {
        "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true
      },
      "properties": {
        "paths": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/pathEntry"
          }
        }
      }
    }
  },
  "$defs": {
    "name": {
      "type": "string",
      "minLength": 1
    },
    "label": {
      "type": "string",
      "pattern": "^[A-Za-z0-9][A-Za-z0-9._-]*$"
    },
    "validatorName": {
      "type": "string",
      "pattern": "^(?!(project|daggry|coverage|no_regression|baseline_proof)$)[a-z][a-z0-9_-]*$"
    },
    "path": {
      "type": "string",
      "pattern": "^(?!/)(?!.*(^|/)\\.\\.(/|$))\\S+$"
    },
    "pathEntry": {
      "type": "string",
      "minLength": 1,
      "anyOf": [
        {
          "pattern": "^area:[a-z][a-z0-9_-]*$"
        },
        {
          "not": {
            "pattern": "^area:"
          }
        }
      ]
    },
    "area": {
      "type": "object",
      "additionalProperties": false,
      "patternProperties": {
        "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true
      },
      "properties": {
        "paths": {
          "type": "array",
          "minItems": 1,
          "items": {
            "type": "string",
            "minLength": 1
          }
        },
        "role": {
          "$ref": "#/$defs/label"
        },
        "description": {
          "$ref": "#/$defs/name"
        }
      },
      "required": [
        "paths"
      ]
    },
    "command": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "string",
        "minLength": 1
      },
      "description": "A program and its arguments. The first string is the program. No shell reads the list."
    },
    "validator": {
      "type": "object",
      "additionalProperties": false,
      "patternProperties": {
        "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true
      },
      "properties": {
        "run": {
          "$ref": "#/$defs/command",
          "description": "What runs. Required: a validator exists only as a declared entry."
        },
        "role": {
          "$ref": "#/$defs/label",
          "default": "custom"
        },
        "output": {
          "type": "string",
          "pattern": "^[a-z][a-z0-9_-]*$",
          "default": "exit-code",
          "description": "How Daggry reads the output: exit-code (default), document, or the name of a tool format such as junit or sarif."
        },
        "output_file": {
          "$ref": "#/$defs/path",
          "description": "The file the validator writes its output to. Absent: standard output."
        },
        "timeout": {
          "type": "integer",
          "minimum": 1
        },
        "env": {
          "type": "array",
          "items": {
            "type": "string",
            "pattern": "^[A-Za-z_][A-Za-z0-9_]*$"
          }
        },
        "needs": {
          "type": "object",
          "additionalProperties": false,
          "patternProperties": {
            "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true
          },
          "properties": {
            "tools": {
              "type": "array",
              "items": {
                "$ref": "#/$defs/label"
              }
            },
            "runner": {
              "$ref": "#/$defs/name"
            }
          }
        },
        "expose": {
          "enum": [
            "factory",
            "agent"
          ]
        }
      },
      "required": [
        "run"
      ]
    },
    "judge": {
      "type": "object",
      "additionalProperties": false,
      "patternProperties": {
        "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true
      },
      "properties": {
        "run": {
          "$ref": "#/$defs/command",
          "description": "A custom judge: what runs. Daggry writes the evidence trail as JSON on standard input ({\"records\": [...]}) and reads a verdict body from standard output."
        },
        "timeout": {
          "type": "integer",
          "minimum": 1
        },
        "criterion": {
          "type": "string",
          "minLength": 1,
          "description": "A rubric judge: a fixed criterion id of the plan. Absent: the current criterion of the enclosing loop over the plan's criteria."
        },
        "rubric": {
          "$ref": "#/$defs/path",
          "description": "A rubric judge: the rubric file. A person approves it and Daggry pins its digest."
        },
        "engine": {
          "type": "string",
          "minLength": 1,
          "description": "A rubric judge: the name of an engine the tenant config declares."
        }
      },
      "oneOf": [
        {
          "required": [
            "run"
          ]
        },
        {
          "required": [
            "rubric",
            "engine"
          ]
        }
      ]
    },
    "persona": {
      "type": "object",
      "additionalProperties": false,
      "patternProperties": {
        "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true
      },
      "properties": {
        "description": {
          "$ref": "#/$defs/name",
          "description": "One or two sentences that say what the persona is for."
        },
        "engine": {
          "$ref": "#/$defs/name",
          "description": "The name of an engine in agents.engines of the tenant config."
        },
        "instructions": {
          "type": "object",
          "additionalProperties": false,
          "minProperties": 1,
          "maxProperties": 1,
          "properties": {
            "text": {
              "type": "string",
              "minLength": 1,
              "description": "The instructions, inline."
            },
            "path": {
              "$ref": "#/$defs/path",
              "description": "The instruction file, relative to the workspace root and read from the baseline."
            }
          },
          "description": "The persona's instructions: exactly one of text and path."
        },
        "transcript": {
          "$ref": "#/$defs/path",
          "description": "For a persona on the replay engine: the recorded transcript it plays back, in place of instructions."
        }
      },
      "required": [
        "engine"
      ],
      "oneOf": [
        {
          "required": [
            "instructions"
          ]
        },
        {
          "required": [
            "transcript"
          ]
        }
      ]
    }
  }
}
```
:::

::: details Schema: result document
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "daggry/result@1",
  "title": "daggry/result@1: the result document a check writes",
  "type": "object",
  "required": [
    "format",
    "outcome"
  ],
  "additionalProperties": false,
  "patternProperties": {
    "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true
  },
  "properties": {
    "format": {
      "const": "daggry/result@1"
    },
    "outcome": {
      "enum": [
        "pass",
        "fail",
        "error"
      ]
    },
    "findings": {
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "id",
          "outcome",
          "message"
        ],
        "additionalProperties": false,
        "patternProperties": {
          "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true
        },
        "properties": {
          "id": {
            "type": "string",
            "minLength": 1
          },
          "outcome": {
            "enum": [
              "pass",
              "fail",
              "error",
              "skip"
            ]
          },
          "locator": {
            "type": "string",
            "minLength": 1
          },
          "message": {
            "type": "string"
          }
        }
      }
    },
    "metrics": {
      "type": "object",
      "propertyNames": {
        "pattern": "^[a-z][a-z0-9_]*$"
      },
      "additionalProperties": {
        "type": "number"
      }
    }
  }
}
```
:::

## Next steps

The list names the pages to read next.

- For how a step names a validator and when one counts as evidence, see [Validators](/reference/validators).
- For the judges, see [Judges](/reference/judges).
- For the tenant's side, including the shared personas and which workflows run on a workspace, see [Tenant config](/reference/tenant-config).
- For the paths Daggry always protects, see [Protected paths](/reference/protected-paths).
