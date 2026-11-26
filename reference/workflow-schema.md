# Workflow file

*Reference*

A workflow is one YAML file that lists the steps of a piece of work, in order. This page defines every key you write: the file shape, the five step kinds, scope, the loop and one worked example. Read it when you write or review a workflow. To write your first one, follow [Write a workflow](/guide/how-to/write-a-workflow). For how Daggry loads a file and what it refuses, see [Workflow rules](/reference/workflow-rules).

Every step ends with a seal. Daggry checks what the step produced, signs it as a record and adds the record to the evidence trail, so the trail shows which step did what, in order. Each step kind on this page says what it seals.

The examples on this page are illustrative.

<WorkflowAnatomy />

The diagram shows a workflow from top to bottom: an `agent` step that names a persona, an approval, a loop that repeats until its gate holds, and an effect. Beside each part it names the records the part seals.

## File shape

A workflow file has a header and a list of steps.

```yaml
format: daggry/workflow@1
steps:
  - id: render
    kind: command
    run: [sh, scripts/render.sh]
    scope: anywhere
```

The table lists the two keys.

| Key | Required | Meaning |
|---|---|---|
| `format` | yes | Always `daggry/workflow@1`. |
| `steps` | yes | The entries of the workflow, in the order they run. An entry is a step or a [loop](#loop). |

The file holds no instructions for an agent, no objective, no validator command and no credential. The objective comes with each run: from the issue, from a trigger or from `daggry run`. A step names a persona, a validator or an effect, and the [Tenant config](/reference/tenant-config) and the [Project config](/reference/project-config) say what each name stands for. The control plane holds the workflow outside every runner, so no step can change it.

## Steps

A step has an `id`, unique in the file, and a `kind`. The table lists the five kinds.

| Kind | What it does | What it seals |
|---|---|---|
| [`agent`](#agent) | A persona does work and hands in the outputs the step names. | A `change`, each named output such as a `plan`, and the persona that did it. |
| [`command`](#command) | A program you name runs in the runner. | A `change`. |
| [`verify`](#verify) | Validators measure the work and judges decide. | One `measurement` for each validator and one `verdict` for each judge. |
| [`human`](#human) | A checkpoint: the run asks a person and waits. | An `approval` or an `input`, bound to the digest of what the person answered. |
| [`effect`](#effect) | Daggry delivers the result. | An `observation` that names what was delivered, and one that says why no person was needed. |

No key changes what a kind does. An `agent` step never runs your validators, and a `verify` step never starts an agent.

### agent

A persona does the work of the step. The step says who works, what they must hand in and what they can write. It holds no prompt and no task note: the persona's instructions say how the work is done, and the objective of the run says what is wanted.

```yaml
- id: plan
  kind: agent
  persona: planner
  outputs: [plan]
  scope: nothing
```

The table lists the keys.

| Key | Required | Meaning |
|---|---|---|
| `persona` | yes | The name of a persona. Daggry looks it up in the `personas` of the project config first, then of the tenant config. See [personas](/reference/tenant-config#personas). |
| `outputs` | yes | What the step must hand in, by bare name: `plan`, `change`, or `input` for a reviewer whose findings are advice. The step passes when Daggry accepts every output. |
| `scope` | yes | What the step can write. See [Scope](#scope). |
| `freeze` | no | Globs. The paths the step wrote that match them are frozen when the step is sealed. A step with `freeze` is the proof step of a loop. See [Red then green](#red-then-green). |

<PersonaReceives />

The diagram shows the five things a persona step is given, and nothing else: the persona's instructions, the objective of the run, the sealed outputs of earlier steps, the outputs it must hand in and its scope.

The objective is what the run was asked to do: the text of the issue, a trigger's standing text or the text given to `daggry run`. Daggry seals it as the work item when the run starts. The sealed outputs include a person's input and, in a repeat iteration of a loop, the findings that still fail. This is how one persona hands work to the next: a `planner` persona seals a `plan`, and a `developer` persona reads the sealed plan, never a chat history. What it hands in is a claim until Daggry accepts it.

A persona can ask. When it needs something only a person knows, it posts a question on the issue, the run waits, and the next reply from a person continues the step with that reply as input. A workflow needs no key for this.

**Sealed:** a `change` for the step's commits, and each output in `outputs`. Every record the step seals carries the persona's name and the digest of its instructions, so the trail shows who did the work and under which version of the instructions.

### command

A program runs in the runner. A failed command fails the run.

```yaml
- id: render
  kind: command
  run: [sh, scripts/render.sh]
  scope: ["site/**"]
```

The table lists the keys.

| Key | Required | Meaning |
|---|---|---|
| `run` | yes | The program and its arguments, as a list. See [Commands](/reference/project-config#commands). |
| `scope` | yes | What the step can write. See [Scope](#scope). |

**Sealed:** a `change` for what the command wrote.

### verify

Validators measure the last sealed version of the workspace, and judges decide from the evidence trail. The step holds no command: it names validators and judges.

```yaml
- id: check
  kind: verify
  validators: [project, links]
  judges: [coverage]
```

The table lists the keys.

| Key | Required | Meaning |
|---|---|---|
| `validators` | yes | One or more names, none twice. `project` is the project's default set. Any other name is a validator you declare. See [Referring to a validator](/reference/validators#referring-to-a-validator). |
| `judges` | no | Judges to run after the default judge: `coverage`, `no_regression` or a judge you declare. See [Judges](/reference/judges). |

The step passes when every verdict passes. Outside a loop, a step that does not pass fails the run. Inside a loop it ends the iteration as red. See [Loop rules](#loop-rules).

**Sealed:** one `measurement` for each validator, then one `verdict` for each judge. A gate reads the verdicts and nothing else.

### human

A checkpoint: the run asks a person and waits. Daggry posts what it wants approved on the issue, or on the pull request once one is open. The person answers there.

```yaml
- id: approve-plan
  kind: human
  of: plan
```

`of` is the one key. It names the step or loop the checkpoint is about. The table lists what a reply does.

| The person | Daggry seals | The run |
|---|---|---|
| Says yes: a thumbs-up on the request, an approving review on the pull request, or a clear yes in words | An `approval`, bound to the digest of what `of` last sealed. | Continues. |
| Says anything else | An `input`, with the reply as written. | Goes back to `of` with that reply, runs forward to this checkpoint and asks again. Only an approver's reply does this. |

Going back is how every correction works: a change to the plan, a request for changes on the pull request, a loop that ran out, a merge that failed. After three rounds without a yes, the run stops and says so.

An approval holds for one digest. When the run comes back to a checkpoint and the thing it approved is unchanged, Daggry does not ask again. When it has changed, Daggry asks again, and a yes that answered an older version is not applied.

For who can approve and how Daggry reads a reply, see [Comments and approvals](/reference/conversation). `daggry approve <run-id>` says yes from the command line.

**Sealed:** an `approval` or an `input`. Each holds the digest of what it answers, so an answer cannot be moved to another version.

### effect

Daggry delivers the result. An effect runs in the control plane, never in a runner, so no agent holds the credential that delivers.

```yaml
- id: deliver
  kind: effect
  do: open-pr
```

The table lists the effects.

| `do` | What it does |
|---|---|
| `open-pr` | Opens a pull request from the run's branch, `daggry/<run-id>`, to `main`. The title and the body come from the issue. |
| `merge-pr` | Merges the pull request the run opened, as one squashed commit. It first brings the branch up to date with `main`, runs the project's validators on the result and waits for the repository's own required checks. It never bypasses branch protection. |

An effect also takes one optional key, `auto_when`. See [Autonomy](#autonomy).

When a merge cannot happen, because of a conflict, a failing required check or a failing validator, Daggry seals the reason as an `input` and sends the run back to the `of` of the last checkpoint. No person is needed for that. The repository's own checks are a condition of the merge. They are not Daggry validators, and their results are not evidence.

An effect is safe to repeat: its key is the run id and the step id, so a retry returns the same pull request. A failing effect fails the run.

**Sealed:** an `observation` with the event `effect-delivered`, the name of the effect and what it delivered, such as the URL of the pull request.

#### Autonomy

An effect can run with no person, but only when code says the change is small and safe enough. `auto_when` is a [gate expression](/reference/gates) over sealed facts. The threshold is code, never an instruction to an agent.

```yaml
- id: merge
  kind: effect
  do: merge-pr
  auto_when: run.within.docs && run.changed_lines <= 200 && run.verdicts_failed == 0 && run.protected_touched == 0
```

The table lists what happens.

| `auto_when` | The effect |
|---|---|
| Absent | Runs when the run reaches it. A `human` step before it is how the workflow asks a person. |
| Holds | Runs with no person. Daggry first seals an `observation` with the event `auto-allowed`, the expression and the facts it read. |
| Does not hold | Waits. Daggry asks for approval on the pull request, and the effect runs once a person says yes. |

The tenant has the last word. With `effect` in `agents.approval.require` of the [Tenant config](/reference/tenant-config#agents), a person approves before every effect, whatever `auto_when` says. For the facts an expression can read, see [Run facts](/reference/gates#run-facts).

## Scope

`scope` is what a step can write. `agent` and `command` steps require it. The table lists its three forms.

| Value | The step can write |
|---|---|
| `nothing` | No path. |
| `anywhere` | Any path that is not protected. |
| A list | The paths that an entry of the list holds. An entry is a glob, such as `"docs/**"`, or an area of the project, as `area:<name>`. |

```yaml
scope: ["area:app", "CHANGELOG.md"]
```

An area is a named group of paths that the [Project config](/reference/project-config#areas) defines, so a workflow can name a part of a project without knowing its paths. No scope opens a protected path. A change outside the scope is put back and recorded as an `observation`. For how Daggry judges a scope, see [Protected paths](/reference/protected-paths#scope).

## Loop

A loop repeats its steps until the work is done, up to a limit. It has three keys: `until`, `max` and `steps`. "Done" is a gate: an expression over sealed facts, such as "every criterion is covered". A loop entry has an `id` and a `loop` key in place of `kind`.

```yaml
- id: build
  loop:
    until: verdict.all_covered
    max: 5
    steps:
      - id: work
        kind: agent
        persona: writer
        outputs: [change]
        scope: ["area:handbook"]
      - id: check
        kind: verify
        validators: [project]
        judges: [coverage]
```

Each iteration, the persona works on everything that is still open, and the `verify` step measures the whole result. The loop ends when the gate holds. Otherwise it repeats, and the persona gets only the findings that still fail.

<LoopRounds />

The diagram shows three iterations of one loop: the set of failing findings shrinks each time, the gate reads the sealed verdict after each iteration, and the loop ends when nothing is left or the limit is reached.

The table lists the keys of `loop`.

| Key | Required | Meaning |
|---|---|---|
| `until` | yes | The gate: an expression that reads sealed facts. The loop ends when it holds. See [Gate expressions](/reference/gates). |
| `max` | yes | The limit: the most iterations, 1 or more. |
| `steps` | yes | The steps of one iteration. A loop cannot hold another loop. |
| `over`, `as` | no | Slice the work into items, with one iteration for each. See [One item at a time](#one-item-at-a-time). |

**Sealed:** a loop seals nothing of its own. Each step of each iteration seals its records, so the trail holds every iteration, passed or not.

### Loop rules

The table lists how a loop counts, repeats and ends.

| Rule | Detail |
|---|---|
| Count | An iteration counts against `max` when it starts. |
| Gate | Daggry reads `until` at the end of every iteration. When it holds, the loop ends. |
| Repeat | When the gate does not hold, the steps run again. An `agent` step gets the findings that still fail, and a proof step does not run again. |
| A `verify` step that does not pass | Ends the iteration. It does not fail the run: the loop repeats. |
| Any other failure | A failed `agent` or `command` step fails the run. |
| At the limit | The run goes on to the next checkpoint, which says what is unfinished. A reply there sends the run back, and the loop gets a fresh `max`. A yes accepts the result as it is. With no checkpoint after the loop, the run fails with the reason ``loop `<id>` ran out of iterations``. |
| Coming back | When a checkpoint sends the run back, every loop on the way runs at least one iteration, whatever its gate says. |

### Red then green

A check that already passes says nothing about the work. So a loop can start with a proof step: an `agent` step with `freeze`. It writes the checks that prove the plan, one for each criterion, before any work is done.

```yaml
- id: build
  loop:
    until: verdict.all_covered
    max: 5
    steps:
      - id: proof
        kind: agent
        persona: test-writer
        outputs: [change]
        freeze: ["tests/**"]
        scope: ["tests/**"]
      - id: work
        kind: agent
        persona: implementer
        outputs: [change]
        scope: ["area:app", "tests/**"]
      - id: check
        kind: verify
        validators: [project]
        judges: [coverage]
```

1. In the first iteration, the proof step writes a check for every criterion of the plan, such as a test whose name carries the criterion id.
2. Daggry runs the project's canonical validator on the baseline with the checks added. The proof counts only when a check for every criterion fails there. The `baseline_proof` judge decides this.
3. Daggry seals the checks and freezes their paths. No later step can change them.
4. The work step does the work against the whole set of failing checks.
5. The `verify` step measures the result on a clean copy. The `coverage` judge counts the criteria that a passing check now carries.
6. While a criterion is uncovered, the loop repeats from step 4, and the persona gets the checks that still fail.

**Sealed:** before any work starts, the trail holds the `change` with the frozen checks, a `measurement` of them on the baseline and the `baseline_proof` verdict. For the exact rule, see [Baseline proof](/reference/conformance#baseline-proof). For frozen paths, see [Frozen paths](/reference/protected-paths#frozen-paths).

### One item at a time

By default one iteration works on everything that is open, which keeps handovers few: one persona start, one `verify` run and one set of records for each iteration. With `over`, the loop takes the criteria of the plan one by one instead.

```yaml
loop:
  over: plan
  as: criterion
  until: verdict.all_covered
  max: 12
  steps: [...]
```

`over: plan` names the list, the criteria of the sealed plan. `as` names the current criterion for the steps. Give both or neither. An iteration whose `verify` step passes moves to the next criterion, one that does not pass repeats the same criterion, and a proof step runs once for each criterion. The loop also ends when the list is finished. `max` counts every iteration, across all criteria.

<BatchOrItems />

The diagram compares the two shapes: one iteration for the whole plan, or one for each criterion.

Slicing pays for more starts, more `verify` runs and more records, so use it when it buys something: the criteria are large or independent, the whole plan would not fit in one session, or you want each criterion sealed and judged on its own, as a [rubric judge](/reference/judges#rubric-judge) with no fixed criterion needs.

## What each step seals

Read this section to find a step in the evidence trail. Every run opens with two records, and each step adds its own.

<StepTrail />

The diagram shows one row for each point of a run and the records it seals, in the order they join the trail. The table gives the same list.

| When | Records sealed | Kind |
|---|---|---|
| The run starts | What the run pins: the workflow, the personas, the validators and the judges, each by digest. The objective: what was asked, and whether an issue, a trigger or a command asked it. | `run-lock`, `work-item` |
| An `agent` step | The change, and each named output. Each carries the persona and the digest of its instructions. | `change`, `plan` |
| A proof step | The change with the frozen checks, the checks measured on the baseline, and the verdict on them. | `change`, `measurement`, `verdict` |
| A `command` step | The change. | `change` |
| A `verify` step | One measurement for each validator, one verdict for each judge. | `measurement`, `verdict` |
| A `human` step | The person's answer, bound to a digest: a yes, or a reply in words. | `approval`, `input` |
| Anyone says something in the thread | What they said, at any time in the run. | `input` |
| An `effect` step | What was delivered and, when no person was needed, why it was allowed. | `observation` |
| A path is put back, or a step fails | What happened and why. | `observation` |

For the fields of each record, see [Artifact kinds](/reference/kinds). To check the trail yourself, see [Verify a run](/guide/how-to/verify-a-run).

## A worked example

This workflow plans, asks you to approve the plan, builds red then green until every criterion is covered, opens a pull request, asks you to approve the change and merges. It names two personas and holds no instructions.

```yaml
format: daggry/workflow@1
steps:
  - id: plan
    kind: agent
    persona: planner
    outputs: [plan]
    scope: nothing
  - id: approve-plan
    kind: human
    of: plan
  - id: build
    loop:
      until: verdict.all_covered
      max: 5
      steps:
        - id: proof
          kind: agent
          persona: developer
          outputs: [change]
          freeze: ["tests/**"]
          scope: ["tests/**"]
        - id: work
          kind: agent
          persona: developer
          outputs: [change]
          scope: ["area:app", "tests/**"]
        - id: check
          kind: verify
          validators: [project]
          judges: [coverage]
  - id: open
    kind: effect
    do: open-pr
  - id: approve-change
    kind: human
    of: plan
  - id: merge
    kind: effect
    do: merge-pr
```

The table follows the run through the trail.

| Step | What happens | What the trail gains |
|---|---|---|
| `plan` | The `planner` persona reads the objective and writes the criteria. It asks on the issue when something is unclear. | A `plan`, and an `input` for each reply. |
| `approve-plan` | You approve the plan, or reply, and the planner revises it. | An `approval` bound to the plan's digest. |
| `proof` | Once: the `developer` persona writes a test for every criterion. Daggry shows that they fail on the baseline. | A `change` with frozen paths, a `measurement` and a verdict. |
| `work`, `check` | The persona works against the failing tests, and the validators run on a clean copy. The loop repeats on what still fails. | A `change`, measurements and verdicts in each iteration. |
| `open` | Daggry opens the pull request. | An `observation`. |
| `approve-change` | You approve on the pull request. A request for changes goes back to `plan`: the planner changes the plan only if the reply calls for it, and the developer fixes what you asked. A plan that did not change is not approved again. | An `input` for each comment, then an `approval` bound to the change's digest. |
| `merge` | Daggry merges. | An `observation`. |

## Schema

The workflow file has a published JSON Schema (draft 2020-12): [workflow.json](/schemas/workflow.json). The schema checks the shape of a file. It does not check that a persona, a validator, a judge or an area exists: Daggry checks those names when the run starts.

::: details Schema: workflow file
This is the content of [workflow.json](/schemas/workflow.json).

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "daggry/workflow@1",
  "title": "daggry/workflow@1: the workflow file",
  "type": "object",
  "required": [
    "format",
    "steps"
  ],
  "additionalProperties": false,
  "patternProperties": {
    "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true
  },
  "properties": {
    "format": {
      "const": "daggry/workflow@1"
    },
    "steps": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/entry"
      }
    }
  },
  "$defs": {
    "id": {
      "type": "string",
      "minLength": 1
    },
    "validatorRef": {
      "type": "string",
      "pattern": "^(?!(daggry|coverage|no_regression|baseline_proof)$)[a-z][a-z0-9_-]*$",
      "description": "project, or the name of a validator you define. project, daggry, coverage, no_regression and baseline_proof are reserved."
    },
    "judgeRef": {
      "type": "string",
      "pattern": "^(?!(project|daggry|baseline_proof)$)[a-z][a-z0-9_-]*$",
      "description": "coverage, no_regression, or the name of a judge you declare."
    },
    "personaRef": {
      "type": "string",
      "pattern": "^[a-z][a-z0-9_-]*$",
      "description": "The name of a persona that the project config or the tenant config defines."
    },
    "scopeEntry": {
      "type": "string",
      "minLength": 1,
      "description": "A glob, or an area reference of the form area:<name>.",
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
    "scope": {
      "anyOf": [
        {
          "enum": [
            "nothing",
            "anywhere"
          ]
        },
        {
          "type": "array",
          "items": {
            "$ref": "#/$defs/scopeEntry"
          }
        }
      ]
    },
    "entry": {
      "type": "object",
      "if": {
        "required": [
          "kind"
        ]
      },
      "then": {
        "$ref": "#/$defs/step"
      },
      "else": {
        "$ref": "#/$defs/loopEntry"
      }
    },
    "step": {
      "type": "object",
      "required": [
        "id",
        "kind"
      ],
      "properties": {
        "id": {
          "$ref": "#/$defs/id"
        },
        "kind": {
          "anyOf": [
            {
              "enum": [
                "command",
                "agent",
                "verify",
                "human",
                "effect"
              ]
            },
            {
              "type": "string",
              "pattern": "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$",
              "description": "An extension kind that the tenant registers. Its registered schema defines the step's other keys."
            }
          ]
        }
      },
      "allOf": [
        {
          "if": {
            "properties": {
              "kind": {
                "const": "command"
              }
            }
          },
          "then": {
            "$ref": "#/$defs/commandStep"
          }
        },
        {
          "if": {
            "properties": {
              "kind": {
                "const": "agent"
              }
            }
          },
          "then": {
            "$ref": "#/$defs/agentStep"
          }
        },
        {
          "if": {
            "properties": {
              "kind": {
                "const": "verify"
              }
            }
          },
          "then": {
            "$ref": "#/$defs/verifyStep"
          }
        },
        {
          "if": {
            "properties": {
              "kind": {
                "const": "human"
              }
            }
          },
          "then": {
            "$ref": "#/$defs/humanStep"
          }
        },
        {
          "if": {
            "properties": {
              "kind": {
                "const": "effect"
              }
            }
          },
          "then": {
            "$ref": "#/$defs/effectStep"
          }
        }
      ]
    },
    "loopEntry": {
      "type": "object",
      "required": [
        "id",
        "loop"
      ],
      "additionalProperties": false,
      "properties": {
        "id": {
          "$ref": "#/$defs/id"
        },
        "loop": {
          "type": "object",
          "required": [
            "until",
            "max",
            "steps"
          ],
          "additionalProperties": false,
          "patternProperties": {
            "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true
          },
          "properties": {
            "over": {
              "$ref": "#/$defs/id"
            },
            "as": {
              "$ref": "#/$defs/id"
            },
            "until": {
              "type": "string",
              "minLength": 1
            },
            "max": {
              "type": "integer",
              "minimum": 1
            },
            "steps": {
              "type": "array",
              "items": {
                "$ref": "#/$defs/step"
              }
            }
          },
          "dependentRequired": {
            "over": [
              "as"
            ],
            "as": [
              "over"
            ]
          }
        }
      }
    },
    "commandStep": {
      "required": [
        "id",
        "kind",
        "run",
        "scope"
      ],
      "additionalProperties": false,
      "patternProperties": {
        "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true
      },
      "properties": {
        "id": {
          "$ref": "#/$defs/id"
        },
        "kind": true,
        "run": {
          "$ref": "#/$defs/command"
        },
        "scope": {
          "$ref": "#/$defs/scope"
        }
      }
    },
    "agentStep": {
      "required": [
        "id",
        "kind",
        "persona",
        "outputs",
        "scope"
      ],
      "additionalProperties": false,
      "patternProperties": {
        "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true
      },
      "properties": {
        "id": {
          "$ref": "#/$defs/id"
        },
        "kind": true,
        "persona": {
          "$ref": "#/$defs/personaRef"
        },
        "outputs": {
          "type": "array",
          "items": {
            "type": "string",
            "minLength": 1
          }
        },
        "freeze": {
          "type": "array",
          "items": {
            "type": "string",
            "minLength": 1
          }
        },
        "scope": {
          "$ref": "#/$defs/scope"
        }
      }
    },
    "verifyStep": {
      "required": [
        "id",
        "kind",
        "validators"
      ],
      "additionalProperties": false,
      "patternProperties": {
        "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true
      },
      "properties": {
        "id": {
          "$ref": "#/$defs/id"
        },
        "kind": true,
        "validators": {
          "type": "array",
          "minItems": 1,
          "uniqueItems": true,
          "items": {
            "$ref": "#/$defs/validatorRef"
          }
        },
        "judges": {
          "type": "array",
          "uniqueItems": true,
          "items": {
            "$ref": "#/$defs/judgeRef"
          },
          "description": "Judges to run after the default judge. Absent: only the default judge. The order is the order of the verdicts."
        }
      }
    },
    "humanStep": {
      "required": [
        "id",
        "kind",
        "of"
      ],
      "additionalProperties": false,
      "patternProperties": {
        "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true
      },
      "properties": {
        "id": {
          "$ref": "#/$defs/id"
        },
        "kind": true,
        "of": {
          "$ref": "#/$defs/id",
          "description": "The step or loop this checkpoint is about. A yes continues the run. Any other reply sends the run back to it with that reply."
        }
      }
    },
    "effectStep": {
      "required": [
        "id",
        "kind",
        "do"
      ],
      "additionalProperties": false,
      "patternProperties": {
        "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true
      },
      "properties": {
        "id": {
          "$ref": "#/$defs/id"
        },
        "kind": true,
        "do": {
          "type": "string",
          "pattern": "^([A-Za-z0-9_-]+/)?[a-z][a-z0-9_-]*$",
          "description": "The name of an effect. Daggry ships open-pr and merge-pr. A tenant can register more."
        },
        "auto_when": {
          "type": "string",
          "minLength": 1,
          "description": "A gate expression. When it holds, the effect runs with no person. When it does not, the run waits for a person's approval first."
        }
      }
    },
    "command": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "string",
        "minLength": 1
      },
      "description": "A program and its arguments. The first string is the program. No shell reads the list."
    }
  }
}
```
:::

## Next steps

The list names the pages to read next.

- For how a file is loaded, what the loader refuses and extension keys, see [Workflow rules](/reference/workflow-rules).
- For what a gate can read, see [Gate expressions](/reference/gates).
- For defining a persona, see [personas](/reference/tenant-config#personas).
- For validators and judges, see [Validators](/reference/validators) and [Judges](/reference/judges).
