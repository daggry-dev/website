# Kinds and schemas

*Reference*

For the idea, read [Why you can trust a run](/guide/concepts/trust).

Daggry has eight kinds of sealed artifact. This page lists each kind's body fields, its constraints, a valid example, who seals it, and the validators that judge measurements and plans. It is for people who write workflows, gates or tools that read the log. The envelope around every body is in [Envelope](/reference/envelope).

A kind's namespace says who defines it. The `evidence` namespace holds the kinds of the standard, and `daggry` holds this platform's own. Another factory adds kinds in a namespace of its own and leaves both of these unchanged, so a new kind of record never changes the standard. See [Conformance](/reference/conformance).

The example bodies on this page are illustrative. Each is valid under the schema and the policy rules that follow it. Digests shown as short strings such as `ab` pass the schemas, which require only a non-empty string. Real digests are 64 lowercase hex digits.

## Download

Every kind has a published JSON Schema (draft 2020-12) for its `body`, and so does the envelope. To download one, use the files below.

| Schema | File |
|---|---|
| `evidence/envelope@1` | [evidence-envelope-v1.json](/schemas/evidence-envelope-v1.json) |
| `evidence/plan@1` | [evidence-plan-v1.json](/schemas/evidence-plan-v1.json) |
| `evidence/measurement@1` | [evidence-measurement-v1.json](/schemas/evidence-measurement-v1.json) |
| `evidence/verdict@1` | [evidence-verdict-v1.json](/schemas/evidence-verdict-v1.json) |
| `evidence/approval@1` | [evidence-approval-v1.json](/schemas/evidence-approval-v1.json) |
| `daggry/change@1` | [daggry-change-v1.json](/schemas/daggry-change-v1.json) |
| `daggry/observation@1` | [daggry-observation-v1.json](/schemas/daggry-observation-v1.json) |
| `daggry/run-lock@1` | [daggry-run-lock-v1.json](/schemas/daggry-run-lock-v1.json) |
| `daggry/work-item@1` | [daggry-work-item-v1.json](/schemas/daggry-work-item-v1.json) |

## The eight kinds

Four kinds belong to the evidence language and name nothing of git or GitHub. Four are Daggry's own.

| Kind | Holds | Sealed by |
|---|---|---|
| `evidence/plan@1` | The acceptance criteria an agent plans. | Control plane, from an agent step's submitted record. |
| `evidence/measurement@1` | What a measuring step recorded: a test run. | Control plane, from the runner's verify or red-proof record. |
| `evidence/verdict@1` | What a validator produced. | Control plane, from a validator's output. |
| `evidence/approval@1` | A human grant bound to one digest. | Control plane, on `daggry approve`. |
| `daggry/change@1` | A commit, its paths and the frozen test set. | Control plane, after it accepts an agent or command step. |
| `daggry/observation@1` | A `protected-restored` or `step-failed` record. | Control plane, from the runner's report or its own failure record. |
| `daggry/run-lock@1` | What a run pins. | Control plane, at run start. |
| `daggry/work-item@1` | The repository and the issue a run is for. | Control plane, at run start. |

Each kind is a JSON Schema (draft 2020-12) for the artifact's `body`. Every object in every schema refuses unknown fields. The schema's `$id` is the kind. Only major version `1` exists for every kind.

A workflow and a gate name a kind by its bare name (`plan`, `change`), which is unique across both namespaces.

An unknown namespace, or a name the namespace lacks (`evidence/change@1`, `daggry/plan@1`, `acme/plan@1`), is refused as an unknown kind. A known name at another major (`evidence/plan@2`) is refused as an unknown major.

A body that does not fit its schema is refused with the JSON pointer of the offending value: ``body of `<kind>`: <message> (at `<location>`)``.

### Reading the field tables

| Column | Meaning |
|---|---|
| Req | Whether the schema requires the field. |
| Class | The field's fact class: `claimed` (an agent wrote it), `derived` (code computed it from sealed inputs) or `-` (no class). A gate reads only `derived` fields. See [Gate expressions](/reference/gates). |

### Who seals what

