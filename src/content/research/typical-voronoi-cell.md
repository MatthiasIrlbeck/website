---
title: On the shape of the typical Poisson-Voronoi cell in high dimensions
authors: [Zakhar Kabluchko, Tobias Müller]
status: Preprint
order: 1
summary: The typical Poisson-Voronoi cell remains far from every ball in high dimensions, although all its vertices lie near a common sphere.
links:
  - label: arXiv
    url: https://arxiv.org/abs/2506.02607
thumbnail: null
media:
  - label: Poisson-Voronoi cell shape
    src: /media/typical-voronoi-cell-web.mp4
    poster: /media/typical-voronoi-cell-poster.webp
    caption: All cells that intersect a fixed ball are shown here.
---
#### Model

A Poisson-Voronoi tessellation assigns each location in $\mathbb{R}^d$ to its nearest site in a homogeneous Poisson point process of intensity $\lambda>0$. To obtain the *typical cell* $V$, add a site at the origin and take its Voronoi cell. This describes the tessellation as seen from a typical site; sampling a location in space would favour larger cells. We study how the shape of this random convex polytope changes as the dimension grows.

#### Main result

Let $r$ and $R$ be the radii of the largest inscribed and smallest enclosing balls, allowing both centres to vary. Write $D$ for the diameter and $\overline{w}$ for the mean width, the distance between parallel supporting hyperplanes averaged uniformly over directions in $S^{d-1}$.

Among other geometric properties, we prove that

<div class="shape-results">

$$
\frac{r}{R}\xrightarrow[d\to\infty]{\mathbb{P}}\frac12,
$$

$$
\frac{D}{R}\xrightarrow[d\to\infty]{\mathbb{P}}2,
$$

$$
\frac{\overline{w}}{R}\xrightarrow[d\to\infty]{\mathbb{P}}2.
$$

</div>

The joint distribution of these ratios is independent of Poisson intensity, so the limits hold for any positive sequence $\lambda=\lambda(d)$.

#### Interpretation

The diameter and mean width are each asymptotic to $2R$, while the largest inscribed ball has only about half the enclosing ball's radius. Uniformly over all vertices, their distances from the origin divided by $R$ tend to one in probability.

Yet the whole cell remains far from spherical: with probability tending to one, its Hausdorff distance from **every** ball is at least a fixed positive fraction of $D$.

The facets also vary greatly in size. For every fixed $\varepsilon>0$, the proportion, by number, of facets with diameter larger than $\varepsilon D$ tends to zero in probability. Nevertheless, with probability tending to one, some facets have diameter at least $cD$ for a fixed $c>0$. The [preprint](https://arxiv.org/abs/2506.02607) develops this picture further for faces of other dimensions.
