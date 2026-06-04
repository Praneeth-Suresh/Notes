Settling into December 2025, here are the papers that I have been reading:

_Vaswani, Ashish, et al. "Attention Is All You Need." Advances in Neural Information Processing Systems, vol. 30, 2017._

_Guo, D., Yang, D., Zhang, H. et al. ”DeepSeek-R1 incentivizes reasoning in LLMs through reinforcement learning”. Nature 645, 633–638 (2025)._

_Shao, Zhihong, et al. "DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models." arXiv preprint arXiv:2402.03300, 2024._

_Hu, Edward J., et al. "LoRA: Low-Rank Adaptation of Large Language Models." International Conference on Learning Representations (ICLR), 2022._

_Li, Xiang Lisa, et al. "Diffusion-LM: Improves Controllability and Quality of Text Generation." Advances in Neural Information Processing Systems, vol. 35, 2022, pp. 25508-21._

Notice that this selection of papers is all about Large Language Models (LLMs). The main objective of this week’s reading is to understand the current state of the field of Artificial Intelligence (AI). 

There is a common thread that underlies all these papers: the idea that the large pre-trained model is the necessary base requirement for intelligent systems. All these papers view the pre-trained LLM as the core intelligence engine which intelligently parses and produce text to achieve human goals.
The LLM provides the ability to transform an input into a representation of the user’s intent and subsequently act to predict the answer that will best satisfy the user’s requirements. This skill is conversation and is a key capability to be able to create AI that acts intelligently from the perspective of a human. This is the reason for focusing effort on these large models. They provide a key ability of intelligence on top of which more specific skills can be added.

This reflects the current positioning of AI research where the objective is to make these large models perform well on different domains. This is an extremely exciting field that has produced numerous approaches to improve the performance of base pre-trained models at a particular task. I like to classify these approaches into 3 categories:

## Reinforcement Learning (RL)

The use of RL to create behaviours in LLMs is a stroke of genius. It overcomes the challenge of not having fresh data to train the model is a supervised fashion. It allows us to specify what behaviour we want to see from a distance and let the model do most of the work.

All this can be done with conventional RL techniques that have been around and used for a long time. Group Relative Policy Optimization (GRPO), for example, the RL algorithm used by DeepSeek, for example, is an improvement upon Proximal Policy Optimisation (PPO) which is an intelligent implementation of an actor critic system.

This allows the core principles of RL to be carried forward to the improvement of LLM performance. This has lead to great progress in model reasoning capabilities, as the paper” DeepSeek-R1 incentivizes reasoning in LLMs through reinforcement learning” explains. 

## Model Fine-Tuning

Model-Fine Tuning after pre-training is a concept that has been around for a while but pre-LoRA, the benefits did not match the higher model latency and extremely expensive fine-tuning process. LoRA changed the game by fixing these issues and brought model fine-tuning as a go to approach to create models that excel at certain domains.

Nonetheless, previous research into fine-tuning, notably adapter layers, give us a useful mental model to create flexible model during the architecture design stage itself. How this can be taken forward to create more efficient and interpretable models is a useful line of research. 

## Non-autoregressive methods

The paper "Diffusion-LM: Improves Controllability and Quality of Text Generation" introduces diffusion as a method to control the outputs of an LLM. It plays a key role in introducing the idea that non-autoregressive methods can be used to augment LLMs. It can be used to change the way in which the task of text generation is approached. 

Based on this paper, practitioners may look to diffusion as a way to replace autoregressive techniques going forward, as the key driver of conversational capability. This could make models more parallelizable because there is no more sequential generation. In addition, the iterative improvement that takes place makes it possible to build in controls to the model. Yet, there is a lot more progress to be made to allow diffusion models to compete with the transformer architecture.


***



The question that still needs to be answered however is whether such big models are necessary at all. LoRA and model distillation show that knowledge can be encoded in more efficient formats. Is it possible to come up with systems that are more effective at exploiting the fact that knowledge in large-overparametrized models is low rank? 

This is an interesting research direction to keep a look out for because as outlined, the key driver of AI in our era is the “Large” Language Model. If we can make this base conversational ability cheaper to deliver, we could achieve exponential returns. 
