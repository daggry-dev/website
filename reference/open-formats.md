# Formats and versioning

*Reference*

Daggry has four published formats: you write three files, and Daggry writes the fourth, the evidence trail. This page says what each format holds, how a format is versioned and how you add a key of your own. Read it if you write a tool that reads these files. To write the files, start with [Configure Daggry](/guide/configure).

## The four formats

The table names each format, what it says and who writes it.

| Format | What it says | Who writes it | Defined in |
|---|---|---|---|
| Workflow | The steps of a piece of work, in order: the loops, the gates and the approvals. | A person, as a file. | [Workflow file](/reference/workflow-schema) |
| Project config | What is true of one project: its areas, its validators and the paths it protects. | The project owner, as a file in the workspace. | [Project config](/reference/project-config) |
| Tenant config | How a tenant's factory works: which workflows run on which project, which personas work and where a person must approve. | The tenant admin. | [Tenant config](/reference/tenant-config) |
| Evidence trail | What happened: one sealed record for each result, signed and linked to the record before it. | Code only. The control plane seals each record. | [Evidence envelope](/reference/envelope), [Artifact kinds](/reference/kinds) |

Each format has a JSON Schema (draft 2020-12) under `/schemas/` on this site, so your own tools can read and check a file. Each reference page links its schema.

The formats name no tool. For software, the workspace is a git repository, the work item is an issue and the delivered change is a pull request. See [Workspaces and work items](/reference/project-config#workspaces-and-work-items).

## Versioning

Each file names its format and major version in a `format` header, in the form `<namespace>/<name>@<major>`. A record names its kind the same way. The table lists the headers.

| File | Header |
|---|---|
| Workflow | `format: daggry/workflow@1` |
| Project config | `format: daggry/project@1` |
| Tenant config | `format: daggry/tenant@1` |
| Sealed record | `"format": "evidence/envelope@1"`, and a `kind` such as `evidence/plan@1` |

These rules apply to every format.

- **The header is required.** A reader refuses a file without one, a malformed one and a major version it does not know. It never guesses.
- **A breaking change is a new major.** A sealed record never changes, so a record of an old major stays valid under the schema it was sealed with.
- **Every object is closed.** A key that the format does not define and that is not an extension key is refused, so a misspelt key is an error.
- **A kind lives in a namespace.** The `evidence` namespace holds `plan`, `measurement`, `verdict`, `approval` and `input`. Daggry's own kinds are in `daggry`. A reader refuses a kind it does not know. See [Artifact kinds](/reference/kinds).

The three files use a strict subset of YAML. See [YAML subset](/reference/workflow-rules#yaml-subset).

## Extension keys

An extension key carries a value that a format does not define, so you can add to a file without a new version of the format. The rules are the same in the workflow, the project config and the tenant config. The table lists them.

| Rule | Detail |
|---|---|
| Form | `<namespace>/<key>`, for example `acme/cost-centre`. Pattern `^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$`. |
| Namespace | Names the party that defines the key. One party owns every key under its namespace. A key of the envelope's [meta](/reference/envelope#meta) has the same form. |
| Place | At the top level and inside any object of the file. |
| Value | Any YAML value in the strict subset. |
| A reader that knows the key | Applies it. |
| A reader that does not know the key | Ignores the value and preserves it: a tool that rewrites the file writes the key back unchanged. |
| A key without a namespace | Refused, unless the format defines it. |
| Limit | An extension narrows or adds. It never widens a rule of the workflow, the project or the tenant, and never changes the meaning of a key the format defines. |

This illustrative fragment of a project config carries one extension key.

```yaml
acme/review:
  owner: docs-team
```

For what a tool of your own must do to read and write the formats, see [Conformance and module contracts](/reference/conformance).
