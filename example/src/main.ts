import './style.css';
import * as R from 'ramda';
import { Chart, ChartConfiguration } from 'chart.js/auto';
import { SudokuSolver } from './sudoku/solver';
import { formatBoard, stringToBoard } from './sudoku/utils';
import { SudokuBoard } from './sudoku/types';

const emptyBoard: SudokuBoard = Array(9)
  .fill(0)
  .map(() => Array(9).fill(0));
let currentBoard = emptyBoard;
let lastLoadedBoard = emptyBoard;
let fitnessChart: Chart | null = null;
const solver = new SudokuSolver();

// Default configuration values
const defaultConfig = {
  populationSize: 100,
  mutationRate: 1,
  generationLimit: 1000,
  elitismCount: 3,
};

function getConfig() {
  return {
    populationSize: parseInt(
      (document.getElementById('populationSize') as HTMLInputElement).value,
      10
    ),
    mutationRate: parseFloat(
      (document.getElementById('mutationRate') as HTMLInputElement).value
    ),
    generationLimit: parseInt(
      (document.getElementById('generationLimit') as HTMLInputElement).value,
      10
    ),
    elitismCount: parseInt(
      (document.getElementById('elitismCount') as HTMLInputElement).value,
      10
    ),
  };
}

function initChart() {
  const ctx = (
    document.getElementById('fitnessChart') as HTMLCanvasElement
  ).getContext('2d')!;

  const config: ChartConfiguration = {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Max Fitness',
          data: [],
          borderColor: '#3b82f6',
          tension: 0.1,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      animation: false,
      scales: {
        y: {
          type: 'logarithmic',
          min: 0.01,
          max: 1,
          reverse: true,
          title: {
            display: true,
            text: 'Fitness (inverted log scale)',
          },
          ticks: {
            callback: (value) => (1 - Number(value)).toFixed(2),
          },
        },
        x: {
          title: {
            display: true,
            text: 'Generation',
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  };

  fitnessChart = new Chart(ctx, config);
}

function updateChart(generation: number, fitness: number) {
  if (!fitnessChart) return;

  if (generation % 100 === 0) {
    fitnessChart.data.labels!.push(generation.toString());
    fitnessChart.data.datasets[0].data.push(1 - Math.max(0.01, fitness));
    fitnessChart.update();
  }
}

function resetChart() {
  if (fitnessChart) {
    fitnessChart.data.labels = [];
    fitnessChart.data.datasets[0].data = [];
    fitnessChart.update();
  }
}

function updateUI(result: {
  board: SudokuBoard;
  fitness: number;
  generations: number;
  solved: boolean;
}) {
  const solutionEl = document.getElementById('solution')!;
  const fitnessEl = document.getElementById('fitness')!;
  const statusEl = document.getElementById('status')!;
  const generationsEl = document.getElementById('generations')!;
  const buttons = document.querySelectorAll('button');
  const inputs = document.querySelectorAll('input');

  solutionEl.textContent = formatBoard(result.board);
  fitnessEl.textContent = result.fitness.toFixed(2);
  statusEl.textContent = result.solved ? 'SOLVED!' : 'Not solved';
  generationsEl.textContent = `Generations: ${result.generations}`;

  buttons.forEach((btn) => (btn.disabled = false));
  inputs.forEach((input) => (input.disabled = false));
  document.getElementById('solveBtn')!.textContent = 'Solve';
}

function setUIState(solving: boolean) {
  const buttons = document.querySelectorAll('button');
  const inputs = document.querySelectorAll('input');
  buttons.forEach((btn) => (btn.disabled = solving));
  inputs.forEach((input) => (input.disabled = solving));

  const solveBtn = document.getElementById('solveBtn')!;
  solveBtn.innerHTML = solving
    ? '<span class="spinner"></span> Solving...'
    : 'Solve';

  if (solving) {
    document.getElementById('solution')!.innerHTML =
      '<span class="spinner"></span> Calculating...';
    document.getElementById('fitness')!.textContent = '...';
    document.getElementById('status')!.textContent = 'Solving...';
    document.getElementById('generations')!.textContent = 'Generations: ...';
    resetChart();
  }
}

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="container">
    <h1>Genetic Algorithm Sudoku Solver</h1>
    <details style="text-align: left; padding-bottom: 2em">
      <summary>READ ME...</summary><br/>
      Below is a genetic Sudoku board solver example.<br/><br/>
      You can start playing with it by clicking the "Solve" button.<br/><br/>
      The algorithm will not always succeed, which is a nature of genetic algorithms.<br/><br/>
      If you want to load a partially filled board, click the "Load Board" button and enter 81 digits
      (use 0 for empty cells).<br/><br/>
      You can load the board and check the solution at <a href="https://janbkrejci.github.io/sudoku/" target="_blank">https://janbkrejci.github.io/sudoku/</a>.<br/><br/>
    </details>
    <div class="config-grid">
      <div class="config-item">
        <label for="populationSize">Population Size:</label>
        <input type="number" id="populationSize" value="${defaultConfig.populationSize
  }" min="10" max="1000" step="10">
      </div>
      <div class="config-item">
        <label for="mutationRate">Mutation Rate:</label>
        <input type="number" id="mutationRate" value="${defaultConfig.mutationRate
  }" min="0.001" max="0.1" step="0.001">
      </div>
      <div class="config-item">
        <label for="generationLimit">Generation Limit:</label>
        <input type="number" id="generationLimit" value="${defaultConfig.generationLimit
  }" min="100" max="10000" step="100">
      </div>
      <div class="config-item">
        <label for="elitismCount">Elitism Count:</label>
        <input type="number" id="elitismCount" value="${defaultConfig.elitismCount
  }" min="1" max="100" step="1">
      </div>
    </div>
    <div class="controls">
      <button id="solveBtn">Solve</button>
      <button id="resetBtn">Reset</button>
      <button id="clearBtn">Clear</button>
      <button id="copyBtn">Copy Board</button>
      <button id="loadBtn">Load Board</button>
    </div>
    <div class="results">
      <pre id="solution">${formatBoard(emptyBoard)}</pre>
      <div class="info">
        <p>Status: <span id="status">Not started</span></p>
        <p>Fitness: <span id="fitness">Not computed yet</span></p>
        <p id="generations">Generations: 0</p>
      </div>
    </div>
    <div class="chart-container">
      <canvas id="fitnessChart"></canvas>
    </div>
  </div>
