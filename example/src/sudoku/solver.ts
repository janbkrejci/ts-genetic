import { GeneticAlgorithm } from 'ts-genetic';
import * as R from 'ramda';
import { Individual, SolverConfig, SudokuBoard, SolverResult, SudokuError } from './types';
import { isValidBoard } from './validator';
import { calculateFitness } from './fitness';
import { createIndividual, crossover, mutate } from './population';

export class SudokuSolver {
  private config: SolverConfig = {
    populationSize: 100,
    mutationRate: 1,
    generationLimit: 1000,
    elitismCount: 3,
  };

  private immutablePositions: boolean[][] = [];

  updateConfig(newConfig: SolverConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  private validateBoard(board: SudokuBoard): void {
    if (!Array.isArray(board) || board.length !== 9) {
      throw new SudokuError('Invalid board: must be a 9x9 array');
    }

    for (let i = 0; i < 9; i++) {
      if (!Array.isArray(board[i]) || board[i].length !== 9) {
        throw new SudokuError(`Invalid row ${i}: must contain exactly 9 numbers`);
      }

      for (let j = 0; j < 9; j++) {
        const cell = board[i][j];
        if (!Number.isInteger(cell) || cell < 0 || cell > 9) {
          throw new SudokuError(`Invalid value at position [${i},${j}]: must be a number between 0 and 9`);
        }
      }
    }

    if (!isValidBoard(board)) {
      throw new SudokuError('Invalid board: contains duplicate numbers in row, column, or 3x3 box');
    }
  }

  private isSolved(board: SudokuBoard): boolean {
    const hasEmptyCells = board.some(row => row.some(cell => cell === 0));
    return !hasEmptyCells && isValidBoard(board);
  }

  async solve(
    initialBoard: SudokuBoard,
    onGenerationComplete?: (generation: number, fitness: number) => void
  ): Promise<SolverResult> {
    try {
      this.validateBoard(initialBoard);

      this.immutablePositions = initialBoard.map(row =>
        row.map(cell => cell !== 0)
      );

      const geneticAlgorithm = new GeneticAlgorithm<number[][]>(
        this.config,
        {
          createIndividual: (length: number) =>
            createIndividual(initialBoard, this.immutablePositions),

          crossover: (parent1: Individual<number[][]>, parent2: Individual<number[][]>) =>
            crossover(parent1, parent2, this.immutablePositions),

          mutate: (individual: Individual<number[][]>, mutationRate: number) =>
            mutate(individual, mutationRate, this.immutablePositions),

          calculateFitness: (individual: Individual<number[][]>) =>
            calculateFitness(individual.genes),

          isTerminationConditionMet: (population: Individual<number[][]>, generation: number) => {
            const bestFitness = Math.max(...population.map(ind => ind.fitness));
            return bestFitness === 1 || generation >= this.config.generationLimit;
          }
        }
      );

      const { population: finalPopulation, generations } = await geneticAlgorithm.evolve(9, onGenerationComplete);

      const bestSolution = R.reduce(
        (a, b) => (a.fitness > b.fitness ? a : b),
        finalPopulation[0],
        finalPopulation
      );

      return {
        board: bestSolution.genes,
        fitness: bestSolution.fitness,
        generations,
        solved: this.isSolved(bestSolution.genes)
      };
    } catch (error) {
      if (error instanceof SudokuError) {
        throw error;
      }
      throw new SudokuError(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  }
}