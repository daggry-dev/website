# Workflow file

*Reference*

A workflow has a strict form, and Daggry refuses anything else. This page defines every key, every value a key accepts, every file the loader refuses and how you add your own keys and step kinds. Read it when you write or review a workflow and need the exact rule. To write your first one, follow [Write a workflow](/guide/how-to/write-a-workflow).

A workflow is one YAML file that lists steps and loops, each loop with a limit. It is one of the four [open formats](/reference/open-formats), with the [Project config](/reference/project-config), the [Tenant config](/reference/tenant-config) and evidence.

The examples on this page are illustrative. Each one is valid against the published schema. See [Validation](#validation).

In examples, `engine: <engine>` stands for the identifier of an agent engine that the tenant registers. Write that identifier in place of `<engine>`. One engine, `replay`, plays back a recorded transcript and takes a `transcript` path in place of `prompt`.

A workflow names validators, effects and areas by reference. The project, the tenant and the binding supply what the names stand for, so the same file works for any kind of work. See [Bindings](/reference/bindings).

## Download

The workflow file has a published JSON Schema (draft 2020-12). The table links the file.

| Schema | File |
|---|---|
| `daggry/workflow@1` | [workflow.json](/schemas/workflow.json) |

## File shape

A workflow file has three parts.

| Part | Keys | Rule |
|---|---|---|
| Header | `format` | Required. Always `daggry/workflow@1`. |
| Body | `steps` | Required. The ordered entries of the workflow. `steps: []` is valid. |
| Extension keys | `<namespace>/<key>` | Any number. See [Extension keys in a workflow](#extension-keys-in-a-workflow). |

`format` follows the form `<namespace>/<name>@<major>`, the same form as an artifact kind. A reader refuses a missing `format`, a malformed one and a major version it does not know. A breaking change to the layout is a new major.

Any other top-level key is refused. The file has no name, no inputs section, no `needs` key and no step-level condition. A gate appears only in a loop's `until`. See [Gate expressions](/reference/gates).

An entry is a step when it has a `kind` key. Otherwise it is a loop entry. Every object is closed: a key that this page does not define and that is not an extension key is refused. Ids are non-empty strings. Loop entries and the steps inside loops share one id namespace.

The workflow lives in the control plane. An agent cannot change it.

### Where a workflow comes from

A workflow is a document in the tenant's catalogue. Each catalogue entry names the workspace, the path and the version the file is read from, and the tenant chooses that workspace. It can be the workspace the work is done on, but that workspace does not assign the workflow to itself. The tenant config decides which workflows run on which workspace. See [workflows](/reference/tenant-config#workflows) and [projects](/reference/tenant-config#projects).

`daggry run --workflow <file>` supplies a workflow as a file: the file is read from the machine that starts the run. See [CLI](/reference/cli).

### YAML subset

The loader reads a strict subset of YAML. The table lists what it refuses.

| Construct | Result |
|---|---|
| Anchor `&name` | Refused. |
| Alias `*name` | Refused. |
| Tag `!tag` or `!!tag` | Refused. |
| Merge key `<<:` | Refused. |
| Duplicate mapping key | Refused. |
| The same characters inside a quoted or block scalar | Data. They load. |

## Steps

Every step requires `id` and `kind`. `kind` is one of the five values of the standard, `command`, `agent`, `verify`, `human` and `effect`, or an extension kind that the tenant registers. Any other value is refused at `/steps/<n>/kind`. See [Step kind registry](#step-kind-registry). The table lists the five kinds.

| Kind | What runs the step | What it does |
|---|---|---|
| `agent` | Agent runner | A session of an agent engine that must deliver named artifact kinds. |
| `command` | Deterministic runner | A program and its arguments, limited by a `scope` of paths it can write. |
| `verify` | Deterministic runner and control plane | Runs the validators it names on the last sealed version of the workspace. |
| `human` | None. A person decides. | Releases the pod and waits. `daggry approve` completes it. |
| `effect` | Control plane | An idempotent side effect that the tenant registers, such as handing a change over. |

### command

A command that the runner executes in the pod, in the form defined in [Commands](/reference/project-config#commands). A failed command step fails the run, also inside a loop. The table lists its keys.

| Key | Type | Required | Constraints |
|---|---|---|---|
| `id` | string | yes | Non-empty. |
| `kind` | string | yes | `command`. |
| `run` | command | yes | A program and its arguments, as a list. See [Commands](/reference/project-config#commands). |
| `scope` | scope | yes | See [Scope](#scope). |

### agent

A session of an agent engine. The table lists its keys.

| Key | Type | Required | Constraints |
|---|---|---|---|
| `id` | string | yes | Non-empty. |
| `kind` | string | yes | `agent`. |
| `engine` | string | yes | Non-empty. The identifier of an agent engine. See [Engine](#engine). |
| `prompt` | string | no | The control plane writes it to a read-only instruction file named for the step id. |
| `transcript` | string | no | Non-empty. The path of the recorded transcript that the `replay` engine plays back, in place of `prompt`. |
| `outputs` | array of strings | yes | Each non-empty. The kinds the step must deliver. |
| `freeze` | array of strings | no | Each non-empty. Globs that mark which of the step's changed paths are frozen when the step is sealed. |
| `scope` | scope | yes | See [Scope](#scope). |

These rules apply to an `agent` step.

- The step succeeds when every declared output is accepted. It fails when the engine ends first or a limit is reached.
- An output matches by bare name: `plan`, `evidence/plan@1` and `daggry/change@1` all work.
- The control plane seals a `change` for every accepted `agent` or `command` step, so an output named `change` is never required from the runner.
- A step can submit `observation` always, `measurement` from a `verify` step or a step with `freeze`, and any other kind only if it is among `outputs`. Any other record rejects the step with ``record <n>: kind `<kind>` not admitted``.
- A step with `freeze` is the proof step of a loop: it writes what proves a criterion. When the control plane accepts it, its matching paths become the frozen set.

### verify

Runs validators on the last sealed version of the workspace and judges the result. For what each step does and the verdict rules, see [Judges](/reference/judges#the-model). The table lists its keys.

| Key | Type | Required | Constraints |
|---|---|---|---|
| `id` | string | yes | Non-empty. |
| `kind` | string | yes | `verify`. |
| `validators` | array of references | yes | One or more, none twice. See [Validators by reference](#validators-by-reference). |
| `judges` | array of names | no | Judges to run after the default judge: `coverage`, `no_regression` or the name of a judge you declare. None twice. Absent: only the default judge. The order is the order of the verdicts. See [Judges](/reference/judges). |

A `verify` step has no command. Every validator it names is resolved when the run starts.

- A validator you define runs in the deterministic runner, on a clean copy of the last sealed version. The step submits one `head` measurement for each.
- Inside a loop, a `verify` step that does not pass is red: the iteration ends and the run does not fail. Outside a loop, a failed `verify` step fails the run.

### human

Waits for a person. The table lists its keys.

| Key | Type | Required | Constraints |
|---|---|---|---|
| `id` | string | yes | Non-empty. |
| `kind` | string | yes | `human`. |
| `waiting_for` | string | yes | `approval` or `input-needed`. |

The control plane marks the run `waiting` at the step boundary and releases the job's pod. `daggry approve <run-id>` completes the step, and the run continues in a new attempt from the last sealed version of the workspace. `approve` binds to the `plan` for `approval` and to the latest `change` for `input-needed`. A `human` step that some loop names in `on_exhausted` is skipped in normal flow and runs only when that loop is exhausted.

### effect

Runs in the control plane, never in the pod. The table lists its keys.

| Key | Type | Required | Constraints |
|---|---|---|---|
| `id` | string | yes | Non-empty. |
| `kind` | string | yes | `effect`. |
| `do` | string | yes | The name of an effect that the tenant registers in `extensions.effects` of the [Tenant config](/reference/tenant-config#extensions): a name, or `<namespace>/<name>`. |

The standard defines no effect. A binding defines the effects for its kind of work, such as handing a change over or publishing it. See [Bindings](/reference/bindings). The idempotency key of every effect is the run id plus the step id, so a retry has the same result. A failing effect fails the run. An effect the tenant has not registered refuses the run when it starts.

### Step kind registry

A step kind is an entry in a registry. Each entry names the kind, the keys a step of that kind takes and what runs it: the runner, as the deterministic runner or the agent runner, or the control plane. See [The modules and where they run](/guide/concepts/modules). The table lists the entries.

| Kind | What runs the step | Registered by |
|---|---|---|
| `command` | Deterministic runner | The standard. |
| `verify` | Deterministic runner, for validators. Control plane, for the judges. | The standard. |
| `agent` | Agent runner | The standard. |
| `effect` | Control plane | The standard. |
| `human` | None. A person decides, and the control plane seals the decision. | The standard. |
| `<namespace>/<name>` | What its registration names: the deterministic runner, the agent runner or the control plane. | The tenant, in `extensions.step_kinds` of the [Tenant config](/reference/tenant-config#extensions). |

These rules apply to the registry.

- A kind without a namespace belongs to the standard. The five standard kinds are the whole set. A new one is a change to the standard.
- An extension kind has the form `<namespace>/<name>`: exactly one `/`, with each part made of ASCII letters, digits, `-` or `_`. The namespace names the party that defines the kind.
- An extension kind is registered with the URL of a JSON Schema for its keys. A step of that kind takes `id`, `kind` and the keys that schema allows.
- A kind that is not one of the five and is not registered by the tenant is refused at `/steps/<n>/kind`.
- A loop is not a step kind, and no extension kind is a loop.

### Which module runs a step

A workflow declares what runs a step through the step's `kind` and through nothing else. The conductor reads the kind, looks it up in the registry and hands the step to what the entry names. The table lists what each one runs.

| What runs the step | Runs | Never |
|---|---|---|
| Deterministic runner | What a person wrote into the workflow, the project or the tenant: a `command` step's `run` line and validators you define. | Starts a model. |
| Agent runner | An agent engine, and whatever the engine generates. | Judges its own work. |
| Control plane | Effects, seals and judges. | Runs a command or an agent. |
| A person | The decision at a `human` step. | - |

No key of a step changes what runs it. An `agent` step always runs in the agent runner, and a `command` step never does.

### Validators by reference

A `verify` step names validators, and the project and the tenant supply them. A workflow holds no validator command. The table lists the forms of a reference.

| Reference | Resolves to |
|---|---|
| `project` | The project's default set of validators: the canonical validator and each validator in `verification.also` of the [Project config](/reference/project-config#verification). |
| `<name>` | The validator you define of that name: first in the project config of the baseline, then in the [Tenant config](/reference/tenant-config#validators). The project's validator wins over a tenant's of the same name. |

These rules apply to a reference.

- A reference is `project` or a validator name: a lowercase letter, then lowercase letters, digits, `-` or `_`. A `/` is never part of a name.
- `project` needs a project config with `verification.canonical`.

For reserved names, lookup and when a validator counts as evidence, see [Referring to a validator](/reference/validators#referring-to-a-validator).

### Engine

`engine` is an open string, not a closed list, so a new agent engine needs no change to the schema. The loader checks the value against the engines the tenant registers in `agents.engines` of the [Tenant config](/reference/tenant-config#agents). A value no registered engine has is refused.

## Scope

`scope` is what a step can write. It is required on `command` and `agent` steps and absent on the other kinds of the standard. It takes one of three values.

| Value | Meaning |
|---|---|
| `nothing` | The step can write no path. |
| `anywhere` | Any path except protected paths and the automation folders a binding names. |
| a list of entries | Only paths that an entry holds. Each entry is non-empty: a glob, or an area reference, `area:<name>`. `[]` is valid and holds no path. |

Any other word, such as `everywhere`, is refused. A glob that does not compile is refused at run time.

How a scope is judged and enforced is in [Protected paths](/reference/protected-paths#scope).

### Areas by name

A workflow can name a part of a workspace without knowing its paths. An entry of a `scope` list is a glob or an area reference, and the [Project config](/reference/project-config#areas) of the workspace supplies the paths. The table lists the two forms of an entry.

| Entry | Stands for |
|---|---|
| `area:<name>` | Every path that the area of that name holds. |
| Any other string | A glob. |

These rules apply to an area reference.

- The name follows the rule for a validator name. It is looked up in the project config of the baseline when the run starts. A name the project config lacks refuses the run.
- A list can mix globs and area references. A path is in the scope of the step when one entry holds it.
- An area reference never opens a protected path, and it applies inside the scope of the run. See [The scope of a run](/reference/protected-paths#the-scope-of-a-run).

```yaml
format: daggry/workflow@1
steps:
  - id: fix
    kind: agent
    engine: <engine>
    prompt: Revise the page.
    outputs: [change]
    scope: ["area:app", "CHANGELOG.md"]
```

`app` is an area in the project config of the workspace, and `<engine>` is the identifier of a registered agent engine.

## Loop

A loop entry has an `id` and a `loop` object. A loop is not a sixth step kind. The table lists the keys of `loop`.

| Key | Type | Required | Meaning |
|---|---|---|---|
| `over` | string | yes | The input that holds the list. Non-empty. The list is the `criteria` of the sealed `plan`: `over: plan`. |
| `as` | string | yes | The name an iteration's item reaches its steps as. Non-empty. |
| `until` | string | yes | A gate expression, read at the end of each iteration. The loop ends when it holds. |
| `max` | integer | yes | 1 or more. The bound on iterations of the whole loop, across all items. |
| `on_exhausted` | string | yes | `fail`, or the id of a top-level `human` step. |
| `steps` | array of steps | yes | The steps of one iteration. A loop inside a loop is refused. |

### Loop rules

The table lists how a loop counts, repeats and ends.

| Rule | Detail |
|---|---|
| Count | An iteration counts against `max` when it starts. |
| Green | All of the iteration's steps passed. The loop advances to the next item. |
| Red | The iteration's `verify` step failed. The same item repeats. |
| Gate | `until` is evaluated at the end of every iteration, green or red. When it holds, the loop ends and the run continues after it. |
| End | The loop also ends when the list is finished. |
| Empty list | The loop and its exhaust target are skipped. |
| Other failures | A failed step of any other kind in a loop fails the run. It is not red. A rejected boundary, a missing output or a failed baseline proof also fails the run. |
| Repeat | An iteration that repeats skips every proof step: an `agent` step with `freeze`. A fresh iteration on a new item runs it. |
| Exhausted | When `max` is reached with the list unfinished, `on_exhausted` applies. |
| `fail` | The run ends `failed` with the reason ``loop `<id>` ran out of iterations``. |
| `<human id>` | The run waits at that step. `daggry approve <run-id>` gives up the unfinished item, and the run continues after the human step. `daggry approve <run-id> --unfreeze <path>` re-enters the loop on the same item with a fresh `max`, as a repeat iteration. |

`fail` is reserved, so a `human` step named `fail` cannot be an exhaust target.

### Red then green

A red-then-green loop has three steps in an iteration. A proof step (an `agent` step with `freeze`) writes what proves the criterion: a proof whose finding carries the criterion id. A second `agent` step does the work that makes it pass. A `verify` step runs the validators on a clean copy. The guide calls this "fails first, then passes".

The runner overlays the proof step's new frozen paths on a clean copy of the baseline and runs the baseline's canonical validator there. The `baseline_proof` judge, which Daggry applies itself, seals a verdict with the fact `red`. A proof step in a loop that does not prove red is rejected. See [Baseline proof](/reference/conformance#baseline-proof). Frozen paths and unfreeze are defined in [Protected paths](/reference/protected-paths#frozen-paths).

## Extensibility

A workflow grows without a change to the standard in two ways: a step kind that the tenant registers, and a namespaced extension key. The step kinds are in [Step kind registry](#step-kind-registry).

### Extension keys in a workflow

The table lists the rules for an extension key in a workflow.

| Rule | Detail |
|---|---|
| Form | `<namespace>/<key>`. Pattern `^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$`. |
| Place | At the top level, on a step and on a `loop` object. |
| A reader that does not know the key | Ignores the value and preserves it. |
| A key without a namespace | Refused, unless this page defines it. |
| Limit | An extension key never widens a step's scope, a loop's `max` or any rule of the project or the tenant, and never changes the meaning of a key this page defines. |

The full rules are in [Extension keys](/reference/project-config#extension-keys).

### Example

This workflow carries one extension key on the document, one on a step and one step of an extension kind.

```yaml
format: daggry/workflow@1
acme/owner: platform-team
steps:
  - id: render
    kind: command
    run: [sh, scripts/render.sh]
    scope: anywhere
    acme/cost-centre: build
  - id: scan
    kind: acme/scan
    level: strict
  - id: fix
    kind: agent
    engine: <engine>
    prompt: Fix what the scan found.
    outputs: [change]
    scope: ["area:app"]
```

The table explains the values.

| Value | Meaning |
|---|---|
| `acme/owner`, `acme/cost-centre` | Extension keys. A reader that does not know the `acme` namespace ignores them. |
| `acme/scan` | An extension kind. The tenant registers it with the module that runs it and the schema that allows `level`. |
| `<engine>` | The identifier of a registered agent engine. |

## A full valid example

This workflow plans, waits for approval, then runs a red-then-green loop over the plan's criteria. It then runs a command and hands the change over with an effect. The loop ends when every criterion is covered, or when 5 iterations are spent, at which point the run waits at `ask`.

```yaml
format: daggry/workflow@1
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
        - id: proof
          kind: agent
          engine: <engine>
          prompt: Write the check that proves the criterion.
          outputs: [change]
          freeze: ["checks/**"]
          scope: ["checks/**"]
        - id: work
          kind: agent
          engine: <engine>
          prompt: Do the work that makes the check pass.
          outputs: [change]
          scope: ["area:handbook", "checks/**"]
        - id: check
          kind: verify
          validators: [project]
          judges: [coverage]
  - id: ask
    kind: human
    waiting_for: input-needed
  - id: render
    kind: command
    run: [sh, scripts/render.sh]
    scope: anywhere
  - id: deliver
    kind: effect
    do: publish
```

The table explains the values.

| Value | Meaning |
|---|---|
| `<engine>` | The identifier of a registered agent engine. |
| `area:handbook` | An area in the project config of the workspace. |
| `publish` | An effect that the tenant registers. Under the software binding the effect is `open-pr`. |

The smallest valid workflow is the header and one command step.

```yaml
format: daggry/workflow@1
steps:
  - id: render
    kind: command
    run: [sh, scripts/render.sh]
    scope: anywhere
```

## Validation

Every YAML example on this page was checked against [workflow.json](/schemas/workflow.json) with a draft 2020-12 validator, and each one is valid.

To check a file of your own, give the schema and the file to any validator that supports draft 2020-12. The schema does not check the rules that need another document: that an `engine` is registered, that an extension kind and an effect are registered, that a validator reference resolves, and that an area name is in the project config.

## Load errors

The loader reports the first refusal, in the order of the table. A refused workflow returns as `workflow: <message>` and the run does not start.

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

The table is a short, representative set. The first column shows the cause. The second names the stage and the location.

| Input | Refusal |
|---|---|
| `steps:` followed by `- &a {id: v, kind: human, waiting_for: approval}` | Unsupported construct (anchor) |
| `steps: [` | Not YAML |
| No `format` key | Schema (missing `format`) |
| `format: daggry/workflow@2` | Schema at `/format` (unknown major) |
| `steps: 3` | Schema at `/steps` |
| `kind: parallel` | Schema at `/steps/0/kind` |
| `owner: platform-team` at the top level | Schema (a key without a namespace) |
| A loop with `max: 0` | Schema at `/steps/0/loop/max` |
| A `verify` step with `run: x` | Schema at `/steps/0` (extra key) |
| A `verify` step with no `validators`, or with `validators: []` | Schema at `/steps/0` |
| `validators: [Project Review]` | Schema at `/steps/0/validators/0` (not a reference) |
| `validators: [daggry]` | Schema at `/steps/0/validators/0` (reserved name) |
| `validators: [acme/links]` | Schema at `/steps/0/validators/0` (a `/` is not allowed) |
| `do: Open PR` | Schema at `/steps/0/do` (not an effect name) |
| `scope: ["area:Web App"]` | Schema at `/steps/0/scope` (not an area name) |
| Two steps with `id: v` | Duplicate id `v` |
| `on_exhausted: ask` with no `ask` step | Exhaust target `ask` |
| `until: inputs.plan.criteria` (a claimed field) | Gate, class claimed |
| `until: explode()` | Expression, unknown function |

The loader does not check the rules in this table at load. Each fails later or does nothing.

| Not checked | What happens |
|---|---|
| That `outputs` names real kinds. | An unknown output is never delivered, and the step fails. |
| That `freeze` and `scope` globs compile. | A bad glob fails at the boundary check. |
| A fact name after `verdict.` | A name no judge emits is not caught at load. |

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
            "over",
            "as",
            "until",
            "max",
            "on_exhausted",
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
        "engine",
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
        "engine": {
          "type": "string",
          "minLength": 1,
          "description": "The identifier of an agent engine that the tenant registers."
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
        "waiting_for"
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
        "waiting_for": {
          "enum": [
            "approval",
            "input-needed"
          ]
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
          "description": "The name of an effect that the tenant registers."
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
