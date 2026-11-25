# Validators: the extension point

A platform that ships a fixed set of checks can judge only the work its authors thought of. In Daggry the check is a plug-in. It is called a validator, and you can add your own.

A validator is a check written as code, with a name. It takes sealed inputs and yields a result and a verdict. A workflow's `verify` step names one or more validators, and the platform runs them. The validator interface is part of the open standards, so a validator written for one factory runs in another. It is also a contract like every other part of the factory: anything that meets it is a validator. See [Validators](/reference/validators) and [Contracts](/reference/contracts).

The examples on this page are illustrative.

## A verify step names its validators

The `verify` step is where a workflow says what judges the work. It holds a list, `validators`.

```yaml
- id: check
  kind: verify
  validators: [project, tenant/house-style]
```

This step runs two validators. `project` is the project's verification: the validator that the project config names as canonical, with the supporting validators and thresholds it lists. `tenant/house-style` is a script validator that the tenant declares. The step is green when every validator it names gives a passing verdict.

## Three sources

A validator comes from one of three sources. The source decides how the validator is named, who adds it and where it runs.

- **Built-in validators** cover what every factory needs. They ship with the platform, are named `daggry/<name>` and run in the control plane, over sealed inputs.
- **Script validators** are the short way to plug in a check of your own. A script validator is any script or executable that inspects the workspace and reports a result. A tenant declares the ones that hold for every workspace it serves, as `tenant/<name>`. A project declares the ones that are true of that project, as `project/<name>`. A script validator runs in the deterministic runner, on a clean copy of the workspace.
- **Native validators** are for a check that judges sealed inputs alone, with no workspace. A native validator is named `<namespace>/<name>` and is written in any language. It runs in-process with the control plane, or as a service that speaks the validator protocol. The cluster admin installs it, and the factory accepts only a native validator that the tenant admits by name, version and digest.

For the built-in validators and the rules for each source, see the [Validators reference](/reference/validators#the-three-sources).

## Code judges, never a script's own claim

A script validator does not announce its own verdict. It reports a result, and its result contract says how the factory reads that result. The standard has three result contracts:

- `exit-code` reads the exit code alone.
- `document` reads a result document: the one standard form of a check's result, with an outcome, findings and metrics. A finding is one thing the check reports, with an id and an outcome.
- `<namespace>/<adapter>` names an adapter, a program that turns one tool's own output into a result document.

The platform reads the result, and a built-in validator, `daggry/result-gate`, derives the verdict from it. The same result always gives the same verdict. The result and the verdict are sealed as evidence. See [Why you can trust a run](/guide/concepts/trust).

A validator names no tool and no kind of work. The same interface checks a program, a document, a dataset, a configuration or a design file. A binding is a named set of adapters, validators, kinds, effects and conventions that maps the standards onto one kind of work, so the formats of one toolset are adapters in a binding. See [Bindings](/reference/bindings).

## Who admits a validator

A validator judges the work, so an agent never adds or changes one.

- **The tenant** declares its own script validators in the tenant config, under `validators.scripts`. It also decides whether a project's own validators count as evidence, in `projects[].validators.admit`. By default they do not. A project validator that does not count as evidence can still run as a preview for the agent. A preview is never evidence.
- **The project's owner** declares the project's script validators in the project config, under `validators`. The files of a script validator are protected by default. See [What an agent cannot change](/guide/concepts/protection).
- **The cluster admin** installs native validators. The tenant admits each one by name, version and digest, in `validators.native`.

For how the tenant config captures these decisions, see [The tenant defines the factory](/guide/concepts/tenant).

## Next steps

- To name validators in a workflow, read [Write a workflow](/guide/how-to/write-a-workflow).
- To see validators in complete workflows, read [Workflow patterns](/guide/how-to/workflow-patterns).
- For the validator contract, the built-in validators and how to write a validator, see the [Validators reference](/reference/validators).
