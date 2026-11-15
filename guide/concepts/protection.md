# Protected paths

Daggry protects whatever instructs, constrains or judges an agent, and it does so with code, not with a prompt. This page explains what is protected, how scope and frozen tests work, and how a person widens the rules, for readers who want to know what an agent can and cannot change.

The rule is short: an agent never changes what instructs it, constrains it or judges it. The one widening is a person's grant, sealed as an `approval`.

## What instructs, constrains and judges

| Role | What it is | Where it lives |
|---|---|---|
| instructs | the step prompt, specialists, skills and project instruction files | the run lock and the base commit, written to a read-only volume |
| constrains | the workflow graph, each step's scope, the protected set | the control plane |
| judges | tests sealed in earlier iterations, the verification policy, validators | the base commit, the run lock and the control plane |

## Protected paths

These paths are protected in every run. No workflow and no step widens the set.

| Protected | Why |
|---|---|
| `.daggry/**` | the project profile and harness |
| `**/AGENTS.md`, `.agents/**`, `**/SKILL.md` | instruction files and skills for coding agents |
| agent-specific instruction files and config directories | the same, for each supported engine |
| `**/.mcp.json` | tool-server configuration |
| `**/.gitmodules`, `**/.gitattributes`, `**/.mailmap` | git behaviour |
| tests sealed in earlier loop iterations | the frozen tests |
| the verification policy | the test command named by the base commit's profile, and the lint and coverage configuration planned for it (see the [Roadmap](/roadmap)) |

Any change that adds a symbolic link, a gitlink, a type change or a case collision is a violation too. A case collision is judged on every directory component, so `Docs/x.md` is refused where `docs/` exists.

The project harness changes only through a pull request that a person merges. A run's own change to `.daggry/` takes effect after the merge, in the next run.

## Scope

Each step declares what it may write.

| Scope | Meaning |
|---|---|
| `nothing` | the step writes no files |
| a list of globs | the step writes only matching paths |
| `anywhere` | any path except protected paths and forge folders such as `.github/**` |

Daggry judges scope on the step's own change, measured against the last sealed commit. A `verify` step with scope `nothing` therefore does not fail on files that earlier steps sealed.

```yaml
- id: build
  kind: agent
  engine: <engine>
  prompt: Implement the approved plan.
  outputs: [change]
  tests: ["tests/**"]
  scope: ["src/**", "tests/**"]
```

Illustrative. `engine: <engine>` names the coding-agent engine that the step uses.

## Frozen tests

In a red-then-green loop, the test step writes a test and the control plane seals it. From that seal on, the test files are frozen, whatever scope a later step has. At every later boundary, Daggry compares each frozen path with the last sealed commit by file digest. A changed or missing file is a violation.

A frozen test the implementer believes is wrong does not get edited. The implementer ends its step with the test red, and the loop routes to a person.

## Unfreeze grants

A person can unfreeze one sealed test path.

```sh
daggry approve <run-id> --unfreeze <path>
```

- `<run-id>` is the run that is waiting.
- `<path>` is the frozen test file to open.

The control plane seals an `approval` that names the run, the path and the file's digest. The path is unfrozen for the next loop iteration only, and that iteration's sealed change sets the new frozen digest. The command works only at the `human` step that an exhausted loop routes to. Any other frozen path stays refused.

## How the check runs

Protection is enforced twice, and the second check is the authority.

1. The agent's step ends.
2. The runner lists what changed, from the difference between commits, so commits the agent made count.
3. A boundary check names the violations.
4. The runner puts violating paths back and records each one as an observation.
5. The runner commits and pushes to the run's branch with a scoped token.
6. The control plane rechecks from GitHub's own view of the commits. A violation here fails the step. Nothing is put back silently.

An engine hook can give early feedback, but it is never the gate.

## The pod boundary

The pod supports these rules. The instructions sit in a separate volume that is read-only in the main container, so editing instruction files in the working tree changes nothing for the run. The seal key and the GitHub App key never enter the pod. A `verify` step runs on a fresh worktree as a different unix user after the agent has ended, with commands read from the base commit. If it cannot switch user, it measures nothing and the step fails.

## Next steps

- To see how loops use frozen tests, read [Work graphs](/guide/concepts/workflows).
- To see what an `approval` looks like, read [Sealed evidence](/guide/concepts/evidence).
- For the exact `approval` fields, see [Kinds and schemas](/reference/kinds).
