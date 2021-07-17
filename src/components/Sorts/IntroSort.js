import {Sort} from "./Sort";
import {HeapSort} from "./HeapSort";
import {InsertionSort} from "./InsertionSort";

export class IntroSort extends Sort {
    middle
    sizeThreshold = 16;

    constructor(arrayVisualizer) {
        super(arrayVisualizer);
        this.sortName = "IntroSort"
    }

    floorLogBaseTwo(a) {
        return (Math.floor(Math.log(a) / Math.log(2)));
    }

// Swaps the median of arr[left], arr[mid], and arr[right] to index left.
// taken from gcc source code found here: https://gcc.gnu.org/onlinedocs/gcc-4.7.2/libstdc++/api/a01462_source.html
// gccmedianof3(left, mid, right) {
//     if (this.Reads.compareInArr(left, mid) < 0) {
//         if (this.Reads.compareInArr(mid, right)  < 0) {
//             this.Writes.swap(left, mid);
//         }
//         else if (this.Reads.compareInArr(left, right) < 0) {
//             this.Writes.swap(left, right);
//         }
//     }
//     else if (this.Reads.compareInArr(left, right) < 0) {
//         this.middle = left;
//         // return arr[left];
//         return this.Reads.getValue(left);
//     }
//     else if (this.Reads.compareInArr(mid, right)  < 0) {
//         this.Writes.swap(left, right);
//     }
//     else {
//         this.Writes.swap(left, mid);
//     }
//     this.middle = left;
//     // Highlights.markArray(3, left);
//     return this.Reads.readValue(left);
// }

    medianof3(left, mid, right) {
        if (this.Reads.compareInArr(right, left) < 0) {
            this.Writes.swap(left, right);
        }
        if (this.Reads.compareInArr(mid, left) < 0) {
            this.Writes.swap(mid, left);
        }
        if (this.Reads.compareInArr(right, mid) < 0) {
            this.Writes.swap(right, mid);
        }
        this.middle = mid;
        return this.Reads.readValue(mid);
    }

    partition(lo, hi, x) {
        let i = lo, j = hi;
        while (true) {
            // console.log("PARTITION LOOP!")
            // while (Reads.compareValues(a[i], x) == -1) {
            while (this.Reads.compareValues(this.Reads.get(i), x) < 0) {
                i++;
            }

            j--;

            // while (Reads.compareValues(x, a[j]) == -1) {
            while (this.Reads.compareValues(x, this.Reads.get(j)) < 0) {
                // Highlights.markArray(2, j);
                // Delays.sleep(0.5);
                j--;
            }

            if (!(i < j)) {
                // Highlights.markArray(1, i);
                // Delays.sleep(0.5);
                return i;
            }

            // Follow the pivot and highlight it.
            // if(i == middle) {
            //     Highlights.markArray(3, j);
            // }
            // if(j == middle) {
            //     Highlights.markArray(3, i);
            // }

            this.Writes.swap(i, j);
            i++;
        }
    }

    introsortLoop(lo, hi, depthLimit) {
        while (hi - lo > this.sizeThreshold) {
            // console.log("INTROSORT LOOP!!!")
            // while (hi - lo > 1) {
            if (depthLimit === 0) {
                // this.Marks.clearAllMarks();
                let heapSort = new HeapSort(this.arrayVisualizer)

                heapSort.heapSort(lo, hi);
                return;
            }
            depthLimit--;
            let p = this.partition(lo, hi, this.medianof3(lo, lo + Math.trunc((hi - lo) / 2), hi - 1));
            this.introsortLoop(p, hi, depthLimit);
            hi = p;
        }
        return;
    }


    runSort(low, high) {
        this.introsortLoop(low, high + 1, this.floorLogBaseTwo(high-low+1))
        let insertionSort = new InsertionSort(this.arrayVisualizer)
        insertionSort.runSort(low, high)
    }
}