import {Sort} from "./Sort";

export class ShellSort extends Sort {
    constructor(arrayVisualizer) {
        super(arrayVisualizer);
        this.sortName = "ShellSort"
    }

    ShellSort() {
        let n = this.arrLength;

        for (let gap = Math.trunc(n / 2); gap > 0; gap = Math.trunc(gap / 2)) {
            for (let i = gap; i < n; i++) {
                let temp = this.Reads.get(i);

                let j;
                for (j = i; j >= gap && (this.Reads.compareValues(this.Reads.get(j - gap), temp) > 0); j -= gap) {
                    this.Writes.write(j, this.Reads.get(j - gap))
                }

                this.Writes.write(j, temp)

            }
        }


    }

    runSort(low, high) {
        this.ShellSort(low, high)
    }
}