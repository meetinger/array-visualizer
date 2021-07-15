import {Sort} from "./Sort";
import {Writes} from "../ArrayAccess/Writes";

export class MergeSort extends Sort {
    constructor(arrayVisualizer) {
        super(arrayVisualizer);
        this.sortName = "MergeSort"
    }

    merge(tmp, start, mid, end) {
        if (start === mid) {
            return
        }

        this.merge(tmp, start, Math.trunc((mid + start) / 2), mid);
        this.merge(tmp, mid, Math.trunc((mid + end) / 2), end);

        let low = start
        let high = mid

        for (let nxt = 0; nxt < end - start; nxt++) {
            if (low >= mid && high >= end) break;

            if (low < mid && high >= end) {
                this.Writes.auxWrite(nxt, this.Reads.get(low++), tmp)
            } else if (low >= mid && high < end) {
                this.Writes.auxWrite(nxt, this.Reads.get(high++), tmp)
            } else if (this.Reads.compareInArr(low, high) <= 0) {
                this.Writes.auxWrite(nxt, this.Reads.get(low++), tmp)
            } else {
                this.Writes.auxWrite(nxt, this.Reads.get(high++), tmp)
            }
        }
        for (let i = 0; i < end - start; i++) {
            this.Writes.write(start + i, this.Reads.auxGet(i, tmp))
        }

    }

    MergeSort(low, high) {
        let tmp = this.Writes.createAuxArray(low - high)

        let mid = low + (Math.trunc((high - low) / 2))

        this.merge(tmp, low, mid, high+1)

        this.Writes.removeAuxArray(tmp)
    }

    runSort(low, high) {
        this.MergeSort(low, high)
    }
}