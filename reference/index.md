# Reference

*Reference*

When you know what you want to look up, a guide is in the way. The reference pages list every command, route, field and rule of Daggry, with no narrative. Use them when you write a file, a script or a tool and need the exact form. To learn Daggry first, start with [What is Daggry?](/guide/).

The tables name each page and what to use it for.

## Commands and API

| Page | Use it to |
|---|---|
| [CLI](/reference/cli) | Look up a `daggry` command, flag, output format, exit code or environment variable. |
| [HTTP API](/reference/api) | Look up a route, a request or response body, a status code or a run state. |

## Files you write

| Page | Use it to |
|---|---|
| [Workflow file](/reference/workflow-schema) | Look up every key of a workflow file, every file the loader refuses, and how you add your own keys and step kinds. |
| [Gate expressions](/reference/gates) | Look up the grammar of an `until` gate, the fields it can read and the fact classes. |
| [Project config](/reference/project-config) | Look up a project's configuration file: the project, its areas, its script validators, its main validator, the result contracts and the result document. |
| [Tenant config](/reference/tenant-config) | Look up a tenant's configuration: the workflows it offers, scheduling limits, agents, runners, validators, projects and extensions. |

## Rules

| Page | Use it to |
|---|---|
| [Validators](/reference/validators) | Look up the validator contract, the three sources of a validator, the built-in validators and how to write your own. |
| [Protected paths](/reference/protected-paths) | Look up which paths no step can change, what a project adds to them, how the scope of a step and of a run is judged and what a pod enforces. |
| [Bindings](/reference/bindings) | Look up what a ready-made setup for one kind of work holds: the software binding with its adapters, and a sketch for document review. |
| [Helm chart values](/reference/helm-chart) | Look up a value of the Daggry chart, or how to run the launcher in its own pod. |

## Specification

Read these pages if you build a tool or a module of your own. If you only use Daggry, you can skip them.

| Page | Use it to |
|---|---|
| [Open formats](/reference/open-formats) | Look up what the four published formats hold, how each is versioned and how you add to one. |
| [Evidence record format](/reference/envelope) | Look up the fields of a sealed record, the canonical JSON rules, the chain link, the signature rule and the test vectors. |
| [Record kinds](/reference/kinds) | Look up the body of each record kind and the downloadable JSON Schemas. |
| [Module contracts](/reference/contracts) | Look up every interface between the modules, what can replace each module and how a replacement is tested. |
| [Conformance](/reference/conformance) | Look up what a tool of your own must do to read, sign or produce the same files, and which choices are Daggry's own policy. |

## Glossary

| Page | Use it to |
|---|---|
| [Glossary](/reference/glossary) | Look up a term. |

For build status, read the [Roadmap](/roadmap).
