---
title: Poisson-Voronoi percolation in high dimensions
authors: [Zakhar Kabluchko, Tobias Müller]
status: arXiv expected soon
order: 4
summary: We determine the percolation threshold in high dimensions, confirming the branching-process prediction based on the mean number of neighbouring cells.
links:
  - label: PhD thesis
    url: /documents/PhD_thesis_matthias_irlbeck.pdf
    statusPrefix: ", complete argument is part of my "
thumbnail: null
media:
  - label: Voronoi percolation cluster
    src: /media/vor_perc_clust-web.mp4
    poster: /media/vor_perc_clust-poster.jpg
    caption: 'One finite cluster of black cells for $d=3$.'
---
#### Model

Start with a homogeneous Poisson point process of intensity $\lambda>0$ in $\mathbb{R}^d$ and assign each location to its nearest site. Colour the resulting Voronoi cells black independently with probability $p$. Cells sharing a facet are neighbours; connected black cells form clusters.

We study the critical probability $p_c(d)$, the infimum of $p$ for which an unbounded black cluster exists with positive probability. Rescaling space preserves cell adjacencies, so the threshold depends on the dimension but not on the Poisson intensity.

#### Main result

As $d\to\infty$, we determine its precise asymptotic behaviour:

$$
p_c(d)=\frac{e}{d\,2^d}\bigl(1+o(1)\bigr).
$$

Writing $m_d$ for the expected number of neighbours of a typical cell, sampled by its site, we also prove

$$
\begin{gathered}
m_d=\frac{d\,2^d}{e}\bigl(1+o(1)\bigr),\\[4pt]
p_c(d)\,m_d\longrightarrow1.
\end{gathered}
$$

Thus the critical black fraction is asymptotically the reciprocal of the mean number of neighbouring cells.

#### Interpretation

Exploring a black cluster means repeatedly discovering new black neighbours. A branching-process approximation treats those discoveries as independent and predicts survival when their mean exceeds one, suggesting the threshold $p\,m_d\approx1$.

For every fixed $\varepsilon\in(0,1)$ and all sufficiently large $d$, there is almost surely no unbounded black cluster at $p=(1-\varepsilon)/m_d$, whereas an unbounded cluster exists with positive probability at $p=(1+\varepsilon)/m_d$.

Making this prediction rigorous requires handling unbounded random degrees and spatial dependencies. For the upper bound, we explore only selected connections, couple these finite explorations to branching random walks, and join them through comparison with site percolation on $\mathbb{Z}^2$. For the lower bound, we count paths in a more generous adjacency model that includes every actual Voronoi connection. The complete proof appears in Chapter 3 of my [PhD thesis](/documents/PhD_thesis_matthias_irlbeck.pdf#page=12).
