I built a research notebook that studies whether short-horizon mid-price movement can be predicted from raw limit order book (LOB) features, benchmarking a logistic baseline, an MLP, and a DeepLOB-style sequence model, and then interrogating the best model with feature ablation and gradient-based interpretability probes.

## Why This Matters

Limit order books are one of the hardest, most honest datasets in applied machine learning. They are high-frequency, non-stationary, heavily imbalanced, and have a brutally weak signal-to-noise ratio. If you want to find out quickly whether a modeling idea actually carries information or is just memorizing noise, market microstructure is an unforgiving place to test it.

That is precisely why I chose it. Mid-price forecasting forces a model to confront the three problems that quietly break most real-world ML systems at once: class imbalance (price often does not move at all within a short horizon), temporal dependence (rows are not i.i.d., so naive shuffling leaks information), and low signal strength (the gap between a strong baseline and a "smart" model is small and easy to fake). A method that looks impressive on clean benchmarks frequently collapses here.

There is a second reason this project matters to me, and it connects to my broader thesis of building inspectable systems. A model that claims to predict price movement should be able to tell you *why* - which book levels, which side of the book, which engineered features drive the decision. So I deliberately treated this not only as a forecasting task but as a testbed for interpretability. A predictor that cannot expose its own reasoning is not trustworthy, and in a domain where the "signal" can easily be an artifact of the split, interpretability is not a nice-to-have. It is the difference between a result and a coincidence.

## Problem Setup

The task is short-horizon mid-price movement classification. Given a window of recent order-book state - bid and ask prices and volumes across multiple levels - predict whether the mid-price will move up, down, or stay flat over a short future horizon.

I used the benchmark dataset by Ntakaris et al., "Benchmark dataset for mid-price forecasting of limit order book data with machine learning methods" (*Journal of Forecasting*, 2018), accessed through Kaggle. This dataset is a good choice because it is an established academic benchmark rather than a bespoke scrape, which makes the framing comparable to prior work and keeps me honest about whether my numbers are reasonable.

The hard parts of the setup are not the model - they are everything before it:

- **Imbalance.** The "no movement" class dominates, so accuracy alone is a misleading headline metric. A model that always predicts "flat" can look deceptively competent.
- **Temporal leakage.** Order-book rows are sequential and autocorrelated. If you build train/validation/test splits by random shuffling, future information bleeds into training and inflates every number you report. Splits have to respect time.
- **Feature scale.** Price and volume features live on very different scales and drift over time, so normalization choices materially change what the model can learn.

The notebook (`baseline.ipynb`) contains the full pipeline end to end: parsing the raw LOB text files, cleaning and normalizing features, constructing splits, training each model, evaluating with class-aware reports, and running interpretability probes on the strongest model.

## Method

I structured the work as a ladder of increasing model complexity, so that every step up has to *earn* its complexity against a simpler predecessor.

```text
Kaggle LOB text files
      -> Parse order-book rows
      -> Clean and normalize features
      -> Time-respecting train/validation/test splits
      -> [Logistic baseline] [MLP baseline] [DeepLOB-style sequence model]
      -> Accuracy and per-class reports
      -> Feature ablation, saliency, integrated gradients (on best model)
```

**Baseline 1 - Logistic regression.** The cheapest possible model on normalized features. Its job is to set the bar. In noisy financial data, a well-regularized linear model is shockingly hard to beat, and if a deep model cannot clear it, the deep model is not learning structure - it is learning to overfit.

**Baseline 2 - MLP.** A small feedforward network on the same features. This isolates one question: does adding non-linear capacity on the *same* representation help? If the MLP underperforms the logistic baseline, the bottleneck is the representation, not the model class.

**Sequence model - DeepLOB-style architecture.** The most expressive model, designed around the structure of the data rather than against it. DeepLOB-style architectures combine convolutional feature extraction over the book levels with sequence modeling over time, so the model can learn local spatial patterns across the order book and temporal dynamics jointly. This is the model that *should* win if there is genuinely sequential, microstructural signal to exploit.

**Interpretability layer.** On the best-performing model I ran feature ablation (removing or perturbing groups of features to measure their contribution), saliency, and integrated gradients via Captum. The goal was to check whether the model's attributed importance lands on plausible book levels and sides, or whether it is leaning on artifacts. This is the part of the project I care about most: it is the mechanism by which I distinguish a real result from a lucky split.

I kept the technical stack deliberately standard - Python, pandas, scikit-learn, PyTorch, matplotlib, and Captum - because the contribution here is the experimental design and the honesty of the evaluation, not an exotic toolchain.

