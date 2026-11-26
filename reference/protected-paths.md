# Protected paths

*Reference*

An agent never changes what instructs it, constrains it or judges it. This page lists the rules behind that: which paths are protected, how a scope is judged, what a frozen path is and how Daggry enforces all three. Read it if you write workflows or own a project and need the exact list. For the reasons, read [What an agent cannot change](/guide/concepts/protection).

Every refusal leaves a record. A change that Daggry puts back is sealed as an `observation`, and a person's grant is sealed as an `approval`, so the evidence trail shows each attempt to cross a boundary and each time a person opened one.

<PathMap />

The diagram takes six paths of one workspace and shows whether a step can write each, and why.

## Protected paths

The table lists the paths that are protected in every run. No workflow and no step widens the set.

| Protected | Why |
|---|---|
| `.daggry/**` | The project config, `.daggry/project.yaml`, and anything else under `.daggry/`. |
| `**/AGENTS.md`, `.agents/**`, `**/SKILL.md` | Instruction files and skills for agents. |
| Engine-specific instruction files and config directories | The same, for each supported engine. |
| `**/.mcp.json` | Tool-server configuration. |
| Frozen paths | What a proof step sealed earlier in a loop. See [Frozen paths](#frozen-paths). |
| The files of a validator or judge you define | The files that the `run` of a validator or a custom judge in the baseline's [Project config](/reference/project-config) names. See [What a project adds](#what-a-project-adds). |
| A persona's instruction file | The file that `instructions.path` of a persona in the project config names. |
| `**/.gitmodules`, `**/.gitattributes`, `**/.mailmap` | They change how git reads the repository. |

A change that adds a symbolic link or a git submodule, changes the type of a path or adds a case collision is a violation too. A case collision is judged on every directory component, so `Docs/x.md` is refused where `docs/` exists.

Everything under `.daggry/` changes only when a person accepts a change into the workspace, outside every run. A run's own change to `.daggry/` takes effect in the next run whose baseline holds it.

## What a project adds

A [Project config](/reference/project-config) adds to the protected set in two ways, and both start from a name in the manifest. It never removes a path from it.

- **The files a validator or judge you define runs.** Every string in a command of `validators`, `judges` or `project.setup` that is the path of a file in the baseline is a protected path, with no entry anywhere. With `run: [sh, scripts/verify.sh]` the script `scripts/verify.sh` is protected, and so is the file of any other string in the list that is a path in the baseline.
- **The paths the project lists.** Each entry of `protect.paths` is a glob or an area reference, `area:<name>`. See [protect](/reference/project-config#protect).

The default covers the files a command names, not the files those programs read. A script that reads a rules file does not protect the rules file. List such a file in `protect.paths`.

## Scope

A scope is the set of paths that one step or one run can change. Each `command` and `agent` step declares its scope in the workflow. The values are defined in [Scope](/reference/workflow-schema#scope).

Daggry judges the scope of a step on the step's own change, measured against the last sealed version of the workspace. A step does not fail on files that previous steps sealed. Protected paths are judged against the baseline. No scope holds a protected path.

```yaml
- id: draft
  kind: agent
  persona: writer
  outputs: [change]
  freeze: ["checks/**"]
  scope: ["handbook/**", "checks/**"]
```

Illustrative. `writer` is a persona that the tenant config or the project config defines.

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

Frozen paths keep the proof of a criterion fixed while an agent does the work that satisfies it. See [Baseline proof](/reference/conformance#baseline-proof).

## Unfreeze grant

Only an approver can open a frozen path, and only one path at a time. A persona that believes a frozen proof is wrong asks on the issue and names the path. An approver's yes opens it. From the command line, the same grant is:

```sh
daggry approve <run-id> --unfreeze <path>
```

These rules apply to the grant.

- It seals an `approval` that names the run, the path and the file's digest.
- The path is unfrozen for the next iteration only. That iteration's sealed change sets the new frozen digest.
- Any other frozen path stays refused.

## Enforcement

The boundary check runs twice for each step, in the pod and in the control plane, and the second check is the authority. The list gives the order.

1. The agent's step ends.
2. The runner lists what changed, from the difference between the last sealed version and the step's result, so every difference the agent made counts.
3. A boundary check names the violations.
4. The runner puts violating paths back and records each one as an observation.
5. The runner hands the change to the workspace store with a credential scoped to one workspace.
6. The control plane rechecks from the store's own view of the change. A violation here fails the step. Nothing is put back silently.

An engine hook can give early feedback. It is never the gate.

## Pod boundary

These rules hold for every pod.

- The instructions of the step's persona sit in a volume that is read-only for the agent.
- The project's own agent configuration (instruction files, agent folders, skills, commands, hooks and project settings) is read from the working copy. The boundary check under Enforcement guards it: a changed path is put back in the pod and rechecked in the control plane, and the step fails.
- The signing key and the workspace store's own key never enter the pod.
- A `verify` step runs each validator you define on a clean copy of the workspace as a different unprivileged user after the agent has ended, with commands read from the baseline.
- If the `verify` step cannot switch user, it measures nothing and the step fails with ``the verify step could not switch to a different unix user: <cause>; nothing was measured``.

## Next steps

The list names the pages to read next.

- For the `approval` fields, see [Artifact kinds](/reference/kinds#evidence-approval-1).
- For what a workflow step writes as `scope`, see [Scope](/reference/workflow-schema#scope).
