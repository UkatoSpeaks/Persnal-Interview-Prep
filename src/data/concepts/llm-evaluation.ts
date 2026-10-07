import type { Concept } from '../../types'

export const llmEvaluation: Concept[] = [
  {
    id: 'eval-methods',
    title: 'Evaluation methods and metrics',
    category: 'LLM Evaluation',
    summary: `LLM output is open-ended, so there is rarely one right answer to compare against. Evaluation methods range from cheap and rigid to expensive and nuanced: **code-based checks**, **reference-based metrics** (exact match, BLEU, ROUGE), **embedding similarity**, **LLM-as-judge** and **human review**. A good setup uses the cheapest method that is reliable for each property being measured.`,
    keyPoints: [
      'Use deterministic checks wherever the property is checkable in code.',
      'BLEU and ROUGE measure word overlap with a reference, not meaning or correctness.',
      'LLM-as-judge scales to open-ended quality, but has biases and must be calibrated against humans.',
      'Human evaluation is the ground truth, and too slow to be the only method.',
      'Perplexity measures how well a model predicts text, not whether an answer is good.',
    ],
    relatedConceptIds: ['eval-in-practice', 'rag-evaluation', 'ml-evaluation-metrics'],
    questions: [
      {
        id: 'eval-methods-1',
        question: 'Why is evaluating LLM applications harder than evaluating traditional ML models?',
        answer: `With a classifier, each input has a label and I can compute accuracy. With an LLM:

- **There is no single correct output.** Many different answers can be equally good, so comparing against one reference undercounts.
- **Quality has several dimensions:** correctness, relevance, faithfulness, tone, safety, format. One number cannot capture all of them.
- **Output is non-deterministic,** so the same input can pass once and fail the next time.
- **Meaning matters more than wording,** and exact-match metrics cannot see meaning.
- **The system has many parts:** prompt, retrieval, tools, model. A failure can come from any of them.
- **Models and prompts change often,** and a small prompt edit can change behaviour in unexpected places.

So evaluation becomes a mix of methods: code checks for what is checkable, model-based grading for open-ended quality, and humans to keep the automated graders honest.`,
        difficulty: 'easy',
        tags: ['evaluation'],
        followUps: ['How do you evaluate a system when there is no ground truth at all?'],
      },
      {
        id: 'eval-methods-2',
        question: 'What are BLEU and ROUGE, and what are their limitations?',
        answer: `Both compare generated text to one or more reference texts by counting overlapping word sequences (n-grams).

- **BLEU** is precision-oriented: how much of the generated text appears in the reference. It comes from machine translation.
- **ROUGE** is recall-oriented: how much of the reference appears in the generated text. It comes from summarization.

Their limitation is that they measure surface overlap, not meaning. A correct answer that is phrased differently from the reference scores low, and a fluent answer that shares many words but states the opposite can score high. They also need reference texts, which most LLM applications do not have.

So I treat them as a rough signal for tasks with a narrow expected output, and I would not rely on them for a chatbot or a RAG system. Semantic approaches such as embedding similarity or an LLM judge fit those better.`,
        difficulty: 'medium',
        tags: ['evaluation', 'metrics'],
        followUps: ['What is BERTScore and how does it improve on n-gram overlap?'],
      },
      {
        id: 'eval-methods-3',
        question: 'What is LLM-as-a-judge, and what are its pitfalls?',
        answer: `It means using an LLM to grade the output of another LLM against criteria I define. I give the judge the input, the output, optionally a reference or the retrieved context, and a rubric, and it returns a score or a pass/fail with an explanation. It scales to open-ended qualities such as helpfulness or faithfulness that code cannot check.

The pitfalls:

- **Biases:** judges can favour longer answers, the first option shown in a pairwise comparison, or output written in their own style.
- **Inconsistency:** the same input can get a different score on another run.
- **Vague rubrics** lead to arbitrary scores.
- **It can be wrong in the same way** as the model being judged.

To make it trustworthy I use specific criteria with examples, prefer binary or low-granularity scales, ask for the reasoning before the verdict, randomise the order in pairwise comparisons, and above all **check agreement with human labels** on a sample before relying on it.`,
        difficulty: 'medium',
        tags: ['evaluation', 'llm-judge'],
        followUps: ['How would you measure whether your judge agrees with human reviewers?'],
      },
      {
        id: 'eval-methods-4',
        question: 'What is perplexity, and is it a good measure of an LLM application?',
        answer: `Perplexity measures how well a language model predicts a piece of text. Formally it is the exponential of the average negative log-likelihood per token. Lower is better: the model was less "surprised" by the text. Intuitively, a perplexity of 10 means the model was about as uncertain as if it were choosing among 10 equally likely tokens at each step.

It is useful for comparing language models on the same data with the same tokenizer, and for tracking training progress.

It is **not** a good measure of an application. It says how predictable the text was to the model, not whether an answer is correct, relevant or helpful. A model can assign high probability to a fluent answer that is factually wrong. For applications I evaluate task outcomes directly.`,
        difficulty: 'medium',
        tags: ['evaluation', 'perplexity'],
        followUps: ['Why can you not compare perplexity between models with different tokenizers?'],
      },
    ],
  },
  {
    id: 'eval-in-practice',
    title: 'Evaluation in practice',
    category: 'LLM Evaluation',
    summary: `Evaluation is a workflow, not a metric. You build a **dataset** of representative inputs, define what "good" means with **graders**, run them **offline** on every change like a regression test suite, and then confirm with **online** signals from real users. The loop closes when production failures are added back to the dataset.`,
    keyPoints: [
      'Start small: a few dozen real examples is enough to begin, and far better than none.',
      'Read the outputs yourself first; error analysis tells you what to measure.',
      'Offline evals catch regressions before release; online evals show real-world impact.',
      'Evaluate components separately as well as end to end.',
      'Every production failure should become a test case.',
    ],
    relatedConceptIds: ['eval-methods', 'rag-evaluation', 'ops-observability-guardrails'],
    questions: [
      {
        id: 'eval-in-practice-1',
        question: 'How would you set up evaluation for a new LLM feature from scratch?',
        answer: `1. **Define success** in concrete terms: what should a good output do, and what must it never do.
2. **Collect a dataset.** I start with a few dozen realistic inputs, covering the common cases, the edge cases and adversarial ones. Real user data is best; if there is none, I write them by hand or generate and then review them.
3. **Look at outputs manually.** I run the system and read the results. This error analysis shows the actual failure categories, which tells me what is worth measuring.
4. **Write graders** per failure category: code checks where possible, an LLM judge with a clear rubric otherwise, validated against my own labels.
5. **Automate it** so the whole set runs on every prompt, model or code change, and compare against the previous version.
6. **Add online monitoring** after launch, and feed failures back into the dataset.

The mistake I avoid is picking generic metrics before looking at the data.`,
        difficulty: 'medium',
        tags: ['evaluation', 'process'],
        followUps: ['How do you create an evaluation dataset when you have no users yet?'],
      },
      {
        id: 'eval-in-practice-2',
        question: 'What is the difference between offline and online evaluation?',
        answer: `**Offline evaluation** runs before release, against a fixed dataset. It is repeatable and fast, so I use it as a regression suite: does this change make things better or worse on known cases? Its weakness is that the dataset is only a sample and may not match what users really do.

**Online evaluation** happens in production with real traffic. It includes A/B tests, explicit feedback such as thumbs up or down, implicit signals such as whether the user rephrased, copied the answer or abandoned the session, and automated graders running on sampled live traffic. It reflects reality, but it is slower, noisier, and failures reach real users.

I need both. Offline gates what ships; online tells me whether it actually helped, and surfaces new failure cases that go back into the offline set.`,
        difficulty: 'easy',
        tags: ['evaluation', 'production'],
        followUps: ['What implicit signals would tell you a chatbot answer was bad?'],
      },
      {
        id: 'eval-in-practice-3',
        question: 'How do you handle non-determinism when testing LLM applications?',
        answer: `I change what a test asserts and how I run it.

- **Assert on properties, not exact strings:** valid JSON, required fields present, the right tool called, the answer contains the key fact, no banned content.
- **Use semantic checks** such as an LLM judge or embedding similarity where meaning matters.
- **Reduce variance** for tests with a low temperature and a pinned model version, and a seed where the provider supports it.
- **Run multiple trials** for important cases and look at the pass rate instead of a single result.
- **Track aggregate scores with a threshold,** such as "at least 95% of the set passes", instead of requiring every case to pass every time.
- **Keep deterministic code deterministic.** Parsing, validation and tool logic get ordinary unit tests, with the model call mocked.

The mindset shift is from "this output equals that" to "the pass rate stayed above the bar".`,
        difficulty: 'medium',
        tags: ['evaluation', 'testing'],
        followUps: ['How would you put LLM evals into a CI pipeline without making it slow and expensive?'],
      },
      {
        id: 'eval-in-practice-4',
        question: 'How would you evaluate an agent, as opposed to a single LLM call?',
        answer: `An agent takes many steps, so I evaluate at more than one level.

- **Final outcome:** did it complete the task? Where possible I check the end state directly, for example that the record was created or the tests pass, instead of judging the text of its answer.
- **Trajectory:** did it take a sensible path? I look at whether it called the right tools with the right arguments, and whether it took unnecessary or repeated steps.
- **Individual steps:** for a given state, did it pick the correct next action? These are small, cheap tests of tool selection.
- **Efficiency:** number of steps, tokens, cost and latency.
- **Safety:** did it stay within its permissions and ask for approval when it should?

Because agents are especially variable, I run each task several times and report a success rate. I also avoid being too strict about the path, since there can be more than one valid way to reach the goal.`,
        difficulty: 'hard',
        tags: ['evaluation', 'agents'],
        followUps: ['Why is checking the end state more reliable than grading the final message of the agent?'],
      },
    ],
  },
]
