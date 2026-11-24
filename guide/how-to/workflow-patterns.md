# Workflow patterns

You rarely need to design a workflow from nothing. Pick the pattern below that matches your goal, copy its file and change the paths and scripts. Each pattern shows when to use it, what code checks, a sketch of the steps and the complete file.

To build a workflow for a kind of work not listed here, read [Design a workflow](/guide/how-to/design-a-workflow).

## Choose a pattern

This table maps a goal to a pattern.

| Goal | Pattern |
|---|---|
| Write code that a test proves | Ship a change from an issue |
| Produce a document with sources | Research a question |
| Apply the same judgment to many items | Process a batch of items |
| Change many files safely | Migrate files in bounded batches |
| Edit content that a person must read | Update documentation |
| Prepare a release | Run a gated release check |
| Collect findings and report them | Audit and report |

Patterns combine. For example, add the `inventory` command from the migration pattern to the front of the batch pattern.

## Ship a change from an issue

**Use when** you want to turn an issue into a pull request with tests written first. It is the delivery workflow.

**Code checks:** that each new test fails before the agent implements it, then that it passes on a clean copy of the code.

```text
[agent plan] -> (human approves plan)
  -> { [agent test] -> [agent implement] -> [verify] }
  -> (human, only if the loop runs out) -> [effect open-pr]
```

