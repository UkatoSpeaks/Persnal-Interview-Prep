import type { Concept } from '../../types'

export const langchainLanggraph: Concept[] = [
  {
    id: 'lc-langchain-basics',
    title: 'LangChain fundamentals',
    category: 'LangChain / LangGraph',
    summary: `LangChain is a framework for building LLM applications from standard building blocks: chat models, prompt templates, output parsers, document loaders, text splitters, embeddings, vector stores, retrievers and tools. Its main value is a **common interface** across providers and a way to compose the pieces, called **LCEL**. It suits linear pipelines; for stateful agents with loops, the same team's **LangGraph** is the intended tool.`,
    keyPoints: [
      'One interface over many model providers and vector stores, so they can be swapped.',
      'LCEL composes components with the pipe operator into a chain.',
      'Every component is a Runnable with invoke, stream and batch, plus async versions.',
      'Good for prototyping and standard patterns; the abstractions can get in the way of debugging.',
      'LangSmith is the companion product for tracing and evaluation.',
    ],
    relatedConceptIds: ['lc-langgraph', 'rag-retrieval-reranking', 'agent-tool-calling'],
    questions: [
      {
        id: 'lc-langchain-basics-1',
        question: 'What is LangChain and what problems does it solve?',
        answer: `LangChain is an open-source framework for building applications on top of LLMs. It solves two main problems.

First, **integration**. It gives a consistent interface over many model providers, embedding models, vector stores and document loaders, so I can swap one for another without rewriting the application.

Second, **composition**. Real applications are not a single model call. They load documents, split them, retrieve, format prompts, call a model and parse the output. LangChain provides these as components and a way to chain them.

It is most useful for getting a standard pattern such as RAG working quickly. For agents that need state, loops and human approval, I would use LangGraph, which is the lower-level library from the same team.`,
        difficulty: 'easy',
        tags: ['langchain'],
        followUps: ['What are the downsides of using a framework like LangChain?'],
      },
      {
        id: 'lc-langchain-basics-2',
        question: 'What is LCEL (LangChain Expression Language)?',
        answer: `LCEL is LangChain's declarative way of composing components. I connect them with the pipe operator, for example a prompt template, piped into a model, piped into an output parser. The output of each step becomes the input of the next.

Every component implements the **Runnable** interface, so the composed chain automatically supports the same methods: invoke for a single input, stream for token-by-token output, batch for many inputs, and async versions of each. I get streaming and parallel execution without writing that plumbing myself.

It works well for linear or simple branching pipelines. Once I need cycles, complex state or conditional loops, it stops being a good fit and I would express the flow as a graph in LangGraph.`,
        difficulty: 'medium',
        tags: ['langchain', 'lcel'],
        followUps: ['How would you run two steps of a chain in parallel?'],
      },
      {
        id: 'lc-langchain-basics-3',
        question: 'What are the tradeoffs of using LangChain versus calling the model API directly?',
        answer: `**For LangChain:** fast to prototype, a large set of ready integrations, a uniform interface that makes switching providers easy, built-in streaming and batching, and tracing through LangSmith.

**Against:** the abstraction layers can hide what is actually sent to the model, which makes debugging and fine control harder. The API has changed a lot between versions. And it adds a dependency and concepts to learn for things that are sometimes a few lines against the provider SDK.

My approach is pragmatic. For a simple application with one or two model calls, I use the provider SDK directly, since it is easier to understand and control. For something with many integrations or a standard pattern, the framework saves real time. Either way I make sure I can see the exact prompt and response, because that is what I need when something goes wrong.`,
        difficulty: 'medium',
        tags: ['langchain', 'tradeoffs'],
        followUps: ['How do you inspect the final prompt that LangChain sends to the model?'],
      },
      {
        id: 'lc-langchain-basics-4',
        question: 'What is a retriever in LangChain, and how is it different from a vector store?',
        answer: `A **vector store** is storage: it holds embeddings and supports similarity search over them.

A **retriever** is a more general interface: given a query string, return a list of relevant documents. It says nothing about how.

A vector store can be wrapped as a retriever, which is the common case, but a retriever can also be backed by BM25 keyword search, a web search API, a SQL query, or a combination of several sources. That abstraction is useful because the rest of the chain only depends on "give me documents for this query". I can start with plain vector search and later switch to hybrid search or add a reranker without changing the code that uses the results.`,
        difficulty: 'easy',
        tags: ['langchain', 'retrieval'],
        followUps: ['How would you combine a BM25 retriever with a vector retriever?'],
      },
    ],
  },
  {
    id: 'lc-langgraph',
    title: 'LangGraph',
    category: 'LangChain / LangGraph',
    summary: `LangGraph models an agent or workflow as a **graph**: **nodes** are functions that do work, **edges** decide what runs next, and a shared **state** object flows through and is updated by each node. Unlike a simple chain, the graph can contain **cycles**, which is what an agent loop is. Built-in **checkpointing** persists the state, which enables conversation memory, resuming after failure and human-in-the-loop approval.`,
    keyPoints: [
      'State: a typed object shared by all nodes. Nodes return updates to it.',
      'Reducers define how an update is merged, for example appending to a message list.',
      'Conditional edges route to different nodes based on the current state.',
      'Cycles are allowed, so loops such as "call tool, then go back to the model" are natural.',
      'A checkpointer saves state per thread, enabling memory, resume and interrupts.',
    ],
    relatedConceptIds: ['lc-langchain-basics', 'agent-loops-planning', 'agent-tool-calling'],
    questions: [
      {
        id: 'lc-langgraph-1',
        question: 'What is LangGraph and why would you use it over a plain LangChain chain?',
        answer: `LangGraph is a library for building stateful LLM applications as graphs. I define nodes, which are functions, connect them with edges, and a shared state passes between them.

A plain chain runs in one direction from start to finish. That cannot express an agent, which needs to **loop**: call the model, run a tool, go back to the model, and repeat until done. LangGraph supports cycles and conditional branching directly.

The other reasons I would choose it are explicit **state** that I define and control, **persistence** through checkpoints so a run can be paused and resumed, **human-in-the-loop** steps where the graph waits for approval, and streaming of intermediate steps. In short, I use it when I need control over the flow instead of handing everything to an opaque agent loop.`,
        difficulty: 'easy',
        tags: ['langgraph'],
        followUps: ['What does the graph for a basic tool-calling agent look like?'],
      },
      {
        id: 'lc-langgraph-2',
        question: 'Explain state, nodes and edges in LangGraph.',
        answer: `**State** is the shared data for the run, defined with a schema such as a TypedDict or a Pydantic model. A typical agent state holds the list of messages plus whatever else the application needs.

**Nodes** are functions. Each one receives the current state, does some work such as calling a model or running a tool, and returns a **partial update** to the state, not the whole thing.

**Edges** define what runs next. A normal edge always goes from one node to another. A **conditional edge** runs a routing function on the state and chooses the next node, for example "if the last message has tool calls go to the tools node, otherwise end".

Each state key can have a **reducer** that says how updates are merged. Without one, a new value overwrites the old. With a reducer such as the one used for messages, updates are appended to the existing list.`,
        difficulty: 'medium',
        tags: ['langgraph', 'state'],
        followUps: ['What happens when two nodes running in parallel update the same state key?'],
      },
      {
        id: 'lc-langgraph-3',
        question: 'What is checkpointing in LangGraph and what does it enable?',
        answer: `A **checkpointer** saves a snapshot of the graph state after each step, keyed by a **thread id**. The backing store can be in memory for development or a database such as SQLite or Postgres for production.

It enables several things:

- **Conversation memory:** invoking the graph again with the same thread id continues from the saved state, so the agent remembers earlier turns.
- **Fault tolerance:** if a run fails midway, it can resume from the last checkpoint instead of starting over.
- **Human-in-the-loop:** the graph can pause, wait for a person, and continue later, possibly in a different process.
- **Inspection and replay:** I can look at the state at any earlier step, or go back and re-run from that point, which is very useful for debugging.

Without a checkpointer every invocation starts from an empty state.`,
        difficulty: 'medium',
        tags: ['langgraph', 'persistence'],
        followUps: ['How would you give each user their own separate conversation history?'],
      },
      {
        id: 'lc-langgraph-4',
        question: 'How do you implement human-in-the-loop in LangGraph?',
        answer: `Using **interrupts**, which depend on checkpointing.

At the point where I want human input, for example before a tool that sends an email or issues a refund, the graph is interrupted. The state is saved to the checkpointer and execution stops, returning control to my application with information about what is waiting for approval.

The application shows that to the user. They can approve, reject, or edit the proposed action. I then resume the graph on the same thread id with their decision, and it continues from exactly where it stopped.

Because the state is persisted, the pause can last seconds or days, and the resume can happen in a different process. I use this for any action that is irreversible, costly or sensitive, so the agent proposes and a person confirms.`,
        difficulty: 'hard',
        tags: ['langgraph', 'human-in-the-loop'],
        followUps: ['What should happen if the user rejects the proposed action?'],
      },
      {
        id: 'lc-langgraph-5',
        question: 'How would you stop a LangGraph agent from looping forever?',
        answer: `Several layers, because I do not rely on the model to stop itself.

- **Recursion limit.** LangGraph has a configurable limit on the number of steps in a run, and raises an error when it is exceeded.
- **A counter in the state.** I track the number of iterations or tool calls and use a conditional edge to route to a final "wrap up" node when it hits a threshold, which ends gracefully instead of with an error.
- **Repeat detection.** If the agent makes the same tool call with the same arguments again, I break the loop or tell it explicitly that this did not work.
- **Budgets and timeouts** on tokens, cost and wall-clock time.
- **Clear completion criteria** in the prompt, so the model knows what "done" means.

A graceful exit matters for the user: return the best partial result with an explanation, instead of failing silently.`,
        difficulty: 'medium',
        tags: ['langgraph', 'reliability'],
        followUps: ['What would you return to the user when the step limit is reached?'],
      },
    ],
  },
]
