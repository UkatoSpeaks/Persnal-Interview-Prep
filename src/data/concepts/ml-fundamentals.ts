import type { Concept } from '../../types'

export const mlFundamentals: Concept[] = [
  {
    id: 'ml-bias-variance',
    title: 'Bias, variance and overfitting',
    category: 'ML Fundamentals',
    summary: `Every supervised model trades off two kinds of error. **Bias** is error from a model that is too simple to capture the pattern (underfitting). **Variance** is error from a model that is so flexible it fits noise in the training set (overfitting). The practical job is to find the complexity that generalises best to unseen data, and to measure that honestly with a held-out set.`,
    keyPoints: [
      'High bias: poor on both train and validation. High variance: good on train, poor on validation.',
      'Fix variance with more data, regularization, a simpler model, early stopping or ensembling.',
      'Fix bias with a more expressive model, better features or less regularization.',
      'L1 pushes weights to exactly zero (sparse); L2 shrinks all weights smoothly.',
      'Always judge generalisation on data the model never saw during training or tuning.',
    ],
    relatedConceptIds: ['ml-evaluation-metrics', 'dl-training-stability'],
    questions: [
      {
        id: 'ml-bias-variance-1',
        question: 'Explain the bias-variance tradeoff.',
        answer: `Bias is the error I get because the model is too simple for the problem, so it misses the real pattern. Variance is the error I get because the model is too sensitive to the particular training set, so it memorises noise.

As I make a model more complex, bias goes down and variance goes up. The goal is the point in between where the error on **unseen** data is lowest. In practice I do not compute bias and variance directly; I compare training and validation error and read the gap.`,
        difficulty: 'easy',
        tags: ['generalisation', 'overfitting'],
        followUps: [
          'How does adding more training data affect bias and variance?',
          'Where do ensembles like random forests sit on this tradeoff?',
        ],
      },
      {
        id: 'ml-bias-variance-2',
        question: 'How do you tell whether a model is overfitting or underfitting, and what do you do about each?',
        answer: `I look at training versus validation performance.

- **Underfitting:** both are poor. The model cannot even fit the training data. I would use a more expressive model, add better features, train longer or reduce regularization.
- **Overfitting:** training is good, validation is clearly worse. I would get more data or augment it, add regularization (L2, dropout), simplify the model, or stop training early.

Learning curves help: if validation error is still falling as I add data, more data is worth it; if both curves have flattened at a high error, it is a bias problem and more data will not help.`,
        difficulty: 'easy',
        tags: ['overfitting', 'diagnostics'],
        followUps: ['What is early stopping and why does it act as regularization?'],
      },
      {
        id: 'ml-bias-variance-3',
        question: 'What is the difference between L1 and L2 regularization?',
        answer: `Both add a penalty on the size of the weights to the loss, which discourages the model from fitting noise.

- **L1 (lasso)** penalises the sum of absolute weights. It tends to drive some weights to exactly zero, so it produces sparse models and works as a form of feature selection.
- **L2 (ridge)** penalises the sum of squared weights. It shrinks all weights towards zero but rarely makes them exactly zero, and it handles correlated features more gracefully.

I reach for L2 by default, and L1 when I believe only a few features matter or I want a smaller, more interpretable model. Elastic net combines both.`,
        difficulty: 'medium',
        tags: ['regularization'],
        followUps: ['Why does L1 produce exact zeros while L2 does not?'],
      },
      {
        id: 'ml-bias-variance-4',
        question: 'Why do we need separate train, validation and test sets? What is cross-validation?',
        answer: `The training set fits the model. The validation set is for choosing between models and tuning hyperparameters. The test set is touched once at the end to estimate real-world performance. If I tune on the test set, I leak information from it and my final number is optimistic.

**K-fold cross-validation** splits the data into k parts, trains on k-1 and validates on the remaining one, and rotates so every part is used for validation once. Averaging the k scores gives a more stable estimate, which matters most when data is limited.

One caveat: for time series I must not shuffle. I split by time so the model is always validated on data that comes after what it trained on.`,
        difficulty: 'easy',
        tags: ['validation', 'cross-validation'],
        followUps: ['What is stratified k-fold and when do you need it?'],
      },
    ],
  },
  {
    id: 'ml-evaluation-metrics',
    title: 'Classification metrics and imbalanced data',
    category: 'ML Fundamentals',
    summary: `Accuracy is only meaningful when classes are balanced and errors cost the same. For most real problems (fraud, spam, medical screening) one class is rare and one type of mistake is worse, so you pick metrics that reflect that: **precision**, **recall**, **F1** and threshold-free curves like **ROC-AUC** and **PR-AUC**.`,
    keyPoints: [
      'Precision = TP / (TP + FP): of what I flagged, how much was right.',
      'Recall = TP / (TP + FN): of what was really positive, how much I caught.',
      'F1 is the harmonic mean of precision and recall.',
      'The decision threshold is a business choice that trades precision against recall.',
      'On heavily imbalanced data, PR-AUC is more informative than ROC-AUC.',
    ],
    relatedConceptIds: ['ml-bias-variance', 'eval-methods'],
    questions: [
      {
        id: 'ml-evaluation-metrics-1',
        question: 'What are precision and recall, and when would you favour one over the other?',
        answer: `**Precision** is, of everything I predicted positive, the fraction that really was positive. **Recall** is, of everything that really was positive, the fraction I caught.

Which one matters depends on the cost of each mistake:

- I favour **recall** when missing a positive is expensive, for example fraud or disease screening. A false alarm is cheaper than a miss.
- I favour **precision** when a false positive is expensive, for example blocking a legitimate payment or marking a real email as spam.

They pull against each other through the decision threshold, so I usually pick the threshold from the precision-recall curve based on the business cost. F1 is a single number when I need to balance both.`,
        difficulty: 'easy',
        tags: ['metrics', 'classification'],
        followUps: ['How would you choose the threshold for a fraud model?'],
      },
      {
        id: 'ml-evaluation-metrics-2',
        question: 'Why is accuracy a bad metric for imbalanced datasets?',
        answer: `Because a useless model can score very high. If 1% of transactions are fraud, a model that always predicts "not fraud" is 99% accurate and catches nothing.

Accuracy treats every prediction the same, so the majority class dominates it. For imbalanced problems I look at precision, recall and F1 for the minority class, the confusion matrix, and PR-AUC. I also compare against a trivial baseline so the number has context.`,
        difficulty: 'easy',
        tags: ['metrics', 'imbalance'],
        followUps: ['What baseline would you compare a classifier against?'],
      },
      {
        id: 'ml-evaluation-metrics-3',
        question: 'What is the difference between ROC-AUC and PR-AUC?',
        answer: `The **ROC curve** plots true positive rate against false positive rate across all thresholds. ROC-AUC can be read as the probability that the model ranks a random positive above a random negative. 0.5 is random, 1.0 is perfect.

The **precision-recall curve** plots precision against recall across thresholds.

The difference shows up with imbalance. The false positive rate divides by the number of negatives, so when negatives are huge, a lot of false positives barely moves it and ROC-AUC can look great. Precision is directly hurt by those false positives, so PR-AUC gives a more honest picture when the positive class is rare and is the one I care about.`,
        difficulty: 'medium',
        tags: ['metrics', 'imbalance'],
        followUps: ['What does a ROC-AUC of 0.5 mean? What about below 0.5?'],
      },
      {
        id: 'ml-evaluation-metrics-4',
        question: 'How do you handle class imbalance?',
        answer: `I start with the right metric and a sensible threshold, because that alone often solves the real problem. Then, in rough order:

- **Class weights** in the loss, so mistakes on the rare class cost more.
- **Resampling:** oversample the minority class or undersample the majority. Synthetic oversampling like SMOTE is an option for tabular data.
- **Threshold tuning** on the validation set instead of using 0.5.
- **More positive data**, if I can get it, which usually beats every trick.

Two things I am careful about: resampling must be applied only to the training split, never before splitting, and after resampling the predicted probabilities are no longer calibrated.`,
        difficulty: 'medium',
        tags: ['imbalance', 'training'],
        followUps: ['Why must resampling happen after the train/validation split?'],
      },
      {
        id: 'ml-evaluation-metrics-5',
        question: 'What is data leakage? Give an example.',
        answer: `Data leakage is when information that would not be available at prediction time gets into training, so the model looks great offline and fails in production.

Common examples:

- Fitting a scaler or imputer on the full dataset before splitting, so test statistics leak into training.
- A feature that is really a consequence of the label, such as "refund issued" when predicting fraud.
- Random splits on time-ordered data, so the model trains on the future.
- The same user or document appearing in both train and test.

I prevent it by splitting first, fitting all preprocessing inside the training fold (a pipeline makes this automatic), and asking of every feature whether I would actually have it at the moment of prediction. A score that looks too good is the usual warning sign.`,
        difficulty: 'medium',
        tags: ['leakage', 'validation'],
        followUps: ['How would you split data when the same user has many rows?'],
      },
    ],
  },
]
