# Workflow schema

*Reference*

For the idea, read [Work graphs](/guide/concepts/workflows).

A workflow is one YAML file that lists steps and bounded loops. This page defines every key, every value a key accepts, and every case the loader refuses. It is for people who write or review workflow files. To write one, follow [Write a workflow](/guide/how-to/write-a-workflow).

The example on this page is illustrative. It is valid under the schema and the loader checks.

In examples, `engine: <engine>` stands for the coding-agent engine that the step uses. Write the identifier of an engine your installation provides in place of `<engine>`. The schema accepts any non-empty string for `engine`, and the loader checks it against the engines your installation provides. One engine, `replay`, plays back a recorded transcript for tests and takes a `transcript` path in place of `prompt`.

## Download

The workflow file has a published JSON Schema. To download it, use the file below.

| Schema | File |
|---|---|
| Workflow file | [workflow.json](/schemas/workflow.json) |

## File shape

| Key | Type | Required | Meaning |
|---|---|---|---|
| `steps` | array of entries | yes | The ordered entries of the workflow. `steps: []` is valid. |

The top level has exactly one key. Any other top-level key is refused. The file has no name, no inputs section, no `needs` key and no step-level condition. A gate appears only in a loop's `until`. See [Gate expressions](/reference/gates).

An entry is a step when it has a `kind` key. Otherwise it is a loop entry. Every object is closed: an unknown key is refused. Ids are non-empty strings. Loop entries and the steps inside loops share one id namespace.

The workflow lives in the control plane. An agent cannot change it.

### YAML subset

The loader reads a strict subset of YAML.

| Construct | Result |
|---|---|
| Anchor `&name` | Refused. |
| Alias `*name` | Refused. |
| Tag `!tag` or `!!tag` | Refused. |
| Merge key `<<:` | Refused. |
| Duplicate mapping key | Refused. |
| The same characters inside a quoted or block scalar | Data. They load. |

## Steps

Every step requires `id` and `kind`. `kind` is one of five values: `command`, `agent`, `verify`, `human`, `effect`. Any other value is refused at `/steps/<n>/kind`.

### command

A shell line that the runner executes in the pod. A failed command step fails the run, also inside a loop.

