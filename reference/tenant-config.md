# Tenant config

*Reference*

The tenant config is one YAML document that says how a tenant's factory works: which personas work, which workflows it offers, which validators and judges projects share, where a person must approve, and what each project gets. Read this page to look up a key or the precedence rule. For the steps, follow [Set up a tenant](/guide/how-to/set-up-a-tenant).

The control plane holds the document outside every runner, so no agent can change it. A run pins what it uses from it in the run lock, the first record of the run: each persona with the digest of its instructions, each validator and each judge. The evidence trail therefore shows which rules a run ran under, and a later change to the document applies to new runs only.

The documents on this page are illustrative. `<engine>` stands for the name of a coding-agent engine your installation provides.

<TenantConfigMap />

The diagram pairs the main sections of the document with what each gives a run. For what lives in which file, see the diagram on the [Reference](/reference/) page.

## The document

The smallest tenant config that works has three things: who can approve, a credential for the engine and one trigger. Daggry ships the rest.

```yaml
format: daggry/tenant@1

approvers: [4411, 5207]

agents:
  engines:
    <engine>:
      credential:
        ref: model-credential

projects:
  example/shop-web:
    triggers:
      factory_label:
        on: issue-labeled
        label: factory
        workflow: idea-to-pr
```

With this document, an approver who labels an issue `factory` gets the default team on it. See [The default team](#the-default-team).

The table lists the sections. Only `format`, always `daggry/tenant@1`, is required.

| Section | What it holds |
|---|---|
| `approvers` | The numeric GitHub ids of the people who can start, steer and approve runs. See [Who Daggry listens to](/reference/conversation#who-daggry-listens-to). |
| [`personas`](#personas) | The named agents every project can use, besides the default team. |
| [`workflows`](#workflows) | The workflows the tenant offers, besides the one Daggry ships. |
| [`agents`](#agents) | The engines, and where a person must approve. |
| [`validators`](#validators), [`judges`](#judges) | Validators and judges that projects share. |
| [`projects`](#projects) | The workspaces the factory serves, and what each one gets. |
| [`orchestration`](#orchestration), [`runners`](#runners) | Scheduling limits, runner images and runner classes. |
| [`extensions`](#extensions) | What the tenant registers beyond what Daggry ships. |

Every object is closed: a key this page does not define is refused, unless it is an [extension key](/reference/open-formats#extension-keys). The document uses the strict [YAML subset](/reference/workflow-rules#yaml-subset).

## personas

A persona is a named agent that your team defines once: an engine, and the instructions it works under. An `agent` step in a workflow names a persona and holds no instructions of its own. So the same workflow can run with your team's planner, and a change to how the planner works is a change to one persona, not to every workflow. `personas` is a map from a persona name to its entry. The table lists the keys.

| Key | Required | Meaning |
|---|---|---|
| `engine` | yes | The name of an engine in `agents.engines`. |
| `instructions.text` | one of the two | The instructions, inline. |
| `instructions.path` | one of the two | The instruction file, relative to the root of `source`. |
| `source.workspace`, `source.revision` | with `instructions.path` | The workspace that holds the instruction file, and the revision it is read from. |
| `description` | no | One or two sentences that say what the persona is for. |

A name starts with a lowercase letter and holds lowercase letters, digits, `-` and `_`.

These rules apply to a persona.

- **Instructions say how, the objective says what.** The persona's instructions describe how this member of the team always works. The run supplies what to do now: its objective, sealed when the run starts. A step adds no instructions of its own. Besides its instructions, a persona gets the objective, the sealed outputs of the steps before it, the outputs it must hand in and its scope. Nothing else reaches it.
- **Instructions are pinned.** A file is read from one revision, and inline text is part of this document. Both are held outside every run, so an agent cannot change what instructs it.
- **A project can define its own.** A persona in the `personas` of a [Project config](/reference/project-config#personas) wins over a tenant persona of the same name, for runs on that workspace.
- **The trail names the persona.** The run lock pins each persona a run uses, with its engine and the digest of its instructions. Every record an `agent` step seals carries the persona's name and that digest. See [Stamped keys](/reference/envelope#stamped-keys).

### The default team

Daggry ships a team and a workflow, so a new tenant defines nothing before its first run. The table lists them.

| Shipped | What it is |
|---|---|
| `planner` | A persona that turns an objective into a plan with checkable criteria, and asks when the objective is unclear. |
| `developer` | A persona that writes the proof for each criterion, then the work that makes it pass. |
| `reviewer` | A persona that reads a whole change and posts its findings as review comments. |
| `idea-to-pr` | A workflow: plan, your approval, build until every criterion is covered, pull request, review, your approval, merge. See [The workflow behind this page](/guide/how-to/issue-to-pr#finish-review-fix-merge). |

The default team runs on the tenant's engine. Each shipped persona and the workflow are pinned by digest in the run lock, like your own. To change one, define a persona or a workflow of the same name: yours wins.

<Lookup />

The diagram shows how Daggry resolves a name in a workflow, for a persona, a validator or a judge: it looks in the project config of the baseline first, then in the tenant config, and refuses the run when it starts if neither has the name.

::: details A persona for the replay engine
The `replay` engine plays back a recorded session instead of starting a model. A persona on it takes `transcript`, the path of the recording in `source`, in place of `instructions`.
:::

## workflows

The `workflows` section lists the workflows the tenant offers, and pins each to one file content. The table lists the keys.

| Key | Meaning |
|---|---|
| `workflows.<name>.source.workspace` | The workspace that holds the workflow file. |
| `workflows.<name>.source.path` | The path of the file in that workspace. |
| `workflows.<name>.source.revision` | The revision the file is read from. |

A project entry assigns a workflow by its name here. The workspace a run works on never assigns a workflow to itself. For the file, see [Workflow file](/reference/workflow-schema).

## agents

The `agents` section names the engines personas run on, and the points where a run always waits for a person. The table lists the keys.

| Key | Meaning |
|---|---|
| `agents.engines.<name>.credential.ref` | The name of the stored secret the engine uses. The document never holds a secret value. |
| `agents.approval.require` | The points where a run always waits for a person: `plan`, `effect` or both. |

Approval rules bind every workflow, and they win over a workflow's own `auto_when`. With `plan`, a workflow whose `agent` step hands in a `plan` must have a `human` step whose `of` names that step, before any later step. With `effect`, a `human` step must come before every `effect` step. Daggry refuses a workflow that does not fit. Each approval is sealed, bound to the digest of what the person approved.

## validators

The `validators` section holds validators that projects share. Each is pinned to a revision and held outside every run, so it counts as evidence. For what a validator is, see [Validators](/reference/validators).

```yaml
validators:
  scripts:
    licence-terms:
      source:
        workspace: factory-validators
        revision: v-0009
      run: [sh, licence/check.sh]
      output: document
```

The table lists the keys of an entry of `validators.scripts`.

| Key | Required | Meaning |
|---|---|---|
| `source.workspace`, `source.revision` | yes | The workspace that holds the script, and the revision it is read from. |
| `run` | yes | The command, with paths relative to the root of the source. See [Commands](/reference/project-config#commands). |
| `output`, `output_file`, `role`, `timeout`, `env`, `needs` | no | The same keys as a project's validator. See [validators](/reference/project-config#validators). |

A tenant validator runs on the project's workspace, on a clean copy of the last sealed version, with the files of its source beside it and read-only. A workflow names it by its bare name, and a project validator of the same name wins. The reserved names are in [Referring to a validator](/reference/validators#referring-to-a-validator).

## judges

The `judges` section holds custom judges that projects share, pinned like validators. For what a judge is, see [Judges](/reference/judges). The table lists the keys of an entry of `judges.scripts`.

| Key | Required | Meaning |
|---|---|---|
| `source.workspace`, `source.revision` | yes | The workspace that holds the script, and the revision it is read from. |
| `run` | yes | The command, with paths relative to the root of the source. |
| `timeout` | no | The longest the judge can run, in seconds. |

A project judge of the same name wins. A tenant declares no rubric judge: those are declared in the project config.

## projects

The `projects` section lists the workspaces the factory serves and what the tenant decided for each. A run starts only for a listed workspace. The table lists the keys of `projects.<workspace>`.

| Key | Meaning |
|---|---|
| `workflows.allowed` | The workflows that can run on this workspace. Absent: every workflow the tenant offers. |
| `workflows.default` | The workflow a run uses when it names none. |
| `triggers` | What starts a run on this workspace. See [Triggers](#triggers). |
| `personas.allowed` | The tenant personas that can work on this workspace. Absent: all of them. |
| `agents.engines` | The engines that can work on this workspace. Absent: all of them. |
| `agents.approval.require` | Approval points added to the tenant-wide rule. A project entry adds and never removes one. |
| `areas` | Area names from the workspace's [Project config](/reference/project-config#areas). Together they are the scope of every run on this workspace. Absent: the tenant sets no scope. |
| `trust_project` | Default `true`. With `false`, only the validators and judges this document declares count as evidence. See [When a validator counts as evidence](/reference/validators#when-a-validator-counts-as-evidence). |
| `image` | The runner image, by its name in `runners.images`. Absent: the default image. |

```yaml
projects:
  example/shop-web:
    workflows:
      allowed: [delivery]
      default: delivery
    personas:
      allowed: [planner, test-writer, implementer]
    agents:
      approval:
        require: [effect]
    areas: [app]
```

A project entry narrows the tenant's own lists: a name the tenant lacks is refused, and so is a trigger whose workflow is not allowed on the workspace. Daggry checks the rest when a run starts and refuses the run when a workflow does not fit the workspace: an area the project config lacks, a `verify` step that names `project` where the project has no canonical validator, or a tool the image does not hold.

### Triggers

A trigger starts a run when something happens on GitHub, so nobody has to run a command. Triggers live here, in the tenant config, and never in the repository: a repository cannot assign itself a workflow. `triggers` is a map from a trigger name to its entry.

<TriggerRouting />

The diagram shows four triggers of one project and the workflow each starts: two labels, an issue type and a schedule.

```yaml
projects:
  example/shop-web:
    triggers:
      factory_label:
        on: issue-labeled
        label: factory
        workflow: idea-to-pr
      bug_label:
        on: issue-labeled
        label: bug
        workflow: fix-bug
      bug_type:
        on: issue-typed
        issue_type: Bug
        workflow: fix-bug
      nightly_hunt:
        on: schedule
        cron: "0 2 * * *"
        objective: Find and fix one defect in the app area. Prove it with a failing test first.
        workflow: bug-hunter
```

The table lists the keys of a trigger.

| Key | Required | Meaning |
|---|---|---|
| `on` | yes | What starts the run: `issue-labeled`, `issue-typed`, `pull-request-opened` or `schedule`. |
| `label` | with `issue-labeled` | The label. |
| `issue_type` | with `issue-typed` | The issue type. |
| `cron` | with `schedule` | When to run, as a five-field cron expression in UTC. |
| `objective` | with `schedule` | The standing objective of every run the trigger starts. With an issue or a pull request it is optional, and it comes before their text. |
| `workflow` | yes | The name of a workflow in [`workflows`](#workflows). |

These rules apply to triggers.

- **Many triggers, one workflow.** Several triggers can start the same workflow, and a project can have any number of triggers.
- **Every run has an objective.** For `issue-labeled` and `issue-typed`, the objective is the title and the body of the issue, and the run talks to you there. For `pull-request-opened`, it is the title and the body of the pull request. For `schedule`, it is the trigger's `objective`. Daggry seals the objective as the work item when the run starts, with the trigger's name and the fields of the event beside it. The text takes no placeholders: a persona reads the event fields from the same record.
- **A schedule opens its own issue.** A scheduled run has no issue to start from, so Daggry opens one for each run with the objective as its text, and the run reports and asks there.
- **Only an approver starts a run, and an issue has one run at a time.** See [Starting, waiting and stopping](/reference/conversation#starting-waiting-and-stopping).
- **The trail names the trigger.** The work item of the run holds the objective and the trigger that started it, and `daggry status` shows the trigger.

Daggry's GitHub App watches the repository for these events. See [Install Daggry](/guide/how-to/deploy).

## Precedence

Three files set rules for a run, and each has one owner. The tenant's rule wins over the project's, and the project's wins over the workflow's.

<ConfigFiles />

The diagram shows who writes each file and the order in which they win. The table lists what each file sets.

| File | Sets | Cannot |
|---|---|---|
| Tenant config | The shared personas, validators and judges. The workflows, engines and approval points for each workspace. Every limit. | - |
| [Project config](/reference/project-config) | What is true of one workspace: its areas, validators, judges, own personas and protected paths. | Choose a workflow, an approval rule or the scope of a run. |
| [Workflow](/reference/workflow-schema) | The steps of one piece of work: which persona, which validators and judges, and the scope of each step. | Widen a project or tenant rule. |

Precedence is about limits. Name lookup runs the other way: for a persona, a validator or a judge of the same name, the project's wins over the tenant's, because the project knows its own work best. With `trust_project: false`, the tenant takes that back for validators and judges.

Only a person widens a rule. A project or a workflow can add limits, and an agent can change none of the three files. Inside one run, the one widening is a person's grant, sealed as an approval, such as [unfreeze](/reference/protected-paths#unfreeze-grant).

## Other sections

You rarely change these sections after the first setup.

### orchestration

The `orchestration` section holds the limits Daggry follows when it gives work to runners. The table lists the keys.

| Key | Meaning |
|---|---|
| `orchestration.concurrency_cap` | The most attempts that run at one time for this tenant. |
| `orchestration.lease_seconds` | The length of a job lease. |
| `orchestration.attempts.max` | The most attempts one job can have. A job that needs one more fails the run. |
| `orchestration.retry.backoff_seconds` | The wait before a new attempt starts after a lapsed lease. |
| `orchestration.parking.max_seconds` | The longest a run stays `parked` before it fails. See [States and reasons](/reference/api#states-and-reasons). |

### runners

The `runners` section holds the images that run steps, and the isolation class of each kind of runner. The table lists the keys.

| Key | Meaning |
|---|---|
| `runners.images.<name>.image` | The image reference, by digest. |
| `runners.images.<name>.tools` | The tools the image holds, by the labels a project config uses in `needs.tools`. |
| `runners.images.<name>.default` | `true` on at most one image: the one a workspace gets when its project entry names none. |
| `runners.classes.<name>.module` | `deterministic-runner` or `agent-runner`. |
| `runners.classes.<name>.network` | `none` or `open`. |
| `runners.classes.<name>.model_credential` | Whether a runner of the class holds an engine's credential. Always `false` for `deterministic-runner`. |

A validator asks for a class by name in `needs.runner`. No class gives a runner the signing key.

### extensions

Daggry ships the five step kinds, the nine artifact kinds, the `open-pr` and `merge-pr` effects and the output formats `junit`, `tap`, `libtest` and `sarif`. The `extensions` section registers anything a tenant adds to those. Most tenants leave it out. The table lists the keys.

| Key | Registers |
|---|---|
| `extensions.adapters.<format>.version` | A reader for one more tool output format. A validator's `output` names the format. |
| `extensions.effects.<name>.version` | One more effect that an `effect` step can name in `do`. |
| `extensions.step_kinds.<namespace>/<name>` | One more step kind, with `module` (what runs it) and `schema` (the URL of the JSON Schema for its keys). See [Extension step kinds](/reference/workflow-rules#extension-step-kinds). |
| `extensions.artifact_kinds.<namespace>/<name>@<major>` | One more artifact kind, with `schema`. The `evidence` and `daggry` namespaces take no added kinds. |

A name that Daggry does not ship and this section does not register is refused.

## Where it lives

The control plane holds the document, outside every runner and every workspace. A person changes it. No run, no step and no agent writes it.

::: details Documents that Daggry refuses
The table is a short, representative set.

| Input | Refusal |
|---|---|
| No `format` key, or `format: daggry/tenant@2` | Missing `format`, or an unknown major version. |
| A persona whose `engine` is not in `agents.engines` | An unknown engine. |
| A persona with `instructions.path` and no `source` | A file needs a pinned source. |
| An `agents.engines` entry with `credential: {value: ...}` | An unknown key. A credential is given by `ref` only. |
| `validators.scripts` with an entry that has no `source`, or one named `project` | Missing `source`, or a reserved name. |
| A project entry whose `workflows.allowed` or `personas.allowed` names something the tenant lacks | An unknown name. |
| A project entry with `areas: ["src/**"]` | Not an area name. The project config defines the paths. |
| A runner class with `module: deterministic-runner` and `model_credential: true` | A deterministic runner never holds a model credential. |
| `retries: 3` at the top level | An unknown key without a namespace. |
:::

## Schema

The tenant config has a published JSON Schema (draft 2020-12): [daggry-tenant-v1.json](/schemas/daggry-tenant-v1.json).

::: details Schema: tenant config
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "daggry/tenant@1",
  "title": "daggry/tenant@1: the tenant config",
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
      "const": "daggry/tenant@1"
    },
    "approvers": {
      "type": "array",
      "uniqueItems": true,
      "items": {
        "type": "integer",
        "minimum": 1
      },
      "description": "The numeric GitHub ids of the people who can start, steer and approve runs."
    },
    "workflows": {
      "type": "object",
      "propertyNames": {
        "$ref": "#/$defs/name"
      },
      "additionalProperties": {
        "type": "object",
        "required": [
          "source"
        ],
        "additionalProperties": false,
        "patternProperties": {
          "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true
        },
        "properties": {
          "source": {
            "type": "object",
            "required": [
              "workspace",
              "path",
              "revision"
            ],
            "additionalProperties": false,
            "patternProperties": {
              "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true
            },
            "properties": {
              "workspace": {
                "$ref": "#/$defs/workspace"
              },
              "path": {
                "$ref": "#/$defs/name"
              },
              "revision": {
                "$ref": "#/$defs/name"
              }
            }
          }
        }
      }
    },
    "orchestration": {
      "type": "object",
      "additionalProperties": false,
      "patternProperties": {
        "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true
      },
      "properties": {
        "concurrency_cap": {
          "type": "integer",
          "minimum": 1
        },
        "lease_seconds": {
          "type": "integer",
          "minimum": 1
        },
        "attempts": {
          "type": "object",
          "additionalProperties": false,
          "patternProperties": {
            "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true
          },
          "properties": {
            "max": {
              "type": "integer",
              "minimum": 1
            }
          }
        },
        "retry": {
          "type": "object",
          "additionalProperties": false,
          "patternProperties": {
            "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true
          },
          "properties": {
            "backoff_seconds": {
              "type": "integer",
              "minimum": 0
            }
          }
        },
        "parking": {
          "type": "object",
          "additionalProperties": false,
          "patternProperties": {
            "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true
          },
          "properties": {
            "max_seconds": {
              "type": "integer",
              "minimum": 1
            }
          }
        }
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
    "agents": {
      "type": "object",
      "additionalProperties": false,
      "patternProperties": {
        "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true
      },
      "properties": {
        "engines": {
          "type": "object",
          "propertyNames": {
            "$ref": "#/$defs/name"
          },
          "additionalProperties": {
            "type": "object",
            "required": [
              "credential"
            ],
            "additionalProperties": false,
            "patternProperties": {
              "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true
            },
            "properties": {
              "credential": {
                "type": "object",
                "required": [
                  "ref"
                ],
                "additionalProperties": false,
                "patternProperties": {
                  "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true
                },
                "properties": {
                  "ref": {
                    "$ref": "#/$defs/name"
                  }
                }
              }
            }
          }
        },
        "approval": {
          "type": "object",
          "additionalProperties": false,
          "patternProperties": {
            "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true
          },
          "properties": {
            "require": {
              "type": "array",
              "items": {
                "enum": [
                  "plan",
                  "effect"
                ]
              }
            }
          }
        }
      }
    },
    "runners": {
      "type": "object",
      "additionalProperties": false,
      "patternProperties": {
        "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true
      },
      "properties": {
        "images": {
          "type": "object",
          "propertyNames": {
            "$ref": "#/$defs/name"
          },
          "additionalProperties": {
            "type": "object",
            "required": [
              "image"
            ],
            "additionalProperties": false,
            "patternProperties": {
              "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true
            },
            "properties": {
              "image": {
                "$ref": "#/$defs/name"
              },
              "tools": {
                "type": "array",
                "items": {
                  "$ref": "#/$defs/label"
                }
              },
              "default": {
                "type": "boolean"
              }
            }
          }
        },
        "classes": {
          "type": "object",
          "propertyNames": {
            "$ref": "#/$defs/name"
          },
          "additionalProperties": {
            "type": "object",
            "required": [
              "module",
              "network",
              "model_credential"
            ],
            "additionalProperties": false,
            "patternProperties": {
              "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true
            },
            "properties": {
              "module": {
                "enum": [
                  "deterministic-runner",
                  "agent-runner"
                ]
              },
              "network": {
                "enum": [
                  "none",
                  "open"
                ]
              },
              "model_credential": {
                "type": "boolean"
              }
            },
            "if": {
              "properties": {
                "module": {
                  "const": "deterministic-runner"
                }
              }
            },
            "then": {
              "properties": {
                "model_credential": {
                  "const": false
                }
              }
            }
          }
        }
      }
    },
    "validators": {
      "type": "object",
      "additionalProperties": false,
      "patternProperties": {
        "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true
      },
      "properties": {
        "scripts": {
          "type": "object",
          "additionalProperties": false,
          "patternProperties": {
            "^(?!(project|daggry|coverage|no_regression|baseline_proof)$)[a-z][a-z0-9_-]*$": {
              "$ref": "#/$defs/scriptValidator"
            }
          }
        }
      }
    },
    "judges": {
      "type": "object",
      "additionalProperties": false,
      "patternProperties": {
        "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true
      },
      "properties": {
        "scripts": {
          "type": "object",
          "additionalProperties": false,
          "patternProperties": {
            "^(?!(project|daggry|coverage|no_regression|baseline_proof)$)[a-z][a-z0-9_-]*$": {
              "$ref": "#/$defs/scriptJudge"
            }
          }
        }
      }
    },
    "projects": {
      "type": "object",
      "propertyNames": {
        "$ref": "#/$defs/workspace"
      },
      "additionalProperties": {
        "type": "object",
        "additionalProperties": false,
        "patternProperties": {
          "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true
        },
        "properties": {
          "workflows": {
            "type": "object",
            "additionalProperties": false,
            "patternProperties": {
              "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true
            },
            "properties": {
              "allowed": {
                "type": "array",
                "items": {
                  "$ref": "#/$defs/name"
                }
              },
              "default": {
                "$ref": "#/$defs/name"
              }
            }
          },
          "triggers": {
            "type": "object",
            "additionalProperties": false,
            "patternProperties": {
              "^[a-z][a-z0-9_]*$": {
                "type": "object",
                "required": [
                  "on",
                  "workflow"
                ],
                "additionalProperties": false,
                "patternProperties": {
                  "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true
                },
                "properties": {
                  "on": {
                    "enum": [
                      "issue-labeled",
                      "issue-typed",
                      "pull-request-opened",
                      "schedule"
                    ]
                  },
                  "label": {
                    "$ref": "#/$defs/name",
                    "description": "With issue-labeled: the label that starts a run."
                  },
                  "issue_type": {
                    "$ref": "#/$defs/name",
                    "description": "With issue-typed: the issue type that starts a run."
                  },
                  "cron": {
                    "$ref": "#/$defs/name",
                    "description": "With schedule: a five-field cron expression, in UTC."
                  },
                  "workflow": {
                    "$ref": "#/$defs/name",
                    "description": "The name of a workflow in the workflows section."
                  },
                  "objective": {
                    "$ref": "#/$defs/name",
                    "description": "The standing objective of every run this trigger starts. Required with schedule. With an issue or a pull request, it comes before their text."
                  }
                },
                "allOf": [
                  {
                    "if": {
                      "properties": {
                        "on": {
                          "const": "issue-labeled"
                        }
                      },
                      "required": [
                        "on"
                      ]
                    },
                    "then": {
                      "required": [
                        "label"
                      ]
                    }
                  },
                  {
                    "if": {
                      "properties": {
                        "on": {
                          "const": "issue-typed"
                        }
                      },
                      "required": [
                        "on"
                      ]
                    },
                    "then": {
                      "required": [
                        "issue_type"
                      ]
                    }
                  },
                  {
                    "if": {
                      "properties": {
                        "on": {
                          "const": "schedule"
                        }
                      },
                      "required": [
                        "on"
                      ]
                    },
                    "then": {
                      "required": [
                        "cron",
                        "objective"
                      ]
                    }
                  }
                ]
              }
            },
            "description": "What starts a run on this workspace, keyed by trigger name."
          },
          "personas": {
            "type": "object",
            "additionalProperties": false,
            "patternProperties": {
              "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true
            },
            "properties": {
              "allowed": {
                "type": "array",
                "items": {
                  "$ref": "#/$defs/personaName"
                },
                "uniqueItems": true
              }
            }
          },
          "agents": {
            "type": "object",
            "additionalProperties": false,
            "patternProperties": {
              "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true
            },
            "properties": {
              "engines": {
                "type": "array",
                "items": {
                  "$ref": "#/$defs/name"
                }
              },
              "approval": {
                "type": "object",
                "additionalProperties": false,
                "patternProperties": {
                  "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true
                },
                "properties": {
                  "require": {
                    "type": "array",
                    "items": {
                      "enum": [
                        "plan",
                        "effect"
                      ]
                    }
                  }
                }
              }
            }
          },
          "areas": {
            "type": "array",
            "minItems": 1,
            "uniqueItems": true,
            "items": {
              "type": "string",
              "pattern": "^[a-z][a-z0-9_-]*$"
            }
          },
          "image": {
            "$ref": "#/$defs/name"
          },
          "trust_project": {
            "type": "boolean",
            "default": true,
            "description": "False: only validators and judges the tenant config declares count as evidence. A project's own are previews."
          }
        }
      }
    },
    "extensions": {
      "type": "object",
      "additionalProperties": false,
      "patternProperties": {
        "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true
      },
      "properties": {
        "adapters": {
          "type": "object",
          "propertyNames": {
            "$ref": "#/$defs/formatName"
          },
          "additionalProperties": {
            "type": "object",
            "required": [
              "version"
            ],
            "additionalProperties": false,
            "patternProperties": {
              "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true
            },
            "properties": {
              "version": {
                "$ref": "#/$defs/name"
              }
            }
          }
        },
        "effects": {
          "type": "object",
          "propertyNames": {
            "$ref": "#/$defs/effectName"
          },
          "additionalProperties": {
            "type": "object",
            "required": [
              "version"
            ],
            "additionalProperties": false,
            "patternProperties": {
              "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true
            },
            "properties": {
              "version": {
                "$ref": "#/$defs/name"
              }
            }
          }
        },
        "step_kinds": {
          "type": "object",
          "propertyNames": {
            "type": "string",
            "pattern": "^[^/@]+/[^/@]+$"
          },
          "additionalProperties": {
            "type": "object",
            "required": [
              "module",
              "schema"
            ],
            "additionalProperties": false,
            "patternProperties": {
              "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true
            },
            "properties": {
              "module": {
                "enum": [
                  "deterministic-runner",
                  "agent-runner",
                  "control-plane"
                ]
              },
              "schema": {
                "$ref": "#/$defs/name"
              }
            }
          }
        },
        "artifact_kinds": {
          "type": "object",
          "propertyNames": {
            "type": "string",
            "pattern": "^(?!evidence/|daggry/)[^/@]+/[^/@]+@[0-9]+$"
          },
          "additionalProperties": {
            "type": "object",
            "required": [
              "schema"
            ],
            "additionalProperties": false,
            "patternProperties": {
              "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true
            },
            "properties": {
              "schema": {
                "$ref": "#/$defs/name"
              }
            }
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
    "workspace": {
      "type": "string",
      "minLength": 1
    },
    "path": {
      "type": "string",
      "pattern": "^(?!/)(?!.*(^|/)\\.\\.(/|$))\\S+$"
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
    "validatorName": {
      "type": "string",
      "pattern": "^(?!(project|daggry|coverage|no_regression|baseline_proof)$)[a-z][a-z0-9_-]*$"
    },
    "scriptValidator": {
      "type": "object",
      "additionalProperties": false,
      "patternProperties": {
        "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true
      },
      "properties": {
        "source": {
          "type": "object",
          "required": [
            "workspace",
            "revision"
          ],
          "additionalProperties": false,
          "patternProperties": {
            "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true
          },
          "properties": {
            "workspace": {
              "$ref": "#/$defs/workspace"
            },
            "revision": {
              "$ref": "#/$defs/name"
            }
          }
        },
        "run": {
          "$ref": "#/$defs/command"
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
        }
      },
      "required": [
        "source",
        "run"
      ]
    },
    "scriptJudge": {
      "type": "object",
      "additionalProperties": false,
      "patternProperties": {
        "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true
      },
      "properties": {
        "source": {
          "type": "object",
          "required": [
            "workspace",
            "revision"
          ],
          "additionalProperties": false,
          "patternProperties": {
            "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true
          },
          "properties": {
            "workspace": {
              "$ref": "#/$defs/workspace"
            },
            "revision": {
              "$ref": "#/$defs/name"
            }
          }
        },
        "run": {
          "$ref": "#/$defs/command"
        },
        "timeout": {
          "type": "integer",
          "minimum": 1
        }
      },
      "required": [
        "source",
        "run"
      ]
    },
    "personaName": {
      "type": "string",
      "pattern": "^[a-z][a-z0-9_-]*$"
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
        "source": {
          "type": "object",
          "required": [
            "workspace",
            "revision"
          ],
          "additionalProperties": false,
          "patternProperties": {
            "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$": true
          },
          "properties": {
            "workspace": {
              "$ref": "#/$defs/workspace"
            },
            "revision": {
              "$ref": "#/$defs/name"
            }
          },
          "description": "The pinned workspace and revision that hold the instruction file. Required with instructions.path."
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
              "description": "The instruction file, relative to the root of the persona's source."
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
      ],
      "if": {
        "anyOf": [
          {
            "required": [
              "transcript"
            ]
          },
          {
            "required": [
              "instructions"
            ],
            "properties": {
              "instructions": {
                "required": [
                  "path"
                ]
              }
            }
          }
        ]
      },
      "then": {
        "required": [
          "source"
        ]
      }
    },
    "effectName": {
      "type": "string",
      "pattern": "^([A-Za-z0-9_-]+/)?[a-z][a-z0-9_-]*$"
    },
    "formatName": {
      "type": "string",
      "pattern": "^[a-z][a-z0-9_-]*$"
    }
  }
}
```
:::

## Next steps

The list names the pages to read next.

- For what a workspace says about itself, see [Project config](/reference/project-config).
- For the workflow file a persona works in, see [Workflow file](/reference/workflow-schema).
- For validators and judges, see [Validators](/reference/validators) and [Judges](/reference/judges).
