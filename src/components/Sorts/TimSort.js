import {Sort} from "./Sort";

/**
 * Default minimum size of a run.
 */
const DEFAULT_MIN_MERGE = 32

/**
 * Minimum ordered subsequece required to do galloping.
 */
const DEFAULT_MIN_GALLOPING = 7

/**
 * Default tmp storage length. Can increase depending on the size of the
 * smallest run to merge.
 */
const DEFAULT_TMP_STORAGE_LENGTH = 256

/**
 * Pre-computed powers of 10 for efficient lexicographic comparison of
 * small integers.
 */
const POWERS_OF_TEN = [1e0, 1e1, 1e2, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9]

let results

/**
 * Estimate the logarithm base 10 of a small integer.
 *
 * @param {number} x - The integer to estimate the logarithm of.
 * @return {number} - The estimated logarithm of the integer.
 */
const log10 = x => x < 1e5
    ? x < 1e2
        ? x < 1e1
            ? 0
            : 1
        : x < 1e4
            ? x < 1e3
                ? 2
                : 3
            : 4
    : x < 1e7
        ? x < 1e6
            ? 5
            : 6
        : x < 1e9
            ? x < 1e8
                ? 7
                : 8
            : 9

/**
 * Default alphabetical comparison of items.
 *
 * @param {string|object|number} a - First element to compare.
 * @param {string|object|number} b - Second element to compare.
 * @return {number} - A positive number if a.toString() > b.toString(), a
 * negative number if .toString() < b.toString(), 0 otherwise.
 */
function alphabeticalCompare(a, b) {
    if (a === b) {
        return 0
    }

    if (~~a === a && ~~b === b) {
        if (a === 0 || b === 0) {
            return a < b ? -1 : 1
        }

        if (a < 0 || b < 0) {
            if (b >= 0) {
                return -1
            }

            if (a >= 0) {
                return 1
            }

            a = -a
            b = -b
        }

        const al = log10(a)
        const bl = log10(b)

        let t = 0

        if (al < bl) {
            a *= POWERS_OF_TEN[bl - al - 1]
            b /= 10
            t = -1
        } else if (al > bl) {
            b *= POWERS_OF_TEN[al - bl - 1]
            a /= 10
            t = 1
        }

        if (a === b) {
            return t
        }

        return a < b ? -1 : 1
    }

    const aStr = String(a)
    const bStr = String(b)

    if (aStr === bStr) {
        return 0
    }

    return aStr < bStr ? -1 : 1
}

/**
 * Compute minimum run length for TimSort
 *
 * @param {number} n - The size of the array to sort.
 */
function minRunLength(n) {
    let r = 0

    while (n >= DEFAULT_MIN_MERGE) {
        r |= (n & 1)
        n >>= 1
    }

    return n + r
}

/**
 * Counts the length of a monotonically ascending or strictly monotonically
 * descending sequence (run) starting at array[lo] in the range [lo, hi). If
 * the run is descending it is made ascending.
 *
 * @param {array} array - The array to reverse.
 * @param {number} lo - First element in the range (inclusive).
 * @param {number} hi - Last element in the range.
 * @param {function} compare - Item comparison function.
 * @return {number} - The length of the run.
 */

export class TimSort extends Sort {
    constructor(arrayVisualizer) {
        super(arrayVisualizer);

        this.minGallop = DEFAULT_MIN_GALLOPING

        this.tmpStorageLength = this.arrLength < 2 * DEFAULT_TMP_STORAGE_LENGTH
            ? this.arrLength >>> 1
            : DEFAULT_TMP_STORAGE_LENGTH

        // this.tmp = new Array(this.tmpStorageLength)
        this.tmp = this.Writes.createAuxArray(this.tmpStorageLength)

        this.stackLength = this.arrLength < 120
            ? 5
            : this.arrLength < 1542
                ? 10
                : this.arrLength < 119151
                    ? 19
                    : 40

        this.runStart = new Array(this.stackLength)
        this.runLength = new Array(this.stackLength)

        this.stackSize = 0
        this.sortName = "TimSort"
    }

