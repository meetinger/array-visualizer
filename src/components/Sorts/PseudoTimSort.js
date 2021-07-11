import {Sort} from "./Sort";

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

    insertionSort(left, right) {
        for (let i = left + 1; i <= right; i++) {
            let temp = this.read(i);
            let j = i - 1;
            while (j >= left && this.read(j) > temp) {
                this.write(j + 1, this.read(j))
                j--;
            }
            this.write(j + 1, temp)
        }
    }

    merge(l, m, r) {
        let len1 = m - l + 1, len2 = r - m;
        let left = this.createAuxArray(len1);
        let right = this.createAuxArray(len2);
        for(let x = 0; x < len1; x++)
        {
            // left[x] = arr[l + x];
            this.auxWrite(x, this.read(l+x), left)
        }
        for(let x = 0; x < len2; x++)
        {
            // right[x] = arr[m + 1 + x];
            this.auxWrite(x, this.read(m + 1 + x), right)
        }

        let i = 0;
        let j = 0;
        let k = l;

        while (i < len1 && j < len2)
        {
            // if (left[i] <= right[j])
            if(this.auxRead(i, left) <= this.auxRead(j, right))
            {
                // arr[k] = left[i];
                this.write(k, this.auxRead(i, left))
                i++;
            }
            else
            {
                // arr[k] = right[j];
                this.write(k, this.auxRead(j, right))
                j++;
            }
            k++;
        }

        while (i < len1) {
            // arr[k] = left[i];
            this.write(k, this.auxRead(i, left))
            k++;
            i++;
        }

        while (j < len2) {
            this.write(k, this.auxRead(j, right))
            k++;
            j++;
        }
        this.removeAuxArray(right)
        this.removeAuxArray(left)
    }

    timSort(n)
    {
        let minRun = this.minRunLength(this.MIN_MERGE);

        for(let i = 0; i < n; i += minRun)
        {
            this.insertionSort(i, Math.min(
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
        this.timSort(high+1)
    }
}