# Add a loop

An agent that repeats work can run all night. A loop repeats steps once for each criterion, checks a gate after every iteration and stops at a limit you set. Read this page when the same steps repeat for each criterion of an approved plan. It builds on [Write a workflow](/guide/how-to/write-a-workflow).

The example is a software one: write a failing test, make it pass, validate. A loop for other work has the same keys and other steps. The file is illustrative.

<WorkflowGraph />

The diagram shows the workflow this page builds: a plan, your approval, a loop of proof, work and validation for each criterion, and an effect, the step that delivers the result (here, it opens a pull request).

## Add the loop

Use a loop when the same steps repeat for each criterion. A criterion is one entry of the approved plan.

1. Add a loop entry after the approval. A loop entry has an `id` and a `loop` key, and no `kind`.

   ```yaml
   format: daggry/workflow@1
   steps:
     - id: plan
       kind: agent
       engine: <engine>
       prompt: Write a plan with checkable criteria.
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
         max: 10
         on_exhausted: ask
         steps:
           - id: proof
             kind: agent
             engine: <engine>
             prompt: Write a failing test for the criterion.
             outputs: [change]
             freeze: ["tests/**"]
             scope: ["tests/**"]
           - id: work
             kind: agent
             engine: <engine>
             prompt: Make the test pass.
             outputs: [change]
             scope: ["src/**", "tests/**"]
           - id: check
             kind: verify
             validators: [project]
             judges: [coverage]
     - id: ask
       kind: human
       waiting_for: input-needed
     - id: pr
       kind: effect
       do: open-pr
   ```

2. Set the loop keys. Every key is required.

   | Key | Meaning |
   |---|---|
   | `over` | The list to loop over. Use `plan`, the criteria of the approved plan. |
   | `as` | The name of the current criterion. |
   | `until` | The gate: an expression that reads verdict facts and decides whether the loop ends. It runs nothing. Daggry reads it at the end of each iteration. |
   | `max` | The loop limit: the most iterations the loop can run. It counts the whole loop, not each criterion. |
   | `on_exhausted` | What happens at the limit: `fail`, or the `id` of a top-level `human` step. |
   | `steps` | The steps of one iteration. |

3. Set `max` greater than the number of criteria you expect, or the loop cannot finish. The `max` of 10 here assumes a plan of fewer than 10 items.

The gate `verdict.all_covered` holds when every criterion has passed. The `coverage` judge works that out when the `verify` step names it in `judges`. A loop cannot contain another loop.

## How an iteration ends

You need this to read a run's status. An iteration either moves on or repeats, and the `verify` step decides which.

<LoopGate />

The diagram shows one iteration, the gate after it and the exit at the loop limit. When the limit is reached, the run fails or a person decides.

- **The `verify` step passes.** The loop moves to the next criterion.
- **The `verify` step fails.** The same criterion repeats, and the agent gets the failing findings and the tail of the validator's output. The proof step does not run again.
- **Any other step fails.** The run fails.

Each repeat spends one iteration of `max`.

## Prove each criterion first

A test that already passes says nothing about the work. So the first step of the iteration writes a proof: a test that fails first, then passes. Software teams call this red, then green.

The `freeze` key marks the proof step. Each iteration then runs in this order.

1. The proof step writes a test for the next criterion.
2. Daggry runs the project's main validator on the version of the workspace the run started from, with the new test added. The proof counts only if the test fails there.
3. Daggry seals the change and freezes the paths the proof step wrote, matched by the `freeze` globs. No later step can change a frozen path, whatever its scope.
4. The agent does the work that makes the test pass.
5. The validators measure the result on a clean copy of the workspace, and the judges decide the verdict.

A loop with no proof step, such as a document review, starts at step 4. For frozen paths, see [What an agent cannot change](/guide/concepts/protection).

## When the limit is reached

Decide this before the run, because it is what stops an agent that is stuck. `on_exhausted` says what happens after `max` iterations.

- With `fail`, the run fails.
- With the `id` of a `human` step, the run stops there for your approval. Daggry skips that step unless the loop reaches its limit.

At that approval you have two choices.

1. To give up the unfinished criterion and continue, run `daggry approve <run-id>`.
2. To retry it with one frozen path open to change, run `daggry approve <run-id> --unfreeze <path>`.

Related:

- [Gate expressions](/reference/gates)
- [Add a validator](/guide/how-to/add-a-validator)
- [Workflow examples](/guide/how-to/workflow-patterns)
