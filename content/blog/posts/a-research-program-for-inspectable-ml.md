I read foundational deep learning papers as a single research program about trainable computation, and I argue that the discipline's next phase depends on turning interpretability and representation analysis from heuristic art into a rigorous science of how models compress, store, and use knowledge.

## Why This Matters

The dominant story about AI right now is a story about scale: bigger models, more data, more compute. I think that story is true but shallow. The common thread running through the papers I keep returning to is not "bigger is better." It is more precise and more useful: progress comes when we find a better way to organize computation around the structure of a task.

Convolutional networks organize visual computation around locality and weight sharing. Transformers organize sequence computation around attention and parallelism. Deep Q-learning organizes control around value estimates, replay, and delayed reward. Each is a different answer to the same design question. If that is the real engine of the field, then the questions worth my time are mechanistic ones: what is the model actually doing inside, which priors made the task learnable, and whether the surrounding system makes that behavior reliable enough to deploy.

This matters because we are at an inflection point. We are leaving the era where knowledge about AI is gathered heuristically - train, measure accuracy, keep what wins - and entering one where knowledge can be gained through rigorous methods. The work done now, on how to evaluate and explain models with the same seriousness we bring to building them, will shape how AI interacts with society. I want to do that work, and this essay is my attempt to make my position on it legible.

## Problem Setup

The question I use to read the foundational literature is deliberately narrow:

> How do we design trainable systems whose architecture, objective, and data interface make the target behavior easier to learn?

Cybenko's universal approximation theorem is where I start, and it is also where I stop treating expressivity as the point. The theorem says finite combinations of sigmoidal units can approximate a broad class of continuous functions. That is a permission slip, not a research program. It separates representation from feasibility: a network *can* be expressive enough, but the theorem is silent on how many units, how much data, which architecture, and which training procedure will actually find the useful function. That silence is exactly where modern AI research lives.

Layered on top of this design question is a second, harder one that has come to occupy most of my reading: once a model has learned to do something, can we understand *how*? I have come to believe interpretability is not a nice-to-have decoration on a finished model. It is the missing half of the science. The research gap I keep circling is concrete: interpretability techniques are not widely deployed in real model evaluation, and the reason is that current techniques are too complicated and not meaningful enough to be worth the effort. Closing that gap - making explanation cheap, faithful, and standard - is the problem I most want to work on.

## Method

My method is to read foundational papers as a connected trail rather than as isolated results, and to ask of each one what mental model it forces.

From LeCun et al. on convolutional networks, the mental model is that *architecture is a way of encoding assumptions about the structure of the world*. Nearby pixels matter, patterns repeat across space, and higher-level features compose from lower-level ones. CNNs do not just perform well; they make the task easier by shaping computation to match the domain.

From Vaswani et al., the mental model is that *better architectures change the path length information must travel*. Attention lets tokens connect directly, turning relationships between elements into the primary computation and removing sequential bottlenecks.

From Mnih et al. on deep Q-learning, the mental model is that *the learning setup is part of the system*. With sparse, noisy, correlated feedback and a shifting data distribution, experience replay and value learning are not implementation trivia - they are the mechanisms that make learning stable at all.

So my unit of analysis is never just the trained weights. It is the whole pipeline: data interface, architecture, objective, optimizer, memory or replay mechanism, evaluation protocol, and deployment constraint.

For interpretability specifically, my method is to treat explanation as a *wrapper applied around an already-trained model*, a layer in the development process that comes after the black box exists, following Molnar's framing. This gives a hard constraint I hold myself to: a real interpretability technique must not change the original model's weights. Probing satisfies this - you freeze the model and train a simpler model on a subset of its representations to detect what information is present. So does representation analysis. I prefer these top-down methods over full mechanistic interpretability because much of what large models do is *emergent*. The analogy I trust here is from physics: Newtonian mechanics is an emergent regime that does not resemble the rules governing atoms. As the critique in "The Misguided Quest for Mechanistic AI Interpretability" puts it, quoting Gell-Mann, you want to "operate at the level of most invariances and find generalizable rules that apply at the level of these phenomena." Probing and representational geometry are early attempts to understand models at that level of invariances, without pretending we must account for every weight.

To ground this empirically, I lean on information-theoretic structure. The Information Bottleneck framework gives normative criteria for a good representation - sufficiency, invariance, disentanglement, compression - and lets us write a loss as a proxy for them. The bottleneck loss is usually impractical to compute directly, but it is the theoretical anchor that practical tools like probing approximate, including minimum-description-length probing. Representational geometry then lets me study not just a model's end state but how its representation of information evolves and how it compares across models on the same task.

## Results

Reading this way produced a set of positions I now hold with some confidence.

First, interpretability's usefulness is inseparable from how the model will be used. Explanations earn their keep precisely when accuracy or AUC are insufficient measures of quality: when you need to check the model learned the right thing (the wolf-versus-dog classifier that actually detects snow in the background and will not generalize), when the training objective diverges from the deployment objective (a bail-recommendation system trained for accuracy but expected to be fair), when you want to extract new scientific knowledge, or when you need to build warranted trust. Good explanations therefore differ by domain, because models differ in how they balance memorization against experiential learning.

