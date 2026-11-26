# Set up a project

Daggry checks work against the rule you give it.
The project config is one file, `.daggry/project.yaml`, that names the script that checks the project and the paths no agent can change.
Read this page if you own a project. You do it once.

Daggry only uses what `.daggry/project.yaml` names: it never looks for scripts or files by folder or file name. A run reads the file from the version of the workspace it started from and seals what your validators report, so the evidence trail shows which rule each result was measured against.

The files on this page are illustrative.

## Write the project config

Start with the smallest file that works. It makes one validator the main validator, the one a `verify` step that names `project` runs first. The default judge decides from the result.

```yaml
format: daggry/project@1
validators:
  review:
    run: [sh, scripts/review.sh]
verification:
  canonical: review
```

<FileTree kind="project" />

1. Write the script `scripts/review.sh`. It exits with 0 when the work is good.
2. Create `.daggry/project.yaml` with the content shown. `validators.review` names the script, and `verification.canonical` picks it as the main validator.
3. Commit both files. The next run uses them.

A `verify` step now runs your main validator with the word `project`, and Daggry seals what it reports as a measurement. To report more than pass or fail, see [Add a validator](/guide/how-to/add-a-validator).

## Protect more paths

Protect a file that decides what "good" means, such as a style guide your validator reads. An agent that could edit it could pass by weakening the rule.

Daggry always protects `.daggry/**`, and it protects the files that the `run` of each of your validators names, such as `scripts/review.sh`. Add your own paths under `protect.paths`.

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
    role: style
    output: document
    output_file: reports/review.json
    timeout: 300
  citations:
    run: [sh, scripts/check-citations.sh]
    role: citations
    output: document

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

::: details Can a project have its own personas?
Yes. Under `personas`, a project adds a persona or replaces one of the tenant's with the same name. Its instruction file is read from the version of the workspace the run started from, and it is a protected path. See [Define the personas](/guide/how-to/set-up-a-tenant#make-the-team-yours).
:::

Related:

- [Add a validator](/guide/how-to/add-a-validator)
- [Set up a tenant](/guide/how-to/set-up-a-tenant)
- [Project config reference](/reference/project-config)