    makeAscendingRun(lo, hi) {
        let runHi = lo + 1

        if (runHi === hi) {
            return 1
        }

        // Descending
        // if (compare(array[runHi++], array[lo]) < 0) {
        if (this.Reads.compareInArr(runHi++, lo)<0) {
            // while (runHi < hi && compare(array[runHi], array[runHi - 1]) < 0) {
            while (runHi < hi && this.Reads.compareInArr(runHi, runHi - 1)<0) {
                runHi++
            }

            // this.reverseRun(array, lo, runHi)
            this.reverseRun(lo, runHi)
            // reverseRun(results, lo, runHi)
            // Ascending
        } else {
            // while (runHi < hi && compare(array[runHi], array[runHi - 1]) >= 0) {
            while (runHi < hi && this.Reads.compareInArr(runHi, runHi - 1)>=0) {
                runHi++
            }
        }

        return runHi - lo
    }

    /**
     * Reverse an array in the range [lo, hi).
     *
     * @param {array} array - The array to reverse.
     * @param {number} lo - First element in the range (inclusive).
     * @param {number} hi - Last element in the range.
     */


    reverseRun(lo, hi) {
        hi--

        while (lo < hi) {
            // const t = array[lo]
            // array[lo++] = array[hi]
            // array[hi--] = t
            const t = this.Reads.get(lo)
            this.Writes.write(lo++, this.Reads.get(hi))
            this.Writes.write(hi--, t)
        }
    }

    /**
     * Perform the binary sort of the array in the range [lo, hi) where start is
     * the first element possibly out of order.
     *
     * @param {array} array - The array to sort.
     * @param {number} lo - First element in the range (inclusive).
     * @param {number} hi - Last element in the range.
     * @param {number} start - First element possibly out of order.
     * @param {} compare - Item comparison function.
     */


    binaryInsertionSort(lo, hi, start) {
        if (start === lo) {
            start++
        }

        for (; start < hi; start++) {
            // const pivot = array[start]
            const pivot = this.Reads.get(start)

            // const pivotIndex = results[start]

            // Ranges of the array where pivot belongs
            let left = lo
            let right = start

            /*
             *   pivot >= array[i] for i in [lo, left)
             *   pivot <  array[i] for i in  in [right, start)
             */
            while (left < right) {
                const mid = (left + right) >>> 1

                // if (compare(pivot, array[mid]) < 0) {
                if (pivot.getValue() < this.Reads.readValue(mid)) {
                    right = mid
                } else {
                    left = mid + 1
                }
            }

            /*
             * Move elements right to make room for the pivot. If there are elements
             * equal to pivot, left points to the first slot after them: this is also
             * a reason for which TimSort is stable
             */
            let n = start - left
            // Switch is just an optimization for small arrays
            switch (n) {
                case 3:
                    // array[left + 3] = array[left + 2]
                    this.Writes.write(left + 3, this.Reads.get(left + 2))
                /* falls through */
                case 2:
                    // array[left + 2] = array[left + 1]
                    this.Writes.write(left + 2, this.Reads.get(left + 1))
                /* falls through */
                case 1:
                    // array[left + 1] = array[left]
                    this.Writes.write(left + 1, this.Reads.get(left))
                    break
                default:
                    while (n > 0) {
                        // array[left + n] = array[left + n - 1]
                        this.Writes.write(left + n, this.Reads.get(left + n - 1))
                        n--
                    }
            }

            // array[left] = pivot
            this.Writes.write(left, pivot)
            // results[left] = pivotIndex
        }
    }

    /**
     * Find the position at which to insert a value in a sorted range. If the range
     * contains elements equal to the value the leftmost element index is returned
     * (for stability).
     *
     * @param {number} value - Value to insert.
     * @param {array} array - The array in which to insert value.
     * @param {number} start - First element in the range.
     * @param {number} length - Length of the range.
     * @param {number} hint - The index at which to begin the search.
     * @param {function} compare - Item comparison function.
     * @return {number} - The index where to insert value.
     */


