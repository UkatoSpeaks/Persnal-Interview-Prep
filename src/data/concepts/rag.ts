import type { Concept } from '../../types'

export const rag: Concept[] = [
  {
    id: 'rag-chunking',
    title: 'Chunking',
    category: 'RAG',
    summary: `Before documents can be retrieved they are split into chunks, and each chunk is embedded and indexed. Chunking decides what a "unit of retrieval" is, so it sets a ceiling on everything downstream: if the answer is split across two chunks or buried in a huge one, retrieval cannot fix it. There is no universal best size; it depends on the documents and the questions.`,
    keyPoints: [
      'Small chunks: precise matches, but they can lose the surrounding context.',
      'Large chunks: more context, but a diluted embedding and more noise in the prompt.',
      'Split on natural boundaries (headings, paragraphs, functions) before falling back to fixed sizes.',
      'Overlap reduces the chance of cutting an idea in half.',
      'Store metadata (source, title, section, date) with every chunk.',
    ],
    relatedConceptIds: ['rag-retrieval-reranking', 'rag-evaluation', 'emb-embeddings'],
    questions: [
      {
        id: 'rag-chunking-1',
        question: 'Why do we chunk documents in RAG, and how do you choose a chunk size?',
        answer: `We chunk for three reasons: embedding models have a maximum input length, a single vector for a whole document blurs many topics together so it matches nothing well, and we only want to put the relevant part into the prompt, not the entire document.

Choosing the size is a tradeoff. **Small chunks** give precise retrieval, but may not carry enough context to answer from. **Large chunks** carry context, but the embedding becomes an average of several ideas and the prompt fills with irrelevant text.

I start with a moderate size, a few hundred tokens with some overlap, split on the document's own structure. Then I tune it empirically against an evaluation set of real questions, because the right size for short FAQs is very different from legal contracts or code.`,
        difficulty: 'medium',
        tags: ['rag', 'chunking'],
        followUps: [
          'What is chunk overlap and why use it?',
          'How would you chunk a table or source code?',
        ],
      },
      {
        id: 'rag-chunking-2',
        question: 'What chunking strategies do you know?',
        answer: `- **Fixed-size:** split every N tokens or characters, usually with overlap. Simple and predictable, but it cuts through sentences and ideas.
- **Recursive:** try to split on the largest natural separator first (sections, then paragraphs, then sentences) and only go smaller when a piece is still too big. A good general default.
- **Structure-aware:** use the document format, such as Markdown headings, HTML tags, or functions and classes in code, so each chunk is a coherent unit.
- **Semantic:** embed sentences and start a new chunk where the meaning shifts. Better boundaries, at a higher processing cost.
- **Small-to-big (parent document):** index small chunks for precise matching, but hand the LLM the larger parent section they came from.

I usually begin with recursive or structure-aware splitting, and only add complexity when evaluation shows that chunk boundaries are the problem.`,
        difficulty: 'medium',
        tags: ['rag', 'chunking'],
        followUps: ['When is semantic chunking worth the extra cost?'],
      },
      {
        id: 'rag-chunking-3',
        question: 'What is chunk overlap, and what are its tradeoffs?',
        answer: `Overlap means consecutive chunks share some text, for example the last 10 to 20 percent of one chunk is repeated at the start of the next.

It exists because a hard boundary can cut a sentence or an argument in half, so neither chunk contains the complete idea. With overlap, the content near a boundary appears whole in at least one chunk.

The costs are a larger index, more embedding work, and near-duplicate chunks showing up together in the results, which wastes space in the prompt. So I keep the overlap modest, and deduplicate or merge adjacent chunks after retrieval when it becomes a problem.`,
        difficulty: 'easy',
        tags: ['rag', 'chunking'],
        followUps: ['How would you avoid sending near-duplicate chunks to the LLM?'],
      },
      {
        id: 'rag-chunking-4',
        question: 'A chunk often makes no sense on its own. How do you preserve context?',
        answer: `This is common: a chunk says "it increased by 12% that quarter" with no clue what "it" or "that quarter" refers to, so it embeds poorly and is hard to answer from.

Things I would do:

- **Attach metadata** such as document title, section heading and date, and include it in the text that gets embedded, not just as a filter.
- **Small-to-big retrieval:** match on small chunks, then return the surrounding window or the parent section to the LLM.
- **Contextual chunks:** at indexing time, have an LLM write a sentence or two situating each chunk within its document and prepend it before embedding.
- **Structure-aware splitting**, so chunks start at a heading instead of mid-thought.

The general principle is to separate the unit I search on from the unit I give the model.`,
        difficulty: 'hard',
        tags: ['rag', 'chunking', 'context'],
        followUps: ['What is the cost of generating context for every chunk at index time?'],
      },
    ],
  },
  {
    id: 'rag-retrieval-reranking',
    title: 'Retrieval and reranking',
    category: 'RAG',
    summary: `Retrieval finds candidate chunks for a query; reranking reorders them so the best ones reach the LLM. The strongest practical setup is usually **hybrid search** (dense embeddings plus keyword search such as BM25) to maximise recall, followed by a **cross-encoder reranker** to maximise precision in the final top few.`,
    keyPoints: [
      'Dense retrieval captures meaning; sparse (BM25) retrieval captures exact terms, ids and rare words.',
      'Hybrid search combines both, often with reciprocal rank fusion.',
      'Retrieve broadly, rerank, then pass only the top few chunks to the model.',
      'Query rewriting helps when the user query is vague or depends on chat history.',
      'More retrieved chunks is not always better: noise can hurt the answer.',
    ],
    relatedConceptIds: ['rag-chunking', 'rag-evaluation', 'emb-embeddings', 'emb-vector-search'],
    questions: [
      {
        id: 'rag-retrieval-reranking-1',
        question: 'Walk me through a RAG pipeline end to end.',
        answer: `There are two phases.

**Indexing (offline):**

1. Load and clean the documents.
2. Split them into chunks.
3. Embed each chunk.
4. Store the vectors with their text and metadata in a vector index.

**Querying (online):**

1. Take the user question, and rewrite it if it depends on chat history.
2. Embed it and retrieve the top candidates, ideally with hybrid search.
3. Rerank and keep the best few.
4. Build a prompt with those chunks, instructing the model to answer only from them and to cite sources.
5. Generate the answer, and return it with the citations.

Around that I would add evaluation of both retrieval and generation, plus a way to keep the index fresh when documents change.`,
        difficulty: 'easy',
        tags: ['rag', 'pipeline'],
        followUps: ['Which step would you look at first if answers were poor?'],
      },
      {
        id: 'rag-retrieval-reranking-2',
        question: 'What is hybrid search and why use it?',
        answer: `Hybrid search runs a **dense** vector search and a **sparse** keyword search, typically BM25, and merges the results.

They fail in opposite ways. Dense retrieval understands paraphrases and meaning, but it can miss exact tokens that matter: product codes, error ids, names, acronyms, rare technical terms. Keyword search nails those exact matches but fails when the user words the question differently from the document.

Combining them improves recall across both kinds of query. A common way to merge is **reciprocal rank fusion**, which scores each document by its rank in each list instead of its raw score, so I do not have to normalise two incompatible scoring scales.`,
        difficulty: 'medium',
        tags: ['rag', 'hybrid-search', 'bm25'],
        followUps: ['How does reciprocal rank fusion work?'],
      },
      {
        id: 'rag-retrieval-reranking-3',
        question: 'What is reranking and why is it needed if we already retrieved by similarity?',
        answer: `First-stage retrieval is built for speed. The query and the documents are embedded independently, so the score is only a rough signal of relevance.

A **reranker** is a cross-encoder: it reads the query and one candidate together and outputs a relevance score. Because it sees both at once, it judges relevance much more accurately. It is too slow to run over the whole corpus, but running it over, say, the top 50 candidates is affordable.

So the pattern is two stages: retrieve broadly for recall, rerank for precision, and send only the top few to the LLM. It matters because the model answers best when the most relevant context is at the top and there is little noise. The cost is added latency, so I measure whether it improves the final answers.`,
        difficulty: 'medium',
        tags: ['rag', 'reranking'],
        followUps: ['How do you decide how many chunks to pass to the LLM after reranking?'],
      },
      {
        id: 'rag-retrieval-reranking-4',
        question: 'What query transformation techniques can improve retrieval?',
        answer: `User queries are often short, vague, or depend on earlier turns, so embedding them as-is retrieves poorly.

- **Query rewriting:** use an LLM to turn a follow-up like "what about pricing?" into a standalone question using the chat history.
- **Multi-query:** generate several rephrasings, retrieve for each, and merge the results to improve recall.
- **Decomposition:** split a complex question into sub-questions and retrieve for each.
- **HyDE:** have the LLM write a hypothetical answer and embed that instead of the question, on the idea that an answer-shaped text sits closer to real answer passages.
- **Metadata extraction:** pull filters such as a date or product name out of the query and apply them as structured filters.

Each one adds an LLM call and latency, so I add them based on the failure cases I actually see.`,
        difficulty: 'hard',
        tags: ['rag', 'query-rewriting'],
        followUps: ['What is the risk of HyDE when the model does not know the topic?'],
      },
      {
        id: 'rag-retrieval-reranking-5',
        question: 'How do you choose top-k, and what happens if it is too high or too low?',
        answer: `Top-k is the number of chunks I retrieve or pass to the model.

**Too low** and I miss relevant information: the chunk with the answer does not make it in, so the model cannot answer or it guesses. **Too high** and I add noise: irrelevant chunks distract the model, raise cost and latency, and the relevant passage can get lost among them.

With a reranker I use two different values: a large k for first-stage retrieval, to make sure the answer is somewhere in the candidates, and a small k after reranking for what actually goes into the prompt. I pick the numbers by measuring recall at k on an evaluation set and checking the effect on final answer quality, not by guessing.`,
        difficulty: 'medium',
        tags: ['rag', 'retrieval'],
        followUps: ['Could you use a similarity threshold instead of a fixed k?'],
      },
    ],
  },
  {
    id: 'rag-evaluation',
    title: 'RAG evaluation',
    category: 'RAG',
    summary: `A RAG system has two parts that fail differently, so they are evaluated separately. **Retrieval** is judged on whether the right chunks came back (recall, precision, MRR, nDCG). **Generation** is judged on whether the answer is supported by those chunks (faithfulness) and actually addresses the question (relevance). Without this split you cannot tell which part to fix.`,
    keyPoints: [
      'Bad answer with good context is a generation problem; bad context is a retrieval problem.',
      'Recall@k: did the relevant chunk appear in the top k at all?',
      'Faithfulness: is every claim in the answer supported by the retrieved context?',
      'Build a golden set of real questions with expected answers and source documents.',
      'Re-run the evaluation on every change to chunking, prompts, models or retrieval.',
    ],
    relatedConceptIds: ['rag-retrieval-reranking', 'eval-methods', 'llm-hallucination'],
    questions: [
      {
        id: 'rag-evaluation-1',
        question: 'How do you evaluate a RAG system?',
        answer: `I evaluate the two stages separately, then end to end.

**Retrieval:** given a question, did the right chunks come back? I measure recall at k, plus a rank-aware metric like MRR or nDCG. This needs a set of questions labelled with their relevant documents.

**Generation:** given the retrieved context, is the answer good? The key metrics are **faithfulness** (every claim is supported by the context) and **answer relevance** (it addresses the question). If I have reference answers I also check correctness against them.

**End to end:** overall correctness, latency and cost, and online signals such as user feedback.

The foundation is a golden dataset built from real user questions, including ones that should be answered with "I do not know". I run it on every change so I can see regressions.`,
        difficulty: 'medium',
        tags: ['rag', 'evaluation'],
        followUps: ['How would you build the golden dataset if you had no labelled data?'],
      },
      {
        id: 'rag-evaluation-2',
        question: 'What retrieval metrics do you use, and what does each tell you?',
        answer: `- **Recall@k:** of the relevant documents, how many are in the top k. This is the one I watch first, because if the answer is not retrieved the LLM cannot use it.
- **Precision@k:** of the top k, how many are relevant. It tells me how much noise I am sending to the model.
- **MRR (mean reciprocal rank):** based on the position of the first relevant result. Useful when there is one correct document and I want it near the top.
- **nDCG:** rewards putting the most relevant results highest, and supports graded relevance instead of a yes/no label.
- **Hit rate:** the share of queries with at least one relevant result in the top k. A simple and readable summary.

Recall tells me about coverage; MRR and nDCG tell me about ordering, which is what a reranker improves.`,
        difficulty: 'medium',
        tags: ['rag', 'evaluation', 'metrics'],
        followUps: ['If recall@k is high but answers are still wrong, where is the problem?'],
      },
      {
        id: 'rag-evaluation-3',
        question: 'What are faithfulness and answer relevance, and how are they measured?',
        answer: `**Faithfulness**, also called groundedness, asks whether the answer is supported by the retrieved context. A common way to measure it is to have an LLM break the answer into individual claims and check each one against the context; the score is the fraction of supported claims. A low score means the model is hallucinating or drawing on its own memory.

**Answer relevance** asks whether the answer actually addresses the question, regardless of whether it is true. An answer can be fully faithful and still miss the point.

Frameworks such as RAGAS package these, along with context precision and context recall for the retrieval side. Because they rely on an LLM as the judge, I validate them against a sample of human-labelled examples before I trust the numbers.`,
        difficulty: 'medium',
        tags: ['rag', 'evaluation', 'faithfulness'],
        followUps: ['Can an answer be faithful but incorrect?'],
      },
      {
        id: 'rag-evaluation-4',
        question: 'Your RAG system is giving wrong answers. How do you debug it?',
        answer: `I take failing examples and find out which stage broke, in order.

1. **Is the answer in the knowledge base at all?** If not, it is a data coverage problem.
2. **Was the right chunk retrieved?** If not, it is a retrieval problem. I look at chunking (was the answer split?), the embedding model, whether the query needed rewriting, and whether keyword search would have caught it.
3. **Was it retrieved but ranked too low** to reach the prompt? Then I need a reranker or a larger candidate set.
4. **Was it in the prompt but the model still got it wrong?** Then it is a generation problem: the prompt, too much noise in the context, conflicting chunks, or the model itself.

Logging the query, retrieved chunks, scores and the final prompt for every request is what makes this possible. Then I fix the most common failure category first and re-run the evaluation set to confirm.`,
        difficulty: 'hard',
        tags: ['rag', 'debugging'],
        followUps: ['What would you log in production to make this debugging possible?'],
      },
    ],
  },
]
