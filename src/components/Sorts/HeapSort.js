import {Sort} from "./Sort";

export class HeapSort extends Sort{
    constructor(arrayVisualizer) {
        super(arrayVisualizer);
        this.sortName = "HeapSort"
    }
    
    heapify(n, i) {
        let largest = i;

        let l = 2 * i + 1;
        let r = 2 * i + 2;

        if (l < n && this.compare(l, largest, ">")) {
            largest = l;
        }
        if (r < n && this.compare(r, largest, ">")) {
            largest = r;
        }

        if (largest !== i) {
            this.swap(i, largest);
            this.heapify(n, largest);
        }
    }

    HeapSort() {
        let n = this.arrLength;


        for (let i = Math.trunc(n / 2) - 1; i >= 0; i--) {
            this.heapify(n, i);
        }

        for (let i = n - 1; i >= 0; i--) {
            this.swap(0, i);
            this.heapify(i, 0)
        }
    }

    runSort(low, high) {
        this.HeapSort(low, high)
    }
}