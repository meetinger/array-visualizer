import {Sort} from "./Sort";

export class LRQuickSort extends Sort{
    constructor(arrayVisualizer) {
        super(arrayVisualizer);
        this.sortName="LRQuickSort"
    }

    quickSort(p, r){
        let pivot = Math.trunc(p + (r - p + 1) / 2);
        let x = this.Reads.readValue(pivot);

        let i = p;
        let j = r;

        while (i <= j) {
            while (this.Reads.readValue(i) < x){
                i++;
            }
            while (this.Reads.readValue(j) > x){
                j--;
            }

            if (i <= j) {
                this.Writes.swap(i, j);
                i++;
                j--;
            }
        }

        if(p < j) {
            this.quickSort(p, j);
        }
        if(i < r) {
            this.quickSort(i, r);
        }
    }

    runSort(low, high) {
        this.quickSort(low, high)
    }
}