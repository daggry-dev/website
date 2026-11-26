# Reference

*Reference*

The reference pages list every key, command and rule of Daggry. Use them when you write a file or a script and need the exact form. To learn Daggry first, start with [What is Daggry?](/guide/).

<ModelOverview />

The diagram shows the whole model: you write three files, Daggry runs a workflow, every step ends in sealed records, the records form the evidence trail, and `daggry verify` checks the trail on your machine.

<WhereThingsLive />

The diagram shows where each thing lives: what the tenant config, the project config and the workflow each define, and what a run adds.

## What you write

The table lists the three files you write.

| Page | Use it to |
|---|---|
| [Workflow file](/reference/workflow-schema) | Look up the keys of a workflow: the five step kinds, scope, the loop, and what each step seals. |
| [Workflow rules](/reference/workflow-rules) | Look up why a workflow was refused, and how to add keys and step kinds of your own. |
| [Project config](/reference/project-config) | Look up the keys of `.daggry/project.yaml`: areas, validators, judges, personas and protected paths. |
| [Tenant config](/reference/tenant-config) | Look up the tenant's document: personas, the workflows on offer, shared validators, approval rules, projects and their triggers. |

## Rules

The table lists the pages that say how work is checked and limited.

| Page | Use it to |
|---|---|
| [Validators](/reference/validators) | Look up how a validator measures the work and when its result counts as evidence. |
| [Judges](/reference/judges) | Look up the four kinds of judge and the facts each emits. |
| [Gate expressions](/reference/gates) | Look up what a loop's `until` can read, and its grammar. |
| [Protected paths](/reference/protected-paths) | Look up which paths no step can change, and how scope and frozen paths work. |
| [Comments and approvals](/reference/conversation) | Look up who Daggry listens to on an issue and a pull request, how it reads a yes and what starts and stops a run. |

## Commands

The table lists the pages for the command line, the API and the installation.

| Page | Use it to |
|---|---|
| [CLI](/reference/cli) | Look up a `daggry` command, flag, exit code or environment variable. |
| [HTTP API](/reference/api) | Look up a route, a status code or a run state. |
| [Helm chart values](/reference/helm-chart) | Look up a value of the Daggry chart. |

## Specification

Read these pages if you build a tool that reads the evidence trail, or a module of your own. If you only use Daggry, you can skip them.

| Page | Use it to |
|---|---|
| [Formats and versioning](/reference/open-formats) | Look up the four published formats, how each is versioned and the rules for extension keys. |
| [Evidence envelope](/reference/envelope) | Look up the fields of a sealed record, the digest, the link and the signature. |
| [Artifact kinds](/reference/kinds) | Look up the body of each kind of record and the JSON Schemas. |
| [Conformance and module contracts](/reference/conformance) | Look up what a tool of your own must do to read or write the same files, and what can replace a module. |

## Terms

Look up a term in the [Glossary](/reference/glossary). For build status, read the [Roadmap](/roadmap).
