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
                if (this.Reads.compare(j, minIndex, "<")) {
                    minIndex = j
                }
            }

            if (this.Reads.compare(i, minIndex, ">")) {
                this.Writes.swap(i, minIndex);
            }
        }
    }

    runSort(low, high) {
        this.SelectionSort(low, high)
    }
}