/**
 * NLP & Text Mining Engine for OmniData Analytics Suite
 * Performs Tokenization, Stopwords Filtering, Sentiment Scoring, and Keyword Frequency.
 */

class NLPEngine {
  static STOPWORDS = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with',
    'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if',
    'about', 'who', 'get', 'which', 'go', 'me', 'was', 'were', 'been', 'has', 'had', 'is', 'are', 'am'
  ]);

  static POSITIVE_WORDS = new Set([
    'outstanding', 'satisfied', 'great', 'fast', 'loved', 'seamless', 'intuitive', 'recommended',
    'fantastic', 'professionalism', 'good', 'easy', 'responsive', 'awesome', 'excellent', 'best', 'happy'
  ]);

  static NEGATIVE_WORDS = new Set([
    'terrible', 'damaged', 'unresponsive', 'rude', 'disappointed', 'crashes', 'missing', 'broken',
    'worst', 'waste', 'horrible', 'bad', 'slow', 'hate', 'refund', 'buggy', 'poor'
  ]);

  /**
   * Analyze text data array
   */
  static analyzeTextData(data, textColumn = 'Review_Text') {
    const texts = data.map(r => r[textColumn]).filter(t => typeof t === 'string' && t.trim().length > 0);
    if (texts.length === 0) return null;

    const wordCounts = {};
    let posCount = 0, neuCount = 0, negCount = 0;

    texts.forEach(text => {
      const tokens = text.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 2 && !this.STOPWORDS.has(w));

      let posScore = 0, negScore = 0;

      tokens.forEach(w => {
        wordCounts[w] = (wordCounts[w] || 0) + 1;
        if (this.POSITIVE_WORDS.has(w)) posScore++;
        if (this.NEGATIVE_WORDS.has(w)) negScore++;
      });

      if (posScore > negScore) posCount++;
      else if (negScore > posScore) negCount++;
      else neuCount++;
    });

    const topKeywords = Object.keys(wordCounts)
      .map(w => ({ word: w, count: wordCounts[w] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    return {
      totalTexts: texts.length,
      topKeywords,
      sentimentBreakdown: {
        Positive: posCount,
        Neutral: neuCount,
        Negative: negCount
      }
    };
  }
}
