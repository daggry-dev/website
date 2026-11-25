# Workflow patterns

You rarely need to design a workflow from nothing. Pick the pattern that matches your goal, copy its file and change the paths and scripts. Each pattern shows when to use it, what code checks, a sketch of the steps and the complete file.

The patterns are in two groups. The first group is work outside software: a document review and a recurring data refresh. The second group uses the software binding, where the workspace is a repository and the result is handed over as a pull request. A binding maps the standards onto one kind of work and its tools. See [Bindings](/reference/bindings).

To build a workflow for a kind of work not listed here, read [Design a workflow](/guide/how-to/design-a-workflow).

## Choose a pattern

This table maps a goal to a pattern.

| Goal | Pattern | Group |
|---|---|---|
| Bring a document in line with review rules | Review a document | Any work |
| Refresh a dataset and release it on a person's yes | Refresh data and approve before publish | Any work |
| Deliver a change that a failing check proves | Ship a change from an issue | Software binding |
| Produce a document with sources | Research a question | Software binding |
| Apply the same judgement to many items | Process a batch of items | Software binding |
| Change many files safely | Migrate files in bounded batches | Software binding |
| Edit content that a person must read | Update documentation | Software binding |
| Prepare a release | Run a gated release check | Software binding |
| Collect findings and report them | Audit and report | Software binding |

Patterns combine. For example, add the `inventory` command from the migration pattern to the front of the batch pattern.

## How to read the sketches

A sketch shows steps in order. `[agent]`, `[command]`, `[verify]` and `[effect]` are steps of that kind. `(human)` is a wait for a person. `{ ... }` is a loop that repeats once for each criterion of the sealed plan.

Every `verify` step names the validators that judge the work, in `validators`. In these files the list holds `project`, the project's verification: the validator that `verification.canonical` names in `.daggry/project.yaml`, with the supporting validators and thresholds that file lists. A run reads that file from the baseline, the version of the workspace the run starts from. The patterns assume that the tenant config admits the project's validators as evidence, in `projects[].validators.admit`. The two patterns for any work add a script validator that the tenant declares, named `tenant/<name>`. A `verify` step is green when every validator it names passes. See [Validators: the extension point](/guide/concepts/validators) and [Project config](/reference/project-config).

A loop ends when its `until` gate holds. The gate `verdict.all_covered` reads a fact of the built-in validator `daggry/criterion-coverage`, so the `verify` step of each loop names it. The fact holds when every plan criterion has a passing finding that carries its id. Your validator reports those findings in a result document: one finding for each criterion it accepts, with the criterion id as the finding's id. In the software binding a finding is a test, and an adapter reads the test report. For the result document, see [Result document](/reference/project-config#result-document). For the adapters, see [Bindings](/reference/bindings#adapters).

Each loop's `max` limits the iterations of the whole loop. Set it greater than the number of items you expect.

The files are illustrative. Each one opens with the required header, `format: daggry/workflow@1`. In every `agent` step, `engine: <engine>` names the coding-agent engine the step uses. Paths such as `reports/**` and scripts such as `scripts/audit.sh` are examples. Replace them with yours.

## Patterns for any work

These two patterns use no software tool. The workspace is a versioned collection of documents or data, and the check is a script that inspects it.

### Review a document

**Use when** a document must meet a list of review rules before a person signs it off, such as a contract, a policy or a specification. The plan turns the rules into criteria, and the loop revises the document until the check accepts each one.

**Code checks:** Two validators. `project` is the project's verification, for example that every required section is present, every defined term is used and every cross-reference resolves. `tenant/house-style` is a script validator the tenant declares for every project, for example that no banned phrase appears.

```text
[agent plan] -> (human approves plan)
  -> { [agent revise] -> [verify] }
  -> (human, only if the loop runs out) -> (human signs off)
```

The check fails for a criterion before the revision and passes after it. A revision that fails the check repeats the same criterion, up to the bound in `max`. The sign-off at `sign-off` binds to the sealed change, so the person approves the exact document the check accepted. A person, not the check, judges whether the document says the right thing.

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

### Refresh data and approve before publish

**Use when** a dataset is rebuilt from its sources again and again, and a person must say yes before each new version is published. No agent works in this pattern: a script refreshes the data, code checks it, and a person releases it.

**Code checks:** Two validators. `project` is the project's verification, for example that every required column is filled and every key is unique. `tenant/data-contract` is a script validator the tenant declares, for example that the row count is within a stated range of the last published version.

