import type { Concept } from '../../types'

export const fineTuning: Concept[] = [
  {
    id: 'ft-when-to-finetune',
    title: 'When to fine-tune',
    category: 'Fine-tuning',
    summary: `Fine-tuning continues training a pretrained model on your own examples so that a behaviour is built into the weights. It is the right tool for changing **how** a model behaves (style, format, a narrow task) and usually the wrong tool for giving it **knowledge**, which RAG handles better. Because it is the most expensive option to build and maintain, it comes after prompt engineering and retrieval have been tried.`,
    keyPoints: [
      'Order of escalation: better prompt, then few-shot examples, then RAG, then fine-tuning.',
      'RAG is for knowledge that changes; fine-tuning is for behaviour and form.',
      'A fine-tuned small model can replace a large one on a narrow task, cutting cost and latency.',
      'Data quality matters more than quantity.',
      'You need an evaluation set before you start, or you cannot tell whether it worked.',
    ],
    relatedConceptIds: ['ft-lora-qlora', 'ft-rlhf-dpo', 'rag-retrieval-reranking'],
    questions: [
      {
        id: 'ft-when-to-finetune-1',
        question: 'When would you choose fine-tuning over RAG or prompt engineering?',
        answer: `I escalate in order of cost: prompt engineering first, then few-shot examples, then RAG, and fine-tuning last.

I choose **fine-tuning** when the problem is about behaviour, not missing information:

- I need a consistent style, tone or output format that prompting cannot hold reliably.
- It is a narrow, well-defined task with many examples, such as classification or extraction.
- I want a smaller, cheaper, faster model to match a large one on that task.
- The prompt has become very long with instructions and examples, and I want to move that into the weights.

I choose **RAG** when the model lacks knowledge: private documents, frequently changing facts, or anything where I need citations. Updating an index is far easier than retraining.

They also combine well: fine-tune for behaviour, retrieve for facts.`,
        difficulty: 'medium',
        tags: ['fine-tuning', 'rag'],
        followUps: ['Why is fine-tuning a poor way to teach a model new facts?'],
      },
      {
        id: 'ft-when-to-finetune-2',
        question: 'What does the fine-tuning process look like end to end?',
        answer: `1. **Define the task and the metric,** and build a held-out evaluation set first.
2. **Establish a baseline** with the base model and a good prompt, so I know what I am trying to beat.
3. **Prepare the data:** input-output pairs in the format the model expects, cleaned, deduplicated, and representative of real usage including edge cases.
4. **Split** into training and validation sets.
5. **Choose the method.** Usually a parameter-efficient one such as LoRA instead of updating every weight.
6. **Train,** watching training and validation loss to catch overfitting.
7. **Evaluate** on the held-out set against the baseline, and read actual outputs, not just the metric.
8. **Deploy and monitor,** and plan for retraining as the data changes.

Most of the effort and most of the quality comes from step 3. A few hundred carefully checked examples often beat thousands of noisy ones.`,
        difficulty: 'medium',
        tags: ['fine-tuning', 'process'],
        followUps: ['How many examples do you need to fine-tune a model?'],
      },
      {
        id: 'ft-when-to-finetune-3',
        question: 'What is catastrophic forgetting?',
        answer: `It is when a model, while being trained on a new task, loses abilities it had before. The weights that encoded its general knowledge are overwritten as they adapt to the new data. A model fine-tuned hard on one narrow domain can get noticeably worse at everything else.

Ways to reduce it:

- **Parameter-efficient fine-tuning** such as LoRA, which freezes the original weights and trains only small added matrices.
- **A lower learning rate and fewer epochs,** so the weights move less.
- **Mixing in general data** alongside the task-specific examples.
- **Evaluating on general tasks** as well as the target task, so a regression is noticed.

It is one of the practical reasons LoRA is the default: the base model stays intact and the adapter can simply be removed.`,
        difficulty: 'medium',
        tags: ['fine-tuning'],
        followUps: ['How does freezing the base model help with forgetting?'],
      },
      {
        id: 'ft-when-to-finetune-4',
        question: 'What are the risks and ongoing costs of fine-tuning?',
        answer: `- **Data work.** Building and maintaining a high-quality dataset is the largest cost.
- **Overfitting.** With a small dataset the model can memorise the examples and generalise poorly.
- **Staleness.** Knowledge baked into the weights goes out of date, and updating it means retraining.
- **Lock-in to a base model.** When a better base model is released, the fine-tune does not transfer; I have to redo it.
- **Serving.** A custom model may need dedicated hosting, which can cost more than a shared API.
- **Evaluation burden.** I need a solid test set to show it is really better than a well-prompted base model.
- **Safety regressions.** Fine-tuning can weaken a model's built-in safeguards.

So I ask whether the gain justifies the ongoing maintenance, not just the one-off training run.`,
        difficulty: 'medium',
        tags: ['fine-tuning', 'tradeoffs'],
        followUps: ['How would you decide whether a fine-tuned model is ready to replace the baseline?'],
      },
    ],
  },
  {
    id: 'ft-lora-qlora',
    title: 'LoRA and QLoRA',
    category: 'Fine-tuning',
    summary: `Updating every weight of a large model is expensive in compute and storage. **LoRA** (Low-Rank Adaptation) freezes the pretrained weights and learns a small low-rank update alongside them, so only a tiny fraction of parameters is trained. **QLoRA** adds 4-bit quantization of the frozen base model, which cuts memory enough to fine-tune large models on a single GPU.`,
    keyPoints: [
      'LoRA: W stays frozen; the update is the product of two small matrices, B and A, of rank r.',
      'Only A and B are trained, which is typically a very small share of the total parameters.',
      'The adapter can be merged into W after training, so there is no extra inference latency.',
      'Adapters are small files, so one base model can serve many tasks.',
      'QLoRA: quantize the frozen base to 4-bit, train LoRA adapters on top.',
    ],
    relatedConceptIds: ['ft-when-to-finetune', 'ft-rlhf-dpo', 'ops-serving-latency-cost'],
    questions: [
      {
        id: 'ft-lora-qlora-1',
        question: 'How does LoRA work?',
        answer: `LoRA is based on the observation that the change to the weights during fine-tuning has a low intrinsic rank, so it does not need a full-size matrix to represent it.

For a weight matrix W, LoRA **freezes W** and adds a trainable update expressed as the product of two much smaller matrices, **B times A**, where the rank r is small, often between 4 and 64. The layer output becomes the original output plus the output of this low-rank path.

Only A and B are trained. One is initialised randomly and the other to zero, so at the start the update is zero and the model behaves exactly like the base model.

The results are far fewer trainable parameters, much less GPU memory, and a small adapter file instead of a full copy of the model. After training, B times A can be added into W, so inference is no slower than the original model.`,
        difficulty: 'medium',
        tags: ['fine-tuning', 'lora'],
        followUps: [
          'What does the rank r control?',
          'Which layers is LoRA usually applied to?',
        ],
      },
      {
        id: 'ft-lora-qlora-2',
        question: 'What do the rank and alpha hyperparameters do in LoRA?',
        answer: `**Rank (r)** is the inner dimension of the two adapter matrices, so it sets the capacity of the update. A higher rank means more trainable parameters and the ability to learn a more complex change, at the cost of more memory and a higher risk of overfitting on small datasets. A low rank is often enough for adapting style or a narrow task.

**Alpha** is a scaling factor. The low-rank update is multiplied by alpha divided by r before it is added to the frozen weights, so it controls how strongly the adapter affects the output. A common starting point is to set alpha equal to r or twice r.

The other choice is **which modules to adapt.** The original approach targets the attention projection matrices; applying it to more layers gives more capacity for more parameters. I start with standard values and tune against a validation set.`,
        difficulty: 'hard',
        tags: ['fine-tuning', 'lora', 'hyperparameters'],
        followUps: ['How would you tell that the rank you chose is too low?'],
      },
      {
        id: 'ft-lora-qlora-3',
        question: 'What is QLoRA and how does it differ from LoRA?',
        answer: `QLoRA is LoRA applied on top of a **quantized** base model.

In standard LoRA the frozen base weights are still held in memory at 16-bit precision, which for a large model is the dominant memory cost. QLoRA loads the base model in **4-bit** precision, keeps it frozen, and trains the LoRA adapters in higher precision on top. Gradients flow through the quantized weights into the adapters.

The paper introduced a 4-bit data type designed for normally distributed weights, called NF4, along with double quantization to save a little more memory.

The effect is a large drop in memory, enough to fine-tune models on a single GPU that would otherwise need several, while keeping quality close to full-precision fine-tuning. The tradeoff is that training is somewhat slower because of the quantization overhead.`,
        difficulty: 'hard',
        tags: ['fine-tuning', 'qlora', 'quantization'],
        followUps: ['What is quantization, and what do you lose by doing it?'],
      },
      {
        id: 'ft-lora-qlora-4',
        question: 'What are the advantages of LoRA over full fine-tuning?',
        answer: `- **Much lower compute and memory,** because gradients are only computed for a small number of parameters.
- **Small artifacts.** An adapter is megabytes, not a full copy of a model that is gigabytes.
- **One base model, many tasks.** I can keep a single base model loaded and swap adapters per task or per customer.
- **No added inference latency** once the adapter is merged into the base weights.
- **Less catastrophic forgetting,** since the original weights are untouched and the adapter can be removed.
- **Faster iteration,** which matters when I am experimenting.

The tradeoff is capacity. For a task very far from what the base model knows, or with a very large dataset, full fine-tuning can reach higher quality. For most practical adaptation work, LoRA gets close at a small fraction of the cost.`,
        difficulty: 'medium',
        tags: ['fine-tuning', 'lora'],
        followUps: ['Why does merging the adapter remove the inference overhead?'],
      },
    ],
  },
  {
    id: 'ft-rlhf-dpo',
    title: 'RLHF and DPO basics',
    category: 'Fine-tuning',
    summary: `Supervised fine-tuning teaches a model to imitate examples, but "helpful" or "safe" is easier to express as a **preference** between two answers than as one correct answer. **RLHF** learns a reward model from human preferences and then optimizes the LLM against it with reinforcement learning. **DPO** reaches a similar goal with a simple loss computed directly on preference pairs, with no reward model and no RL loop.`,
    keyPoints: [
      'Typical order: pretraining, then supervised (instruction) fine-tuning, then preference alignment.',
      'RLHF: human comparisons train a reward model; the policy is optimized with PPO to maximize it.',
      'A penalty keeps the tuned model close to the original so it does not drift or exploit the reward model.',
      'DPO: trains directly on (prompt, preferred, rejected) triples with a classification-style loss.',
      'DPO is simpler and more stable to train, which is why it is widely used.',
    ],
    relatedConceptIds: ['ft-when-to-finetune', 'ft-lora-qlora', 'eval-methods'],
    questions: [
      {
        id: 'ft-rlhf-dpo-1',
        question: 'What is RLHF and why is it used?',
        answer: `RLHF stands for Reinforcement Learning from Human Feedback. It is used to align a model with qualities that are hard to write down as a loss function, such as being helpful, honest and safe. People find it much easier to say which of two answers is better than to write the ideal answer.

The steps are:

1. Start from a model that has already been pretrained and supervised fine-tuned.
2. **Collect preferences:** people compare pairs of model outputs for the same prompt and pick the better one.
3. **Train a reward model** on those comparisons, so it can score any output.
4. **Optimize the LLM** with a reinforcement learning algorithm, typically PPO, to produce outputs the reward model scores highly.

A penalty term keeps the updated model from moving too far from the original, which prevents it from degrading or finding odd outputs that trick the reward model.`,
        difficulty: 'medium',
        tags: ['fine-tuning', 'rlhf', 'alignment'],
        followUps: ['Why is a reward model needed instead of asking humans directly during training?'],
      },
      {
        id: 'ft-rlhf-dpo-2',
        question: 'What is DPO and how does it differ from RLHF?',
        answer: `DPO stands for Direct Preference Optimization. It uses the same kind of data as RLHF, which is a prompt with a preferred response and a rejected response, but skips the two hardest parts of the pipeline.

In RLHF I train a separate reward model and then run a reinforcement learning loop against it. In DPO there is **no reward model and no RL**. The preference objective is rewritten as a simple loss on the model itself: increase the probability of the preferred response relative to the rejected one, measured against a frozen reference copy of the model so it does not drift too far.

So training looks like ordinary supervised fine-tuning. That makes DPO simpler to implement, cheaper, and more stable, since RL training with PPO is sensitive to hyperparameters. That simplicity is the main reason it became a popular choice for preference tuning.`,
        difficulty: 'hard',
        tags: ['fine-tuning', 'dpo', 'alignment'],
        followUps: ['What data would you need to collect to run DPO?'],
      },
      {
        id: 'ft-rlhf-dpo-3',
        question: 'What is the difference between supervised fine-tuning and preference-based tuning?',
        answer: `**Supervised fine-tuning (SFT)** trains on input-output pairs. The model learns to reproduce the given output with the standard next-token loss. It answers "what does a good answer look like?", and it needs a correct target for every example.

**Preference-based tuning** such as RLHF or DPO trains on comparisons. For a prompt there is a better and a worse response, and the model learns to favour the better kind. It answers "which of these is preferable?", which captures subtle qualities like tone, safety and helpfulness that are hard to pin down as a single gold answer.

In practice they are stages, not alternatives. SFT comes first to teach the model the task and format, and preference tuning then refines the quality of its behaviour.`,
        difficulty: 'medium',
        tags: ['fine-tuning', 'sft', 'alignment'],
        followUps: ['What is instruction tuning?'],
      },
      {
        id: 'ft-rlhf-dpo-4',
        question: 'What are the limitations of RLHF?',
        answer: `- **It is complex and unstable.** There are two models to train, and reinforcement learning is sensitive to hyperparameters.
- **Human feedback is expensive and noisy.** Annotators disagree, and their biases end up in the model.
- **The reward model is an imperfect proxy.** The LLM can learn to exploit its blind spots, scoring well without actually being better.
- **Optimizing for approval has side effects.** A model tuned to produce answers people rate highly can learn to be agreeable or sound confident instead of being correct.
- **Whose preferences?** The result reflects the values of whoever did the labelling and wrote the guidelines.

These problems are part of why simpler methods such as DPO are attractive, although those share the data quality issues, since they learn from the same kind of preference data.`,
        difficulty: 'hard',
        tags: ['fine-tuning', 'rlhf'],
        followUps: ['What is reward hacking?'],
      },
    ],
  },
]