| Key | Type | Required | Constraints |
|---|---|---|---|
| `id` | string | yes | Non-empty. |
| `kind` | string | yes | `command`. |
| `run` | string | yes | Non-empty. |
| `scope` | scope | yes | See [Scope](#scope). |

### agent

A session of a coding-agent engine.

| Key | Type | Required | Constraints |
|---|---|---|---|
| `id` | string | yes | Non-empty. |
| `kind` | string | yes | `agent`. |
| `engine` | string | yes | Non-empty. The coding-agent engine the step uses. The loader checks it against the engines your installation provides. |
| `prompt` | string | no | The control plane writes it to a read-only instruction file named for the step id. |
| `outputs` | array of strings | yes | Each non-empty. The kinds the step must deliver. |
| `tests` | array of strings | no | Each non-empty. Globs that mark which of the step's changed paths are tests. |
| `scope` | scope | yes | See [Scope](#scope). |

- The step succeeds when every declared output is accepted. It fails when the engine ends first or a limit is reached.
- An output matches by bare name: `plan`, `evidence/plan@1` and `daggry/change@1` all work.
- The control plane seals a `change` for every accepted `agent` or `command` step, so an output named `change` is never required from the runner.
- A step can submit `observation` always, `measurement` from a `verify` step or a step with `tests`, and any other kind only if it is among `outputs`. Any other record rejects the step with ``record <n>: kind `<kind>` not admitted``.
- A step with `tests` is the test step of a loop. When the control plane accepts it, its matching paths become the frozen set.

### verify

Measures a clean copy of the last sealed commit.

| Key | Type | Required | Constraints |
|---|---|---|---|
| `id` | string | yes | Non-empty. |
| `kind` | string | yes | `verify`. |

A `verify` step has no command and takes no other key. It runs the `verify.test` command from the base commit's [Project profile](/reference/profile). It must submit exactly one `head` measurement of the last sealed commit. Inside a loop, a non-zero exit code is red: the iteration ends and the run does not fail. Outside a loop, a failed `verify` step fails the run.

### human

Waits for a person.

| Key | Type | Required | Constraints |
|---|---|---|---|
| `id` | string | yes | Non-empty. |
| `kind` | string | yes | `human`. |
| `waiting_for` | string | yes | `approval` or `input-needed`. |

The control plane marks the run `waiting` at the step boundary and releases the job's pod. `daggry approve <run-id>` completes the step, and the run continues in a new attempt from the last sealed commit. `approve` binds to the `plan` for `approval` and to the latest `change` for `input-needed`. A `human` step that some loop names in `on_exhausted` is skipped in normal flow and runs only when that loop is exhausted.

### effect

Runs in the control plane, never in the pod.

| Key | Type | Required | Constraints |
|---|---|---|---|
| `id` | string | yes | Non-empty. |
| `kind` | string | yes | `effect`. |
| `do` | string | yes | `open-pr`. |

`open-pr` opens a pull request with head `daggry/<run-id>` and base `main`. The title and body come from the issue. The idempotency key is the run id plus the step id, so a retry returns the same pull request. A failing effect fails the run.

## Scope

`scope` is what a step may write. It is required on `command` and `agent` steps and absent on the other kinds.

| Value | Meaning |
|---|---|
| `nothing` | The step may write no path. |
| `anywhere` | Any path except protected paths and CI configuration folders such as `.github/**`. |
| a list of glob strings | Only paths that match a glob. Each glob is non-empty. `[]` is valid and matches no path. |

Any other word, such as `everywhere`, is refused. A glob that does not compile is refused at run time. Scope is judged on the step's own change against the last sealed commit. Protected paths are judged against the base commit. See [Protected paths](/guide/concepts/protection).

## Loop

A loop entry has an `id` and a `loop` object. A loop is not a sixth step kind.

| Key | Type | Required | Meaning |
|---|---|---|---|
| `over` | string | yes | The input that holds the list. Non-empty. The list is the `criteria` of the sealed `plan`: `over: plan`. |
| `as` | string | yes | The name an iteration's item reaches its steps as. Non-empty. |
| `until` | string | yes | A gate expression, read at the end of each iteration. The loop ends when it holds. |
| `max` | integer | yes | 1 or more. The bound on iterations of the whole loop, across all items. |
| `on_exhausted` | string | yes | `fail`, or the id of a top-level `human` step. |
| `steps` | array of steps | yes | The steps of one iteration. A loop inside a loop is refused. |

### Loop rules

| Rule | Detail |
|---|---|
| Count | An iteration counts against `max` when it starts. |
| Green | All of the iteration's steps passed. The loop advances to the next item. |
| Red | The iteration's `verify` step failed. The same item repeats. |
| Gate | `until` is evaluated at the end of every iteration, green or red. When it holds, the loop ends and the run continues after it. |
| End | The loop also ends when the list is finished. |
| Empty list | The loop and its exhaust target are skipped. |
| Other failures | A failed step of any other kind in a loop fails the run. It is not red. A rejected boundary, a missing output or a failed red proof also fails the run. |
| Repeat | An iteration that repeats skips every test step: an `agent` step with `tests`. A fresh iteration on a new item runs it. |
| Exhausted | When `max` is reached with the list unfinished, `on_exhausted` applies. |
| `fail` | The run ends `failed` with the reason ``loop `<id>` ran out of iterations``. |
| `<human id>` | The run waits at that step. `daggry approve <run-id>` gives up the unfinished item, and the run continues after the human step. `daggry approve <run-id> --unfreeze <path>` re-enters the loop on the same item with a fresh `max`, as a repeat iteration. |

`fail` is reserved, so a `human` step named `fail` cannot be an exhaust target.

### Red then green

A red-then-green loop has three steps in an iteration: a test step (an `agent` step with `tests`) writes a test whose title carries the criterion id, an implementer (an `agent` step) makes it pass, and a `verify` step measures a clean copy of the code. The runner overlays the test step's new test paths on a clean copy of the base commit and runs the profile's test command there. A test step in a loop that does not prove red is rejected. Frozen tests and unfreeze are described in [Protected paths](/guide/concepts/protection).

## A full valid example

This workflow plans, waits for approval, then runs a red-then-green loop over the plan's criteria. It builds, then opens a pull request. The loop ends when every criterion is covered, or when 5 iterations are spent, at which point the run waits at `ask`.

```yaml
steps:
  - id: plan
    kind: agent
    engine: <engine>
    prompt: Write the plan.
    outputs: [plan]
    scope: nothing
  - id: approve-plan
    kind: human
    waiting_for: approval
  - id: red-green
    loop:
      over: plan
      as: criterion
      until: verdict.all_covered
      max: 5
      on_exhausted: ask
      steps:
        - id: tests
          kind: agent
          engine: <engine>
          prompt: Write the test for the criterion.
          outputs: [change]
          tests: ["tests/**"]
          scope: ["tests/**"]
        - id: impl
          kind: agent
          engine: <engine>
          prompt: Make the test pass.
          outputs: [change]
          scope: ["src/**", "tests/**"]
        - id: check
          kind: verify
  - id: ask
    kind: human
    waiting_for: input-needed
  - id: build
    kind: command
    run: make
    scope: anywhere
  - id: pr
    kind: effect
    do: open-pr
```

| Placeholder | Meaning |
|---|---|
| `<engine>` | The coding-agent engine the step uses. |

The smallest valid workflow is one command step:

```yaml
steps:
  - id: build
    kind: command
    run: make
    scope: anywhere
```

## Load errors

The loader reports the first refusal, in this order. A refused workflow returns as `workflow: <message>` and the run does not start.

| Stage | Refusal | Cause |
|---|---|---|
| 1 | Not YAML | The text is not YAML, or has a duplicate key. |
| 2 | Unsupported construct | An anchor, alias, tag or merge key. The message is ``the strict YAML subset refuses <construct>``. |
| 3 | Schema | The document does not fit the schema. The message is ``workflow schema: <message> (at `<location>`)``, where `<location>` is the JSON pointer of the offending value, such as `/steps/0/kind`. |
| 4 | Expression | A loop's `until` is not a gate expression. The message is ``step `<step>`: until: <source>``. |
| 5 | Model | The document fits the schema but not the workflow model. The message is `workflow model: <message>`. |
| 6 | Duplicate id | Two entries or steps carry one id. The message is ``step id `<id>` is used twice``. |
| 7 | Exhaust target | `on_exhausted` names something that is not a top-level `human` step. The message is ``step `<step>`: on_exhausted `<target>` is not a top-level human step``. |
| 8 | Gate | An `until` reads a field that is not `derived`, that no kind schema can classify, or a `steps.<id>` read of an id the workflow lacks. The message is ``step `<step>`: gate reads `<field>`, whose class is <class>; only derived fields are readable``. |

## Examples the loader refuses

A short, representative set. The first column shows the cause. The second names the stage and the location.

| Input | Refusal |
|---|---|
| `steps:` followed by `- &a {id: v, kind: verify}` | Unsupported construct (anchor) |
| `steps: [` | Not YAML |
| `steps: 3` | Schema at `/steps` |
| `kind: parallel` | Schema at `/steps/0/kind` |
| A loop with `max: 0` | Schema at `/steps/0/loop/max` |
| A `verify` step with `run: x` | Schema at `/steps/0` (extra key) |
| Two steps with `id: v` | Duplicate id `v` |
| `on_exhausted: ask` with no `ask` step | Exhaust target `ask` |
| `until: inputs.plan.criteria` (a claimed field) | Gate, class claimed |
| `until: explode()` | Expression, unknown function |

The loader does not check these at load. Each fails later or does nothing:

| Not checked | What happens |
|---|---|
| That `outputs` names real kinds. | An unknown output is never delivered, and the step fails. |
| That `tests` and `scope` globs compile. | A bad glob fails at the boundary check. |
| A fact name after `verdict.` | A name no validator emits is not caught at load. |

## Extensibility

Proposed standard; see the [Roadmap](/roadmap) for status.

The workflow file is one of four open documents, with the evidence envelope, the [Project config](/reference/project-config) and the [Tenant config](/reference/tenant-config). This section defines the standard layout that lets a workflow grow without a change to the standard: a versioned header, a registry of step kinds and namespaced extension keys.

### Today

The sections above this one define the file the loader reads today, and [workflow.json](/schemas/workflow.json) is its schema.

| Point | The file today |
|---|---|
| Header | None. The top level holds `steps` only. |
| Step kinds | Five, closed: `command`, `agent`, `verify`, `human`, `effect`. |
| Unknown keys | Refused everywhere. |
| `engine` | An open string. The schema accepts any non-empty string, and the loader checks it against the engines your installation provides. |

### Where a workflow comes from

A workflow is a document in the tenant's catalogue. Each catalogue entry names the repository, the path and the commit the file is read from, and the tenant chooses that repository. It can be the repository the work is done on, but that repository does not assign the workflow to itself. The tenant config decides which workflows run on which repository. See [workflows](/reference/tenant-config#workflows) and [projects](/reference/tenant-config#projects).

`daggry run --workflow <file>` is today's way to supply a workflow: the file is read from the machine that starts the run. See [CLI](/reference/cli).

### The standard layout

A workflow document has three parts.

| Part | Keys | Rule |
|---|---|---|
| Header | `format` | Always `daggry/workflow@1`. A reader refuses a malformed `format` and a major version it does not know. |
| Body | `steps` | The ordered entries, as defined in [File shape](#file-shape). |
| Extension keys | `<namespace>/<key>` | Any number. See [Extension keys in a workflow](#extension-keys-in-a-workflow). |

A file with no `format` key is read by the rules of [Today](#today): it holds `steps` only and takes no extension key and no extension kind.

### Step kind registry

A step kind is an entry in a registry. Each entry names the kind, the keys a step of that kind takes and the module that runs it.

| Kind | Module that runs the step | Registered by |
|---|---|---|
| `command` | Deterministic runner | The standard. |
| `verify` | Deterministic runner | The standard. |
| `agent` | Agent runner | The standard. |
| `effect` | Control plane | The standard. |
| `human` | None. A person decides, and the control plane seals the decision. | The standard. |
| `<namespace>/<name>` | The module its registration names: deterministic runner, agent runner or control plane. | The tenant, in `extensions.step_kinds` of the [Tenant config](/reference/tenant-config#extensions). |

Rules for the registry:

- A kind without a namespace belongs to the standard. The five above are the whole set. A new one is a change to the standard.
- An extension kind has the form `<namespace>/<name>`: exactly one `/`, with each part made of ASCII letters, digits, `-` or `_`. The namespace names the party that defines the kind.
- An extension kind is registered with the URL of a JSON Schema for its keys. A step of that kind takes `id`, `kind` and the keys that schema allows.
- A kind that is not one of the five and is not registered by the tenant is refused at `/steps/<n>/kind`.
- A loop is not a step kind, and no extension kind is a loop.

### Which module runs a step

A workflow declares the module through the step's `kind` and through nothing else. The conductor reads the kind, looks it up in the registry and hands the step to that module.

| Module | Runs | Never |
|---|---|---|
| Deterministic runner | Code that a person wrote into the workflow or the project: a `command` step's `run` line and the project's checks. | Starts a model. |
| Agent runner | A coding-agent engine, and whatever the engine generates. | Judges its own work. |
| Control plane | Effects, seals and validators. | Runs a command or an agent. |
| A person | The decision at a `human` step. | - |

No key of a step moves it to another module. An `agent` step always runs in the agent runner, and a `command` step never does.

### Checks by name

A workflow never holds a project's verification command. It names a `verify` step, and the [Project config](/reference/project-config) of the repository supplies the check. A workflow therefore runs unchanged on projects in different languages.

| Step | Runs |
|---|---|
| `verify` with no `check` key | The project's canonical check, `verification.canonical`, and each check in `verification.also`. The result is the verification evidence. |
| `verify` with `check: <name>` | The one check of that name, as an optional run. The result decides the step and is not the verification evidence. |

Rules:

- `check` is read only in a file with a `format` header. Its value is a check name: a lowercase letter, then lowercase letters, digits, `-` or `_`.
- The name is looked up in the project config of the base commit when the run starts. A name the project config lacks refuses the run.
- A `verify` step with no `check` key needs a project config with `verification.canonical`.
- Every check a step runs is run by the deterministic runner, on a clean copy of the sealed commit.

### Engine

`engine` is an open string, not a closed list, so a new coding-agent engine needs no change to the schema. The standard checks the value against the engines the tenant registers in `agents.engines` of the [Tenant config](/reference/tenant-config#agents). A value no registered engine has is refused.

### Extension keys in a workflow

| Rule | Detail |
|---|---|
| Form | `<namespace>/<key>`. Pattern `^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$`. |
| Place | At the top level, on a step and on a `loop` object. |
| A reader that does not know the key | Ignores the value and preserves it. |
| A key without a namespace | Refused, unless this page defines it. |
| Limit | An extension key never widens a step's scope, a loop's `max` or any rule of the project or the tenant, and never changes the meaning of a key this page defines. |

The full rules are in [Extension keys](/reference/project-config#extension-keys).

### Example

This workflow carries the header, one extension key on the document, one on a step and one step of an extension kind. The file is illustrative.

```yaml
format: daggry/workflow@1
acme/owner: platform-team
steps:
  - id: build
    kind: command
    run: make
    scope: anywhere
    acme/cost-centre: build
  - id: scan
    kind: acme/scan
    profile: strict
  - id: fix
    kind: agent
    engine: <engine>
    prompt: Fix what the scan found.
    outputs: [change]
    scope: ["src/**"]
```

| Value | Meaning |
|---|---|
| `acme/owner`, `acme/cost-centre` | Extension keys. A reader that does not know the `acme` namespace ignores them. |
| `acme/scan` | An extension kind. The tenant registers it with the module that runs it and the schema that allows `profile`. |
| `<engine>` | The coding-agent engine the step uses, by a name the tenant registers. |

::: details Schema: workflow file
This is the content of [workflow.json](/schemas/workflow.json).

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "A Daggry workflow file",
  "type": "object",
  "required": [
    "steps"
  ],
  "additionalProperties": false,
  "properties": {
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
            "type": "string",
            "minLength": 1
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
        "kind": {
          "enum": [
            "command",
            "agent",
            "verify",
            "human",
            "effect"
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
            "$ref": "#/$defs/command"
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
            "$ref": "#/$defs/agent"
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
            "$ref": "#/$defs/verify"
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
            "$ref": "#/$defs/human"
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
            "$ref": "#/$defs/effect"
          }
        }
      ]
    },
    "command": {
      "required": [
        "id",
        "kind",
        "run",
        "scope"
      ],
      "additionalProperties": false,
      "properties": {
        "id": {
          "$ref": "#/$defs/id"
        },
        "kind": true,
        "run": {
          "type": "string",
          "minLength": 1
        },
        "scope": {
          "$ref": "#/$defs/scope"
        }
      }
    },
    "agent": {
      "required": [
        "id",
        "kind",
        "engine",
        "outputs",
        "scope"
      ],
      "additionalProperties": false,
      "properties": {
        "id": {
          "$ref": "#/$defs/id"
        },
        "kind": true,
        "engine": {
          "type": "string",
          "minLength": 1,
          "description": "The coding-agent engine the step uses."
        },
        "prompt": {
          "type": "string"
        },
        "transcript": {
          "type": "string",
          "minLength": 1
        },
        "outputs": {
          "type": "array",
          "items": {
            "type": "string",
            "minLength": 1
          }
        },
        "tests": {
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
    "verify": {
      "required": [
        "id",
        "kind"
      ],
      "additionalProperties": false,
      "properties": {
        "id": {
          "$ref": "#/$defs/id"
        },
        "kind": true
      }
    },
    "human": {
      "required": [
        "id",
        "kind",
        "waiting_for"
      ],
      "additionalProperties": false,
      "properties": {
        "id": {
          "$ref": "#/$defs/id"
        },
        "kind": true,
        "waiting_for": {
          "enum": [
            "approval",
            "input-needed"
          ]
        }
      }
    },
    "effect": {
      "required": [
        "id",
        "kind",
        "do"
      ],
      "additionalProperties": false,
      "properties": {
        "id": {
          "$ref": "#/$defs/id"
        },
        "kind": true,
        "do": {
          "enum": [
            "open-pr"
          ]
        }
      }
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
            "over",
            "as",
            "until",
            "max",
            "on_exhausted",
            "steps"
          ],
          "additionalProperties": false,
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
            "on_exhausted": {
              "$ref": "#/$defs/id"
            },
            "steps": {
              "type": "array",
              "items": {
                "$ref": "#/$defs/step"
              }
            }
          }
        }
      }
    }
  }
}
```
:::
