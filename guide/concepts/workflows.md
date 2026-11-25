# Workflows

An agent left to choose its own process can skip a validator or loop all night. A workflow is a file of fixed steps that the agent must follow and cannot change. Read this page if you write or review workflows and want to know every path a run can take.

The example on this page is illustrative.

## Five words to read any workflow

You need five words to read any workflow. This file plans the work, waits for you, works through the plan and delivers the result.

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
  - id: work-through-plan
    loop:
      over: plan
      as: criterion
      until: verdict.all_covered
      max: 5
      on_exhausted: fail
      steps:
        - id: work
          kind: agent
          engine: <engine>
          prompt: Do the work for this criterion.
          outputs: [change]
          scope: ["docs/**"]
        - id: validate
          kind: verify
          validators: [project]
          judges: [coverage]
  - id: deliver
    kind: effect
    do: publish
```

`<engine>` stands for the engine the step uses. The list defines the five words.

- A **step** is one unit of work. It has a kind: `agent`, `command`, `verify`, `human` or `effect`.
- An **output** is what a step hands to the next step, such as `plan`. Daggry seals it, so a later step cannot rewrite it.
- A **loop** repeats steps once for each criterion, up to a loop limit.
- A **gate** is an expression in a loop's `until`. It reads verdict facts and decides whether the loop ends. It runs nothing and judges nothing. Here it is `until: verdict.all_covered`.
- An **approval** is a point where the run stops until you approve. Here it is the `human` step.

The last step is an `effect`: the step that delivers the result, for example by opening a pull request. To write a file like this one, follow [Write a workflow](/guide/how-to/write-a-workflow).

## Loops always end

A loop is where an agent can run all night, so every loop has a limit. After each iteration, Daggry reads the gate. If every verdict of the `verify` step passed, the loop moves to the next criterion. If it failed, the same criterion repeats. When the loop reaches its limit, the run fails or waits for you, whichever the file says.

<LoopGate />

The diagram shows one iteration of a loop, the gate after it and the exit when the loop limit is reached. In the iteration, an agent writes a proof for the next criterion, and code shows that the proof fails before the work. The agent then does the work, and code runs every validator.

A proof is a test the run writes that fails first, then passes. A test that already passes says nothing about the work. Once Daggry seals the proof, the agent cannot edit it. See [Add a loop](/guide/how-to/add-a-loop).

## You decide where a person is needed

Some decisions are yours, and an agent that guesses them can build the wrong plan to the end. An approval stops the run where you chose and shows why. Most workflows have two: approve the plan before work starts, and review the result before it is delivered.

<HumanWait />

The diagram shows an approval card moving from Waiting to Approved, with the reason shown while it waits. Daggry records your approval against the exact plan or change you saw, so a later edit cannot use it.

## The file fixes, the run decides

Read this table to know what a run can and cannot vary. The file fixes everything that makes a run predictable before the run starts.

| The file fixes | The run decides |
|---|---|
| The order of steps and loops | How many iterations a loop needs, one for each criterion |
| The limit on every loop, and whether the run fails or waits for you at the limit | Whether a loop stops early because its gate already holds |
| Where the run stops for an approval | Which paths each step changed |
| The paths each step can write | Whether those paths stayed in scope |

A gate reads only what code computed from sealed records, never what an agent said. For the syntax, see [Gate expressions](/reference/gates).

::: details What can a workflow not do?
An agent never adds, removes or reorders steps. Daggry keeps the file outside every workspace.

A workflow has no `if`. A run branches only at a gate, a loop or an approval. Steps run in order, and a loop cannot hold another loop. For every key and every file Daggry refuses, see the [Workflow file reference](/reference/workflow-schema).
:::

Related:

- [Design a workflow](/guide/how-to/design-a-workflow)
- [Workflow examples](/guide/how-to/workflow-patterns)
- [What an agent cannot change](/guide/concepts/protection)
