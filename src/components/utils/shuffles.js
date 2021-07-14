import {randomInt} from "./utils";

export let shuffles = {
    FullShuffle: function (len) {
        let instructions = []
        for (let i = 0; i < len; ++i) {
            let randomIndex = randomInt(i, len)
            instructions.push(
                {
                    cmd: "swap",
                    a: i,
                    b:randomIndex
                }
            )
        }
        return instructions
    },

    AlmostSorted: function (len) {
        let instructions = []
        const AMOUNT = 0.1
        for (let i = 0; i < len * AMOUNT; ++i) {
            let randomIndexA = randomInt(i, len)
            let randomIndexB = randomInt(i, len)
            instructions.push(
                {
                    cmd: "swap",
                    a: randomIndexA,
                    b:randomIndexB
                }
            )
        }
        return instructions
    },

    Reverse: function (len){
        let instructions = []
        for (let i = 0; i < Math.trunc(len/2); ++i){
            instructions.push(
                {
                    cmd: "swap",
                    a: i,
                    b: len-i-1
                }
            )
        }
        return instructions
    },
    BlockShuffle: function (len) {
        const GAP_FACTOR = 10
        let gap = len/GAP_FACTOR
        let instructions = []
        for (let i = 0; i < GAP_FACTOR-1; ++i) {
            let factor = randomInt(i+1, GAP_FACTOR)
            for(let j = 0; j < gap; ++j){
                instructions.push(
                    {
                        cmd: "swap",
                        a: j+i*gap,
                        b: j+factor*gap
                    }
                )
            }
        }
        return instructions
    }
}