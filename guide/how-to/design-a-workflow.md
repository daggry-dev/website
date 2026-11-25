# Design a workflow

If you write a workflow file first and think later, you end up with steps that nothing checks. This page gives you six decisions to make on paper first: what code checks, what you approve and what each step can touch. Read it before you write a workflow for a new kind of work.

Before you start, pick one kind of work that you repeat, and one finished example of it. You must be able to say what a good result looks like. Then decide, in this order:

1. List what each step hands to the next.
2. Split what code can check from what you approve.
3. Pick a step kind for each piece of work.
4. Choose the gate and the loop limit.
5. Set what each step can write.
6. Place the approvals.

Then write the file with [Write a workflow](/guide/how-to/write-a-workflow).

## Decide what code checks

A step nothing checks is a step you must review by hand. So start with the outputs, and ask of each one who can check it.

Write each output as a sentence: "The request becomes a list of items." "Each item becomes a file." A list of things to do is a `plan`. A difference made to the workspace is a `change`. Stop when the last output is something you can accept or reject, such as a pull request.

Then ask whether a script can say yes or no. A script can check that a file exists, a count matches or every link resolves. A script cannot say whether prose reads well.

- If a script can decide it, make it a validator. See [Add a validator](/guide/how-to/add-a-validator).
- If only a person can decide it, make it an approval.
- If an agent can do it but nothing can check it, keep it small and put an approval after it.

## Choose steps, limits and scope

Each choice here narrows what an agent can do wrong. The table gives a rule of thumb for decisions 3 to 5.

| Decision | Rule of thumb |
|---|---|
| Step kind | `agent` for writing or judgement. `command` for a fixed script. `verify` to run validators. `human` for an approval. `effect` to deliver the result. |
| Who checks | Put the work in an `agent` step and the checking in a `verify` step. An agent never checks its own work. |
| Loop or not | Use a loop when the same steps run once for each criterion. With no list, one `agent` step and one `verify` step are a complete workflow. |
| Loop limit | Set `max` to the most criteria you expect, plus room for repeats. A failed item repeats and spends one iteration. |
| At the limit | Set `on_exhausted` to a `human` step if a person can unstick the work, or to `fail`. |
| Scope | Give each step the least it needs: `nothing` for a step that only reads, a glob list such as `["translations/**"]` for one that writes. |

For the loop keys, see [Add a loop](/guide/how-to/add-a-loop).

## Place the approvals

Every approval stops the run, so place few. Put one where your decision changes what happens next.

- After the plan and before the work starts, use `waiting_for: approval`. You approve the plan.
- After the work and before it is delivered, use `waiting_for: input-needed`. You approve the latest change.
- At a loop's limit, name a `human` step in `on_exhausted`.

## Worked example: translate documentation

Here are the six decisions made for one real job: translate the pages named in a work item into Danish. The pages live in a Git repository, so the result is delivered as a pull request. The example is illustrative.

1. **Outputs.** The work item becomes a list of pages, a `plan`. Each page becomes a translated file, a `change`. The files become a pull request.
2. **Code or person.** A script checks that each translated file exists, keeps the headings and links of its source and uses the glossary terms. A person decides whether the list of pages is right and whether the text reads well in Danish.
3. **Step kinds.** One `agent` step plans. One `agent` step translates a page. One `verify` step runs the project's main validator, `scripts/check-translation.sh`.
4. **Gate and limit.** The loop ends when every page has passed. A work item names at most 12 pages, so `max: 16` leaves room for four repeats.
5. **Scope.** The plan step writes nothing. The translate step writes only `translations/da/**`.
6. **Approvals.** One after the plan, one before the pull request, and one if the loop reaches its limit.

::: details The complete file
```yaml
format: daggry/workflow@1
steps:
  - id: plan
    kind: agent
    engine: <engine>
    prompt: "Read the work item. Write a plan with one criterion for each page to translate."
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
          validators: [project]
          judges: [coverage]

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

`stuck` runs only when the loop reaches its limit. `review` is on the normal path, so the run always stops there before the pull request.
:::

Related:

- [Write a workflow](/guide/how-to/write-a-workflow)
- [Add a loop](/guide/how-to/add-a-loop)
- [Workflow examples](/guide/how-to/workflow-patterns)
