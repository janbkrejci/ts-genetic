import * as R from 'ramda';
import { SudokuBoard } from './types';

function countUniqueDigits(group: number[]): number {
  const nonZeroDigits = group.filter(n => n !== 0);
  const uniqueDigits = new Set(nonZeroDigits);
  return uniqueDigits.size;
}

function isGroupComplete(group: number[]): boolean {
  const digits = new Set(group);
  return digits.size === 9 && !digits.has(0);
}

export function calculateFitness(board: SudokuBoard): number {
  let score = 0;
  const maxScore = 27; // 9 rows + 9 columns + 9 squares

  // Check rows
  for (let row = 0; row < 9; row++) {
    if (isGroupComplete(board[row])) {
      score += 1;
    } else {
      score += countUniqueDigits(board[row]) / 9;
    }
  }

  // Check columns
  const columns = R.transpose(board);
  for (let col = 0; col < 9; col++) {
    if (isGroupComplete(columns[col])) {
      score += 1;
    } else {
      score += countUniqueDigits(columns[col]) / 9;
    }
  }

  // Check 3x3 squares
  for (let boxRow = 0; boxRow < 9; boxRow += 3) {
    for (let boxCol = 0; boxCol < 9; boxCol += 3) {
      const square = [];
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          square.push(board[boxRow + i][boxCol + j]);
        }
      }
      if (isGroupComplete(square)) {
        score += 1;
      } else {
        score += countUniqueDigits(square) / 9;
      }
    }
  }

  return score / maxScore;
}