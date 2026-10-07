import type { Concept } from '../../types'

export const backend: Concept[] = [
  {
    id: 'be-fastapi',
    title: 'FastAPI',
    category: 'Backend',
    summary: `FastAPI is a Python web framework built on **Starlette** (the ASGI web layer) and **Pydantic** (data validation). You declare request and response shapes with type hints, and it validates input, serializes output and generates OpenAPI documentation from them. It is async-first, which suits AI backends where most of the time is spent waiting on a model API or a database.`,
    keyPoints: [
      'Type hints drive validation, serialization and the auto-generated docs.',
      'An async def endpoint runs on the event loop; a plain def endpoint runs in a thread pool.',
      'Never make a blocking call inside an async def endpoint.',
      'Depends provides dependency injection for database sessions, auth and shared logic.',
      'StreamingResponse is used to stream LLM output to the client.',
    ],
    relatedConceptIds: ['be-rest-api', 'be-postgresql', 'sd-reliability-scaling'],
    questions: [
      {
        id: 'be-fastapi-1',
        question: 'Why would you choose FastAPI for an AI backend?',
        answer: `A few reasons that matter in practice.

- **Async support.** An AI backend spends most of its time waiting on model APIs, vector databases and other services. With async I/O, one worker can handle many concurrent requests while they wait.
- **Validation from type hints.** I define request and response models with Pydantic, and invalid input is rejected with a clear error before my code runs.
- **Automatic documentation.** It generates an OpenAPI schema and interactive docs, which helps frontend integration.
- **Streaming.** Returning a streaming response for token-by-token LLM output is straightforward.
- **The Python ecosystem.** The model SDKs, LangChain, and data libraries are all Python, so there is no language boundary.

It is also lightweight, with little boilerplate, so it is quick to build and easy to read.`,
        difficulty: 'easy',
        tags: ['fastapi', 'python'],
        followUps: ['How does FastAPI compare with Flask and Django?'],
      },
      {
        id: 'be-fastapi-2',
        question: 'What is the difference between def and async def endpoints in FastAPI?',
        answer: `An **async def** endpoint runs directly on the event loop. When it awaits something, such as an HTTP call or a database query through an async driver, the loop is free to handle other requests. That is how one process serves many concurrent requests.

A plain **def** endpoint is run by FastAPI in a separate **thread pool**, so a blocking call inside it does not block the event loop.

The mistake to avoid is a **blocking call inside an async def** endpoint, for example a synchronous HTTP library, a synchronous database driver or time.sleep. That blocks the event loop itself, so every other request on that worker stalls until it finishes.

My rule: use async def when everything I call is awaitable; use plain def when I depend on blocking libraries; and for the occasional blocking call inside async code, push it to a thread.`,
        difficulty: 'medium',
        tags: ['fastapi', 'async'],
        followUps: ['How would you run CPU-heavy work without blocking the server?'],
      },
      {
        id: 'be-fastapi-3',
        question: 'How does dependency injection work in FastAPI?',
        answer: `I declare a dependency by adding a parameter with **Depends** and a function. Before calling my endpoint, FastAPI calls that function, resolves any dependencies it has in turn, and passes the result in.

Typical uses:

- **Database sessions.** A dependency that yields a session and closes it afterwards. Code after the yield runs as cleanup once the request is done.
- **Authentication.** A dependency that reads the token, verifies it and returns the current user, or raises a 401.
- **Shared parameters and configuration,** such as pagination or settings.

The benefits are that cross-cutting logic lives in one place instead of being repeated in every endpoint, dependencies can build on each other, and in tests I can **override** a dependency, for example swapping the real database or the LLM client for a fake.`,
        difficulty: 'medium',
        tags: ['fastapi', 'dependency-injection'],
        followUps: ['How would you replace the LLM client with a fake in tests?'],
      },
      {
        id: 'be-fastapi-4',
        question: 'What role does Pydantic play in FastAPI?',
        answer: `Pydantic defines data models as Python classes with type annotations, and validates and converts data against them.

In FastAPI it does three jobs:

- **Request validation.** When I type a request body as a Pydantic model, FastAPI parses the JSON, checks the types and constraints, and returns a 422 response with details if it is invalid. My function only ever receives valid data.
- **Response serialization.** A response model controls what is returned, converting objects to JSON and **filtering out fields** that are not in the model, which keeps things like password hashes from leaking.
- **Documentation.** The same models produce the OpenAPI schema.

It is also directly useful for LLM work: I define the structure I expect from a model as a Pydantic class, derive the JSON schema to send to the model, and validate the response with it.`,
        difficulty: 'easy',
        tags: ['fastapi', 'pydantic', 'validation'],
        followUps: ['How would you use Pydantic to validate structured output from an LLM?'],
      },
      {
        id: 'be-fastapi-5',
        question: 'How would you handle a long-running task triggered by an API request?',
        answer: `It depends on how long and how important the task is.

For **short, non-critical work** after the response, such as sending a notification or writing a log, FastAPI's **background tasks** are enough. They run in the same process after the response is sent. The limitation is that there is no persistence or retry: if the process restarts, the task is lost.

For **long or important work**, such as document ingestion or an agent run, I use a proper **task queue** with separate workers, for example Celery with Redis or a similar system. The endpoint enqueues the job and returns a job id immediately with a 202 status, and the client polls a status endpoint or receives updates over Server-Sent Events.

That gives retries, persistence across restarts, and the ability to scale workers independently from the API.`,
        difficulty: 'medium',
        tags: ['fastapi', 'background-tasks', 'queues'],
        followUps: ['Why is an in-process background task risky for important work?'],
      },
    ],
  },
  {
    id: 'be-rest-api',
    title: 'REST API design',
    category: 'Backend',
    summary: `REST models an API as **resources** identified by URLs and manipulated with standard HTTP methods. Good REST design is mostly about being predictable: consistent naming, correct use of methods and status codes, statelessness, and sensible handling of pagination, errors, versioning and authentication.`,
    keyPoints: [
      'Nouns for resources, HTTP methods for actions.',
      'GET, PUT and DELETE are idempotent; POST is not.',
      'Use status codes precisely: 2xx success, 4xx client error, 5xx server error.',
      '401 means not authenticated; 403 means authenticated but not allowed.',
      'Paginate every list endpoint.',
    ],
    relatedConceptIds: ['be-fastapi', 'be-postgresql', 'sd-reliability-scaling'],
    questions: [
      {
        id: 'be-rest-api-1',
        question: 'What are the main HTTP methods, and which of them are idempotent?',
        answer: `- **GET** reads a resource. Safe and idempotent.
- **POST** creates a resource or triggers an action. Not idempotent: sending it twice can create two records.
- **PUT** replaces a resource entirely. Idempotent: sending the same body twice leaves the same state.
- **PATCH** partially updates a resource. Not guaranteed to be idempotent, since it depends on the operation.
- **DELETE** removes a resource. Idempotent: after the first call the resource is gone, and repeating it does not change that.

**Idempotent** means making the same request several times has the same effect on server state as making it once. It matters because clients and proxies retry on network failures. Retrying an idempotent request is safe; retrying a POST may not be, which is why payment-style endpoints accept an **idempotency key** so the server can recognise a repeat.`,
        difficulty: 'easy',
        tags: ['rest', 'http'],
        followUps: ['How does an idempotency key work?'],
      },
      {
        id: 'be-rest-api-2',
        question: 'Which HTTP status codes do you use most, and what is the difference between 401 and 403?',
        answer: `The ones I use regularly:

- **200** OK, **201** Created, **202** Accepted for async work, **204** No Content.
- **400** Bad Request for malformed input, **422** for input that is well-formed but fails validation.
- **401** Unauthorized, **403** Forbidden, **404** Not Found.
- **409** Conflict, for example a duplicate or a version clash.
- **429** Too Many Requests, for rate limiting.
- **500** for an unexpected server error, **502**, **503** and **504** for upstream or availability problems.

**401 versus 403:** 401 means the request is **not authenticated**: credentials are missing or invalid, so the client should log in. 403 means the client **is authenticated but not allowed** to do this, so logging in again will not help.

The broader point is that 4xx tells the client it needs to change the request, while 5xx tells it the fault is on the server and a retry may work.`,
        difficulty: 'easy',
        tags: ['rest', 'http', 'status-codes'],
        followUps: ['When would you return 404 instead of 403 for a resource the user cannot access?'],
      },
      {
        id: 'be-rest-api-3',
        question: 'How do you implement pagination, and what is the difference between offset and cursor pagination?',
        answer: `**Offset pagination** uses a page number or an offset with a limit. It is simple and lets the user jump to any page. It has two problems: on large tables it gets slow, because the database still has to walk past all the skipped rows, and if rows are inserted or deleted while someone is paging, they see duplicates or miss items.

**Cursor pagination** returns an opaque cursor that points at the last item seen, usually based on a unique, ordered column such as an id or a timestamp with an id. The next request asks for items after that cursor. With an index on the column, it stays fast however deep the user goes, and it is stable when data changes. The tradeoffs are that there is no jumping to an arbitrary page, and it is slightly more work to implement.

I use offset for small or admin-style data where page numbers matter, and cursor for large or frequently changing lists such as feeds, logs and chat history.`,
        difficulty: 'medium',
        tags: ['rest', 'pagination'],
        followUps: ['Why does a large offset make a query slow?'],
      },
      {
        id: 'be-rest-api-4',
        question: 'What is the difference between session-based authentication and JWT?',
        answer: `With **sessions**, the server creates a session record after login and gives the browser a session id in a cookie. On every request the server looks up that id. The server holds the state, so revoking a session is simple: delete the record. The cost is a lookup per request and shared session storage when there are several servers.

With **JWT**, the server issues a signed token containing claims such as the user id and an expiry. The client sends it with each request, and the server only needs to verify the signature, with no lookup. That is stateless, which suits multiple services. The main weakness is **revocation**: a token stays valid until it expires. The usual answer is short-lived access tokens with a refresh token, and a denylist if immediate revocation is required.

Two things I keep in mind with JWTs: the payload is encoded, not encrypted, so it must not hold secrets, and where the token is stored in the browser matters for security.`,
        difficulty: 'medium',
        tags: ['rest', 'auth', 'jwt'],
        followUps: ['Where should a JWT be stored in the browser, and why?'],
      },
    ],
  },
  {
    id: 'be-postgresql',
    title: 'PostgreSQL',
    category: 'Backend',
    summary: `PostgreSQL is a relational database with strong consistency guarantees (ACID transactions), a capable query planner, and extensions such as **pgvector** that make it useful for AI applications too. Interview questions concentrate on **indexes**, **transactions and isolation**, reading **query plans**, and common performance problems such as N+1 queries and connection exhaustion.`,
    keyPoints: [
      'Indexes speed up reads and slow down writes; add them for real query patterns.',
      'B-tree is the default index; GIN suits JSONB, arrays and full-text search.',
      'EXPLAIN ANALYZE shows the actual plan and timings of a query.',
      'The default isolation level is Read Committed.',
      'Connections are expensive, so use a connection pool.',
    ],
    relatedConceptIds: ['be-rest-api', 'be-fastapi', 'emb-vector-search'],
    questions: [
      {
        id: 'be-postgresql-1',
        question: 'What is a database index, and what are the tradeoffs of adding one?',
        answer: `An index is a separate data structure that lets the database find rows without scanning the whole table. The default in PostgreSQL is a **B-tree**, which keeps values sorted, so it supports equality, ranges and ordering efficiently.

The benefit is much faster reads for queries that filter, join or sort on the indexed columns.

The costs:

- **Slower writes.** Every insert, update and delete has to maintain each index too.
- **Storage.** Indexes take disk space and memory.
- **Not always used.** If a query returns a large share of the table, a sequential scan is cheaper and the planner will choose that.

So I add indexes based on actual query patterns: columns in WHERE clauses, join keys, and ORDER BY. For a **composite index**, column order matters, because it can only be used efficiently when the query filters on the leading columns. And I confirm with EXPLAIN ANALYZE that the index is really used.`,
        difficulty: 'medium',
        tags: ['postgresql', 'indexes'],
        followUps: ['Why does the column order in a composite index matter?'],
      },
      {
        id: 'be-postgresql-2',
        question: 'What are ACID properties and transaction isolation levels?',
        answer: `**ACID** is the set of guarantees a transaction provides:

- **Atomicity:** all of its changes happen, or none do.
- **Consistency:** it moves the database from one valid state to another, respecting constraints.
- **Isolation:** concurrent transactions do not interfere with each other in ways that break correctness.
- **Durability:** once committed, the changes survive a crash.

**Isolation levels** trade strictness for concurrency. In PostgreSQL:

- **Read Committed,** the default. Each statement sees only data committed before that statement began. Two reads in the same transaction can see different data.
- **Repeatable Read.** The transaction sees a snapshot from its start, so repeated reads agree.
- **Serializable.** The result is as if transactions had run one at a time. Conflicting transactions may be rolled back and must be retried.

PostgreSQL implements this with **MVCC**, keeping multiple row versions, so readers do not block writers and writers do not block readers.`,
        difficulty: 'medium',
        tags: ['postgresql', 'transactions'],
        followUps: ['Give an example of a bug caused by using too weak an isolation level.'],
      },
      {
        id: 'be-postgresql-3',
        question: 'A query is slow. How do you investigate and fix it?',
        answer: `1. **Run EXPLAIN ANALYZE** on it to see the real execution plan with timings and row counts.
2. **Look for the expensive part:** a sequential scan on a large table where I expected an index, a large gap between estimated and actual rows, a costly sort, or a poor join strategy.
3. **Fix the cause:**
   - Add a missing index for the filter, join or sort column.
   - Rewrite the query so it can use an index, for example avoiding a function wrapped around an indexed column.
   - Select only the columns and rows I need, and add a LIMIT.
   - Refresh statistics with ANALYZE if the estimates are far off.
4. **Check how the application calls it.** Often the query is fine but it is executed hundreds of times, which is the **N+1 problem**, fixed with a join or a batched query.
5. **Measure again** to confirm.

If the query is inherently heavy, I consider caching, a materialized view, or precomputing the result.`,
        difficulty: 'medium',
        tags: ['postgresql', 'performance'],
        followUps: ['What is the N+1 query problem and how do you fix it?'],
      },
      {
        id: 'be-postgresql-4',
        question: 'What is connection pooling and why is it important?',
        answer: `Opening a database connection is expensive: there is a network handshake and authentication, and in PostgreSQL each connection is served by its own server **process**, which uses memory. The server also has a limit on the number of connections.

A **connection pool** keeps a set of open connections and lends them out. A request borrows one, runs its queries and returns it, instead of opening and closing a connection every time.

It matters for two reasons. **Performance:** the setup cost is not paid on each request. **Stability:** the pool caps how many connections are opened, so a traffic spike queues briefly at the pool instead of exhausting the database's connection limit and bringing it down.

Pooling can live in the application, through the driver or ORM, or in an external pooler such as PgBouncer, which is common when many application instances or serverless functions share one database.`,
        difficulty: 'medium',
        tags: ['postgresql', 'connections'],
        followUps: ['Why are serverless functions a problem for database connections?'],
      },
      {
        id: 'be-postgresql-5',
        question: 'When would you choose PostgreSQL over a NoSQL database such as MongoDB?',
        answer: `I choose **PostgreSQL** when:

- The data is relational, with entities that reference each other, and I need joins.
- I need transactions and strong consistency, for example anything involving money or inventory.
- I want the database to enforce integrity with constraints and foreign keys.
- Query patterns are varied or not fully known yet, since SQL is flexible.

It also covers a lot of "NoSQL" needs on its own: **JSONB** columns for semi-structured data, full-text search, and pgvector for embeddings.

I would consider a **document database** when the data is naturally document-shaped with few relationships, the schema changes very often, or I need straightforward horizontal scaling for very large write volumes.

My default is PostgreSQL, because most applications have relational data, and one reliable, well-understood database is easier to run than several.`,
        difficulty: 'medium',
        tags: ['postgresql', 'nosql', 'tradeoffs'],
        followUps: ['When would you use a JSONB column instead of separate tables?'],
      },
    ],
  },
]
