---
title: Thresholds for colouring the random Borsuk graph
authors: [Álvaro Acitores Montero, Tobias Müller, Matěj Stehlík]
status: Preprint
order: 2
summary: We locate colouring transitions in random graphs with nearly antipodal edges and relate the sharp two-colour threshold to continuum percolation.
needsReview: true
links:
  - label: arXiv
    url: https://arxiv.org/abs/2603.05467
thumbnail: null
media:
  - label: Random Borsuk graph
    src: /media/borsuk-animation-web.mp4
    poster: /media/borsuk-animation-poster.webp
    caption: 'Example for a random Borsuk graph with $n=32$ on $S^2$ and chromatic number $3$.'
---
#### Model

Choose $n$ independent uniform points on the unit sphere $S^d$ in $\mathbb{R}^{d+1}$. For a small positive parameter $\alpha=\alpha(n)$, join two points when their angular distance exceeds $\pi-\alpha$, so edges connect nearly antipodal points. Increasing $\alpha$ adds edges and makes proper colouring harder: adjacent vertices must receive different colours. For fixed $d\geq2$, we study when $k$ colours cease to suffice as $n$ tends to infinity.

#### Main result

For every $2\leq k\leq d$, we locate the loss of $k$-colourability between positive constant multiples of $n^{-1/d}$, where the expected degree is of constant order. The later transition to requiring $d+2$ colours occurs at order $(\log n/n)^{1/d}$, where the expected degree is logarithmic, as previously shown by [Kahle and Martinez-Figueroa](https://arxiv.org/abs/1901.08488).

For two colours, we identify the sharp threshold

$$
\alpha_2(n)=c_2(d)\,n^{-1/d}.
$$

Below this threshold by any fixed positive proportion, the graph is two-colourable with probability tending to one. Above it by any fixed positive proportion, it contains an odd cycle with probability tending to one.

For $3\leq k\leq d+1$, we construct threshold sequences $\alpha_k(n)$ and a common density-one set of sample sizes. For every fixed positive relative margin, $k$ colours suffice below the threshold and fail above it with probability tending to one as $n$ grows within this set. The proportion of excluded sizes tends to zero.

#### Interpretation

The constant comes from continuum AB percolation: two independent Poisson point clouds in $\mathbb{R}^d$, each of intensity $\lambda$, with edges between opposite types at Euclidean distance at most one. If $\lambda_{\mathrm{AB}}(d)$ is its critical intensity and $\sigma_d$ is the surface area of $S^d$, then

$$
c_2(d)=\bigl(\sigma_d\,\lambda_{\mathrm{AB}}(d)\bigr)^{1/d}.
$$

Applying the antipodal map $x\mapsto-x$ to the points in one of two small antipodal caps and rescaling gives a local approximation by this model. The [proof](https://arxiv.org/abs/2603.05467) joins local connections above its percolation threshold to create a global odd cycle on the sphere, the obstruction to two-colouring.
