# Protected paths

Reference. Every path and scope rule Daggry enforces on a step: which paths are protected, how a scope is judged and how the boundary check enforces both. For the idea, read [What an agent cannot change](/guide/concepts/protection).

## Protected paths

These paths are protected in every run. No workflow and no step widens the set.

| Protected | Why |
|---|---|
| `.daggry/**` | the project config (today `.daggry/profile.yaml`) and the project harness |
| `**/AGENTS.md`, `.agents/**`, `**/SKILL.md` | instruction files and skills for coding agents |
| agent-specific instruction files and config directories | the same, for each supported engine |
| `**/.mcp.json` | tool-server configuration |
| `**/.gitmodules`, `**/.gitattributes`, `**/.mailmap` | git behaviour |
| tests sealed in earlier loop iterations | the frozen tests |
| the verification policy | the check that the base commit's [Project config](/reference/project-config) names, and the lint and coverage configuration (see the [Roadmap](/roadmap) for its status) |

A change that adds a symbolic link, a gitlink, a type change or a case collision is a violation too. A case collision is judged on every directory component, so `Docs/x.md` is refused where `docs/` exists.

The project harness changes only through a pull request that a person merges. A run's own change to `.daggry/` takes effect in the next run after the merge.

## What a project adds

Proposed standard; see the [Roadmap](/roadmap) for status.

A [Project config](/reference/project-config) adds to the protected set in two ways. It never removes a path from it.

- **The scripts a check runs.** Every string in a command of `checks`, `project.setup` or `project.build` that is the path of a file in the base commit is a protected path, with no entry anywhere. With `run: scripts/lint-docs.sh` the script is protected, and with `run: [node, scripts/verify.mjs]` so is `scripts/verify.mjs`.
- **The paths the project lists.** Each entry of `protect.paths` is a glob or an area reference, `area:<name>`. See [protect](/reference/project-config#protect).

The default covers the files a command names, not the files those programs read. A command such as `[npm, run, lint]` runs a script that `package.json` defines, and `package.json` is not protected by default. Either list such a file in `protect.paths`, or name the tool and its arguments in `run`.

## Scope

A scope is the set of paths that one step or one run may change. Each `command` and `agent` step declares its scope in the workflow. The values are defined in [Scope](/reference/workflow-schema#scope).

Daggry judges the scope of a step on the step's own change, measured against the last sealed commit. A step does not fail on files that earlier steps sealed. Protected paths are judged against the base commit. No scope holds a protected path.

```yaml
- id: build
  kind: agent
  engine: <engine>
  prompt: Implement the approved plan.
  outputs: [change]
  tests: ["tests/**"]
  scope: ["src/**", "tests/**"]
```

Illustrative. `engine: <engine>` names the coding-agent engine the step uses.

### The scope of a run

Proposed standard; see the [Roadmap](/roadmap) for status.

A run has a scope when the tenant or the run request names areas of the project. An area is a named group of paths that the project config defines. See [areas](/reference/project-config#areas) and [projects](/reference/tenant-config#projects).

| Rule | Detail |
|---|---|
| The scope of a run | The paths that the named areas hold. A run that names no area has no scope of its own. |
| A run request | Names areas inside the tenant's list for the repository. It narrows and never widens. |
| A step in such a run | Changes a path only when the scope of the step and the scope of the run both hold it. `anywhere` then means anywhere inside the scope of the run. |
| An area reference in a step | `area:<name>` in a step's scope stands for the paths the area holds. |
| An unknown area name | The run is refused when it starts. |
| A protected path | Stays protected inside every scope. |

The boundary check under [Enforcement](#enforcement) judges the scope of a run the same way it judges the scope of a step.

## Frozen tests

After the test step is sealed, Daggry compares each frozen path with the last sealed commit by file digest at every later boundary. A changed or missing file is a violation, whatever scope a later step has.

## Unfreeze grant

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
2. The runner lists what changed, from the difference between commits, so commits the agent made count.
3. A boundary check names the violations.
4. The runner puts violating paths back and records each one as an observation.
5. The runner commits and pushes to the run's branch with a scoped token.
6. The control plane rechecks from GitHub's own view of the commits. A violation here fails the step. Nothing is put back silently.

An engine hook can give early feedback. It is never the gate.

## Pod boundary

- Daggry's own instructions, such as the step prompt, sit in a volume that is read-only in the main container.
- The project's own agent configuration (instruction files, agent folders, skills, commands, hooks and project settings) is read from the working tree. The boundary check under Enforcement guards it: a changed path is put back in the pod and rechecked in the control plane, and the step fails.
- The seal key and the GitHub App key never enter the pod.
- A `verify` step runs on a clean copy of the code as a different unix user after the agent has ended, with commands read from the base commit.
- If the `verify` step cannot switch user, it measures nothing and the step fails with ``the verify step could not switch to a different unix user: <cause>; nothing was measured``.

For the `approval` fields, see [Kinds and schemas](/reference/kinds).
