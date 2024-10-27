import * as R from 'ramda';
import { GeneticConfig, GeneticOperators, Individual } from './types';

export class GeneticAlgorithm<T> {
  constructor(
    private readonly config: GeneticConfig,
    private readonly operators: GeneticOperators<T>
  ) {}

  private async createIndividual(length: number): Promise<Individual<T>> {
    if (this.operators.createIndividual) {
      return this.operators.createIndividual(length);
    }

    if (!this.operators.createGene) {
      throw new Error('Either createIndividual or createGene operator must be provided');
    }

    const genes = await Promise.all(
      R.times(() => this.operators.createGene!(), length)
    );
    const individual = { genes, fitness: 0 };
    const fitness = await this.operators.calculateFitness(individual);
    return { ...individual, fitness };
  }

  private async createInitialPopulation(individualLength: number): Promise<Individual<T>[]> {
    return Promise.all(
      R.times(
        () => this.createIndividual(individualLength),
        this.config.populationSize
      )
    );
  }

  private selectParent(population: Individual<T>[]): Individual<T> {
    const totalFitness = R.sum(population.map(ind => ind.fitness));
    let random = Math.random() * totalFitness;

    for (const individual of population) {
      random -= individual.fitness;
      if (random <= 0) return individual;
    }

    return R.last(population)!;
  }

  private async crossover(parent1: Individual<T>, parent2: Individual<T>): Promise<Individual<T>> {
    if (this.operators.crossover) {
      return this.operators.crossover(parent1, parent2);
    }

    const crossoverPoint = Math.floor(Math.random() * parent1.genes.length);
    const childGenes = [
      ...parent1.genes.slice(0, crossoverPoint),
      ...parent2.genes.slice(crossoverPoint),
    ];
    const individual = { genes: childGenes, fitness: 0 };
    const fitness = await this.operators.calculateFitness(individual);
    return { ...individual, fitness };
  }

  private async mutate(individual: Individual<T>): Promise<Individual<T>> {
    if (this.operators.mutate) {
      return this.operators.mutate(individual, this.config.mutationRate);
    }

    if (!this.operators.mutateGene) {
      throw new Error('Either mutate or mutateGene operator must be provided');
    }

    const mutatedGenes = await Promise.all(
      individual.genes.map(gene =>
        Math.random() < this.config.mutationRate
          ? this.operators.mutateGene!(gene)
          : Promise.resolve(gene)
      )
    );
    const mutated = { genes: mutatedGenes, fitness: 0 };
    const fitness = await this.operators.calculateFitness(mutated);
    return { ...mutated, fitness };
  }

  private async evolvePopulation(population: Individual<T>[]): Promise<Individual<T>[]> {
    const sortedPopulation = R.sort(
      (a, b) => b.fitness - a.fitness,
      population
    );

    const elites = R.take(this.config.elitismCount, sortedPopulation);
    
    const children = await Promise.all(
      R.times(async () => {
        const parent1 = this.selectParent(sortedPopulation);
        const parent2 = this.selectParent(sortedPopulation);
        const child = await this.crossover(parent1, parent2);
        return this.mutate(child);
      }, this.config.populationSize - this.config.elitismCount)
    );

    return [...elites, ...children];
  }

  private async evolveGeneration(
    initialPopulation: Individual<T>[],
    onGenerationComplete?: (generation: number, bestFitness: number) => void
  ): Promise<{ population: Individual<T>[]; generations: number }> {
    let currentPopulation = initialPopulation;
    let generation = 0;

    while (generation < this.config.generationLimit) {
      const isTerminated = await this.operators.isTerminationConditionMet(
        currentPopulation,
        generation
      );

      if (isTerminated) {
        return { population: currentPopulation, generations: generation };
      }

      if (generation % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
        const bestFitness = Math.max(...currentPopulation.map(ind => ind.fitness));
        onGenerationComplete?.(generation, bestFitness);
      }

      currentPopulation = await this.evolvePopulation(currentPopulation);
      generation++;
    }

    return { population: currentPopulation, generations: generation };
  }

  public async evolve(
    individualLength: number,
    onGenerationComplete?: (generation: number, bestFitness: number) => void
  ): Promise<{ population: Individual<T>[]; generations: number }> {
    const initialPopulation = await this.createInitialPopulation(individualLength);
    return this.evolveGeneration(initialPopulation, onGenerationComplete);
  }
}