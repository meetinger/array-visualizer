import {Sort} from "./Sort";

export class BubbleSort extends Sort{
    constructor(arrayVisualizer) {
        super(arrayVisualizer);
        this.sortName = "BubbleSort"
        this.warnLen = 200
    }
    BubbleSort(low, high) {
        let len = high-low+1
        let swapped = false
        for(let i = 0; i < len; ++i){
            swapped = false
            for(let j = low; j < high-i-1;++j){
                if(this.Reads.compareInArr(j, j+1) > 0){
                    this.Writes.swap(j, j+1)
                    swapped=true
                }
            }
            if(!swapped){
                break
            }
        }
    }

    runSort(low, high) {
        this.BubbleSort(low, high+1)
    }
}