export type SudokuBoard = number[][];

export interface SudokuIndividual {
  genes: SudokuBoard;
  fitness: number;
}

export interface SolverConfig {
  populationSize: number;
  mutationRate: number;
  generationLimit: number;
  elitismCount: number;
}

export interface SolverResult {
  board: SudokuBoard;
  fitness: number;
  generations: number;
  solved: boolean;
}

export class SudokuError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SudokuError';
  }
}