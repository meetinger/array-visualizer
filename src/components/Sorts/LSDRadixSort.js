import {Sort} from "./Sort";
import {Element} from "../classes/Element";

export class LSDRadixSort extends Sort {
    constructor(arrayVisualizer) {
        super(arrayVisualizer);
        this.sortName = "LSD RadixSort"
        this.isNeedBucketsNum = true;
    }

    LSDRadixSort(bucketsNum) {
        let len = this.arrayVisualizer.getArrLength()
        let max = this.Reads.readValue(0);
        for (let i = 1; i < len; ++i) {
            let tmp = this.Reads.readValue(i)
            if (max < tmp) {
                max = tmp
            }
        }
        let highestPower = Math.log(max) / Math.log(bucketsNum);

        let registers = new Array(bucketsNum)
        for (let i = 0; i < bucketsNum; i++) {
            registers[i] = [];
        }

        for (let p = 0; p <= highestPower; p++) {
            for (let i = 0; i < len; i++) {
                let stabVal = Math.max(0, Math.min(this.Reads.readValue(i), len - 1))
                let digit = Math.trunc(stabVal / (bucketsNum ** p) % bucketsNum)
                // console.log(digit)
                registers[digit].push(this.Reads.get(i))
                //PseudoWrite
            }


            let tempArray = this.Writes.createAuxArray(len)
            let tempWrite = new Array(len)
            let radix = registers.length


            let total = 0;
            for (let index = 0; index < registers.length; index++) {
                for (let i = 0; i < registers[index].length; i++) {
                    this.Writes.write(total++, registers[index][i], tempArray)
                }
                registers[index] = []
            }

            for (let i = 0; i < len; i++) {
                let register = i % radix
                let pos = (register * Math.trunc(len / radix) + Math.trunc(i / radix))

                this.Writes.write(pos, this.Reads.get(pos, tempArray))
                tempWrite[pos] = true
            }
            for (let i = 0; i < len; i++) {
                if (!tempWrite[i]) {
                    this.Writes.write(i, this.Reads.get(i, tempArray))
                }
            }

            this.Writes.removeAuxArray(tempArray)

        }

    }

    runSort(low, high, bucketsNum) {
        this.LSDRadixSort(bucketsNum)
    }
}