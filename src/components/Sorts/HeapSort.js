import {Sort} from "./Sort";

export class HeapSort extends Sort{
    constructor(arrayVisualizer) {
        super(arrayVisualizer);
        this.sortName = "HeapSort"
    }

    siftDown(root, dist, start) {


    while (root <= dist / 2) {
        let leaf = 2 * root;
        if (leaf < dist && this.Reads.compareInArr(start + leaf - 1, start + leaf) < 0) {
        leaf++;
    }

    if (this.Reads.compareInArr(start + root - 1, start + leaf - 1) < 0) {
        this.Writes.swap(start + root - 1, start + leaf - 1, );
        root = leaf;
    }
else break;
}
}

heapify(low, high) {
    let length = high - low;
    for (let i = length / 2; i >= 1; i--) {
        this.siftDown(i, length, low);
    }
}

// This version of heap sort works for max and min variants, alongside sorting
// partial ranges of an array.
heapSort(start, length) {
    this.heapify(start, length);

    for (let i = length - start; i > 1; i--) {
        this.Writes.swap(start, start + i - 1);
        this.siftDown(1, i - 1, start);
    }

    // if(!isMax) {
    //     this.Writes.reversal(arr, start, start + length - 1, 1, true, false);
    // }
}

    runSort(low, high) {
        this.heapSort(low, high+1)
    }
}