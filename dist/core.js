import * as R from 'ramda';
export class GeneticAlgorithm {
    constructor(config, operators) {
        this.config = config;
        this.operators = operators;
    }
    async createIndividual(length) {
        if (this.operators.createIndividual) {
            return this.operators.createIndividual(length);
        }
        if (!this.operators.createGene) {
            throw new Error('Either createIndividual or createGene operator must be provided');
        }
        const genes = await Promise.all(R.times(() => this.operators.createGene(), length));
        const individual = { genes, fitness: 0 };
        const fitness = await this.operators.calculateFitness(individual);
        return { ...individual, fitness };
    }
    async createInitialPopulation(individualLength) {
        return Promise.all(R.times(() => this.createIndividual(individualLength), this.config.populationSize));
    }
    selectParent(population) {
        const totalFitness = R.sum(population.map(ind => ind.fitness));
        let random = Math.random() * totalFitness;
        for (const individual of population) {
            random -= individual.fitness;
            if (random <= 0)
                return individual;
        }
        return R.last(population);
    }
    async crossover(parent1, parent2) {
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
    async mutate(individual) {
        if (this.operators.mutate) {
            return this.operators.mutate(individual, this.config.mutationRate);
        }
        if (!this.operators.mutateGene) {
            throw new Error('Either mutate or mutateGene operator must be provided');
        }
        const mutatedGenes = await Promise.all(individual.genes.map(gene => Math.random() < this.config.mutationRate
            ? this.operators.mutateGene(gene)
            : Promise.resolve(gene)));
        const mutated = { genes: mutatedGenes, fitness: 0 };
        const fitness = await this.operators.calculateFitness(mutated);
        return { ...mutated, fitness };
    }
    async evolvePopulation(population) {
        const sortedPopulation = R.sort((a, b) => b.fitness - a.fitness, population);
        const elites = R.take(this.config.elitismCount, sortedPopulation);
        const children = await Promise.all(R.times(async () => {
            const parent1 = this.selectParent(sortedPopulation);
            const parent2 = this.selectParent(sortedPopulation);
            const child = await this.crossover(parent1, parent2);
            return this.mutate(child);
        }, this.config.populationSize - this.config.elitismCount));
        return [...elites, ...children];
    }
    async evolveGeneration(initialPopulation, onGenerationComplete) {
        let currentPopulation = initialPopulation;
        let generation = 0;
        while (generation < this.config.generationLimit) {
            const isTerminated = await this.operators.isTerminationConditionMet(currentPopulation, generation);
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
    async evolve(individualLength, onGenerationComplete) {
        const initialPopulation = await this.createInitialPopulation(individualLength);
        return this.evolveGeneration(initialPopulation, onGenerationComplete);
    }
}