    gallopLeft(value, isAux, start, length, hint) {
        let lastOffset = 0
        let maxOffset = 0
        let offset = 1
        if (!isAux) {
            // if (compare(value, array[start + hint]) > 0) {
            if (value > this.Reads.readValue(start + hint)) {
                maxOffset = length - hint

                while (
                    offset < maxOffset
                    // && compare(value, array[start + hint + offset]) > 0
                    && value > this.Reads.readValue(start + hint + offset)
                    ) {
                    lastOffset = offset
                    offset = (offset << 1) + 1

                    if (offset <= 0) {
                        offset = maxOffset
                    }
                }

                if (offset > maxOffset) {
                    offset = maxOffset
                }

                // Make offsets relative to start
                lastOffset += hint
                offset += hint

                // value <= array[start + hint]
            } else {
                maxOffset = hint + 1
                while (
                    offset < maxOffset
                    // && compare(value, array[start + hint - offset]) <= 0
                    // && value <= this.Reads.readValue(start + hint + offset)
                    && value <= this.Reads.readValue(start + hint - offset)
                    ) {
                    lastOffset = offset
                    offset = (offset << 1) + 1

                    if (offset <= 0) {
                        offset = maxOffset
                    }
                }
                if (offset > maxOffset) {
                    offset = maxOffset
                }

                // Make offsets relative to start
                const tmp = lastOffset
                lastOffset = hint - offset
                offset = hint - tmp
            }

            /*
             * Now array[start+lastOffset] < value <= array[start+offset], so value
             * belongs somewhere in the range (start + lastOffset, start + offset]. Do a
             * binary search, with invariant array[start + lastOffset - 1] < value <=
             * array[start + offset].
             */
            lastOffset++
            while (lastOffset < offset) {
                const m = lastOffset + ((offset - lastOffset) >>> 1)

                // if (compare(value, array[start + m]) > 0) {
                if (value > this.Reads.readValue(start + m)) {
                    lastOffset = m + 1
                } else {
                    offset = m
                }
            }
        } else {
            // if (compare(value, array[start + hint]) > 0) {
            if (value > this.Reads.auxReadValue(start + hint, this.tmp)) {
                maxOffset = length - hint

                while (
                    offset < maxOffset
                    // && compare(value, array[start + hint + offset]) > 0
                    && value > this.Reads.auxReadValue(start + hint + offset, this.tmp)
                    ) {
                    lastOffset = offset
                    offset = (offset << 1) + 1

                    if (offset <= 0) {
                        offset = maxOffset
                    }
                }

                if (offset > maxOffset) {
                    offset = maxOffset
                }

                // Make offsets relative to start
                lastOffset += hint
                offset += hint

                // value <= array[start + hint]
            } else {
                maxOffset = hint + 1
                while (
                    offset < maxOffset
                    // && compare(value, array[start + hint - offset]) <= 0
                    // && value <= this.Reads.auxRead(start + hint + offset, this.tmp)
                    && value <= this.Reads.auxReadValue(start + hint - offset, this.tmp)
                    ) {
                    lastOffset = offset
                    offset = (offset << 1) + 1

                    if (offset <= 0) {
                        offset = maxOffset
                    }
                }
                if (offset > maxOffset) {
                    offset = maxOffset
                }

                // Make offsets relative to start
                const tmp = lastOffset
                lastOffset = hint - offset
                offset = hint - tmp
            }

            /*
             * Now array[start+lastOffset] < value <= array[start+offset], so value
             * belongs somewhere in the range (start + lastOffset, start + offset]. Do a
             * binary search, with invariant array[start + lastOffset - 1] < value <=
             * array[start + offset].
             */
            lastOffset++
            while (lastOffset < offset) {
                const m = lastOffset + ((offset - lastOffset) >>> 1)

                // if (compare(value, array[start + m]) > 0) {
                if (value > this.Reads.auxReadValue(start + m, this.tmp)) {
                    lastOffset = m + 1
                } else {
                    offset = m
                }
            }
        }
        return offset
    }

    /**
     * Find the position at which to insert a value in a sorted range. If the range
     * contains elements equal to the value the rightmost element index is returned
     * (for stability).
     *
     * @param {number} value - Value to insert.
     * @param {array} array - The array in which to insert value.
     * @param {number} start - First element in the range.
     * @param {number} length - Length of the range.
     * @param {number} hint - The index at which to begin the search.
     * @param {function} compare - Item comparison function.
     * @return {number} - The index where to insert value.
     */


