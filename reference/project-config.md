# Project config

*Reference*

Proposed standard; see the [Roadmap](/roadmap) for status.

For the idea, read [What an agent cannot change](/guide/concepts/protection).

The project config is one YAML file in a repository that tells a factory how to work on that repository. It names how the work is measured, what an agent may never write, which workflows apply and what a runner needs. This page defines the standard layout, the extension rules and the relation to the project profile. It is for people who set up a repository and for people who write a reader of the file.

The format is open. Any factory can read it, and anyone can extend it under a namespace of their own.

The files on this page are illustrative.

## Download

The project config has a published JSON Schema (draft 2020-12).

| Schema | File |
|---|---|
| `daggry/project@1` | [daggry-project-v1.json](/schemas/daggry-project-v1.json) |

## Today

The file that is read today is the [Project profile](/reference/profile), `.daggry/profile.yaml`. It holds one key, `verify.test`, and has no `format` header. Its reader, its output contract and its refusal messages are defined on that page and are unchanged by this one.

The standard below generalises the profile. See [Relation to the profile](#relation-to-the-profile).

## The standard

### Layout

A project config has three parts.

| Part | Keys | Rule |
|---|---|---|
| Header | `format` | Required. Names the standard and its major version. |
| Sections | `verify`, `protect`, `scope`, `workflows`, `runner` | Each is optional. Each appears at most once. |
| Extensions | `<namespace>/<key>` | Any number. See [Extension keys](#extension-keys). |

Every object is closed: a key that is not listed on this page and is not an extension key is refused.

### Header

| Key | Type | Required | Meaning |
|---|---|---|---|
| `format` | string | yes | Always `daggry/project@1`. |

`format` follows the form `<namespace>/<name>@<major>`, the same form as an artifact kind. A reader refuses a missing `format`, a malformed one and a major version it does not know. A breaking change to the layout is a new major.

### verify

How the project is measured. A `verify` step has no command of its own. It runs `verify.test`.

| Key | Type | Required | Meaning |
|---|---|---|---|
| `verify.test` | string | yes, when `verify` is present | The shell command that runs the project's tests. Non-empty. |

The command's exit code and output are read by the rules in [Output contract](/reference/profile#output-contract). A workflow with a `verify` step needs this section.

### protect

Paths that no step may write, in addition to the always-protected set in [Protected paths](/reference/protected-paths).

| Key | Type | Required | Meaning |
|---|---|---|---|
| `protect.paths` | array of glob strings | no | Each non-empty. Added to the protected set for every run on this repository. |

This section only adds. No key removes a path from the always-protected set.

### scope

The widest scope any step may have in this repository.

| Key | Type | Required | Meaning |
|---|---|---|---|
| `scope.limit` | scope | no | `nothing`, `anywhere` or a list of glob strings, with the meanings in [Scope](/reference/workflow-schema#scope). |

A step's own `scope` applies inside the limit. A path that the step's scope allows and the limit does not is out of scope. With no `scope` section, the limit is `anywhere`.

### workflows

Which workflows apply to this repository.

| Key | Type | Required | Meaning |
|---|---|---|---|
| `workflows` | array of objects | no | The workflows a run on this repository may use. |
| `workflows[].use` | string | yes | The name of a workflow in the tenant's catalogue. Non-empty. See [Tenant config](/reference/tenant-config#workflows). |

A name the tenant's catalogue lacks is refused. With no `workflows` section, the tenant config decides which workflows the repository may use.

### runner

What a runner needs to work on this repository.

| Key | Type | Required | Meaning |
|---|---|---|---|
| `runner.image` | string | no | The name of a runner image the tenant offers. Non-empty. See [Tenant config](/reference/tenant-config#runners). |
| `runner.toolchain` | array of objects | no | The tools the image must hold. |
| `runner.toolchain[].name` | string | yes | The tool's name. Non-empty. |
| `runner.toolchain[].version` | string | yes | The version the project needs. Non-empty. |

The project names an image by the tenant's name for it, never by a registry address. The tenant decides which images run.

### Extension keys

An extension key carries a section or a value that the standard does not define.

| Rule | Detail |
|---|---|
| Form | `<namespace>/<key>`. Pattern `^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$`. |
| Namespace | Names the party that defines the key. One party owns every key under its namespace. It is the same form as a key of the envelope's [meta](/reference/envelope#meta). |
| Place | At the top level and inside any section object. |
| Value | Any YAML value in the strict subset. |
| A reader that knows the key | Applies it. |
| A reader that does not know the key | Ignores the value and preserves it: a tool that rewrites the file writes the key back unchanged. |
| A key without a namespace | Refused, unless this page defines it. |
| Limit | An extension narrows or adds. It never widens a rule of the standard, the project or the tenant, and never changes the meaning of a key this page defines. |

A misspelt standard key is therefore an error, and a key in a namespace the reader does not know is not.

### YAML subset

The file uses the same strict subset of YAML as a workflow file: no anchors, aliases, tags or merge keys, and no duplicate mapping key. See [YAML subset](/reference/workflow-schema#yaml-subset).

### Where it lives

| Rule | Detail |
|---|---|
| Path | `.daggry/project.yaml` in the repository. |
| Read from | The base commit: the commit a run starts from. Never the head or the working tree. |
| Protected | `.daggry/**` is a protected path, so no step and no grant writes the file. |
| Changed by | A pull request that a person merges. The change takes effect in the next run after the merge. |

An agent's edit to the file changes nothing for its own run, for the reasons in [Where it is read from](/reference/profile#where-it-is-read-from).

### Precedence

Three documents set rules for a run: the tenant config, the project config and the workflow. The tenant's rule wins over the project's, and the project's wins over the workflow's.

| Document | May | May not |
|---|---|---|
| [Tenant config](/reference/tenant-config) | Set every limit. | - |
| Project config | Narrow what the tenant allows: add protected paths, limit scope, pick workflows and an image from what the tenant offers. | Widen a tenant rule. |
| [Workflow](/reference/workflow-schema) | Narrow further: a step's scope inside the project's limit. | Widen a project or tenant rule. |

Only a person widens a rule: by changing the tenant config, by merging a change to the project config, or by a grant such as [unfreeze](/reference/protected-paths#unfreeze-grant).

### Worked example

This file sets the test command, protects the architecture decisions, keeps every step inside four folders, allows two workflows and asks for an image with a named toolchain. It carries one extension key.

```yaml
format: daggry/project@1

verify:
  test: cargo test --workspace

protect:
  paths:
    - "docs/adr/**"

scope:
  limit:
    - "src/**"
    - "tests/**"
    - "docs/**"
    - "Cargo.*"

workflows:
  - use: delivery
  - use: translate-docs

runner:
  image: rust-stable
  toolchain:
    - name: rust
      version: "1.90"

acme/coverage:
  minimum: 80
```

| Value | Meaning |
|---|---|
| `delivery`, `translate-docs` | Names from the tenant's workflow catalogue. |
| `rust-stable` | The tenant's name for a runner image. |
| `acme/coverage` | A section defined under the namespace `acme`. A reader that does not know it ignores it and preserves it. |

A step with `scope: anywhere` in this repository may write `src/**`, `tests/**`, `docs/**` and `Cargo.*`, except `docs/adr/**` and the always-protected paths.

### Examples a reader refuses

| Input | Refusal |
|---|---|
| No `format` key | Missing `format`. |
| `format: daggry/project@2` | Unknown major. |
| `verfy:` at the top level | Unknown key without a namespace: a misspelt `verify`. |
| `coverage: 80` at the top level | Unknown key without a namespace. |
| `verify:` with `lint: y` beside `test` | Unknown key in a section. |
| `scope:` with `limit: everywhere` | Not a scope value. |

## Relation to the profile

The profile is the `verify` section of the standard, in a file of its own.

| Point | Profile | Project config |
|---|---|---|
| Path | `.daggry/profile.yaml` | `.daggry/project.yaml` |
| Header | None. | `format: daggry/project@1` |
| `verify.test` | Same key, same meaning. | Same key, same meaning. |
| Output contract | [Output contract](/reference/profile#output-contract) | The same contract. |
| Other top-level keys | Skipped. | Refused, unless a section of this page or an extension key. |
| Read from | The base commit. | The base commit. |

To move from a profile to a project config, copy the `verify` block into `.daggry/project.yaml` under a `format` line. The smallest project config that does what a profile does is:

```yaml
format: daggry/project@1
verify:
  test: sh check.sh
```

## Next steps

- For the tenant's side of the same rules, see [Tenant config](/reference/tenant-config).
- For the test command's output lines, see [Project profile](/reference/profile).
- For what another factory implements to read this file, see [Conformance](/reference/conformance).
