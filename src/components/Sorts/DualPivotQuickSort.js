import {Sort} from "./Sort";
import {InsertionSort} from "./InsertionSort";

export class DualPivotQuickSort extends Sort {
    constructor(arrayVisualizer) {
        super(arrayVisualizer);
        this.sortName = "Dual Pivot QuickSort"
    }

    dualPivot(left, right, divisor) {
        let length = right - left;

        // insertion sort for tiny array
        if (length < 4) {
            let insertSorter = new InsertionSort(this.arrayVisualizer)
            insertSorter.runSort(left, right+1)
            return;
        }
        // if(length === 1){
        //     return
        // }

        let third = Math.trunc(length / divisor);

// "medians"
        let med1 = left + third;
        let med2 = right - third;

        if (med1 <= left) {
            med1 = left + 1;
        }
        if (med2 >= right) {
            med2 = right - 1;
        }


        // if(Reads.compareValues(array[med1], array[med2]) == -1) {
        if (this.Reads.compareInArr(med1, med2) < 0) {
            this.Writes.swap(med1, left);
            this.Writes.swap(med2, right);
        } else {
            this.Writes.swap(med1, right);
            this.Writes.swap(med2, left);
        }

// pivots
        let pivot1 = this.Reads.readValue(left);
        let pivot2 = this.Reads.readValue(right);

// pointers
        let less = left + 1;
        let great = right - 1;

// sorting
        for (let k = less; k <= great; k++) {

            // if (this.Reads.read(k) < pivot1) {
            if (this.Reads.compareValues(this.Reads.get(k), pivot1) < 0) {

                this.Writes.swap(k, less++);
            // } else if (this.Reads.read(k) > pivot2) {
            } else if (this.Reads.compareValues(this.Reads.get(k), pivot2) > 0) {
                // while (k < great && this.Reads.read(great) > pivot2) {
                while (k < great && this.Reads.compareValues(this.Reads.get(great), pivot2) > 0) {
                    great--;
                }
                this.Writes.swap(k, great--);

                // if (this.Reads.read(k) < pivot1) {
                if (this.Reads.compareValues(this.Reads.get(k), pivot1) < 0) {
                    this.Writes.swap(k, less++);
                }
            }
        }

// swaps
        let dist = great - less;

        if (dist < 13) {
            divisor++;
        }
        this.Writes.swap(less - 1, left);
        this.Writes.swap(great + 1, right);

// subarrays
        this.dualPivot(left, less - 2, divisor);
        if (pivot1 < pivot2) {
            this.dualPivot(less, great, divisor);
        }
        this.dualPivot(great + 2, right, divisor);
    }

    runSort(low, high) {
        this.dualPivot(low, high, 3)
    }
}