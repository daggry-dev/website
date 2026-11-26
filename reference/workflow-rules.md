# Workflow rules

*Reference*

Daggry reads a workflow strictly and refuses a file it cannot fully understand, before a run starts. This page lists where a workflow comes from, the YAML it accepts, every load error, and the keys and step kinds you can add. Read it when a run is refused, or when you write a tool that produces workflows. For the keys of the file, see [Workflow file](/reference/workflow-schema).

A refused workflow starts no run, so it seals nothing. An accepted one is pinned: the run's first record, the run lock, holds the digest of the workflow text, and the trail shows which file every step followed.

## Where a workflow comes from

A run takes its workflow from one of two places. The table lists them.

| Source | How |
|---|---|
| The tenant's list | The `workflows` section of the [Tenant config](/reference/tenant-config#workflows) names each workflow the tenant offers, with the workspace, the path and the revision its file is read from. |
| A file | `daggry run --workflow <file>` reads the file from the machine that starts the run. See [CLI](/reference/cli). |

The control plane keeps the text outside every runner. A project never assigns a workflow to itself: the tenant config decides which workflows run on which workspace.

## YAML subset

The loader reads a strict subset of YAML, so a file means one thing only. The project config and the tenant config use the same subset. The table lists what the loader refuses.

| Construct | Result |
|---|---|
| Anchor `&name`, alias `*name` | Refused. |
| Tag `!tag` or `!!tag` | Refused. |
| Merge key `<<:` | Refused. |
| Duplicate mapping key | Refused. |
| The same characters inside a quoted or block scalar | Data. They load. |

Every object is closed. A key that [Workflow file](/reference/workflow-schema) does not define is refused, unless it is an extension key.

## Load errors

The loader reports the first refusal, in the order of the table. The error returns as `workflow: <message>`.

| Stage | Refusal | Message |
|---|---|---|
| 1 | The text is not YAML, or has a duplicate key. | A YAML error. |
| 2 | An anchor, alias, tag or merge key. | ``the strict YAML subset refuses <construct>`` |
| 3 | The file does not fit the [schema](/schemas/workflow.json). | ``workflow schema: <message> (at `<location>`)``. The location is a JSON pointer, such as `/steps/0/kind`. |
| 4 | A loop's `until` is not a gate expression. | ``step `<step>`: until: <source>`` |
| 5 | Two entries or steps carry one id. | ``step id `<id>` is used twice`` |
| 6 | The `of` of a `human` step names no step or loop before it. | ``step `<step>`: of `<target>` is not an earlier step or loop`` |
| 7 | An `until` reads a field a gate cannot read. | ``step `<step>`: gate reads `<field>`, whose class is <class>; only derived fields are readable`` |

When the run starts, Daggry also resolves every name the workflow uses: each persona, validator, judge and area, and the effect. A name that matches nothing refuses the run.

::: details Examples the loader refuses
The table is a short, representative set.

| Input | Refusal |
|---|---|
| `steps: [` | Not YAML. |
| `steps:` followed by `- &a {id: v, kind: human, of: plan}` | An anchor. |
| No `format` key, or `format: daggry/workflow@2` | Schema at `/format`. |
| `kind: parallel` | Schema at `/steps/0/kind`. |
| An `agent` step with `prompt: Write the plan.` | Schema at `/steps/0`. A step names a persona and holds no instructions. |
| An `agent` step with no `persona` | Schema at `/steps/0`. |
| `owner: platform-team` at the top level | Schema. A key without a namespace. |
| A loop with `max: 0` | Schema at `/steps/0/loop/max`. |
| A `verify` step with `run: [sh, check.sh]`, or with `validators: []` | Schema at `/steps/0`. |
| `validators: [daggry]` | Schema at `/steps/0/validators/0`. A reserved name. |
| `scope: everywhere` | Schema at `/steps/0/scope`. |
| `scope: ["area:Web App"]` | Schema at `/steps/0/scope`. Not an area name. |
| Two steps with `id: v` | Duplicate id `v`. |
| `of: plan` with no `plan` step before it | The `of` target `plan`. |
| `until: inputs.plan.criteria == 'x'` | Gate. `criteria` is claimed. |
| `until: explode()` | Expression. An unknown function. |
:::

::: details What the loader does not check
Three rules fail later than load.

| Not checked at load | What happens |
|---|---|
| That `outputs` names real kinds. | An unknown output is never handed in, and the step fails. |
| That `freeze` and `scope` globs compile. | A bad glob fails when the step ends. |
| A fact name after `verdict.` | A name no judge emits never holds, so the loop runs to its limit. |
:::

## Extension keys in a workflow

You can add keys of your own to a workflow, for example to record an owner or a cost centre. An extension key has the form `<namespace>/<key>`, and Daggry ignores its value and keeps it.

```yaml
format: daggry/workflow@1
acme/owner: platform-team
steps:
  - id: render
    kind: command
    run: [sh, scripts/render.sh]
    scope: anywhere
    acme/cost-centre: build
```

An extension key can sit at the top level, on a step and on a `loop` object. It never widens a scope, raises a loop's `max` or changes the meaning of a key that Daggry defines. For the full rules, see [Extension keys](/reference/open-formats#extension-keys).

## Extension step kinds

The five step kinds cover most work. A tenant that needs one more registers it in `extensions.step_kinds` of the [Tenant config](/reference/tenant-config#extensions), with a name of the form `<namespace>/<name>`, what runs it and a JSON Schema for its keys.

```yaml
- id: scan
  kind: acme/scan
  level: strict
```

A step of an extension kind takes `id`, `kind` and the keys its schema allows. A kind that is neither one of the five nor registered is refused at `/steps/<n>/kind`. A loop is not a step kind, and no extension kind is a loop.

## Next steps

The list names the pages to read next.

- For the keys of the file, see [Workflow file](/reference/workflow-schema).
- For the grammar of `until` and its errors, see [Gate expressions](/reference/gates).
- For starting a run, see [CLI](/reference/cli).
