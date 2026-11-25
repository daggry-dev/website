# Write a workflow

An agent follows the workflow file and cannot change it, so the file is where you decide what gets checked. Start with one step and add a verification, an approval and a loop.

This page is for anyone who starts runs with `daggry run`. The snippets are illustrative. Each one is valid against the [workflow schema](/reference/workflow-schema).

<WorkflowGraph />

The diagram shows the delivery workflow that the section [Add a bounded loop](#add-a-bounded-loop) builds: a plan, your approval, a bounded loop of proof, work and verification, and an effect that hands the result over. In the software binding, the proof is a test and the effect opens a pull request. Other kinds of work use the same parts in a different order. See [Bindings](/reference/bindings).

A workflow is one YAML file with a `format` header and one body key, `steps`: an ordered list of steps and loops. A workflow is a document in the tenant's catalogue, and the tenant decides which projects it runs on. `daggry run --workflow <file>` supplies one as a file from your machine. See [The tenant defines the factory](/guide/concepts/tenant). Workflows use strict-subset YAML, with no anchors, tags or merge keys. For the ideas behind it, see [Work graphs](/guide/concepts/workflows). To decide what the workflow should contain before you write it, see [Design a workflow](/guide/how-to/design-a-workflow). To start from a complete file for a kind of work, see [Workflow patterns](/guide/how-to/workflow-patterns).

## The five step kinds

The standard defines five kinds: `agent`, `command`, `verify`, `human` and `effect`. A tenant can register more, each named `<namespace>/<name>`. See [Step kind registry](/reference/workflow-schema#step-kind-registry). A step does one thing, and you combine steps to describe the work. Nothing in the kinds is specific to one kind of work: an `agent` step can draft a report or a triage note, a `command` step can run any script, and a `verify` step can run any validator. For where each kind runs and what it does, see [Steps](/reference/workflow-schema#steps).

## Write a one-step workflow

1. Create a file named `flow.yaml` with one `command` step.

   ```yaml
   format: daggry/workflow@1
   steps:
     - id: prepare
       kind: command
       scope: anywhere
       run: sh scripts/prepare.sh
   ```

   The first line is the header. Every workflow file has it, and it is always `format: daggry/workflow@1`. Each step needs an `id` that is unique in the file. A `command` step needs `run`, the shell line, and `scope`, the paths it may write.

2. Choose a `scope`: `nothing`, `anywhere`, or a list of globs such as `["drafts/**"]` and area references such as `area:app`, which name an area of the project config. For what each value allows, see [Scope](/reference/workflow-schema#scope).

   No scope can include a [protected path](/guide/concepts/protection).

## Add an agent step

An `agent` step runs a session of a coding agent. It must deliver the artifact kinds you list in `outputs`.

1. Add the step before the command.

   ```yaml
   format: daggry/workflow@1
   steps:
     - id: plan
       kind: agent
       engine: <engine>
       prompt: Read the work item and write a plan with checkable criteria.
       outputs: [plan]
       scope: nothing
     - id: prepare
       kind: command
       scope: anywhere
       run: sh scripts/prepare.sh
   ```

   `<engine>` is the coding-agent engine the step uses, by a name the tenant config registers in `agents.engines`. The control plane writes the `prompt` to a read-only instruction file for the engine. The step succeeds when every kind in `outputs` is accepted.

2. Limit the scope to what the step needs. This step only reads, so its scope is `nothing`.

## Add a verify step

A `verify` step judges the last sealed change. It has no command of its own. It names one or more validators in `validators`, and the platform runs them. A validator is a check written as code: it takes sealed inputs and yields a result and a verdict. See [Validators: the extension point](/guide/concepts/validators).

A validator name says where the validator comes from. The table lists the five forms.

| Name | The validator |
|---|---|
| `project` | The project's verification: the validator that `verification.canonical` names in `.daggry/project.yaml`, with the supporting validators and thresholds that file lists. |
| `project/<name>` | A script validator that the project config declares. |
| `tenant/<name>` | A script validator that the tenant config declares. |
| `daggry/<name>` | A built-in validator, shipped with the platform. |
| `<namespace>/<name>` | A native validator that the tenant admits. |

A native validator is written in any language. The cluster admin installs it, the tenant admits it by name, version and digest, and a `verify` step names it like any other, for example `acme/contract-clauses`. For every built-in validator, see the [Validators reference](/reference/validators).

A script validator is any deterministic procedure that inspects the workspace and reports a result. It can check a program, a document, a dataset, a configuration or a design file. It runs on a clean copy of the workspace, and a run takes a project's validators from the baseline, the version of the workspace the run started from, so a step cannot weaken what judges it.

1. Add the step after the work it checks.

   ```yaml
   format: daggry/workflow@1
   steps:
     - id: prepare
       kind: command
       scope: ["drafts/**"]
       run: sh scripts/prepare.sh
     - id: check
       kind: verify
       validators: [project, tenant/house-style]
   ```

   This step runs the project's verification and one script validator of the tenant's.

2. Declare the script validator behind `project`. The workspace holds `.daggry/project.yaml` before the run starts. This one declares one script validator, a script that writes a result document, and makes it canonical. For the file format, see [Project config](/reference/project-config).

   ```yaml
   format: daggry/project@1
   validators:
     review:
       run: [sh, check.sh]
       kind: custom
       result:
         contract: document
         path: reports/review.json
   verification:
     canonical: review
   ```

   `result.contract` is the result contract: how the factory reads what the script decided. It is `exit-code`, `document` or the name of an adapter, `<namespace>/<adapter>`. The `document` contract says the script writes a result document at `path`: an outcome and a list of findings, each with an id and an outcome. Without `result`, the contract is `exit-code` and the exit code alone is the result. An adapter reads a format that belongs to one toolset. See [Result contracts](/reference/project-config#result-contracts) and [Bindings](/reference/bindings).

3. Check with the person who runs the tenant that the project's validators count as evidence. The tenant decides this for each workspace in `projects[].validators.admit`, and by default they do not. `tenant/house-style` is declared in the tenant config, under `validators.scripts`. See [The tenant defines the factory](/guide/concepts/tenant).

A `verify` step is green when every validator it names passes. Outside a loop, a failed `verify` step fails the run.

## Add a human approval

A `human` step releases the pod and waits. The run reads `waiting` until someone runs `daggry approve`.

1. Add the step where a person must decide.

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
     - id: prepare
       kind: command
       scope: anywhere
       run: sh scripts/prepare.sh
   ```

2. Choose `waiting_for`. The value decides what the approval binds to.

   | Value | The approval binds to |
   |---|---|
   | `approval` | the sealed `plan` |
   | `input-needed` | the latest sealed `change` |

   If no such record is sealed, `daggry approve` is refused. Put the `human` step after the step that seals what the person reviews.

3. To continue the run, run `daggry approve <run-id>`. The job continues in a new attempt.

## Add a bounded loop

A loop repeats steps for each criterion of an approved plan, and it always ends. The example in this section is the software binding's delivery loop: write a failing test, make it pass, verify. A loop for other work has the same keys and other steps. See [Workflow patterns](/guide/how-to/workflow-patterns).

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
             validators: [project, daggry/criterion-coverage]
     - id: ask
       kind: human
       waiting_for: input-needed
     - id: pr
       kind: effect
       do: open-pr
   ```

   The `max` of 10 assumes a plan of fewer than 10 criteria. `open-pr` is the software binding's effect, and an `effect` step can name any effect the tenant registers. The `verify` step names `daggry/criterion-coverage`, the built-in validator that derives the fact `all_covered` the gate reads.

2. Read the loop keys. Every key is required.

   | Key | Meaning |
   |---|---|
   | `over` | The list to loop over. Use `plan`, the criteria of the sealed plan. |
   | `as` | The name of the current item. |
   | `until` | A gate expression read at the end of each iteration. The loop ends when it holds. |
   | `max` | The bound on iterations, as an integer of 1 or more. It counts the whole loop, not each item, so set it greater than the number of items in the plan, or the loop cannot finish. |
   | `on_exhausted` | `fail`, or the `id` of a top-level `human` step. |
   | `steps` | The steps of one iteration. |

3. Know how an iteration ends. The `verify` step decides the colour.
   - Green: every step passed. The loop moves to the next criterion.
   - Red: the `verify` step failed. The same criterion repeats, and the proof step does not run again.
   - Any other failed step inside a loop fails the run.

4. Know what `freeze` does. An `agent` step with `freeze` is the proof step of the loop: it writes what proves the criterion. The paths it changes, matched by the `freeze` globs, are sealed with their digests and become frozen paths. No later step can change a frozen path, whatever its scope.

5. Plan for exhaustion. When `max` iterations are spent, `on_exhausted` applies. With `fail`, the run fails. With a `human` step, the run waits there. Run `daggry approve <run-id>` to give up the unfinished item, or `daggry approve <run-id> --unfreeze <path>` to retry it with one frozen path open to change.

The `on_exhausted` step is skipped in normal flow and runs only when the loop is exhausted. For the `until` syntax, see [Gate expressions](/reference/gates).

### Red, then green

Red, then green is the software binding's name for the baseline proof: a criterion's check fails on the baseline, the version of the workspace the run started from, and passes after the work. A check that already passes says nothing about the work.

Each iteration of the loop follows this order. A loop with no proof step, such as a document review, starts at step 4.

1. The proof step writes a check for the next criterion. In the software binding, the check is a test.
2. Daggry runs the project's canonical validator on the baseline with the new check added. The built-in validator `daggry/baseline-proof` accepts the proof only when the check fails there.
3. The control plane seals the change and freezes the paths the proof step wrote. The agent cannot change them.
4. The agent does the work that makes the check pass.
5. The validators measure the result on a clean copy of the workspace.

A criterion counts as covered only when a passing finding carries its id in the canonical validator's result for the last sealed version. In the software binding, the finding is a test. For how frozen paths and unfreeze grants work, see [What an agent cannot change](/guide/concepts/protection#frozen-paths).

## Check that the workflow loads

The control plane loads the file when you start a run. A file that does not load is refused and no run starts.

1. Start the run.

   ```sh
   daggry run --workflow flow.yaml --workspace <workspace> --item <item>
   ```

   `<workspace>` is the workspace the run works on, named as the tenant config names it. `<item>` is the work item, in the form the workspace's binding gives. In the software binding, the workspace is a repository, `<owner>/<name>`, and the work item is the URL of an issue.

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