    gallopRight(value, isAux, start, length, hint) {
        let lastOffset = 0
        let maxOffset = 0
        let offset = 1

        if (!isAux) {
            // if (compare(value, array[start + hint]) < 0) {
            if (value < this.Reads.readValue(start + hint)) {
                maxOffset = hint + 1

                while (
                    offset < maxOffset
                    // && compare(value, array[start + hint - offset]) < 0
                    && value < this.Reads.readValue(start + hint - offset)
                    ) {
                    lastOffset = offset
                    offset = (offset << 1) + 1

                    if (offset <= 0) {
                        offset = maxOffset
                    }
                }

                if (offset > maxOffset) {
                    offset = maxOffset
                }

                // Make offsets relative to start
                const tmp = lastOffset
                lastOffset = hint - offset
                offset = hint - tmp

                // value >= array[start + hint]
            } else {
                maxOffset = length - hint

                while (
                    offset < maxOffset
                    // && compare(value, array[start + hint + offset]) >= 0
                    && value >= this.Reads.readValue(start + hint + offset)
                    ) {
                    lastOffset = offset
                    offset = (offset << 1) + 1

                    if (offset <= 0) {
                        offset = maxOffset
                    }
                }

                if (offset > maxOffset) {
                    offset = maxOffset
                }

                // Make offsets relative to start
                lastOffset += hint
                offset += hint
            }

            /*
             * Now array[start+lastOffset] < value <= array[start+offset], so value
             * belongs somewhere in the range (start + lastOffset, start + offset]. Do a
             * binary search, with invariant array[start + lastOffset - 1] < value <=
             * array[start + offset].
             */
            lastOffset++

            while (lastOffset < offset) {
                const m = lastOffset + ((offset - lastOffset) >>> 1)

                // if (compare(value, array[start + m]) < 0) {
                if (value < this.Reads.readValue(start + m)) {
                    offset = m
                } else {
                    lastOffset = m + 1
                }
            }

        } else {
            //AUX
            // if (compare(value, array[start + hint]) < 0) {
            if (value < this.Reads.auxReadValue(start + hint, this.tmp)) {
                maxOffset = hint + 1

                while (
                    offset < maxOffset
                    // && compare(value, array[start + hint - offset]) < 0
                    && value < this.Reads.auxReadValue(start + hint - offset, this.tmp)
                    ) {
                    lastOffset = offset
                    offset = (offset << 1) + 1

                    if (offset <= 0) {
                        offset = maxOffset
                    }
                }

                if (offset > maxOffset) {
                    offset = maxOffset
                }

                // Make offsets relative to start
                const tmp = lastOffset
                lastOffset = hint - offset
                offset = hint - tmp

                // value >= array[start + hint]
            } else {
                maxOffset = length - hint

                while (
                    offset < maxOffset
                    // && compare(value, array[start + hint + offset]) >= 0
                    && value >= this.Reads.auxReadValue(start + hint + offset, this.tmp)
                    ) {
                    lastOffset = offset
                    offset = (offset << 1) + 1

                    if (offset <= 0) {
                        offset = maxOffset
                    }
                }

                if (offset > maxOffset) {
                    offset = maxOffset
                }

                // Make offsets relative to start
                lastOffset += hint
                offset += hint
            }

            /*
             * Now array[start+lastOffset] < value <= array[start+offset], so value
             * belongs somewhere in the range (start + lastOffset, start + offset]. Do a
             * binary search, with invariant array[start + lastOffset - 1] < value <=
             * array[start + offset].
             */
            lastOffset++

            while (lastOffset < offset) {
                const m = lastOffset + ((offset - lastOffset) >>> 1)

                // if (compare(value, array[start + m]) < 0) {
                if (value < this.Reads.auxReadValue(start + m, this.tmp)) {
                    offset = m
                } else {
                    lastOffset = m + 1
                }
            }
        }

        return offset
    }


    /**
     * Push a new run on TimSort's stack.
     *
     * @param {number} runStart - Start index of the run in the original array.
     * @param {number} runLength - Length of the run;
     */
    pushRun(runStart, runLength) {
        this.runStart[this.stackSize] = runStart
        this.runLength[this.stackSize] = runLength
        this.stackSize += 1
    }