`;

initChart();

document.getElementById('solveBtn')?.addEventListener('click', async () => {
  setUIState(true);

  try {
    solver.updateConfig(getConfig());
    const result = await solver.solve(currentBoard, updateChart);
    updateUI(result);
  } catch (error) {
    alert(error instanceof Error ? error.message : 'An error occurred');
    setUIState(false);
  }
});

document.getElementById('resetBtn')?.addEventListener('click', () => {
  currentBoard = R.clone(lastLoadedBoard);
  updateUI({ board: currentBoard, fitness: 0, generations: 0, solved: false });
  resetChart();
});

document.getElementById('clearBtn')?.addEventListener('click', () => {
  currentBoard = emptyBoard;
  lastLoadedBoard = emptyBoard;
  updateUI({ board: currentBoard, fitness: 0, generations: 0, solved: false });
  resetChart();
});

document.getElementById('copyBtn')?.addEventListener('click', () => {
  const copyBtn = document.getElementById('copyBtn')! as HTMLButtonElement;
  const solutionEl = document.getElementById('solution')!;

  if (solutionEl.textContent) {
    const boardText = solutionEl.textContent
      .split('\n')
      .map((line) => line.replace(/[^0-9.]/g, ''))
      .join('')
      .replace(/\./g, '0');

    navigator.clipboard.writeText(boardText);

    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    copyBtn.disabled = true;

    setTimeout(() => {
      copyBtn.textContent = originalText;
      copyBtn.disabled = false;
    }, 2000);
  }
});

document.getElementById('loadBtn')?.addEventListener('click', () => {
  const input = prompt('Enter 81 digits (use 0 for empty cells):');
  if (input) {
    try {
      currentBoard = stringToBoard(input);
      lastLoadedBoard = R.clone(currentBoard);
      updateUI({
        board: currentBoard,
        fitness: 0,
        generations: 0,
        solved: false,
      });
      resetChart();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Invalid input');
    }
  }
});
