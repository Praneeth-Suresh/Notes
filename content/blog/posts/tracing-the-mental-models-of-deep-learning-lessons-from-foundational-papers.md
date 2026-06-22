The papers that first made deep learning feel like a research program to me were not only about better benchmarks. They each changed the shape of the question: what kind of trainable computation should we build for a task?

In this essay, I use four foundational papers as a compact AI research trail:

- George Cybenko, "Approximation by Superpositions of a Sigmoidal Function."
- Yann LeCun et al., "Gradient-Based Learning Applied to Document Recognition."
- Ashish Vaswani et al., "Attention Is All You Need."
- Volodymyr Mnih et al., "Playing Atari with Deep Reinforcement Learning."

Together, they frame deep learning as the study of trainable information-processing systems: how they represent patterns, how architectures encode useful priors, and how objectives turn feedback into behavior.

## In this essay

- We will treat universal approximation as a starting point, not a finished theory.
- We will compare CNNs, transformers, and deep RL as different answers to the same design problem.
- We will connect the paper trail to my broader AI research taste: interpretability, representation analysis, model adaptation, memory, routing, and agent evaluation.
- We will name the research gap that keeps coming back: we do not yet have a general theory for matching architectures and training loops to tasks.

## Research question

The question I am using to read these papers is:

> How do we design trainable systems whose architecture, objective, and data interface make the target behavior easier to learn?

Cybenko's theorem says that neural networks can approximate a broad class of continuous functions. That is a powerful existence result, but it does not tell us how large the network must be, what architecture should be used, or why a particular training procedure should find the useful function.

That gap is where modern AI research lives. If an arbitrary large network can represent the function in principle, the research problem becomes practical and scientific: which inductive biases make learning efficient, reliable, interpretable, and controllable?

## Papers in the trail

### Universal approximation

Cybenko gives the mathematical permission slip for neural networks: finite combinations of sigmoidal units can approximate continuous functions under suitable conditions.

The result is important because it separates representation from feasibility. It says a neural network can be expressive enough, but it leaves open the question that matters for research practice: how many units, how much data, what training procedure, and what architecture?

That is why I do not read universal approximation as "neural networks solve everything." I read it as the opening constraint: expressivity alone is not a research program.

### Convolutional architectures

LeCun et al. show why architecture matters. A convolutional neural network does not treat every input dimension as unrelated. It uses locality, shared weights, and hierarchical feature extraction to make visual recognition learnable.

This is the first major mental model: architecture is a way of encoding assumptions about the structure of the world. In image recognition, nearby pixels matter, useful patterns repeat across space, and higher-level features can be composed from lower-level features.

The point is not just that CNNs perform well. The point is that they make a task easier by shaping the computation to match the domain.

### Self-attention and sequence modeling

Vaswani et al. make a different architectural bet. Instead of processing a sequence step by step, the transformer lets tokens attend to other tokens directly.

The research move is clear: reduce sequential bottlenecks, improve parallelism, and make long-range interactions easier to represent. Attention turns relationships between elements into the primary computation.

This is the second mental model: better architectures often change the path length through which information must travel. If a model can connect relevant parts of an input more directly, it can represent some dependencies more cleanly.

### Reinforcement learning from high-dimensional input

Mnih et al. bring the same deep learning question into control. Deep Q-learning learns policies from pixels and delayed rewards, not from a static supervised dataset.

This changes the difficulty profile. The training signal is sparse and noisy. Samples are correlated. The data distribution changes as the agent learns. Experience replay and value learning are not just implementation details; they are mechanisms for making learning stable enough to work.

This is the third mental model: the learning setup is part of the system. Architecture matters, but so do the feedback loop, objective, memory, and data distribution.

## Model and mechanism

These papers make me view AI research as a subset of computer science research about learned computation.

The computational object is not just the trained model. It is the whole pipeline:

- data interface
- architecture
- objective
- optimizer
- memory or replay mechanism
- evaluation protocol
- deployment constraint

That is why my research taste now leans toward AI research questions that expose mechanisms rather than only chase benchmark scores:

- What representations does the model learn?
- Which architectural priors make a task easier?
- When does adaptation require new parameters, new memory, or new data?
- How do explanations become faithful enough to support deployment decisions?
- How should agents trade accuracy against cost, latency, and reliability?
- Can routing, merging, or speculative decoding activate only the computation a task needs?

## Why this matters

The common thread across the papers is not "bigger models are better." It is more precise: AI research advances when we find a better way to organize computation around the structure of a task.

CNNs organize visual computation around locality and weight sharing. Transformers organize sequence computation around attention and parallelism. Deep Q-learning organizes control around value estimates, replay, and delayed reward. Modern interpretability and agent research continue the same pattern by asking what the model is doing internally and whether the surrounding system makes that behavior reliable.

This is why I want the website to reflect AI research throughout. Algorithms, systems, and software engineering still matter, but they now serve the main thread: understanding, building, evaluating, and explaining AI systems as computational artifacts.

## Internal trail

- Use the [research taste list](/research-taste/) for the broader AI paper trail behind future notes.
- Read [Peeking Inside the Black Box](/blog/peeking-inside-the-black-box/) for the interpretability direction.
- Read [Diving Deep into interpretability](/blog/more-on-interpretability/) for the deployment and evaluation angle.
- Browse [AI Engineering](/topics/ai-engineer/) for systems notes around accelerating AI.

## Further reading

- George Cybenko, [Approximation by Superpositions of a Sigmoidal Function](https://doi.org/10.1007/BF02551274).
- Yann LeCun et al., [Gradient-Based Learning Applied to Document Recognition](https://doi.org/10.1109/5.726791).
- Ashish Vaswani et al., [Attention Is All You Need](https://arxiv.org/abs/1706.03762).
- Volodymyr Mnih et al., [Playing Atari with Deep Reinforcement Learning](https://arxiv.org/abs/1312.5602).

## Questions readers usually ask

### Is deep learning research only about bigger models?

No. Scale matters, but the deeper question is how architectures, objectives, data, and training loops make a model fit the structure of a task.

### Why include reinforcement learning beside architecture papers?

Deep RL is part of the same AI research question because it asks how a trainable system can discover useful behavior from delayed, noisy feedback instead of only labeled examples.

### What gap does this reading trail leave open?

It leaves open a theory of when a particular architecture, training objective, or memory mechanism is the right fit for a task rather than merely an empirically successful choice.

## Corrections and clarifications

If I find a substantive mistake in this essay or its source trail, I will record it on the [errata page](/errata/) and update the affected passage.
