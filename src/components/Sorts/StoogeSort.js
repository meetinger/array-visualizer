import {Sort} from "./Sort";

export class StoogeSort extends Sort{
    constructor(arrayVisualizer) {
        super(arrayVisualizer);
        this.sortName = "StoogeSort"
    }

    StoogeSort(i, j) {
        console.log(i)
        console.log(j)
        if (this.compare(i, j, ">")) {
            this.swap(i, j)
        }
        if (j - i > 1) {
            let t = Math.trunc((j - i + 1) / 3)
            this.StoogeSort(i, j - t)
            this.StoogeSort(i + t, j)
            this.StoogeSort(i, j - t)
        }
    }

    runSort(low, high) {
        this.StoogeSort(low, high)
    }
}