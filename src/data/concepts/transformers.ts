import type { Concept } from '../../types'

export const transformers: Concept[] = [
  {
    id: 'tf-self-attention',
    title: 'Self-attention',
    category: 'Transformers & Attention',
    summary: `Self-attention lets every token build its representation by looking at every other token in the sequence and taking a weighted average of them, where the weights are learned from the content itself. The formula is \`softmax(QK^T / sqrt(d_k)) V\`. It replaced recurrence because it handles long-range dependencies directly and can be computed for all positions in parallel.`,
    keyPoints: [
      'Each token is projected into a query, a key and a value vector.',
      'Attention weights come from the dot product of a query with every key, passed through softmax.',
      'Scaling by sqrt(d_k) keeps the softmax from saturating.',
      'Multi-head attention runs several attention operations in parallel, each in its own subspace.',
      'Cost grows quadratically with sequence length.',
    ],
    relatedConceptIds: ['tf-architecture', 'llm-tokenization-context'],
    questions: [
      {
        id: 'tf-self-attention-1',
        question: 'Explain how self-attention works.',
        answer: `For each token, the model produces three vectors with learned projections: a **query**, a **key** and a **value**.

To update one token, I take its query and compute a dot product with the key of every token in the sequence. That gives a score for how relevant each other token is. The scores are divided by the square root of the key dimension and passed through a softmax, so they become weights that sum to one. The output for the token is the weighted sum of all the value vectors.

So each token ends up with a representation that mixes in context from the tokens that matter to it. In "the animal did not cross the street because it was tired", attention is what lets "it" pull information from "animal".`,
        difficulty: 'medium',
        tags: ['attention'],
        followUps: [
          'Why do we divide by the square root of the key dimension?',
          'What is the difference between self-attention and cross-attention?',
        ],
      },
      {
        id: 'tf-self-attention-2',
        question: 'Why is the dot product scaled by the square root of d_k?',
        answer: `Because dot products grow in magnitude as the vector dimension grows. Large scores push the softmax into a region where one weight is almost one and the rest are almost zero, and in that region its gradients are extremely small, which makes training slow and unstable.

Dividing by the square root of the key dimension keeps the scores at a reasonable scale regardless of dimension, so the softmax stays in a range where gradients are useful.`,
        difficulty: 'medium',
        tags: ['attention'],
        followUps: ['What would happen to training if you removed the scaling?'],
      },
      {
        id: 'tf-self-attention-3',
        question: 'What is multi-head attention and why use it?',
        answer: `Instead of one attention operation, the model runs several in parallel. Each head has its own query, key and value projections into a smaller subspace, computes attention independently, and the outputs are concatenated and projected back.

The reason is that a single set of attention weights can only express one kind of relationship at a time. With multiple heads, different heads can focus on different things, for example one on syntactic structure and another on which earlier word a pronoun refers to. Because each head works in a smaller dimension, the total cost is similar to one full-size head.`,
        difficulty: 'medium',
        tags: ['attention', 'multi-head'],
        followUps: ['Are all heads equally useful in a trained model?'],
      },
      {
        id: 'tf-self-attention-4',
        question: 'What is the computational complexity of self-attention, and why does it matter?',
        answer: `Every token attends to every other token, so time and memory grow **quadratically** with sequence length. Doubling the context roughly quadruples the attention cost.

It matters because it is the main reason long contexts are expensive: more memory, more latency, higher price per request. It is also why so much engineering goes into working around it, such as key-value caching during generation, efficient attention implementations, and at the application level simply sending fewer tokens through retrieval or summarization instead of stuffing everything into the prompt.`,
        difficulty: 'medium',
        tags: ['attention', 'complexity'],
        followUps: ['What is a KV cache and what does it save?'],
      },
      {
        id: 'tf-self-attention-5',
        question: 'What is causal (masked) attention?',
        answer: `In a decoder-only model like GPT, each token is only allowed to attend to itself and the tokens **before** it. This is enforced with a mask that sets the attention scores for future positions to negative infinity before the softmax, so their weights become zero.

It is needed because the model is trained to predict the next token. If a position could see the future tokens, it would simply copy the answer. The mask also makes training efficient: one forward pass over a sequence produces a next-token prediction at every position at once, and each of those predictions is honest because it only saw the past.`,
        difficulty: 'medium',
        tags: ['attention', 'decoder'],
        followUps: ['Does an encoder like BERT use a causal mask? Why not?'],
      },
    ],
  },
  {
    id: 'tf-architecture',
    title: 'Transformer architecture',
    category: 'Transformers & Attention',
    summary: `A transformer is a stack of identical blocks. Each block has a multi-head attention layer and a position-wise feed-forward network, each wrapped in a residual connection with layer normalization. Because attention has no built-in sense of order, position information is added separately. The three families are **encoder-only** (BERT), **decoder-only** (GPT) and **encoder-decoder** (T5).`,
    keyPoints: [
      'Block = attention + feed-forward, each with a residual connection and layer norm.',
      'Positional information must be injected, because attention itself is order-agnostic.',
      'Encoder-only: bidirectional, good for understanding and embeddings.',
      'Decoder-only: causal, generates text one token at a time. Most modern LLMs.',
      'Transformers beat RNNs on parallelism and on long-range dependencies.',
    ],
    relatedConceptIds: ['tf-self-attention', 'dl-training-stability', 'llm-sampling'],
    questions: [
      {
        id: 'tf-architecture-1',
        question: 'Why did transformers replace RNNs and LSTMs?',
        answer: `Two main reasons.

**Parallelism.** An RNN processes tokens one after another, because each step depends on the previous hidden state. A transformer processes all positions at once, so it makes much better use of GPUs and can be trained on far more data.

**Long-range dependencies.** In an RNN, information from an early token has to survive through every step in between, and it fades, which is tied to the vanishing gradient problem. With attention, any token can look at any other token directly in a single step.

The cost is that attention is quadratic in sequence length and has no built-in notion of order, so position has to be added explicitly.`,
        difficulty: 'easy',
        tags: ['architecture', 'rnn'],
        followUps: ['What did LSTMs do to reduce the vanishing gradient problem?'],
      },
      {
        id: 'tf-architecture-2',
        question: 'Why do transformers need positional encodings?',
        answer: `Self-attention is just a weighted sum over a set of tokens. If I shuffled the input, each token would get the same result, so on its own the model cannot tell "dog bites man" from "man bites dog".

Positional encodings inject order. The original transformer added fixed sinusoidal vectors to the token embeddings. Other options are learned absolute position embeddings and relative schemes. Many modern LLMs use **rotary position embeddings (RoPE)**, which encode position by rotating the query and key vectors so that attention depends on the relative distance between tokens.`,
        difficulty: 'medium',
        tags: ['architecture', 'positional-encoding'],
        followUps: ['What is the advantage of relative over absolute position information?'],
      },
      {
        id: 'tf-architecture-3',
        question: 'What is the difference between encoder-only, decoder-only and encoder-decoder models?',
        answer: `- **Encoder-only (BERT):** every token attends to tokens on both sides. It is trained with masked language modelling and produces rich representations of the input. Good for classification, extraction and embeddings, not for free-form generation.
- **Decoder-only (GPT-style):** causal attention, trained to predict the next token. It generates text autoregressively. This is what almost all current chat LLMs are.
- **Encoder-decoder (T5, the original transformer):** an encoder reads the input, and a decoder generates the output while attending to the encoder through cross-attention. A natural fit for translation and summarization.

So for an embedding model or a reranker I would expect an encoder; for a chat model, a decoder.`,
        difficulty: 'easy',
        tags: ['architecture'],
        followUps: ['Why are embedding models usually encoder-based?'],
      },
      {
        id: 'tf-architecture-4',
        question: 'What are the components of a transformer block, and what does each do?',
        answer: `Each block has two sub-layers:

1. **Multi-head self-attention**, which lets each token gather information from other tokens.
2. A **feed-forward network**, applied to each position independently, which transforms what attention gathered. It expands to a larger hidden dimension and projects back.

Around each sub-layer there is a **residual connection**, which gives gradients a direct path and makes deep stacks trainable, and **layer normalization**, which stabilises training. Many modern models apply the normalization before the sub-layer (pre-norm) because it trains more stably at depth.

A decoder block in an encoder-decoder model has a third sub-layer for cross-attention over the encoder output.`,
        difficulty: 'medium',
        tags: ['architecture'],
        followUps: ['What is the role of the feed-forward layer if attention already mixes information?'],
      },
    ],
  },
]
