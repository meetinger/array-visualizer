import {Sort} from "./Sort";

export class BubbleSort extends Sort{
    constructor(arrayVisualizer) {
        super(arrayVisualizer);
        this.sortName = "BubbleSort"
    }
    BubbleSort() {
        let len = this.arrLength;
        for (let i = 0; i < len; i++) {
            for (let j = 0; j < len - i - 1; j++) {
                if (this.compare(j, j + 1, ">")) {
                    this.swap(j, j + 1)
                }
            }
        }
    }

    runSort(low, high) {
        this.BubbleSort(low, high)
    }
}