# What is Daggry

Daggry runs any agentic work unattended and proves what it did. Work is a graph of steps, each step runs in a sandboxed Kubernetes pod, and code checks every handover and seals it as signed, immutable evidence. This page is for engineers who want agents to deliver work they can trust without watching. Software delivery is the first workflow.

In the delivery workflow, one run takes a GitHub issue to a pull request, then to a retro on that pull request. You make two decisions: you approve the plan that an agent drafts from the issue, and you review the pull request.

## The core ideas

- **An agent's output is a claim.** Only code turns a claim into evidence, by checking it and sealing it. Code judges the work. The one exception is a marked, person-approved verdict by a language model on one named criterion. See [Sealed evidence](/guide/concepts/evidence).
- **Work is a graph.** A workflow is a short YAML file of steps, gates and bounded loops. The agent never changes the graph. See [Work graphs](/guide/concepts/workflows).
- **An agent never changes what instructs, constrains or judges it.** Tests, configuration and instruction files are protected by code, not by a prompt. See [Protected paths](/guide/concepts/protection).
- **Everything runs in plain pods.** Daggry needs Kubernetes and nothing else: no custom resources and no operator. See [Architecture](/guide/concepts/architecture).

## Who it is for

You run coding-agent CLIs on your own repositories and want the work to finish while you are away. You want a record that a reviewer can check without trusting the agent, and a run that stops and asks when it needs a person.

Daggry covers any agentic work, not only delivery. It knows steps, artifacts and gates, and a pull request is one projection of a run. Delivery is the first workflow and retro is the second. For other kinds of work, see [Workflow patterns](/guide/how-to/workflow-patterns).

## Two roles

Daggry keeps two roles apart so that a hosted setup needs no new concept.

| | Operator | Tenant |
|---|---|---|
| Owns | the cluster, the control plane and the seal key | its projects, its model credential and its project harness |
| Uses | Helm and `kubectl` | the `daggry` CLI and GitHub |
| Sees | the whole log and every run | only its own runs, artifacts and evidence |

One person can hold both roles.

## Where to go next

1. To see the idea in one story, read [Overnight](/guide/overnight).
2. To run it, follow [Getting started](/guide/getting-started).
3. To understand how it is built, read [Architecture](/guide/concepts/architecture).
4. To look up a field, command or term, open the [Reference](/reference/).
5. To see what exists and what comes next, read the [Roadmap](/roadmap).
