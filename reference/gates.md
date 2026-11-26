# Gate expressions

*Reference*

A gate is the expression in a loop's `until`. It decides when the loop ends, and it reads sealed records only, never what an agent says. This page lists what a gate can read, the grammar and the errors. Read it when you write a loop. For where `until` sits, see [Workflow file](/reference/workflow-schema#loop). For the steps, follow [Add a loop](/guide/how-to/add-a-loop).

A gate seals nothing. It reads the verdicts that a `verify` step sealed, so every decision to end a loop can be traced to records in the evidence trail.

<GateRead />

The diagram shows the three classes of field and which of them a gate can read.

The expressions on this page are illustrative. Where an example is refused, the page names the refusal.

## Quick reference

A gate reads `derived` facts: values that code computed from sealed inputs. It reads a `judged` fact only once a person approves the rubric behind it. The loader refuses a read of a `claimed` field, of a field with no class, and of a step that does not exist, before a run starts.

The loader accepts these reads.

```text
verdict.all_covered
verdict.outcome == 'pass'
verdict.criteria_uncovered == 0
inputs.measurement.exit_code == 0
success()
```

The loader refuses these reads.

```text
inputs.plan.criteria == 'x'
verdict.findings == 1
steps.zzz.measurement.exit_code == 0
```

## Contexts

A gate reads from five contexts.