## Results

The checked-in notebook reports the following representative metrics on the current split. I present them exactly as they are, with the caveats attached, because misrepresenting financial ML results is both intellectually dishonest and easy to do accidentally.

| Model | Validation accuracy | Test accuracy | Notes |
|---|---:|---:|---|
| Logistic regression baseline | 0.6087 | 0.7091 | Strong baseline on simple normalized features |
| MLP baseline | 0.5494 | 0.5943 | Did not outperform the simpler baseline on this split |
| DeepLOB-style sequence model | 0.8040 (validation during training) | Sequence evaluation workflow in notebook | Best direction for further work |

Three things stand out, and none of them are "the deep model won, ship it."

First, the **logistic baseline is genuinely strong** - 0.7091 test accuracy. This is the single most important number in the project, because it sets the honest bar. Any future claim about a fancier model has to be measured against this, not against a strawman.

Second, the **MLP underperformed the logistic baseline** (0.5494 / 0.5943). That is not a failure to hide; it is information. It tells me that simply adding non-linear capacity on top of the existing flat feature representation does not help, which points the finger at the representation and the way temporal structure is (not) being used.

Third, the **DeepLOB-style model reached 0.8040 validation accuracy during training**, which is the most encouraging signal and the clearest direction for further work - but I am explicit that this is a validation-during-training number with a sequence evaluation workflow still being hardened, not a clean apples-to-apples test figure. I have not let it masquerade as a final result.

These are exploratory notebook results, not production trading claims. The point of the project was never to claim alpha; it was to build a rigorous, interpretable pipeline and to be precise about what the numbers do and do not support.

## What Worked

- **Starting with a strong baseline.** The logistic regression model anchored the entire project. Without it, the DeepLOB number would be a meaningless 0.80 floating in a vacuum. With it, every comparison has a reference point.
- **Treating complexity as something to be earned.** The ladder of logistic to MLP to sequence model made the MLP's underperformance *legible* instead of confusing. The structure of the experiment turned a disappointing model into a useful diagnostic.
- **Building interpretability in, not bolting it on.** Using ablation, saliency, and integrated gradients on the best model meant I could ask whether the model's attention landed on plausible book features rather than just trusting an accuracy number. In a domain this prone to artifacts, that is the difference between a finding and a fluke.
- **Respecting the data's structure.** Convolution over book levels plus temporal modeling matched the actual geometry of an order book, and that is where the most promising signal appeared.

## What Failed

- **The MLP was a dead end on this representation.** More parameters on flat features did not buy generalization - it cost it. Honestly reporting this was more valuable than quietly dropping it.
- **Reproducibility is currently weak.** The dataset is external and not committed, results depend on the current notebook state and split, and there is no fixed environment file or scriptable training entry point. Someone cloning the repo today cannot reproduce my exact numbers in one command. That is a real limitation, not a footnote.
- **Evaluation is not yet fully standardized across models.** The DeepLOB validation number and the baselines' test numbers are not yet reported through one identical evaluation harness, which makes the headline comparison softer than I want it to be.
- **Accuracy is doing too much work as a metric.** Given class imbalance, I should be leaning harder on per-class precision/recall and a confusion-matrix-level view rather than letting accuracy headline the result.

## What I Would Do Next

1. **Make it reproducible.** Add a scriptable training entry point, a pinned environment file, a deterministic seed, and saved result artifacts so the numbers are regenerable from a clean checkout - turning a notebook into an experiment others can trust.
2. **Unify the evaluation harness.** Run every model - baselines and sequence model - through one identical, time-respecting evaluation path so the comparison table is truly apples-to-apples, and report per-class metrics and confusion matrices alongside accuracy.
3. **Stress-test the DeepLOB result.** Confirm the 0.80 holds on a held-out test split under the unified harness, and check it is not an artifact of the particular split or of temporal leakage.
4. **Deepen the interpretability story.** Move from per-prediction attributions to aggregate, dataset-level statements: which book levels and which side of the book carry the most predictive weight, and whether that is economically plausible.
5. **Test robustness across regimes.** Evaluate stability across different market conditions and horizons, since a model that only works in one regime is not really predicting microstructure - it is fitting one.

## Links

- Repository: https://github.com/Praneeth-Suresh/LOBForecasting
- Dataset: Ntakaris et al. (2018), "Benchmark dataset for mid-price forecasting of limit order book data with machine learning methods," *Journal of Forecasting* 37(8): 852-866, via Kaggle.
- Contact: praneeth.suresh.s@gmail.com

