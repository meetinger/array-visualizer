import {Sort} from "./Sort";

export class InsertionSort extends Sort{
    constructor(arrayVisualizer) {
        super(arrayVisualizer);
        this.sortName = "InsertionSort"
    }

    InsertionSort(low, high) {
        let length = high+1;
        for (let i = low+1; i < length; i++) {
            let key = this.Reads.get(i);
            let j = i - 1;
            while (j >= 0 && this.Reads.compareValues(this.Reads.get(j), key) > 0) {
                this.Writes.write(j + 1, this.Reads.get(j))
                j = j - 1;
            }
            this.Writes.write(j + 1, key)
        }
    }

    runSort(low, high) {
        this.InsertionSort(low, high)
    }
}