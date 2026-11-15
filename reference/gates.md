# Gate expressions

A gate is an expression in a loop's `until` that reads facts from sealed evidence. This page defines the grammar, the contexts, every read form, the fact classes and the functions. It is for people who write loops in workflows. For where `until` sits, see [Workflow schema](/reference/workflow-schema). For the facts that validators emit, see [Kinds and schemas](/reference/kinds).

The expressions on this page are illustrative. Where an example is refused, the page names the refusal.

## Quick reference

A gate reads only `derived` facts: values that code computed from sealed inputs. The loader refuses a read of a `claimed` field, of a field with no class, and of a step that does not exist, before a run starts.

Accepted:

```text
verdict.all_covered
verdict.status == 'pass'
verdict.criteria_uncovered == 0
inputs.measurement.exit_code == 0
success()
```

Refused:

```text
inputs.plan.criteria == 'x'
verdict.findings == 1
steps.zzz.measurement.exit_code == 0
```

## Contexts

| Context | Reads |
|---|---|
| `inputs` | The artifacts handed to the loop, by kind. |
| `needs` | The artifacts of named earlier work, by id. |
| `steps` | The artifacts of a named step. |
| `verdict` | The verdict facts sealed so far. |

A gate expression can use a name only from these four contexts. `env.HOME` is refused at parse time.

## Read forms

`<kind>` is the kind's bare name, such as `measurement`, not `evidence/measurement@1`.

| Read | Form | Names after the context | How the loader classifies it |
|---|---|---|---|
| steps | `steps.<step id>.<kind>.<field>` | Exactly 3. | The class of `<field>` in `<kind>`'s schema. `<step id>` must name a step of this workflow, top-level or inside a loop. |
| needs | `needs.<id>.<kind>.<field>` | Exactly 3. | As `steps`, but the id is not checked against the workflow. |
| inputs | `inputs.<kind>.<field>` | 2 or more. | The class of `<field>` in `<kind>`'s schema. Extra names leave the class unchanged. A read with fewer names has no class. |
| verdict | `verdict.<name>` | Exactly 1. | If `<name>` is a property of the verdict schema, that property's class. Otherwise `<name>` is a fact name and takes the class of the verdict's `facts`: `derived`. |

The loader checks every read in an `until`, in source order, and returns the first refusal. A read that the loader cannot classify is refused, the same as a `claimed` read. This is fail-closed.

A body field that is itself named `meta` is read as `steps.<step id>.<kind>.meta`.

Every envelope `meta` value is `derived`.

## Fact classes

| Class | Meaning | Gate can read |
|---|---|---|
| `claimed` | An agent wrote it. | No. |
| `derived` | Code computed it from sealed inputs. | Yes. |
| `judged` | An LLM verdict under a rubric a person approved for that criterion. | Only once a person approves a rubric for that criterion. Until then the loader refuses a `judged` read. |
| none | The schema gives the field no `x-fact-class`. | No. |

A schema marks a field's class with the keyword `x-fact-class` on the property.

### Fact classes by kind and field

| Kind | Field | Class |
|---|---|---|
| `evidence/plan@1` | `criteria` | claimed |
| `evidence/measurement@1` | `label`, `criterion`, `exit_code`, `tests` | derived |
| | `revision` | claimed |
| `evidence/verdict@1` | `status`, `facts`, and every fact name | derived |
| | `validator`, `version`, `findings` | none |
| `evidence/approval@1` | `subject`, `path`, `digest`, `source_ref`, `cited_phrase`, `intent_read`, `author` | derived |
| `daggry/change@1` | `frozen` | derived |
| | `revision`, `paths` | claimed |
| `daggry/observation@1` | `record`, `path`, `reason`, `step`, `attempt` | derived |
| `daggry/run-lock@1` | `validators`, `boundary_rules`, `image_digest`, `workflow_digest` | derived |
| `daggry/work-item@1` | `repository`, `issue` | claimed |

Only a top-level property of a body is readable. A fact value is a boolean, an integer or a string.

### Verdict facts

A `verdict.<name>` read takes the value from the verdicts sealed for the run, newest first. Each verdict contributes `status` (a string) and each of its facts. A later value of the same name replaces an earlier one, so `verdict.status` is the status of the latest verdict.

| Name | Type | From | Meaning |
|---|---|---|---|
| `all_covered` | boolean | `criterion-coverage` | No plan criterion is uncovered. |
| `criteria_covered` | integer | `criterion-coverage` | Criteria covered by a passing head test. |
| `criteria_uncovered` | integer | `criterion-coverage` | Criteria with no passing test. |
| `red` | boolean | `red-proof` | The test step's test failed on the base commit with a non-zero exit. |
| `tests_removed` | integer | `base-relative` | Tests in base that are absent from head. |
| `tests_newly_skipped` | integer | `base-relative` | Tests that are ignored in head and not in base. |
| `status` | string | any verdict | `pass`, `fail` or `inconclusive`. |

