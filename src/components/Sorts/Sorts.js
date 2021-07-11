export class Sorts {
    arrayVisualizer;
    sortsPaths

    constructor(arrayVisualizer) {
        this.arrayVisualizer = arrayVisualizer
        this.sortsPaths = ["BubbleSort", "MergeSort", "LLQuickSort", "InsertionSort", "TimSort", "HeapSort", "SlowSort", "StoogeSort"]
    }
    getSortsNames(){
        return this.sortsPaths;
    }
    runSort(sortName, low, high, bucketsNum){
        let Sort = require("./"+sortName+".js")[sortName]
        this.arrayVisualizer.sortClickEvent(Sort, low, high, bucketsNum)
    }
}