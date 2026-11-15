# Design a workflow

This page shows you how to turn a kind of work into a workflow graph, before you write any YAML. It is for anyone who wants Daggry to do work that the [workflow patterns](/guide/how-to/workflow-patterns) do not cover. The method has six decisions and ends with a worked example that is not software delivery.

The example is illustrative. It is valid against the [workflow schema](/reference/workflow-schema), and `engine: <engine>` names the coding-agent engine a step uses.

## The method in one list

Make these decisions in order. Each one narrows the next.

1. List the handovers.
2. Split what code can check from what a person approves.
3. Pick a step kind for each piece of work.
4. Choose the gate and the loop bounds.
5. Set the scope of each step.
6. Place the human waits.

Then write the file with [Write a workflow](/guide/how-to/write-a-workflow).

## Before you start

Pick one kind of work that you repeat, and one finished example of it. You need to be able to say what a good result looks like. If you cannot, the workflow has nothing to check.

Daggry runs each workflow as a fixed graph. You decide the graph, and the run decides how many iterations, which iterations repeat and when it waits. An agent never changes the graph. See [Work graphs](/guide/concepts/workflows).

## 1. List the handovers

A handover is a point where one piece of work gives something to the next. Write them as a sentence each: "The request becomes a list of items." "Each item becomes a file." "The files become a pull request."

For each handover, name the artifact that crosses it:

- If it is a list of things to do, it is a `plan`. A loop can walk its criteria.
- If it is files in the repository, it is a `change`.
- If it is a decision by a person, it is an `approval`, sealed when someone runs `daggry approve`.

Stop listing when the last handover is something you can accept or reject. For most work that is a pull request.

## 2. Split what code can check from what a person approves

For each handover, ask: can a script say yes or no? A script can check a file exists, a count matches, every link resolves, a field is present or a build passes. A script cannot say whether prose reads well or a plan is the right plan.

| If | Then |
|---|---|
| Code can decide it | Make it a check in your `verify.test` command. A gate can read the result. |
| Only a person can decide it | Make it a `human` step. |
| An agent can do it but nothing can check it | Keep it small and put a person after it. |

Gates read only `derived` facts, which code computed. A gate never reads what an agent claims, so every pass or fail that moves the run must come from a check you wrote. See [Gate expressions](/reference/gates).

Write the check as a script in the repository. The `verify` step runs it from the base commit, so no step can weaken it. See [Project profile](/reference/profile).

## 3. Pick a step kind for each piece of work

| The work is | Use |
|---|---|
| Judgment or writing | `agent` |
| A fixed script, such as a scan or a build | `command` |
| Running your check on the sealed result | `verify` |
| A decision by a person | `human` |
| Opening the pull request | `effect` with `do: open-pr` |

Put the judgment in an `agent` step and the checking in `verify`. Do not ask an agent to check its own work.

## 4. Choose the gate and the loop bounds

Use a loop when the same step runs once for each item in a list. The list is the `criteria` of a sealed `plan`, so the first step of such a workflow is an `agent` step that writes the plan, and a `human` step follows to approve it.

Set the loop keys with these rules.

| Key | How to choose it |
|---|---|
| `over` | `plan`. |
| `until` | `verdict.all_covered` when each item must have a passing check. |
| `max` | The most items you expect, plus headroom for repeats. It bounds the whole loop, not each item. |
| `on_exhausted` | A `human` step if a person can unstick the work. `fail` if a run that runs out should simply stop. |

An iteration is red when its `verify` step fails. The same item repeats. Daggry spends one iteration of `max` on each attempt, so a stubborn item uses the headroom. When `max` is spent, the run fails or waits at the `human` step you named.

If the work has no list, do not use a loop. A single agent step followed by `verify` is a complete graph.

## 5. Set the scope of each step

A step's `scope` is the set of paths it may write. Give each step the least it needs.

| The step | Scope |
|---|---|
| Reads and plans | `nothing` |
| Writes one kind of file | A glob list, such as `["translations/**"]` |
| Runs a script that writes output | A glob list for that output |
| Anything else | Avoid `anywhere`. Use it only when you cannot name the paths. |

No scope can include a [protected path](/guide/concepts/protection), such as `.daggry/**`.

## 6. Place the human waits

Put a `human` step where a decision changes what happens next, and nowhere else. Each wait stops the run until someone acts.

| Place a wait | `waiting_for` |
|---|---|
| After the plan, before work starts | `approval` |
| After the work, before it leaves the repository | `input-needed` |
| As the `on_exhausted` target of a loop | `input-needed` |

An `approval` binds to the sealed `plan`. An `input-needed` binds to the latest sealed `change`, so place it after a step that produces one.

## Worked example: translate documentation

The work: translate the pages named in an issue into Danish. A person owns the tone. Code can check structure.

### Handovers

1. The issue becomes a list of pages to translate. That is a `plan`.
2. Each page becomes a translated file. That is a `change`.
3. All translated files become a pull request.

### Code checks and human approvals

| Question | Who decides |
|---|---|
| Is the list of pages right? | A person, at the plan. |
| Does each translated file exist? | Code. |
| Does it have the same headings and the same links as the source? | Code. |
| Does it use the approved glossary terms? | Code. |
| Does it read well in Danish? | A person, before the pull request. |

The check is a script, `scripts/check-translation.sh`, named in `verify.test` in the profile. It reports one passing test for each translated page, and names the test with the page's criterion id. The exact lines the command prints, with a shell example, are in the [output contract](/reference/profile#output-contract).

### Step kinds, gate and bounds

- A `plan` step with an `agent` lists the pages, one criterion each.
- A loop over the plan has one `agent` step to translate the current page and one `verify` step to run the check.
- The gate is `verdict.all_covered`: every page has a passing check.
- Assume an issue names at most 12 pages. Then `max: 16` leaves room for four repeats.
- When `max` is spent, a person decides at `stuck`.

### Scope and waits

- The plan step has scope `nothing`.
- The translate step writes only `translations/da/**`.
- The waits are an approval after the plan, a review of the files after the loop, and `stuck` for exhaustion.

### The file

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

`stuck` runs only when the loop runs out, because a loop's `on_exhausted` target is skipped in normal flow. `review` is on the normal path, so the run always waits there before the pull request.

## Check your design

Before you write the file, answer each question.

- Can you name the artifact at every handover?
- Does a script check every pass or fail that moves the run?
- Is every `max` above the number of items you expect?
- Does every step have the smallest scope that works?
- Does a person decide at the points where code cannot?

## Next steps

- To write the file, read [Write a workflow](/guide/how-to/write-a-workflow).
- To compare your design with ready-made graphs, read [Workflow patterns](/guide/how-to/workflow-patterns).
