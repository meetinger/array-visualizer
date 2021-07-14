import {randomInt} from "./utils";

export let shuffles = {
    FullShuffle: function (arrayVisualizer) {
        let len = arrayVisualizer.getArrLength()
        for (let i = 0; i < len; ++i) {
            let randomIndex = randomInt(i, len)
            arrayVisualizer.getWrites().swapWithDelay(i, randomIndex, arrayVisualizer.getMainArray(), true, arrayVisualizer.getDelays().getDelayInc()/5, true)
        }
        // return instructions
    },

    AlmostSorted: function (arrayVisualizer) {
        let len = arrayVisualizer.getArrLength()
        const AMOUNT = 0.1
        for (let i = 0; i < len * AMOUNT; ++i) {
            let randomIndexA = randomInt(i, len)
            let randomIndexB = randomInt(i, len)
            arrayVisualizer.getWrites().swapWithDelay(randomIndexA, randomIndexB, arrayVisualizer.getMainArray(), true, arrayVisualizer.getDelays().getDelayInc()/5, true)
        }
    },
    //
    Reverse: function (arrayVisualizer){
        let len = arrayVisualizer.getArrLength()
        for (let i = 0; i < Math.trunc(len/2); ++i){
            arrayVisualizer.getWrites().swapWithDelay(i, len-i-1, arrayVisualizer.getMainArray(), true, arrayVisualizer.getDelays().getDelayInc()/5, true)
        }
    },
    BlockShuffle: function (arrayVisualizer) {
        const GAP_FACTOR = 10
        let len = arrayVisualizer.getArrLength()
        let gap = len/GAP_FACTOR
        let instructions = []
        for (let i = 0; i < GAP_FACTOR-1; ++i) {
            let factor = randomInt(i+1, GAP_FACTOR)
            for(let j = 0; j < gap; ++j){
                arrayVisualizer.getWrites().swapWithDelay(j+i*gap, j+factor*gap, arrayVisualizer.getMainArray(), true, arrayVisualizer.getDelays().getDelayInc()/5, true)
            }
        }
        return instructions
    },
    PipeOrgan: function (arrayVisualizer){
        let len = arrayVisualizer.getArrLength()
        let Reads = arrayVisualizer.getReads()
        let temp = new Array(len);
        for(let i = 0, j = 0; i < len; i+=2){
            temp[j++] = Reads.get(i, arrayVisualizer.getMainArray())
        }
        for(let i = 1, j = len; i < len ;i+=2) {
            temp[--j] = Reads.get(i, arrayVisualizer.getMainArray())
        }
        for(let i = 0; i < len; i++){
            arrayVisualizer.getWrites().writeWithDelay(i, temp[i], arrayVisualizer.getMainArray(), true, arrayVisualizer.getDelays().getDelayInc()/5, true)
        }
    },
    InversedPipeOrgan: function (arrayVisualizer){
        let len = arrayVisualizer.getArrLength()
        let Reads = arrayVisualizer.getReads()
        let temp = new Array(len);
        for(let i = 0, j = 0; i < len; i+=2){
            temp[j++] = Reads.get(len-i-1, arrayVisualizer.getMainArray())
        }
        for(let i = 1, j = len; i < len ;i+=2) {
            temp[--j] = Reads.get(len-i-1, arrayVisualizer.getMainArray())
        }
        for(let i = 0; i < len; i++){
            arrayVisualizer.getWrites().writeWithDelay(i, temp[i], arrayVisualizer.getMainArray(), true, arrayVisualizer.getDelays().getDelayInc()/5, true)
        }
    }
}