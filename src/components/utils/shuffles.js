import {randomInt} from "./utils";

export let shuffles = {
    fullShuffle: function (len) {
        let instructions = []
        for (let i = 0; i < len; ++i) {
            let randomIndex = randomInt(i, len)
            instructions.push(
                ["swap", i, randomIndex]
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
                ["swap", randomIndexA, randomIndexB]
            )
        }
        return instructions
    }
}