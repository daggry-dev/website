# Set up a project

Daggry cannot check work until it knows what "good" means for your project. The project config is one file, `.daggry/project.yaml`, that names the script that checks the project and the paths no agent can change. Read this page if you are the project owner. You do it once for each project.

The files on this page are illustrative.

## Write the project config

Start with the smallest file that works. It names one validator and makes it the main validator: the project's proof that the work is good.

```yaml
format: daggry/project@1
validators:
  review:
    run: [sh, check.sh]
    kind: custom
verification:
  canonical: review
```

1. Write the script, here `check.sh`, in the project. It looks at the files and exits with 0 when the work is good.
2. Create `.daggry/project.yaml` with the content shown. `validators` names each script, and `verification.canonical` picks the main validator.
3. Commit both files. A run reads the project config from the version of the workspace it starts from, so the file applies from the next run.

A workflow now runs your main validator with one word, `project`, in a `verify` step. To write the script and report more than pass or fail, see [Add a validator](/guide/how-to/add-a-validator).

## Ask the tenant admin to accept your validators

Your validators do not count until the tenant admin accepts them, so do this before the first run. By default a project's validators are not accepted, and Daggry refuses a run that names one.

1. Send the tenant admin the names under `validators`.
2. The tenant admin lists them for your project in the tenant config. See [Set up a tenant](/guide/how-to/set-up-a-tenant).

## Protect more paths

You need this when a file decides what "good" means, such as a style guide your validator reads. An agent that could edit it could pass by weakening the rule.

Daggry always protects `.daggry/**`, and it protects the files your validators run. Add your own paths under `protect.paths`.

```yaml
areas:
  style:
    paths: ["style/**"]
protect:
  paths:
    - "area:style"
    - "templates/**"
```

An area is a named set of paths. An entry is a glob, or `area:<name>` for every path in an area. No step can write a protected path, whatever its scope. See [What an agent cannot change](/guide/concepts/protection).

::: details What does a larger project config look like?
This project is a handbook. Its main validator reviews every page. A second validator checks citations and runs with it. The run fails if the reading grade is above 9.

```yaml
format: daggry/project@1

areas:
  handbook:
    paths: ["handbook/**"]
  style:
    paths: ["style/**"]

validators:
  review:
    run: [sh, scripts/review-handbook.sh]
    kind: style
    result:
      contract: document
      path: reports/review.json
    timeout: 300
  citations:
    run: scripts/check-citations.sh
    kind: citations
    result:
      contract: document

verification:
  canonical: review
  also: [citations]
  thresholds:
    - validator: review
      read: metrics.reading_grade
      max: 9

protect:
  paths:
    - "area:style"
```

For every key, see the [Project config reference](/reference/project-config).
:::

Related:

- [Add a validator](/guide/how-to/add-a-validator)
- [Set up a tenant](/guide/how-to/set-up-a-tenant)
- [Project config reference](/reference/project-config)
