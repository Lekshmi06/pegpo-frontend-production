/**
 * Academic Citation & Bibliography Utilities
 * Supports APA 7th, IEEE, MLA 9th, Harvard, Chicago (Author-Date), BibTeX, and RIS formats.
 */

export type CitationStyle = 'APA' | 'IEEE' | 'MLA' | 'Harvard' | 'Chicago' | 'BibTeX' | 'RIS';

export interface CitationPaperInput {
  id?: string;
  _id?: string;
  title: string;
  authors?: string[];
  year?: number | string;
  venue?: string;
  doi?: string;
  arxivId?: string;
  externalUrl?: string;
  volume?: string | number;
  issue?: string | number;
  pages?: string;
}

export interface FormattedCitations {
  apa: string;
  ieee: string;
  mla: string;
  harvard: string;
  chicago: string;
  bibtex: string;
  ris: string;
  inTextNarrative: string;
  inTextParenthetical: string;
  inTextNumber: string;
  latexCite: string;
  citationKey: string;
}

/**
 * Parse an author string into surname and given initials/names
 */
function parseAuthorName(raw: string): { surname: string; given: string; initials: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { surname: 'Unknown', given: '', initials: '' };

  if (trimmed.includes(',')) {
    const parts = trimmed.split(',').map((p) => p.trim());
    const surname = parts[0] || 'Unknown';
    const given = parts[1] || '';
    const initials = given
      .split(/\s+/)
      .map((g) => (g ? `${g[0].toUpperCase()}.` : ''))
      .join(' ');
    return { surname, given, initials };
  }

  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return { surname: parts[0], given: '', initials: '' };
  }

  const surname = parts[parts.length - 1];
  const givenParts = parts.slice(0, -1);
  const given = givenParts.join(' ');
  const initials = givenParts
    .map((g) => (g ? `${g[0].toUpperCase()}.` : ''))
    .join(' ');

  return { surname, given, initials };
}

/**
 * Generate a unique clean BibTeX citation key (e.g. daugman2022nir)
 */
export function generateCitationKey(paper: CitationPaperInput): string {
  const firstAuthor = paper.authors && paper.authors.length > 0 ? paper.authors[0] : 'author';
  const { surname } = parseAuthorName(firstAuthor);
  const cleanSurname = surname.toLowerCase().replace(/[^a-z0-9]/g, '');

  const yearStr = paper.year ? String(paper.year) : 'nd';

  const cleanTitle = (paper.title || 'study')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => !['a', 'an', 'the', 'of', 'in', 'on', 'at', 'to', 'for', 'with'].includes(w))[0] || 'paper';

  return `${cleanSurname || 'ref'}${yearStr}${cleanTitle}`.slice(0, 32);
}

/**
 * Format authors in APA 7th style:
 * 1 author: Vance, E.
 * 2 authors: Vance, E., & Smith, J.
 * 3-20 authors: Vance, E., Smith, J., & Doe, A.
 */
function formatApaAuthors(authors: string[]): string {
  if (!authors || authors.length === 0) return 'Anonymous';
  const parsed = authors.map(parseAuthorName);

  if (parsed.length === 1) {
    return `${parsed[0].surname}, ${parsed[0].initials || parsed[0].given}`.trim();
  }
  if (parsed.length === 2) {
    const a1 = `${parsed[0].surname}, ${parsed[0].initials || parsed[0].given}`.trim();
    const a2 = `${parsed[1].surname}, ${parsed[1].initials || parsed[1].given}`.trim();
    return `${a1}, & ${a2}`;
  }

  const formatted = parsed.map((p) => `${p.surname}, ${p.initials || p.given}`.trim());
  if (formatted.length <= 7) {
    const allExceptLast = formatted.slice(0, -1).join(', ');
    return `${allExceptLast}, & ${formatted[formatted.length - 1]}`;
  }
  return `${formatted.slice(0, 6).join(', ')}, ... ${formatted[formatted.length - 1]}`;
}

/**
 * Format authors in IEEE style:
 * J. Daugman and Z. Sun
 */
function formatIeeeAuthors(authors: string[]): string {
  if (!authors || authors.length === 0) return 'Anon.';
  const parsed = authors.map(parseAuthorName);

  const formatted = parsed.map((p) => {
    const init = p.initials || p.given;
    return init ? `${init} ${p.surname}` : p.surname;
  });

  if (formatted.length === 1) return formatted[0];
  if (formatted.length === 2) return `${formatted[0]} and ${formatted[1]}`;
  if (formatted.length <= 6) {
    return `${formatted.slice(0, -1).join(', ')}, and ${formatted[formatted.length - 1]}`;
  }
  return `${formatted[0]} et al.`;
}

/**
 * Format authors in MLA 9th style:
 * Vance, Eleanor, and John Smith.
 */
function formatMlaAuthors(authors: string[]): string {
  if (!authors || authors.length === 0) return 'Anonymous';
  const parsed = authors.map(parseAuthorName);

  if (parsed.length === 1) {
    return `${parsed[0].surname}, ${parsed[0].given || parsed[0].initials}`.trim();
  }
  if (parsed.length === 2) {
    const a1 = `${parsed[0].surname}, ${parsed[0].given || parsed[0].initials}`.trim();
    const a2 = `${parsed[1].given || parsed[1].initials} ${parsed[1].surname}`.trim();
    return `${a1}, and ${a2}`;
  }
  return `${parsed[0].surname}, ${parsed[0].given || parsed[0].initials}, et al.`.trim();
}

/**
 * Format single paper citations across all styles
 */
