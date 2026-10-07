import type { Concept } from '../../types'

export const llmopsDeployment: Concept[] = [
  {
    id: 'ops-serving-latency-cost',
    title: 'Latency, cost and serving',
    category: 'LLMOps & Deployment',
    summary: `LLM requests are slow and priced per token, so production work is mostly about managing **latency** and **cost** without losing quality. The main levers are sending fewer tokens, generating fewer tokens, **streaming** the response, **caching**, routing easy requests to **smaller models**, and for self-hosted models, **quantization** and **batching**.`,
    keyPoints: [
      'Time to first token drives perceived speed; streaming improves it.',
      'Output tokens are generated one at a time, so they dominate latency.',
      'Cost is roughly input tokens plus output tokens, each times its price.',
      'Cache at several levels: exact responses, semantic matches, and provider-side prompt caching.',
      'Use the smallest model that passes your evaluation set.',
    ],
    relatedConceptIds: ['ops-observability-guardrails', 'sd-reliability-scaling', 'llm-sampling'],
    questions: [
      {
        id: 'ops-serving-latency-cost-1',
        question: 'How would you reduce the latency of an LLM application?',
        answer: `First I measure where the time goes, splitting retrieval, model calls and tool calls, and tracking time to first token separately from total time.

Then, roughly in order of payoff:

- **Stream the response.** It does not reduce total time, but the user sees output almost immediately.
- **Generate fewer output tokens.** Output is produced sequentially, so shorter answers and tighter formats are directly faster.
- **Use a smaller or faster model** for steps that do not need the strongest one.
- **Shrink the prompt:** fewer and better retrieved chunks, shorter instructions.
- **Cache** repeated requests, and use prompt caching for a long stable prefix.
- **Parallelise** independent LLM and tool calls instead of running them one after another.
- **Reduce the number of calls** in a chain or agent loop.

For anything that is still slow, I move it to a background job and notify the user when it is done.`,
        difficulty: 'medium',
        tags: ['llmops', 'latency'],
        followUps: ['What is the difference between time to first token and total latency?'],
      },
      {
        id: 'ops-serving-latency-cost-2',
        question: 'How would you reduce the cost of an LLM application?',
        answer: `Cost is driven by tokens and by which model handles them, so I attack both.

- **Model routing.** Send simple requests to a small cheap model and reserve the large one for hard cases. This is usually the largest saving.
- **Shorter prompts.** Trim instructions, retrieve fewer chunks, summarize long history.
- **Cap output length** and ask for concise formats.
- **Caching.** Exact-match caching for repeated queries, and provider prompt caching for a large shared prefix such as a system prompt or a document.
- **Batch APIs** for work that is not time-sensitive, where providers offer a discount.
- **Fewer calls.** Simplify chains and limit agent steps.
- **Fine-tune a small model** for a high-volume narrow task.

I track cost per request and per feature, so I know where the spend is, and I check every optimisation against the evaluation set so I am not quietly trading away quality.`,
        difficulty: 'medium',
        tags: ['llmops', 'cost'],
        followUps: ['How would you decide which requests can go to the cheaper model?'],
      },
      {
        id: 'ops-serving-latency-cost-3',
        question: 'What caching strategies apply to LLM applications?',
        answer: `- **Exact-match response cache.** Key on the full request (model, prompt, parameters) and return the stored response on a repeat. Simple and safe, but only hits on identical inputs.
- **Semantic cache.** Embed the query and return a cached answer if a previous query is similar enough. Higher hit rate, but there is a risk of returning the answer to a question that is close in wording and different in meaning, so the threshold needs care.
- **Prompt caching (provider-side).** The provider caches the processed form of a long, repeated prompt prefix, so later requests that start with the same prefix are cheaper and faster. To benefit, I put stable content first and variable content last.
- **Caching intermediate work:** embeddings, retrieval results and tool outputs.

The things to get right are invalidation when the underlying data changes, never sharing cached answers across users when responses are personalised or permission-dependent, and not caching when variety is the point.`,
        difficulty: 'medium',
        tags: ['llmops', 'caching'],
        followUps: ['What is the risk of semantic caching in a multi-tenant application?'],
      },
      {
        id: 'ops-serving-latency-cost-4',
        question: 'What is quantization and why is it used when serving models?',
        answer: `Quantization reduces the numerical precision of a model's weights, for example from 16-bit floating point to 8-bit or 4-bit integers.

The benefits are a smaller memory footprint, so a model fits on a smaller or cheaper GPU or even on a CPU or a laptop, and often faster inference because less data moves through memory.

The cost is some loss of accuracy, since the weights are approximated. Moderate quantization such as 8-bit usually has a small effect; pushing to very low bit widths degrades quality more noticeably, and the impact varies by model and task.

So it is a tradeoff between resources and quality, and I would confirm it on my own evaluation set. It is what makes running open models locally practical.`,
        difficulty: 'medium',
        tags: ['llmops', 'quantization'],
        followUps: ['When would you self-host a model instead of using an API?'],
      },
      {
        id: 'ops-serving-latency-cost-5',
        question: 'When would you self-host an open model instead of using a hosted API?',
        answer: `I default to a hosted API, because it needs no infrastructure, gives access to the strongest models, and scales without my involvement. I would self-host when one of these applies:

- **Data privacy or compliance:** the data is not allowed to leave my environment.
- **Cost at high, steady volume:** past a certain throughput, dedicated GPUs can be cheaper than per-token pricing.
- **Customisation:** I need a fine-tuned model or control over the serving stack.
- **Latency or availability control:** no dependency on a third party's rate limits or outages.
- **Offline or edge deployment.**

The costs of self-hosting are substantial: GPU capacity, an inference server, autoscaling, monitoring, upgrades, and an idle GPU still costs money. Open models may also trail the best proprietary ones on hard tasks. So the decision comes down to whether those requirements are real enough to justify operating it.`,
        difficulty: 'medium',
        tags: ['llmops', 'deployment'],
        followUps: ['What would you need to run to serve an open model in production?'],
      },
    ],
  },
  {
    id: 'ops-observability-guardrails',
    title: 'Observability and guardrails',
    category: 'LLMOps & Deployment',
    summary: `An LLM application can fail without throwing an error: it returns a confident wrong answer. So production needs **observability** (traces of every prompt, response, tool call, token count and latency) to see what happened, and **guardrails** (checks on input and output) to stop bad requests and bad responses. Prompts and models are versioned and released like code.`,
    keyPoints: [
      'Trace each request end to end: every model call, retrieval and tool call.',
      'Track quality as well as latency, errors and cost.',
      'Input guardrails: prompt injection, off-topic requests, PII. Output guardrails: unsafe content, leaks, invalid format.',
      'Version prompts and pin model versions so behaviour changes are deliberate.',
      'Roll out changes gradually and keep a fast rollback path.',
    ],
    relatedConceptIds: ['ops-serving-latency-cost', 'eval-in-practice', 'prompt-structured-output'],
    questions: [
      {
        id: 'ops-observability-guardrails-1',
        question: 'What would you monitor in a production LLM application?',
        answer: `Four groups of things.

**Operational:** latency (time to first token and total, at p50 and p95), error rates, timeouts and rate-limit hits.

**Cost:** input and output tokens per request, cost per request, per user and per feature.

**Quality:** automated grader scores on sampled traffic, such as faithfulness and relevance; user feedback; and implicit signals such as retries, rephrased questions and abandoned sessions.

**Safety:** guardrail triggers, suspected prompt injection attempts, and refusals.

On top of the metrics I want **traces**: for any single request, the full sequence of prompts, retrieved documents, tool calls and responses. Metrics tell me that something is wrong; traces tell me why. I also watch for drift, where the kinds of questions users ask change over time and quality falls even though nothing in the system changed.`,
        difficulty: 'medium',
        tags: ['llmops', 'monitoring'],
        followUps: ['How would you notice that quality dropped after a model provider update?'],
      },
      {
        id: 'ops-observability-guardrails-2',
        question: 'What are guardrails, and how would you implement them?',
        answer: `Guardrails are checks around the model that enforce what goes in and what comes out.

**Input guardrails,** before the model call:

- Detect prompt injection and jailbreak attempts.
- Block off-topic or disallowed requests.
- Detect and redact personal data.
- Enforce length and rate limits.

**Output guardrails,** before the response reaches the user:

- Validate the structure against a schema.
- Filter harmful or policy-violating content.
- Check for leaked personal data or system prompt content.
- For RAG, check that the answer is grounded in the sources.

For implementation I use the cheapest tool that works for each check: rules and regular expressions for simple patterns, small classifier models for moderation, and an LLM check only for nuanced cases, since every guardrail adds latency. I also decide what happens on a failure: block, retry, fall back to a safe message, or escalate to a person.`,
        difficulty: 'medium',
        tags: ['llmops', 'guardrails', 'safety'],
        followUps: ['How do guardrails interact with streaming responses?'],
      },
      {
        id: 'ops-observability-guardrails-3',
        question: 'How do you safely roll out a change to a prompt or model?',
        answer: `I treat it like any risky code change.

1. **Version it.** The prompt and the model identifier are in version control, and the model version is pinned so it cannot change underneath me.
2. **Run the offline evaluation set** and compare with the current version, looking at overall scores and at individual cases that got worse.
3. **Shadow or canary.** Either run the new version on real traffic without showing its output, or send it a small percentage of users.
4. **Monitor** quality, latency, cost and error metrics for the new version against the old.
5. **Ramp up gradually** if the numbers hold.
6. **Keep a quick rollback,** ideally a configuration switch instead of a redeploy.

When changing models I re-test the prompts too, since a prompt tuned for one model can behave differently on another.`,
        difficulty: 'medium',
        tags: ['llmops', 'deployment'],
        followUps: ['What is a shadow deployment and when is it useful?'],
      },
      {
        id: 'ops-observability-guardrails-4',
        question: 'How do you handle sensitive data such as PII in an LLM application?',
        answer: `- **Minimise.** Send the model only the data it needs for the task.
- **Redact or mask** personal data before it goes into the prompt, and restore it afterwards if the workflow needs it.
- **Know the provider's terms:** whether inputs are retained, for how long, whether they are used for training, and in which region they are processed. Use zero-retention or enterprise options when required.
- **Access control in retrieval.** A user must only get chunks from documents they are permitted to see, enforced as a filter in the retrieval query and not left to the model.
- **Careful logging.** Traces contain prompts and responses, so logs need redaction, restricted access and a retention policy.
- **Output checks** for leaked personal data.
- **Self-hosting** when data cannot leave the environment at all.

The general rule is that the model should never be the thing that enforces a permission.`,
        difficulty: 'hard',
        tags: ['llmops', 'privacy', 'security'],
        followUps: ['How would you enforce document-level permissions in a RAG system?'],
      },
    ],
  },
]
