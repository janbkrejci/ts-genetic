import { GeneticAlgorithm } from 'ts-genetic';

const config = {
    populationSize: 100,
    mutationRate: 0.01,
    generationLimit: 1000,
    elitismCount: 5
};

// target is to find a number as close to 0.5 as possible
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
const population = result.population.sort((a, b) => b.fitness - a.fitness);

console.log('Best solution:', population[0].genes[0]);