# HTTP API

*Reference*

The `daggry` CLI calls an HTTP API, and a tool of your own can call the same routes. This page lists the routes, their request and response fields, the status codes and the run states. Read it if you write a client or a script that starts or watches runs. If you use the CLI, the [CLI reference](/reference/cli) is enough.

Two routes add to the evidence trail: `/v1/run` seals a run lock and the work item, and `/v1/approve` seals an approval bound to a digest. Three routes serve the trail so that a client can verify it: `/v1/chain`, `/v1/blob` and `/v1/seal-key`.

## Conventions

Every call follows these conventions.

- Every call is `POST <base-url><path>` with the request as a JSON body and `content-type: application/json`.
- A 2xx answer carries the response as JSON.
- A request refuses unknown fields. A response can gain fields, so a client ignores the ones it does not know.
- Byte fields are lowercase hexadecimal strings.
- A digest is a 64-digit lowercase hexadecimal string. Run ids and artifact ids are strings.

Every call carries your tenant token in the `Authorization: Bearer <tenant-token>` header. The control plane stores only the SHA-256 hash of the token, and a token reaches one tenant only.

A raw call looks like this. The values are illustrative.

```text
POST <DAGGRY_URL>/v1/status
authorization: Bearer <tenant-token>
content-type: application/json

{"run":"<run-id>"}
```

```json
{"state":"running","attempts":[],"waiting_for":null}
```

## Status codes

The table lists the status codes.

| Status | Meaning |
|---|---|
| 200 | The call succeeded. The body is the response. |
| 400 | A well-formed request that the control plane refuses. The body is the reason as text. |
| 401 | A missing or malformed credential, or a wrong token. The body is `unauthenticated`. |
| 500 | A server fault. The body is empty. |

A client treats any 4xx as a refusal. It treats a 5xx as a failure that it can retry. A run of another tenant reads as `unknown run`.

## Routes

The first table lists the routes, which all take the tenant token. The second table lists the fields of each body.

| Path | Request body | Response body | Used by |
|---|---|---|---|
| `/v1/run` | run request | run response | `daggry run` |
| `/v1/status` | status request | status report | `daggry status` |
| `/v1/approve` | approve request | accepted | `daggry approve` |
| `/v1/logs` | logs request | log entries | `daggry logs` |
| `/v1/chain` | none | log entries | `daggry verify` |
| `/v1/blob` | blob request | blob response | `daggry verify` |
| `/v1/seal-key` | seal-key request | seal-key response | `daggry verify` |

Each body has these fields.

| Body | Fields |
|---|---|
| run request | `workflow` (string, the workflow text), `workspace` (string), `item` (string, what names the work item), `objective` (string, the objective as text). At least one of `item` and `objective`. |
| run response | `run` (the run id) |
| status request | `run` |
| status report | `state` (a state), `attempts` (array of `{job, n, state}`, where `n` is a number), `waiting_for` (a reason or `null`), `trigger` (the name of the trigger that started the run, absent for a run a client started) |
| approve request | `run`, `unfreeze` (string path or `null`) |
| accepted | no fields |
| logs request | `run` |
| log entries | `entries` (array of [log entries](/reference/envelope#log-entry)). The `/v1/chain` call answers with your tenant's whole evidence trail. |
| blob request | `digest` |
| blob response | `bytes` (hex) |
| seal-key request | `key_id` |
| seal-key response | `key_id`, `public_key` (64 hexadecimal digits, an Ed25519 public key of 32 bytes) |

A client accepts a status report with `waiting_for` missing as `null`.

## States and reasons

A run and an attempt share one set of seven states, written in lowercase.

<RunStates />

The diagram groups the seven states: two while the run works, two while it waits and three once it has ended.

| State | Meaning |
|---|---|
| `queued` | The run is accepted and no job has started. |
| `running` | A job is running. A run never reads `queued` again. |
| `waiting` | A person is needed. `waiting_for` names the reason. |
| `parked` | A limit is reached, and the work waits for it to reset. |
| `succeeded` | Terminal. The run finished. |
| `failed` | Terminal. The run failed. |
| `stopped` | Terminal. A person stopped the run, for example by removing the label that started it or by closing the issue, or nobody answered for 14 days. |

The table lists the values of `waiting_for`.

| `waiting_for` | Meaning |
|---|---|
| `approval` | The run is at a checkpoint. An approver's yes continues it. |
| `answer` | A persona asked a question on the issue. The next reply from a person continues the step. |

## Next steps

The list names the pages to read next.

- For the commands built on these routes, see the [CLI reference](/reference/cli).
- For the workflow that a run carries, see the [Workflow file](/reference/workflow-schema).
