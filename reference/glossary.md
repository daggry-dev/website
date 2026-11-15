# Glossary

*Reference*

For the idea, read [How Daggry works](/guide/).

This page defines the terms Daggry uses, in alphabetical order. Start with the twelve words below. Each table entry has one or two sentences and a link to the page that explains the term.

## Twelve words to know first

These twelve words cover most of what you read on this site. The table after them is the complete list.

- **Workflow.** A file in your repository that lists the steps of the work, what each step hands to the next, the checks and the moments you decide.
- **Step.** One unit of work in a workflow, such as running a command, running a coding agent or waiting for you.
- **Run.** One execution of a workflow for one piece of work, such as a GitHub issue.
- **Job.** A group of steps that share one pod.
- **Pod.** A throwaway container in which one job runs. It holds a token for one repository and never the signing key.
- **Claim.** What an agent says it did. A claim is only a statement until code checks it.
- **Check.** Something code does to test a claim, such as re-running the tests. A check written as code is called a validator.
- **Seal.** Code checks a record, then signs it so it cannot be quietly changed.
- **Evidence.** A sealed record that code has checked.
- **Evidence trail.** The signed, linked list of every sealed record, in order. The reference pages call it the log or the chain.
- **Approval.** The moment a person decides. The run stops, shows why, and your decision is recorded against the exact plan you saw.
- **Cluster admin.** The person who installs and runs Daggry on a Kubernetes cluster.

## Terms

