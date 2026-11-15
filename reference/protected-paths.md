# Protected paths

Reference. Every path and scope rule Daggry enforces on an agent step. For the idea, read [What an agent cannot change](/guide/concepts/protection).

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
| the verification policy | the test command named by the base commit's profile, and the lint and coverage configuration (see the [Roadmap](/roadmap) for its status) |

A change that adds a symbolic link, a gitlink, a type change or a case collision is a violation too. A case collision is judged on every directory component, so `Docs/x.md` is refused where `docs/` exists.

The project harness changes only through a pull request that a person merges. A run's own change to `.daggry/` takes effect in the next run after the merge.

## Scope

Each step declares what it may write.

| Scope | Meaning |
|---|---|
| `nothing` | the step writes no files |
| a list of globs | the step writes only matching paths |
| `anywhere` | any path except protected paths and CI configuration folders such as `.github/**` |

Daggry judges scope on the step's own change, measured against the last sealed commit. A `verify` step with scope `nothing` does not fail on files that earlier steps sealed.

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

- The instructions sit in a volume that is read-only in the main container.
- The seal key and the GitHub App key never enter the pod.
- A `verify` step runs on a clean copy of the code as a different unix user after the agent has ended, with commands read from the base commit.
- If the `verify` step cannot switch user, it measures nothing and the step fails.

For the `approval` fields, see [Kinds and schemas](/reference/kinds).
