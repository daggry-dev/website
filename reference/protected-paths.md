# Protected paths

*Reference*

For the idea, read [What an agent cannot change](/guide/concepts/protection).

This page lists every path and scope rule that Daggry enforces on a step: which paths are protected, how a scope is judged and how the boundary check enforces both. It is for people who write workflows and people who set up a workspace.

## Protected paths

The table lists the paths that are protected in every run. No workflow and no step widens the set.

| Protected | Why |
|---|---|
| `.daggry/**` | The project config, `.daggry/project.yaml`, and the project harness. |
| `**/AGENTS.md`, `.agents/**`, `**/SKILL.md` | Instruction files and skills for agents. |
| Engine-specific instruction files and config directories | The same, for each supported engine. |
| `**/.mcp.json` | Tool-server configuration. |
| Frozen paths | What a proof step sealed in a previous loop iteration. See [Frozen paths](#frozen-paths). |
| The files of a script validator | What the validators of the baseline's [Project config](/reference/project-config) run. See [What a project adds](#what-a-project-adds). |
| Paths a binding adds | The files that change how the binding's tools read the workspace. See [Bindings](/reference/bindings). |

A change that adds a symbolic link, changes the type of a path or adds a case collision is a violation too. A case collision is judged on every directory component, so `Docs/x.md` is refused where `docs/` exists.

The project harness changes only when a person accepts a change into the workspace, outside every run. A run's own change to `.daggry/` takes effect in the next run whose baseline holds it.

## What a project adds

A [Project config](/reference/project-config) adds to the protected set in two ways. It never removes a path from it.

- **The files a script validator runs.** Every string in a command of `validators` or `project.setup` that is the path of a file in the baseline is a protected path, with no entry anywhere. With `run: scripts/review.sh` the script is protected, and with `run: [sh, scripts/verify.sh]` so is `scripts/verify.sh`.
- **The paths the project lists.** Each entry of `protect.paths` is a glob or an area reference, `area:<name>`. See [protect](/reference/project-config#protect).

The default covers the files a command names, not the files those programs read. A script that reads a rules file does not protect the rules file. List such a file in `protect.paths`.

## Scope

A scope is the set of paths that one step or one run can change. Each `command` and `agent` step declares its scope in the workflow. The values are defined in [Scope](/reference/workflow-schema#scope).

Daggry judges the scope of a step on the step's own change, measured against the last sealed version of the workspace. A step does not fail on files that previous steps sealed. Protected paths are judged against the baseline. No scope holds a protected path.

```yaml
- id: draft
  kind: agent
  engine: <engine>
  prompt: Do the work of the approved plan.
  outputs: [change]
  freeze: ["checks/**"]
  scope: ["handbook/**", "checks/**"]
```

Illustrative. `<engine>` is the identifier of a registered agent engine.

### The scope of a run

A run has a scope when the tenant or the run request names areas of the project. An area is a named group of paths that the project config defines. See [areas](/reference/project-config#areas) and [projects](/reference/tenant-config#projects).

| Rule | Detail |
|---|---|
| The scope of a run | The paths that the named areas hold. A run that names no area has no scope of its own. |
| A run request | Names areas inside the tenant's list for the workspace. It narrows and never widens. |
| A step in such a run | Changes a path only when the scope of the step and the scope of the run both hold it. `anywhere` then means anywhere inside the scope of the run. |
| An area reference in a step | `area:<name>` in a step's scope stands for the paths the area holds. |
| An unknown area name | The run is refused when it starts. |
| A protected path | Stays protected inside every scope. |

The boundary check under [Enforcement](#enforcement) judges the scope of a run the same way it judges the scope of a step.

## Frozen paths

A proof step is an `agent` step with `freeze`. When the control plane seals it, each path of its change that matches the `freeze` globs is frozen with its file digest. Daggry compares each frozen path with the last sealed version by file digest at every later boundary. A changed or missing file is a violation, whatever scope a later step has.

Frozen paths keep the proof of a criterion fixed while an agent does the work that satisfies it. See [Baseline proof](/reference/validators#baseline-proof).

## Unfreeze grant

A person frees one frozen path with this command.

```sh
daggry approve <run-id> --unfreeze <path>
```

- The command works only at the `human` step that an exhausted loop routes to.
- It seals an `approval` that names the run, the path and the file's digest.
- The path is unfrozen for the next loop iteration only. That iteration's sealed change sets the new frozen digest.
- Any other frozen path stays refused.

## Enforcement

The second check is the authority.

1. The agent's step ends.
2. The runner lists what changed, from the difference between the last sealed version and the step's result, so every difference the agent made counts.
3. A boundary check names the violations.
4. The runner puts violating paths back and records each one as an observation.
5. The runner hands the change to the workspace store with a credential scoped to one workspace.
6. The control plane rechecks from the store's own view of the change. A violation here fails the step. Nothing is put back silently.

An engine hook can give early feedback. It is never the gate.

## Pod boundary

- Daggry's own instructions, such as the step prompt, sit in a volume that is read-only in the main container.
- The project's own agent configuration (instruction files, agent folders, skills, commands, hooks and project settings) is read from the working copy. The boundary check under Enforcement guards it: a changed path is put back in the pod and rechecked in the control plane, and the step fails.
- The seal key and the workspace store's own key never enter the pod.
- A `verify` step runs each script validator on a clean copy of the workspace as a different unprivileged user after the agent has ended, with commands read from the baseline.
- If the `verify` step cannot switch user, it measures nothing and the step fails with ``the verify step could not switch to a different unix user: <cause>; nothing was measured``.

## Next steps

- For the `approval` fields, see [Kinds and schemas](/reference/kinds#evidence-approval-1).
- For the paths one kind of work adds, see [Bindings](/reference/bindings).
