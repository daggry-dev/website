# Send the team on a mission

A team that can only do one thing is a script. You want the same team to fix a bug today, hunt for one tonight and check a release on Friday.
With Daggry you change the mission, not the team: a trigger says when work starts and what the objective is, and you choose how much a person decides.
Read this page when the default team works on your issues and you want it to do more, or to need you less.

The files on this page are illustrative.

<Missions />

The diagram shows one team on four missions. Each mission has its own trigger and objective, the team and the checks stay the same, and every run ends in the same kind of evidence trail.

## Four missions, one team

A mission is a trigger with an objective. The table shows four, all for the default team.

| Mission | What starts it | The objective | Who decides |
|---|---|---|---|
| Build what an issue asks | The label `factory` on an issue | The issue | You approve the plan and the pull request. |
| Hunt for a bug every night | A schedule | "Find and fix one defect in the app area. Prove it with a failing test first." | You approve the plan and the pull request, on the issue Daggry opens. |
| Keep the documentation current | A schedule | "Bring the pages under docs/ in line with the code. Change nothing else." | Nobody, while the change stays small and inside `docs`. |
| Check a release | `daggry run --objective "Check that release 2.4 is ready to ship"` | The text you give | You read the result. |

```yaml
projects:
  example/shop-web:
    triggers:
      factory_label:
        on: issue-labeled
        label: factory
        workflow: idea-to-pr
      nightly_hunt:
        on: schedule
        cron: "0 2 * * *"
        objective: Find and fix one defect in the app area. Prove it with a failing test first.
        workflow: idea-to-pr
      docs_refresh:
        on: schedule
        cron: "0 3 * * 1"
        objective: Bring the pages under docs/ in line with the code. Change nothing else.
        workflow: docs-refresh
```

A scheduled run has no issue to start from, so Daggry opens one with the objective as its text. The run reports there, and you can reply there. A standing objective is often vague, and that is the planner's job: it turns "find one defect" into a plan with checkable criteria, exactly as it does for an issue you wrote.

**In the trail:** every run seals its objective first, with the trigger that started it. You can always see what a run was asked to do, and whether a person or a schedule asked.

## Choose how much you decide

Approving everything by hand does not scale, and approving nothing is how a bad change reaches `main`. Pick a level for each mission.

<AutonomyLevels />

The diagram shows three levels: you approve the plan and the merge, you approve the plan only, or no person is needed below a threshold that code checks.

A level is the checkpoints a workflow has. Remove the checkpoint on the pull request, and code decides the merge. Remove both, and the mission runs without you. The threshold for a merge without a person is code, never an instruction to an agent:

```yaml
- id: merge
  kind: effect
  do: merge-pr
  auto_when: run.within.docs && run.changed_lines <= 200 && run.verdicts_failed == 0 && run.protected_touched == 0
```

This merge runs without you only when all four hold: every changed path is inside the `docs` area, the change is at most 200 lines, every verdict passed, and no step tried to touch a protected path. Otherwise Daggry asks you on the pull request.

**In the trail:** when the expression holds, Daggry seals it with the value of each fact it read, before the merge. You can always see why a change merged without a person. For the facts, see [Run facts](/reference/gates#run-facts).

::: details A workflow for the documentation mission
`docs-refresh` is the shipped workflow with both checkpoints removed and a threshold on the merge.

```yaml
format: daggry/workflow@1
steps:
  - id: plan
    kind: agent
    persona: planner
    outputs: [plan]
    scope: nothing
  - id: build
    loop:
      until: verdict.all_covered
      max: 3
      steps:
        - id: work
          kind: agent
          persona: developer
          outputs: [change]
          scope: ["area:docs"]
        - id: check
          kind: verify
          validators: [project]
          judges: [coverage]
  - id: open
    kind: effect
    do: open-pr
  - id: merge
    kind: effect
    do: merge-pr
    auto_when: run.within.docs && run.changed_lines <= 200 && run.verdicts_failed == 0 && run.protected_touched == 0
```
:::

## The tenant has the last word

A workflow can ask for less of you. It cannot overrule your team. With `effect` in `agents.approval.require` of the tenant config, a person approves before every effect, whatever a workflow says. See [agents](/reference/tenant-config#agents).

Know the limit too: a threshold is only as good as the validators behind it. `run.verdicts_failed == 0` means your checks passed, not that the change is right. Start with both checkpoints, read a few trails, and remove one when the validators have earned it.

Related:

- [From a labelled issue to a merged pull request](/guide/how-to/issue-to-pr)
- [Gate expressions](/reference/gates)
- [Why you can trust a run](/guide/concepts/trust)
