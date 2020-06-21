import { runBenchmark } from './benchmark-redux';

describe.skip('[LOCAL] performances', () => {
    jest.setTimeout(1000000);

    it('move actions', async () => {
        const { results } = await runBenchmark();

        const timesMedian = results.map(({ name, details }) => {

            return {
                name,
                'median (ms)': Number.parseInt(details.median * 1000 + '')
            };
        });

        console.table(timesMedian);
    });
});