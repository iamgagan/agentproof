// lib/scanner/scoring.ts

import type { CategoryResult, Issue, Grade, CategoryName } from '../types';
import { GRADE_THRESHOLDS } from '../types';

export function calculateScore(
  categories: Record<CategoryName, CategoryResult>
): number {
  const total = Object.values(categories).reduce((sum, cat) => sum + cat.score, 0);
  return Math.min(100, Math.max(0, Math.round(total)));
}

export function generateGrade(score: number): { grade: Grade; label: string } {
  for (const threshold of GRADE_THRESHOLDS) {
    if (score >= threshold.min) {
      return { grade: threshold.grade, label: threshold.label };
    }
  }
  return { grade: 'F', label: 'Invisible to Agents' };
}

export function rankIssues(issues: Issue[]): Issue[] {
  const severityWeight: Record<Issue['severity'], number> = {
    critical: 3,
    warning: 2,
    info: 1,
  };

  return [...issues].sort((a, b) => {
    // First sort by points lost (descending)
    const pointsDiff = b.pointsLost - a.pointsLost;
    if (pointsDiff !== 0) return pointsDiff;
    // Then by severity
    return severityWeight[b.severity] - severityWeight[a.severity];
  });
}

export function createIssue(
  category: CategoryName,
  severity: Issue['severity'],
  title: string,
  description: string,
  impact: string,
  fix: string,
  pointsLost: number
): Issue {
  const id = `${category}_${title.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 40)}`;
  return { id, category, severity, title, description, impact, fix, pointsLost };
}
