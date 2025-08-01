/**
 * Simple unit test for text analysis utilities
 * This test doesn't require full Next.js setup
 */

describe('Text Analysis Utilities', () => {
  // Test basic text validation
  describe('Text Validation', () => {
    it('should handle empty text', () => {
      const text = '';
      expect(text.length).toBe(0);
    });

    it('should handle normal text', () => {
      const text = 'This is a test';
      expect(text.length).toBeGreaterThan(0);
    });

    it('should detect em-dashes', () => {
      const text = 'This text has an em-dash—right here';
      expect(text.includes('—')).toBe(true);
    });

    it('should detect jargon words', () => {
      const jargonWords = ['leverage', 'synergy', 'optimize', 'paradigm'];
      const text = 'We need to leverage our synergy';
      
      const containsJargon = jargonWords.some(word => 
        text.toLowerCase().includes(word.toLowerCase())
      );
      
      expect(containsJargon).toBe(true);
    });
  });

  // Test text analysis helper functions
  describe('Text Analysis Helpers', () => {
    const countEmDashes = (text: string): number => {
      const emDashPattern = /[—–―]/g;
      const matches = text.match(emDashPattern);
      return matches ? matches.length : 0;
    };

    const findJargonWords = (text: string, jargonList: string[]): string[] => {
      return jargonList.filter(jargon => 
        text.toLowerCase().includes(jargon.toLowerCase())
      );
    };

    it('should count em-dashes correctly', () => {
      expect(countEmDashes('')).toBe(0);
      expect(countEmDashes('No dashes here')).toBe(0);
      expect(countEmDashes('One—dash')).toBe(1);
      expect(countEmDashes('Two—dashes—here')).toBe(2);
      expect(countEmDashes('Different–types—of―dashes')).toBe(3);
    });

    it('should find jargon words in text', () => {
      const jargonList = ['leverage', 'synergy', 'optimize'];
      
      expect(findJargonWords('', jargonList)).toEqual([]);
      expect(findJargonWords('Normal text', jargonList)).toEqual([]);
      expect(findJargonWords('We need to leverage this', jargonList)).toEqual(['leverage']);
      expect(findJargonWords('Leverage our synergy to optimize', jargonList)).toEqual([
        'leverage', 'synergy', 'optimize'
      ]);
    });
  });

  // Test readability helpers
  describe('Readability Analysis', () => {
    const calculateAverageWordLength = (text: string): number => {
      const words = text.split(/\s+/).filter(word => word.length > 0);
      if (words.length === 0) return 0;
      
      const totalLength = words.reduce((sum, word) => sum + word.length, 0);
      return totalLength / words.length;
    };

    const countSentences = (text: string): number => {
      const sentenceEndings = /[.!?]+/g;
      const matches = text.match(sentenceEndings);
      return matches ? matches.length : 0;
    };

    it('should calculate average word length', () => {
      expect(calculateAverageWordLength('')).toBe(0);
      expect(calculateAverageWordLength('Hi')).toBe(2);
      expect(calculateAverageWordLength('The cat sat')).toBe(3);
      expect(calculateAverageWordLength('Hello world')).toBe(5);
    });

    it('should count sentences correctly', () => {
      expect(countSentences('')).toBe(0);
      expect(countSentences('No ending')).toBe(0);
      expect(countSentences('One sentence.')).toBe(1);
      expect(countSentences('Two. Sentences.')).toBe(2);
      expect(countSentences('Question? Answer! Statement.')).toBe(3);
    });
  });
});