    /**
     * Merge runs on TimSort's stack so that the following holds for all i:
     * 1) runLength[i - 3] > runLength[i - 2] + runLength[i - 1]
     * 2) runLength[i - 2] > runLength[i - 1]
     */
    mergeRuns() {
        while (this.stackSize > 1) {
            let n = this.stackSize - 2

            if (
                (
                    n >= 1
                    && this.runLength[n - 1] <= this.runLength[n] + this.runLength[n + 1]
                )
                || (
                    n >= 2
                    && this.runLength[n - 2] <= this.runLength[n] + this.runLength[n - 1]
                )
            ) {
                if (this.runLength[n - 1] < this.runLength[n + 1]) {
                    n--
                }
            } else if (this.runLength[n] > this.runLength[n + 1]) {
                break
            }
            this.mergeAt(n)
        }
    }

    /**
     * Merge all runs on TimSort's stack until only one remains.
     */
    forceMergeRuns() {
        while (this.stackSize > 1) {
            let n = this.stackSize - 2

            if (n > 0 && this.runLength[n - 1] < this.runLength[n + 1]) {
                n--
            }

            this.mergeAt(n)
        }
    }

    /**
     * Merge the runs on the stack at positions i and i+1. Must be always be called
     * with i=stackSize-2 or i=stackSize-3 (that is, we merge on top of the stack).
     *
     * @param {number} i - Index of the run to merge in TimSort's stack.
     */
    mergeAt(i) {
        let start1 = this.runStart[i]
        let length1 = this.runLength[i]
        const start2 = this.runStart[i + 1]
        let length2 = this.runLength[i + 1]

        this.runLength[i] = length1 + length2

        if (i === this.stackSize - 3) {
            this.runStart[i + 1] = this.runStart[i + 2]
            this.runLength[i + 1] = this.runLength[i + 2]
        }

        this.stackSize--

        /*
         * Find where the first element in the second run goes in run1. Previous
         * elements in run1 are already in place
         */
        // const k = gallopRight(array[start2], array, start1, length1, 0, compare)
        const k = this.gallopRight(this.Reads.readValue(start2), false, start1, length1, 0)
        start1 += k
        length1 -= k

        if (length1 === 0) {
            return
        }

        /*
         * Find where the last element in the first run goes in run2. Next elements
         * in run2 are already in place
         */
        // length2 = gallopLeft(
        //     array[start1 + length1 - 1],
        //     array,
        //     start2,
        //     length2,
        //     length2 - 1,
        //     compare
        // )
        length2 = this.gallopLeft(
            // array[start1 + length1 - 1],
            this.Reads.readValue(start1 + length1 - 1),
            false,
            start2,
            length2,
            length2 - 1,
        )

        if (length2 === 0) {
            return
        }

        /*
         * Merge remaining runs. A tmp array with length = min(length1, length2) is
         * used
         */
        if (length1 <= length2) {
            this.mergeLow(start1, length1, start2, length2)
        } else {
            this.mergeHigh(start1, length1, start2, length2)
        }
    }

