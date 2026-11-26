# Write a workflow

An agent follows the workflow file and cannot change it, so the file is where you decide what code checks and where you decide.
This page takes you from six decisions on paper to a working file: a command, an agent step, a validation and an approval.
Read it if you start runs with `daggry run`, or before you describe a new kind of work.

A workflow is one YAML file. Each step has one of five kinds: `agent`, `command`, `verify`, `human` or `effect`. Every step that runs seals its result into the evidence trail, so the file also decides what the trail can show. For every key, see the [Workflow file reference](/reference/workflow-schema). The snippets on this page are illustrative.

## Decide before you write

A step nothing checks is a step you must review by hand. So make six decisions first, with one finished example of the work beside you.

1. **List what each step hands to the next.** Write each output as a sentence: "The request becomes a list of criteria." "Each criterion becomes a changed file." A list of criteria is a `plan`. A difference made to the workspace is a `change`.
2. **Split what code can check from what you approve.** A script can check that a file exists, a count matches or every link resolves. It cannot say whether prose reads well. What a script can decide becomes a validator. What only a person can decide becomes an approval.
3. **Pick a step kind for each piece of work.**
4. **Choose the gate and the loop limit,** if the work should repeat until it passes.
5. **Set what each step can write.**
6. **Place the approvals.** Every approval stops the run, so place few.

The table gives a rule of thumb for decisions 3 to 6.

| Decision | Rule of thumb |
|---|---|
| Step kind | `agent` for writing or judgement. `command` for a fixed script. `verify` to run validators. `human` for an approval. `effect` to deliver the result. |
| Who checks | Put the work in an `agent` step and the checking in a `verify` step. An agent never checks its own work. |
| Loop or not | Use a loop when the agent should keep working until the validators pass. For one pass, one `agent` step and one `verify` step are a complete workflow. See [Add a loop](/guide/how-to/add-a-loop). |
| Scope | Give each step the least it needs: `nothing` for a step that only reads, a list such as `["translations/**"]` for one that writes. |
| Approvals | Put a checkpoint, a `human` step, after the plan and before the result is delivered. Its `of` key names the step a reply sends the run back to. |

If an agent can do a piece of work but nothing can check it, keep the step small and put an approval after it.

## Write a one-step workflow

Start with one step so you can run the file at once.

1. Create a file named `flow.yaml` with one `command` step.

   ```yaml
   format: daggry/workflow@1
   steps:
     - id: prepare
       kind: command
       scope: anywhere
       run: [sh, scripts/prepare.sh]
   ```

   The first line is the same in every workflow file. Each step needs an `id` that is unique in the file. A `command` step needs `run`, the program and its arguments as a list, and `scope`, the paths it can write.

2. Choose a `scope`: `nothing`, `anywhere` or a list of globs such as `["drafts/**"]`. No scope can include a [protected path](/guide/concepts/protection).

3. Start a run.

   ```sh
   daggry run --workflow flow.yaml --workspace <workspace> --item <item>
   ```

   `<workspace>` is your project's workspace, named as the tenant config names it. `<item>` is the work item, which gives the run its objective: what it is asked to do. To give the objective as text, use `--objective "<text>"`. For software, the workspace is a git repository, `<owner>/<name>`, and the work item is the URL of an issue. On success, the command prints a run ID.

   ```text
   run-0123456789abcdef
   ```

When the step ends, Daggry seals a `change`: the version of the workspace the step produced and the paths it changed.

::: details What if the run is refused?
Daggry reads the file when you start a run. If the file is not valid, no run starts. The command prints the reason and exits with 1.

```text
daggry: refused: 400: workflow: workflow schema: ... (at `/steps/0/kind`)
```

The text in backticks points at the value at fault. `/steps/0/kind` is the `kind` of the first step. For each reason, see [Load errors](/reference/workflow-rules#load-errors).
:::

## Add an agent step and a verify step

Add an agent step when the work needs writing or judgement, and a `verify` step so that code checks what the agent did.

1. Add an `agent` step. It names a persona, not a prompt.

   ```yaml
   format: daggry/workflow@1
   steps:
     - id: plan
       kind: agent
       persona: planner
       outputs: [plan]
       scope: nothing
     - id: prepare
       kind: command
       scope: ["drafts/**"]
       run: [sh, scripts/prepare.sh]
     - id: check
       kind: verify
       validators: [project, house-style]
   ```

   A persona is a named agent that your tenant config or your project config defines: its engine and its instructions. The persona's instructions say how it always works: here, `planner` reads the objective and writes a plan with checkable criteria. What to plan comes from the objective of the run, so the workflow holds no task of its own. The workflow holds no instructions, so the same file works with any team's personas. To define one, see [Set up a tenant](/guide/how-to/set-up-a-tenant#make-the-team-yours).

   `outputs` lists what the step must hand to the next step. The step succeeds when Daggry accepts every output. This step only reads, so its scope is `nothing`.

2. Name the validators in the `verify` step. The step has no command of its own. `project` runs the project's main validator. `house-style` is a validator that every project in your tenant shares. A name that neither the project config nor the tenant config declares is refused when the run starts.

3. Make sure the project has a project config that names its main validator. See [Set up a project](/guide/how-to/set-up-a-project).

The table lists what these steps seal.

| Step | Sealed into the evidence trail |
|---|---|
| `plan` | The plan, and the name of the persona with the digest of its instructions, so the trail shows who wrote it and under which instructions. |
| `check` | One measurement for each validator, then one verdict for each judge. |

A `verify` step passes when every verdict passes. Outside a loop, a failed `verify` step fails the run. To write a validator of your own, see [Add a validator](/guide/how-to/add-a-validator).

## Add an approval

Add an approval where a wrong guess would waste the night. A `human` step stops the run until someone runs `daggry approve`.

1. Add the step where a person must decide.

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
     - id: prepare
       kind: command
       scope: anywhere
       run: [sh, scripts/prepare.sh]
   ```

2. Set `of` to the step the approval is about. A yes continues the run. Any other reply sends the run back to that step with what you said, and Daggry asks again.

3. To continue the run, run `daggry approve <run-id>`.

Daggry seals your approval with the digest of the plan or the change you approved, so nobody can move it to a different one.

To deliver the result, end the file with an `effect` step, such as `do: open-pr` for software. Daggry seals the delivery too. For complete files, see [Workflow examples](/guide/how-to/workflow-patterns).

Related:

- [Add a loop](/guide/how-to/add-a-loop)
- [Workflow examples](/guide/how-to/workflow-patterns)
- [Workflow file reference](/reference/workflow-schema)
