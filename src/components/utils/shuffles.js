import {randomInt} from "./utils";

export let shuffles = {
    fullShuffle: function (len) {
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

    stableShuffle: function (len) {
        let instructions = []
        for (let i = 0; i < len; ++i) {
            let randomIndex = randomInt(i+1, len)
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

    almostSorted: function (len) {
        let instructions = []
        const amount = 0.1
        for (let i = 0; i < len * amount; ++i) {
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

    reverse: function (len){
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
    }

}