`until` does not depend on whether the iteration was green. When it holds at the end of a red iteration, the loop still ends.

## Grammar

```text
expr    = or
or      = and { "||" and }
and     = cmp { "&&" cmp }
cmp     = unary [ ("==" | "!=" | "<" | "<=" | ">" | ">=") unary ]
unary   = "!" unary | primary
primary = "true" | "false" | integer | 'string' | "(" expr ")" | call | field
call    = ("success" | "failure" | "always") "(" ")"
field   = ("inputs" | "needs" | "steps" | "verdict") { "." name }+
```

### Lexical rules

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

### Functions

| Function | Value |
|---|---|
| `success()` | True when no step before this point failed. |
| `failure()` | True when a step before this point failed. |
| `always()` | True. |

Functions take no arguments. `success(1)` is a syntax error. Any other call is an unknown function. A bare `success` without parentheses is an unknown context.

### Evaluation rules

| Rule | Detail |
|---|---|
| Types | Boolean, integer and string. |
| `==` and `!=` | Two integers, two booleans or two strings. |
| `<`, `<=`, `>`, `>=` | Integers only. Strings and booleans give a type mismatch. |
| Mixed types | A type mismatch. |
| `!`, `&&`, `||` | Booleans only. |
| Short-circuit | None. Both sides of `&&` and `||` are evaluated, and every field the expression names is checked. A refusal never depends on a value: `false && steps.write.summary == 'x'` still reports the claimed field. |
| Result | The whole expression must be a boolean. A bare boolean field such as `verdict.all_covered` is valid. A bare integer or string is not. |

## Errors

### Parse errors

| Message | Cause |
|---|---|
| ``unknown context `<name>` `` | The expression names a context other than the four. |
| ``unknown function `<name>` `` | The expression calls a function other than the three. |
| `syntax error at offset <at>` | The text does not parse. The offset counts characters. At the end of the input it equals the input's length. |
| `expression nested too deeply` | Parentheses or `!` nest more than 32 deep. |

### Evaluation errors

| Message | Cause |
|---|---|
| ``unknown field `<name>` `` | The expression reads a field that does not exist. |
| ``field `<field>` is <class>, not derived`` | The field is not `derived`. |
| `operands of the wrong type` | Mixed types, or an ordering comparison of non-integers. |
| `expression is not a boolean` | The result is an integer or a string. |

### Loader errors

The loader refuses an `until` that does not parse, and one that reads a field that is not `derived`. See [Workflow schema](/reference/workflow-schema).

## Examples

### Expressions that parse

```text
success()
true == true
verdict.passed != false
'a' != 'b'
steps.build-all.exit == 0
failure()
always()
verdict.passed
!verdict.passed
inputs.count <= 3
verdict.coverage >= 80 && steps.verify.exit == 0
needs.plan.status == 'ok' || inputs.count > 9
(inputs.count < 3 || inputs.count != 3) && always()
```

These show the grammar. Whether each is readable in a workflow depends on the kinds and fields it names.

### Expressions the parser refuses

A representative set. Offsets count characters from the start of the expression.

| Expression | Message |
|---|---|
| `env.HOME == 1` | ``unknown context `env` `` |
| `cancelled()` | ``unknown function `cancelled` `` |
| `success(1)` | `syntax error at offset 8` |
| `inputs.a ==` | `syntax error at offset 11` |

### Expressions that parse and fail to evaluate

| Expression | Message |
|---|---|
| `'a' < 'b'`, `'a' >= 'b'`, `true < false`, `verdict.passed > false`, `true <= true` | `operands of the wrong type` |
| `inputs.count` | `expression is not a boolean` |
| `steps.write.summary == 'done'` where the field is claimed | ``field `<field>` is claimed, not derived`` |
| `verdict.quality == 'good'` where the field is judged | ``field `<field>` is judged, not derived`` |

### Reads the loader accepts

| `until` | Why |
|---|---|
| `verdict.status == 'pass'` | `status` is a derived verdict property. |
| `inputs.measurement.exit_code == 0` | `exit_code` is derived. |
| `verdict.all_covered && verdict.status == 'pass'` | Both reads are derived. |
| `steps.v.measurement.exit_code == 0` | Step `v` exists. |
| `needs.anything.measurement.exit_code == 0` | `needs` ids are not checked against the workflow. |

### Reads the loader refuses

| `until` | Class in the refusal | Cause |
|---|---|---|
| `inputs.plan.criteria == 'x'` | claimed | `criteria` is claimed. |
| `inputs.nope.x == 1` | none | No kind `nope`. |
| `steps.zzz.measurement.exit_code == 0` | none | No step `zzz` in the workflow. |
