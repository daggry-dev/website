# Artifact kinds

*Reference*

Everything a run does lands in the evidence trail as a sealed record, and every record has one of nine kinds. This page lists each kind's body fields, its constraints, a valid example and who seals it. Read it if you write gates, judges or tools that read the trail. The envelope around every body is in [Evidence envelope](/reference/envelope).

A kind's namespace says who defines it: `evidence` holds five general kinds, and `daggry` holds Daggry's own four. For the naming and versioning rules, see [Versioning](/reference/open-formats#versioning).

The example bodies on this page are illustrative. Each is valid under the schema and the policy rules that follow it. Digests shown as short strings such as `ab` pass the schemas, which require only a non-empty string. Real digests are 64 lowercase hex digits.

<KindMap />

The diagram shows the nine kinds and what seals each. For the same list by step, see [What each step seals](/reference/workflow-schema#what-each-step-seals).

## Download

Every kind has a published JSON Schema (draft 2020-12) for its `body`, and so does the envelope. The table links each file.

| Schema | File |
|---|---|
| `evidence/envelope@1` | [evidence-envelope-v1.json](/schemas/evidence-envelope-v1.json) |
| `evidence/plan@1` | [evidence-plan-v1.json](/schemas/evidence-plan-v1.json) |
| `evidence/measurement@1` | [evidence-measurement-v1.json](/schemas/evidence-measurement-v1.json) |
| `evidence/verdict@1` | [evidence-verdict-v1.json](/schemas/evidence-verdict-v1.json) |
| `evidence/approval@1` | [evidence-approval-v1.json](/schemas/evidence-approval-v1.json) |
| `evidence/input@1` | [evidence-input-v1.json](/schemas/evidence-input-v1.json) |
| `daggry/change@1` | [daggry-change-v1.json](/schemas/daggry-change-v1.json) |
| `daggry/observation@1` | [daggry-observation-v1.json](/schemas/daggry-observation-v1.json) |
| `daggry/run-lock@1` | [daggry-run-lock-v1.json](/schemas/daggry-run-lock-v1.json) |
| `daggry/work-item@1` | [daggry-work-item-v1.json](/schemas/daggry-work-item-v1.json) |

The result document a validator you define writes is not a sealed kind. Its schema, `daggry/result@1`, is in [Project config](/reference/project-config#result-document).

## The nine kinds

The table lists each kind, what it holds and who seals it. For the records each step kind of a workflow seals, see [What each step seals](/reference/workflow-schema#what-each-step-seals).

| Kind | Holds | Sealed by |
|---|---|---|
| `evidence/plan@1` | The acceptance criteria an agent plans. | Control plane, from an agent step's submitted record. |
| `evidence/measurement@1` | What a validator reported on one version of the workspace. | Control plane, from the runner's record of a validator's run. |
| `evidence/verdict@1` | What a judge decided from the evidence trail in a `verify` step. | Control plane, from the judge's verdict body. |
| `evidence/approval@1` | A person's yes, bound to one digest. | Control plane, when an approver says yes: a reaction, an approving review, a clear yes in words or `daggry approve`. |
| `evidence/input@1` | Something said in the thread of a run. | Control plane, when a comment arrives, a reviewer persona posts a finding or a merge fails. |
| `daggry/change@1` | A version of the workspace, the paths it changed and the frozen set. | Control plane, after it accepts an agent or command step. |
| `daggry/observation@1` | Something that happened in a run: a protected path was restored, a step failed, an effect delivered its result or a gate allowed an effect with no person. | Control plane, from the runner's report or from its own state. |
| `daggry/run-lock@1` | What a run pins. | Control plane, at run start. |
| `daggry/work-item@1` | The objective of a run, and the workspace and request it is for. | Control plane, at run start. |

Each kind is a JSON Schema (draft 2020-12) for the artifact's `body`. Every object in every schema refuses unknown fields. The schema's `$id` is the kind. Every kind is at major version `1`.

A workflow and a gate name a kind by its bare name (`plan`, `change`), which is unique across both namespaces.

A name that the `evidence` or the `daggry` namespace lacks (`evidence/change@1`, `daggry/plan@1`) is refused as an unknown kind. So is a kind in another namespace (`acme/plan@1`), unless the tenant registers it in `extensions.artifact_kinds` of the [Tenant config](/reference/tenant-config#extensions). A known name at another major (`evidence/plan@2`) is refused as an unknown major.

A body that does not fit its schema is refused with the JSON pointer of the offending value: ``body of `<kind>`: <message> (at `<location>`)``.

### Reading the field tables

Each field table has these two columns besides the name, the type and the constraints.

| Column | Meaning |
|---|---|
| Req | Whether the schema requires the field. |
| Class | The field's fact class: `claimed` (an agent wrote it), `derived` (code computed it from sealed inputs), `judged` (a rubric judge's answer) or `-` (no class). A gate reads `derived` fields, and `judged` fields once a person approves the rubric. See [Gate expressions](/reference/gates). |

### Who seals what

The control plane seals every kind. The table lists the artifact id and the `parents` of each.

| Kind | Artifact id | `parents` |
|---|---|---|
| `run-lock` | `run-lock` | none, because it starts the run |
| `work-item` | `work-item` | none, because it starts the run |
| `plan` | `<step>-<n>` | the artifacts it builds on, such as the work item |
| `measurement` | `<step>-head` for the canonical validator, `<step>-head-<name>` for any other validator you define, `<step>-red` | the change it measured |
| `change` | `change-<n>` | the plan it implements |
| `observation` | `<step>-restored-<n>`, `observation-<n>`, `<step>-delivered`, `<step>-allowed` | the artifacts it concerns. For `effect-delivered`, the change it delivered |
| `verdict` | `verdict-<n>` | the digests of the inputs judged |
| `approval` | `approval-<n>` | the one bound artifact |
| `input` | `input-<n>` | the one bound artifact |

For the `meta` keys stamped on each kind, including the persona of an `agent` step, see [Stamped keys](/reference/envelope#stamped-keys).

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

The result of one validator on one version of the workspace. A measurement names the validator you define that ran and its output format, and holds the exit code, an outcome, the findings and the metrics.

A `verify` step seals one measurement for each validator you define it runs. See [Validators](/reference/validators#how-daggry-reads-the-output).

| Field | Type | Req | Class | Constraints |
|---|---|---|---|---|
| `label` | string | yes | derived | Non-empty. Policy: `base`, `head` or `red`. |
| `revision` | string | yes | claimed | Non-empty. The version of the workspace that was measured. In a git workspace it is a commit, as 40 lowercase hex digits. |
| `criterion` | string | no | derived | Non-empty when present. Policy: required for `red`, refused for `base` and `head`. |
| `exit_code` | integer | yes | derived | Any integer. |
| `validator` | string | no | derived | The name of the validator you define that ran, as its declaration names it: a lowercase letter, then lowercase letters, digits, `-` or `_`. |
| `output` | string | no | derived | Non-empty. The output format of the validator: `exit-code`, `document` or the plain name of a tool format, such as `junit`. |
| `outcome` | string | no | derived | `pass`, `fail` or `error`. See [Outcome](#outcome). |
| `findings` | array of objects | no | derived | Can be empty. |
| `findings[].id` | string | yes | - | Non-empty. |
| `findings[].outcome` | string | yes | - | `pass`, `fail`, `error` or `skip`. |
| `findings[].locator` | string | no | - | Non-empty when present. Where the finding is, as the result document gives it. |
| `findings[].path` | string | no | - | Non-empty when present. The path part of the locator, when the locator names a file of the workspace. |
| `findings[].message` | string | yes | - | Any string, can be empty. |
| `metrics` | map | no | derived | From a name to a number. A name starts with a lowercase letter and holds lowercase letters, digits and `_`. |

The control plane fills `validator`, `output`, `outcome`, `findings` and `metrics` on every measurement it seals. The findings and the metrics come from the [result document](/reference/project-config#result-document) of the validator, unchanged.

The table lists the policy rules that Daggry applies after the schema.

| Rule | Refusal |
|---|---|
| `label` is `base`, `head` or `red`. | `` `x` is not one of `base`, `head`, `red` `` at `/label`. |
| `revision` has the form of a version of the workspace. | A refusal at `/revision`. |
| `red` requires `criterion`. | ``a `red` measurement requires `criterion` `` at the root. |
| `base` and `head` refuse `criterion`. | `` `criterion` is refused of a `base` or `head` measurement `` at `/criterion`. |

The table lists the labels.

| Label | What was measured |
|---|---|
| `base` | The baseline: the version of the workspace the run starts from. |
| `head` | The last sealed version. |
| `red` | The baseline with a proof step's new frozen paths overlaid, by the canonical validator. It carries the criterion id it proves. See [Baseline proof](/reference/conformance#baseline-proof). |

`revision` is `claimed`, so a gate cannot read it. The control plane separately checks that a `head` measurement's `revision` equals the last sealed version. `inputs.measurement.exit_code == 0` and `inputs.measurement.outcome == 'pass'` are usable gate reads.

### Outcome

`outcome` says in one word what the validator reported.

| Outcome | When |
|---|---|
| `pass` | The exit code is 0, the result is readable in its output format, a result document says `pass` and every threshold on the validator holds. |
| `fail` | The exit code is not 0, a result document says `fail`, or a threshold on the validator is missed. |
| `error` | Daggry can read no result: the validator ran past its `timeout`, its result document is missing or invalid, or the document says `error`. An `error` counts as a failed validator. |

### Threshold findings

Each threshold in `verification.thresholds` adds one finding to the measurement of the validator it reads, whatever the output format.

| Field | Value |
|---|---|
| `id` | `threshold:<read>`, with the threshold's `read` value. |
| `outcome` | `pass` when the limit holds, `fail` when it is missed, `error` when the number cannot be read. |
| `message` | The value read and the limit. |

A threshold finding with the outcome `fail` or `error` makes the measurement's `outcome` `fail`.

### Examples

The first measurement is of a canonical validator with `output: document`. One finding failed, and a threshold on a metric holds:

```json
{
  "label": "head",
  "revision": "v-0042",
  "exit_code": 1,
  "validator": "review",
  "output": "document",
  "outcome": "fail",
  "findings": [
    {"id": "ac_1_summary_present", "outcome": "pass", "locator": "handbook/leave.md", "path": "handbook/leave.md", "message": ""},
    {"id": "ac_2_sentence_length", "outcome": "fail", "locator": "handbook/pay.md:14", "path": "handbook/pay.md", "message": "The sentence has 41 words. The limit is 30."},
    {"id": "threshold:metrics.reading_grade", "outcome": "pass", "message": "metrics.reading_grade is 8, max is 9"}
  ],
  "metrics": {"pages": 12, "reading_grade": 8}
}
```

The second is of a software project's tests, read through the `libtest` format. One test is skipped, so a threshold on the count of skipped findings is missed:

```json
{
  "label": "head",
  "revision": "2f6c1e0b9a7d4c3e8f5a1b2c3d4e5f6a7b8c9d0e",
  "exit_code": 0,
  "validator": "test",
  "output": "libtest",
  "outcome": "fail",
  "findings": [
    {"id": "cart::tests::ac_1_rejects_empty", "outcome": "pass", "message": ""},
    {"id": "cart::tests::ac_2_rejects_long_name", "outcome": "skip", "message": ""},
    {"id": "threshold:findings.skip", "outcome": "fail", "message": "findings.skip is 1, max is 0"}
  ]
}
```

`v-0042` stands for a version id. In a git workspace a version id is a commit, as in the second example.

::: details Schema: evidence/measurement@1
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "evidence/measurement@1",
  "title": "evidence/measurement@1: what a validator reported on one version of the workspace",
  "type": "object",
  "required": [
    "label",
    "revision",
    "exit_code"
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
    "validator": {
      "type": "string",
      "pattern": "^[a-z][a-z0-9_-]*$",
      "x-fact-class": "derived"
    },
    "output": {
      "type": "string",
      "minLength": 1,
      "x-fact-class": "derived"
    },
    "outcome": {
      "enum": [
        "pass",
        "fail",
        "error"
      ],
      "x-fact-class": "derived"
    },
    "findings": {
      "x-fact-class": "derived",
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "id",
          "outcome",
          "message"
        ],
        "additionalProperties": false,
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
          "path": {
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
      },
      "x-fact-class": "derived"
    }
  }
}
```
:::

## evidence/verdict@1

What a judge decided from the evidence trail in a `verify` step: an outcome, findings and facts. Daggry seals one verdict for each judge, and only those verdicts open gates. For who judges and how, see [Judges](/reference/judges).

| Field | Type | Req | Class | Constraints |
|---|---|---|---|---|
| `judge` | string | yes | - | The judge that returned the verdict: `default`, `coverage`, `no_regression`, `baseline_proof` or the name of a judge you declare. |
| `version` | string | yes | - | Non-empty. The version of the judge. See [Versioning](/reference/conformance#versioning). |
| `outcome` | string | yes | derived | `pass`, `fail` or `error`. `error` when an input is missing or malformed. See [Verdict rules](/reference/conformance#facts-and-verdict-rules). |
| `findings` | array of objects | yes | - | The same fields as the findings of a measurement: `id`, `outcome`, `message`, and optionally `locator` and `path`. Can be empty. |
| `facts` | array of objects | yes | derived or judged | Each fact has a `name`, a `class` and a `value`. |
| `facts[].name` | string | yes | - | Non-empty. A stricter grammar applies. See [Verdict rules](/reference/conformance#facts-and-verdict-rules). |
| `facts[].class` | string | yes | - | `derived`, or `judged` for the facts of a [rubric judge](/reference/judges#rubric-judge). |
| `facts[].value` | boolean, integer or string | yes | - | A float is refused. |

A gate reads `verdict.outcome` and `verdict.<fact name>`. `verdict.findings`, `verdict.judge` and `verdict.version` have no class and are refused.

The verdict's `parents` are the digests of the records the judge was given.

Example: the verdict of the `coverage` judge over a plan with `AC-1` and `AC-2`, and a head measurement where only a finding for `AC-1` passed.

```json
{
  "judge": "coverage",
  "version": "0.1.0",
  "outcome": "fail",
  "findings": [
    {"id": "AC-1", "outcome": "pass", "message": ""},
    {"id": "AC-2", "outcome": "fail", "message": "no passing finding carries this id"}
  ],
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
  "title": "evidence/verdict@1: what a judge decided from the evidence trail in a verify step. A gate reads verdict.<fact name> and verdict.outcome",
  "type": "object",
  "required": [
    "judge",
    "version",
    "outcome",
    "findings",
    "facts"
  ],
  "additionalProperties": false,
  "properties": {
    "judge": {
      "type": "string",
      "minLength": 1,
      "description": "The judge that returned this verdict: default, coverage, no_regression, baseline_proof or the name of a judge you declare."
    },
    "version": {
      "type": "string",
      "minLength": 1,
      "description": "The version of the judge."
    },
    "outcome": {
      "enum": [
        "pass",
        "fail",
        "error"
      ],
      "x-fact-class": "derived"
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
          "path": {
            "type": "string",
            "minLength": 1
          },
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
            "enum": [
              "derived",
              "judged"
            ],
            "description": "derived: computed by code. judged: a rubric judge's answer under a rubric a person approved."
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

The table lists how the CLI path fills the body.

| Command | `subject` | `path` | `digest` | Parent |
|---|---|---|---|---|
| `daggry approve <run-id>` | The run id. | `null` | The hex digest of what the `of` of the `human` step last sealed: a plan, or the latest change. | That artifact. |
| `daggry approve <run-id> --unfreeze <path>` | The run id. | The path. | The frozen file digest that the latest `change` records for the path. | That `change`. |

`source_ref`, `cited_phrase` and `intent_read` are `null` on the CLI path. `author` is the identity of the caller. An approval from the thread carries the id of the comment, the reaction or the review in `source_ref`. When the approver wrote words, it also carries the phrase that was read as the yes and how it was read.

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

## evidence/input@1

Something said in the thread of a run: a comment on the issue, a review comment on the pull request, a finding of a reviewer persona, or the reason a merge failed. Daggry seals it when it arrives, at any time in the run, and the persona that works next reads it. An input never approves anything. For who is heard, see [Who Daggry listens to](/reference/conversation#who-daggry-listens-to).

| Field | Type | Req | Class | Constraints |
|---|---|---|---|---|
| `subject` | string | yes | derived | Non-empty. The id of the latest sealed plan or change when the input arrived. |
| `digest` | string | yes | derived | Non-empty. The digest of that artifact. |
| `source_ref` | string or null | yes | derived | The id of the comment. `null` for an input from code. |
| `author` | string | yes | derived | Non-empty. Who said it. |
| `tier` | string | yes | derived | `approver`, `writer` (a person who can write to the repository and is not an approver), `persona` or `code`. |
| `locator` | string | no | derived | For a review comment: the file and line, as `<path>:<line>`. |
| `review_state` | string | no | derived | For a pull request review: `approve`, `request-changes` or `comment`. |
| `text` | string | yes | claimed | What was said, as written. A gate cannot read it. |

Examples: a reply on the issue, and one comment of a review that requests changes.

```json
{"subject": "plan-1", "digest": "ab", "source_ref": "issue-comment-2291", "author": "github:4411", "tier": "approver", "text": "Yes, include archived orders."}
```

```json
{"subject": "change-4", "digest": "cd", "source_ref": "review-comment-881", "author": "github:7302", "tier": "writer", "locator": "src/orders/export.ts:42", "review_state": "request-changes", "text": "Quote fields that contain a comma."}
```

::: details Schema: evidence/input@1
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "evidence/input@1",
  "title": "evidence/input@1: something said in the thread of a run, bound to one digest",
  "type": "object",
  "required": [
    "subject",
    "digest",
    "source_ref",
    "author",
    "tier",
    "text"
  ],
  "additionalProperties": false,
  "properties": {
    "subject": {
      "type": "string",
      "minLength": 1,
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
    "author": {
      "type": "string",
      "minLength": 1,
      "x-fact-class": "derived"
    },
    "text": {
      "type": "string",
      "x-fact-class": "claimed"
    },
    "tier": {
      "enum": [
        "approver",
        "writer",
        "persona",
        "code"
      ],
      "x-fact-class": "derived"
    },
    "locator": {
      "type": "string",
      "minLength": 1,
      "x-fact-class": "derived"
    },
    "review_state": {
      "enum": [
        "approve",
        "request-changes",
        "comment"
      ],
      "x-fact-class": "derived"
    }
  }
}
```
:::

## daggry/change@1

A change is a set of differences made to the workspace. The record holds the version of the workspace the change ends at, the paths it changed and the run's frozen set at that seal.

| Field | Type | Req | Class | Constraints |
|---|---|---|---|---|
| `revision` | string | yes | claimed | Non-empty. The version of the workspace. In a git workspace it is a commit. |
| `paths` | array of strings | yes | claimed | Each non-empty. The paths the step changed against the last sealed version. |
| `frozen` | array of objects | yes | derived | Can be empty. |
| `frozen[].path` | string | yes | - | Non-empty. |
| `frozen[].digest` | string | yes | - | Non-empty. The digest of the file's content, as the workspace store names it. |

The frozen set holds each path of a proof step's change that matches the step's `freeze` globs, with its file digest. The set carries forward: each new `change` holds the previous frozen set plus new frozen paths. An unfrozen path is re-entered at its new digest, or dropped if the file is gone. The set is frozen for every later step of the run. See [Frozen paths](/reference/protected-paths#frozen-paths).

The control plane seals a `change` after an accepted `agent` or `command` step. A `verify` step seals none.

Example:

```json
{
  "revision": "v-0042",
  "paths": ["handbook/pay.md", "checks/ac-2-sentence-length.rule"],
  "frozen": [{"path": "checks/ac-2-sentence-length.rule", "digest": "5ba93c9db0cff93f52b521d7420e43f6eda2784f"}]
}
```

::: details Schema: daggry/change@1
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "daggry/change@1",
  "title": "daggry/change@1: a version of the workspace, the paths it changed and the frozen set",
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
      "minLength": 1,
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

Something that happened in a run, kept in the trail for the record. No judge of Daggry's own decides from it. One schema admits four records, selected by `event`.

| Field | Type | Req | Class | Constraints |
|---|---|---|---|---|
| `event` | string | yes | derived | `protected-restored`, `step-failed`, `effect-delivered` or `auto-allowed`. |
| `reason` | string | by event | derived | Non-empty. Required for `protected-restored` and `step-failed`. Refused for `effect-delivered`. |
| `path` | string | by event | derived | Non-empty. Required for `protected-restored`. Refused for the others. |
| `step` | string | by event | derived | Non-empty. Required for `step-failed`, `effect-delivered` and `auto-allowed`. Refused for `protected-restored`. |
| `attempt` | integer | by event | derived | 1 or more. Required for `step-failed`. Refused for the others. |
| `effect` | string | by event | derived | Non-empty. The name of the effect. Required for `effect-delivered`. Refused for the others. |
| `ref` | string | by event | derived | Non-empty. What names the delivered result, such as the URL of a pull request. Required for `effect-delivered`. Refused for the others. |
| `expression` | string | by event | derived | Non-empty. The `auto_when` expression that held. Required for `auto-allowed`. Refused for the others. |
| `facts` | array of objects | by event | derived | Each a `name` and a `value`: the facts the expression read, with the values it read. Required for `auto-allowed`. Refused for the others. |

The table lists the four records.

| Record | Fields | Sealed when |
|---|---|---|
| `protected-restored` | `event`, `path`, `reason` | The runner puts a violating path back and reports it. |
| `step-failed` | `event`, `step`, `attempt`, `reason` | The control plane fails a job. `reason` is `the job ran past its timeout` or `the lease lapsed on the last allowed attempt`. |
| `effect-delivered` | `event`, `step`, `effect`, `ref` | An `effect` step delivers its result. Its parent is the change it delivered, so the trail shows which sealed change went out. |
| `auto-allowed` | `event`, `step`, `expression`, `facts` | The `auto_when` of an `effect` step held, so the effect ran with no person. The trail shows why it was allowed. See [Autonomy](/reference/workflow-schema#autonomy). |

Examples:

```json
{"event": "protected-restored", "path": "checks/ac-2-sentence-length.rule", "reason": "protected"}
```

```json
{"event": "effect-delivered", "step": "deliver", "effect": "open-pr", "ref": "https://github.com/example/shop-web/pull/42"}
```

```json
{"event": "auto-allowed", "step": "merge", "expression": "run.within.docs && run.changed_lines <= 200", "facts": [{"name": "run.within.docs", "value": true}, {"name": "run.changed_lines", "value": 38}]}
```

::: details Schema: daggry/observation@1
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "daggry/observation@1",
  "title": "daggry/observation@1: a protected-restored, a step-failed, an effect-delivered or an auto-allowed record",
  "type": "object",
  "required": [
    "event"
  ],
  "additionalProperties": false,
  "properties": {
    "event": {
      "enum": [
        "protected-restored",
        "step-failed",
        "effect-delivered",
        "auto-allowed"
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
    },
    "effect": {
      "type": "string",
      "minLength": 1,
      "x-fact-class": "derived"
    },
    "ref": {
      "type": "string",
      "minLength": 1,
      "x-fact-class": "derived"
    },
    "expression": {
      "type": "string",
      "minLength": 1,
      "x-fact-class": "derived"
    },
    "facts": {
      "x-fact-class": "derived",
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "name",
          "value"
        ],
        "additionalProperties": false,
        "properties": {
          "name": {
            "type": "string",
            "minLength": 1
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
  },
  "allOf": [
    {
      "if": {
        "properties": {
          "event": {
            "const": "protected-restored"
          }
        },
        "required": [
          "event"
        ]
      },
      "then": {
        "required": [
          "path",
          "reason"
        ],
        "properties": {
          "step": false,
          "attempt": false,
          "effect": false,
          "ref": false,
          "expression": false,
          "facts": false
        }
      }
    },
    {
      "if": {
        "properties": {
          "event": {
            "const": "step-failed"
          }
        },
        "required": [
          "event"
        ]
      },
      "then": {
        "required": [
          "step",
          "attempt",
          "reason"
        ],
        "properties": {
          "path": false,
          "effect": false,
          "ref": false,
          "expression": false,
          "facts": false
        }
      }
    },
    {
      "if": {
        "properties": {
          "event": {
            "const": "effect-delivered"
          }
        },
        "required": [
          "event"
        ]
      },
      "then": {
        "required": [
          "step",
          "effect",
          "ref"
        ],
        "properties": {
          "path": false,
          "attempt": false,
          "reason": false,
          "expression": false,
          "facts": false
        }
      }
    },
    {
      "if": {
        "properties": {
          "event": {
            "const": "auto-allowed"
          }
        },
        "required": [
          "event"
        ]
      },
      "then": {
        "required": [
          "step",
          "expression",
          "facts"
        ],
        "properties": {
          "path": false,
          "attempt": false,
          "reason": false,
          "effect": false,
          "ref": false
        }
      }
    }
  ]
}
```
:::

## daggry/run-lock@1

What a run pins at start: the validators, the judges, the personas, the boundary rules, the image and the workflow. It is the first record of a run, so the trail shows which rules and which instructions the run worked under.

| Field | Type | Req | Class | Constraints |
|---|---|---|---|---|
| `validators` | array of objects | yes | derived | The validators the run uses. |
| `validators[].validator` | string | yes | - | Non-empty. The validator's reference. See [Versioning](/reference/conformance#versioning). |
| `validators[].version` | string | yes | - | Non-empty. |
| `judges` | array of objects | yes | derived | The judges the run uses, the default judge included. |
| `judges[].judge` | string | yes | - | Non-empty. The judge's reference. |
| `judges[].version` | string | yes | - | Non-empty. |
| `personas` | array of objects | yes | derived | The personas the run's `agent` steps name. Empty when the workflow has no `agent` step. |
| `personas[].persona` | string | yes | - | Non-empty. The persona's name. |
| `personas[].engine` | string | yes | - | Non-empty. The engine the persona runs on. |
| `personas[].digest` | string | yes | - | Non-empty. The digest of the persona's instructions. Every record an `agent` step seals carries the same value in `daggry/persona_digest`. |
| `boundary_rules` | array of strings | yes | derived | Each non-empty. |
| `image_digest` | string | yes | derived | Non-empty. The digest of the job image. |
| `workflow_digest` | string | yes | derived | Non-empty. SHA-256 hex of the exact bytes of the workflow file. |

`boundary_rules` holds one string per rule: `always <glob>` for each always-protected glob, then `scope <step id>: <nothing|anywhere|glob>` for each step scope, in workflow order, one string per glob for a glob list. The control plane reads the rules back when it rechecks a step. A step with no scope in the lock can write nothing.

The workflow text is also held as a blob under `workflow_digest`, so `daggry verify` covers it by re-hashing.

Example for a three-step workflow. The list of `always` rules is shortened here; a real lock lists every always-protected glob first.
The workflow has three steps: `plan` with scope `nothing`, `draft` with scope `handbook/**` and `checks/**`, and `render` with scope `anywhere`. `plan` names the persona `planner` and `draft` names `writer`. `<engine>` stands for the name of an engine in the tenant config.

```json
{
  "validators": [
    {"validator": "review", "version": "v-0042"}
  ],
  "judges": [
    {"judge": "default", "version": "0.1.0"},
    {"judge": "coverage", "version": "0.1.0"},
    {"judge": "no_regression", "version": "0.1.0"},
    {"judge": "baseline_proof", "version": "0.1.0"}
  ],
  "personas": [
    {"persona": "planner", "engine": "<engine>", "digest": "ab"},
    {"persona": "writer", "engine": "<engine>", "digest": "cd"}
  ],
  "boundary_rules": [
    "always .daggry/**", "always **/AGENTS.md", "always .agents/**", "always **/SKILL.md",
    "always **/.mcp.json",
    "scope plan: nothing", "scope draft: handbook/**", "scope draft: checks/**", "scope render: anywhere"
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
    "judges",
    "personas",
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
          "validator",
          "version"
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
          }
        }
      }
    },
    "judges": {
      "x-fact-class": "derived",
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "judge",
          "version"
        ],
        "additionalProperties": false,
        "properties": {
          "judge": {
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
    "personas": {
      "x-fact-class": "derived",
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "persona",
          "engine",
          "digest"
        ],
        "additionalProperties": false,
        "properties": {
          "persona": {
            "type": "string",
            "minLength": 1
          },
          "engine": {
            "type": "string",
            "minLength": 1
          },
          "digest": {
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

The objective of a run: what was asked, and where the request came from. The control plane seals it when the run starts, so the trail shows what the run was asked to do before any agent worked. Every `agent` step is given the objective, and the record never changes: later replies from a person are sealed as [`input`](#evidence-input-1) records.

The table lists the fields that every work item has.

| Field | Type | Req | Class | Constraints |
|---|---|---|---|---|
| `objective` | string | yes | claimed | Non-empty. What the run is asked to do. For an issue, its title and body when the run starts. For a trigger with an `objective`, that text. For `daggry run --objective`, the text given. |
| `origin` | string | yes | derived | Where the objective came from: `issue`, `pull-request`, `trigger` or `command`. |
| `trigger` | string | no | derived | The name of the trigger that started the run. |
| `event` | object | no | derived | Fields of the event that started the run, such as the label or the time of a schedule. Each value is a string, an integer or a boolean. |

The record also names what the run works on, in one of two forms. A body holds exactly one of them.

| Form | Fields | Used by |
|---|---|---|
| General | `workspace` and `request`. | Any kind of work. |
| Software | `repository` and `issue`. | A software project, where the work item is an issue. See [Workspaces and work items](/reference/project-config#workspaces-and-work-items). |

| Field | Type | Req | Class | Constraints |
|---|---|---|---|---|
| `workspace` | string | general form | claimed | Non-empty. The workspace, as the tenant config names it. |
| `request` | object | general form | claimed | Closed object: `ref` (non-empty: what names the request where it comes from, such as a URL or an id), `title` and `body` (strings). Daggry seals a reference it cannot read as it is and hands it on. |
| `repository` | string | software form | claimed | Pattern `^[^/\s]+/[^/\s]+$`. |
| `issue` | object | software form | claimed | Closed object: `url` (non-empty string), `number` (integer, 1 or more), `title` and `body` (strings). |

The text fields are `claimed` because they come from a person's text, and no gate can read them. An objective is data for a persona, never a rule: it cannot widen a scope or open a gate.

Examples: an objective from an issue, and a standing objective from a schedule.

```json
{
  "objective": "Export orders as CSV\n\nCustomers need their orders as a file they can open in a spreadsheet.",
  "origin": "issue",
  "trigger": "factory_label",
  "event": {"label": "factory"},
  "repository": "example/shop-web",
  "issue": {"url": "https://github.com/example/shop-web/issues/118", "number": 118, "title": "Export orders as CSV", "body": "Customers need their orders as a file they can open in a spreadsheet."}
}
```

```json
{
  "objective": "Find and fix one defect in the app area. Prove it with a failing test first.",
  "origin": "trigger",
  "trigger": "nightly_hunt",
  "event": {"scheduled_for": "2026-11-26T02:00:00Z"},
  "workspace": "example/shop-web",
  "request": {"ref": "nightly_hunt/2026-11-26", "title": "Nightly bug hunt", "body": ""}
}
```

::: details Schema: daggry/work-item@1
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "daggry/work-item@1",
  "title": "daggry/work-item@1: the objective of a run, and the workspace and request it is for",
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "objective": {
      "type": "string",
      "minLength": 1,
      "x-fact-class": "claimed",
      "description": "What the run is asked to do, as text. For an issue, its title and body when the run starts."
    },
    "origin": {
      "enum": [
        "issue",
        "pull-request",
        "trigger",
        "command"
      ],
      "x-fact-class": "derived",
      "description": "Where the objective came from."
    },
    "trigger": {
      "type": "string",
      "minLength": 1,
      "x-fact-class": "derived",
      "description": "The name of the trigger that started the run."
    },
    "event": {
      "x-fact-class": "derived",
      "type": "object",
      "additionalProperties": {
        "type": [
          "string",
          "integer",
          "boolean"
        ]
      },
      "description": "Fields of the event that started the run, such as a label or a schedule time."
    },
    "workspace": {
      "type": "string",
      "minLength": 1,
      "x-fact-class": "claimed"
    },
    "request": {
      "x-fact-class": "claimed",
      "type": "object",
      "required": [
        "ref",
        "title",
        "body"
      ],
      "additionalProperties": false,
      "properties": {
        "ref": {
          "type": "string",
          "minLength": 1
        },
        "title": {
          "type": "string"
        },
        "body": {
          "type": "string"
        }
      }
    },
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
  },
  "oneOf": [
    {
      "required": [
        "objective",
        "origin",
        "workspace",
        "request"
      ],
      "properties": {
        "repository": false,
        "issue": false
      }
    },
    {
      "required": [
        "objective",
        "origin",
        "repository",
        "issue"
      ],
      "properties": {
        "workspace": false,
        "request": false
      }
    }
  ]
}
```
:::

## Fact classes by kind

Every field has one class or none, and a gate reads `derived` fields and approved `judged` fields. For what the classes mean, see [Fact classes](/reference/gates#fact-classes). The table gives the class of every top-level body field of every kind.

| Kind | Field | Class |
|---|---|---|
| `evidence/plan@1` | `criteria` | claimed |
| `evidence/measurement@1` | `label`, `criterion`, `exit_code`, `validator`, `output`, `outcome`, `findings`, `metrics` | derived |
| | `revision` | claimed |
| `evidence/verdict@1` | `outcome`, and every fact name | derived, or judged for a rubric judge's fact |
| | `judge`, `version`, `findings` | none |
| `evidence/approval@1` | `subject`, `path`, `digest`, `source_ref`, `cited_phrase`, `intent_read`, `author` | derived |
| `evidence/input@1` | `subject`, `digest`, `source_ref`, `author`, `tier`, `locator`, `review_state` | derived |
| | `text` | claimed |
| `daggry/change@1` | `frozen` | derived |
| | `revision`, `paths` | claimed |
| `daggry/observation@1` | `event`, `path`, `reason`, `step`, `attempt`, `effect`, `ref`, `expression`, `facts` | derived |
| `daggry/run-lock@1` | `validators`, `judges`, `personas`, `boundary_rules`, `image_digest`, `workflow_digest` | derived |
| `daggry/work-item@1` | `objective`, `workspace`, `request`, `repository`, `issue` | claimed |
| | `origin`, `trigger`, `event` | derived |

Only a top-level property of a body is readable. Every `meta` value is `derived`, because code stamps it. A field a schema does not list has no class.
