# Add a validator

An agent can say the work is done. A validator is a command that Daggry runs to measure it, and a judge decides the verdict, so a run passes only when your rule holds. Read this page if you write workflows or own a project.

The examples on this page are illustrative.

## Add a validator in three steps

A validator is a command that you declare in `.daggry/project.yaml`. Daggry only uses what that file names. The command exits with 0 when the work passes. The declaration needs one key, `run`, and the rest has defaults.

1. Write the script `scripts/summaries.sh`. It starts in the root of the workspace.

   ```sh
   #!/bin/sh
   # scripts/summaries.sh: every page has a summary line.
   for page in handbook/*.md; do
     grep -q '^Summary: ' "$page" || exit 1
   done
   ```

2. Declare it in `.daggry/project.yaml`, and commit both files.

   ```yaml
   format: daggry/project@1
   validators:
     summaries:
       run: [sh, scripts/summaries.sh]
   ```

3. Name it in a `verify` step.

   ```yaml
   - id: check
     kind: verify
     validators: [project, summaries, house-style]
   ```

The step runs three validators and passes when all three pass. `project` is the project's main validator. `summaries` is the script you wrote. `house-style` is a validator that every project in your tenant shares, declared under `validators.scripts` in the tenant config. If a project and the tenant use the same name, the project's validator runs.

To set an option such as a timeout, add it to the declaration.

```yaml
validators:
  summaries:
    run: [sh, scripts/summaries.sh]
    timeout: 120
```

To make it the project's main validator, see [Set up a project](/guide/how-to/set-up-a-project).

## Your validator measures, a judge judges

You need this to trust a result. Your script reports, and a judge decides the verdict. Every `verify` step has a default judge, so a step needs nothing more. See [Judges](/reference/judges).

- Daggry runs the script on a clean copy of the workspace, after the agent has finished.
- A run takes your validators from the version it started from. The files a validator's `run` names are protected paths, so an agent cannot pass by weakening its validator.
- Your validators count as evidence with no setup.
- Daggry seals the measurement, then the verdict, in the evidence trail.

See [Why you can trust a run](/guide/concepts/trust).

::: details How does a script report more than pass or fail?
By default Daggry reads the exit code alone. A script can also write a result file: an outcome and a list of findings, each with an id and its own outcome. Set `output: document` in the declaration.

```yaml
validators:
  summaries:
    run: [sh, scripts/summaries.sh]
    output: document
    output_file: reports/summaries.json
```

`output` can also name the format of a tool you already run, such as `junit` or `sarif`. A loop needs the result file from the main validator. A criterion passes only when a passing finding carries its id. For the result file's fields, see the [Validators reference](/reference/validators).
:::

## Go further: judges

Most steps need only the default judge. To add a condition, name a judge in the step: `judges: [coverage]` requires that every criterion of the plan has a passing finding, and `no_regression` requires that no finding of the baseline is lost. You can also write a judge of your own. See [Judges](/reference/judges). To share a validator across projects, a tenant owner declares it in the tenant config. See the [Validators reference](/reference/validators).

Related:

- [Set up a project](/guide/how-to/set-up-a-project)
- [Write a workflow](/guide/how-to/write-a-workflow)
- [Validators reference](/reference/validators)
- [Judges reference](/reference/judges)
