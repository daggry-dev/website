# Add a loop

Work is rarely right the first time, and an agent that keeps trying with no limit can run all night.
A loop repeats its steps until the work is done, checks a gate after every iteration and stops at a limit you set.
Read this page when one pass is not enough: the agent should keep working on what still fails. It builds on [Write a workflow](/guide/how-to/write-a-workflow).

A loop seals nothing of its own. The steps of each iteration seal their change, measurements and verdicts, so the evidence trail shows every iteration, passed or failed. The example is software: write failing tests, make them pass, validate. The file is illustrative.

<WorkflowGraph />

The diagram shows the workflow this page builds: a plan, your approval, a loop that repeats until every proof passes, and an effect that delivers the result as a pull request.

## Add the loop

A loop needs two things: what "done" means, and how often to try.

1. Add a loop entry after the approval. A loop entry has an `id` and a `loop` key, and no `kind`.

   ```yaml
   format: daggry/workflow@1
   steps:
     - id: plan
       kind: agent
       persona: planner
       outputs: [plan]
       scope: nothing
     - id: approve-plan
       kind: human
       of: plan
     - id: build
       loop:
         until: verdict.all_covered
         max: 5
         steps:
           - id: proof
             kind: agent
             persona: test-writer
             outputs: [change]
             freeze: ["tests/**"]
             scope: ["tests/**"]
           - id: work
             kind: agent
             persona: implementer
             outputs: [change]
             scope: ["src/**", "tests/**"]
           - id: check
             kind: verify
             validators: [project]
             judges: [coverage]
     - id: pr
       kind: effect
       do: open-pr
   ```

2. Set the loop keys.

   | Key | Meaning |
   |---|---|
   | `until` | The gate: what "done" means. It reads facts from sealed verdicts and runs nothing. Here the loop is done when every criterion of the plan is covered. |
   | `max` | The loop limit: the most iterations the loop can run. |
   | `steps` | The steps of one iteration. |

3. Set `max` to the number of tries you are willing to pay for. Most work that will pass does so in a few iterations.

The `coverage` judge works out `verdict.all_covered` when the `verify` step names it in `judges`. A loop cannot contain another loop.

## How the loop runs

Each iteration works on everything that is still open, and each repeat has less to do.

<LoopRounds />

The diagram shows one loop over three iterations: the failing criteria shrink from two to one to none, and the gate reads the sealed verdict after each iteration.

- **The gate holds.** The loop ends, and the run goes on.
- **The gate does not hold.** The steps run again. The agent gets only the findings that still fail, with the tail of the validator's output. The proof step does not run again.
- **An `agent` or `command` step fails.** The run fails.

Each repeat spends one iteration of `max`, and its records stay in the trail beside the ones that passed.

## Prove the work first

A test that already passes says nothing about the work. So the loop starts with a proof step: tests that fail first, then pass. Software teams call this red, then green.

The `freeze` key marks the proof step. It runs once, in the first iteration.

1. The proof step writes a test for every criterion of the plan.
2. Daggry runs the project's main validator on the version of the workspace the run started from, with the new tests added. The proof counts only if a test for every criterion fails there.
3. Daggry seals the tests and freezes them. No later step can change a frozen path, whatever its scope.
4. The agent does the work that makes the tests pass.
5. The validators measure the result on a clean copy, and the judges decide. While a test still fails, the loop repeats from step 4.

A loop with no proof step, such as a document review, starts at step 4. For frozen paths, see [What an agent cannot change](/guide/concepts/protection).

::: details When should a loop take one criterion at a time?
Add `over: plan` and `as: criterion` to the loop, and each iteration takes one criterion: its own proof, its own work and its own `verify` run.

<BatchOrItems />

The diagram compares the two shapes. One criterion at a time costs more: an agent starts again for each criterion, re-reads the project, and every iteration runs the validators and seals its records. Use it when the criteria are large or independent, when the whole plan would not fit in one agent session, or when you want each criterion checked and sealed on its own. See [One item at a time](/reference/workflow-schema#one-item-at-a-time).
:::

## When the limit is reached

The limit is what stops an agent that is stuck. What happens next depends on the workflow.

- **A checkpoint follows the loop.** The run goes on to it, and Daggry asks you and says what is unfinished. Reply, and the loop goes round again with a fresh limit and what you said. Say yes, and the run goes on with the result as it is.
- **No checkpoint follows.** The run fails and says why.

If the agent believes a frozen test is wrong, it asks you on the issue, and your yes opens that one path once.

Related:

- [Loop reference](/reference/workflow-schema#loop)
- [Gate expressions](/reference/gates)
- [Workflow examples](/guide/how-to/workflow-patterns)
