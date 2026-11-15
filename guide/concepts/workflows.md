# Work graphs

A workflow is how you describe a kind of work to Daggry: the steps, their order, what each step must hand to the next, where code checks the result, and where a person decides. This page is for readers who are deciding whether Daggry fits work other than software delivery, and for readers who are about to write a workflow.

<WorkflowGraph />

The diagram shows the delivery workflow, the first workflow Daggry ships: a plan, a person's approval, a bounded loop of test, implementation and measurement steps, and a pull request at the end. Other kinds of work use the same parts in a different arrangement.

You write a workflow as a YAML file and keep it in your repository. Daggry runs it as a graph. The graph is data, so a new kind of work needs a new file and not a new release of the platform. An agent never changes the graph.

## Building blocks

Every workflow is built from five parts. Each part has one job.

| Part | What it does | Example |
|---|---|---|
| Step | One unit of work, of one of five kinds. | An agent drafts a report. |
| Output | A sealed artifact a step hands on. The next step, a gate or a person reads it. | A `plan` that lists what to do. |
| Gate | A rule over facts that code computed. It decides whether a loop ends. | Every item has a passing check. |
| Loop | Steps repeated for each item of an approved plan, with a hard bound. | Migrate one batch of files per iteration. |
| Human wait | The run stops and waits for a person to approve. | Approve the plan before any work starts. |

### Step kinds

The set of kinds is closed. A step does one thing, and you combine steps to describe the work.

| Kind | Runs in | What it does |
|---|---|---|
| `agent` | the pod | A coding-agent session that must deliver named artifact kinds. |
| `command` | the pod | A shell line, limited by a `scope` of paths it may write. |
| `verify` | the pod | Measures the sealed commit in a fresh worktree, with a command from the base commit. |
| `human` | nowhere | Releases the pod and waits. `daggry approve` completes it. |
| `effect` | the control plane | An idempotent side effect, such as opening a pull request. |

Nothing in these kinds is specific to code. An `agent` step can draft a report, a translation or a triage note. A `command` step can run any script. The check that `verify` runs is your own command from the repository's [project profile](/reference/profile).

### Outputs hand work on

A step names the artifact kinds it must deliver in `outputs`. Daggry seals each one. The next part of the graph reads what was sealed:

- A loop walks the `criteria` of a sealed `plan`.
- A `verify` step measures the sealed `change`.
- A `human` step binds your approval to the digest of the sealed `plan` or `change` it waits on.

Because each handover is a sealed artifact, a later step cannot rewrite what an earlier step delivered. See [Sealed evidence](/guide/concepts/evidence).

## What makes a graph data-driven

The graph is declarative and fixed before the run starts. What the run does inside it depends on data that appears while it runs.

| The file fixes | The run decides |
|---|---|
| The order of steps and loops. | How many iterations a loop needs: one for each criterion in the approved plan. |
| The bound `max` on every loop. | Whether a loop ends early, because its `until` gate already holds. |
| The `until` gate. | Whether an iteration is green or red, from the measurement of a fresh worktree. A red iteration repeats the same item. |
| Where a person waits. | Whether the run continues, waits or fails when a loop runs out of iterations. |
| What each step may write (`scope`). | Which paths each step changed, and whether they stayed in scope. |

A gate is an expression over sealed facts, such as `verdict.all_covered`. It reads only `derived` facts, which code computed from sealed inputs. A gate never depends on what an agent merely claimed. See [Gate expressions](/reference/gates).

### What the graph does not do

- An agent never adds, removes or reorders steps. The control plane holds the file outside every workspace, so no step can reach it.
- A step has no condition and there is no `if`. Branching happens at loops, gates and human waits.
- Steps run in order. There are no parallel steps.
- Loops do not nest. A loop walks the criteria of a plan.

These limits are the reason you can read a workflow and know every path a run can take.

## Why this makes Daggry general

Daggry is a platform for agentic work with checkable handovers. Software delivery is one arrangement of the parts, and the retro that reviews a finished run is another. The platform needs only three things from a kind of work:

1. A way to break it into steps with named outputs.
2. A check that code can run on the result, so a gate has derived facts to read.
3. A place where a person decides what code cannot.

Translating documentation, migrating files in batches, researching a question with sources and running a release check all have those three. For a catalog, see [Workflow patterns](/guide/how-to/workflow-patterns). To turn your own kind of work into a graph, see [Design a workflow](/guide/how-to/design-a-workflow).

