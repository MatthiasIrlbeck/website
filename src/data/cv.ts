type CVEntry = { dates: string; title: string; institution: string; datesNeedReview?: boolean; thesis?: { label: string; url: string | null } };
export const cv: CVEntry[] = [
  { dates: 'October 2026–present', title: 'Postdoctoral researcher', institution: 'University of Hamburg' },
  { dates: '2022–2026', title: 'PhD in Mathematics', institution: 'University of Groningen', thesis: { label: 'PhD thesis', url: null } },
  { dates: 'Dates to confirm', datesNeedReview: true, title: 'Master’s degree in Mathematics', institution: 'LMU Munich', thesis: { label: 'Master’s thesis', url: null } },
  { dates: 'Dates to confirm', datesNeedReview: true, title: 'Bachelor’s degree in Mathematics', institution: 'LMU Munich' },
];
