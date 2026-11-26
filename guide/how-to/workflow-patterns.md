# Workflow examples

You rarely need to design a workflow from nothing. This page has nine complete workflow files: pick the one that matches your goal, copy it and change the paths, personas and validators. Read it if you write workflows. For work that is not listed here, follow [Write a workflow](/guide/how-to/write-a-workflow).

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

You need six things to read any example on this page.

- **Objective** says where the run gets what it is asked to do: an issue, a trigger's standing text or text you give `daggry run`. A workflow holds no task of its own, so without an objective a persona has nothing to do. See [Choose how much you decide](/guide/how-to/autonomy#four-missions-one-team).
- A sketch shows the steps in order. `[agent]`, `[command]`, `[verify]` and `[effect]` are steps of that kind. `(human)` is a checkpoint: a yes continues, and any other reply sends the run back. `{ ... }` is a loop: its steps repeat until its gate holds.
- `validators: [project]` runs the project's main validator. To name yours, see [Set up a project](/guide/how-to/set-up-a-project). To write one, see [Add a validator](/guide/how-to/add-a-validator).
- A loop ends when its gate holds, and stops at its limit, `max`. By default each iteration works on everything that is still open. Two examples, [Process a list of items](#process-a-list-of-items) and [Migrate files in batches](#migrate-files-in-batches), take one item in each iteration with `over: plan`, and set `max` greater than the number of items. See [Add a loop](/guide/how-to/add-a-loop).
- `persona` names who does an `agent` step. The workflow holds no instructions: your tenant config or project config defines each persona, and the **Personas** line of an example says what its instructions cover. See [Set up a tenant](/guide/how-to/set-up-a-tenant#make-the-team-yours).
- Every step seals its result into the evidence trail: an `agent` or `command` step a change, a `verify` step its measurements and verdicts, an approval the digest of what you approved. See [Why you can trust a run](/guide/concepts/trust).

Paths such as `reports/**` and scripts such as `scripts/audit.sh` are examples. Replace them with yours.

## Examples for any work

Use these two when your work is not software. The workspace is a git repository of documents or data, and the validator is a script that inspects it.

### Review a document

**Use when** a document must meet a list of review rules before a person approves it, such as a contract, a policy or a specification. The plan turns the rules into criteria, and the loop revises the document until the validators pass each one.

**Objective:** the issue. It names the document and the rules it must meet.

**Code checks:** Two validators. `project` is the project's main validator, for example that every required section is present, every defined term is used and every cross-reference resolves. `house-style` is a validator that every project in your tenant shares, declared in the tenant config, for example that no banned phrase appears.

**Personas:** `planner` writes one criterion for each review rule the document must meet. `writer` revises the document to meet the criteria and changes nothing else.

```text
[agent plan] -> (human approves plan)
  -> { [agent revise] -> [verify] }
  -> (human approves, or replies and sends it back)
```

While a criterion is not met, the loop repeats and `writer` gets the findings that still fail, up to the loop limit in `max`. The approval at `sign-off` covers the sealed change, so the person approves the exact document the validators measured and the `verify` step passed. A person, not a validator, decides whether the document says the right thing.

::: details Complete file
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

  - id: review
    loop:
      until: verdict.all_covered
      max: 5
      steps:
        - id: revise
          kind: agent
          persona: writer
          outputs: [change]
          scope: ["documents/**"]
        - id: check-document
          kind: verify
          validators: [project, house-style]
          judges: [coverage]

  - id: sign-off
    kind: human
    of: review
```
:::

### Refresh and publish data

**Use when** a dataset is rebuilt from its sources again and again, and a person must say yes before each new version is published. No agent works in this example. A script refreshes the data, code checks it, and a person releases it.

**Objective:** a schedule trigger's standing text, such as "Rebuild the sales dataset from its sources". No persona reads it here. Daggry still seals it, so the trail shows what the run was for.

**Code checks:** Two validators. `project` is the project's main validator, for example that every required column is filled and every key is unique. `data-contract` is a validator that every project in your tenant shares, declared in the tenant config, for example that the row count is within a stated range of the last published version.

```text
[command refresh] -> [verify] -> (human approves publish) -> [effect open-pr]
```

Each refresh is one run. A failed `check-data` fails the run, so a person is only asked about data that passed. The approval at `approve-publish` covers the sealed change, so what is published is exactly what the person approved. The dataset lives in a git repository, so the `open-pr` effect delivers the new version as a pull request.

::: details Complete file
```yaml
format: daggry/workflow@1
steps:
  - id: refresh
    kind: command
    scope: ["data/**"]
    run: [sh, scripts/refresh.sh]

  - id: check-data
    kind: verify
    validators: [project, data-contract]

  - id: approve-publish
    kind: human
    of: refresh

  - id: publish
    kind: effect
    do: open-pr
```
:::

## Examples for software

In these seven examples the workspace is a git repository and the work item is an issue. The `open-pr` effect delivers the result as a pull request. The result is not always a program: a report, a set of notes and a documentation page are delivered the same way.

### Ship a change from an issue

**Use when** you want to turn an issue into a pull request with tests written first. It is the delivery workflow.

**Objective:** the issue: its title and body when the run starts.

**Code checks:** Each new test fails first, then passes. It fails on the version of the workspace the run started from, and passes after the agent implements it. The `project` validator is the project's test suite.

**Personas:** `planner` writes numbered, testable criteria from the issue. `test-writer` writes a failing test for every criterion, with the criterion id in the test name. `implementer` makes the failing tests pass and changes no test.

```text
[agent plan] -> (human approves plan)
  -> { [agent test] -> [agent implement] -> [verify] }
  -> [effect open-pr]
```

The `test` step is the proof step: its `freeze` key freezes the test files when the step is sealed. See [Add a loop](/guide/how-to/add-a-loop#prove-the-work-first).

::: details Complete file
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

  - id: red-green
    loop:
      until: verdict.all_covered
      max: 8
      steps:
        - id: test
          kind: agent
          persona: test-writer
          outputs: [change]
          freeze: ["tests/**"]
          scope: ["tests/**"]
        - id: implement
          kind: agent
          persona: implementer
          outputs: [change]
          scope: ["src/**"]
        - id: check
          kind: verify
          validators: [project]
          judges: [coverage]

  - id: open
    kind: effect
    do: open-pr
```
:::

### Write a sourced report

**Use when** the result of the work is a document and every claim needs a source. Code checks that the sources exist. A person decides whether the report answers the question.

**Objective:** the issue. It asks the question the report must answer.

**Code checks:** Your main validator, for example that every paragraph cites a source and every link resolves.

**Personas:** `planner` lists the questions the report must answer and where to look. `writer` answers each question and cites a source for every claim.

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
    persona: planner
    outputs: [plan]
    scope: nothing

  - id: approve-plan
    kind: human
    of: plan

  - id: write-report
    kind: agent
    persona: writer
    outputs: [change]
    scope: ["reports/**"]

  - id: check-sources
    kind: verify
    validators: [project]

  - id: review-report
    kind: human
    of: write-report

  - id: publish
    kind: effect
    do: open-pr
```
:::

### Process a list of items

**Use when** you want to work through a list one item at a time, such as triaging a backlog, where each item is independent and you want it checked and sealed on its own. The plan turns the list into criteria, and `over: plan` makes the loop handle one in each iteration. This workflow writes a triage note for each item and opens a pull request with the notes.

**Objective:** the issue, or a schedule trigger's standing text, such as "Triage every item in the inbox".

**Code checks:** Your main validator, for example that each note has a label, a priority and a reason.

**Personas:** `planner` writes one criterion for each item in `triage/inbox.md`. `reviewer` writes `triage/<criterion id>.md` with a label, a priority and one sentence of reasoning.

```text
[agent plan] -> (human approves plan)
  -> { [agent triage one item] -> [verify] }
  -> [effect open-pr]
```

Your main validator accepts a note only when it has all three parts. A note that fails repeats the same item, up to the loop limit in `max`. The pull request is how the labels reach a person for review.

::: details Complete file
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

  - id: triage
    loop:
      over: plan
      as: criterion
      until: verdict.all_covered
      max: 25
      steps:
        - id: triage-item
          kind: agent
          persona: reviewer
          outputs: [change]
          scope: ["triage/**"]
        - id: check-note
          kind: verify
          validators: [project]
          judges: [coverage]

  - id: publish
    kind: effect
    do: open-pr
```
:::

### Migrate files in batches

**Use when** you have a large mechanical change that you want to land in small, checked pieces. A command lists the files, the plan groups them into batches, and the loop migrates one batch per iteration.

**Objective:** text you give when you start the run: `daggry run --objective "Migrate every config file to the v2 format"`.

**Code checks:** Your main validator on each batch, for example that the build and tests pass.

**Personas:** `planner` reads `migration/inventory.txt` and writes one criterion for each batch of at most 20 files. `implementer` migrates the files of the current batch and touches no other file.

```text
[command inventory] -> [agent plan batches] -> (human approves plan)
  -> { [agent migrate batch] -> [verify] }
  -> [effect open-pr]
```

The loop limit is the safety here. If a batch does not pass within `max` iterations, the run fails and says which batch. To be asked instead, add a `human` step with `of: migrate` after the loop.

::: details Complete file
```yaml
format: daggry/workflow@1
steps:
  - id: inventory
    kind: command
    scope: ["migration/**"]
    run: [sh, -c, "git ls-files v1 > migration/inventory.txt"]

  - id: plan
    kind: agent
    persona: planner
    outputs: [plan]
    scope: nothing

  - id: approve-plan
    kind: human
    of: plan

  - id: migrate
    loop:
      over: plan
      as: criterion
      until: verdict.all_covered
      max: 12
      steps:
        - id: migrate-batch
          kind: agent
          persona: implementer
          outputs: [change]
          scope: ["src/**", "v1/**"]
        - id: check-batch
          kind: verify
          validators: [project]
          judges: [coverage]

  - id: publish
    kind: effect
    do: open-pr
```
:::

### Update documentation

**Use when** you edit content where wording matters more than structure. Code checks what it can, such as links and required headings. A person reads the draft before a pull request opens.

**Objective:** the issue. It names the pages and what must change.

**Code checks:** Links and required headings, before a person reads the draft.

**Personas:** `writer` updates the pages under `docs/` that the issue names and keeps their structure.

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
    persona: writer
    outputs: [change]
    scope: ["docs/**"]

  - id: check-docs
    kind: verify
    validators: [project]

  - id: review-draft
    kind: human
    of: draft

  - id: publish
    kind: effect
    do: open-pr
```
:::

### Run a release check

**Use when** you prepare a release. Code builds and validates. An agent drafts the notes. A person approves before the release pull request opens.

**Objective:** text you give when you start the run, such as `daggry run --objective "Prepare release 2.4: build, validate and write the release notes"`, or a schedule trigger's standing text. `writer` reads the release from the objective.

**Code checks:** The build output and the changelog format, before the approval.

**Personas:** `writer` writes the release notes in `CHANGELOG.md` from the changes since the last release.

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
    run: [make, release-build]

  - id: check-build
    kind: verify
    validators: [project]

  - id: notes
    kind: agent
    persona: writer
    outputs: [change]
    scope: ["CHANGELOG.md"]

  - id: check-notes
    kind: verify
    validators: [project]

  - id: sign-off
    kind: human
    of: notes

  - id: release
    kind: effect
    do: open-pr
```
:::

### Audit and report

**Use when** you run a read-mostly audit, such as a dependency or configuration scan. A command collects the findings, an agent summarizes them, and the pull request carries the report. There is no approval in the workflow, because the review happens on the pull request.

**Objective:** a schedule trigger's standing text, such as "Scan the dependencies and report what is out of date or has a known vulnerability".

**Code checks:** The format of the summary. A person reviews the report on the pull request.

**Personas:** `writer` reads the scan output under `reports/` and writes `reports/summary.md`, grouped by severity.

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
    run: [sh, scripts/audit.sh]

  - id: summarize
    kind: agent
    persona: writer
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

- [Write a workflow](/guide/how-to/write-a-workflow)
- [Add a loop](/guide/how-to/add-a-loop)
- [Workflow file reference](/reference/workflow-schema)
