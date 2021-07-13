import {Sort} from "./Sort";

export class LSDRadixSort extends Sort{
    constructor(arrayVisualizer) {
        super(arrayVisualizer);
        this.sortName = "LSD RadixSort"
        this.isNeedBucketsNum = false;
    }
    LSDRadixSort(len2) {
        // let idx1, idx2, idx3, len1, len2, radix, radixKey;
        let idx1, idx2, idx3, len1, radix, radixKey;
        let radices = {}, buckets = {}, num, curr;
        let currLen, radixStr, currBucket;

        len1 = this.arrLength;
        // len2 = 10;  // radix sort uses ten buckets

        // find the relevant radices to process for efficiency
        for (idx1 = 0;idx1 < len1;idx1++) {
            // radices[arr[idx1].toString().length] = 0;
            radices[this.read(idx1).toString().length] = 0;
        }

        // loop for each radix. For each radix we put all the items
        // in buckets, and then pull them out of the buckets.
        for (radix in radices) {
            // put each array item in a bucket based on its radix value
            len1 = this.arrLength;
            for (idx1 = 0;idx1 < len1;idx1++) {
                // curr = arr[idx1];
                curr = this.read(idx1)
                // item length is used to find its current radix value
                currLen = curr.toString().length;
                // only put the item in a radix bucket if the item
                // key is as long as the radix
                if (currLen >= radix) {
                    // radix starts from beginning of key, so need to
                    // adjust to get redix values from start of stringified key
                    radixKey = curr.toString()[currLen - radix];
                    // create the bucket if it does not already exist
                    if (!buckets.hasOwnProperty(radixKey)) {
                        buckets[radixKey] = [];
                    }
                    // put the array value in the bucket
                    buckets[radixKey].push(curr);
                } else {
                    if (!buckets.hasOwnProperty('0')) {
                        buckets['0'] = [];
                    }
                    buckets['0'].push(curr);
                }
            }
            // for current radix, items are in buckets, now put them
            // back in the array based on their buckets
            // this index moves us through the array as we insert items
            idx1 = 0;
            // go through all the buckets
            for (idx2 = 0;idx2 < len2;idx2++) {
                // only process buckets with items
                if (buckets[idx2] != null) {
                    currBucket = buckets[idx2];
                    // insert all bucket items into array
                    len1 = currBucket.length;
                    for (idx3 = 0;idx3 < len1;idx3++) {
                        // arr[idx1++] = currBucket[idx3];
                        this.write(idx1++, currBucket[idx3])
                    }
                }
            }
            buckets = {};
        }
    }

    runSort(low, high, bucketsNum) {
        this.LSDRadixSort(10)
    }
}