```text
[command refresh] -> [verify] -> (human approves publish) -> [publish]
```

Each refresh is one run. A failed `check-data` fails the run, so a person is only asked about data that passed the check. The approval at `approve-publish` binds to the sealed change, so what is published is exactly what the person approved. The `publish` step is an extension step kind, here `acme/publish-dataset`, that the tenant registers. See [Step kind registry](/reference/workflow-schema#step-kind-registry).

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

## Patterns in the software binding

In these patterns the workspace is a repository, the work item is an issue and the `open-pr` effect hands the result over as a pull request. The product is not always a program: a report, a set of notes and a documentation page are delivered the same way.

### Ship a change from an issue

**Use when** you want to turn an issue into a pull request with tests written first. It is the delivery workflow.

**Code checks:** The baseline proof: each new test fails on the baseline before the agent implements it, then passes on a clean copy of the workspace. The `project` validator is the project's test suite.

```text
[agent plan] -> (human approves plan)
  -> { [agent test] -> [agent implement] -> [verify] }
  -> (human, only if the loop runs out) -> [effect open-pr]
```

The `test` step is the proof step: its `freeze` key freezes the test files when the step is sealed. See [Red, then green](/guide/how-to/write-a-workflow#red-then-green).

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

### Research a question and write a sourced report

**Use when** the product of the work is a document and every claim needs a source. Code checks that the sources exist. A person judges whether the report answers the question.

**Code checks:** Your canonical validator, for example that every paragraph cites a source and every link resolves.

```text
[agent plan] -> (human approves plan) -> [agent write report]
  -> [verify sources] -> (human reviews report) -> [effect open-pr]
```

Your canonical validator fails a report that has an uncited paragraph or a dead link. Approval at `review-report` binds to the sealed report.

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

### Process a batch of items

**Use when** you want to work through a list one item at a time, such as triaging a backlog. The plan turns the list into criteria, and the loop handles one per iteration. This workflow writes a triage note for each item and opens a pull request with the notes.

**Code checks:** Your canonical validator, for example that each note has a label, a priority and a reason.

```text
[agent plan] -> (human approves plan)
  -> { [agent triage one item] -> [verify] }
  -> (human, only if the loop runs out) -> [effect open-pr]
```

Your canonical validator accepts a note only when it has all three parts. A note that fails the check repeats the same item, up to the bound in `max`. The pull request is how the labels reach a person for review.

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

### Migrate files in bounded batches

**Use when** you have a large mechanical change that you want to land in small, checked pieces. A command lists the files, the plan groups them into batches, and the loop migrates one batch per iteration.

**Code checks:** Your canonical validator on each batch, for example that the build and tests pass.

```text
[command inventory] -> [agent plan batches] -> (human approves plan)
  -> { [agent migrate batch] -> [verify] }
  -> (human, only if the loop runs out) -> [effect open-pr]
```

The bound is the safety here. If a batch does not pass after the iterations in `max` are spent, the run waits at `stuck` and a person decides. Plain `daggry approve <run-id>` gives up the unfinished batch.

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

### Update documentation with a human review

**Use when** you edit content where wording matters more than structure. Code checks what it can, such as links and required headings. A person reads the draft before a pull request opens.

**Code checks:** Links and required headings, before a person reads the draft.

```text
[agent draft] -> [verify] -> (human reviews draft) -> [effect open-pr]
```

A failed `check-docs` outside a loop fails the run, so the person only reviews drafts that passed the check. Add a plan and an approval before `draft` when the scope of the update needs agreement first.

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

### Run a gated release check

**Use when** you prepare a release. Code builds and verifies. An agent drafts the notes. A person signs off before the release pull request opens.

**Code checks:** The build output and the changelog format, before the sign-off.

```text
[command build] -> [verify] -> [agent release notes]
  -> [verify] -> (human signs off) -> [effect open-pr]
```

Each `verify` step runs the same canonical validator, read from the baseline. Make that validator cover both the build output and the changelog format. A failed `verify` step stops the run before the sign-off.

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

**Use when** you run a read-mostly audit, such as a dependency or configuration scan. A command collects the findings, an agent summarizes them, and the pull request carries the report. There is no wait in the workflow, because the review happens on the pull request.

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

## Next steps

- To design a workflow for another kind of work, read [Design a workflow](/guide/how-to/design-a-workflow).
- To learn each field, read [Write a workflow](/guide/how-to/write-a-workflow).
- For the exact syntax of `until`, read [Gate expressions](/reference/gates).
