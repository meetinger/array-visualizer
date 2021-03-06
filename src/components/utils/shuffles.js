import {randomInt} from "./utils";
import {HeapSort} from "../Sorts/HeapSort";
import {GAP_FACTOR} from "./initFunctions";

export let shuffles = {
    FullShuffle: function (arrayVisualizer) {
        let len = arrayVisualizer.getArrLength()
        for (let i = 0; i < len; ++i) {
            let randomIndex = randomInt(i, len)
            arrayVisualizer.getWrites().swapWithDelay(i, randomIndex, arrayVisualizer.getArray(-1), true, arrayVisualizer.getDelays().getDelayInc()/5, true)
        }
        // return instructions
    },

    AlmostSorted: function (arrayVisualizer) {
        let len = arrayVisualizer.getArrLength()
        const AMOUNT = 0.1
        for (let i = 0; i < len * AMOUNT; ++i) {
            let randomIndexA = randomInt(i, len)
            let randomIndexB = randomInt(i, len)
            arrayVisualizer.getWrites().swapWithDelay(randomIndexA, randomIndexB, arrayVisualizer.getArray(-1), true, arrayVisualizer.getDelays().getDelayInc()/5, true)
        }
    },
    Reverse: function (arrayVisualizer){
        let len = arrayVisualizer.getArrLength()
        for (let i = 0; i < Math.trunc(len/2); ++i){
            arrayVisualizer.getWrites().swapWithDelay(i, len-i-1, arrayVisualizer.getArray(-1), true, arrayVisualizer.getDelays().getDelayInc()/5, true)
        }
    },
    BlockShuffle: function (arrayVisualizer) {
        let len = arrayVisualizer.getArrLength()
        let gap = len/GAP_FACTOR
        for (let i = 0; i < GAP_FACTOR-1; ++i) {
            let factor = randomInt(i+1, GAP_FACTOR)
            for(let j = 0; j < gap; ++j){
                arrayVisualizer.getWrites().swapWithDelay(j+i*gap, j+factor*gap, arrayVisualizer.getArray(-1), true, arrayVisualizer.getDelays().getDelayInc()/5, true)
            }
        }
    },
    PipeOrgan: function (arrayVisualizer){
        let len = arrayVisualizer.getArrLength()
        let Reads = arrayVisualizer.getReads()
        let temp = new Array(len);
        for(let i = 0, j = 0; i < len; i+=2){
            temp[j++] = Reads.get(i, -1)
        }
        for(let i = 1, j = len; i < len ;i+=2) {
            temp[--j] = Reads.get(i, -1)
        }
        for(let i = 0; i < len; i++){
            arrayVisualizer.getWrites().writeWithDelay(i, temp[i], arrayVisualizer.getArray(-1), true, arrayVisualizer.getDelays().getDelayInc()/5, true)
        }
    },
    InversedPipeOrgan: function (arrayVisualizer){
        let len = arrayVisualizer.getArrLength()
        let Reads = arrayVisualizer.getReads()
        let temp = new Array(len);
        for(let i = 0, j = 0; i < len; i+=2){
            temp[j++] = Reads.get(len-i-1, -1)
        }
        for(let i = 1, j = len; i < len ;i+=2) {
            temp[--j] = Reads.get(len-i-1, -1)
        }
        for(let i = 0; i < len; i++){
            arrayVisualizer.getWrites().writeWithDelay(i, temp[i], arrayVisualizer.getArray(-1), true, arrayVisualizer.getDelays().getDelayInc()/5, true)
        }
    },
    Heap: function (arrayVisualizer){
        let n = arrayVisualizer.getArrLength()
        arrayVisualizer.initPseudoArray()
        let heapSort = new HeapSort(arrayVisualizer)
        heapSort.heapify(0, n)
    },
    QuickSortKiller: function (arrayVisualizer){
        let len = arrayVisualizer.getArrLength()
        for(let j = len-len%2-2, i = j-1; i >= 0; i-=2, j--) {
            arrayVisualizer.getWrites().swapWithDelay(i, j, arrayVisualizer.getArray(-1), true, arrayVisualizer.getDelays().getDelayInc() / 5, true)
        }
    }
}