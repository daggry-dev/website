# Judges

*Reference*

A judge turns the evidence trail of a run into a verdict. Every `verify` step has a default judge, so most steps name none. Name a judge in `judges` to add a condition, such as "every criterion is covered", or to write your own. This page is for anyone who writes workflows or project configs, and for anyone who builds a judge. For the validators that produce measurements, see [Validators](/reference/validators).

Validators measure. Judges judge. A gate decides when to stop.

The examples on this page are illustrative.

## Name a judge in a step

Add `judges` to a `verify` step. The default judge always runs, and the judges you name run after it, in the order you list them.

```yaml
- id: check
  kind: verify
  validators: [project]
  judges: [coverage, no_regression, plan-size]
```

A judge name is `coverage`, `no_regression` or the name of a judge you declare. A judge name resolves like a validator name, with the same reserved names. See [Referring to a validator](/reference/validators#referring-to-a-validator).

## The model

A `verify` step runs its validators and seals their measurements. It then gives the evidence trail to the default judge and to each judge in `judges`, and Daggry seals one verdict for each. The step passes when every verdict passes. Inside a loop, a step that does not pass is red. See [verify](/reference/workflow-schema#verify).

Each part has one job.

- A **validator** measures and never produces a verdict.
- A **judge** decides and never touches the workspace. It returns an outcome, findings and facts. Daggry seals the verdict, and a judge never produces a measurement.
- A **gate** reads verdict facts and decides whether a loop ends. It runs nothing and judges nothing.

### What every judge is given

Every judge, of every kind, is given the same thing: the evidence trail of the run so far, as sealed. That is every sealed record, with its kind, id, digest, parents and fields, and with the class of each field, so a judge can tell `derived` from `claimed`. The trail holds the plan, every measurement of the run, including the step's own and the baseline's, earlier verdicts, and so on.

- The verdicts that this step's judges seal are not in the trail, so the judges of one step do not depend on each other's order.
- A judge never gets the workspace, the network, the clock or the signing key.

What differs between kinds is who wrote the judge and how it decides, not what it can see. A judge sees the whole trail, so a gate can still read only derived and judged facts. See [Fact classes](/reference/gates#fact-classes).

## The four kinds of judge

<JudgeKinds />

The diagram shows the four kinds side by side: what each decides and who vouches for it. The table lists the kinds, in the order you meet them. Only the default judge needs no name.

| Kind | Named in | Decides | Vouched for by |
|---|---|---|---|
| Default judge | Nowhere. Every `verify` step has it. | Every measurement passes and the thresholds hold. | Daggry |
| Named judge | `judges` of a step: `coverage` or `no_regression`. | One fixed condition. See [Named judges](#named-judges). | Daggry |
| Custom judge | `judges` of a step. Declared in `judges` of `.daggry/project.yaml`, or in `judges.scripts` of the tenant config. | Whatever your command decides. | Your manifest, read from the baseline |
| Rubric judge | `judges` of a step. Declared in `judges` of `.daggry/project.yaml`. | One criterion, under a rubric. | A person, who approves the rubric |

## Default judge

The verdict is `pass` when every measurement passes and the `verification.thresholds` of the project config hold. Otherwise it is `fail`, or `error` when an input is missing or malformed. It emits one finding for each validator: `pass` when the measurement's outcome is `pass`, else `fail`. See [verification](/reference/project-config#verification).

## Named judges

A named judge ships with Daggry. You turn one on by name in `judges`. The table lists them.

| Name | Passes when |
|---|---|
| `coverage` | A passing finding of the canonical validator covers every criterion of the plan. It emits one finding for each criterion, in plan order. |
| `no_regression` | No finding of the baseline measurement disappeared or became skipped. It makes the step measure the baseline too, and emits one `fail` finding for each id that was removed or newly skipped. |

Daggry applies one more named judge itself, `baseline_proof`, for a proof step in a loop. It passes when a criterion's proof fails on the baseline, which shows the proof says something about the work. You cannot name it in `judges`. See [Red then green](/reference/workflow-schema#red-then-green).

## Facts a judge emits

A gate reads the facts of the verdicts a `verify` step seals, as `verdict.<fact>`. The table lists every fact and the judge that emits it.

| Fact | Type | Emitted by | Meaning |
|---|---|---|---|
| `findings_fail`, `findings_error`, `findings_skip` | integer | Default judge | The findings with that outcome in a measurement. |
| `thresholds_missed` | integer | Default judge | The thresholds that do not hold. |
| `criteria_covered` | integer | `coverage` | Criteria covered by a passing finding. |
| `criteria_uncovered` | integer | `coverage` | Criteria with no passing finding. |
| `all_covered` | boolean | `coverage` | No criterion is uncovered. |
| `findings_removed` | integer | `no_regression` | Finding ids in the baseline that are absent now. |
| `findings_newly_skipped` | integer | `no_regression` | Finding ids that are skipped now and were not in the baseline. |
| `red` | boolean | `baseline_proof` | The proof failed on the baseline. See [Baseline proof](/reference/conformance#baseline-proof). |
| `rubric_pass` | boolean, class `judged` | Rubric judge | The judge's answer for its criterion. |
| Any name the verdict holds | boolean, integer or string | Custom judge | Class `derived`. |

For the exact rules, see [Verification internals](/reference/conformance#verification-internals). For how a gate reads a fact, see [Verdict facts](/reference/gates#verdict-facts).

## Custom judge

A custom judge is your command. Use one when a rule needs more than the default or the named judges give, such as "the plan has at most 8 criteria". It is deterministic: the same trail gives the same verdict. It runs in the control plane's sandbox with only its own script, read from the baseline.

1. Write the command. Daggry writes the evidence trail to standard input as one JSON object, `{"records": [...]}`, with every sealed record of the run so far. Each record has its `kind`, `id`, `digest`, `parents`, `body` and `classes`, the class of each field of the body.

   ```json
   {"records": [
     {"kind": "evidence/plan@1", "id": "plan-1", "digest": "<digest>", "parents": [],
      "body": {"criteria": [{"id": "AC-1", "text": "An empty name is rejected"}]},
      "classes": {"criteria": "claimed"}}
   ]}
   ```

2. Write a verdict body to standard output: `outcome`, `findings` and `facts`. A fact has a `name` and a `value`, and Daggry marks each `derived`. A fact value is a boolean, an integer or a string. A nonzero exit or a malformed body is an `error` verdict.

   ```js
   // scripts/judge-plan-size.mjs: a plan has at most 8 criteria.
   import { readFileSync } from 'node:fs'
   const { records } = JSON.parse(readFileSync(0, 'utf8'))
   const plan = records.find((r) => r.kind === 'evidence/plan@1')
   const n = plan ? plan.body.criteria.length : 0
   const ok = n >= 1 && n <= 8
   console.log(JSON.stringify({
     outcome: plan ? (ok ? 'pass' : 'fail') : 'error',
     findings: [{ id: 'plan-size', outcome: ok ? 'pass' : 'fail', message: `${n} criteria, at most 8` }],
     facts: [{ name: 'plan_criteria', value: n }],
   }))
   ```

3. Declare it in `judges` in `.daggry/project.yaml`. `run` is an argv command, as for a validator.

   ```yaml
   format: daggry/project@1
   validators:
     review:
       run: [sh, scripts/review.sh]
   verification:
     canonical: review
   judges:
     plan-size:
       run: [node, scripts/judge-plan-size.mjs]
   ```

4. Name it in a `verify` step: `judges: [plan-size]`. A gate can then read `verdict.plan_criteria`.

To share a custom judge across projects, declare it in `judges.scripts` of the [Tenant config](/reference/tenant-config#judges). The declaration pins a source workspace and revision, like `validators.scripts`.

## Rubric judge

A rubric judge is a tightly scoped model. Use one when no command can decide a criterion, such as "the summary reads plainly". It is not an agent grading its own work: it is a different, bounded model, working under a rubric a person approved.

It is given the same trail as every other judge. What limits it is what it may say.

- It judges one criterion.
- The rubric is approved by a person and pinned by its digest.
- The model is pinned.
- It must answer `pass` or `fail`, and it must cite text quoted from the trail.
- Code confirms each citation. A finding that code cannot confirm is advice and opens no gate.
- Its facts have the class `judged`. A gate can read one only once a person approves its rubric.

The trail marks agent-written fields as `claimed`, and the rubric says how to treat them.

Declare it in `judges` with `rubric` and `engine` instead of `run`. `rubric` is the path of the rubric file. `engine` names an engine of the tenant config. `criterion` is optional. The table lists its two forms.

| `criterion` | The judge judges |
|---|---|
| A criterion id, such as `AC-3` | That criterion of the plan. |
| Absent | The current criterion of the enclosing loop over the plan's criteria, a different one in each iteration. Outside such a loop, Daggry refuses the run when it starts. |

A rubric judge with a fixed criterion:

```yaml
format: daggry/project@1
validators:
  review:
    run: [sh, scripts/review.sh]
verification:
  canonical: review
judges:
  plain-language:
    criterion: AC-3
    rubric: rubrics/plain-language.md
    engine: judge-engine
```

A rubric judge with no `criterion`, used inside a loop over the plan's criteria. Each iteration, it judges that iteration's criterion. The step passes only when the `coverage` verdict and the rubric verdict both pass.

```yaml
# .daggry/project.yaml
judges:
  plain-language:
    rubric: rubrics/plain-language.md
    engine: judge-engine
```

```yaml
# The workflow
- id: write-all
  loop:
    over: plan
    as: criterion
    until: verdict.all_covered
    max: 5
    steps:
      - id: write
        kind: agent
        persona: writer
        outputs: [change]
        scope: ["handbook/**"]
      - id: check
        kind: verify
        validators: [project]
        judges: [coverage, plain-language]
```

A rubric judge emits one `judged` fact, `rubric_pass`.

## When a judge's verdict counts

A verdict opens a gate only when Daggry can vouch for the judge. The table lists who does.

| Judge | Counts as evidence when |
|---|---|
| Default and named | Always. Daggry ships them. |
| Custom, in a project | The manifest is read from the baseline, which an agent cannot change, and the files its `run` names are protected paths. |
| Custom, in the tenant | The tenant config holds it, pinned to `source.revision`. |
| Rubric | A person approved the rubric. Until then a gate refuses to read its facts. |

With `trust_project: false` for a workspace, a project's own custom and rubric judges do not count, and the tenant's judges still count. A tenant declares no rubric judge, so none counts on such a workspace. See [When a validator counts as evidence](/reference/validators#when-a-validator-counts-as-evidence).

## Next steps

The list names the pages to read next.

- For the keys of a `verify` step, see [Workflow file](/reference/workflow-schema#verify).
- For declaring a judge, see [Project config](/reference/project-config#judges) and [Tenant config](/reference/tenant-config#judges).
- For the facts a gate can read, see [Gate expressions](/reference/gates#verdict-facts).
- For the validators that feed the judges, see [Validators](/reference/validators).