| Kind | Artifact id | `meta` stamps | `parents` |
|---|---|---|---|
| `run-lock` | `run-lock` | tenant, run | none, because it starts the run |
| `work-item` | `work-item` | tenant, run | none, because it starts the run |
| `plan` | `<step>-<n>` | tenant, run, job, attempt, step | the artifacts it builds on |
| `measurement` | `<step>-head`, `<step>-red` | tenant, run, job, attempt, step | the change it measured |
| `change` | `change-<n>` | tenant, run, job, attempt, step | the plan it implements |
| `observation` | `<step>-restored-<n>`, `observation-<n>` | tenant, run, job, attempt, step | the artifacts it concerns |
| `verdict` | `verdict-<n>` | tenant, run, job, attempt, step | the digests of the inputs judged |
| `approval` | `approval-<n>` | tenant, run, job, step | the one bound artifact |

`parents` names the artifacts a record builds on, so you can walk from a verdict back to the measurement, the change and the plan. `<n>` is a counter per run. A step submits only the kinds its workflow declares. An agent never writes a seal field.

## evidence/plan@1

The acceptance criteria an agent plans. A person approves the plan with `daggry approve`, which seals an approval bound to the plan's digest.

| Field | Type | Req | Class | Constraints |
|---|---|---|---|---|
| `criteria` | array of objects | yes | claimed | At least 1 item. |
| `criteria[].id` | string | yes | - | Non-empty. |
| `criteria[].text` | string | yes | - | Non-empty. |

Constraint beyond the schema: criterion ids are unique within a plan and compared exactly (`c1` and `C1` differ). A duplicate is refused at `/criteria/<i>/id` with ``duplicate criterion id `<id>` ``.

`criteria` is `claimed`, so a gate cannot read it. A loop reads the list with `over: plan`.

Example:

```json
{"criteria": [{"id": "AC-1", "text": "An empty name is rejected"}, {"id": "AC-2", "text": "A name over 64 characters is rejected"}]}
```

::: details Schema: evidence/plan@1
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "evidence/plan@1",
  "title": "evidence/plan@1: the acceptance criteria an agent plans",
  "type": "object",
  "required": [
    "criteria"
  ],
  "additionalProperties": false,
  "properties": {
    "criteria": {
      "x-fact-class": "claimed",
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": [
          "id",
          "text"
        ],
        "additionalProperties": false,
        "properties": {
          "id": {
            "type": "string",
            "minLength": 1
          },
          "text": {
            "type": "string",
            "minLength": 1
          }
        }
      }
    }
  }
}
```
:::

## evidence/measurement@1

What a measuring step recorded: the exit code and the per-test outcomes of the project's test command.

| Field | Type | Req | Class | Constraints |
|---|---|---|---|---|
| `label` | string | yes | derived | Non-empty. Policy: `base`, `head` or `red`. |
| `revision` | string | yes | claimed | Non-empty. Policy: exactly 40 lowercase hex digits. |
| `criterion` | string | no | derived | Non-empty when present. Policy: required for `red`, refused for `base` and `head`. |
| `exit_code` | integer | yes | derived | Any integer. |
| `tests` | array of objects | yes | derived | Can be empty. |
| `tests[].name` | string | yes | - | Non-empty. |
| `tests[].outcome` | string | yes | - | `passed`, `failed` or `ignored`. |

Policy rules that Daggry applies after the schema:

| Rule | Refusal |
|---|---|
| `label` is `base`, `head` or `red`. | `` `x` is not one of `base`, `head`, `red` `` at `/label`. |
| `revision` is exactly 40 lowercase hex digits. | `a revision is 40 lower-case hexadecimal digits` at `/revision`. Uppercase is refused. |
| `red` requires `criterion`. | ``a `red` measurement requires `criterion` `` at the root. |
| `base` and `head` refuse `criterion`. | `` `criterion` is refused of a `base` or `head` measurement `` at `/criterion`. |

The labels:

| Label | What was measured |
|---|---|
| `base` | The base commit's test run. |
| `head` | The sealed commit's test run. |
| `red` | The red-proof run: the base commit with a test step's new test paths overlaid. It carries the criterion id it proves. |

`revision` is `claimed`, so a gate cannot read it. The control plane separately checks that a `head` measurement's `revision` equals the last sealed commit. `inputs.measurement.exit_code == 0` is a usable gate read.

Example:

```json
{
  "label": "head",
  "revision": "0123456789abcdef0123456789abcdef01234567",
  "exit_code": 1,
  "tests": [
    {"name": "tests::ac_1_rejects_empty", "outcome": "passed"},
    {"name": "tests::ac_2_rejects_long", "outcome": "failed"}
  ]
}
```

::: details Schema: evidence/measurement@1
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "evidence/measurement@1",
  "title": "evidence/measurement@1: what a measuring step recorded",
  "type": "object",
  "required": [
    "label",
    "revision",
    "exit_code",
    "tests"
  ],
  "additionalProperties": false,
  "properties": {
    "label": {
      "type": "string",
      "minLength": 1,
      "x-fact-class": "derived"
    },
    "revision": {
      "type": "string",
      "minLength": 1,
      "x-fact-class": "claimed"
    },
    "criterion": {
      "type": "string",
      "minLength": 1,
      "x-fact-class": "derived"
    },
    "exit_code": {
      "type": "integer",
      "x-fact-class": "derived"
    },
    "tests": {
      "x-fact-class": "derived",
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "name",
          "outcome"
        ],
        "additionalProperties": false,
        "properties": {
          "name": {
            "type": "string",
            "minLength": 1
          },
          "outcome": {
            "enum": [
              "passed",
              "failed",
              "ignored"
            ]
          }
        }
      }
    }
  }
}
```
:::