| Term | Definition | Read more |
|---|---|---|
| approval | The moment a person decides, and the sealed artifact that records it. The artifact binds a person's decision to one digest: the pending plan or change, or the frozen file digest for an unfreeze. | [Kinds and schemas](/reference/kinds) |
| artifact | A sealed value in the one envelope, with a kind and parents. | [Envelope](/reference/envelope) |
| attempt | One try of a job. A takeover after a lapsed lease, or an `approve` at a `human` step, starts a new attempt. | [Work graphs](/guide/concepts/workflows) |
| base | The commit a run starts from. Also the label of a measurement of that commit. | [Kinds and schemas](/reference/kinds) |
| blob | Bytes stored beside the log and named by the SHA-256 of their content, such as a workflow file. | [Envelope](/reference/envelope) |
| chain | One sequence of linked log entries, verifiable from its first entry. Each tenant has exactly one. Prose elsewhere calls it the evidence trail. | [Envelope](/reference/envelope) |
| change | A sealed record of a commit, the paths it changed and the frozen test set. | [Kinds and schemas](/reference/kinds) |
| check | Something code does to test a claim, such as re-running the tests. A check written as code is a validator. | [Why you can trust a run](/guide/concepts/trust) |
| claim | What an agent produced before code checked and sealed it. A claim is never evidence. | [Why you can trust a run](/guide/concepts/trust) |
| cluster admin | The person who installs and runs Daggry on a Kubernetes cluster. | [Roadmap](/roadmap) |
| command step | A step that runs a shell line in the pod. | [Workflow schema](/reference/workflow-schema) |
| control plane | The one backend. It decides the next step, holds the keys, seals and judges. | [Where it runs](/guide/concepts/architecture) |
| criterion | An acceptance criterion with an id in the approved plan. | [Kinds and schemas](/reference/kinds) |
| derived | A fact class: code computed the value from sealed inputs. Gates can read it. | [Gate expressions](/reference/gates) |
| digest | The SHA-256 hash that names a sealed artifact by its content. Parents and blobs are referenced by digest. | [Envelope](/reference/envelope) |
| effect step | A step that the control plane runs, such as opening a pull request. | [Workflow schema](/reference/workflow-schema) |
| engine | The coding-agent CLI that does an agent step's work. | [Where it runs](/guide/concepts/architecture) |
| entry | One appended record of the log: the previous link and one sealed artifact. | [Envelope](/reference/envelope) |
| envelope | The one JSON shape every artifact has: the draft's `kind`, `id` and `body`, plus the seal fields that only code adds. | [Envelope](/reference/envelope) |
| evidence | A sealed artifact whose acceptance a validator or a human gate decided. | [Why you can trust a run](/guide/concepts/trust) |
| evidence trail | The signed, linked record of everything the control plane sealed, in order. Reference pages call it the log or the chain. | [Why you can trust a run](/guide/concepts/trust) |
| fact | A named value in a verdict, a boolean, an integer or a string, that a gate can read. | [Gate expressions](/reference/gates) |
| fact class | Whether a field is `claimed`, `derived` or `judged`. | [Gate expressions](/reference/gates) |
| frozen test | A test path sealed in an earlier loop iteration, recorded with its file digest. A step cannot change it. | [Protected paths](/reference/protected-paths) |
| gate | A rule over derived facts that a run must pass. It is written as an expression in a loop's `until`. | [Gate expressions](/reference/gates) |
| genesis digest | The digest of no history: 64 zero characters. It is the `prev` of a chain's first entry. | [Envelope](/reference/envelope) |
| head | In a chain, the link of the last entry. As a measurement label, the sealed commit's test run. | [Envelope](/reference/envelope) |
| human step | The step kind (`kind: human`) that holds an approval: it waits for a person. `daggry approve` completes it. | [Workflow schema](/reference/workflow-schema) |
| job | A group of steps that share one pod and workspace. A run is one job by default. | [Workflow schema](/reference/workflow-schema) |
| judge | The control plane's part of verification: it runs validators over sealed records and seals the verdicts that open gates. | [Kinds and schemas](/reference/kinds) |
| judged | A fact class: a language-model verdict under a rubric a person approved for one named criterion. It is the one verdict a model gives. | [Gate expressions](/reference/gates) |
| key id | The name of the public key that checks a seal: `ed25519-` and 16 hex digits. | [Envelope](/reference/envelope) |
| kind | The name and major version of an artifact's schema: `<namespace>/<name>@<major>`. | [Kinds and schemas](/reference/kinds) |
| launcher | The component that turns a job attempt into a pod and watches it. | [Deploy Daggry](/guide/how-to/deploy) |
| lease | A time-limited claim on a job attempt, kept alive by the runner's heartbeat. It is the one authority on liveness. | [Where it runs](/guide/concepts/architecture) |
| link | SHA-256 of the previous link and the entry's digest. The signature covers it. | [Envelope](/reference/envelope) |
| log | The append-only, hash-chained record of everything the control plane sealed. It is the source of truth for state. Prose elsewhere calls it the evidence trail. | [Envelope](/reference/envelope) |
| loop | A bounded sequential repeat of steps over a list, ended by a gate. It is an entry in a workflow, not a step kind. | [Workflow schema](/reference/workflow-schema) |
| measure | The part of verification that runs the project's tests on a clean copy of the code and records a measurement. | [Kinds and schemas](/reference/kinds) |
| meta | The envelope's optional map from namespaced keys to scalar values, stamped by code at seal time. | [Envelope](/reference/envelope) |
| observation | A sealed record that is not a verdict: `protected-restored` or `step-failed`. It is kept for the record. | [Kinds and schemas](/reference/kinds) |
| parents | The digests of the artifacts an artifact builds on. | [Envelope](/reference/envelope) |
| pod | The throwaway pod a job runs in. | [Where it runs](/guide/concepts/architecture) |
| prev | The link of the entry before this one in the chain. | [Envelope](/reference/envelope) |
| preview | The part of verification that runs validators in the pod for fast feedback. A preview is never evidence. | [Kinds and schemas](/reference/kinds) |
| profile | The file `.daggry/profile.yaml`, which holds the repository's verification policy. | [Project profile](/reference/profile) |
| protected path | A path that an agent can never change, whatever a workflow says. | [Protected paths](/reference/protected-paths) |
| red proof | A test that fails on the base commit, which shows that the test says something about the change. | [Kinds and schemas](/reference/kinds) |
| run | One execution of a workflow for a work item. | [Work graphs](/guide/concepts/workflows) |
| run lock | The sealed record of what a run pinned at start: validators, boundary rules, image and workflow. | [Kinds and schemas](/reference/kinds) |
| runner | The program in the pod that runs a job's steps and the engine, and checks the work locally. | [Deploy Daggry](/guide/how-to/deploy) |
| scope | What a step may write: `nothing`, a list of globs, or `anywhere` except protected paths and CI configuration folders such as `.github/**`. | [Workflow schema](/reference/workflow-schema) |
| seal | The control plane's signature on an artifact. It says code validated the artifact, not that the artifact is true. | [Why you can trust a run](/guide/concepts/trust) |
| step | A node of a workflow. Its kind is `command`, `agent`, `verify`, `human` or `effect`. | [Workflow schema](/reference/workflow-schema) |
| tenant | A party whose runs an installation hosts, called a team or user elsewhere on the site. Each tenant has one chain. | [Envelope](/reference/envelope) |
| unfreeze | The one human grant: `daggry approve <run-id> --unfreeze <path>` frees one frozen test path for one iteration. | [Protected paths](/reference/protected-paths) |
| validator | A check written as code: it turns sealed inputs into a verdict. | [Kinds and schemas](/reference/kinds) |
| verdict | The artifact a validator produces, with a status, findings and derived facts. | [Kinds and schemas](/reference/kinds) |
| verify step | The step that measures a clean copy of the code. It is not the `daggry verify` command, which checks the log. | [Verify a run](/guide/how-to/verify-a-run) |
| witness | Evidence for a finding that code can confirm, such as a quoted line inside a changed hunk. A finding without a witness is advice. | [Kinds and schemas](/reference/kinds) |
| work item | The input that starts a run, such as a GitHub issue. | [Kinds and schemas](/reference/kinds) |
| workflow | The file that lists the steps of the work, written as data in a graph of steps. You write a new workflow as a file in your repository. | [Workflow schema](/reference/workflow-schema) |