## The shape of a run

| Term | Meaning |
|---|---|
| workflow | The YAML file: steps, loops and gates. |
| run | One execution of a workflow for a work item. |
| job | A group of steps that share one pod. A run is one job by default. |
| step | One unit of work. |
| attempt | One try at a job. A killed runner is replaced by a new attempt. |

A run is `queued`, `running`, `waiting`, `parked`, `succeeded`, `failed` or `stopped`. While it is `waiting`, `daggry status` shows why.

## A workflow file

Workflows are strict-subset YAML: no anchors, tags or merge keys. Daggry validates them against a JSON Schema and denies unknown fields. In an `agent` step, `engine: <engine>` names the coding-agent engine the step uses. The examples on this page are illustrative.

```yaml
steps:
  - id: plan
    kind: agent
    engine: <engine>
    prompt: Read the issue and write a plan with numbered acceptance criteria.
    outputs: [plan]
    scope: nothing

  - id: approve-plan
    kind: human
    waiting_for: approval

  - id: open
    kind: effect
    do: open-pr
```

The `verify` step has no command of its own. It runs `verify.test` from the base commit's `.daggry/profile.yaml`, which is a protected path:

```yaml
verify:
  test: cargo test --workspace
```

To write your own, follow [Write a workflow](/guide/how-to/write-a-workflow). For every field, see the [workflow schema](/reference/workflow-schema).

## Bounded loops

A loop is a `steps` entry with `loop` in place of `kind`. It walks the criteria of a sealed plan, and `max` bounds it.

```yaml
  - id: red-green
    loop:
      over: plan
      as: criterion
      until: verdict.all_covered == true
      max: 8
      on_exhausted: ask
      steps:
        - id: test
          kind: agent
          engine: <engine>
          prompt: Write a failing test for the current criterion.
          outputs: [change]
          tests: ["tests/**"]
          scope: ["tests/**"]
        - id: implement
          kind: agent
          engine: <engine>
          prompt: Make the test pass without touching it.
          outputs: [change]
          scope: ["src/**"]
        - id: check
          kind: verify

  - id: ask
    kind: human
    waiting_for: input-needed
```

Daggry evaluates `until` at the end of every iteration. `max` bounds the iterations of the whole loop, across all items, so set it above the number of items to leave room for repeats. When the loop runs out, `on_exhausted` either fails the run (`fail`) or routes to the `human` step it names. That step runs only on exhaustion.

### Red, then green

Delivery uses a loop with a test step. A loop that does not write tests, such as a batch migration, leaves the test step out and keeps the rest. Each delivery iteration follows this order.

1. An agent writes a test for the next criterion.
2. The runner proves the test **red** against the base commit. A test that already passes says nothing about the change.
3. The control plane seals the test commit and freezes the tests. The implementer cannot change them.
4. The implementer makes the test green.
5. A fresh worktree measures the result.

A criterion counts as covered only when a test that carries its id passed on head. A red iteration repeats the same criterion without rewriting the test. For how frozen tests and unfreeze grants work, see [Protected paths](/guide/concepts/protection).

## Waiting for a person

A `human` step is the one place a pod is released. The run waits, `daggry status` shows why, and the job continues in the pod of its next attempt.

| `waiting_for` | Why the run waits |
|---|---|
| `approval` | A plan needs a yes. |
| `input-needed` | A person must look at the latest change or answer a question. |

`daggry approve <run-id>` completes the wait and seals an `approval` bound to the digest of the artifact the step waits on. At an exhausted loop's `human` step, plain `approve` gives the item up and `approve --unfreeze <path>` retries it.

## Retro is a workflow too

A retro is an ordinary workflow, started by a finished run or by a schedule. Its findings must cite transcript lines or verdict ids that code confirms. It opens issues and pull requests for the project harness, and it never merges. It is the second workflow Daggry ships, after delivery.

## Next steps

- To turn a kind of work into a graph, read [Design a workflow](/guide/how-to/design-a-workflow).
- To start from a working example, read [Workflow patterns](/guide/how-to/workflow-patterns).
- To write the file, read [Write a workflow](/guide/how-to/write-a-workflow).
- To see how the checks hold, read [Sealed evidence](/guide/concepts/evidence).
- To see where each step runs, read [Architecture](/guide/concepts/architecture).
- For what is built today, see the [Roadmap](/roadmap).