## evidence/verdict@1

What a validator produced: a status, findings and derived facts. Only the control plane's verdicts open gates.

| Field | Type | Req | Class | Constraints |
|---|---|---|---|---|
| `validator` | string | yes | - | Non-empty. |
| `version` | string | yes | - | Non-empty. |
| `status` | string | yes | derived | `pass`, `fail` or `inconclusive`. |
| `findings` | array of objects | yes | - | Each `{ "message": <string> }`. `message` is required and nothing else is allowed. |
| `facts` | array of objects | yes | derived | See the next rows. |
| `facts[].name` | string | yes | - | Non-empty. A stricter grammar applies (see [Validator output](#validator-output)). |
| `facts[].class` | string | yes | - | Only `derived`. |
| `facts[].value` | boolean, integer or string | yes | - | A float is refused. |

A gate reads `verdict.status` and `verdict.<fact name>`. `verdict.findings`, `verdict.validator` and `verdict.version` have no class and are refused.

The verdict's `parents` are the digests of the artifacts it judged.

Example (the verdict of `criterion-coverage` over a plan with `AC-1` and `AC-2`, and a head measurement where only `AC-1` passed):

```json
{
  "validator": "criterion-coverage",
  "version": "0.1.0",
  "status": "fail",
  "findings": [{"message": "uncovered: AC-2"}],
  "facts": [
    {"name": "criteria_covered", "class": "derived", "value": 1},
    {"name": "criteria_uncovered", "class": "derived", "value": 1},
    {"name": "all_covered", "class": "derived", "value": false}
  ]
}
```

::: details Schema: evidence/verdict@1
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "evidence/verdict@1",
  "title": "evidence/verdict@1: what a validator produced. A gate reads verdict.<fact name> and verdict.status",
  "type": "object",
  "required": [
    "validator",
    "version",
    "status",
    "findings",
    "facts"
  ],
  "additionalProperties": false,
  "properties": {
    "validator": {
      "type": "string",
      "minLength": 1
    },
    "version": {
      "type": "string",
      "minLength": 1
    },
    "status": {
      "enum": [
        "pass",
        "fail",
        "inconclusive"
      ],
      "x-fact-class": "derived"
    },
    "findings": {
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "message"
        ],
        "additionalProperties": false,
        "properties": {
          "message": {
            "type": "string"
          }
        }
      }
    },
    "facts": {
      "x-fact-class": "derived",
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "name",
          "class",
          "value"
        ],
        "additionalProperties": false,
        "properties": {
          "name": {
            "type": "string",
            "minLength": 1
          },
          "class": {
            "const": "derived"
          },
          "value": {
            "type": [
              "boolean",
              "integer",
              "string"
            ]
          }
        }
      }
    }
  }
}
```
:::

## evidence/approval@1

A human grant bound to one artifact digest.

| Field | Type | Req | Class | Constraints |
|---|---|---|---|---|
| `subject` | string | yes | derived | Non-empty. |
| `path` | string or null | yes | derived | Explicit `null` when none. |
| `digest` | string | yes | derived | Non-empty. |
| `source_ref` | string or null | yes | derived | Policy: `null`, or a non-empty string of ASCII decimal digits. |
| `cited_phrase` | string or null | yes | derived | Explicit `null` when none. |
| `intent_read` | string or null | yes | derived | Explicit `null` when none. |
| `author` | string | yes | derived | Non-empty. |

All seven fields are required. Write an absent value as `null`; do not omit the field. A `source_ref` that is neither `null` nor decimal digits is refused at `/source_ref` with `` `source_ref` is null or the decimal id of a comment ``.

How the CLI path fills the body:

| Command | `subject` | `path` | `digest` | Parent |
|---|---|---|---|---|
| `daggry approve <run-id>` | The run id. | `null` | The hex digest of the artifact the `human` step waits on: the `plan` for `approval`, the latest `change` for `input-needed`. | That artifact. |
| `daggry approve <run-id> --unfreeze <path>` | The run id. | The path. | The frozen file digest that the latest `change` records for the path. | That `change`. |

`source_ref`, `cited_phrase` and `intent_read` are `null` on the CLI path. `author` is the identity of the caller. Approval by a verified comment carries the comment's id in `source_ref`, the cited phrase, and the intent an independent step read from the comment, which falls in a closed set of seven.

Refusals: an `--unfreeze` of a path the change does not freeze (`` `<path>` is not a frozen path ``), and an approval when nothing is sealed to bind (`nothing to approve: no sealed plan` or `no sealed change`).

Example:

```json
{
  "subject": "<run-id>",
  "path": null,
  "digest": "<hex digest of the plan>",
  "source_ref": null,
  "cited_phrase": null,
  "intent_read": null,
  "author": "<identity of the caller>"
}
```

`<run-id>` is the run's id. `<hex digest of the plan>` is the plan's 64-digit digest. `<identity of the caller>` is the identity of the token that ran `daggry approve`.

::: details Schema: evidence/approval@1
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "evidence/approval@1",
  "title": "evidence/approval@1: a human grant bound to one digest",
  "type": "object",
  "required": [
    "subject",
    "path",
    "digest",
    "source_ref",
    "cited_phrase",
    "intent_read",
    "author"
  ],
  "additionalProperties": false,
  "properties": {
    "subject": {
      "type": "string",
      "minLength": 1,
      "x-fact-class": "derived"
    },
    "path": {
      "type": [
        "string",
        "null"
      ],
      "x-fact-class": "derived"
    },
    "digest": {
      "type": "string",
      "minLength": 1,
      "x-fact-class": "derived"
    },
    "source_ref": {
      "type": [
        "string",
        "null"
      ],
      "x-fact-class": "derived"
    },
    "cited_phrase": {
      "type": [
        "string",
        "null"
      ],
      "x-fact-class": "derived"
    },
    "intent_read": {
      "type": [
        "string",
        "null"
      ],
      "x-fact-class": "derived"
    },
    "author": {
      "type": "string",
      "minLength": 1,
      "x-fact-class": "derived"
    }
  }
}
```
:::

