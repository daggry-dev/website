# Workflow examples

You rarely need to design a workflow from nothing. This page has nine complete workflow files: pick the one that matches your goal, copy it and change the paths and scripts. Read it if you write workflows. For work that is not listed here, read [Design a workflow](/guide/how-to/design-a-workflow).

The first two examples are for any kind of work. The other seven are software examples. The files are illustrative.

## Choose an example

This table maps a goal to an example.

| Goal | Example | Kind of work |
|---|---|---|
| Bring a document in line with review rules | [Review a document](#review-a-document) | Any |
| Rebuild a dataset and release it on a person's yes | [Refresh and publish data](#refresh-and-publish-data) | Any |
| Deliver a change that a failing test proves | [Ship a change from an issue](#ship-a-change-from-an-issue) | Software |
| Produce a document with sources | [Write a sourced report](#write-a-sourced-report) | Software |
| Apply the same judgement to many items | [Process a list of items](#process-a-list-of-items) | Software |
| Change many files safely | [Migrate files in batches](#migrate-files-in-batches) | Software |
| Edit content that a person must read | [Update documentation](#update-documentation) | Software |
| Prepare a release | [Run a release check](#run-a-release-check) | Software |
| Collect findings and report them | [Audit and report](#audit-and-report) | Software |

Examples combine. For example, add the `inventory` command from Migrate files in batches to the front of Process a list of items.

## How to read an example

You need four things to read any example on this page.

- A sketch shows the steps in order. `[agent]`, `[command]`, `[verify]` and `[effect]` are steps of that kind. `(human)` is an approval. `{ ... }` is a loop that repeats once for each plan item.
- `validators: [project]` runs the project's main validator. To name yours, see [Set up a project](/guide/how-to/set-up-a-project). To write one, see [Add a validator](/guide/how-to/add-a-validator).
- A loop ends when its gate holds, and stops at its limit, `max`. Set `max` greater than the number of items you expect. See [Add a loop](/guide/how-to/add-a-loop).
- `engine: <engine>` names the engine an agent step runs on. Paths such as `reports/**` and scripts such as `scripts/audit.sh` are examples. Replace them with yours.

## Examples for any work

Use these two when your work is not software. The workspace is a versioned collection of documents or data, and the validator is a script that inspects it.

### Review a document

**Use when** a document must meet a list of review rules before a person approves it, such as a contract, a policy or a specification. The plan turns the rules into plan items, and the loop revises the document until the validators pass each one.

**Code checks:** Two validators. `project` is the project's main validator, for example that every required section is present, every defined term is used and every cross-reference resolves. `tenant/house-style` is a script validator the tenant admin declares for every project, for example that no banned phrase appears.

```text
[agent plan] -> (human approves plan)
  -> { [agent revise] -> [verify] }
  -> (human, only if the loop runs out) -> (human approves)
```

A revision that fails repeats the same plan item, up to the loop limit in `max`. The approval at `sign-off` covers the sealed change, so the person approves the exact document the validators passed. A person, not a validator, decides whether the document says the right thing.

::: details Complete file
```yaml
format: daggry/workflow@1
steps:
  - id: plan
    kind: agent
    engine: <engine>
    prompt: "Read the work item. Write a plan with one criterion for each review rule the document must meet."
    outputs: [plan]
    scope: nothing

  - id: approve-plan
    kind: human
    waiting_for: approval

  - id: review
    loop:
      over: plan
      as: criterion
      until: verdict.all_covered
      max: 12
      on_exhausted: stuck
      steps:
        - id: revise
          kind: agent
          engine: <engine>
          prompt: "Revise the document so that it meets the current criterion. Change nothing else."
          outputs: [change]
          scope: ["documents/**"]
        - id: check-document
          kind: verify
          validators: [project, tenant/house-style, daggry/criterion-coverage]

  - id: stuck
    kind: human
    waiting_for: input-needed

  - id: sign-off
    kind: human
    waiting_for: input-needed
```
:::

### Refresh and publish data

**Use when** a dataset is rebuilt from its sources again and again, and a person must say yes before each new version is published. No agent works in this example. A script refreshes the data, code checks it, and a person releases it.

**Code checks:** Two validators. `project` is the project's main validator, for example that every required column is filled and every key is unique. `tenant/data-contract` is a script validator the tenant admin declares, for example that the row count is within a stated range of the last published version.

```text
[command refresh] -> [verify] -> (human approves publish) -> [publish]
```

Each refresh is one run. A failed `check-data` fails the run, so a person is only asked about data that passed. The approval at `approve-publish` covers the sealed change, so what is published is exactly what the person approved. The `publish` step is a step kind the tenant admin adds, here `acme/publish-dataset`. See the [Workflow file reference](/reference/workflow-schema).

::: details Complete file
```yaml
format: daggry/workflow@1
steps:
  - id: refresh
    kind: command
    scope: ["data/**"]
    run: "sh scripts/refresh.sh"

  - id: check-data
    kind: verify
    validators: [project, tenant/data-contract]

  - id: approve-publish
    kind: human
    waiting_for: input-needed

  - id: publish
    kind: acme/publish-dataset
```
:::

## Examples for software

In these seven examples the workspace is a Git repository and the work item is an issue. The `open-pr` effect delivers the result as a pull request. The result is not always a program: a report, a set of notes and a documentation page are delivered the same way.

### Ship a change from an issue

**Use when** you want to turn an issue into a pull request with tests written first. It is the delivery workflow.

**Code checks:** Each new test fails first, then passes. It fails on the version of the workspace the run started from, and passes after the agent implements it. The `project` validator is the project's test suite.

```text
[agent plan] -> (human approves plan)
  -> { [agent test] -> [agent implement] -> [verify] }
  -> (human, only if the loop runs out) -> [effect open-pr]
```

The `test` step is the proof step: its `freeze` key freezes the test files when the step is sealed. See [Add a loop](/guide/how-to/add-a-loop#prove-each-item-first).

::: details Complete file
```yaml
format: daggry/workflow@1
steps:
  - id: plan
    kind: agent
    engine: <engine>
    prompt: "Read the issue. Write a plan with numbered, testable acceptance criteria."
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
      max: 8
      on_exhausted: stuck
      steps:
        - id: test
          kind: agent
          engine: <engine>
          prompt: "Write a failing test for the current criterion. Put the criterion id in the test name."
          outputs: [change]
          freeze: ["tests/**"]
          scope: ["tests/**"]
        - id: implement
          kind: agent
          engine: <engine>
          prompt: "Make the new test pass. Do not change any test."
          outputs: [change]
          scope: ["src/**"]
        - id: check
          kind: verify
          validators: [project, daggry/criterion-coverage]

  - id: stuck
    kind: human
    waiting_for: input-needed

  - id: open
    kind: effect
    do: open-pr
```
:::

### Write a sourced report

**Use when** the result of the work is a document and every claim needs a source. Code checks that the sources exist. A person decides whether the report answers the question.

**Code checks:** Your main validator, for example that every paragraph cites a source and every link resolves.

```text
[agent plan] -> (human approves plan) -> [agent write report]
  -> [verify sources] -> (human reviews report) -> [effect open-pr]
```

Your main validator fails a report that has an uncited paragraph or a dead link. Approval at `review-report` binds to the sealed report.

::: details Complete file
```yaml
format: daggry/workflow@1
steps:
  - id: plan
    kind: agent
    engine: <engine>
    prompt: "Read the issue. Write a plan that lists the questions the report must answer and where to look."
    outputs: [plan]
    scope: nothing

  - id: approve-plan
    kind: human
    waiting_for: approval

  - id: write-report
    kind: agent
    engine: <engine>
    prompt: "Answer each question in the plan. Cite a source for every claim in reports/<topic>.md."
    outputs: [change]
    scope: ["reports/**"]

  - id: check-sources
    kind: verify
    validators: [project]

  - id: review-report
    kind: human
    waiting_for: input-needed

  - id: publish
    kind: effect
    do: open-pr
```
:::

### Process a list of items

**Use when** you want to work through a list one item at a time, such as triaging a backlog. The plan turns the list into plan items, and the loop handles one per iteration. This workflow writes a triage note for each item and opens a pull request with the notes.

**Code checks:** Your main validator, for example that each note has a label, a priority and a reason.

```text
[agent plan] -> (human approves plan)
  -> { [agent triage one item] -> [verify] }
  -> (human, only if the loop runs out) -> [effect open-pr]
```

Your main validator accepts a note only when it has all three parts. A note that fails repeats the same item, up to the loop limit in `max`. The pull request is how the labels reach a person for review.

::: details Complete file
```yaml
format: daggry/workflow@1
steps:
  - id: plan
    kind: agent
    engine: <engine>
    prompt: "Read triage/inbox.md. Write a plan with one criterion for each item in it."
    outputs: [plan]
    scope: nothing

  - id: approve-plan
    kind: human
    waiting_for: approval

  - id: triage
    loop:
      over: plan
      as: criterion
      until: verdict.all_covered
      max: 25
      on_exhausted: stuck
      steps:
        - id: triage-item
          kind: agent
          engine: <engine>
          prompt: "Triage the current criterion. Write triage/<criterion id>.md with a label, a priority and one sentence of reasoning."
          outputs: [change]
          scope: ["triage/**"]
        - id: check-note
          kind: verify
          validators: [project, daggry/criterion-coverage]

  - id: stuck
    kind: human
    waiting_for: input-needed

  - id: publish
    kind: effect
    do: open-pr
```
:::

### Migrate files in batches

**Use when** you have a large mechanical change that you want to land in small, checked pieces. A command lists the files, the plan groups them into batches, and the loop migrates one batch per iteration.

**Code checks:** Your main validator on each batch, for example that the build and tests pass.

```text
[command inventory] -> [agent plan batches] -> (human approves plan)
  -> { [agent migrate batch] -> [verify] }
  -> (human, only if the loop runs out) -> [effect open-pr]
```

The loop limit is the safety here. If a batch does not pass within `max` iterations, the run stops at `stuck` and a person decides. Plain `daggry approve <run-id>` gives up the unfinished batch.

::: details Complete file
```yaml
format: daggry/workflow@1
steps:
  - id: inventory
    kind: command
    scope: ["migration/**"]
    run: "git ls-files v1 > migration/inventory.txt"

  - id: plan
    kind: agent
    engine: <engine>
    prompt: "Read migration/inventory.txt. Write a plan with one criterion for each batch of at most 20 files."
    outputs: [plan]
    scope: nothing

  - id: approve-plan
    kind: human
    waiting_for: approval

  - id: migrate
    loop:
      over: plan
      as: criterion
      until: verdict.all_covered
      max: 12
      on_exhausted: stuck
      steps:
        - id: migrate-batch
          kind: agent
          engine: <engine>
          prompt: "Migrate the files in the current batch to the new API. Touch no other file."
          outputs: [change]
          scope: ["src/**", "v1/**"]
        - id: check-batch
          kind: verify
          validators: [project, daggry/criterion-coverage]

  - id: stuck
    kind: human
    waiting_for: input-needed

  - id: publish
    kind: effect
    do: open-pr
```
:::

### Update documentation

**Use when** you edit content where wording matters more than structure. Code checks what it can, such as links and required headings. A person reads the draft before a pull request opens.

**Code checks:** Links and required headings, before a person reads the draft.

```text
[agent draft] -> [verify] -> (human reviews draft) -> [effect open-pr]
```

A failed `check-docs` outside a loop fails the run, so the person only reviews drafts that passed. Add a plan and an approval before `draft` when the scope of the update needs agreement first.

::: details Complete file
```yaml
format: daggry/workflow@1
steps:
  - id: draft
    kind: agent
    engine: <engine>
    prompt: "Read the issue. Update the pages under docs/ that it names. Keep the existing structure."
    outputs: [change]
    scope: ["docs/**"]

  - id: check-docs
    kind: verify
    validators: [project]

  - id: review-draft
    kind: human
    waiting_for: input-needed

  - id: publish
    kind: effect
    do: open-pr
```
:::

### Run a release check

**Use when** you prepare a release. Code builds and validates. An agent drafts the notes. A person approves before the release pull request opens.

**Code checks:** The build output and the changelog format, before the approval.

```text
[command build] -> [verify] -> [agent release notes]
  -> [verify] -> (human approves) -> [effect open-pr]
```

Each `verify` step runs the same main validator. Make that validator cover both the build output and the changelog format. A failed `verify` step stops the run before the approval.

::: details Complete file
```yaml
format: daggry/workflow@1
steps:
  - id: build
    kind: command
    scope: ["dist/**"]
    run: "make release-build"

  - id: check-build
    kind: verify
    validators: [project]

  - id: notes
    kind: agent
    engine: <engine>
    prompt: "Write release notes in CHANGELOG.md from the commit history since the last release."
    outputs: [change]
    scope: ["CHANGELOG.md"]

  - id: check-notes
    kind: verify
    validators: [project]

  - id: sign-off
    kind: human
    waiting_for: input-needed

  - id: release
    kind: effect
    do: open-pr
```
:::

### Audit and report

**Use when** you run a read-mostly audit, such as a dependency or configuration scan. A command collects the findings, an agent summarizes them, and the pull request carries the report. There is no approval in the workflow, because the review happens on the pull request.

**Code checks:** The format of the summary. A person reviews the report on the pull request.

```text
[command scan] -> [agent summarize] -> [verify] -> [effect open-pr]
```

::: details Complete file
```yaml
format: daggry/workflow@1
steps:
  - id: scan
    kind: command
    scope: ["reports/**"]
    run: "sh scripts/audit.sh"

  - id: summarize
    kind: agent
    engine: <engine>
    prompt: "Read the scan output under reports/. Write reports/summary.md that groups findings by severity."
    outputs: [change]
    scope: ["reports/**"]

  - id: check-summary
    kind: verify
    validators: [project]

  - id: publish
    kind: effect
    do: open-pr
```
:::

Related:

- [Design a workflow](/guide/how-to/design-a-workflow)
- [Write a workflow](/guide/how-to/write-a-workflow)
- [Gate expressions](/reference/gates)
