import {Delays} from "../ArrayAccess/Delays";

export class Sorts {
    arrayVisualizer;
    sortsPaths
    Delays
    Sounds
    Marks


    constructor(arrayVisualizer) {
        this.arrayVisualizer = arrayVisualizer

        this.Delays = arrayVisualizer.getDelays()
        this.Sounds = arrayVisualizer.getSounds()
        this.Marks = arrayVisualizer.getMarks()

        this.sortsPaths = ["BubbleSort", "MergeSort", "LLQuickSort", "LRQuickSort", "HeapSort",
            "DualPivotQuickSort", "InsertionSort", "SelectionSort", "GnomeSort", "TimSort", "PseudoTimSort",
            "IntroSort", "LSDRadixSort", "BitonicSort", "SlowSort", "StoogeSort", "GrailSort"]

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
            bucketsNum = parseInt(prompt("Enter the buckets num:", "4"))
            if (isNaN(bucketsNum)) {
                return;
            }
            if (bucketsNum < 2){
                alert("WARNING!!!\nUncorrected buckets num was entered!\nThe buckets num will be set to 2")
            }
        }
        bucketsNum = Math.max(2, bucketsNum)

        if (warnLen !== -1 && this.arrayVisualizer.getArrLength() > warnLen &&
            !window.confirm("WARNING!!!\nThe array size(" + this.arrayVisualizer.getArrLength() + ") " +
                "more than recommended(" + warnLen + ")\nApplication may freeze\nDo you want continue?")) {
            return

        }

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
        this.arrayVisualizer.backupArray()
        sort.runSort(low, high, bucketsNum, bufferSize)
        // this.arrayVisualizer.sortClickEvent()
        // console.log(this.Delays.getDelays().Write)
        this.Delays.push(setTimeout(() => (this.checkSort()), this.Delays.getDelays().Write + this.Delays.getDelayInc() * 5))
    }

    checkSort() {
        let isSorted = true
        let array = this.arrayVisualizer.getMainArray()
        for (let i = 1; i < array.length; ++i) {
            if (array[i - 1].getValue() > array[i].getValue()) {
                isSorted = false
                break;
            }
        }
        for (let i = 0; i < array.length; ++i) {
            this.Delays.push(setTimeout(() => {
                if (isSorted) {
                    this.Sounds.playSound(array[i].getValue())
                    this.Marks.mark(i, {type: "Sorted", color: [0, 255, 0]}, true)
                } else {
                    this.Marks.mark(i, {type: "Default", color: [255, 0, 0]}, true)
                }
            }, this.Delays.incDelay("Other", this.Delays.getDelayInc() / 3)))
        }
        this.Delays.push(setTimeout(() => {
            this.Marks.clearAllMarks()
            this.Delays.resetDelays()
            this.arrayVisualizer.forceMainArrayUpdate()
        }, (this.Delays.getDelayInc()) * (array.length + 2) / 3))

    }
}