## daggry/change@1

A commit, the paths it changed, and the run's frozen test set at that seal.

| Field | Type | Req | Class | Constraints |
|---|---|---|---|---|
| `revision` | string | yes | claimed | Exactly 40 lowercase hex digits (`^[0-9a-f]{40}$`). |
| `paths` | array of strings | yes | claimed | Each non-empty. The paths the step changed against the last sealed commit. |
| `frozen` | array of objects | yes | derived | Can be empty. |
| `frozen[].path` | string | yes | - | Non-empty. |
| `frozen[].digest` | string | yes | - | Non-empty. The file's git blob id. |

The frozen set holds each path of a test step's change that matches the step's `tests` globs, with its file digest. The set carries forward: each new `change` holds the previous frozen set plus new frozen paths. An unfrozen path is re-entered at its new digest, or dropped if the file is gone. The set is frozen for every later step of the run. See [Protected paths](/guide/concepts/protection).

The control plane seals a `change` after an accepted `agent` or `command` step. A `verify` step seals none.

Example:

```json
{
  "revision": "0123456789abcdef0123456789abcdef01234567",
  "paths": ["src/greeting.rs", "tests/greeting.rs"],
  "frozen": [{"path": "tests/greeting.rs", "digest": "5ba93c9db0cff93f52b521d7420e43f6eda2784f"}]
}
```

