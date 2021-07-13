import {Sort} from "./Sort";

export class LLQuickSort extends Sort{
    constructor(arrayVisualizer) {
        super(arrayVisualizer);
        this.sortName = "LLQuickSort"
    }
    partition(lo, hi) {
        let pivot = hi;
        let i = lo;
        for (let j = lo; j < hi; j++) {
            if (this.Reads.compare(j, pivot, "<")) {
                this.Writes.swap(i, j);
                i++;
            }
        }
        this.Writes.swap(i, hi);
        return i;
    }

    LLQuickSort(lo, hi) {
        if (lo < hi) {
            let p = this.partition(lo, hi);
            this.LLQuickSort(lo, p - 1);
            this.LLQuickSort(p + 1, hi);
        }
    }
    runSort(low, high) {
        this.LLQuickSort(low, high)
    }
}