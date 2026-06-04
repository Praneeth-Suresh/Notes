This week was a technical deep dive into the principles of representation learning, based on the following works:

_Tishby, Naftali, and Noga Zaslavsky. "Deep learning and the information bottleneck principle." 2015 ieee information theory workshop (itw). Ieee, 2015._

_Shwartz-Ziv, Ravid, and Naftali Tishby. "Opening the black box of deep neural networks via information." arXiv preprint arXiv:1703.00810 (2017)._

_Voita, Elena, and Ivan Titov. "Information-theoretic probing with minimum description length." arXiv preprint arXiv:2003.12298 (2020)._

_Elhage, Nelson, et al. "Toy models of superposition." arXiv preprint arXiv:2209.10652 (2022)._

The purpose of this writing will be to organise the techniques studied into a framework of tools with which to deal with interpretability.

## Information bottleneck (IB) theory

This first theory gives us a mathematical framework using which we can define what a “good” representation might look like.

The theory first defines the normative criteria that we want to see in a good representation. These are sufficiency, invariance, disentanglement and information compression. Now, it becomes a matter of writing down a loss function that is a proxy for these normative criteria against which we can optimise to determine the ideal representation.

This is useful because it gives us a way to evaluate the representation of information inside a model as a way to track it’s performance and compare it with other models. Furthermore, since it is a general framework it can be applied to a diverse range of models.

The issue is in the computation of the loss function which is not practical in most cases. Nonetheless, the IB framework is a useful theoretical tool to ground other practical methods we are going to see going forward.

## Probing

Probing refers to a range of approaches which seek to determine information presence. On the high level, this fits in perfectly with the IB framework because we can compare the theoretical and empirical amounts of information present. This is why I see probing as an incredibly useful technology: it allows us to convert insights from information theory into useful results we can work with.

It becomes even more useful when we see probing as a general principle instead of one tool. Probing is the idea of taking an already trained model and understanding how it works by using a certain subset of weights to train a simpler model. By implication, none of the weights of the original model can be changed during the probing process. Hence, it meets my requirement of an interpretability technique as a wrapper we apply around an already trained model.

## Representational geometry 

This field concerns itself with the structure of representations in a model. Structure is important because it dictates how models construct representations and thus, allow us to spot any inefficiencies in representing information within models. It also allows us to more effectively determine ways in which we can improve architecture to better train models. 

This is why I believe that representational geometry is one of the most powerful ways to understand the model because it doesn’t just allow us to understand the model in its end state but also learn how the representation of information evolves over time and how it might compare with other models working on the same task.

I believe that work and representational geometry will help us come up with a scheme to extract information the way it is represented from a model. I also believe that this field can contribute to developing better AI because it allows us to head towards architectures that yield the best geometric representation of our data.

---

These techniques I have presented play a key role in the way interpretability research would evolve going forward because they are all top down techniques that examine how a model operates from the outside. This is key to not compromising accuracy while getting a broad representative picture of a complex model, respecting the fact that these models are complex systems.
