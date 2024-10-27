export interface Individual<T> {
    genes: T[];
    fitness: number;
}
export interface GeneticConfig {
    populationSize: number;
    mutationRate: number;
    generationLimit: number;
    elitismCount: number;
}
export interface GeneticOperators<T> {
    createGene?: () => Promise<T> | T;
    mutateGene?: (gene: T) => Promise<T> | T;
    createIndividual?: (length: number) => Promise<Individual<T>> | Individual<T>;
    crossover?: (parent1: Individual<T>, parent2: Individual<T>) => Promise<Individual<T>> | Individual<T>;
    mutate?: (individual: Individual<T>, mutationRate: number) => Promise<Individual<T>> | Individual<T>;
    calculateFitness: (individual: Individual<T>) => Promise<number> | number;
    isTerminationConditionMet: (population: Individual<T>[], generation: number) => Promise<boolean> | boolean;
}
