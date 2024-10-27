import * as R from 'ramda';
import { SudokuBoard, SudokuIndividual } from './types';
import { calculateFitness } from './fitness';

function getValidDigits(board: SudokuBoard, row: number, col: number): number[] {
  const used = new Set<number>();

  // Check row
  board[row].forEach(n => used.add(n));

  // Check column
  for (let i = 0; i < 9; i++) {
    used.add(board[i][col]);
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      used.add(board[boxRow + i][boxCol + j]);
    }
  }

  return R.range(1, 10).filter(n => !used.has(n));
}

function fillValidDigits(board: SudokuBoard, immutablePositions: boolean[][]): void {
  let filled;
  do {
    filled = false;
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (!immutablePositions[row][col] && board[row][col] === 0) {
          const validDigits = getValidDigits(board, row, col);
          if (validDigits.length === 1) {
            board[row][col] = validDigits[0];
            filled = true;
          } else if (validDigits.length > 0) {
            const randomDigit = validDigits[Math.floor(Math.random() * validDigits.length)];
            if (Math.random() < 0.5) { // 50% chance to fill a cell
              board[row][col] = randomDigit;
              filled = true;
            }
          }
        }
      }
    }
  } while (filled);
}

export function createIndividual(
  board: SudokuBoard,
  immutablePositions: boolean[][]
): SudokuIndividual {
  const genes = R.clone(board);
  fillValidDigits(genes, immutablePositions);

  return {
    genes,
    fitness: calculateFitness(genes),
  };
}

export function selectParent(population: SudokuIndividual[]): SudokuIndividual {
  const totalFitness = R.sum(population.map(ind => ind.fitness));
  let random = Math.random() * totalFitness;

  for (const individual of population) {
    random -= individual.fitness;
    if (random <= 0) return individual;
  }

  return population[population.length - 1];
}

export function crossover(
  parent1: SudokuIndividual,
  _parent2: SudokuIndividual,
  _immutablePositions: boolean[][]
): SudokuIndividual {
  return R.clone(parent1);
}

export function mutate(
  individual: SudokuIndividual,
  mutationRate: number,
  immutablePositions: boolean[][]
): SudokuIndividual {
  if (Math.random() >= mutationRate) {
    return individual;
  }

  const genes = R.clone(individual.genes);

  // Clear some random mutable cells
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (!immutablePositions[row][col] && Math.random() < 0.2) {
        genes[row][col] = 0;
      }
    }
  }

  // Try to fill cleared cells with valid digits
  fillValidDigits(genes, immutablePositions);

  return {
    genes,
    fitness: calculateFitness(genes),
  };
}