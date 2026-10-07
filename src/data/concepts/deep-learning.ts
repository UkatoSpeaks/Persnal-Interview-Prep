import type { Concept } from '../../types'

export const deepLearning: Concept[] = [
  {
    id: 'dl-backprop-optimization',
    title: 'Backpropagation and optimizers',
    category: 'Deep Learning',
    summary: `A neural network is trained by gradient descent: run a forward pass, compute a loss, use **backpropagation** to get the gradient of the loss with respect to every weight, then take a small step against the gradient. Optimizers such as SGD with momentum, Adam and AdamW differ in how they turn that gradient into an update.`,
    keyPoints: [
      'Backprop is the chain rule applied backwards through the computation graph.',
      'Non-linear activations are what let stacked layers model non-linear functions.',
      'Adam keeps running averages of the gradient and its square to give each parameter its own step size.',
      'AdamW decouples weight decay from the gradient update; it is the usual choice for transformers.',
      'The learning rate is the most important hyperparameter; warmup then decay is a common schedule.',
    ],
    relatedConceptIds: ['dl-training-stability', 'tf-architecture'],
    questions: [
      {
        id: 'dl-backprop-optimization-1',
        question: 'How does backpropagation work?',
        answer: `Backpropagation is how we compute the gradient of the loss with respect to every weight efficiently.

First a forward pass computes the output and the loss, keeping the intermediate activations. Then we go backwards from the loss, applying the chain rule layer by layer: each layer takes the gradient coming from the layer above, multiplies by its own local derivative, and passes the result down. Because intermediate results are reused, one backward pass costs about the same as one forward pass.

Backprop only computes gradients. The optimizer is the separate step that uses them to update the weights.`,
        difficulty: 'medium',
        tags: ['backprop', 'training'],
        followUps: ['Why do we need to store activations from the forward pass?'],
      },
      {
        id: 'dl-backprop-optimization-2',
        question: 'Why do neural networks need non-linear activation functions?',
        answer: `Without them, the whole network collapses into a single linear transformation. A stack of linear layers is just one matrix multiplication, no matter how deep it is, so it could only learn linear relationships.

The non-linearity between layers is what lets depth add expressive power. **ReLU** is the common default in many networks because it is cheap and does not saturate for positive inputs, which helps gradients flow. Transformers typically use smooth variants like GELU. Sigmoid and tanh saturate at the extremes, where their gradient is close to zero, which is why they fell out of favour for hidden layers.`,
        difficulty: 'easy',
        tags: ['activations'],
        followUps: ['What is the dying ReLU problem?'],
      },
      {
        id: 'dl-backprop-optimization-3',
        question: 'What is the difference between SGD, Adam and AdamW?',
        answer: `- **SGD** updates each weight by the learning rate times the gradient of a mini-batch. With **momentum** it also keeps a running average of past gradients, which smooths the path and speeds things up.
- **Adam** keeps running averages of both the gradient and the squared gradient, and uses them to give every parameter its own effective step size. It usually converges quickly with little tuning.
- **AdamW** is Adam with weight decay applied directly to the weights instead of being mixed into the gradient. In plain Adam, L2 regularization gets rescaled by the adaptive step size, so it does not behave like true weight decay. AdamW fixes that.

In practice AdamW is the default for transformers and LLM fine-tuning, while SGD with momentum is still common in vision.`,
        difficulty: 'medium',
        tags: ['optimizers'],
        followUps: ['Why is a learning rate warmup commonly used with Adam on transformers?'],
      },
      {
        id: 'dl-backprop-optimization-4',
        question: 'How does the learning rate affect training, and how do you choose it?',
        answer: `It controls the step size. Too high and the loss oscillates or diverges. Too low and training is very slow or settles in a poor solution.

I rarely keep it constant. A common pattern, especially for transformers, is a short **warmup** from a small value up to the peak, followed by a **decay** such as cosine or linear. Warmup avoids large unstable updates at the start when the weights are random and the optimizer statistics are not reliable yet.

To choose it I start from a known-good value for the architecture, then try a few values on a log scale and watch the training loss. When fine-tuning a pretrained model I use a much smaller rate than when training from scratch, so I do not destroy what it already learned.`,
        difficulty: 'medium',
        tags: ['learning-rate', 'training'],
        followUps: ['How does batch size interact with the learning rate?'],
      },
    ],
  },
  {
    id: 'dl-training-stability',
    title: 'Training stability and regularization',
    category: 'Deep Learning',
    summary: `Deep networks are hard to train because gradients can shrink or blow up as they pass through many layers, and because large models overfit. The standard toolkit is good initialization, non-saturating activations, **residual connections**, **normalization layers**, gradient clipping, and regularizers such as **dropout** and weight decay.`,
    keyPoints: [
      'Vanishing gradients: early layers stop learning. Exploding gradients: updates become huge or NaN.',
      'Residual connections give gradients a direct path through deep networks.',
      'BatchNorm normalizes across the batch; LayerNorm normalizes across features of one example.',
      'Dropout is active only during training and switched off at inference.',
      'Gradient clipping caps the gradient norm and is the direct fix for exploding gradients.',
    ],
    relatedConceptIds: ['dl-backprop-optimization', 'ml-bias-variance', 'tf-architecture'],
    questions: [
      {
        id: 'dl-training-stability-1',
        question: 'What are vanishing and exploding gradients, and how do you deal with them?',
        answer: `During backprop the gradient is multiplied through every layer. If those factors are mostly smaller than one, the gradient shrinks towards zero by the time it reaches the early layers, so they stop learning: that is **vanishing**. If they are larger than one, it grows out of control and the loss becomes unstable or NaN: that is **exploding**.

Fixes I would mention:

- Non-saturating activations like ReLU instead of sigmoid or tanh.
- Proper weight initialization (He or Xavier).
- **Residual connections**, which give the gradient a shortcut path.
- Normalization layers.
- **Gradient clipping** for exploding gradients specifically.

This problem is also the historical reason LSTMs and GRUs replaced plain RNNs.`,
        difficulty: 'medium',
        tags: ['gradients', 'training'],
        followUps: ['Why do residual connections help with vanishing gradients?'],
      },
      {
        id: 'dl-training-stability-2',
        question: 'What is the difference between batch normalization and layer normalization?',
        answer: `Both normalize activations to stabilise and speed up training. They differ in what they average over.

- **Batch norm** normalizes each feature using the mean and variance across the **batch**. It depends on batch size, and it behaves differently at inference, where it uses running statistics collected during training.
- **Layer norm** normalizes across the **features of a single example**. It does not depend on the batch at all, so it behaves the same in training and inference.

That independence is why transformers use layer norm: sequences have variable length, batches can be small, and you do not want one example's statistics to depend on the others. Batch norm remains common in convolutional networks.`,
        difficulty: 'medium',
        tags: ['normalization'],
        followUps: ['Why does batch norm struggle with very small batch sizes?'],
      },
      {
        id: 'dl-training-stability-3',
        question: 'How does dropout work, and why is it turned off at inference?',
        answer: `During training, dropout randomly sets a fraction of activations to zero on every forward pass. The network cannot rely on any single unit, so it learns more redundant, robust features. You can think of it as training many thinned sub-networks that share weights, which reduces overfitting.

At inference we want a deterministic prediction that uses the full network, so dropout is disabled. To keep the expected activation the same in both modes, the common implementation (inverted dropout) scales the surviving activations up during training, so nothing needs to change at inference.

A practical bug to watch for is forgetting to switch the model to evaluation mode, which leaves dropout on and makes predictions noisy.`,
        difficulty: 'easy',
        tags: ['regularization', 'dropout'],
        followUps: ['What does model.eval() change in PyTorch?'],
      },
      {
        id: 'dl-training-stability-4',
        question: 'Your training loss is not decreasing. How do you debug it?',
        answer: `I go from the simplest explanation to the more subtle ones.

1. **Overfit one small batch.** If the model cannot drive the loss near zero on a handful of examples, there is a bug in the model, the loss or the data, not a tuning issue.
2. **Check the data and labels:** shapes, normalization, shuffled or misaligned labels, and the preprocessing matching what the model expects.
3. **Check the learning rate.** Too high gives a diverging or oscillating loss; too low gives a flat one. I try a few values on a log scale.
4. **Check the loss and the output layer** match, for example not applying softmax twice.
5. **Look at gradients:** NaNs, zeros, or frozen parameters that should be trainable.

Only once it trains on a small sample do I worry about regularization and generalisation.`,
        difficulty: 'hard',
        tags: ['debugging', 'training'],
        followUps: ['The loss becomes NaN after a few hundred steps. What do you check?'],
      },
    ],
  },
]