    /**
     * Merge two adjacent runs in a stable way. The runs must be such that the
     * first element of run1 is bigger than the first element in run2 and the
     * last element of run1 is greater than all the elements in run2.
     * The method should be called when run1.length <= run2.length as it uses
     * TimSort temporary array to store run1. Use mergeHigh if run1.length >
     * run2.length.
     *
     * @param {number} start1 - First element in run1.
     * @param {number} length1 - Length of run1.
     * @param {number} start2 - First element in run2.
     * @param {number} length2 - Length of run2.
     */
    mergeLow(start1, length1, start2, length2) {
        // const {compare} = this
        // const {array} = this
        // const {tmp} = this
        // const {tmpIndex} = this
        // const {compare} = this
        // const {array} = this
        // const {tmp} = this
        // const {tmpIndex} = this
        let i = 0

        for (i = 0; i < length1; i++) {
            // tmp[i] = array[start1 + i]
            this.Writes.auxWrite(i, this.Reads.get(start1 + i), this.tmp)
        }

        let cursor1 = 0
        let cursor2 = start2
        let dest = start1


        // array[dest] = array[cursor2]
        this.Writes.write(dest, this.Reads.get(cursor2))


        dest++
        cursor2++

        if (--length2 === 0) {
            for (i = 0; i < length1; i++) {
                // array[dest + i] = tmp[cursor1 + i]
                this.Writes.write(dest + i, this.Reads.auxReadValue(cursor1 + i, this.tmp))
            }
            return
        }

        if (length1 === 1) {
            for (i = 0; i < length2; i++) {
                // array[dest + i] = array[cursor2 + i]

                this.Writes.write(dest + i, this.Reads.get(cursor2 + i))
            }
            // array[dest + length2] = tmp[cursor1]
            this.Writes.write(dest + length2, this.Reads.auxReadValue(cursor1, this.tmp))
            return
        }

        let {minGallop} = this

        while (true) {
            let count1 = 0
            let count2 = 0
            let exit = false

            do {
                // if (compare(array[cursor2], tmp[cursor1]) < 0) {
                if (this.Reads.readValue(cursor2) < this.Reads.auxReadValue(cursor1, this.tmp)) {
                    // array[dest] = array[cursor2]
                    this.Writes.write(dest, this.Reads.get(cursor2))
                    dest++
                    cursor2++
                    count2++
                    count1 = 0

                    if (--length2 === 0) {
                        exit = true
                        break
                    }
                } else {
                    // array[dest] = tmp[cursor1]
                    this.Writes.write(dest, this.Reads.auxGet(cursor1, this.tmp))

                    dest++
                    cursor1++
                    count1++
                    count2 = 0
                    if (--length1 === 1) {
                        exit = true
                        break
                    }
                }
            } while ((count1 | count2) < minGallop)

            if (exit) {
                break
            }

            do {
                // count1 = gallopRight(array[cursor2], tmp, cursor1, length1, 0, compare)
                count1 = this.gallopRight(this.Reads.readValue(cursor2), true, cursor1, length1, 0)

                if (count1 !== 0) {
                    for (i = 0; i < count1; i++) {
                        // array[dest + i] = tmp[cursor1 + i]
                        // results[dest + i] = tmpIndex[cursor1 + i]
                        this.Writes.write(dest + i, this.Reads.auxGet(cursor1 + i, this.tmp))
                    }

                    dest += count1
                    cursor1 += count1
                    length1 -= count1
                    if (length1 <= 1) {
                        exit = true
                        break
                    }
                }

                // array[dest] = array[cursor2]
                // results[dest] = results[cursor2]
                this.Writes.write(dest, this.Reads.get(cursor2))

                dest++
                cursor2++

                if (--length2 === 0) {
                    exit = true
                    break
                }

                // count2 = this.gallopLeft(tmp[cursor1], array, cursor2, length2, 0, compare)
                count2 = this.gallopLeft(this.Reads.auxReadValue(cursor1, this.tmp), false, cursor2, length2, 0)

                if (count2 !== 0) {
                    for (i = 0; i < count2; i++) {
                        // array[dest + i] = array[cursor2 + i]
                        // results[dest + i] = results[cursor2 + i]
                        this.Writes.write(dest + i, this.Reads.get(cursor2 + i))
                    }

                    dest += count2
                    cursor2 += count2
                    length2 -= count2

                    if (length2 === 0) {
                        exit = true
                        break
                    }
                }
                // array[dest] = tmp[cursor1]
                // results[dest] = tmpIndex[cursor1]

                this.Writes.write(dest, this.Reads.auxGet(cursor1, this.tmp))

                dest++
                cursor1++

                if (--length1 === 1) {
                    exit = true
                    break
                }

                minGallop--
            } while (
                count1 >= DEFAULT_MIN_GALLOPING
                || count2 >= DEFAULT_MIN_GALLOPING
                )

            if (exit) {
                break
            }

            if (minGallop < 0) {
                minGallop = 0
            }

            minGallop += 2
        }

        this.minGallop = minGallop

        if (minGallop < 1) {
            this.minGallop = 1
        }

        if (length1 === 1) {
            for (i = 0; i < length2; i++) {
                // array[dest + i] = array[cursor2 + i]
                // results[dest + i] = results[cursor2 + i]
                this.Writes.write(dest + i, this.Reads.get(cursor2 + i))
            }
            // array[dest + length2] = tmp[cursor1]
            // results[dest + length2] = tmpIndex[cursor1]
            this.Writes.write(dest + length2, this.Reads.auxGet(cursor1, this.tmp))
        } else if (length1 === 0) {
            throw new Error('mergeLow preconditions were not respected')
        } else {
            for (i = 0; i < length1; i++) {
                // array[dest + i] = tmp[cursor1 + i]
                // results[dest + i] = tmpIndex[cursor1 + i]
                this.Writes.write(dest + i, this.Reads.auxGet(cursor1 + i, this.tmp))
            }
        }
    }

