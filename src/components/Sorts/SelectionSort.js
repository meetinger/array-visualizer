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
                if (this.compare(j, minIndex, "<")) {
                    minIndex = j
                }
            }

            if (this.compare(i, minIndex, ">")) {
                this.swap(i, minIndex);
            }
        }
    }

    runSort(low, high) {
        this.SelectionSort(low, high)
    }
}