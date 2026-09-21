/**
 * Reading Time Calculation Utility for AAWAZ: The Socio-Legal Blog
 * 
 * Standard formula for calculating reading duration:
 * - Average adult reading speed for scholarly/legal and analytical prose: 200 words per minute (WPM).
 * - Accurately strips Markdown tokens, HTML tags, and punctuation before counting words.
 */

export interface ReadingTimeInfo {
  /** The estimated minutes needed to read the text (rounded up, minimum 1) */
  minutes: number;
  /** Total word count of the article content */
  words: number;
  /** Display label, e.g. "4 min read" */
  text: string;
  /** Verbose phrasing, e.g. "4 minutes to read" */
  minutesToReadText: string;
  /** Compact representation, e.g. "4 min" */
  compactText: string;
  /** Detailed string with word count, e.g. "4 min read (~780 words)" */
  detailedText: string;
}

/**
 * Calculates estimated reading time and word count for given article text.
 * Falls back gracefully to any pre-existing string or minimum 1 min if content is absent.
 */
export function calculateReadingTime(content?: string, fallbackString?: string): ReadingTimeInfo {
  const raw = (content || '').trim();

  if (!raw) {
    let fallbackMinutes = 1;
    if (fallbackString) {
      const match = fallbackString.match(/\d+/);
      if (match) {
        const parsed = parseInt(match[0], 10);
        if (!isNaN(parsed) && parsed > 0) {
          fallbackMinutes = parsed;
        }
      }
    }
    return {
      minutes: fallbackMinutes,
      words: fallbackMinutes * 200,
      text: `${fallbackMinutes} min read`,
      minutesToReadText: `${fallbackMinutes} ${fallbackMinutes === 1 ? 'minute' : 'minutes'} to read`,
      compactText: `${fallbackMinutes} min`,
      detailedText: `${fallbackMinutes} min read`
    };
  }

  // Strip Markdown syntax and HTML tags to get clean prose
  const clean = raw
    .replace(/```[\s\S]*?```/g, ' ') // code blocks
    .replace(/`[^`]*`/g, ' ') // inline code
    .replace(/!\[.*?\]\(.*?\)/g, ' ') // images
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // links: keep display text only
    .replace(/<[^>]*>/g, ' ') // html tags
    .replace(/^[#>*\-+]\s+/gm, ' ') // headers, blockquotes, bullets
    .replace(/^\d+\.\s+/gm, ' ') // numbered lists
    .replace(/[*_~`]/g, ' ') // emphasis markers
    .replace(/&[a-z]+;/gi, ' '); // html entities

  // Split on whitespace to get word tokens
  const words = clean.split(/\s+/).filter(word => word.length > 0).length;

  // 200 words per minute (WPM) standard for analytical & legal literature
  const WORDS_PER_MINUTE = 200;
  const minutes = Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));

  return {
    minutes,
    words,
    text: `${minutes} min read`,
    minutesToReadText: `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} to read`,
    compactText: `${minutes} min`,
    detailedText: `${minutes} min read (${words.toLocaleString()} words)`
  };
}

/**
 * Convenience helper to directly retrieve the standard "X min read" display string.
 */
export function getMinutesToRead(content?: string, fallbackString?: string): string {
  return calculateReadingTime(content, fallbackString).text;
}
