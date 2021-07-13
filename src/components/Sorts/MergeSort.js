import {Sort} from "./Sort";

export class MergeSort extends Sort{
    constructor(arrayVisualizer) {
        super(arrayVisualizer);
        this.sortName = "MergeSort"
    }
    merge(low, mid, high) {
        // let leftArray = new Array(mid - low + 1);
        // let rightArray = new Array(high - mid);

        let leftArrayLen = mid - low + 1
        let rightArrayLen = high - mid

        let leftArrayIndex = this.Writes.createAuxArray(leftArrayLen);
        let rightArrayIndex = this.Writes.createAuxArray(rightArrayLen);

        for (let i = 0; i < leftArrayLen; i++) {
            // leftArray[i] = this.Reads.read(low + i)
            this.Writes.auxWrite(i, this.Reads.read(low + i), leftArrayIndex)
        }
        for (let i = 0; i < rightArrayLen; i++) {
            // rightArray[i] = this.Reads.read(mid + i + 1);
            this.Writes.auxWrite(i, this.Reads.read(mid + i + 1), rightArrayIndex)
        }

        let leftIndex = 0;
        let rightIndex = 0;

        for (let i = low; i < high + 1; i++) {
            if (leftIndex < leftArrayLen && rightIndex < rightArrayLen) {
                // if (leftArray[leftIndex] < rightArray[rightIndex]) {
                if (this.Reads.auxRead(leftIndex, leftArrayIndex) < this.Reads.auxRead(rightIndex, rightArrayIndex)) {
                    this.Writes.write(i, this.Reads.auxRead(leftIndex, leftArrayIndex))
                    leftIndex++;
                } else {
                    this.Writes.write(i, this.Reads.auxRead(rightIndex, rightArrayIndex))
                    rightIndex++;
                }
            } else if (leftIndex < leftArrayLen) {
                this.Writes.write(i, this.Reads.auxRead(leftIndex, leftArrayIndex))
                leftIndex++;
            } else if (rightIndex < rightArrayLen) {
                this.Writes.write(i, this.Reads.auxRead(rightIndex, rightArrayIndex))
                rightIndex++;
            }
        }
        // console.log(leftArray)
        this.Writes.removeAuxArray(leftArrayIndex)
        // console.log(rightArray)
        this.Writes.removeAuxArray(rightArrayIndex)
    }

    MergeSort(low, high) {
        if (high <= low) return;

        let mid = Math.trunc((low + high) / 2)
        this.MergeSort(low, mid);
        this.MergeSort(mid + 1, high);
        this.merge(low, mid, high);
    }

    runSort(low, high) {
        this.MergeSort(low, high)
    }
}