Here I put together what I’ve learnt from the material I’ve read this week with everything I’ve learn from the beginning of December:

_Simonyan, Karen, Andrea Vedaldi, and Andrew Zisserman. "Deep inside convolutional networks: Visualising image classification models and saliency maps." arXiv preprint arXiv:1312.6034 (2013)._

_Zeiler, Matthew D., and Rob Fergus. "Visualizing and understanding convolutional networks." European conference on computer vision. Cham: Springer International Publishing, 2014._

_Jain, Sarthak, and Byron C. Wallace. "Attention is not explanation." arXiv preprint arXiv:1902.10186 (2019)._

_Wiegreffe, Sarah, and Yuval Pinter. "Attention is not not explanation." arXiv preprint arXiv:1908.04626 (2019)._

_Saadallah, Amal. "SHAP-Guided Regularization in Machine Learning Models." arXiv preprint arXiv:2507.23665 (2025)._

_Zhang, Wei, Brian Barr, and John Paisley. "Gaussian process neural additive models." Proceedings of the AAAI Conference on Artificial Intelligence. Vol. 38. No. 15. 2024._

_Tenney, Ian, et al. "What do you learn from context? probing for sentence structure in contextualized word representations." arXiv preprint arXiv:1905.06316 (2019)._

_Hewitt, John, and Percy Liang. "Designing and interpreting probes with control tasks." arXiv preprint arXiv:1909.03368 (2019)._

_Bengio, Yoshua, Aaron Courville, and Pascal Vincent. "Representation learning: A review and new perspectives." IEEE transactions on pattern analysis and machine intelligence 35.8 (2013): 1798-1828._

_“The Misguided Quest for Mechanistic AI Interpretability.” AI Frontiers, ai-frontiers.org/articles/the-misguided-quest-for-mechanistic-ai-interpretability. Accessed 12 Jan. 2026._

… plus, everything I’ve read from the beginning of this blog series.

I roughly categorize what I’ve been reading into two: investigating the theory behind learning and a deep dive into explainable AI as a tool to characterize how learning is taking place.

## The theory behind learning

I go through this in much more detail in previous posts so here I simply seek to provide a summary of the intent behind this study. 
Artificial Intelligence is all about creating systems that can be perceived as exhibiting intelligence. The definition of intelligence varies based on the perspective we take but a useful perspective is the perspective of creating intelligent systems. Taking this perspective, it is useful to view intelligence is the ability to learn and adapt to an environment. Hence, we can reframe the problem of creating intelligence as the problem of learning structure from observations. 

Thus, understanding learning becomes a key issue in AI. From Yi Ma’s recent work, learning may be framed as the process of coming up with a low rank representation of the external data distribution. In general, this leads to the reframing of AI as the process of algorithmically extracting compressed representations of data. What follows is the result that the more efficiently we can extract a data representation, the more effective our algorithm is.  

In the field of explainable AI, we use this result as a method to evaluate models, provide a different perspective from metrics such as accuracy or AUC. This theory also has deep connections to the field of representation analysis where we study the way information is compressed. 

## Interpretability techniques

The latest technique that I’ve looked at is probing and representation analysis. These two techniques present and approach your interpretability that is motivated by a goal to understand the top-down behaviour of a model in ways that are more complex than simply understanding what the features do, but less complex than mechanistic interpretability where we seek to understand what everything in the model does.

The justification for this approach is that much of the properties of large models comes from emergence. Emergence is a topic that I previously encountered in the sciences. It arises in physics where we study how at different levels of abstraction. We see different properties emerge in physical systems. For example, Newtonian mechanics works in the level of objects that we interact with on a day-to-day basis, but when we narrow down to the level of atoms, the rules of physics change. Newtonian mechanics is thus an emergent property of systems which does not correspond with how the smallest components of the system behave. 

An analogy can be drawn to deep learning here. This is most insightfully brought out in the blog post “The Misguided Quest for Mechanistic AI Interpretability” where they quote Murray Gell-Mann: “Operate at the level of most invariances and find generalizable rules that apply at the level of these phenomena.” Representation learning and probing represent early attempts at obtaining such an understanding of deep learning “at the level of most invariances” which should be useful to get a preliminary understanding of the way in which models operate.

## What’s next for interpretability?

There are quite a few ways in which interpretability research can go forward to deliver the benefits of the knowledge to the real world.
Firstly, there is the question of how interpretability methods can be incorporated into current ML ops in a way that makes interpretability more than a “box ticking exercise”. This would involve coming up with the framework to analyze the results of interpretability methods and accordingly make future decisions on how to better engineer the systems in place. Having a robust system in place is important to ensure that interpretability does not come at a cost to ML engineering teams greater than the benefit it might provide. 

The methods available are useless if there is no methodology outlining how it is to be deployed to benefit humans who use them. For this, we need to think about the entire process through which models are taking from initial idea to deployment to its intended user. This is where machine learning is seen as a combination of technological advancement and interaction with the broader Society.

One of the approaches that can be used to reach this level of integration with ML ops is to come up with a standard interface into which existing models can be plugged in. This converts interpretability into an engineering problem which brings it closer to real world deployment.
Secondly, unification is important to allow there to be a common understanding of what interpretability methods can be deployed for a particular task. An excessive abundance of available matters means there is no overarching understanding of the general case. Instead, all the methods we see today solve a small version of the larger problem because there is no one method that covers all cases and requirements. The intention should be to develop a unified framework from which special cases can be derived so that it is easier for the broader AI community to understand and use interpretability techniques. 

Lastly, Interpretability can be incorporated into the model development layer by coming up with optimization techniques that align with interpretability measures. In this way models can be made more intuitive to understand, allowing better collaboration between human and AI methods. One method of doing this is presented in the paper “SHAP-Guided Regularization in Machine Learning Models” which shows how models can be adapted at training time to ensure that encode information in a way that is easier to extract with Shapley values. However, it is important that this task is performed without sacrificing predictive performance to ensure that the models are still appealing to deploy. 

--- 

The main take away from my research is that we are in a very exciting time for the scientific development of AI where knowledge is not just heuristically gained but through scientific rigorous methods. The work we do now will go on to influence the way in which AI affects and interacts with society.
