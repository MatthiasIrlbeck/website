---
title: Non-vanishing uniqueness threshold for hyperbolic Poisson-Voronoi percolation in dimension at least three
authors: [Tobias Müller]
status: Preprint
order: 3
summary: A unique unbounded cluster requires a black-cell probability bounded away from zero, uniformly over the density of sites in hyperbolic space.
needsReview: true
links:
  - label: arXiv
    url: https://arxiv.org/abs/2607.17764
thumbnail: null
media:
  - label: Hyperbolic Poisson-Voronoi tessellation
    src: /media/hyperbolic-poisson-voronoi-web.mp4
    poster: /media/hyperbolic-poisson-voronoi-poster.webp
    caption: One finite cluster of black cells in the Poincaré half-space model
---
#### Model

Start with a homogeneous Poisson point process of intensity $\lambda>0$ with respect to hyperbolic volume in $\mathbb{H}^d$. Assign each location to its nearest site, and colour each resulting Voronoi cell black independently with probability $p$. Points belong to the same black cluster when a continuous path through black cells joins them.

Unlike in Euclidean space, infinitely many unbounded black clusters can coexist. We study the uniqueness threshold $p_u(\lambda)$: the infimum of $p$ for which exactly one unbounded black cluster exists with positive probability, equivalently almost surely in this model.

#### Main result

For every fixed dimension $d\geq3$, we prove

$$
\begin{gathered}
p_u(\lambda)\geq c_d>0\\[4pt]
\text{for every }\lambda>0.
\end{gathered}
$$

The constant depends only on the dimension. Thus a sufficiently small black-cell probability cannot produce a unique unbounded cluster, however sparse the tessellation becomes. This answers a question of [Grebík and Recke](https://arxiv.org/abs/2504.02435).

#### Interpretation

The ambient geometry makes a decisive difference. [D’Achille, Grebík, Khezeli, Recke and Wilkens](https://arxiv.org/abs/2511.23317) show that the uniqueness threshold tends to zero as the site intensity tends to zero on the Riemannian product $\mathbb{H}^2\times\mathbb{H}^2$. Our result rules out this behaviour in $\mathbb{H}^d$ for $d\geq3$.

The [proof](https://arxiv.org/abs/2607.17764) bounds the probability that two distant points belong to the same black cluster. At low intensities, it extracts reduced paths from black-cell connections and bounds their expected counts for paths first reaching a distant region. The comparison uses paths with no guaranteed edge between nonconsecutive vertices in an auxiliary model whose edge choices are independent once point locations are fixed. A separate estimate handles larger intensities. Together these estimates rule out uniqueness at small $p$.
