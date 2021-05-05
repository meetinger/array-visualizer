import {ArrayVisualizer} from "../ArrayVisualizer/ArrayVisualizer";

export function BubbleSort(arrayVisualizer) {
    let len = arrayVisualizer.state.array.length
    for (let i = 0; i < len; i++) {
        for (let j = 0; j < len - i - 1; j++) {
            if (arrayVisualizer.compare(j, j + 1)) {
                arrayVisualizer.swap(j, j + 1)
            }
        }
    }
}

function partition(arrayVisualizer, lo, hi){
    let pivot = hi;
    let i = lo;

    for(let j = lo; j < hi; j++) {
        // ArrayVisualizer.markArray(1, j);
        if(!arrayVisualizer.compare(j, pivot)) {
            arrayVisualizer.swap(i, j);
            i++;
        }
    }
    arrayVisualizer.swap(i, hi);
    return i;
}

export function LLQuickSort(arrayVisualizer, lo, hi){
    if(lo < hi) {
        let p = partition(arrayVisualizer, lo, hi);
        LLQuickSort(arrayVisualizer, lo, p - 1);
        LLQuickSort(arrayVisualizer, p + 1, hi);
    }
}