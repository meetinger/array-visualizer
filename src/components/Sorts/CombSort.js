import {Sort} from "./Sort";

export class CombSort extends Sort{
    constructor(arrayVisualizer) {
        super(arrayVisualizer);
        this.sortName = "CombSort"
    }
    CombSort() {
        let len = this.arrLength;
        let factor = 1.2473309
        let step = len - 1
        while(step>=1){
            for (let i = 0; i + step < len; i++) {
                if (this.Reads.compareInArr(i, i+step)>0)
                {
                    this.Writes.swap(i, i+step)
                }
            }
            step = Math.trunc(step/factor);
        }

    }

    runSort(low, high) {
        this.CombSort(low, high)
    }
}