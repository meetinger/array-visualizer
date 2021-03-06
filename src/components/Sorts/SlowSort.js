import {Sort} from "./Sort";

export class SlowSort extends Sort{
    constructor(arrayVisualizer) {
        super(arrayVisualizer);
        this.sortName = "SlowSort"
        this.warnLen = 50
    }

    SlowSort(i, j) {
        if (i >= j) {
            return;
        }
        let m = Math.floor((i + j) / 2);
        this.SlowSort(i, m);
        this.SlowSort(m + 1, j);
        if (this.Reads.compareInArr(j, m) < 0) {
            this.Writes.swap(j, m)
        }
        this.SlowSort(i, j - 1)
    }

    runSort(low, high) {
        this.SlowSort(low, high)
    }
}