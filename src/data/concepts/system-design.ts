import type { Concept } from '../../types'

export const systemDesign: Concept[] = [
  {
    id: 'sd-rag-chat-system',
    title: 'Designing a document Q&A system',
    category: 'System Design for AI Apps',
    summary: `"Design a chatbot over our documents" is the most common AI system design question. A strong answer clarifies requirements first, then separates the **ingestion path** (parse, chunk, embed, index, keep fresh) from the **query path** (rewrite, retrieve, rerank, generate, cite), and then covers the things that make it production-grade: permissions, evaluation, latency, cost and failure handling.

\`\`\`
Ingestion:  sources -> parse -> chunk -> embed -> vector index (+ metadata)
Query:      question -> rewrite -> retrieve (hybrid) -> rerank -> prompt -> LLM -> answer + citations
\`\`\``,
    keyPoints: [
      'Start with requirements: data size and type, freshness, users, latency, accuracy, permissions.',
      'Ingestion is an offline, asynchronous pipeline; querying is the low-latency online path.',
      'Permissions are enforced with metadata filters at retrieval time.',
      'Plan for document updates and deletions, not just the first load.',
      'Say how you would evaluate it and what you would monitor.',
    ],
    relatedConceptIds: ['rag-retrieval-reranking', 'rag-chunking', 'sd-reliability-scaling', 'emb-vector-search'],
    questions: [
      {
        id: 'sd-rag-chat-system-1',
        question: 'Design a chatbot that answers questions over the internal documents of a company.',
        answer: `I would start by clarifying: how many documents and what formats, how often they change, how many users, the latency target, and whether different users can see different documents.

**Ingestion pipeline (asynchronous):**

1. Connectors pull documents from the sources.
2. Parse to clean text, keeping structure such as headings and tables.
3. Chunk on structure, and attach metadata: source, title, section, date, access groups.
4. Embed and store in a vector index, with a keyword index alongside.

**Query path:**

1. Authenticate the user and load their permissions.
2. Rewrite the question into a standalone query using the chat history.
3. Hybrid retrieval, filtered by the user's permissions.
4. Rerank and keep the top few chunks.
5. Generate with a prompt that says to answer only from the context, cite sources, and say so when the answer is not there.
6. Stream the answer with citations.

**Around it:** an evaluation set for retrieval and generation, tracing, feedback buttons, caching, and incremental re-indexing when documents change.`,
        difficulty: 'hard',
        tags: ['system-design', 'rag'],
        followUps: [
          'How do you keep the index up to date when documents change?',
          'How would this design change for 100 million documents?',
        ],
      },
      {
        id: 'sd-rag-chat-system-2',
        question: 'How do you keep a RAG index fresh as documents are added, changed and deleted?',
        answer: `I treat indexing as a continuous pipeline, not a one-time load.

- **Detect changes** through webhooks or change events from the source where available, otherwise scheduled polling using last-modified timestamps or content hashes.
- **Process incrementally.** Only re-chunk and re-embed documents that changed. Storing a hash per document or per chunk lets me skip unchanged content.
- **Handle updates as replace.** Each chunk carries its document id, so I can delete all the old chunks for a document and insert the new ones.
- **Handle deletions,** including documents whose access was revoked, or the system will keep answering from content that should be gone.
- **Run it asynchronously** on a queue with retries, so a burst of changes does not affect query traffic.
- **Monitor lag** between a source change and the index reflecting it.

I also keep metadata such as the last-updated date on each chunk, so I can filter or prefer recent content and show the user how current a source is.`,
        difficulty: 'hard',
        tags: ['system-design', 'rag', 'indexing'],
        followUps: ['What happens when you need to change the embedding model?'],
      },
      {
        id: 'sd-rag-chat-system-3',
        question: 'How do you enforce document permissions in a RAG system?',
        answer: `Enforcement has to happen at **retrieval**, in code, before anything reaches the model. If a restricted chunk gets into the prompt, I cannot rely on the model to keep it secret.

How I would do it:

- **At ingestion,** store access metadata with every chunk: the users, groups or tenant allowed to see the source document.
- **At query time,** resolve the current user's identity and groups, and apply them as a mandatory filter in the vector and keyword search.
- **Keep permissions in sync** with the source system, including revocations, which should take effect quickly.
- **For strict multi-tenant isolation,** use a separate index or namespace per tenant, so a missing filter cannot leak across tenants.
- **Never cache answers across users** whose permissions differ.

I would also test it explicitly, with cases that check a user cannot get content from a document they should not see.`,
        difficulty: 'hard',
        tags: ['system-design', 'security', 'rag'],
        followUps: ['Why is it not enough to tell the model in the prompt which documents the user may see?'],
      },
      {
        id: 'sd-rag-chat-system-4',
        question: 'How would you handle multi-turn conversations in a RAG chatbot?',
        answer: `Two separate problems: what to retrieve, and what to send to the model.

**Retrieval.** A follow-up like "and what about the enterprise plan?" is meaningless on its own. So before retrieving I use an LLM call to rewrite the latest message into a **standalone query** using the conversation history, and search with that.

**Context for generation.** I cannot send unlimited history. I keep the most recent turns verbatim, summarize older ones, and include the freshly retrieved chunks for the current question. Chunks retrieved for earlier turns are generally dropped unless they are still relevant, since they are the bulkiest part.

**Storage.** The conversation is persisted server-side by session id, so it survives reloads and can be continued.

I also handle topic switches: if the new question is unrelated, the rewrite step should produce a clean query that ignores the old context.`,
        difficulty: 'medium',
        tags: ['system-design', 'rag', 'conversation'],
        followUps: ['When would you skip retrieval entirely for a turn?'],
      },
    ],
  },
  {
    id: 'sd-reliability-scaling',
    title: 'Reliability and scaling of LLM systems',
    category: 'System Design for AI Apps',
    summary: `An LLM provider is a slow, rate-limited, occasionally failing dependency, and you design around it like any other: **timeouts**, **retries with backoff**, **fallbacks**, **queues** for long work, and **streaming** for interactive work. The application tier is usually stateless and scales horizontally; the real limits are provider rate limits, cost and the latency of the model.`,
    keyPoints: [
      'Retry transient errors (429, 5xx, timeouts) with exponential backoff and jitter.',
      'Have a fallback: another model or provider, a cached answer, or a clear degraded response.',
      'Stream interactive responses; run long tasks as background jobs.',
      'Enforce per-user rate limits and budgets to protect cost and shared quota.',
      'Make operations with side effects idempotent so retries are safe.',
    ],
    relatedConceptIds: ['sd-rag-chat-system', 'ops-serving-latency-cost', 'agent-loops-planning', 'be-rest-api'],
    questions: [
      {
        id: 'sd-reliability-scaling-1',
        question: 'How do you handle rate limits and failures from an LLM provider?',
        answer: `- **Retries with exponential backoff and jitter** for transient errors: rate limits (429), server errors (5xx) and timeouts. Jitter stops many clients from retrying at the same instant. I do not retry client errors such as an invalid request, because they will fail again.
- **Timeouts** on every call, so a stuck request does not hold resources forever.
- **Fallbacks:** a secondary model or provider when the primary is down or throttled.
- **Queueing and concurrency limits** on my side, so I stay under the provider's quota instead of hammering it.
- **Per-user rate limits,** so one heavy user cannot use up the shared quota.
- **A circuit breaker** that stops calling a failing provider for a short period.
- **Graceful degradation:** a cached answer or a clear message, not a broken page.

For work that is not interactive, I put it on a queue and process it at a controlled rate.`,
        difficulty: 'medium',
        tags: ['system-design', 'reliability'],
        followUps: ['Why add jitter to exponential backoff?'],
      },
      {
        id: 'sd-reliability-scaling-2',
        question: 'How would you implement streaming responses from the LLM to the browser?',
        answer: `The provider API supports streaming, returning the response as a series of small chunks as tokens are generated.

On the backend, my endpoint calls the provider with streaming enabled and forwards each chunk to the client as it arrives, without buffering. The usual transport is **Server-Sent Events**: a single long-lived HTTP response with a text event-stream content type, which is simple, one-directional and works over plain HTTP. WebSockets are an alternative when I need two-way communication.

On the frontend, I read the stream and append each chunk to the message in state, so the text appears progressively.

Details that matter: disable buffering in any proxy in between, handle the client disconnecting so I can cancel the upstream call and stop paying for tokens, handle errors that occur mid-stream, and store the full message once the stream completes.`,
        difficulty: 'medium',
        tags: ['system-design', 'streaming'],
        followUps: ['How do you apply output guardrails when the response is streamed?'],
      },
      {
        id: 'sd-reliability-scaling-3',
        question: 'How would you design for long-running AI tasks, such as a research agent that takes several minutes?',
        answer: `I would not hold an HTTP request open for minutes. I make it asynchronous.

1. The client submits the task. The API validates it, creates a **job record**, puts the job on a **queue**, and immediately returns a job id.
2. **Worker processes** pick jobs off the queue and run the agent. They scale independently of the API.
3. The worker writes **progress and state** to the database as it goes, so the task can resume from a checkpoint if a worker crashes instead of starting over.
4. The client gets updates by polling a status endpoint, or through Server-Sent Events or a WebSocket for live progress.
5. When finished, the result is stored and the user is notified.

I would add limits on steps, time and cost per job, retries with idempotent steps so a retried job does not repeat side effects, a way for the user to cancel, and concurrency limits so that jobs stay within the provider's rate limits.`,
        difficulty: 'hard',
        tags: ['system-design', 'async', 'agents'],
        followUps: ['How would you make a multi-step job safe to resume after a crash?'],
      },
      {
        id: 'sd-reliability-scaling-4',
        question: 'How do you scale an LLM application to many concurrent users?',
        answer: `Most of the time in a request is spent waiting on the model, so the work is I/O-bound.

- **Stateless, async API servers** behind a load balancer, scaled horizontally. Conversation state lives in a database or cache, not in server memory.
- **Async I/O,** so one server can hold many in-flight model calls without tying up a thread for each.
- **The provider is the real bottleneck.** I manage rate limits with queueing and concurrency control, request higher quotas, and spread load across models or providers if needed.
- **Caching** to avoid repeated model calls.
- **Background workers** for heavy tasks such as ingestion and long agent runs, separate from the interactive path.
- **Scale the data layer:** the vector index with replicas or sharding, and connection pooling for the database.
- **Per-user limits and budgets** to control cost and abuse.

I would load-test to find the first bottleneck. It is usually the provider rate limit or the database, not the application servers.`,
        difficulty: 'hard',
        tags: ['system-design', 'scaling'],
        followUps: ['Where would you store conversation state, and why not in server memory?'],
      },
    ],
  },
]
