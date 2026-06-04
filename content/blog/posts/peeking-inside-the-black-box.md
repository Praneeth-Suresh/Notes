This time around I have been furthering my work in interpretability by reading more research about the subject:  

_Machine Learning Street Talk, "#047 Interpretable Machine Learning - Christoph Molnar”_

_Molnar, Christoph. Interpretable Machine Learning: A Guide for Making Black Box Models Explainable. Christoph Molnar, 2025._

_Ribeiro, Marco Tulio, Sameer Singh, and Carlos Guestrin. "Why should i trust you?" Explaining the predictions of any classifier." Proceedings of the 22nd ACM SIGKDD international conference on knowledge discovery and data mining. 2016._

A common theme that continues to dominate the conversation is the idea that interpretability is strongly tied to the way in which the model is going to be used.  

An idea originating from Molnar Is that interpretability should be viewed as a layer in the model development process that comes after the development of the Black box model. Ideally, we should have a step where we try to understand and evaluate the model using interpretability techniques. 

 This is how I view interpretability being used in real world contexts: as a wrapper around the model to make it more suitable for deployment. 

This is a research Gap that I feel exists in the interpretability literature because interpretability techniques are not being widely deployed in model evaluation. The reason has to be that Interpretability techniques available right now are excessively complicated and not meaningful enough to be worth the effort. This is a key research gap that I feel is worth pursuing.  

## Why is interpretability useful? 

But before we start delving into interpretability research, we need to provide a valid rationale for doing research machine learning interpretability. Luckily, literature provides a lot of reasons for which interpretability is important. Here I consolidate the reasons that I find meaningful (in no order of importance): 

1. We want to figure out whether the model is learning what it is supposed to learn. For example, an image classifier trained to distinguish wolves from dogs that looks at the background to see if it contains snow or not is not a very good classifier. This will not generalize. Explanations can help spot these barriers to generalizability in the model development process itself. 
 
2. One of the most recurrent rationales for interpretability is scenarios where the objective the model is trained for does not align with its objective in a deployment context. For example, a system that is used to determine whether someone should be granted bail or not is trained for accuracy but in reality, users expect that it is a fair and ethical system. Fairness and ethicality or not training objectives so interpretability techniques are required to determine whether the model is suitable for deployment. 

In general, interpretability techniques are useful when metrics such as accuracy or AUC are insufficient measures of how good a model performs at a task. Having good interpretability techniques allows us to select the best model for the specific task at hand. 

3. Sometimes we wish to extract knowledge that we do not have through machine learning. For example, in the human sciences we might not be certain why a certain phenomenon happen. Explainability can help identify the features that are related to the occurrence of the phenomena and subsequently aid researchers in getting a better understanding of why it happens. 

4. Building trust in machine Learning Systems is a cornerstone application of interpretability. This goes back to how we evaluate models to determine whether they are trustworthy. Accuracy metrics are often used to test data but Ribeiro et al. argue that this is not the best approach in all settings. Sometimes we wish to understand the model better. This requires intrepretability. 

## Pitfalls of interpretability  

Interpretability techniques have been developed in the past but not all of them do as good a job as promised. Here are two of the most important issues that serve as a barrier to the usefulness of interpretability techniques:  

There’s a question of whether the interpretability method has told us something useful or not. In the podcast with Molnar, the example given is of an Interpretability method applied to a system that classifies animals. If it highlights the face of an animal in all cases, it hasn’t really told us anything useful about how exactly the model has made the prediction. 

The second important question is whether the interpretability technique has created a simpler representation of the larger model or not. Some interpretability techniques rely on fitting a smaller model to the local behaviour of a larger model. The question that remains to be answered is whether the smaller model is interpretable or not. For example, we could substitute the predictions of a text classifier with a decision tree, but if the decision tree that is required to represent the local decision-making process becomes too long, it is not interpretable.  

---

These are issues that we need to overcome if we are to make progress in the field of explainable AI. Explainability is clearly useful but there’s still a lot of work that needs to be done to better understand how models can be interpreted.  

Currently a lot of techniques rely on statistical methods that are used to understand large systems. The jury is still out on whether these techniques can be successful on AI or whether new techniques need to be introduced. 