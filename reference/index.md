# Reference

*Reference*

The reference pages list every command, route, field and rule of Daggry, with no narrative. They are for people who already know what they want to look up. To learn the ideas first, start with [How Daggry works](/guide/).

Four of the formats are open standards that any factory can implement: evidence ([Envelope](/reference/envelope) and [Kinds and schemas](/reference/kinds)), the [Workflow schema](/reference/workflow-schema), the [Project config](/reference/project-config) and the [Tenant config](/reference/tenant-config). [Conformance](/reference/conformance) says what an implementation must do.

The table names each page and what to use it for.

| Page | Use it to |
|---|---|
| [CLI](/reference/cli) | Look up a `daggry` command, flag, output format, exit code or environment variable. |
| [HTTP API](/reference/api) | Look up a route, a request or response body, a status code or a run state. |
| [Envelope](/reference/envelope) | Look up the fields of a sealed artifact, the canonical JSON rules, the chain link, the signature rule and the test vectors. |
| [Kinds and schemas](/reference/kinds) | Look up the body of each artifact kind, the built-in validators and the downloadable JSON Schemas. |
| [Workflow schema](/reference/workflow-schema) | Look up every key of a workflow file, every case the loader refuses, and how a workflow is extended. |
| [Gate expressions](/reference/gates) | Look up the grammar of an `until` gate, the fields it can read and the fact classes. |
| [Protected paths](/reference/protected-paths) | Look up which paths an agent can never change, the always-protected globs, how a step's scope is checked and what a pod enforces. |
| [Project profile](/reference/profile) | Look up the `.daggry/profile.yaml` format and the lines your test command must print. |
| [Project config](/reference/project-config) | Look up the standard layout of a repository's configuration file, its sections and the extension rules. |
| [Tenant config](/reference/tenant-config) | Look up the standard layout of a tenant's configuration: the workflow catalogue, orchestration, agents, runners and projects. |
| [Conformance](/reference/conformance) | Look up what another factory implements to read, sign or produce the same documents, and what is one platform's policy. |
| [Glossary](/reference/glossary) | Look up a term. |

## Next steps

- To run Daggry for the first time, follow [Getting started](/guide/getting-started).
- To see what exists today and what comes next, read the [Roadmap](/roadmap).
