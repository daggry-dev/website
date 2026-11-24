# Project profile

*Reference*

For the idea, read [Verify a run](/guide/how-to/verify-a-run).

The project profile, `.daggry/profile.yaml`, is a repository's verification policy. This page defines its shape, the rules of the strict reader, and which files the reader accepts and refuses. It is for people who set up a repository for Daggry. For the step that uses it, see [Workflow schema](/reference/workflow-schema).

The profile is the `verify` section of the [Project config](/reference/project-config), the standard layout for everything a repository says about itself. That page states how the two relate.

The profiles on this page are illustrative.

## Shape

A `verify` step has no command of its own. It runs `verify.test` from the profile.

```yaml
verify:
  test: <command>
```

| Key | Type | Required | Meaning |
|---|---|---|---|
| `verify` | block mapping | yes | The verification block. Appears once. |
| `verify.test` | string | yes | The shell command that runs the project's tests. `<command>` is the command line. |

The exit code of the test command is the measurement's `exit_code`. A command that exits non-zero is a measurement, not an error. The runner reduces the command's output to per-test records. See [Output contract](#output-contract).

## Output contract

The runner reads what the test command prints to standard output and standard error, and keeps one record per result line. The format is the one that Rust's test harness prints, so `cargo test` works with no change. Any other test runner must print the same lines.

| Line | Record |
|---|---|
| `test <name> ... ok` | A passed test called `<name>`. |
| `test <name> ... FAILED` | A failed test. |
| `test <name> ... ignored` or `test <name> ... ignored, <reason>` | An ignored test. |

The runner skips every other line, such as headers, summaries and log output. It drops a ` - should panic` suffix from a name. It also skips the lines between a line that reads `failures:` and the next line that starts with `test result:`, because a failed test prints its captured output there.

Two rules decide what the records prove:

- A plan criterion is covered when a passed test has its id in its name. A failed or ignored test covers nothing. One passed test among several is enough.
- A name carries an id when the id appears in the name, ignoring case, with each character that is not a letter or digit counting as one separator. The id stands between non-alphanumeric characters or at an end of the name. `C1` is carried by `c1_rejects_empty` and `tests::c1-rejects-empty`, and not by a test for `C10`.
- The exit code and the records are independent. A command that exits non-zero but prints `ok` lines for some tests still covers the criteria of those tests, so partial progress counts. Inside a loop, a non-zero exit code ends the iteration red. A zero exit code with no result lines covers nothing.

For a red proof, the test step's test must fail on the base commit: the command exits non-zero and a failed test carries the criterion id.

To use a test runner that prints another format, wrap it in a script that prints the lines above. This script is illustrative. It runs each test file under `tests/`, prints one result line for it, and exits non-zero if any test failed. The test file name carries the criterion id, for example `tests/c1-expired-token.sh`.

```sh
#!/bin/sh
# check.sh: print one libtest-style line per test file.
status=0
for t in tests/*.sh; do
  name=$(basename "$t" .sh)
  if sh "$t" >/dev/null 2>&1; then
    echo "test $name ... ok"
  else
    echo "test $name ... FAILED"
    status=1
  fi
done
exit $status
```

Point the profile at the script:

```yaml
verify:
  test: sh check.sh
```

With the plan from [Kinds and schemas](/reference/kinds), a passing `tests/c1-expired-token.sh` prints `test c1-expired-token ... ok`. The name carries `C1`, so criterion `C1` is covered.

## Where it is read from

The runner reads the profile from the base commit, never from the head or the working tree. A step that edits the profile changes nothing: `.daggry/**` is protected, the runner puts the edit back, the control plane rejects it, and the command comes from the base commit. No run and no grant can write the profile.

The red proof also uses the profile. The runner overlays a test step's new test paths on a clean copy of the base commit and runs the base profile's `verify.test` there. See [Kinds and schemas](/reference/kinds).

The `verify` step measures as a different unix user, on a clean copy of the sealed commit, after the agent process has ended. When it cannot switch user, it measures nothing and the step fails with ``the verify step could not switch to a different unix user: <cause>; nothing was measured``.

## Strict reader rules

The reader accepts one fixed shape, not full YAML. Rules:

| Rule | Detail |
|---|---|
| `verify:` | Stands alone on an unindented line, once. |
| Other top-level keys | Skipped, with their indented lines, blank lines and comment lines. |
| Block under `verify:` | Holds `test:` and nothing else, once. A space follows the colon. |
| Indentation | Spaces only. A tab is refused. |
| Command | Stands on the `test:` line, as a plain scalar or in single or double quotes. |
| Quotes | No escapes. A quoted command cannot contain its own quote character. A double-quoted one cannot contain a backslash. |
| Plain command | Refused when it starts with one of ``[ { & * ! | > % @ ` #`` or contains ` #` or `: `. Put such a command in quotes. |
| Empty command | Refused. |
| Missing `verify.test` | Refused. |

A refused profile is a profile error with the message `profile: <reason>`. The `verify` step then measures nothing. A base commit with no profile file also stops the step.

### Refusal messages

| Message | Cause |
|---|---|
| `` `verify:` must be a block mapping `` | A value on the same line as `verify:`. |
| `` `verify:` appears twice `` | A second `verify:` line. |
| `` `verify:` holds `test:` only `` | A key other than `test:` in the block. |
| `tabs are not indentation` | A tab used as indentation. |
| ``profile: no `verify.test` `` | The block has no `test:`. |

## Examples

### Smallest profile

```yaml
verify:
  test: sh check.sh
```

### Accepted

Other top-level keys are skipped:

```yaml
name: example
verify:
  test: cargo test --workspace
```

A single quote inside double quotes:

```yaml
verify:
  test: "cargo test -- 'x'"
```

### Refused

A key besides `test`:

```yaml
verify:
  test: x
  lint: y
```

No `verify` block:

```yaml
name: x
```

A flow mapping on the `verify:` line:

```yaml
verify: {test: x}
```

A second `verify` block:

```yaml
verify:
  test: x
verify:
  test: y
```

No space after the colon:

```yaml
verify:
  test:x
```

## Limits

The reader accepts `verify.test` only. The profile holds one test command. For what comes next, see the [Roadmap](/roadmap).

A step that tries to rewrite the profile changes nothing. In this workflow, the `build` step overwrites the profile so that verification would fail. The run still succeeds, because the command comes from the base commit.

```yaml
steps:
  - id: build
    kind: command
    scope: anywhere
    run: "printf 'verify:\\n  test: \"exit 1\"\\n' > .daggry/profile.yaml; echo built > built.txt"
  - id: verify
    kind: verify
```

For the protection rules, see [Protected paths](/guide/concepts/protection).