::: details Schema: daggry/change@1
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "daggry/change@1",
  "title": "daggry/change@1: a commit, its paths and the frozen test set",
  "type": "object",
  "required": [
    "revision",
    "paths",
    "frozen"
  ],
  "additionalProperties": false,
  "properties": {
    "revision": {
      "type": "string",
      "pattern": "^[0-9a-f]{40}$",
      "x-fact-class": "claimed"
    },
    "paths": {
      "type": "array",
      "items": {
        "type": "string",
        "minLength": 1
      },
      "x-fact-class": "claimed"
    },
    "frozen": {
      "x-fact-class": "derived",
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "path",
          "digest"
        ],
        "additionalProperties": false,
        "properties": {
          "path": {
            "type": "string",
            "minLength": 1
          },
          "digest": {
            "type": "string",
            "minLength": 1
          }
        }
      }
    }
  }
}
```
:::

## daggry/observation@1

A record the platform keeps and no gate uses. One schema admits two records, selected by `record`.

| Field | Type | Req | Class | Constraints |
|---|---|---|---|---|
| `record` | string | yes | derived | `protected-restored` or `step-failed`. |
| `reason` | string | yes | derived | Non-empty. |
| `path` | string | by record | derived | Non-empty. Required for `protected-restored`. Refused for `step-failed`. |
| `step` | string | by record | derived | Non-empty. Required for `step-failed`. Refused for `protected-restored`. |
| `attempt` | integer | by record | derived | 1 or more. Required for `step-failed`. Refused for `protected-restored`. |

The two records:

| Record | Fields | Sealed when |
|---|---|---|
| `protected-restored` | `record`, `path`, `reason` | The runner puts a violating path back and reports it. |
| `step-failed` | `record`, `step`, `attempt`, `reason` | The control plane fails a job. `reason` is `the job ran past its timeout` or `the lease lapsed on the last allowed attempt`. |

Examples:

```json
{"record": "protected-restored", "path": "tests/greeting.rs", "reason": "protected"}
```

```json
{"record": "step-failed", "step": "implement", "reason": "the job ran past its timeout", "attempt": 1}
```

::: details Schema: daggry/observation@1
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "daggry/observation@1",
  "title": "daggry/observation@1: a protected-restored or a step-failed record",
  "type": "object",
  "required": [
    "record",
    "reason"
  ],
  "additionalProperties": false,
  "properties": {
    "record": {
      "enum": [
        "protected-restored",
        "step-failed"
      ],
      "x-fact-class": "derived"
    },
    "path": {
      "type": "string",
      "minLength": 1,
      "x-fact-class": "derived"
    },
    "reason": {
      "type": "string",
      "minLength": 1,
      "x-fact-class": "derived"
    },
    "step": {
      "type": "string",
      "minLength": 1,
      "x-fact-class": "derived"
    },
    "attempt": {
      "type": "integer",
      "minimum": 1,
      "x-fact-class": "derived"
    }
  },
  "allOf": [
    {
      "if": {
        "properties": {
          "record": {
            "const": "protected-restored"
          }
        },
        "required": [
          "record"
        ]
      },
      "then": {
        "required": [
          "path"
        ],
        "properties": {
          "step": false,
          "attempt": false
        }
      }
    },
    {
      "if": {
        "properties": {
          "record": {
            "const": "step-failed"
          }
        },
        "required": [
          "record"
        ]
      },
      "then": {
        "required": [
          "step",
          "attempt"
        ],
        "properties": {
          "path": false
        }
      }
    }
  ]
}
```
:::

## daggry/run-lock@1

What a run pins at start. It is the first entry of a run.

| Field | Type | Req | Class | Constraints |
|---|---|---|---|---|
| `validators` | array of objects | yes | derived | |
| `validators[].name` | string | yes | - | Non-empty. |
| `validators[].version` | string | yes | - | Non-empty. |
| `boundary_rules` | array of strings | yes | derived | Each non-empty. |
| `image_digest` | string | yes | derived | Non-empty. The digest of the job image. |
| `workflow_digest` | string | yes | derived | Non-empty. SHA-256 hex of the exact bytes of the workflow file. |

`boundary_rules` holds one string per rule: `always <glob>` for each always-protected glob, then `scope <step id>: <nothing|anywhere|glob>` for each step scope, in workflow order, one string per glob for a glob list. The control plane reads the rules back when it rechecks a step. A step with no scope in the lock can write nothing.

The workflow text is also held as a blob under `workflow_digest`, so `daggry verify` covers it by re-hashing.

Example for a three-step workflow. The list of `always` rules is shortened here; a real lock lists every always-protected glob first.
The workflow has three steps: `plan` with scope `nothing`, `build` with scope `src/**` and `tests/**`, and `run` with scope `anywhere`.

