import {Sort} from "./Sort";

export class BinaryInsertionSort extends Sort{
    constructor(arrayVisualizer) {
        super(arrayVisualizer);
        this.sortName = "BinaryInsertionSort"
        this.warnLen = 200
    }

    binaryInsertionSort(lo, hi, start) {
        if (start === lo) {
            start++
        }

        for (; start < hi; start++) {
            const pivot = this.Reads.get(start)

            let left = lo
            let right = start

            while (left < right) {
                const mid = (left + right) >>> 1

                if (this.Reads.compareValues(pivot.getValue(), this.Reads.readValue(mid)) < 0) {
                    right = mid
                } else {
                    left = mid + 1
                }
            }

            let n = start - left
            while (n > 0) {
                this.Writes.write(left + n, this.Reads.get(left + n - 1))
                n--
            }

            this.Writes.write(left, pivot)
        }
    }

    runSort(low, high) {
        this.binaryInsertionSort(low, high+1, 0)
    }
}