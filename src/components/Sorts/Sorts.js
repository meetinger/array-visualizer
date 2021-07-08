export class Sorts {
    arrayVisualizer;
    array;
    pseudoArray;

    compare;
    swap;
    write;

    arrLength;

    constructor(arrayVisualizer) {
        // super(arrayVisualizer)
        this.arrayVisualizer = arrayVisualizer
        this.pseudoArray = this.arrayVisualizer.getPseudoArray()
        this.state = this.arrayVisualizer.getState()
        this.compare = this.arrayVisualizer.compare.bind(arrayVisualizer)
        this.swap = this.arrayVisualizer.swap.bind(arrayVisualizer)
        this.read = this.arrayVisualizer.read.bind(arrayVisualizer)
        this.write = this.arrayVisualizer.write.bind(arrayVisualizer)
        this.arrLength = this.arrayVisualizer.getArrLength();
    }

    partition(lo, hi) {
        let pivot = hi;
        let i = lo;
        for (let j = lo; j < hi; j++) {
            if (this.compare(j, pivot, "<")) {
                this.swap(i, j);
                i++;
            }
        }
        this.swap(i, hi);
        return i;
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


    LLQuickSort(lo, hi) {
        if (lo < hi) {
            let p = this.partition(lo, hi);
            this.LLQuickSort(lo, p - 1);
            this.LLQuickSort(p + 1, hi);
        }
    }


    SlowSort(i, j) {
        if (i >= j) {
            return;
        }
        let m = Math.floor((i + j) / 2);
        this.SlowSort(i, m);
        this.SlowSort(m + 1, j);
        if (this.compare(j, m, "<")) {
            this.swap(j, m)
        }
        this.SlowSort(i, j - 1)
    }

    merge(low, mid, high) {
        let leftArray = new Array(mid - low + 1);
        let rightArray = new Array(high - mid);

        // Copying our subarrays into temporaries
        for (let i = 0; i < leftArray.length; i++) {
            // leftArray[i] = array[low + i];
            leftArray[i] = this.read(low + i)
        }
        for (let i = 0; i < rightArray.length; i++) {
            // rightArray[i] = array[mid + i + 1];
            rightArray[i] = this.read(mid + i + 1);
        }

        // Iterators containing current index of temp subarrays
        let leftIndex = 0;
        let rightIndex = 0;

        // Copying from leftArray and rightArray back into array
        for (let i = low; i < high + 1; i++) {
            // If there are still uncopied elements in R and L, copy minimum of the two
            if (leftIndex < leftArray.length && rightIndex < rightArray.length) {
                if (leftArray[leftIndex] < rightArray[rightIndex]) {
                    // array[i] = leftArray[leftIndex];
                    this.write(i, leftArray[leftIndex])
                    leftIndex++;
                } else {
                    // array[i] = rightArray[rightIndex];
                    this.write(i, rightArray[rightIndex])
                    rightIndex++;
                }
            } else if (leftIndex < leftArray.length) {
                // If all elements have been copied from rightArray, copy rest of leftArray
                // array[i] = leftArray[leftIndex];
                this.write(i, leftArray[leftIndex])
                leftIndex++;
            } else if (rightIndex < rightArray.length) {
                // If all elements have been copied from leftArray, copy rest of rightArray
                // array[i] = rightArray[rightIndex];
                this.write(i, rightArray[rightIndex])
                rightIndex++;
            }
        }
    }

    MergeSort(low, high) {
        if (high <= low) return;

        let mid = Math.trunc((low + high) / 2)
        this.MergeSort(low, mid);
        this.MergeSort(mid + 1, high);
        this.merge(low, mid, high);
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

        for(let i = n-1; i >= 0; i--){
            this.swap(0, i);
            this.heapify(i, 0)
        }
    }

    InsertionSort(){
        let length = this.arrLength;
        for (let i = 1; i < length; i++) {
            let key = this.read(i);
            let j = i - 1;
            while (j >= 0 && this.read(j) > key) {
                this.write(j+1, this.read(j))
                j = j - 1;
            }
            this.write(j+1, key)
        }
    }

}