```json
{
  "validators": [
    {"name": "base-relative", "version": "0.1.0"},
    {"name": "criterion-coverage", "version": "0.1.0"},
    {"name": "red-proof", "version": "0.1.0"}
  ],
  "boundary_rules": [
    "always .daggry/**", "always **/AGENTS.md", "always .agents/**", "always **/SKILL.md",
    "always **/.mcp.json", "always **/.gitmodules", "always **/.gitattributes", "always **/.mailmap",
    "scope plan: nothing", "scope build: src/**", "scope build: tests/**", "scope run: anywhere"
  ],
  "image_digest": "sha256:0f3c9a1d5e7b2468ace02468ace13579bdf02468ace13579bdf0246813579bdf",
  "workflow_digest": "c8618c0481c6ebedaee10fc75c0cc758a62cab3ddc8d62971ae9680fa73b3b55"
}
```

::: details Schema: daggry/run-lock@1
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "daggry/run-lock@1",
  "title": "daggry/run-lock@1: what a run pins",
  "type": "object",
  "required": [
    "validators",
    "boundary_rules",
    "image_digest",
    "workflow_digest"
  ],
  "additionalProperties": false,
  "properties": {
    "validators": {
      "x-fact-class": "derived",
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "name",
          "version"
        ],
        "additionalProperties": false,
        "properties": {
          "name": {
            "type": "string",
            "minLength": 1
          },
          "version": {
            "type": "string",
            "minLength": 1
          }
        }
      }
    },
    "boundary_rules": {
      "type": "array",
      "items": {
        "type": "string",
        "minLength": 1
      },
      "x-fact-class": "derived"
    },
    "image_digest": {
      "type": "string",
      "minLength": 1,
      "x-fact-class": "derived"
    },
    "workflow_digest": {
      "type": "string",
      "minLength": 1,
      "x-fact-class": "derived"
    }
  }
}
```
:::

## daggry/work-item@1

The repository and the issue a run is for. The control plane seals it at run start from what it fetched about the issue. It accepts a work item only as the exact issue URL of the run's repository: `https://github.com/<owner>/<name>/issues/<n>`.

| Field | Type | Req | Class | Constraints |
|---|---|---|---|---|
| `repository` | string | yes | claimed | Pattern `^[^/\s]+/[^/\s]+$`, that is `<owner>/<name>`. |
| `issue` | object | yes | claimed | Closed object. |
| `issue.url` | string | yes | - | Non-empty. |
| `issue.number` | integer | yes | - | 1 or more. |
| `issue.title` | string | yes | - | Any string, can be empty. |
| `issue.body` | string | yes | - | Any string, can be empty. |

Both top-level fields are `claimed` because they come from a person's issue text. No gate can read them.

Example, where `<owner>/<name>` is the repository:

```json
{
  "repository": "<owner>/<name>",
  "issue": {"url": "https://github.com/<owner>/<name>/issues/1", "number": 1, "title": "Reject an empty name", "body": "An empty name is accepted today."}
}
```

