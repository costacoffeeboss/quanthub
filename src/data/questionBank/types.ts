export type Category =
  | 'Probability'
  | 'Expected value'
  | 'Combinatorics'
  | 'Mental math'
  | 'Logic'
  | 'Market making'
  | 'Statistics'
  | 'Options & finance';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Question {
  id: string;
  title: string;
  category: Category;
  /** Finer grouping within the category, used for sub-navigation. */
  topic: string;
  difficulty: Difficulty;
  style?: string;
  /**
   * Firms at which variants of this question are widely reported (interview-prep
   * forums, books). Folklore, not a guarantee — treat as a style guide.
   */
  firms?: string[];
  prompt: string;
  /** One-line final answer for quick reveal and mock-interview grading. */
  answer: string;
  /** Full worked solution, paragraph per entry. */
  solution: string[];
}
