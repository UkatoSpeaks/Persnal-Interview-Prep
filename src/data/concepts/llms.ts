import type { Concept } from '../../types'

export const llms: Concept[] = [
  {
    id: 'llm-tokenization-context',
    title: 'Tokenization and context windows',
    category: 'LLMs',
    summary: `LLMs do not read characters or words; they read **tokens**, which are subword pieces produced by a tokenizer such as BPE. The **context window** is the maximum number of tokens the model can handle in one request, counting the system prompt, the conversation, any retrieved documents, and the output. Cost, latency and limits are all measured in tokens.`,
    keyPoints: [
      'Subword tokenization keeps the vocabulary fixed while still handling rare and new words.',
      'Token counts differ by tokenizer, language and content type; always count with the model’s own tokenizer.',
      'Input and output tokens share the same context window.',
      'A model is stateless: the full conversation is re-sent on every turn.',
      'More context is not free: it costs money and latency, and can dilute the relevant part.',
    ],
    relatedConceptIds: ['llm-sampling', 'tf-self-attention', 'rag-chunking'],
    questions: [
      {
        id: 'llm-tokenization-context-1',
        question: 'What is tokenization and why do LLMs use subword tokens?',
        answer: `Tokenization converts text into a sequence of integer ids from a fixed vocabulary, which is what the model actually takes as input.

Subword tokenization, such as byte-pair encoding, is a middle ground. Word-level vocabularies would be huge and would fail on any word they had not seen. Character-level would handle everything but make sequences very long. With subwords, common words are a single token and rare words are split into a few known pieces, so the model can represent anything with a manageable vocabulary.

As a rough rule of thumb for English, a token is about three quarters of a word, but that varies a lot for code, numbers and other languages.`,
        difficulty: 'easy',
        tags: ['tokenization'],
        followUps: ['Why are LLMs often bad at counting letters in a word?'],
      },
      {
        id: 'llm-tokenization-context-2',
        question: 'What is a context window, and what do you do when your content does not fit?',
        answer: `The context window is the maximum number of tokens the model can process in a single request, including the system prompt, history, any documents and the generated output.

When content does not fit, my options are:

- **Retrieve** only the relevant parts instead of sending everything, which is the idea behind RAG.
- **Summarize** older conversation turns and keep recent ones verbatim.
- **Truncate** with a sliding window, accepting that old context is lost.
- **Split the task** with map-reduce: process chunks separately, then combine the results.

Even when it does fit, I avoid filling the window by default, because long prompts cost more, respond slower, and can bury the important information.`,
        difficulty: 'medium',
        tags: ['context-window'],
        followUps: ['If a model has a very large context window, do we still need RAG?'],
      },
      {
        id: 'llm-tokenization-context-3',
        question: 'How does a chat model remember earlier messages in a conversation?',
        answer: `It does not. The model is stateless: every request is independent. The application gives the illusion of memory by sending the conversation history again with each new message.

That has practical consequences. The cost and latency of each turn grow as the conversation gets longer, and eventually the history exceeds the context window. So the application has to manage memory: keep a window of recent messages, summarize older ones, or store facts externally and retrieve the relevant ones when needed.`,
        difficulty: 'easy',
        tags: ['context-window', 'memory'],
        followUps: ['How would you implement long-term memory for a chatbot?'],
      },
      {
        id: 'llm-tokenization-context-4',
        question: 'What is the "lost in the middle" problem?',
        answer: `It is the observation that models tend to use information placed at the **beginning or end** of a long context more reliably than information buried in the middle. So even when a relevant passage is technically in the prompt, the answer quality can drop depending on where it sits.

The practical takeaways for a RAG system are: retrieve fewer, better chunks rather than as many as fit; rerank so the most relevant chunks come first; and put the key instructions and the question near the end of the prompt, after the documents.`,
        difficulty: 'medium',
        tags: ['context-window', 'rag'],
        followUps: ['How does this affect how you order retrieved chunks in a prompt?'],
      },
    ],
  },
  {
    id: 'llm-sampling',
    title: 'Sampling and temperature',
    category: 'LLMs',
    summary: `At every step an LLM outputs a probability distribution over the next token. **Decoding** is how one token is picked from it. **Temperature** reshapes the distribution, and **top-k** and **top-p** cut off the unlikely tail before sampling. These settings control the balance between predictable and varied output.`,
    keyPoints: [
      'Temperature divides the logits before softmax: lower is sharper, higher is flatter.',
      'Top-k keeps the k most likely tokens; top-p keeps the smallest set whose probability adds up to p.',
      'Low temperature for extraction, classification and code; higher for brainstorming and creative writing.',
      'Temperature 0 is close to deterministic, but identical output is not guaranteed.',
      'Generation is autoregressive: each sampled token is appended and fed back in.',
    ],
    relatedConceptIds: ['llm-tokenization-context', 'llm-hallucination', 'prompt-structured-output'],
    questions: [
      {
        id: 'llm-sampling-1',
        question: 'What does temperature do?',
        answer: `The model produces a score (logit) for every token in the vocabulary. Temperature divides those logits before the softmax turns them into probabilities.

- **Below 1** sharpens the distribution: the most likely tokens get even more probability, so output is more focused and repeatable.
- **Above 1** flattens it: unlikely tokens get a real chance, so output is more varied and more likely to go off track.
- **At 0** it becomes greedy decoding, always taking the most likely token.

I use a low temperature for anything that needs to be correct and consistent, like extraction, classification or tool calling, and a higher one for brainstorming or creative writing.`,
        difficulty: 'easy',
        tags: ['sampling', 'temperature'],
        followUps: ['Does temperature 0 guarantee the same output every time?'],
      },
      {
        id: 'llm-sampling-2',
        question: 'What is the difference between top-k and top-p sampling?',
        answer: `Both remove the unlikely tail of the distribution before sampling, so the model cannot pick a very improbable token.

- **Top-k** keeps a fixed number of the most likely tokens, for example the top 50, and samples among them.
- **Top-p (nucleus)** keeps the smallest set of tokens whose cumulative probability reaches p, for example 0.9.

The difference is that top-p adapts. When the model is confident, a handful of tokens already cover 90%, so the pool is small. When it is uncertain, the pool grows. Top-k uses the same size either way, which can be too wide when the model is sure and too narrow when it is not.

A common recommendation is to adjust either temperature or top-p, not both at once.`,
        difficulty: 'medium',
        tags: ['sampling'],
        followUps: ['What is greedy decoding and what is its weakness?'],
      },
      {
        id: 'llm-sampling-3',
        question: 'Why can an LLM give different answers to the same prompt, even at temperature 0?',
        answer: `At a normal temperature the answer is simply that the next token is **sampled** from a distribution, so there is randomness by design.

At temperature 0 the model picks the most likely token, which is much more repeatable, but hosted models still do not guarantee identical output. Floating-point arithmetic on GPUs is not perfectly reproducible, requests can be served by different hardware or batched differently, and when two tokens are nearly tied a tiny numerical difference can flip the choice. Once one token differs, everything after it can diverge. Providers also update models over time.

So I treat LLM output as non-deterministic. If I need stability I pin the model version, set a low temperature and a seed where supported, cache responses, and validate the output instead of assuming it will be the same.`,
        difficulty: 'medium',
        tags: ['sampling', 'determinism'],
        followUps: ['How do you write tests for a system whose output is non-deterministic?'],
      },
      {
        id: 'llm-sampling-4',
        question: 'How does an LLM actually generate a response?',
        answer: `Autoregressively, one token at a time.

The prompt is tokenized and run through the model, which outputs a probability distribution for the next token. A decoding strategy picks one. That token is appended to the sequence, and the model runs again to predict the one after it. This repeats until the model emits a stop token or hits the maximum output length.

Two consequences are worth knowing. Output tokens are produced sequentially, so latency grows with the length of the answer, which is why streaming improves the perceived speed. And the model cannot go back and revise an earlier token, so an early mistake carries forward into the rest of the answer.`,
        difficulty: 'easy',
        tags: ['generation'],
        followUps: ['Why are output tokens usually priced higher than input tokens?'],
      },
    ],
  },
  {
    id: 'llm-hallucination',
    title: 'Hallucination',
    category: 'LLMs',
    summary: `A hallucination is output that is fluent and confident but false or unsupported. It follows from how LLMs work: they are trained to produce plausible continuations, not to check facts. You cannot remove it entirely, so the engineering goal is to **reduce** it with grounding and **catch** it with validation.`,
    keyPoints: [
      'The model optimizes for plausible text, and has no built-in notion of "I do not know".',
      'Most common with obscure facts, recent events, exact numbers, citations and long outputs.',
      'Grounding in retrieved sources is the most effective mitigation.',
      'Give the model an explicit way out: "say you do not know if the context does not contain the answer".',
      'RAG reduces hallucination but does not eliminate it; the model can still misread or ignore context.',
    ],
    relatedConceptIds: ['rag-evaluation', 'llm-sampling', 'ops-observability-guardrails'],
    questions: [
      {
        id: 'llm-hallucination-1',
        question: 'Why do LLMs hallucinate?',
        answer: `Because they are trained to predict the most plausible next token, not to state only what is true. Fluency is the objective; truth is a side effect when the training data happened to be consistent.

A few things make it worse:

- The knowledge is compressed into the weights, so rare or detailed facts are stored imprecisely.
- The training data has a cutoff, so recent information is missing.
- The model has no reliable signal for the limits of its own knowledge, and the training setup tends to reward giving an answer over abstaining.
- The prompt can push it, for example by asking a leading question that assumes something false.

So a hallucination is not a glitch. It is the same mechanism that produces correct answers, working without enough information.`,
        difficulty: 'medium',
        tags: ['hallucination'],
        followUps: ['Does a lower temperature fix hallucination?'],
      },
      {
        id: 'llm-hallucination-2',
        question: 'How do you reduce hallucinations in a production application?',
        answer: `I combine several layers, because no single one is enough.

1. **Ground the model.** Retrieve relevant sources and tell it to answer only from them. This is the biggest lever.
2. **Allow abstention.** Instruct it explicitly to say it does not know when the context does not contain the answer.
3. **Ask for citations**, so each claim points at a source passage that can be checked.
4. **Constrain the output** with a schema and validate it in code.
5. **Use tools for facts** that should not come from memory, such as calculations, database lookups and current data.
6. **Verify** high-stakes answers with a second pass that checks the answer against the sources.

Then I measure it. I keep an evaluation set and track a faithfulness metric, so I know whether a change actually helped.`,
        difficulty: 'medium',
        tags: ['hallucination', 'rag', 'production'],
        followUps: ['How would you detect a hallucination automatically?'],
      },
      {
        id: 'llm-hallucination-3',
        question: 'Does RAG eliminate hallucinations?',
        answer: `No, it reduces them. It can still fail in a few ways:

- **Retrieval misses.** If the right document is not retrieved, the model either answers from memory or invents something.
- **Wrong or conflicting context.** If retrieved chunks are irrelevant or outdated, the model can confidently answer from bad sources.
- **The model ignores or misreads the context**, blending it with what it already believes.
- **Over-extension.** The context covers part of the question and the model fills in the rest.

That is why I evaluate retrieval and generation separately, and specifically measure **faithfulness**: whether each claim in the answer is supported by the retrieved context.`,
        difficulty: 'medium',
        tags: ['hallucination', 'rag'],
        followUps: ['What should the system do when retrieval returns nothing relevant?'],
      },
      {
        id: 'llm-hallucination-4',
        question: 'How would you detect hallucinations automatically?',
        answer: `For a grounded system, the question becomes "is every claim in the answer supported by the provided context?", which is checkable.

Approaches I would use:

- **LLM-as-judge faithfulness check:** a second model call breaks the answer into claims and verifies each against the retrieved passages.
- **Entailment models:** a natural language inference model scores whether the context supports each sentence.
- **Citation checks:** require citations, then verify the cited passage exists and actually contains the claim.
- **Self-consistency:** generate several answers and flag the question when they disagree.
- **Deterministic checks** where possible: validate numbers, ids and URLs against the source data in code.

None of these is perfect, so I calibrate the checker against a set of human-labelled examples before trusting it.`,
        difficulty: 'hard',
        tags: ['hallucination', 'evaluation'],
        followUps: ['What are the weaknesses of using an LLM to judge another LLM?'],
      },
    ],
  },
]
