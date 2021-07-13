import {Sort} from "./Sort";

export class InsertionSort extends Sort{
    constructor(arrayVisualizer) {
        super(arrayVisualizer);
        this.sortName = "InsertionSort"
    }

    InsertionSort(low, high) {
        let length = high+1;
        for (let i = low+1; i < length; i++) {
            let key = this.Reads.read(i);
            let j = i - 1;
            while (j >= 0 && this.Reads.read(j) > key) {
                this.Writes.write(j + 1, this.Reads.read(j))
                j = j - 1;
            }
            this.Writes.write(j + 1, key)
        }
    }

    runSort(low, high) {
        this.InsertionSort(low, high)
    }
}