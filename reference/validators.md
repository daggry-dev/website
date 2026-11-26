# Validators

*Reference*

A validator is a command you declare. It measures the work, and Daggry seals the result. This page covers how Daggry reads its output, what the agent sees on a fail, how a step refers to a validator, when a validator counts as evidence and how to write one. It is for anyone who writes or reviews validators. For the steps, follow [Add a validator](/guide/how-to/add-a-validator). For who decides from a measurement, see [Judges](/reference/judges).

Validators measure. Judges judge. A gate decides when to stop.

The examples on this page are illustrative.

## A validator is a command

A validator is a command you declare in `.daggry/project.yaml`. Name it in a `verify` step to run it.

```yaml
validators:
  links:
    run: [sh, scripts/links.sh]
```

```yaml
- id: check
  kind: verify
  validators: [links]
```

The table lists what defines a validator.

| Question | Answer |
|---|---|
| What is it? | A command, always an argv array. Daggry seals its report as a measurement. |
| Where is it declared? | In the [Project config](/reference/project-config#validators), or in `validators.scripts` of the [Tenant config](/reference/tenant-config#validators) for one that projects share. |
| Where does it run? | On a clean copy of the workspace, after the agent process has ended, as an unprivileged user. |

## From command to gate

<ValidatorFlow />

The diagram shows the chain from left to right. A validator takes a clean copy of the workspace and reports. Daggry seals the report as a measurement. A judge is given the evidence trail and decides, and Daggry seals the verdict. A gate reads the verdict, never the agent's words.

## How Daggry reads the output

Daggry seals what a validator reported as a [measurement](/reference/kinds#evidence-measurement-1). The `output` key of a validator picks how Daggry reads the output. The table lists the values.

| `output` | Daggry reads | Default |
|---|---|---|
| `exit-code` | The exit code: 0 is `pass`, non-zero is `fail`, and a command that could not run is `error`. | Yes |
| `document` | A [result document](/reference/project-config#result-document) the command writes, with findings and metrics. | No |
| A tool format: `junit`, `tap`, `libtest` or `sarif` | The output of a tool that writes that format. | No |

Daggry ships four tool formats: `junit`, `tap`, `libtest` and `sarif`. The file the command writes is `output_file`. Absent, Daggry reads standard output. For the values in full, see [Output formats](/reference/project-config#output-formats).

## What the agent sees on a fail

When a validator fails, the agent gets two things: the failing findings and the tail of the command's output. A validator with `output: exit-code` has no findings, so the output tail is all the agent gets, and it is usually what the test runner printed.

- **The output is a run log, not evidence.** Daggry keeps the tail of the command's standard output and standard error, up to a fixed size, with the other logs of the run. It is not sealed, it has no digest and no gate can read it. Only the measurement and the verdict count.
- **The agent treats the log as data.** The output can echo workspace content, so nothing in it is an instruction.
- **A preview gives the same two things.** The `validate` tool returns the findings and the output tail, so the agent sees the same feedback before and after Daggry seals the result.

To give the agent more than the tail, report findings with a message and a locator. See [Result document](/reference/project-config#result-document).

## Referring to a validator

A `verify` step names its validators in `validators`. See [verify](/reference/workflow-schema#verify). The table lists the two forms of a reference.

| Reference | Resolves to |
|---|---|
| `<name>` | The validator you define of that name. Daggry looks in the `validators` of the project config of the baseline first, then in the tenant config. The project's validator wins over a tenant's of the same name. |
| `project` | The project's default set of validators: the canonical validator and each validator in `verification.also`. See [verification](/reference/project-config#verification). |

`project`, `daggry`, `coverage`, `no_regression` and `baseline_proof` are reserved and cannot name a validator or a judge you declare. A judge name in `judges` resolves the same way, against the `judges` of the project config and the tenant config, after the named judges. Daggry resolves every name when the run starts and refuses the run when a name matches nothing.

```yaml
- id: check
  kind: verify
  validators: [project, licence-terms]
  judges: [coverage]
```

## When a validator counts as evidence

A validator you define counts as evidence by default. Daggry reads a project's validators from the baseline, which the agent cannot change, and a tenant's from the tenant config. The files a project validator's `run` names are protected paths. See [What a project adds](/reference/protected-paths#what-a-project-adds).

To count only the validators and judges the tenant config declares for one workspace, set `projects.<workspace>.trust_project: false`. A project's own validators and judges are then previews, and a run that names one, or names `project`, is refused when it starts.

An agent can run any validator on its working copy for fast feedback, through the `validate` tool or a validator with `expose: agent`. A preview seals nothing and is never evidence. A reviewer's finding gates work only when code can confirm what it cites, such as a quoted passage inside the change. Any other finding is advice.

## Write a validator

A validator inspects the clean copy it starts in. It passes with exit code 0 and fails with any other code. To report findings, it writes a result document and you declare `output: document`.

1. Write the script anywhere in the workspace, such as `scripts/summaries.sh`.

   ```sh
   #!/bin/sh
   # scripts/summaries.sh: every page has a summary line.
   for page in handbook/*.md; do
     grep -q '^Summary: ' "$page" || { echo "no summary: $page"; exit 1; }
   done
   ```

2. Declare it in `validators` in `.daggry/project.yaml`. `run` is the only key you need. `output` defaults to `exit-code` and `role` to `custom`.

   ```yaml
   validators:
     summaries:
       run: [sh, scripts/summaries.sh]
   ```

3. Name it in a `verify` step as `summaries`.

4. To read findings, set `output: document` in the declaration. The script then writes a [result document](/reference/project-config#result-document) and exits with 0 when the work passes.

   ```yaml
   validators:
     summaries:
       run: [sh, scripts/summaries.sh]
       output: document
   ```

   ```sh
   #!/bin/sh
   # scripts/summaries.sh: every page has a summary line.
   fail=0; findings=""
   for page in handbook/*.md; do
     if grep -q '^Summary: ' "$page"; then outcome=pass; else outcome=fail; fail=1; fi
     findings="$findings{\"id\":\"summary\",\"outcome\":\"$outcome\",\"locator\":\"$page\",\"message\":\"\"},"
   done
   [ $fail -eq 0 ] && outcome=pass || outcome=fail
   printf '{"format":"daggry/result@1","outcome":"%s","findings":[%s]}\n' "$outcome" "${findings%,}"
   exit $fail
   ```

Daggry runs only what a declaration names. To share a validator across projects, declare it in `validators.scripts` of the tenant config. A tool that has an output format of its own needs no wrapper script: set `output` to the format name, such as `junit`. See [Output formats](/reference/project-config#output-formats).

## Next steps

The list names the pages to read next.

- For who decides from a measurement, and the facts a judge emits, see [Judges](/reference/judges).
- For the keys of a `verify` step, see [Workflow file](/reference/workflow-schema#verify).
- For declaring a validator, see [Project config](/reference/project-config#validators) and [Tenant config](/reference/tenant-config#validators).
- For the tool formats Daggry reads, see [Output formats](/reference/project-config#output-formats).
