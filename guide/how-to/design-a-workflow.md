# Design a workflow

If you write a workflow file first and think later, you end up with steps that nothing checks. Design on paper first: decide what passes between steps, what code can check, and where you decide. This page gives you six decisions in order and ends with a worked example that is not software delivery.

Before you start, pick one kind of work that you repeat, and one finished example of it. You must be able to say what a good result looks like. If you cannot, the workflow has nothing to check.

## The method in one list

Each decision narrows the next.

1. List what passes from step to step.
2. Split what code can check from what you approve.
3. Pick a step kind for each piece of work.
4. Choose the gate and the loop limit.
5. Set what each step may write.
6. Place the human waits.

Then write the file with [Write a workflow](/guide/how-to/write-a-workflow). The agent never changes the file you design. See [Work graphs](/guide/concepts/workflows).

## 1. List what passes from step to step

Write each handover as a sentence: "The request becomes a list of items." "Each item becomes a file." "The files become a pull request." Then name the artifact that crosses it.

- A list of things to do is a `plan`. A loop can walk its criteria.
- Files in the repository are a `change`.
- A decision by a person is an `approval`, sealed when someone runs `daggry approve`.

Stop when the last handover is something you can accept or reject. For most work that is a pull request.

## 2. Split what code can check from what you approve

For each handover, ask whether a script can say yes or no. A script can check that a file exists, a count matches, every link resolves, a field is present or a build passes. A script cannot say whether prose reads well or a plan is the right plan.

- If code can decide it, put it in your `verify.test` command. A gate can read the result.
- If only a person can decide it, make it a `human` step.
- If an agent can do it but nothing can check it, keep it small and put a person after it.

Gates read only facts that code computed, never what an agent claims. So every pass or fail that moves the run must come from a check you wrote. Write the check as a script in the repository. The `verify` step runs it from the base commit, so no step can weaken it. See [Project config](/reference/project-config#the-profile).

## 3. Pick a step kind for each piece of work

Use an `agent` step for judgment or writing, and a `command` step for a fixed script such as a scan or a build. Use `verify` to run your check on the sealed result, `human` for a decision by a person, and `effect` with `do: open-pr` to open the pull request.

Put the judgment in an `agent` step and the checking in `verify`. Do not ask an agent to check its own work.

## 4. Choose the gate and the loop limit

Use a loop when the same step runs once for each item in a list. The list is the `criteria` of a sealed `plan`. The workflow therefore starts with an `agent` step that writes the plan, and a `human` step follows to approve it. If the work has no list, skip the loop: one agent step followed by `verify` is a complete workflow.

Set the loop keys as follows.

- `over` is `plan`.
- `until` is `verdict.all_covered` when each item must have a passing check.
- `max` is the most items you expect, plus room for repeats. It limits the whole loop, not each item.
- `on_exhausted` is a `human` step if a person can unstick the work, or `fail` if a run that runs out should stop.

A failed `verify` makes the iteration red, and the same item repeats. Each try spends one iteration of `max`, so a stubborn item uses the spare room. When `max` is spent, the run fails or waits at the `human` step you named.

## 5. Set what each step may write

A step's `scope` is the set of paths it may write. Give each step the least it needs. A step that reads and plans gets `nothing`. A step that writes one kind of file gets a glob list such as `["translations/**"]`. Use `anywhere` only when you cannot name the paths. No scope can include a [protected path](/guide/concepts/protection), such as `.daggry/**`.

## 6. Place the human waits

Put a `human` step where a decision changes what happens next, and nowhere else. Each wait stops the run until someone acts.

Wait with `approval` after the plan and before work starts. Wait with `input-needed` after the work and before it leaves the repository, and as the `on_exhausted` target of a loop. An `approval` binds to the sealed `plan`. An `input-needed` binds to the latest sealed `change`, so place it after a step that produces one.

## Worked example: translate documentation

The work: translate the pages named in an issue into Danish. A person owns the tone, and code can check structure. This example and its file are illustrative, and `engine: <engine>` names the coding-agent engine a step uses.

The handovers are three. The issue becomes a list of pages, which is a `plan`. Each page becomes a translated file, which is a `change`. All the files become a pull request.

Code and people split the questions as follows.

- A person decides whether the list of pages is right, at the plan.
- Code decides whether each translated file exists, has the same headings and links as the source, and uses the approved glossary terms.
- A person decides whether it reads well in Danish, before the pull request.

The check is a script, `scripts/check-translation.sh`, named in `verify.test`. It reports one passing test for each translated page, named with the page's criterion id. The exact lines it prints are in the [`libtest-lines` contract](/reference/project-config#libtest-lines).

The loop walks the plan. One `agent` step translates the current page and one `verify` step runs the check. The gate is `verdict.all_covered`. If an issue names at most 12 pages, `max: 16` leaves room for four repeats. The plan step writes nothing, and the translate step writes only `translations/da/**`.

::: details The complete file
```yaml
steps:
  - id: plan
    kind: agent
    engine: <engine>
    prompt: "Read the issue. Write a plan with one criterion for each page to translate."
    outputs: [plan]
    scope: nothing

  - id: approve-plan
    kind: human
    waiting_for: approval

  - id: translate
    loop:
      over: plan
      as: criterion
      until: verdict.all_covered
      max: 16
      on_exhausted: stuck
      steps:
        - id: translate-page
          kind: agent
          engine: <engine>
          prompt: "Translate the page for the current criterion into Danish. Keep headings and links. Use the glossary in glossary/da.md."
          outputs: [change]
          scope: ["translations/da/**"]
        - id: check-page
          kind: verify

  - id: stuck
    kind: human
    waiting_for: input-needed

  - id: review
    kind: human
    waiting_for: input-needed

  - id: publish
    kind: effect
    do: open-pr
```
:::

`stuck` runs only when the loop runs out. `review` is on the normal path, so the run always waits there before the pull request.

## Check your design

Before you write the file, answer each question.

- Can you name the artifact at every handover?
- Does a script check every pass or fail that moves the run?
- Is every `max` above the number of items you expect?
- Does every step have the smallest scope that works?
- Do you decide at the points where code cannot?

## Next steps

- To write the file, read [Write a workflow](/guide/how-to/write-a-workflow).
- To compare your design with ready-made files, read [Workflow patterns](/guide/how-to/workflow-patterns).
