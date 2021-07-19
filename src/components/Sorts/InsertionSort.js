import {Sort} from "./Sort";

export class InsertionSort extends Sort{
    constructor(arrayVisualizer) {
        super(arrayVisualizer);
        this.sortName = "InsertionSort"
    }

    InsertionSort(start, end) {
        let pos;
        let current;

        for(let i = start; i < end; i++) {
            current = this.Reads.get(i);
            pos = i - 1;

            while(pos >= start && this.Reads.compareValues(this.Reads.get(pos), current) > 0){
                this.Writes.write(pos + 1,this.Reads.get(pos));
                pos--;
            }
            this.Writes.write(pos + 1, current);
        }
    }


    runSort(low, high) {
        this.InsertionSort(low, high)
    }
}