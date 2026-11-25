# What it does

An agent left alone can skip a step, pass itself or loop all night.
Daggry has six features, and each one removes one of those problems.
Read this page to learn the six names; the rest of the site uses them.

## The six features

Each feature starts with the problem it removes.

### 1. Workflows

An agent that chooses its own process can skip the part you care about. You describe the work as a file of fixed steps. The agent follows the file and cannot change it, so you know every path a run can take before it starts.

Read more: [Workflows](/guide/concepts/workflows)

### 2. Validators

An agent that reports on its own work can report a pass that did not happen. Code checks every step; an agent never checks its own work. A validator is code with a name: it checks the work and returns pass or fail. You can add your own.

Read more: [Add a validator](/guide/how-to/add-a-validator)

### 3. Approvals

Some decisions are yours, and a wrong guess can waste a night. The run stops where you chose and waits for you. Daggry records your approval against the exact plan you read, so nobody can move it to a different plan.

Read more: [Design a workflow](/guide/how-to/design-a-workflow)

### 4. Protected paths

The easiest way to pass a test is to change the test. An agent cannot change its validators, its instructions or its limits. If a step changes a protected path, Daggry restores the file and the step fails.

Read more: [What an agent cannot change](/guide/concepts/protection)

### 5. Evidence trail

A record that someone can edit later proves nothing. Every result is signed and linked, and you can verify it yourself. One command, `daggry verify`, checks the whole trail again on your own machine.

Read more: [Why you can trust a run](/guide/concepts/trust)

### 6. Isolated runners

Whatever an agent can reach, it can misuse. Each job runs in a throwaway runner that never holds the signing key. The runner holds a token for one project's workspace, so an agent cannot reach another project or sign a record.

Read more: [The modules and where they run](/guide/concepts/modules)

Next: [Run your first workflow](/guide/getting-started)
