export class Sorts {
    arrayVisualizer;
    sortsPaths

    constructor(arrayVisualizer) {
        this.arrayVisualizer = arrayVisualizer
        this.sortsPaths = ["BubbleSort", "MergeSort", "LLQuickSort", "LRQuickSort",
            "DualPivotQuickSort", "InsertionSort", "SelectionSort", "TimSort", "PseudoTimSort",
            "HeapSort", "LSDRadixSort", "BitonicSort", "SlowSort", "StoogeSort", "GrailSort"]
    }

    getSortsPaths() {
        return this.sortsPaths;
    }

    getSortObject(sortPath) {
        let Sort = require("./" + sortPath + ".js")[sortPath]
        return new Sort(this.arrayVisualizer)
    }

    runSort(sortName, low, high) {
        this.arrayVisualizer.getDelays().resetDelays()
        this.arrayVisualizer.nullify()
        let sort = this.getSortObject(sortName)
        let warnLen = sort.getWarnLen()
        let bucketsNum = 4
        if (sort.isNeedBucketsNum) {
            bucketsNum = parseInt(prompt("Enter the base:", "4"))
            if (isNaN(bucketsNum)) {
                return;
            }
        }
        if (warnLen !== -1 && this.arrayVisualizer.getArrLength() > warnLen &&
            !window.confirm("WARNING!!!\nThe array size(" + this.arrayVisualizer.getArrLength() + ") " +
            "more than recommended(" + warnLen + ")\nApplication may freeze\nDo you want continue?")) {
            return
        }

        bucketsNum = Math.max(4, bucketsNum)

        let bufferSize = 0
        if (sort.isNeedBuffer) {
            bufferSize = parseInt(prompt("Enter the buffer size:", "0"))
            if (isNaN(bufferSize)) {
                return;
            }
        }
        bufferSize = Math.max(0, bufferSize)

        this.arrayVisualizer.initPseudoArray()
        this.arrayVisualizer.setSortName(sort.getSortName())
        sort.runSort(low, high, bucketsNum, bufferSize)
        this.arrayVisualizer.sortClickEvent()
    }
}