export class Sorts {
    arrayVisualizer;
    sortsPaths

    constructor(arrayVisualizer) {
        this.arrayVisualizer = arrayVisualizer
        this.sortsPaths = ["BubbleSort", "MergeSort", "LLQuickSort", "InsertionSort", "SelectionSort", "TimSort", "PseudoTimSort", "HeapSort", "SlowSort", "StoogeSort"]
    }

    getSortsPaths() {
        return this.sortsPaths;
    }

    getSortObject(sortPath) {
        let Sort = require("./" + sortPath + ".js")[sortPath]
        return new Sort(this.arrayVisualizer)
    }

    runSort(sortName, low, high, bucketsNum) {
        this.arrayVisualizer.getDelays().resetDelays()
        let sort = this.getSortObject(sortName)
        let warnLen = sort.getWarnLen()
        if (warnLen !== -1 && this.arrayVisualizer.getArrLength() > warnLen && !window.confirm("WARNING!!!\nThe array size(" + this.arrayVisualizer.getArrLength() + ") " +
            "more than recommended(" + warnLen + ")\nApplication may freeze\nDo you want continue?")) {
            return
        }
        this.arrayVisualizer.initPseudoArray()
        this.arrayVisualizer.setSortName(sort.getSortName())
        sort.runSort(low, high, bucketsNum)
        this.arrayVisualizer.sortClickEvent()
    }
}