export function formatCitation(paper: CitationPaperInput, index: number = 1): FormattedCitations {
  const authors = paper.authors && paper.authors.length > 0 ? paper.authors : ['Anonymous'];
  const title = (paper.title || 'Untitled Paper').trim();
  const year = paper.year ? String(paper.year) : 'n.d.';
  const venue = (paper.venue || 'Academic Publication').trim();
  const doi = paper.doi ? paper.doi.trim().replace(/^https?:\/\/doi\.org\//i, '') : '';
  const key = generateCitationKey(paper);

  // In-Text Narrative & Parenthetical
  const parsedAuthors = authors.map(parseAuthorName);
  let inTextNarrative = '';
  let inTextParenthetical = '';

  if (parsedAuthors.length === 1) {
    inTextNarrative = `${parsedAuthors[0].surname} (${year})`;
    inTextParenthetical = `(${parsedAuthors[0].surname}, ${year})`;
  } else if (parsedAuthors.length === 2) {
    inTextNarrative = `${parsedAuthors[0].surname} & ${parsedAuthors[1].surname} (${year})`;
    inTextParenthetical = `(${parsedAuthors[0].surname} & ${parsedAuthors[1].surname}, ${year})`;
  } else {
    inTextNarrative = `${parsedAuthors[0].surname} et al. (${year})`;
    inTextParenthetical = `(${parsedAuthors[0].surname} et al., ${year})`;
  }

  const inTextNumber = `[${index}]`;
  const latexCite = `\\cite{${key}}`;

  // APA 7th: Author, A. (Year). Title. Venue. https://doi.org/xxx
  const apaAuthors = formatApaAuthors(authors);
  let apa = `${apaAuthors} (${year}). ${title}. ${venue}.`;
  if (doi) apa += ` https://doi.org/${doi}`;

  // IEEE: [1] J. Author and S. Author, "Title," Venue, Year.
  const ieeeAuthors = formatIeeeAuthors(authors);
  let ieee = `[${index}] ${ieeeAuthors}, "${title}," ${venue}, ${year}.`;
  if (doi) ieee += ` doi: ${doi}.`;

  // MLA 9th: Author, A., and B. Author. "Title." Venue, Year.
  const mlaAuthors = formatMlaAuthors(authors);
  let mla = `${mlaAuthors}. "${title}." ${venue}, ${year}.`;
  if (doi) mla += ` https://doi.org/${doi}.`;

  // Harvard: Author, A. and Author, B. (Year) 'Title', Venue.
  const harvardAuthors = authors
    .map(parseAuthorName)
    .map((p) => `${p.surname}, ${p.initials || p.given}`)
    .join(' and ');
  let harvard = `${harvardAuthors} (${year}) '${title}', ${venue}.`;
  if (doi) harvard += ` Available at: https://doi.org/${doi}`;

  // Chicago Author-Date: Author, First, and First Author. Year. "Title." Venue.
  let chicago = `${mlaAuthors} ${year}. "${title}." ${venue}.`;
  if (doi) chicago += ` https://doi.org/${doi}.`;

  // BibTeX
  const bibAuthors = authors
    .map(parseAuthorName)
    .map((p) => `${p.surname}, ${p.given || p.initials}`)
    .join(' and ');
  const bibtex = `@article{${key},
  author    = {${bibAuthors}},
  title     = {${title}},
  journal   = {${venue}},
  year      = {${year}}${doi ? `,\n  doi       = {${doi}}` : ''}${
    paper.arxivId ? `,\n  eprint    = {${paper.arxivId}}` : ''
  }
}`;

  // RIS format for Zotero / Mendeley / EndNote
  const risAuthors = authors
    .map(parseAuthorName)
    .map((p) => `AU  - ${p.surname}, ${p.given || p.initials}`)
    .join('\n');
  const ris = `TY  - JOUR
TI  - ${title}
${risAuthors}
PY  - ${year}
JO  - ${venue}${doi ? `\nDO  - ${doi}` : ''}${
    paper.externalUrl ? `\nUR  - ${paper.externalUrl}` : ''
  }
ER  - `;

  return {
    apa,
    ieee,
    mla,
    harvard,
    chicago,
    bibtex,
    ris,
    inTextNarrative,
    inTextParenthetical,
    inTextNumber,
    latexCite,
    citationKey: key,
  };
}

/**
 * Format an entire bibliography across all styles
 */
export function formatBibliography(
  papers: CitationPaperInput[],
  style: CitationStyle = 'APA'
): string {
  if (!papers || papers.length === 0) return '';

  if (style === 'BibTeX') {
    return papers.map((p, idx) => formatCitation(p, idx + 1).bibtex).join('\n\n');
  }

  if (style === 'RIS') {
    return papers.map((p, idx) => formatCitation(p, idx + 1).ris).join('\n\n');
  }

  // Sorted list for APA / MLA / Harvard / Chicago (Alphabetical by first author surname)
  const sorted = [...papers].sort((a, b) => {
    const sA = parseAuthorName(a.authors?.[0] || '').surname.toLowerCase();
    const sB = parseAuthorName(b.authors?.[0] || '').surname.toLowerCase();
    return sA.localeCompare(sB);
  });

  if (style === 'IEEE') {
    // IEEE is ordered by appearance (1, 2, 3...)
    return papers.map((p, idx) => formatCitation(p, idx + 1).ieee).join('\n\n');
  }

  if (style === 'MLA') {
    return sorted.map((p, idx) => formatCitation(p, idx + 1).mla).join('\n\n');
  }

  if (style === 'Harvard') {
    return sorted.map((p, idx) => formatCitation(p, idx + 1).harvard).join('\n\n');
  }

  if (style === 'Chicago') {
    return sorted.map((p, idx) => formatCitation(p, idx + 1).chicago).join('\n\n');
  }

  // Default APA
  return sorted.map((p, idx) => formatCitation(p, idx + 1).apa).join('\n\n');
}

/**
 * Trigger file download in browser
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
