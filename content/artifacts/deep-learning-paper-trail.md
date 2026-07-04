# Deep Learning Paper Trail

This is a compact source-trail artifact for the essay:

`The mental models of deep learning`

## Research Question

How do we design trainable systems whose architecture, objective, and data interface make the target behavior easier to learn?

## Four Anchors

| Paper | Mechanism to inspect | Why it matters |
| --- | --- | --- |
| George Cybenko, "Approximation by Superpositions of a Sigmoidal Function" | Universal approximation | Separates representational possibility from practical learnability. |
| Yann LeCun et al., "Gradient-Based Learning Applied to Document Recognition" | Convolutional locality and weight sharing | Shows how architecture can encode task structure. |
| Ashish Vaswani et al., "Attention Is All You Need" | Self-attention over sequence elements | Makes long-range interaction the central computation. |
| Volodymyr Mnih et al., "Playing Atari with Deep Reinforcement Learning" | Value learning, replay, delayed rewards | Treats the feedback loop and data distribution as part of the system. |

## Reading Checklist

- What assumption about the task does the architecture encode?
- What computation becomes shorter, cheaper, or more stable?
- What does the objective reward directly, and what behavior is only indirect?
- What evaluation would reveal whether the learned representation is useful?
- What would make the result fail outside its original domain?

## Reusable Claim

Deep learning research is not only about increasing model size. It is about organizing trainable computation so the model, data, objective, memory, and evaluation protocol fit the structure of the task.
