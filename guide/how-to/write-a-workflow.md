# Write a workflow

An agent follows the workflow file and cannot change it, so the file is where you decide what gets checked. This page builds a workflow one step at a time: a command, an agent, a validation and an approval. Read it if you start runs with `daggry run`.

A workflow is one file of plain YAML: no anchors, tags or merge keys. Each step has one of five kinds: `agent`, `command`, `verify`, `human` or `effect`. For every key, see the [Workflow file reference](/reference/workflow-schema). The snippets on this page are illustrative.

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

   `<workspace>` is your project's workspace, named as the tenant config names it. `<item>` is the work item. For software, the workspace is a Git repository, `<owner>/<name>`, and the work item is the URL of an issue. On success, the command prints a run ID.

   ```text
   run-0123456789abcdef
   ```

::: details What if the run is refused?
Daggry reads the file when you start a run. If the file is not valid, no run starts. The command prints the reason and exits with 1.

```text
daggry: refused: 400: workflow: workflow schema: ... (at `/steps/0/kind`)
```

The text in backticks points at the value at fault. `/steps/0/kind` is the `kind` of the first step. For each reason, see the [Workflow file reference](/reference/workflow-schema).
:::

## Add an agent step

Add an agent step when the work needs writing or judgement. A script cannot draft a plan, and an agent can.

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
       run: [sh, scripts/prepare.sh]
   ```

   `<engine>` is the coding-agent engine the step uses, by the name your tenant registers. `prompt` is the agent's instruction. `outputs` lists what the step must hand to the next step. The step succeeds when Daggry accepts every output.

2. Limit the scope to what the step needs. This step only reads, so its scope is `nothing`.

## Add a verify step

Without a `verify` step, nothing checks what the agent did. A `verify` step has no command of its own. It names validators, and Daggry runs them on the last sealed change.

1. Add the step after the work it checks.

   ```yaml
   format: daggry/workflow@1
   steps:
     - id: prepare
       kind: command
       scope: ["drafts/**"]
       run: [sh, scripts/prepare.sh]
     - id: check
       kind: verify
       validators: [project, house-style]
   ```

   `project` runs the project's main validator. `house-style` is a validator that every project in your tenant shares, declared in the tenant config. A name that neither the project config nor the tenant config declares is refused when the run starts. A validator of your project is named the same way, and it wins when both use one name.

2. Make sure the project has a project config that names its main validator. See [Set up a project](/guide/how-to/set-up-a-project).

A `verify` step passes when every validator it names passes and every option it sets holds. Outside a loop, a failed `verify` step fails the run. To write a validator of your own, see [Add a validator](/guide/how-to/add-a-validator).

## Add an approval

Add an approval where a wrong guess would waste the night. A `human` step stops the run until someone runs `daggry approve`.

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
       run: [sh, scripts/prepare.sh]
   ```

2. Choose `waiting_for`. The value decides what you approve.

   | Value | You approve |
   |---|---|
   | `approval` | the sealed plan |
   | `input-needed` | the latest sealed change |

   Put the `human` step after the step that produces what the person reviews. If nothing is sealed yet, `daggry approve` is refused.

3. To continue the run, run `daggry approve <run-id>`.

Related:

- [Add a loop](/guide/how-to/add-a-loop)
- [Design a workflow](/guide/how-to/design-a-workflow)
- [Workflow examples](/guide/how-to/workflow-patterns)