    /**
     * Merge two adjacent runs in a stable way. The runs must be such that the
     * first element of run1 is bigger than the first element in run2 and the
     * last element of run1 is greater than all the elements in run2.
     * The method should be called when run1.length > run2.length as it uses
     * TimSort temporary array to store run2. Use mergeLow if run1.length <=
     * run2.length.
     *
     * @param {number} start1 - First element in run1.
     * @param {number} length1 - Length of run1.
     * @param {number} start2 - First element in run2.
     * @param {number} length2 - Length of run2.
     */
    mergeHigh(start1, length1, start2, length2) {
        // const {compare} = this
        // const {array} = this
        // const {tmp} = this
        // const {tmpIndex} = this
        let i = 0

        for (i = 0; i < length2; i++) {
            // tmp[i] = array[start2 + i]
            this.Writes.auxWrite(i, this.Reads.get(start2 + i), this.tmp)
        }

        let cursor1 = start1 + length1 - 1
        let cursor2 = length2 - 1
        let dest = start2 + length2 - 1
        let customCursor = 0
        let customDest = 0

        // array[dest] = array[cursor1]
        this.Writes.write(dest, this.Reads.get(cursor1))

        dest--
        cursor1--

        if (--length1 === 0) {
            customCursor = dest - (length2 - 1)

            for (i = 0; i < length2; i++) {
                // array[customCursor + i] = tmp[i]
                this.Writes.write(customCursor + i, this.Reads.auxGet(i, this.tmp))
            }

            return
        }

        if (length2 === 1) {
            dest -= length1
            cursor1 -= length1
            customDest = dest + 1
            customCursor = cursor1 + 1

            for (i = length1 - 1; i >= 0; i--) {
                // array[customDest + i] = array[customCursor + i]
                this.Writes.write(customDest + i, this.Reads.get(customCursor + i))
            }

            // array[dest] = tmp[cursor2]
            this.Writes.write(dest, this.Reads.auxGet(cursor2, this.tmp))
            return
        }

        let {minGallop} = this

        while (true) {
            let count1 = 0
            let count2 = 0
            let exit = false

            do {
                // if (compare(tmp[cursor2], array[cursor1]) < 0) {
                if (this.Reads.auxReadValue(cursor2, this.tmp) < this.Reads.readValue(cursor1)) {
                    // array[dest] = array[cursor1]
                    this.Writes.write(dest, this.Reads.get(cursor1))
                    dest--
                    cursor1--
                    count1++
                    count2 = 0
                    if (--length1 === 0) {
                        exit = true
                        break
                    }
                } else {
                    // array[dest] = tmp[cursor2]
                    this.Writes.write(dest, this.Reads.auxGet(cursor2, this.tmp))
                    dest--
                    cursor2--
                    count2++
                    count1 = 0
                    if (--length2 === 1) {
                        exit = true
                        break
                    }
                }
            } while ((count1 | count2) < minGallop)

            if (exit) {
                break
            }

            do {
                // count1 = length1 - gallopRight(
                //     tmp[cursor2],
                //     array,
                //     start1,
                //     length1,
                //     length1 - 1,
                //     compare
                // )
                count1 = length1 - this.gallopRight(
                    this.Reads.auxReadValue(cursor2, this.tmp),
                    false,
                    start1,
                    length1,
                    length1 - 1
                )

                if (count1 !== 0) {
                    dest -= count1
                    cursor1 -= count1
                    length1 -= count1
                    customDest = dest + 1
                    customCursor = cursor1 + 1

                    for (i = count1 - 1; i >= 0; i--) {
                        // array[customDest + i] = array[customCursor + i]
                        this.Writes.write(customDest + i, this.Reads.get(customCursor + i))
                    }

                    if (length1 === 0) {
                        exit = true
                        break
                    }
                }

                // array[dest] = tmp[cursor2]
                this.Writes.write(dest, this.Reads.auxGet(cursor2, this.tmp))

                dest--
                cursor2--

                if (--length2 === 1) {
                    exit = true
                    break
                }

                // count2 = length2 - gallopLeft(
                //     array[cursor1],
                //     tmp,
                //     0,
                //     length2,
                //     length2 - 1,
                //     compare
                // )

                count2 = length2 - this.gallopLeft(
                    this.Reads.readValue(cursor1),
                    true,
                    0,
                    length2,
                    length2 - 1
                )

                if (count2 !== 0) {
                    dest -= count2
                    cursor2 -= count2
                    length2 -= count2
                    customDest = dest + 1
                    customCursor = cursor2 + 1

                    for (i = 0; i < count2; i++) {
                        // array[customDest + i] = tmp[customCursor + i]
                        this.Writes.write(customDest + i, this.Reads.auxGet(customCursor + i, this.tmp))
                    }

                    if (length2 <= 1) {
                        exit = true
                        break
                    }
                }

                // array[dest] = array[cursor1]
                this.Writes.write(dest, this.Reads.get(cursor1))

                dest--
                cursor1--

                if (--length1 === 0) {
                    exit = true
                    break
                }

                minGallop--
            } while (
                count1 >= DEFAULT_MIN_GALLOPING
                || count2 >= DEFAULT_MIN_GALLOPING
                )

            if (exit) {
                break
            }

            if (minGallop < 0) {
                minGallop = 0
            }

            minGallop += 2
        }

        this.minGallop = minGallop

        if (minGallop < 1) {
            this.minGallop = 1
        }

        if (length2 === 1) {
            dest -= length1
            cursor1 -= length1
            customDest = dest + 1
            customCursor = cursor1 + 1

            for (i = length1 - 1; i >= 0; i--) {
                // array[customDest + i] = array[customCursor + i]
                this.Writes.write(customDest + i, this.Reads.get(customCursor + i))
            }

            // array[dest] = tmp[cursor2]
            // results[dest] = tmpIndex[cursor2]

            this.Writes.write(dest, this.Reads.auxGet(cursor2, this.tmp))


        } else if (length2 === 0) {
            throw new Error('mergeHigh preconditions were not respected')
        } else {
            customCursor = dest - (length2 - 1)
            for (i = 0; i < length2; i++) {
                // array[customCursor + i] = tmp[i]
                this.Writes.write(customCursor + i, this.Reads.auxGet(i, this.tmp))
            }
        }
    }


