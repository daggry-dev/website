# Write a workflow

An agent follows the workflow file and cannot change it, so the file is where you decide what gets checked. Start with one step and add a check, an approval and a loop.

This page is for anyone who starts runs with `daggry run`. The snippets are illustrative. Each one is valid against the [workflow schema](/reference/workflow-schema).

<WorkflowGraph />

The diagram shows the delivery workflow that the section [Add a bounded loop](#add-a-bounded-loop) builds: a plan, your approval, a bounded loop of test, fix and check, and a pull request. Other kinds of work use the same parts in a different order.

A workflow is one YAML file with a `format` header and one body key, `steps`: an ordered list of steps and loops. A workflow is a document in the tenant's catalogue, and the tenant decides which repositories it runs on. `daggry run --workflow <file>` supplies one as a file from your machine. See [The tenant defines the factory](/guide/concepts/tenant). Workflows use strict-subset YAML, with no anchors, tags or merge keys. For the ideas behind it, see [Work graphs](/guide/concepts/workflows). To decide what the workflow should contain before you write it, see [Design a workflow](/guide/how-to/design-a-workflow). To start from a complete file for a kind of work, see [Workflow patterns](/guide/how-to/workflow-patterns).

## Step kinds at a glance

The standard defines five kinds: `agent`, `command`, `verify`, `human` and `effect`. A tenant can register more, each named `<namespace>/<name>`; see [Step kind registry](/reference/workflow-schema#step-kind-registry). A step does one thing, and you combine steps to describe the work. Nothing in the kinds is specific to code: an `agent` step can draft a report or a triage note, and a `command` step can run any script. For where each kind runs and what it does, see [Steps](/reference/workflow-schema#steps).

## Write a one-step workflow

1. Create a file named `flow.yaml` with one `command` step.

   ```yaml
   format: daggry/workflow@1
   steps:
     - id: build
       kind: command
       scope: anywhere
       run: make
   ```

   The first line is the header. Every workflow file has it, and it is always `format: daggry/workflow@1`. Each step needs an `id` that is unique in the file. A `command` step needs `run`, the shell line, and `scope`, the paths it may write.

2. Choose a `scope`: `nothing`, `anywhere`, or a list of globs such as `["src/**"]` and area references such as `area:app`, which name an area of the project config. For what each value allows, see [Scope](/reference/workflow-schema#scope).

   No scope can include a [protected path](/guide/concepts/protection).

## Add an agent step

An `agent` step runs a coding-agent session. It must deliver the artifact kinds you list in `outputs`.

1. Add the step before the command.

   ```yaml
   format: daggry/workflow@1
   steps:
     - id: plan
       kind: agent
       engine: <engine>
       prompt: Read the issue and write a plan with testable criteria.
       outputs: [plan]
       scope: nothing
     - id: build
       kind: command
       scope: anywhere
       run: make
   ```

   `<engine>` is the coding-agent engine the step uses, by a name the tenant config registers. The control plane writes the `prompt` to a read-only instruction file for the engine. The step succeeds when every kind in `outputs` is accepted.

2. Limit the scope to what the step needs. This step only reads, so its scope is `nothing`.

## Add a verify step

A `verify` step measures the last sealed commit in a clean copy of the code. It has no command of its own. It runs the project's canonical check, which is the check that `verification.canonical` names in the base commit's `.daggry/project.yaml`, so a step cannot weaken its own check. The check does not have to run tests: any deterministic program the project can run can be a check.

1. Add the step after the work it checks.

   ```yaml
   format: daggry/workflow@1
   steps:
     - id: build
       kind: command
       scope: ["src/**"]
       run: make
     - id: check
       kind: verify
   ```

2. Make sure the repository's base commit holds `.daggry/project.yaml` with a canonical check. This one names one check, a script that prints one result line for each test, and makes it canonical. For the file format, see [Project config](/reference/project-config).

   ```yaml
   format: daggry/project@1
   checks:
     test:
       run: [sh, check.sh]
       kind: tests
       result:
         contract: libtest-lines
   verification:
     canonical: test
   ```

A `verify` step is green when the canonical check passes, every check in `verification.also` passes and every threshold holds. Outside a loop, a failed `verify` step fails the run.

## Add a human approval

A `human` step releases the pod and waits. The run reads `waiting` until someone runs `daggry approve`.

1. Add the step where a person must decide.

   ```yaml
   format: daggry/workflow@1
   steps:
     - id: plan
       kind: agent
       engine: <engine>
       prompt: Write a plan with testable criteria.
       outputs: [plan]
       scope: nothing
     - id: approve-plan
       kind: human
       waiting_for: approval
     - id: build
       kind: command
       scope: anywhere
       run: make
   ```

2. Choose `waiting_for`. The value decides what the approval binds to.

   | Value | The approval binds to |
   |---|---|
   | `approval` | the sealed `plan` |
   | `input-needed` | the latest sealed `change` |

   If no such record is sealed, `daggry approve` is refused. Put the `human` step after the step that seals what the person reviews.

3. To continue the run, run `daggry approve <run-id>`. The job continues in a new attempt.

## Add a bounded loop

A loop repeats steps for each criterion of an approved plan, and it always ends. Use it for the test-first pattern: write a failing test, make it pass, verify.

1. Add a loop entry after the approval. A loop entry has an `id` and a `loop` key, and no `kind`.

   ```yaml
   format: daggry/workflow@1
   steps:
     - id: plan
       kind: agent
       engine: <engine>
       prompt: Write a plan with testable criteria.
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
           - id: tests
             kind: agent
             engine: <engine>
             prompt: Write a failing test for the criterion.
             outputs: [change]
             tests: ["tests/**"]
             scope: ["tests/**"]
           - id: impl
             kind: agent
             engine: <engine>
             prompt: Make the test pass.
             outputs: [change]
             scope: ["src/**", "tests/**"]
           - id: check
             kind: verify
     - id: ask
       kind: human
       waiting_for: input-needed
     - id: pr
       kind: effect
       do: open-pr
   ```

   The `max` of 10 assumes a plan of fewer than 10 criteria.

2. Read the loop keys. Every key is required.

   | Key | Meaning |
   |---|---|
   | `over` | The list to loop over. Use `plan`, the criteria of the sealed plan. |
   | `as` | The name of the current item. |
   | `until` | A gate expression read at the end of each iteration. The loop ends when it holds. |
   | `max` | The bound on iterations, as an integer of 1 or more. It counts the whole loop, not each item, so set it above the number of items in the plan, or the loop cannot finish. |
   | `on_exhausted` | `fail`, or the `id` of a top-level `human` step. |
   | `steps` | The steps of one iteration. |

3. Know how an iteration ends. The `verify` step decides the colour.
   - Green: every step passed. The loop moves to the next criterion.
   - Red: the `verify` step failed. The same criterion repeats, and the `tests` step does not run again.
   - Any other failed step inside a loop fails the run.

4. Know what `tests` does. The paths a `tests` step changes, matched by its globs, are sealed with their digests and frozen. No later step can change them, whatever its scope.

5. Plan for exhaustion. When `max` iterations are spent, `on_exhausted` applies. With `fail`, the run fails. With a `human` step, the run waits there. Run `daggry approve <run-id>` to give up the unfinished item, or `daggry approve <run-id> --unfreeze <path>` to retry it with one frozen test path open to change.

The `on_exhausted` step is skipped in normal flow and runs only when the loop is exhausted. For the `until` syntax, see [Gate expressions](/reference/gates).

### Red, then green

In a delivery loop, each iteration follows this order. A loop that does not write tests, such as a batch migration, leaves the `tests` step out and keeps the rest.

1. An agent writes a test for the next criterion.
2. Daggry shows that the test fails on the commit the run started from. A test that already passes says nothing about the change.
3. The control plane seals the test commit and freezes the tests. The agent cannot change them.
4. The agent makes the test green.
5. A clean copy of the code measures the result.

A criterion counts as covered only when a test that carries its id passed on the head commit. For how frozen tests and unfreeze grants work, see [What an agent cannot change](/guide/concepts/protection).

## Check that the workflow loads

The control plane loads the file when you start a run. A file that does not load is refused and no run starts.

1. Start the run.

   ```sh
   daggry run --workflow flow.yaml --repo <owner>/<name> --item https://github.com/<owner>/<name>/issues/<n>
   ```

2. On success, the command prints a run ID.

   ```text
   run-0123456789abcdef
   ```

3. On failure, the command prints the loader's reason and exits with 1.

   ```text
   daggry: refused: 400: workflow: workflow schema: ... (at `/steps/0/kind`)
   ```

   The text in backticks is a JSON pointer to the value at fault. `/steps/0/kind` is the `kind` of the first step.

The loader checks the file in stages and reports the first refusal.

| Refusal | Cause |
|---|---|
| not YAML, or a duplicate key | The text does not parse. |
| anchor, alias, tag or merge key | The file uses YAML features the strict subset refuses. |
| `workflow schema` | A key is missing, unknown or of the wrong type. |
| `until` expression | The loop's `until` is not a valid gate expression. |
| step id used twice | Two steps or loops share an `id`. |
| `on_exhausted` target | The name is not a top-level `human` step. |
| gate field | An `until` reads a field it cannot read. |

Loops cannot nest.

## Read the state of a run

A run is one execution of a workflow for a work item. A job is a group of steps that share one pod, and a run is one job by default. An attempt is one try at a job: a killed pod is replaced by a new attempt. A run is in one of seven states, listed in [States and reasons](/reference/api#states-and-reasons). While it is `waiting`, `daggry status` shows why.

## Next steps

- To plan a workflow for your own kind of work, read [Design a workflow](/guide/how-to/design-a-workflow).
- To copy a working workflow, read [Workflow patterns](/guide/how-to/workflow-patterns).
- To see a run's record, read [Verify a run](/guide/how-to/verify-a-run).
- For every field of every step, read the [workflow schema](/reference/workflow-schema).
