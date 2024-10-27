# ts-genetic

A flexible genetic algorithm implementation in TypeScript that can be used to solve various optimization problems.

Source code is available on [GitHub](https://github.com/janbkrejci/ts-genetic).

## Installation

```bash
npm install ts-genetic
```

## Usage

The package provides a flexible `GeneticAlgorithm` class that can be configured with custom operators for different optimization problems.

### Basic Example

```typescript
import { GeneticAlgorithm } from 'ts-genetic';

const config = {
  populationSize: 100,
  mutationRate: 0.01,
  generationLimit: 1000,
  elitismCount: 5
};

const geneticAlgorithm = new GeneticAlgorithm(config, {
  createGene: () => Math.random(),
  mutateGene: (gene) => gene + (Math.random() - 0.5) * 0.1,
  calculateFitness: (individual) => {
    // Calculate fitness based on your problem
    return 1 / (1 + Math.abs(individual.genes[0] - 0.5));
  },
  isTerminationConditionMet: (population, generation) => {
    const bestFitness = Math.max(...population.map(ind => ind.fitness));
    return bestFitness > 0.99;
  }
});

const result = await geneticAlgorithm.evolve(1);
console.log('Best solution:', result.population[0]);
```

### Real-World Example: Sudoku Solver

To see a more complex example, check out the example folder in the repository. It contains a Sudoku solver that uses the genetic algorithm to solve Sudoku puzzles.

```bash
cd example
npm install
npm run dev
```

## API Reference

### GeneticAlgorithm<T>

The main class for implementing genetic algorithms.

#### Constructor

```typescript
constructor(config: GeneticConfig, operators: GeneticOperators<T>)
```

#### GeneticConfig

```typescript
interface GeneticConfig {
  populationSize: number;    // Size of the population in each generation
  mutationRate: number;      // Probability of mutation (0-1)
  generationLimit: number;   // Maximum number of generations
  elitismCount: number;      // Number of best individuals to preserve
}
```

#### GeneticOperators<T>

```typescript
interface GeneticOperators<T> {
  // Required operators
  calculateFitness: (individual: Individual<T>) => Promise<number> | number;
  isTerminationConditionMet: (population: Individual<T>[], generation: number) => Promise<boolean> | boolean;

  // Optional operators - provide either the high-level or low-level operators
  createIndividual?: (length: number) => Promise<Individual<T>> | Individual<T>;
  crossover?: (parent1: Individual<T>, parent2: Individual<T>) => Promise<Individual<T>> | Individual<T>;
  mutate?: (individual: Individual<T>, mutationRate: number) => Promise<Individual<T>> | Individual<T>;

  // Low-level operators (used if high-level ones are not provided)
  createGene?: () => Promise<T> | T;
  mutateGene?: (gene: T) => Promise<T> | T;
}
```

#### Methods

```typescript
async evolve(
  individualLength: number,
  onGenerationComplete?: (generation: number, bestFitness: number) => void
): Promise<{
  population: Individual<T>[];
  generations: number;
}>
```

## License

MIT