Second, progress in interpretability has been overwhelmingly *incremental*: each paper improves one desired property. LIME reweights toward plausible feature values; Shapley values import the only attribution scheme satisfying axioms argued to matter for human understanding; SHAP makes those exponential-time values computable; DeepLIFT uses gradients and activation differences to interpret deep nets efficiently while dodging saturation and discontinuity. This incrementalism is a symptom: there is no gold standard, only application-specific goals, so we get many methods each solving a small slice of the larger problem.

Third, and most synthesizing: I have come to accept Yi Ma's framing that learning is the process of finding a low-rank representation of a data distribution, which reframes AI as algorithmically extracting compressed representations of reality - the more efficiently, the better the algorithm. This connects everything. LLMs memorize a low-rank representation of human knowledge; LoRA and distillation show that knowledge in over-parametrized models is itself low-rank and can be re-encoded more cheaply; RL methods like GRPO add experiential, goal-directed learning on top of that memorized base. And it gives interpretability a clean target: if a model explicitly builds a low-rank representation, that representation has the same dimensionality as the knowledge it encodes, so it should in principle be convertible into human-understandable knowledge.

## What Worked

Reading papers as a trail rather than as trophies worked. It let me see CNNs, transformers, and deep RL as three answers to one design question instead of three separate techniques, which is far more generative when I think about new architectures.

Treating interpretability as a frozen-model wrapper worked as a discipline. It immediately tells me which methods are honest about the constraint (probing, representation analysis, post-hoc attribution) and which quietly relax it, and it points interpretability toward becoming an *engineering* problem - a standard interface into which trained models plug - rather than an open-ended philosophical one.

Borrowing rigor from adjacent fields worked best of all. Information theory gave me a definition of a good representation. Game theory (Shapley) gave attribution its only axiomatic footing. Physics gave me the emergence/invariance lens. The move from alchemy to science, for me, has literally meant importing the science that already exists elsewhere and testing whether it survives contact with deep networks.

Finally, insisting on human-centered evaluation worked as a filter. The standout there is Ribeiro et al.'s "Why Should I Trust You?", which runs real and simulated human studies to check whether an explanation lets a person pick the better classifier. That is the right shape of evidence for a field whose end user is a human making a deployment decision.

## What Failed

Some reasoning approaches did not pay off, and I want to be honest about them.

The hope that universal approximation would say something practically useful failed completely; expressivity guarantees turned out to be the least actionable part of the theory. The instinct that interpretability methods are self-evidently informative also failed: a saliency method that highlights an animal's face in every case has told me nothing about *how* the prediction was made. And surrogate methods can quietly fail their own premise - if the decision tree fitted to a text classifier's local behavior grows too deep to read, substituting it has not bought any interpretability at all.

More broadly, the assumption that statistical tools built for understanding large systems will transfer cleanly to deep networks is still unproven. The jury is genuinely out on whether these methods scale to AI or whether the field needs new primitives. I hold my information-theoretic and probing commitments provisionally for exactly this reason. I also remain unsure whether the scale-first paradigm is necessary: LoRA and distillation suggest much of the captured knowledge is low-rank, which makes me suspect we are spending compute we do not fundamentally need - but I cannot yet prove the cheaper system exists.

## What I Would Do Next

Three directions follow directly from the gaps above.

First, make interpretability deployable. I want a framework that consumes the output of interpretability methods and turns it into engineering decisions, so explanation becomes more than a box-ticking exercise. The concrete move is a standard interface into which existing models plug - converting interpretability from a research curiosity into an MLOps component whose benefit clearly exceeds its cost.

Second, pursue unification. The proliferation of methods, each optimizing a different goal, means we lack an overarching theory; I want to work toward a unified framework from which special cases are derived, ideally building on the kind of gold standards the field currently lacks. SHAP unifying additive attribution methods is a small proof that this is possible.

Third, fold interpretability into training. "SHAP-Guided Regularization" shows models can be adapted at training time to encode information in a form that is easier to extract, without sacrificing predictive performance. Combined with representation analysis and the low-rank view of knowledge, this is the most direct path to *inspectable architectures by construction* - and the closest to translating rigorous ML theory into systems people can trust and scale, which is the work I most want to do.

## Links

- Blog: https://notes.praneeth-suresh-s.workers.dev/blog/
- Essays this write-up draws from:
  - `tracing-the-mental-models-of-deep-learning-lessons-from-foundational-papers`
  - `peeking-inside-the-black-box`
  - `more-on-interpretability`
  - `from-alchemy-to-science`
  - `approaching-the-frontiers`
  - `the-era-we-live-in`
  - `what-exactly-are-we-doing`
- Contact: praneeth.suresh.s@gmail.com

