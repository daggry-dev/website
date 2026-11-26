# From a labelled issue to a merged pull request

You should not need a terminal to put a team of agents on a piece of work, or to tell them they got it wrong.
With Daggry you label an issue, talk to the team on the issue and the pull request, and merge a change that code has checked.
Read this page to see the whole flow once. It uses the team and the workflow that Daggry ships, so there is nothing to write first.

The short version: you label an issue, and a planner turns it into a plan you approve. A developer builds it, proof first, and code checks every step. You review the pull request, and whatever you say goes back to the team until you say yes.

The example is software on GitHub. The files are illustrative.

<TeamFlow />

The diagram shows the flow in three lanes: what you do, what the three personas do, and what code does. The last column names the records each stage seals in the evidence trail.

## Start: label the issue

Write the issue the way you always do, then add the label `factory`. The issue is the objective of the run: Daggry seals its title and body, and every persona reads them.

The label works because the tenant config says so, in one trigger. A label starts a run only when an approver applies it, and an issue has one run at a time.

```yaml
approvers: [4411, 5207]
projects:
  example/shop-web:
    triggers:
      factory_label:
        on: issue-labeled
        label: factory
        workflow: idea-to-pr
```

**In the trail:** the run lock, which pins the workflow and the personas by digest, and the work item, which holds the objective.

## Talk: one thread, in your own words

The run and you share one conversation: the issue, then the pull request. You never have to wait for a prompt, and you never need a keyword.

<IssueThread />

The diagram shows the thread and what each comment becomes in the trail. The planner asks a question, you answer, you add a thought while the agent works, and you approve with a thumbs-up.

- **The team asks when it needs to.** The `planner` persona reads the issue. If something is unclear, it asks on the issue and waits for your answer.
- **You can speak at any time.** Every comment from a person is sealed as input and reaches the persona that works next.
- **A yes is a thumbs-up, an approving review or plain words.** When Daggry reads words, it replies with what it understood, and it never continues on a guess.
- **Anything else sends the work back.** Reply to the plan with a correction, and the planner revises it and asks again.

Only an approver can approve. Other people with write access are heard but cannot approve, and everyone else is ignored. See [Comments and approvals](/reference/conversation).

## Build: proof first, then the work

Once you approve the plan, the run works on its own, in a loop that repeats until every criterion of the plan is covered:

1. The `developer` persona writes a test for every criterion. Daggry shows that the tests fail before the work, then freezes them.
2. The `developer` persona makes the tests pass. It cannot change a frozen test.
3. Your validators run on a clean copy, and the judges decide. While a test still fails, the developer gets what is left and tries again.

An agent never marks its own work: only the validators and the judges decide whether a step passes. If the developer believes a frozen test is wrong, it asks you, and your yes opens that one file once.

**In the trail:** the frozen proofs, then for each iteration the change, a measurement for each validator and a verdict for each judge.

## Finish: review, fix, merge

Daggry opens the pull request, with the criteria as a checklist and a link to the trail. A `reviewer` persona reads the change and posts its findings as review comments. They are advice, for the developer and for you.

Then it is your turn. One rule covers every case: **a yes continues, and anything else goes back to the team.**

| What happens | What the run does |
|---|---|
| You request changes, with comments on lines | The comments are sealed as input. The developer fixes them, code checks again, and Daggry asks you again. |
| You say the approach is wrong | The planner revises the plan. A changed plan needs your yes again, because your approval was bound to the old one. |
| The loop ran out before every criterion was covered | Daggry asks you and says what is unfinished. Your reply sends the team round again. |
| You approve | Daggry brings the branch up to date, runs your validators on the result, waits for the repository's own checks and merges. |
| The merge fails: a conflict, or a failing check | The reason goes back to the team as input, with no person needed, and Daggry asks you again when it is fixed. |

A run that waits for you reminds the thread after 2 days and stops after 14.

**In the trail:** each comment as input, each fix as a change with its measurements and verdicts, your approval bound to the final change, and the merge.

::: details The workflow behind this page
This is `idea-to-pr`, the workflow Daggry ships. It has seven entries and names three personas. `of` says where a reply sends the run back to.

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
  - id: build
    loop:
      until: verdict.all_covered
      max: 5
      steps:
        - id: proof
          kind: agent
          persona: developer
          outputs: [change]
          freeze: ["tests/**"]
          scope: ["tests/**"]
        - id: work
          kind: agent
          persona: developer
          outputs: [change]
          scope: anywhere
        - id: check
          kind: verify
          validators: [project]
          judges: [coverage, no_regression]
  - id: open
    kind: effect
    do: open-pr
  - id: review
    kind: agent
    persona: reviewer
    outputs: [input]
    scope: nothing
  - id: approve-change
    kind: human
    of: plan
  - id: merge
    kind: effect
    do: merge-pr
```
:::

::: warning Limits
The text of an issue, a review comment or an edit is untrusted input, and it can mislead an agent. An agent's runner can reach the network. What protects you is that only an approver can approve, only code decides what passes and merges, and no agent can change its validators. See [Why you can trust a run](/guide/concepts/trust).
:::

To send the same team on other work, or to let small changes merge without you, see [Send the team on a mission](/guide/how-to/autonomy).

Related:

- [Comments and approvals](/reference/conversation)
- [Workflow file reference](/reference/workflow-schema)
- [Set up a tenant](/guide/how-to/set-up-a-tenant)
