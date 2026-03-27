import { describe, it, expect } from 'vitest';
import { calculateScore, generateGrade, rankIssues, createIssue } from '@/lib/scanner/scoring';
import type { CategoryResult, Issue } from '@/lib/types';

function makeCategoryResult(score: number, maxScore: number): CategoryResult {
  return { score, maxScore, percentage: (score / maxScore) * 100, issues: [] };
}

describe('calculateScore', () => {
  it('sums all category scores', () => {
    const categories = {
      structuredData: makeCategoryResult(20, 25),
      productQuality: makeCategoryResult(15, 20),
      protocolReadiness: makeCategoryResult(10, 20),
      merchantSignals: makeCategoryResult(10, 15),
      aiDiscoverability: makeCategoryResult(15, 20),
    };
    expect(calculateScore(categories)).toBe(70);
  });

  it('clamps to 0-100 range', () => {
    const zeros = {
      structuredData: makeCategoryResult(0, 25),
      productQuality: makeCategoryResult(0, 20),
      protocolReadiness: makeCategoryResult(0, 20),
      merchantSignals: makeCategoryResult(0, 15),
      aiDiscoverability: makeCategoryResult(0, 20),
    };
    expect(calculateScore(zeros)).toBe(0);
  });

  it('returns perfect score', () => {
    const perfect = {
      structuredData: makeCategoryResult(25, 25),
      productQuality: makeCategoryResult(20, 20),
      protocolReadiness: makeCategoryResult(20, 20),
      merchantSignals: makeCategoryResult(15, 15),
      aiDiscoverability: makeCategoryResult(20, 20),
    };
    expect(calculateScore(perfect)).toBe(100);
  });
});

describe('generateGrade', () => {
  it('returns A for 80+', () => {
    expect(generateGrade(80)).toEqual({ grade: 'A', label: 'Agent-Ready' });
    expect(generateGrade(100)).toEqual({ grade: 'A', label: 'Agent-Ready' });
  });

  it('returns B for 60-79', () => {
    expect(generateGrade(60)).toEqual({ grade: 'B', label: 'Mostly Ready' });
    expect(generateGrade(79)).toEqual({ grade: 'B', label: 'Mostly Ready' });
  });

  it('returns C for 40-59', () => {
    expect(generateGrade(40)).toEqual({ grade: 'C', label: 'Needs Work' });
  });

  it('returns D for 20-39', () => {
    expect(generateGrade(20)).toEqual({ grade: 'D', label: 'Falling Behind' });
  });

  it('returns F for 0-19', () => {
    expect(generateGrade(0)).toEqual({ grade: 'F', label: 'Invisible to Agents' });
    expect(generateGrade(19)).toEqual({ grade: 'F', label: 'Invisible to Agents' });
  });
});

describe('rankIssues', () => {
  it('sorts by pointsLost descending, then severity', () => {
    const issues: Issue[] = [
      createIssue('structuredData', 'info', 'minor', '', '', '', 1),
      createIssue('structuredData', 'critical', 'big', '', '', '', 5),
      createIssue('structuredData', 'warning', 'medium', '', '', '', 3),
    ];
    const ranked = rankIssues(issues);
    expect(ranked[0].title).toBe('big');
    expect(ranked[1].title).toBe('medium');
    expect(ranked[2].title).toBe('minor');
  });

  it('breaks ties by severity', () => {
    const issues: Issue[] = [
      createIssue('structuredData', 'info', 'info-item', '', '', '', 3),
      createIssue('structuredData', 'critical', 'critical-item', '', '', '', 3),
    ];
    const ranked = rankIssues(issues);
    expect(ranked[0].title).toBe('critical-item');
    expect(ranked[1].title).toBe('info-item');
  });
});