::: details Schema: daggry/work-item@1
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "daggry/work-item@1",
  "title": "daggry/work-item@1: the repository and the issue a run is for",
  "type": "object",
  "required": [
    "repository",
    "issue"
  ],
  "additionalProperties": false,
  "properties": {
    "repository": {
      "type": "string",
      "pattern": "^[^/\\s]+/[^/\\s]+$",
      "x-fact-class": "claimed"
    },
    "issue": {
      "x-fact-class": "claimed",
      "type": "object",
      "required": [
        "url",
        "number",
        "title",
        "body"
      ],
      "additionalProperties": false,
      "properties": {
        "url": {
          "type": "string",
          "minLength": 1
        },
        "number": {
          "type": "integer",
          "minimum": 1
        },
        "title": {
          "type": "string"
        },
        "body": {
          "type": "string"
        }
      }
    }
  }
}
```
:::

## Fact classes by kind

Every field has one class. A gate reads only `derived` fields. `judged` is a class for fields that a language-model verdict sets under a rubric a person approved for one named criterion.

| Kind | `derived` (readable) | `claimed` (refused) | No class (refused) |
|---|---|---|---|
| `plan` | none | `criteria` | |
| `measurement` | `label`, `criterion`, `exit_code`, `tests` | `revision` | |
| `verdict` | `status`, every fact name in `facts` | | `validator`, `version`, `findings` |
| `approval` | all seven fields | | |
| `change` | `frozen` | `revision`, `paths` | |
| `observation` | all five fields | | |
| `run-lock` | all four fields | | |
| `work-item` | | `repository`, `issue` | |

Every `meta` value is `derived`, because code stamps it. Any field a schema does not list has no class.

## Validators

A validator is code that turns sealed input artifacts into a verdict: a status, findings and derived facts. It reads nothing but those inputs, and the control plane seals the result as a `verdict`. The same code runs as a preview in the pod and as the judge in the control plane. Only the judge's verdicts open gates. See [Why you can trust a run](/guide/concepts/trust).

### Validator output

A verdict has a `status` of `pass`, `fail` or `inconclusive`. A validator always emits `derived` facts, never `claimed` ones. A fact value is a boolean, an integer or a string. A fact name starts with a letter or `_`, then letters, digits, `_` or `-`, and is unique within a verdict. The same inputs always give an equal verdict. If an input is missing or malformed, the verdict is `inconclusive` with no facts, and it is still sealed.

### Built-in validators

All three are version `0.1.0`.

| Validator | Reads | Facts | Status |
|---|---|---|---|
| `criterion-coverage` | One `plan` and one `head` measurement. | `criteria_covered` (integer), `criteria_uncovered` (integer), `all_covered` (boolean) | `pass` when every criterion is covered, else `fail`. Uncovered ids go to findings as `uncovered: <id>`, sorted. |
| `red-proof` | One `red` measurement. | `red` (boolean) | `pass` when red, else `fail` with the first reason as a finding. |
| `base-relative` | One `base` and one `head` measurement. | `tests_removed` (integer), `tests_newly_skipped` (integer) | `fail` when either count is not 0, else `pass`. Names go to findings as `removed: <name>` and `newly skipped: <name>`, sorted. |

### Coverage and the carry rule

A criterion is covered when a `passed` test on head carries its id. A failed or ignored test covers nothing. One passing test among several that carry the id is enough. A repeated plan id counts once.

A test carries an id when, after lowercasing the id and the test title and replacing every non-alphanumeric character with `_`, the id occurs in the title standing between characters that are not letters or digits, or at an end. So `AC-1` is carried by `tests::ac_1_rejects_empty` and is not carried by a test for `AC-10`. An id with no alphanumeric character carries nothing.

### Red proof

A `red` measurement is red when the exit code is not 0 and a test whose title carries the criterion id has the outcome `failed`. A run with no test records, such as a compile failure, is not red.

| Finding | Meaning |
|---|---|
| `no test records` | The run recorded no tests. |
| `exit code is zero` | The command passed. |
| `no test carries <id>` | No test title carries the criterion id. |
| `no test carrying <id> failed` | The tests that carry the id did not fail. |

### Base-relative facts

| Fact | Counts |
|---|---|
| `tests_removed` | Tests in the base measurement that are absent from the head. A rename counts. |
| `tests_newly_skipped` | Tests not `ignored` in base and `ignored` in head. |

A test name that appears twice in one measurement counts as its last record.

### Malformed measurements

One malformed measurement makes every validator that reads measurements return `inconclusive`. A measurement is malformed when:

- `label` is not `base`, `head` or `red`.
- `criterion` is missing on `red`, or present on `base` or `head`.
- `revision` is not 40 lowercase hex digits.
- `exit_code`, `tests`, or any test's `name` or `outcome` is missing or mistyped.

### Measure, preview and judge

| Part | Where | What | Counts as evidence |
|---|---|---|---|
| measure | The `verify` step, in the job's pod. | Runs the project's test command on a clean copy of the sealed commit, as a different unix user, after the agent process has ended. Reduces the output to a measurement. | Yes, once the control plane seals it as a `measurement`. |
| preview | The pod, through the `validate` tool. | Runs the same validators for fast feedback. Answers `status` and `findings` only. | No. Nothing is sealed. |
| judge | The control plane. | Runs validators over the small sealed records and seals a `verdict` whose parents are the inputs. | Yes. The only verdicts that open gates. |

For the command that `measure` runs and the lines it must print, see [Project profile](/reference/profile#output-contract).

The witness rule makes a reviewer's finding gate only when code can confirm what it cites: a quoted line inside a changed hunk of the head, or a failing test that code runs. Any other finding is advice. A finding that cannot be confirmed never accepts work.
