import { GeneticConfig, GeneticOperators, Individual } from './types';
export declare class GeneticAlgorithm<T> {
    private readonly config;
    private readonly operators;
    constructor(config: GeneticConfig, operators: GeneticOperators<T>);
    private createIndividual;
    private createInitialPopulation;
    private selectParent;
    private crossover;
    private mutate;
    private evolvePopulation;
    private evolveGeneration;
    evolve(individualLength: number, onGenerationComplete?: (generation: number, bestFitness: number) => void): Promise<{
        population: Individual<T>[];
        generations: number;
    }>;
}
