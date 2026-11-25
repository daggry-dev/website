# What it does

An agent left alone can skip a step, pass itself or loop all night.
Daggry has six features, and each one removes one of those problems.
Read this page to learn the six names; the rest of the site uses them.

## The six features

Each feature removes one problem. The sections say how.

<FeatureGrid />

### 1. Workflows

You describe the work as a file of fixed steps. The agent follows the file and cannot change it, so you know every path a run can take before it starts.

Read more: [Workflows](/guide/concepts/workflows)

### 2. Validators

Code checks every step; an agent never checks its own work. A validator is code with a name: it measures the work and reports. A judge turns the evidence trail into a verdict of pass or fail. You can add your own validators.

Read more: [Add a validator](/guide/how-to/add-a-validator)

### 3. Approvals

The run stops where you chose and waits for you. Daggry records your approval against the exact plan you read, so nobody can move it to a different plan.

Read more: [Design a workflow](/guide/how-to/design-a-workflow)

### 4. Protected paths

An agent cannot change its validators, its instructions or its limits. If a step changes a protected path, Daggry restores the file and the step fails.

Read more: [What an agent cannot change](/guide/concepts/protection)

### 5. Evidence trail

Every result is signed and linked, and you can verify it yourself. One command, `daggry verify`, checks the whole trail again on your own machine.

Read more: [Why you can trust a run](/guide/concepts/trust)

### 6. Isolated runners

Each job runs in a throwaway runner that never holds the signing key. The runner holds a token for one project's workspace, so an agent cannot reach another project or sign a record.

Read more: [The modules and where they run](/guide/concepts/modules)

Next: [Run your first workflow](/guide/getting-started)
