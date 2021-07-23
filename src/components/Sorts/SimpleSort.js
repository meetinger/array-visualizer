import {Sort} from "./Sort";
import {BinaryInsertionSort} from "./BinaryInsertionSort";
import {BubbleSort} from "./BubbleSort";

export class SimpleSort extends Sort {
    constructor(arrayVisualizer) {
        super(arrayVisualizer);
        this.sortName = "SimpleSort"
        this.warnLen = 200
    }

    minRunLength(n) {
        let r = 0

        while (n >= 16) {
            r |= (n & 1)
            n >>= 1
        }

        return n + r
    }

    merge(a1, a2, b1, b2){
        let start = Math.min(a1, b1)
        let end = Math.max(a2, b2)
        let mid = b1
        for(let i = start; i < b1; ++i){
            if(this.Reads.compareValues(this.Reads.get(i), this.Reads.get(mid)) > 0){
                this.Writes.swap(i, mid)

                let first = this.Reads.get(mid)

                let k = 1

                while(this.Reads.compareValues(this.Reads.get(k+mid), first.getValue()) < 0 && k+mid < end){
                    this.Writes.write(mid+k-1 , this.Reads.get(mid+k))
                    k++
                }


                this.Writes.write(mid+k-1, first)
            }
        }
    }

    SimpleSort(low, high) {

        let len = high - low


        let minRun = this.minRunLength(len)

        let binaryInsertion = new BinaryInsertionSort(this.arrayVisualizer)

        for (let i = 0; i < len/minRun;++i){
            binaryInsertion.binaryInsertionSort(i*minRun, Math.min((i+1)*minRun-1, len)+1, i*minRun)
        }

        let curSize = minRun

        while(curSize < len){
            for(let i = 0; i < len/curSize;i+=2) {
                this.merge(curSize*i, curSize*(i+1), curSize*(i+1), curSize*(i+2))

            }
            curSize*=2
        }

    }

    runSort(low, high) {
        this.SimpleSort(low, high)
    }
}