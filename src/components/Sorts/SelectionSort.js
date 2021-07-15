import {Sort} from "./Sort";

export class SelectionSort extends Sort{
    constructor(arrayVisualizer) {
        super(arrayVisualizer);
        this.sortName = "SelectionSort"
    }

    SelectionSort() {
        for (let i=0; i < this.arrLength; i++) {
            let minIndex = i
            for (let j=i; j < this.arrLength; j++) {
                if (this.Reads.compareInArr(j, minIndex) < 0) {
                    minIndex = j
                }
            }

            if (this.Reads.compareInArr(i, minIndex) > 0) {
                this.Writes.swap(i, minIndex);
            }
        }
    }

    runSort(low, high) {
        this.SelectionSort(low, high)
    }
}