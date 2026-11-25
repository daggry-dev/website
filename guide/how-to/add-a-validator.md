# Add a validator

An agent can say the work is done. A validator is a script of yours that Daggry runs to check it, so a run passes only when your rule holds. Read this page if you write workflows or own a project.

The examples on this page are illustrative.

## A verify step names its validators

Start here to see where a validator is used. A workflow's `verify` step lists the validators that check the work.

```yaml
- id: check
  kind: verify
  validators: [project, project/summaries, tenant/house-style]
```

This step runs three validators. `project` is the project's main validator. `project/summaries` is one more script from the project. `tenant/house-style` is a script the tenant admin declares for every project. The step passes when every validator passes.

## Write a script validator

A validator can be any script that looks at the files and reports pass or fail. It can check a program, a document, a dataset or a configuration.

1. Write the script in the project. It starts in the root of the workspace and exits with 0 when the work passes.

   ```sh
   #!/bin/sh
   # scripts/check-summaries.sh: every page has a summary line.
   for page in handbook/*.md; do
     grep -q '^Summary: ' "$page" || exit 1
   done
   ```

2. Declare it in the project config, `.daggry/project.yaml`, under `validators`.

   ```yaml
   validators:
     summaries:
       run: scripts/check-summaries.sh
       kind: custom
   ```

3. Ask the tenant admin to accept it. A project's validator counts only when the tenant config lists it for your project. See [Set up a tenant](/guide/how-to/set-up-a-tenant).

4. Name it in a `verify` step as `project/summaries`.

To make it the project's main validator, see [Set up a project](/guide/how-to/set-up-a-project).

## Daggry decides pass or fail

You need this to trust a result: the script reports, and Daggry, not the script, decides pass or fail.

- Daggry runs the script on a clean copy of the workspace, after the agent has finished.
- A run takes the project's validators from the version of the workspace it started from. Their files are protected paths. So an agent cannot pass by weakening its validator.
- Daggry seals the result as a record in the evidence trail.

See [Why you can trust a run](/guide/concepts/trust).

::: details How does a script report more than pass or fail?
By default Daggry reads the exit code alone. A script can also write a result file: an outcome and a list of findings, each with an id and its own outcome. Set the result format with `result.contract`.

```yaml
validators:
  summaries:
    run: scripts/check-summaries.sh
    kind: custom
    result:
      contract: document
      path: reports/summaries.json
```

A loop needs the result file from the main validator. A plan item passes only when a passing finding carries its id. For the result file's fields, see the [Validators reference](/reference/validators).
:::

::: details What other validators are there?
- **Built-in validators** ship with Daggry and are named `daggry/<name>`. A loop uses one of them, `daggry/criterion-coverage`.
- **Tenant validators** are scripts the tenant admin declares for every project, named `tenant/<name>`.
- **Native validators** read only sealed records, never the workspace. The cluster admin installs one, and the tenant admin approves the exact version. A workflow names it `<namespace>/<name>`.

For each kind and the full rules, see the [Validators reference](/reference/validators).
:::

Related:

- [Set up a project](/guide/how-to/set-up-a-project)
- [Write a workflow](/guide/how-to/write-a-workflow)
- [Validators reference](/reference/validators)
