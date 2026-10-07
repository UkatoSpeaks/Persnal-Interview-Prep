import type { Concept } from '../../types'

export const embeddingsVectorDbs: Concept[] = [
  {
    id: 'emb-embeddings',
    title: 'Embeddings and similarity',
    category: 'Embeddings & Vector DBs',
    summary: `An embedding is a dense vector that represents a piece of text (or an image, or a user) so that things with similar meaning end up close together. That turns "find related content" into a nearest-neighbour search. Embeddings power semantic search, RAG retrieval, clustering, deduplication and recommendations.`,
    keyPoints: [
      'Similar meaning means nearby vectors, even with no words in common.',
      'Cosine similarity compares direction and ignores magnitude.',
      'For normalized vectors, cosine similarity and dot product give the same ranking.',
      'Queries and documents must be embedded with the same model.',
      'Changing the embedding model means re-embedding the whole corpus.',
    ],
    relatedConceptIds: ['emb-vector-search', 'rag-retrieval-reranking', 'rag-chunking'],
    questions: [
      {
        id: 'emb-embeddings-1',
        question: 'What are embeddings and why are they useful?',
        answer: `An embedding is a fixed-length vector of numbers that captures the meaning of some input. An embedding model is trained so that inputs with similar meaning map to vectors that are close together.

That is useful because it lets a computer compare meaning with simple geometry. "How do I reset my password?" and "I forgot my login credentials" share almost no words, but their embeddings are close, so a search on one finds the other. Keyword search would miss it.

I use them for semantic search and RAG retrieval, and the same idea works for clustering, duplicate detection, classification and recommendations.`,
        difficulty: 'easy',
        tags: ['embeddings'],
        followUps: ['How are embedding models trained?'],
      },
      {
        id: 'emb-embeddings-2',
        question: 'What is the difference between cosine similarity, dot product and Euclidean distance?',
        answer: `- **Cosine similarity** measures the angle between two vectors. It ignores length, so it only cares about direction.
- **Dot product** depends on both the angle and the lengths, so longer vectors score higher.
- **Euclidean distance** is the straight-line distance between the two points.

If the vectors are **normalized** to unit length, which many embedding models do, all three produce the same ranking: cosine equals the dot product, and Euclidean distance is a monotonic function of it. In that case I use the dot product because it is the cheapest.

The rule I follow is to use the metric the embedding model was trained with, which the model documentation states.`,
        difficulty: 'medium',
        tags: ['embeddings', 'similarity'],
        followUps: ['When would magnitude carry useful information?'],
      },
      {
        id: 'emb-embeddings-3',
        question: 'How do you choose an embedding model?',
        answer: `I look at a few things, then test on my own data.

- **Retrieval quality on my domain.** Public leaderboards like MTEB are a starting point, but ranking on general benchmarks does not guarantee ranking on legal, medical or code data.
- **Maximum input length**, which limits my chunk size.
- **Dimension.** Larger vectors can capture more but cost more storage and make search slower.
- **Languages** the data and the users are in.
- **Cost, latency and hosting:** an API versus an open model I run myself, and any data privacy constraint.

The deciding step is a small evaluation set of real queries with known relevant documents, and comparing recall at k between candidates. I also keep in mind that switching models later means re-embedding everything.`,
        difficulty: 'medium',
        tags: ['embeddings', 'model-selection'],
        followUps: ['What happens if you embed queries with a different model than the documents?'],
      },
      {
        id: 'emb-embeddings-4',
        question: 'What is the difference between a bi-encoder and a cross-encoder?',
        answer: `A **bi-encoder** embeds the query and the document **separately** into vectors, and relevance is the similarity between them. Document vectors can be computed once and indexed, so search over millions of documents is fast. The weakness is that the query and document never see each other inside the model.

A **cross-encoder** takes the query and one document **together** as a single input and outputs a relevance score. Because attention runs across both, it is much more accurate, but it needs a full model pass for every query-document pair, so it cannot be precomputed and does not scale to a whole corpus.

That is why they are used together: the bi-encoder retrieves a candidate set cheaply, and a cross-encoder reranks the top results.`,
        difficulty: 'medium',
        tags: ['embeddings', 'reranking'],
        followUps: ['How many candidates would you pass to the reranker, and why?'],
      },
    ],
  },
  {
    id: 'emb-vector-search',
    title: 'Vector databases and ANN search',
    category: 'Embeddings & Vector DBs',
    summary: `A vector database stores embeddings and finds the nearest ones to a query vector. Comparing against every vector is exact but too slow at scale, so they use **approximate nearest neighbour (ANN)** indexes such as **HNSW** and **IVF**, which trade a little recall for a large speedup. Real systems also need metadata filtering, updates and often hybrid keyword search.`,
    keyPoints: [
      'Exact (brute-force) search is fine for small collections and gives perfect recall.',
      'HNSW: a layered graph you navigate greedily. Fast and accurate, but memory-hungry.',
      'IVF: cluster the vectors, then search only the nearest clusters.',
      'Product quantization compresses vectors to save memory at some cost in accuracy.',
      'Index parameters tune the tradeoff between recall, latency and memory.',
    ],
    relatedConceptIds: ['emb-embeddings', 'rag-retrieval-reranking', 'be-postgresql'],
    questions: [
      {
        id: 'emb-vector-search-1',
        question: 'Why do vector databases use approximate nearest neighbour search instead of exact search?',
        answer: `Exact search compares the query against every stored vector, so the cost grows linearly with the collection. That is fine for thousands of vectors, but with millions of high-dimensional vectors it is too slow for an interactive request.

ANN indexes organise the vectors so a query only looks at a small fraction of them. The price is that the result is approximate: it may occasionally miss a true nearest neighbour. That is measured as **recall**, and the index parameters let me trade recall against latency.

For RAG this is usually a good deal, because the top results are passed to a reranker or an LLM anyway. For a small corpus I would skip the index and use exact search.`,
        difficulty: 'easy',
        tags: ['vector-db', 'ann'],
        followUps: ['At what scale would you start to need an ANN index?'],
      },
      {
        id: 'emb-vector-search-2',
        question: 'How does HNSW work?',
        answer: `HNSW stands for Hierarchical Navigable Small World. It builds a graph where each vector is a node connected to some of its nearest neighbours, organised in layers.

The top layers are sparse and contain only a few nodes with long-range links. The bottom layer contains every vector. A search starts at the top, greedily moves to whichever neighbour is closest to the query, and when it cannot improve it drops down a layer and continues. The upper layers get it to the right region quickly; the bottom layer does the fine search.

The main parameters are how many connections each node has and how wide the search is at build time and at query time. Raising them improves recall and costs memory and latency. HNSW gives very good recall and speed; its drawbacks are high memory use and slower index builds.`,
        difficulty: 'hard',
        tags: ['vector-db', 'hnsw'],
        followUps: ['How does IVF differ from HNSW?'],
      },
      {
        id: 'emb-vector-search-3',
        question: 'How do IVF and product quantization work?',
        answer: `**IVF (inverted file index)** clusters the vectors, typically with k-means, and stores each vector under its nearest cluster centre. At query time it finds the few centres closest to the query and searches only the vectors in those clusters. The number of clusters probed is the knob: more probes means better recall and slower queries.

**Product quantization** is about memory, not search structure. It splits each vector into sub-vectors and replaces each one with the id of the nearest entry in a small learned codebook. A vector that took thousands of bytes becomes a few bytes, and distances are approximated from the codes.

They are often combined: IVF narrows the search and PQ compresses what is stored. Compared with HNSW, this uses far less memory, usually with lower recall at the same speed.`,
        difficulty: 'hard',
        tags: ['vector-db', 'ivf', 'quantization'],
        followUps: ['When would you pick IVF with PQ over HNSW?'],
      },
      {
        id: 'emb-vector-search-4',
        question: 'How does metadata filtering work with vector search, and what can go wrong?',
        answer: `Most real queries are "the nearest vectors **where** tenant is X and the date is after Y". There are two basic strategies.

- **Post-filtering:** run the vector search, then drop results that fail the filter. It is simple, but if the filter is selective I can end up with fewer than k results, or none.
- **Pre-filtering:** apply the filter first, then search within the matches. It is correct, but a naive version loses the benefit of the ANN index, and a restrictive filter can break up the graph that the index relies on.

Many vector databases implement filtering inside the index traversal to get the best of both. In practice I check how the database I am using handles it, test with my most selective filters, and for hard multi-tenant isolation I prefer a separate namespace or partition per tenant.`,
        difficulty: 'hard',
        tags: ['vector-db', 'filtering'],
        followUps: ['How would you enforce per-user document permissions in a RAG system?'],
      },
      {
        id: 'emb-vector-search-5',
        question: 'When would you use pgvector instead of a dedicated vector database?',
        answer: `I would use **pgvector** when I already run PostgreSQL and the scale is moderate. The benefits are practical: one database to operate, vectors stored next to the relational data, normal SQL filters and joins, and transactions, so the embeddings never drift out of sync with the rows they describe.

I would move to a **dedicated vector database** when vector search becomes the main workload: very large collections, high query throughput, tight latency targets, or a need for features like built-in hybrid search and horizontal scaling that I do not want to build myself.

My default is to start with pgvector, because fewer moving parts matters more than peak performance early on, and to migrate only when measurements show I need to.`,
        difficulty: 'medium',
        tags: ['vector-db', 'pgvector', 'postgresql'],
        followUps: ['What index types does pgvector support?'],
      },
    ],
  },
]
