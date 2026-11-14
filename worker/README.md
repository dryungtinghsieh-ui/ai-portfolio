# Personal AI Agent Worker

This updates the existing `personal-ai-agent` Worker. The frontend route is
`https://www.ythsieh.dev/agent`; it calls the existing `/api/agent` endpoint directly.
Do not create a second Groq key or put a key in the frontend.

## Deploy

Use the official Cloudflare Wrangler CLI (validated with 4.162.0):

```sh
# From the repository root, after installing website dependencies:
npm run update:agent-research
npm run test:agent
cd worker
npx wrangler@4.162.0 login --scopes account:read user:read workers:write workers_scripts:write
npx wrangler@4.162.0 deploy --dry-run
npx wrangler@4.162.0 deploy
```

Confirm the logged-in account owns the existing Worker. Its existing
`GROQ_API_KEY` secret is preserved by deployment. For a new account only, set
it using `wrangler secret put GROQ_API_KEY`; never commit or print its value.
The `IP_LIMITER` and `SITE_LIMITER` bindings are created from `wrangler.jsonc`.
An absent secret or limiter returns 503 rather than permitting unprotected calls.

`ALLOWED_ORIGINS` uses exact, comma-separated origins, with no path or trailing
slash. Production allows only `https://www.ythsieh.dev`. Add a specific local or
preview origin only when needed; do not allow `*.vercel.app`, `null`, or `*`.
`NEXT_PUBLIC_AGENT_ENDPOINT` is an optional frontend URL override, never a secret.
The default endpoint already points to the existing Worker.

## Contract

```json
{
  "message": "What is the current UTC time?",
  "history": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "How can I help?" }
  ]
}
```

Successful responses contain `answer`, `model`, and `tools_used` (objects with
`id`, `name`, `arguments`, `result`, `status`, and `duration_ms`). History must be
complete alternating user/assistant pairs; privileged roles and tool messages
from clients are rejected. The server supplies its own system prompt and tools.
History is untrusted context, not proof of earlier tool results.

Limits: 32 KiB actual body size, 4,000 characters per new message, ten history
messages, 20,000 total input characters, four model requests, eight tool calls,
2,048 completion tokens per model call, and a shared 40-second upstream deadline.
Errors use appropriate 400/403/405/413/415/429/502/503/504 statuses and never
include upstream error bodies. Rate-limited responses include `Retry-After`.

## Tools and boundaries

- `get_current_time`: UTC ISO timestamp.
- `calculate`: fixed numeric operations; finite numbers and argument validation.
  No expression evaluation, shell execution, or arbitrary code.
- `search_research`: up to three results from the website's four curated
  research projects, including publication/source URLs. This is **not live web
  search**. Update the checked-in JSON with `npm run update:agent-research` when
  research content changes, then redeploy the Worker. Citation counts are omitted
  to avoid presenting a separate stale citation snapshot.

Tools are read-only, dispatch through an explicit registry, and cannot fetch
visitor-supplied URLs, access private accounts, or write files. Tool names and
arguments from the model are validated before dispatch. Tool traces accumulate
across model rounds instead of being read from the final answer's `tool_calls`.

CORS is a browser restriction, **not authentication**: a non-browser client can
forge an Origin. Cloudflare enforces approximately six requests per minute per
IP and thirty requests per minute on a shared site key **per Cloudflare location**.
These counters are eventually consistent and are not a strict global spending
cap. Each accepted request can make up to four Groq calls. The IP key is hashed;
the application does not log prompts or raw IPs. For heavier public traffic, add
Turnstile or sign-in and a globally coordinated budget before increasing limits.

Chat is held in browser memory only; messages/history are sent to Cloudflare
and Groq for processing. This application does not create a chat database;
provider retention policies still apply.

## Validation and rollback

`node --test worker/test/agent.test.mjs` tests the deployed handler with mocked
Groq responses, including tool roundtrips, history validation, CORS, rate limits,
bounded execution, invalid arithmetic, and error redaction. The root citation
tests and Next.js production build should also pass.

After deployment, verify allowed OPTIONS → 204, disallowed OPTIONS → 403, and
one allowed POST exercising tools → 200 with nonempty execution traces. Use an
`Origin: https://www.ythsieh.dev` header for command-line API checks. Invalid
requests can verify the rate limiter without consuming Groq tokens.

Record the current Worker version before updating. The pre-agent version was
`df1cd8f3-5759-46b1-b8e1-2b320e382080`; roll back with
`wrangler rollback <version-id>`. That old version has no CORS or rate protection,
so prefer fixing the new version unless an urgent rollback is necessary.

Official references:
- https://console.groq.com/docs/tool-use/local-tool-calling
- https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/
