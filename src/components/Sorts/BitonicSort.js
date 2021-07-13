import {Sort} from "./Sort";

export class BitonicSort extends Sort{
    constructor(arrayVisualizer) {
        super(arrayVisualizer);
        this.sortName = "BitonicSort"
    }
    // kernel(p, q) {
    //     const d = 1 << (p - q);
    //
    //     for (let i = 0; i < this.arrLength; i++) {
    //         const up = ((i >> p) & 2) === 0;
    //         // if ((i & d) === 0 && (x[i] > x[i | d]) === up) {
    //         if ((i & d) === 0 && ((this.Reads.compare(i, i | d, ">")) === up)) {
    //             // const tmp = x[i];
    //             // x[i] = x[i | d];
    //             // x[i | d] = tmp;
    //             this.Writes.swap(i, i | d)
    //         }
    //     }
    // }
    //
    // bitonicSort(n) {
    //     for (let i = 0; i < n; i++) {
    //         for(let j = 0; j <= i; j++) {
    //             this.kernel(i, j);
    //         }
    //     }
    // }
    bitonicSort(sortLength){
        let i, j, k;

        for(k = 2; k < sortLength*2; k = 2 * k) {
            let m = (Math.trunc((sortLength + (k - 1)) / k) % 2) !== 0;

            for(j = k >> 1; j > 0; j = j >> 1) {
                for(i = 0; i < sortLength; i++) {
                    let ij = i ^ j;

                    if((ij) > i && ij < sortLength) {
                        if((((i & k) === 0) === m) && this.Reads.compare(i, ij, ">"))
                            this.Writes.swap(i, ij);
                        if((((i & k) !== 0) === m) && this.Reads.compare(i, ij, "<"))
                            this.Writes.swap(i, ij);
                    }
                }
            }
        }
    }
    runSort(low, high, bucketsNum) {
        // this.bitonicSort(Math.trunc(Math.log2(high-1)))
        this.bitonicSort(high+1)
    }

}