The tests freeze once proven. See [Red, then green](/guide/how-to/write-a-workflow#red-then-green).

::: details Complete file
```yaml
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
          tests: ["tests/**"]
          scope: ["tests/**"]
        - id: implement
          kind: agent
          engine: <engine>
          prompt: "Make the new test pass. Do not change any test."
          outputs: [change]
          scope: ["src/**"]
        - id: check
          kind: verify

  - id: stuck
    kind: human
    waiting_for: input-needed

  - id: open
    kind: effect
    do: open-pr
```
:::

## How to read the sketches

A sketch shows steps in order. `[agent]`, `[command]`, `[verify]` and `[effect]` are steps of that kind. `(human)` is a wait for a person. `{ ... }` is a loop that repeats once for each criterion of the sealed plan.

Every pattern that uses `verify` needs a check in the repository's base commit, set in `.daggry/profile.yaml` as `verify.test`. See [Project config](/reference/project-config#the-profile). A `verify` step is green when that command exits with 0.

A loop ends when its `until` gate holds. The gate `verdict.all_covered` holds when every plan criterion has a passing test that carries its id. In a workflow that does not deliver code, your check command reports one passing test for each criterion it accepts, named with the criterion id. The exact lines it prints are in the [`libtest-lines` contract](/reference/project-config#libtest-lines).

Each loop's `max` limits the iterations of the whole loop. Set it above the number of items you expect.

The files are illustrative. Each one is valid against the [workflow schema](/reference/workflow-schema). In every `agent` step, `engine: <engine>` names the coding-agent engine the step uses. Paths such as `reports/**` and scripts such as `scripts/audit.sh` are examples. Replace them with yours.

## Research a question and commit a sourced report

**Use when** the product of the work is a document and every claim needs a source. Code checks that the sources exist. A person judges whether the report answers the question.

**Code checks:** Your `verify.test` command, for example that every paragraph cites a source and every link resolves.

```text
[agent plan] -> (human approves plan) -> [agent write report]
  -> [verify sources] -> (human reviews report) -> [effect open-pr]
```

Your `verify.test` command can fail a report that has an uncited paragraph or a dead link. Approval at `review-report` binds to the sealed report.

::: details Complete file
```yaml
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

  - id: review-report
    kind: human
    waiting_for: input-needed

  - id: publish
    kind: effect
    do: open-pr
```
:::

## Process a batch of items

**Use when** you want to work through a list one item at a time, such as triaging a backlog. The plan turns the list into criteria, and the loop handles one per iteration. This workflow writes a triage note for each item and opens a pull request with the notes.

**Code checks:** Your check command, for example that each note has a label, a priority and a reason.

```text
[agent plan] -> (human approves plan)
  -> { [agent triage one item] -> [verify] }
  -> (human, only if the loop runs out) -> [effect open-pr]
```

Your check command accepts a note only when it has all three parts. A note that fails the check repeats the same item, up to the bound in `max`. The pull request is how the labels reach a person for review.

::: details Complete file
```yaml
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

  - id: stuck
    kind: human
    waiting_for: input-needed

  - id: publish
    kind: effect
    do: open-pr
```
:::

## Migrate files in bounded batches

**Use when** you have a large mechanical change that you want to land in small, checked pieces. A command lists the files, the plan groups them into batches, and the loop migrates one batch per iteration.

**Code checks:** Your check command on each batch, for example that the build and tests pass.

```text
[command inventory] -> [agent plan batches] -> (human approves plan)
  -> { [agent migrate batch] -> [verify] }
  -> (human, only if the loop runs out) -> [effect open-pr]
```

The bound is the safety here. If a batch does not pass after the iterations in `max` are spent, the run waits at `stuck` and a person decides. Plain `daggry approve <run-id>` gives up the unfinished batch.

::: details Complete file
```yaml
steps:
  - id: inventory
    kind: command
    scope: ["migration/**"]
    run: "git ls-files legacy > migration/inventory.txt"

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
          scope: ["src/**", "legacy/**"]
        - id: check-batch
          kind: verify

  - id: stuck
    kind: human
    waiting_for: input-needed

  - id: publish
    kind: effect
    do: open-pr
```
:::

## Update documentation with a human review

**Use when** you edit content where wording matters more than structure. Code checks what it can, such as links and required headings. A person reads the draft before a pull request exists.

**Code checks:** Links and required headings, before a person reads the draft.

```text
[agent draft] -> [verify] -> (human reviews draft) -> [effect open-pr]
```

A failed `check-docs` outside a loop fails the run, so the person only reviews drafts that passed the check. Add a plan and an approval before `draft` when the scope of the update needs agreement first.

::: details Complete file
```yaml
steps:
  - id: draft
    kind: agent
    engine: <engine>
    prompt: "Read the issue. Update the pages under docs/ that it names. Keep the existing structure."
    outputs: [change]
    scope: ["docs/**"]

  - id: check-docs
    kind: verify

  - id: review-draft
    kind: human
    waiting_for: input-needed

  - id: publish
    kind: effect
    do: open-pr
```
:::

## Run a gated release check

**Use when** you prepare a release. Code builds and verifies. An agent drafts the notes. A person signs off before the release pull request opens.

**Code checks:** The build output and the changelog format, before the sign-off.

```text
[command build] -> [verify] -> [agent release notes]
  -> [verify] -> (human signs off) -> [effect open-pr]
```

Each `verify` step runs the same `verify.test` command from the base commit. Make that command cover both the build output and the changelog format. A failed check stops the run before the sign-off.

::: details Complete file
```yaml
steps:
  - id: build
    kind: command
    scope: ["dist/**"]
    run: "make release-build"

  - id: check-build
    kind: verify

  - id: notes
    kind: agent
    engine: <engine>
    prompt: "Write release notes in CHANGELOG.md from the commit history since the last release."
    outputs: [change]
    scope: ["CHANGELOG.md"]

  - id: check-notes
    kind: verify

  - id: sign-off
    kind: human
    waiting_for: input-needed

  - id: release
    kind: effect
    do: open-pr
```
:::

## Audit and report

**Use when** you run a read-mostly audit, such as a dependency or configuration scan. A command collects the findings, an agent summarizes them, and the pull request carries the report. There is no wait in the workflow, because the review happens on the pull request.

**Code checks:** The format of the summary. A person reviews the report on the pull request.

```text
[command scan] -> [agent summarize] -> [verify] -> [effect open-pr]
```

::: details Complete file
```yaml
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

  - id: publish
    kind: effect
    do: open-pr
```
:::

## Next steps

- To design a workflow for another kind of work, read [Design a workflow](/guide/how-to/design-a-workflow).
- To learn each field, read [Write a workflow](/guide/how-to/write-a-workflow).
- For the exact syntax of `until`, read [Gate expressions](/reference/gates).
