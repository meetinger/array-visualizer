import {Sort} from "./Sort";
import {InsertionSort} from "./InsertionSort";

export class PseudoTimSort extends Sort {
    MIN_MERGE
    constructor(arrayVisualizer) {
        super(arrayVisualizer);
        this.sortName = "PseudoTimSort"
        this.MIN_MERGE = 32
    }

    minRunLength(n) {
        let r = 0;
        while (n >= this.MIN_MERGE)
        {
            r |= (n & 1);
            n >>= 1;
        }
        return n + r;
    }
    merge(l, m, r) {
        let len1 = m - l + 1, len2 = r - m;
        let left = this.Writes.createAuxArray(len1);
        let right = this.Writes.createAuxArray(len2);
        for(let x = 0; x < len1; x++)
        {
            // left[x] = arr[l + x];
            this.Writes.write(x, this.Reads.get(l + x), left)
        }
        for(let x = 0; x < len2; x++)
        {
            // right[x] = arr[m + 1 + x];
            this.Writes.write(x, this.Reads.get(m + 1 + x), right)
        }

        let i = 0;
        let j = 0;
        let k = l;

        while (i < len1 && j < len2)
        {
            // if (left[i] <= right[j])
            if(this.Reads.compareValues(this.Reads.get(i, left), this.Reads.get(j, right))<=0)
            {
                // arr[k] = left[i];
                this.Writes.write(k, this.Reads.get(i, left))
                i++;
            }
            else
            {
                // arr[k] = right[j];
                this.Writes.write(k, this.Reads.get(j, right))
                j++;
            }
            k++;
        }

        while (i < len1) {
            // arr[k] = left[i];
            this.Writes.write(k, this.Reads.get(i, left))
            k++;
            i++;
        }

        while (j < len2) {
            this.Writes.write(k, this.Reads.get(j, right))
            k++;
            j++;
        }
        this.Writes.removeAuxArray(right)
        this.Writes.removeAuxArray(left)
    }

    pseudoTimSort(n)
    {
        let minRun = this.minRunLength(this.MIN_MERGE);

        for(let i = 0; i < n; i += minRun)
        {
            let insertionSort = new InsertionSort(this.arrayVisualizer)

            insertionSort.runSort(i, 1+Math.min(
                (i + this.MIN_MERGE - 1), (n - 1)));
        }

        for(let size = minRun; size < n; size = 2 * size) {
            for(let left = 0; left < n; left += 2 * size) {
                let mid = left + size - 1;
                let right = Math.min((left + 2 * size - 1), (n - 1));
                if(mid < right) {
                    this.merge(left, mid, right);
                }
            }
        }
    }

    runSort(low, high) {
        this.pseudoTimSort(high+1)
    }
}