| Context | Reads |
|---|---|
| `inputs` | The artifacts handed to the loop, by kind. |
| `needs` | The artifacts of named previous work, by id. |
| `steps` | The artifacts of a named step. |
| `verdict` | The verdict facts sealed so far. |
| `run` | Facts that code computes from every sealed record of the run. See [Run facts](#run-facts). |

A gate expression can use a name only from these five contexts. `env.HOME` is refused at parse time.

## Read forms

The table lists the four read forms. `<kind>` is the kind's bare name, such as `measurement`, not `evidence/measurement@1`.

| Read | Form | Names after the context | How the loader classifies it |
|---|---|---|---|
| steps | `steps.<step id>.<kind>.<field>` | Exactly 3. | The class of `<field>` in `<kind>`'s schema. `<step id>` must name a step of this workflow, top-level or inside a loop. |
| needs | `needs.<id>.<kind>.<field>` | Exactly 3. | As `steps`, but the id is not checked against the workflow. |
| inputs | `inputs.<kind>.<field>` | 2 or more. | The class of `<field>` in `<kind>`'s schema. Extra names leave the class unchanged. A read with fewer names has no class. |
| verdict | `verdict.<name>` | Exactly 1. | If `<name>` is a property of the verdict schema, that property's class. Otherwise `<name>` is a fact name and takes the class of that fact in the verdict: `derived`, or `judged` for a rubric judge's. |

The loader checks every read in an `until`, in source order, and returns the first refusal. A read that the loader cannot classify is refused, the same as a `claimed` read. This is fail-closed.

A body field that is itself named `meta` is read as `steps.<step id>.<kind>.meta`.

Every envelope `meta` value is `derived`.

## Fact classes

Every field has one of three classes or none.

| Class | Meaning | Gate can read |
|---|---|---|
| `claimed` | An agent wrote it. | No. |
| `derived` | Code computed it from sealed inputs. | Yes. |
| `judged` | The answer of a [rubric judge](/reference/judges#rubric-judge): a bounded model's pass or fail under a rubric a person approved, with citations that code confirmed. | Only once a person approves the rubric. Until then the loader refuses a `judged` read. |
| none | The schema gives the field no `x-fact-class`. | No. |

A schema marks a field's class with the keyword `x-fact-class` on the property.

The class of every field of every kind is in [Fact classes by kind](/reference/kinds#fact-classes-by-kind). Only a top-level field of a record's body is readable. A fact value is a boolean, an integer or a string.

### Verdict facts

A `verdict.<name>` read takes the value from the verdicts sealed for the run, newest first. Each verdict contributes `outcome` (a string) and each of its facts. A newer value of the same name replaces an older one, so `verdict.outcome` is the outcome of the latest verdict. Every fact name and the judge that emits it is in [Facts a judge emits](/reference/judges#facts-a-judge-emits).

`until` does not depend on whether the iteration was green. When it holds at the end of a red iteration, the loop still ends.

### Run facts

An `auto_when` expression decides whether an effect runs with no person. It reads facts about the whole run. The table lists them.

| Fact | Type | Meaning |
|---|---|---|
| `run.changed_files` | integer | The paths the sealed changes of the run changed. |
| `run.changed_lines` | integer | The lines those changes added and removed. |
| `run.within.<area>` | boolean | Every changed path is inside the area of that name in the project config. |
| `run.verdicts_failed` | integer | The verdicts of the latest `verify` step that are not `pass`. |
| `run.protected_touched` | integer | The times Daggry put back a protected or frozen path in this run. |

All are `derived`. When an `auto_when` holds, Daggry seals the expression and the value of each fact it read. See [Autonomy](/reference/workflow-schema#autonomy).

## Grammar

The grammar is small: comparisons, `!`, `&&`, `||`, parentheses and three functions.

```text
expr    = or
or      = and { "||" and }
and     = cmp { "&&" cmp }
cmp     = unary [ ("==" | "!=" | "<" | "<=" | ">" | ">=") unary ]
unary   = "!" unary | primary
primary = "true" | "false" | integer | 'string' | "(" expr ")" | call | field
call    = ("success" | "failure" | "always") "(" ")"
field   = ("inputs" | "needs" | "steps" | "verdict" | "run") { "." name }+
```

::: details Lexical rules, functions and evaluation
**Lexical rules**

The table lists the rule for each element of an expression.

| Element | Rule |
|---|---|
| Whitespace | Ignored between tokens. |
| Operators | `.`, `(`, `)`, `&&`, `||`, `==`, `!=`, `<=`, `>=`, `!`, `<`, `>`. A single `&`, `|` or `=` is a syntax error. |
| String | Single-quoted, with no escape sequences. It runs to the next `'`. Double quotes are not accepted. An unterminated string is a syntax error at the opening quote. |
| Integer | A run of ASCII digits, read as a 64-bit signed integer. No minus sign and no float: `-1` is a syntax error. |
| Name | Starts with an ASCII letter or `_`. Continues with letters, digits, `_` or `-`. So `steps.build-all.exit` is valid. A segment that starts with a digit or `-` cannot be written. |
| Boolean | `true` and `false`. |
| Comparison | Not chainable. `a == b == c` is a syntax error. |
| Field | Needs at least one name after the context. `inputs` alone is a syntax error. |
| Nesting | Parentheses and `!` nest at most 32 deep. |

**Functions**

The grammar has three functions.

| Function | Value |
|---|---|
| `success()` | True when no step before this point failed. |
| `failure()` | True when a step before this point failed. |
| `always()` | True. |

Functions take no arguments. `success(1)` is a syntax error. Any other call is an unknown function. A bare `success` without parentheses is an unknown context.

**Evaluation rules**

The table lists how an expression is evaluated.

| Rule | Detail |
|---|---|
| Types | Boolean, integer and string. |
| `==` and `!=` | Two integers, two booleans or two strings. |
| `<`, `<=`, `>`, `>=` | Integers only. Strings and booleans give a type mismatch. |
| Mixed types | A type mismatch. |
| `!`, `&&`, `||` | Booleans only. |
| Short-circuit | None. Both sides of `&&` and `||` are evaluated, and every field the expression names is checked. A refusal never depends on a value: `false && steps.write.summary == 'x'` still reports the claimed field. |
| Result | The whole expression must be a boolean. A bare boolean field such as `verdict.all_covered` is valid. A bare integer or string is not. |
:::

## Errors

### Parse errors

The parser reports one of four messages.

| Message | Cause |
|---|---|
| ``unknown context `<name>` `` | The expression names a context other than the five. |
| ``unknown function `<name>` `` | The expression calls a function other than the three. |
| `syntax error at offset <at>` | The text does not parse. The offset counts characters. At the end of the input it equals the input's length. |
| `expression nested too deeply` | Parentheses or `!` nest more than 32 deep. |

### Evaluation errors

The evaluator reports one of four messages.

| Message | Cause |
|---|---|
| ``unknown field `<name>` `` | The expression reads a field that does not exist. |
| ``field `<field>` is <class>, not derived`` | The field is not `derived`. |
| `operands of the wrong type` | Mixed types, or an ordering comparison of non-integers. |
| `expression is not a boolean` | The result is an integer or a string. |

### Loader errors

The loader refuses an `until` that does not parse, and one that reads a field a gate cannot read. See [Load errors](/reference/workflow-rules#load-errors).

::: details More examples
**Expressions that parse**

```text
success()
true == true
verdict.covered != false
'a' != 'b'
steps.build-all.exit == 0
failure()
always()
verdict.covered
!verdict.covered
inputs.count <= 3
verdict.coverage >= 80 && steps.verify.exit == 0
needs.plan.status == 'ok' || inputs.count > 9
(inputs.count < 3 || inputs.count != 3) && always()
```

These show the grammar. Whether each is readable in a workflow depends on the kinds and fields it names.

**Expressions the parser refuses**

The table is a representative set. Offsets count characters from the start of the expression.

| Expression | Message |
|---|---|
| `env.HOME == 1` | ``unknown context `env` `` |
| `cancelled()` | ``unknown function `cancelled` `` |
| `success(1)` | `syntax error at offset 8` |
| `inputs.a ==` | `syntax error at offset 11` |

**Expressions that parse and fail to evaluate**

Each expression in the table parses, and the evaluator refuses it.

| Expression | Message |
|---|---|
| `'a' < 'b'`, `'a' >= 'b'`, `true < false`, `verdict.covered > false`, `true <= true` | `operands of the wrong type` |
| `inputs.count` | `expression is not a boolean` |
| `steps.write.summary == 'done'` where the field is claimed | ``field `<field>` is claimed, not derived`` |
| `verdict.quality == 'good'` where the field is judged | ``field `<field>` is judged, not derived`` |

**Reads the loader accepts**

The loader accepts each `until` in the table.

| `until` | Why |
|---|---|
| `verdict.outcome == 'pass'` | `outcome` is a derived verdict property. |
| `inputs.measurement.exit_code == 0` | `exit_code` is derived. |
| `inputs.measurement.outcome == 'pass'` | `outcome` is derived. |
| `verdict.all_covered && verdict.outcome == 'pass'` | Both reads are derived. |
| `steps.v.measurement.exit_code == 0` | Step `v` exists. |
| `needs.anything.measurement.exit_code == 0` | `needs` ids are not checked against the workflow. |

**Reads the loader refuses**

The loader refuses each `until` in the table and names the class.

| `until` | Class in the refusal | Cause |
|---|---|---|
| `inputs.plan.criteria == 'x'` | claimed | `criteria` is claimed. |
| `inputs.nope.x == 1` | none | No kind `nope`. |
| `steps.zzz.measurement.exit_code == 0` | none | No step `zzz` in the workflow. |
:::
