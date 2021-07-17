import {Sort} from "./Sort";
import {Writes} from "../ArrayAccess/Writes";

export class GnomeSort extends Sort {
    constructor(arrayVisualizer) {
        super(arrayVisualizer);
        this.sortName = "GnomeSort"
    }

    GnomeSort() {
        let len = this.arrLength;
        for (let i = 1; i < len;) {
            if (this.Reads.compareInArr(i, i - 1) >= 0) {
                i++
            } else {
                this.Writes.swap(i, i - 1)
                if (i > 1) {
                    i--;
                }
            }
        }
    }

    runSort(low, high) {
        this.GnomeSort(low, high)
    }
}