    /**
     * Sort an array in the range [lo, hi) using TimSort.
     *
     * @param {array} array - The array to sort.
     * @param {function=} compare - Item comparison function. Default is
     *     alphabetical
     * @param {number} lo - First element in the range (inclusive).
     * @param {number} hi - Last element in the range.
     *     comparator.
     */
    runSort(low, high) {
        this.sort(low, high+1)
    }

    sort(lo, hi) {

        let i = 0

        let remaining = hi - lo

        // The array is already sorted
        if (remaining < 2) {
            return results
        }

        let runLength = 0
        // On small arrays binary sort can be used directly
        if (remaining < DEFAULT_MIN_MERGE) {
            runLength = this.makeAscendingRun(lo, hi)
            this.binaryInsertionSort(lo, hi, lo + runLength)
        }


        const minRun = minRunLength(remaining)

        do {
            runLength = this.makeAscendingRun(lo, hi)
            if (runLength < minRun) {
                let force = remaining
                if (force > minRun) {
                    force = minRun
                }

                this.binaryInsertionSort(lo, lo + force, lo + runLength)
                runLength = force
            }
            // Push new run and merge if necessary
            this.pushRun(lo, runLength)
            this.mergeRuns()

            // Go find next run
            remaining -= runLength
            lo += runLength
        } while (remaining !== 0)

        // Force merging of remaining runs
        this.forceMergeRuns()
        this.Writes.removeAuxArray(this.tmp)
    }
}