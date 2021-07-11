import {Sort} from "./Sort";

export class InsertionSort extends Sort{
    constructor(arrayVisualizer) {
        super(arrayVisualizer);
        this.sortName = "InsertionSort"
    }

    InsertionSort() {
        let length = this.arrLength;
        for (let i = 1; i < length; i++) {
            let key = this.read(i);
            let j = i - 1;
            while (j >= 0 && this.read(j) > key) {
                this.write(j + 1, this.read(j))
                j = j - 1;
            }
            this.write(j + 1, key)
        }
    }

    runSort(low, high) {
        this.InsertionSort(low, high)
    }
}