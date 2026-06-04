This time the focus is on examining real interpretability techniques that are used out there. 

_Ribeiro, Marco Tulio, Sameer Singh, and Carlos Guestrin. "" Why should i trust you?" Explaining the predictions of any classifier." Proceedings of the 22nd ACM SIGKDD international conference on knowledge discovery and data mining. 2016._

_Lundberg, Scott M., and Su-In Lee. "A unified approach to interpreting model predictions." Advances in neural information processing systems 30 (2017)._

_Shrikumar, Avanti, Peyton Greenside, and Anshul Kundaje. "Learning important features through propagating activation differences." International conference on machine learning. PMlR, 2017._

_Molnar, Christoph. Interpretable Machine Learning: A Guide for Making Black Box Models Explainable. Christoph Molnar, 2025._

Progress in interpretability research is, for a large part, incremental with each paper improving upon previous work in a particular desired characteristic. Improvements I've look at take inspiration from statistical methods and deliver better results on the metric they promised. Here we will go through a few of these incremental improvements delivered by few of the important works in interpretability research. 

We observe this pattern because there’s no gold standard in interpretability, but it rather depends on the application that we’re trying to work with. This is why we have various approaches optimising for different goals. A possible research gap would be to determine ways in which gold standards might be created so that we can go forward with a more scientific approach to interpretability. But more on this later. 

## How techniques evolve 

The most basic technique involves changing one variable across its spectrum of values and seeing how the output changes. This is a way to determine what the effect of that variable is on the prediction (Partial Dependence Plots). However, an issue with this technique is that some of the feature values might end up being unreasonable because of a correlation between the features. For example, a house with area of 25 m2 probably most likely does not have 8 rooms. 

This leads to technique of explicitly capturing feature interactions to determine how features might work together in ways that invalidate certain interpretability techniques. It also leads to LIME, a technique which seeks to give more weight to feature values that are more likely.  

Another source of incremental improvements is from comparison with statistics. One of the best examples of these techniques comes in the form of Shapley values. These originate from game theory and are particularly useful because they constitute the only interpretability approach that satisfies axioms which are argued to be important to allowing humans to understand predictions well. 

This is the foundation of the paper “A Unified Approach to Interpreting Model Predictions” which has the goal of showing how different techniques can lead to approximations of the Shapley value. These approximations improve the overall usability of the furnished explanation, as shown by the paper. 

However, Shapley values pose a problem. The computation of sharply values requires exponential time. They are not feasible to compute. Hence the paper comes up with SHAP: an approximation. The paper goes on to present ways in which Shapley values can be approximated that retains the axioms while not compromising on efficiency to compute. 

The search for efficient algorithms seen here is also another pattern of incremental improvements in explainable machine learning. Another instance where there’s a search for efficient computation is in the evaluation neural networks.  

Model agnostic techniques require the model to be repeatedly evaluated, but for deep learning techniques, this is inefficient due to the large size of the model. This is why separate deep learning interpretability techniques exists that seek to interpret these models more efficiently. The key technique that emerges in deep learning is the use gradients and backpropagation. 

This is the idea behind techniques such as DeepLIFT which try to perform efficient evaluations while overcoming the weaknesses presented using gradients, specifically saturations and discontinuities. These examples are meant to outline the way in which progress is happening incrementally in interpretable machine learning towards algorithms that better satisfy our requirements of interpretability methods. 

## Proving progress 

With each improvement, researchers want a method in which they can show that progress has been made. Across my readings the best approach I’ve seen to doing this is to use user simulated studies or studies with actual humans. This comes back to the initial point about interpretability research being focused on application and the human who is going to be using the model to optimise model deployment. 

A paper with standout human centred evaluation is ‘"Why should I trust you?” Explaining the predictions of any classifier” which does multiple experiments to deduce whether the goals of an explanation are met. The goals include seeing whether a human can select the best classifier for the task based on the explanation. 

--- 

 As opposed to an incremental way of improvement, we see in most other fields that improvement can be driven by paradigm shifts. Where the paradigm shifts can happen going forward will be explored later. This should be an exciting improvement to watch going forward from classical interpretability techniques towards the cutting edge of interpretability research. 