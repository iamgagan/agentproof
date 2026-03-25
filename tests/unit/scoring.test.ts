// tests/unit/scoring.test.ts
import { describe, it, expect } from 'vitest';
import { calculateScore, generateGrade, rankIssues } from '@/lib/scanner/scoring';
import type { CategoryResult, Issue } from '@/lib/types';

const makeCategory = (score: number, maxScore: number): CategoryResult => ({
  score, maxScore, percentage: Math.round((score / maxScore) * 100), issues: [],
});

describe('calculateScore', () => {
  it('sums scores across all categories', () => {
    const cats = {
      structuredData: makeCategory(20, 25),
      productQuality: makeCategory(15, 20),
      protocolReadiness: makeCategory(10, 20),
      merchantSignals: makeCategory(8, 15),
      aiDiscoverability: makeCategory(16, 20),
    };
    expect(calculateScore(cats)).toBe(69);
  });

  it('clamps total score at 100 when sum exceeds 100', () => {
    // calculateScore sums cat.score values then clamps the total.
    // It does NOT clamp individual categories.
    // Total here = 25+20+20+15+25 = 105, clamped to 100.
    const cats = {
      structuredData: makeCategory(25, 25),
      productQuality: makeCategory(20, 20),
      protocolReadiness: makeCategory(20, 20),
      merchantSignals: makeCategory(15, 15),
      aiDiscoverability: makeCategory(25, 20),
    };
    expect(calculateScore(cats)).toBe(100);
  });

  it('returns 0 for all zero scores', () => {
    const cats = {
      structuredData: makeCategory(0, 25),
      productQuality: makeCategory(0, 20),
      protocolReadiness: makeCategory(0, 20),
      merchantSignals: makeCategory(0, 15),
      aiDiscoverability: makeCategory(0, 20),
    };
    expect(calculateScore(cats)).toBe(0);
  });
});

describe('generateGrade', () => {
  it.each([
    [100, 'A'], [80, 'A'], [79, 'B'], [60, 'B'],
    [59, 'C'], [40, 'C'], [39, 'D'], [20, 'D'],
    [19, 'F'], [0, 'F'],
  ])('score %i → grade %s', (score, expected) => {
    expect(generateGrade(score).grade).toBe(expected);
  });
});

describe('rankIssues', () => {
  it('sorts by pointsLost descending', () => {
    const issues: Issue[] = [
      { id: 'a', category: 'structuredData', severity: 'info', title: 'A', description: '', impact: '', fix: '', pointsLost: 2 },
      { id: 'b', category: 'structuredData', severity: 'critical', title: 'B', description: '', impact: '', fix: '', pointsLost: 8 },
      { id: 'c', category: 'structuredData', severity: 'warning', title: 'C', description: '', impact: '', fix: '', pointsLost: 4 },
    ];
    const ranked = rankIssues(issues);
    expect(ranked.map(i => i.id)).toEqual(['b', 'c', 'a']);
  });

  it('breaks ties by severity', () => {
    const issues: Issue[] = [
      { id: 'warn', category: 'structuredData', severity: 'warning', title: '', description: '', impact: '', fix: '', pointsLost: 4 },
      { id: 'crit', category: 'structuredData', severity: 'critical', title: '', description: '', impact: '', fix: '', pointsLost: 4 },
    ];
    const ranked = rankIssues(issues);
    expect(ranked[0].id).toBe('crit');
  });

  it('does not mutate the input array', () => {
    const issues: Issue[] = [
      { id: 'a', category: 'structuredData', severity: 'info', title: '', description: '', impact: '', fix: '', pointsLost: 1 },
      { id: 'b', category: 'structuredData', severity: 'critical', title: '', description: '', impact: '', fix: '', pointsLost: 8 },
    ];
    const original = [...issues];
    rankIssues(issues);
    expect(issues).toEqual(original);
  });
});
