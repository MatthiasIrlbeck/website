type CVEntry = { dates: string; title: string; institution: string; datesNeedReview?: boolean; thesis?: { label: string; title?: string; url: string | null; supervisor?: string } };
export const cv: CVEntry[] = [
  { dates: 'October 2026–present', title: 'Postdoctoral researcher', institution: 'University of Hamburg' },
  { dates: '2022–2026', title: 'PhD in Mathematics', institution: 'University of Groningen', thesis: { label: 'PhD thesis', title: 'High-Dimensional Poisson–Voronoi Geometry and Threshold Phenomena', url: '/documents/PhD_thesis_matthias_irlbeck.pdf', supervisor: 'Tobias Müller' } },
  { dates: '2019–2021', title: 'Master’s degree in (Financial) Mathematics', institution: 'LMU Munich', thesis: { label: 'Master’s thesis', title: 'Intrinsic Arm Exponents in High-Dimensional Percolation', url: '/documents/Master thesis Matthias Irlbeck.pdf', supervisor: 'Markus Heydenreich' } },
  { dates: '2016–2019', title: 'Bachelor’s degree in (Financial) Mathematics', institution: 'LMU Munich' },
];
