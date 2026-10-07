import type { Concept } from '../../types'

export const agents: Concept[] = [
  {
    id: 'agent-tool-calling',
    title: 'Tool calling',
    category: 'Agents & Tool Calling',
    summary: `Tool calling (function calling) is how an LLM acts on the outside world. You describe the available functions with a name, a description and a JSON schema for the arguments. When the model decides a tool is needed, it returns a structured request to call it instead of prose. **Your code** runs the function and sends the result back, and the model continues with that result in context.`,
    keyPoints: [
      'The model never executes anything; it only proposes a call with arguments.',
      'Tool names and descriptions are prompts: their quality decides whether the right tool is chosen.',
      'Validate arguments before executing, as you would any untrusted input.',
      'Return errors to the model as tool results so it can recover.',
      'Fewer, clearer tools work better than many overlapping ones.',
    ],
    relatedConceptIds: ['agent-loops-planning', 'prompt-structured-output', 'lc-langgraph'],
    questions: [
      {
        id: 'agent-tool-calling-1',
        question: 'How does tool calling work?',
        answer: `It is a loop between the model and my application.

1. I send the user message along with a list of tool definitions: each has a name, a description and a JSON schema for its parameters.
2. The model decides whether a tool would help. If so, instead of a normal answer it returns a structured **tool call**: the tool name and the arguments as JSON.
3. **My code** validates the arguments and executes the function. The model itself runs nothing.
4. I send the result back to the model as a tool message.
5. The model either calls another tool or writes the final answer using the results.

The important point is that the model only chooses and fills in arguments. Execution, permissions and error handling are entirely the application's responsibility.`,
        difficulty: 'easy',
        tags: ['agents', 'tool-calling'],
        followUps: [
          'How does the model decide which tool to call?',
          'What happens if the model calls a tool with invalid arguments?',
        ],
      },
      {
        id: 'agent-tool-calling-2',
        question: 'How do you design good tools for an LLM?',
        answer: `I design them the way I would design an API for a new teammate who can only read the documentation.

- **Clear names and descriptions.** The description says what the tool does, when to use it and when not to. The model picks tools from this text alone.
- **Well-described parameters,** with types, enums for fixed choices, and examples of the expected format.
- **One clear purpose per tool.** Overlapping tools confuse the model about which to choose.
- **A small set.** Every tool definition uses context and adds a chance of a wrong choice.
- **Useful return values:** concise, relevant results, not a raw dump of a huge API response.
- **Helpful errors.** A message like "date must be in YYYY-MM-DD format" lets the model fix its own call.

When a tool is misused, the first thing I check is its description, since that is usually where the fix is.`,
        difficulty: 'medium',
        tags: ['agents', 'tool-design'],
        followUps: ['What problems appear when an agent has dozens of tools?'],
      },
      {
        id: 'agent-tool-calling-3',
        question: 'How do you handle errors and failures in tool calls?',
        answer: `Several things can go wrong, and each needs handling.

- **Invalid arguments:** I validate against the schema before executing. On failure I return the validation error to the model as the tool result, so it can correct the call.
- **The tool itself fails** (timeout, API error): I retry transient errors with backoff in code, and if it still fails I return a clear error message to the model so it can try another approach or tell the user.
- **The model calls a tool that does not exist:** I return an error listing the valid tools.
- **Loops:** the model keeps repeating a failing call. I cap the number of iterations and detect repeated identical calls.
- **Dangerous actions:** anything destructive or irreversible requires confirmation from the user before it runs.

The principle is to feed errors back as information instead of crashing, while keeping hard limits in code so a confused model cannot run forever.`,
        difficulty: 'medium',
        tags: ['agents', 'tool-calling', 'error-handling'],
        followUps: ['How would you make a tool that performs a payment safe to retry?'],
      },
      {
        id: 'agent-tool-calling-4',
        question: 'What is the Model Context Protocol (MCP)?',
        answer: `MCP is an open protocol, introduced by Anthropic, that standardises how AI applications connect to external tools and data sources.

Without a standard, every application has to write its own integration for every tool. With MCP, a tool provider writes an **MCP server** once, exposing capabilities such as tools, resources and prompts, and any compatible **client** application can connect to it and use them.

The practical benefit is reuse and decoupling: integrations become plug-in components instead of custom code inside each agent. The thing to stay careful about is trust, because a connected server supplies tool descriptions and results that the model will read, so the usual prompt injection and permission concerns apply.`,
        difficulty: 'medium',
        tags: ['agents', 'mcp'],
        followUps: ['How is an MCP tool different from a regular function-calling tool?'],
      },
    ],
  },
  {
    id: 'agent-loops-planning',
    title: 'Agent loops, planning and memory',
    category: 'Agents & Tool Calling',
    summary: `An agent is an LLM running in a loop: it decides on an action, the action is executed, it observes the result, and it repeats until the task is done. The difference from a fixed workflow is that **the model chooses the control flow**. That buys flexibility for open-ended tasks and costs predictability, latency and money, so an agent should be used only when the steps cannot be known in advance.`,
    keyPoints: [
      'Workflow: steps fixed in code. Agent: the model decides the next step.',
      'ReAct interleaves reasoning, acting and observing.',
      'Always enforce stopping conditions: max steps, budget, timeout.',
      'Short-term memory is the context window; long-term memory is an external store.',
      'Errors compound across steps, so reliability drops as chains get longer.',
    ],
    relatedConceptIds: ['agent-tool-calling', 'lc-langgraph', 'sd-reliability-scaling'],
    questions: [
      {
        id: 'agent-loops-planning-1',
        question: 'What is an AI agent, and how is it different from a simple LLM call or a workflow?',
        answer: `A single **LLM call** takes input and returns output once.

A **workflow** chains several LLM calls and tools together along a path that I wrote in code. The steps are predetermined.

An **agent** is an LLM in a loop with tools, where the model itself decides what to do next based on what it has seen so far: which tool to call, with what arguments, and when it is finished.

So the defining feature is who controls the flow. In a workflow it is my code; in an agent it is the model. That makes agents suited to open-ended tasks where I cannot predict the steps, such as debugging or research. For predictable tasks a workflow is cheaper, faster and easier to test, so I would use that.`,
        difficulty: 'easy',
        tags: ['agents'],
        followUps: ['Give an example of a task where you would not use an agent.'],
      },
      {
        id: 'agent-loops-planning-2',
        question: 'Explain the ReAct pattern.',
        answer: `ReAct stands for Reasoning and Acting. The agent alternates between three steps in a loop:

1. **Thought:** the model reasons about the current state and what to do next.
2. **Action:** it calls a tool.
3. **Observation:** the tool result is added to the context.

Then it reasons again with the new information, and continues until it can give a final answer.

The value is that reasoning and acting inform each other. Reasoning alone cannot get new information, and acting without reasoning is blind. With ReAct the model can look something up, notice the result is not what it expected, and change its plan. Most tool-calling agents today are this loop, with the action expressed through the native tool-calling API.`,
        difficulty: 'medium',
        tags: ['agents', 'react'],
        followUps: ['How does plan-and-execute differ from ReAct?'],
      },
      {
        id: 'agent-loops-planning-3',
        question: 'How do agents handle memory?',
        answer: `There are two kinds.

**Short-term memory** is the context window: the messages, tool calls and results of the current task. It is limited, so for long tasks I have to manage it by trimming old messages, summarizing earlier steps, or dropping bulky tool outputs once they have been used.

**Long-term memory** persists across sessions in an external store. Typical contents are facts about the user, past conversations and learned preferences. When a new task starts, the relevant memories are retrieved, often by semantic search, and put into the context.

The hard parts are deciding **what to store**, since saving everything creates noise, **what to retrieve**, since irrelevant memories distract the model, and **keeping it current**, since facts change and old memories have to be updated or removed.`,
        difficulty: 'medium',
        tags: ['agents', 'memory'],
        followUps: ['How would you stop a long-running agent from overflowing its context window?'],
      },
      {
        id: 'agent-loops-planning-4',
        question: 'What are the common failure modes of agents, and how do you mitigate them?',
        answer: `- **Infinite loops or getting stuck,** repeating the same action. Mitigation: a maximum step count, detection of repeated calls, timeouts.
- **Compounding errors.** A small mistake early on derails everything after it, and reliability falls as the number of steps grows. Mitigation: keep tasks short, validate intermediate results, add checkpoints.
- **Wrong tool or wrong arguments.** Mitigation: better tool descriptions, fewer tools, argument validation.
- **Context overflow** on long tasks. Mitigation: summarize and prune the history.
- **Runaway cost and latency.** Mitigation: budgets on tokens and steps.
- **Unsafe actions,** including ones triggered by prompt injection. Mitigation: least-privilege tools and human approval for sensitive operations.
- **Declaring success too early.** Mitigation: explicit completion criteria and a verification step.

Underneath all of these, I need tracing of every step, because I cannot fix an agent I cannot observe.`,
        difficulty: 'hard',
        tags: ['agents', 'reliability'],
        followUps: ['How would you evaluate whether an agent is good enough to ship?'],
      },
      {
        id: 'agent-loops-planning-5',
        question: 'When would you use a multi-agent system instead of a single agent?',
        answer: `A multi-agent system splits work across several agents, each with its own prompt, tools and context. Common shapes are a **supervisor** that delegates to specialised workers, and a **pipeline** such as researcher, then writer, then reviewer.

I would consider it when:

- The task has clearly separable subtasks that need different instructions or tools.
- One agent's context is getting overloaded, and separating concerns keeps each context focused.
- Subtasks can run in parallel.
- I want an independent check, such as a reviewer agent that did not write the draft.

The costs are real: more LLM calls, more latency, harder debugging, and information lost when agents hand off to each other. So my default is a single agent with good tools, and I move to multiple agents only when I can point to the specific limit that a single agent is hitting.`,
        difficulty: 'hard',
        tags: ['agents', 'multi-agent'],
        followUps: ['How do agents share state or pass context to each other?'],
      },
    ],
  },
]
