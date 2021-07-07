import {ArrayVisualizer} from "../ArrayVisualizer/ArrayVisualizer";

function partition(arrayVisualizer, lo, hi) {
    let pivot = hi;
    let i = lo;

    for (let j = lo; j < hi; j++) {
        // ArrayVisualizer.markArray(1, j);
        if (arrayVisualizer.compare(j, pivot, "<")) {
            arrayVisualizer.swap(i, j);
            i++;
        }
    }
    arrayVisualizer.swap(i, hi);
    return i;
}

export let sorts = {
    BubbleSort: function BubbleSort(arrayVisualizer) {
        let len = arrayVisualizer.state.array.length
        for (let i = 0; i < len; i++) {
            for (let j = 0; j < len - i - 1; j++) {
                if (arrayVisualizer.compare(j, j + 1, ">")) {
                    arrayVisualizer.swap(j, j + 1)
                }
            }
        }
    },


    LLQuickSort: function LLQuickSort(arrayVisualizer, lo, hi) {
        if (lo < hi) {
            let p = partition(arrayVisualizer, lo, hi);
            LLQuickSort(arrayVisualizer, lo, p - 1);
            LLQuickSort(arrayVisualizer, p + 1, hi);
        }
    },

    SlowSort: function SlowSort(arrayVisualizer, i, j) {
        if (arrayVisualizer.compare(i, j, ">=")) {
            return;
        }
        let m = Math.floor((i + j) / 2);
        SlowSort(arrayVisualizer, i, m);
        SlowSort(arrayVisualizer, m + 1, j);
        if (arrayVisualizer.compare(j, m, "<")) {
            arrayVisualizer.swap(j, m)
        }
        SlowSort(arrayVisualizer, i, j - 1)
    },
}