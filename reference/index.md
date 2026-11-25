# Reference

*Reference*

The reference pages list every command, route, field and rule of Daggry, with no narrative. They are for people who already know what they want to look up. To learn the ideas first, start with [How Daggry works](/guide/).

The standards name no tool and no kind of work: a factory checks and seals any work that lives in a workspace. Four of the formats are open standards that any factory can implement: evidence ([Envelope](/reference/envelope) and [Kinds and schemas](/reference/kinds)), the [Workflow schema](/reference/workflow-schema), the [Project config](/reference/project-config) and the [Tenant config](/reference/tenant-config). [Conformance](/reference/conformance) says what an implementation must do, and [Contracts](/reference/contracts) lists every interface a part can be replaced behind.

The table names each page and what to use it for.

| Page | Use it to |
|---|---|
| [CLI](/reference/cli) | Look up a `daggry` command, flag, output format, exit code or environment variable. |
| [HTTP API](/reference/api) | Look up a route, a request or response body, a status code or a run state. |
| [Envelope](/reference/envelope) | Look up the fields of a sealed artifact, the canonical JSON rules, the chain link, the signature rule and the test vectors. |
| [Kinds and schemas](/reference/kinds) | Look up the body of each artifact kind and the downloadable JSON Schemas. |
| [Validators](/reference/validators) | Look up the validator contract, the three sources of a validator, the built-in validators and how to write your own. |
| [Workflow schema](/reference/workflow-schema) | Look up every key of a workflow file, every case the loader refuses, and how a workflow is extended. |
| [Gate expressions](/reference/gates) | Look up the grammar of an `until` gate, the fields it can read and the fact classes. |
| [Protected paths](/reference/protected-paths) | Look up which paths no step can change, what a project adds to them, how the scope of a step and of a run is judged and what a pod enforces. |
| [Project config](/reference/project-config) | Look up a workspace's configuration file: the project, its areas, its script validators, the canonical validator, the result contracts and the result document. |
| [Tenant config](/reference/tenant-config) | Look up the standard layout of a tenant's configuration: the workflow catalogue, orchestration, agents, runners, validators, projects and extensions. |
| [Bindings](/reference/bindings) | Look up what maps the neutral standards onto one kind of work: the software binding with its adapters, and a sketch for document review. |
| [Contracts](/reference/contracts) | Look up every interface between the parts of a factory, what can replace each part and how a replacement is tested. |
| [Conformance](/reference/conformance) | Look up what another factory implements to read, sign or produce the same documents, and what is one platform's policy. |
| [Glossary](/reference/glossary) | Look up a term. |

## Next steps

- To run Daggry for the first time, follow [Getting started](/guide/getting-started).
- To see the build status, read the [Roadmap](/roadmap).
