As I’ve been travelling, I’ve spent time both reading and listening to podcasts by prominent individuals in AI. 

_Behrouz, Ali, Peilin Zhong, and Vahab Mirrokni. "Titans: Learning to memorize at test time." arXiv preprint arXiv:2501.00663 (2024)._

_Doshi-Velez, Finale, and Been Kim. "Towards a rigorous science of interpretable machine learning." arXiv preprint arXiv:1702.08608 (2017)._

_Machine Learning Street Talk, "The Mathematical Foundations of Intelligence [Professor Yi Ma]"_

_Dwarkesh Podcast, "Richard Sutton - Father of RL thinks LLMs are a dead end"_

I’ve been grappling with a foundational question in the field of artificial intelligence, which is “what is intelligence?”. This is a look into a first principles approach to developing artificial intelligence. For all this time I’ve been exploring established conventions in the field without knowing how they have come about. However, I believe a broad understanding of Artificial Intelligence can only be achieved once you figure out what the meaning of an intelligent system is. This will help us develop a broader picture of what exactly we are trying to do in this area of study. 

A key characteristic of an intelligent being or system is its ability to learn. Learning is how an intelligent system develops a capacity for intelligence by discovering how to optimally interact with its environment. 

## Learning 

One of the most important ideas that I gathered from my exploration of AI has been understanding how the general process of learning can be codified in a mathematical way. The idea that most impressed me was Dr. Yi Ma’s definition of learning is the process by which a low-rank representation of a data distribution or a system is determined.  

This intuitively makes sense because when we try to understand processes that take place around us, we are trying to come up with a general explanation for the phenomena that we see. This is what learning entails and this is true, not just in the natural sciences. For example, in art, a representation of reality is created through works produced by the artist. These representations of reality are just that: representations. They are condensed representations of what we see around us which can be extended to innumerable instances of the phenomena. This is what we call a low-rank representation. 

The most basic example that can be used to show that machine learning produces a low-rank representation of data is the process of linear regression where a linear relationship between two data points with hundreds of instances can be captured with just two variables. Having defined learning as the process in which a low rank representation of external reality is created, we turn our attention to the question of how we can create this low rank representation. 

## Memorization  

One way in which a low-rank representation can be learned is to derive it from an established set of ideas in the field. This is the approach that is used when a student remembers all the relevant equations or theorems in preparation for an exam without trying to derive them first hand. Their memory of theorems will then be used to solve problems. 

This is what Large Language Models (LLMs) do 

This is what Large Language Models (LLMs) do. They are trained on a low rank representation of human knowledge expressed through language. With gradient descent, the model creates an efficient representation of this data which is retrieved during inference to predict the next token. This is the process in which memorized knowledge is used to answer questions. 

An agent acting using Memorization does not have the ability to act on its own will. Instead, it merely replicates what it has seen during training. In short, it does not have a goal (an idea originating from Dr. Richard Sutton). Such systems can be trained using supervised or unsupervised learning. 

## Experiential Learning 

Instead of imitating a known system, the other way of learning is through interacting with the environment and understanding how it works. This is the core principle of reinforcement learning where an agent performs an action in line with a **goal**. 

 Such a technique is like a student who tries out different proof techniques to determine which is the best way to prove theorem. Then they remember the optimum strategy that they followed. This allows them to generalize to problems that may not be the same in the future. 

 When doing machine learning the most common approach that is used to give an agent a is by designing it as a reward maximiser. The reward in turn serves as a proxy for the goal that the agent is supposed to have. Much work has been done on ways to then train the agent to develop the optimal policy and had led to the field of Reinforcement Learning (RL). 

## So, what is intelligence? 

So far, we have seen two approaches to learning. This however does not answer the question of what intelligence entails. This is a question that is not been answered in the general literature either and the definition of intelligence varies from expert to expert and field to field. 

 My temporary understanding of intelligence is the ability to create a knowledge representation, update it to keep up with changing circumstances and use this representation to navigate the real world. 

 This requires both learning through memorization as well as experiential learning. Memorization is useful to train concepts that are too difficult to train on (efficiently) while experiential learning is the necessary requirement to be able to keep up with changing circumstances. 

Memorization may also serve as an approach to achieve language competency. This has been demonstrated by LLMs which are great interfaces for intelligence since they can operate in the predominant domain of human communication. 

## How can we develop intelligent systems? 

Based on the past half century of work in artificial intelligence, we can reasonably infer that intelligence systems are those that allow an efficient low-rank knowledge representation to be constructed. Dr. Ma’s work is pushing towards a scientific way in which such representations may be constructed. 

Google's Titans architecture aligns perfectly with Dr. Ma's discussion of intelligence systems is being efficient in extracting low-rank representations of knowledge. It is a system that creates an effective low-rank representation of long-time series using an intelligent way to manage the addition and deletion of information in each time step. 

However, throughout the history of AI development, this process has largely involved a form of natural selection, where different models are tested and only the most successful are retained. 

## Onwards with explainable models?

 We have seen that intelligent models need two characteristics: the ability to memorize and the ability to learn from experience. Different models have different combinations of these abilities. An implication of this is that different applications require different approaches to model interpretation.  

In other words, good explanations differ from domain to domain. When appraising and doing research in interpretable machine learning, we should focus on the area of knowledge that the model is dealing with. Accordingly, the schema for results about interpretability change. 

One more interesting point that comes out with respect to interpretable AI is the fact that learning is the process of acquiring a low-rank representation of external reality. In principle, for a model that explicitly constructs a low rank representation, it should be possible to convert this low rank representation into human understandable knowledge since the knowledge is presented with the same number of dimensions. 

--- 

The key takeaway is that knowledge can be abstracted as a low rank representation of external reality. This is a principle that can usefully guide us to create more robust AI systems going forward. 