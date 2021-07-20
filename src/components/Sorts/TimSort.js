

/*
 * Copyright (C) 2008 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {InsertionSort} from "./InsertionSort";

const {Sort} = require("./Sort");

/**
 * A stable, adaptive, iterative mergesort that requires far fewer than
 * n lg(n) comparisons when running on partially sorted arrays, while
 * offering performance comparable to a traditional mergesort when run
 * on random arrays.  Like all proper mergesorts, this sort is stable and
 * runs O(n log n) time (worst case).  In the worst case, this sort requires
 * temporary storage space for n/2 object references; in the best case,
 * it requires only a small constant amount of space.
 *
 * This implementation was adapted from Tim Peters's list sort for
 * Python, which is described in detail here:
 *
 *   http://svn.python.org/projects/python/trunk/Objects/listsort.txt
 *
 * Tim's C code may be found here:
 *
 *   http://svn.python.org/projects/python/trunk/Objects/listobject.c
 *
 * The underlying techniques are described in this paper (and may have
 * even earlier origins):
 *
 *  "Optimistic Sorting and Information Theoretic Complexity"
 *  Peter McIlroy
 *  SODA (Fourth Annual ACM-SIAM Symposium on Discrete Algorithms),
 *  pp 467-474, Austin, Texas, 25-27 January 1993.
 *
 * While the API to this class consists solely of static methods, it is
 * (privately) instantiable; a TimSort instance holds the state of an ongoing
 * sort, assuming the input array is large enough to warrant the full-blown
 * TimSort. Small arrays are sorted in place, using a binary insertion sort.
 *
 * @author Josh Bloch
 *
 * Tailored to ArrayVisualizer by MusicTheorist
 */

export class TimSort extends Sort {

    /**
     * This is the minimum sized sequence that will be merged.  Shorter
     * sequences will be lengthened by calling binarySort.  If the entire
     * array is less than this length, no merges will be performed.
     *
     * This constant should be a power of two.  It was 64 in Tim Peter's C
     * implementation, but 32 was empirically determined to work better in
     * this implementation.  In the unlikely event that you set this constant
     * to be a number that's not a power of two, you'll need to change the
     * {@link #minRunLength} computation.
     *
     * If you decrease this constant, you must change the stackLen
     * computation in the TimSort constructor, or you risk an
     * ArrayOutOfBounds exception.  See listsort.txt for a discussion
     * of the minimum stack length required as a function of the length
     * of the array being sorted and the minimum merge sequence length.
     */
    MIN_MERGE = 32;
    /**
     * The array being sorted.
     */
    // private final int[] a;
    /**
     * ArrayVisualizer's current length.
     */
    /**
     * When we get into galloping mode, we stay there until both runs win less
     * often than MIN_GALLOP consecutive times.
     */
    MIN_GALLOP = 7;
    /**
     * This controls when we get *into* galloping mode.  It is initialized
     * to MIN_GALLOP.  The mergeLo and mergeHi methods nudge it higher for
     * random data, and lower for highly structured data.
     */
    minGallop = this.MIN_GALLOP;
    /**
     * Maximum initial size of tmp array, which is used for merging.  The array
     * can grow to accommodate demand.
     *
     * Unlike Tim's original C version, we do not allocate this much storage
     * when sorting smaller arrays.  This change was required for performance.
     */
    INITIAL_TMP_STORAGE_LENGTH = 256;
    /**
     * Temp storage for merges.
     */
    tmp;
    /**
     * A stack of pending runs yet to be merged.  Run i starts at
     * address base[i] and extends for len[i] elements.  It's always
     * true (so long as the indices are in bounds) that:
     *
     *     runBase[i] + runLen[i] == runBase[i + 1]
     *
     * so we could cut the storage for this, but it's a minor amount,
     * and keeping all the info explicit simplifies the code.
     */
    stackSize = 0;  // Number of pending runs on stack
    runBase;
    runLen;

    getMinRun() {
        return this.MIN_MERGE / 2;
    }

    // Easy patch for preventing gallop and merge methods from going out-of-bounds

    /**
     * Creates a TimSort instance to maintain the state of an ongoing sort.
     *
     * @param arrayVisualizer
     */
    constructor(arrayVisualizer) {
        super(arrayVisualizer);
        this.len = arrayVisualizer.getArrLength();
        // Allocate temp storage (which may be increased later if necessary)
        // int[] newArray = Writes.createExternalArray(this.len < 2 * INITIAL_TMP_STORAGE_LENGTH ?
        //     this.len >>> 1 : INITIAL_TMP_STORAGE_LENGTH);
        this.tmp = this.Writes.createAuxArray(this.len < 2 * this.INITIAL_TMP_STORAGE_LENGTH ?
            this.len >>> 1 : this.INITIAL_TMP_STORAGE_LENGTH)
        /*
         * Allocate runs-to-be-merged stack (which cannot be expanded).  The
         * stack length requirements are described in listsort.txt.  The C
         * version always uses the same stack length (85), but this was
         * measured to be too expensive when sorting "mid-sized" arrays (e.g.,
         * 100 elements) in Java.  Therefore, we use smaller (but sufficiently
         * large) stack lengths for smaller arrays.  The "magic numbers" in the
         * computation below must be changed if MIN_MERGE is decreased.  See
         * the MIN_MERGE declaration above for more information.
         */
        let stackLen = (this.len < 120 ? 5 :
            this.len < 1542 ? 10 :
                this.len < 119151 ? 19 : 40);
        // this.runBase = Writes.createExternalArray(stackLen);
        // this.runLen = Writes.createExternalArray(stackLen);
        //
        this.runBase = Array(stackLen);
        this.runLen = Array(stackLen);
    }

    /*
     * The next two methods (which are static, one being package private) constitute
     * the entire API of this class.  Each of these methods obeys the contract
     * of the public method with the same signature in java.util.Arrays.
     */
    runSort(low, high) {
        this.sort(low, high+1)
        this.Writes.removeAuxArray(this.tmp);
        // timSort.Writes.deleteExternalArray(timSort.runBase);
        // timSort.Writes.deleteExternalArray(timSort.runLen);
    }

    sort(lo, hi) {

        let nRemaining = hi - lo;
        // If array is small, do a "mini-TimSort" with no merges
        if (nRemaining < this.MIN_MERGE) {
            let initRunLen = this.countRunAndMakeAscending(lo, hi);
            this.binarySort(lo, hi, lo + initRunLen);
            return;
        }
        /**
         * March over the array once, left to right, finding natural runs,
         * extending short natural runs to minRun elements, and merging runs
         * to maintain stack invariant.
         */
        let minRun = this.minRunLength(nRemaining);
        do {
            // Identify next run
            let runLen = this.countRunAndMakeAscending(lo, hi);

            // If run is short, extend to min(minRun, nRemaining)
            if (runLen < minRun) {
                let force = nRemaining <= minRun ? nRemaining : minRun;
                this.binarySort(lo, lo + force, lo + runLen);
                runLen = force;
            }
            // Push run onto pending-run stack, and maybe merge
            this.pushRun(lo, runLen);
            this.mergeCollapse();

            // Advance to find next run
            lo += runLen;
            nRemaining -= runLen;
        } while (nRemaining !== 0);

        // Merge all remaining runs to complete sort
        this.mergeForceCollapse();
    }

    /**
     * Sorts the specified portion of the specified array using a binary
     * insertion sort.  This is the best method for sorting small numbers
     * of elements.  It requires O(n log n) compares, but O(n^2) data
     * movement (worst case).
     *
     * If the initial part of the specified range is already sorted,
     * this method can take advantage of it: the method assumes that the
     * elements from index {@code lo}, inclusive, to {@code start},
     * exclusive are already sorted.
     *
     * @param a the array in which a range is to be sorted
     * @param lo the index of the first element in the range to be sorted
     * @param hi the index after the last element in the range to be sorted
     * @param start the index of the first element in the range that is
     *        not already known to be sorted (@code lo <= start <= hi}
     * @param c comparator to used for the sort
     */

// Here, we do not use the Binary Insertion Sort included in ArrayVisualizer, as TimSort
// outfits it with a start index and uses the arraycopy method

    binarySort(lo, hi, start) {
        if (start === lo)
            start++;

        for (; start < hi; start++) {
            const pivot = this.Reads.get(start);

            // Set left (and right) to the index where a[start] (pivot) belongs
            let left = lo;
            let right = start;

            /*
             * Invariants:
             *   pivot >= all in [lo, left).
             *   pivot <  all in [right, start).
             */
            while (left < right) {
                // Another good way to prevent integer overflow with left + right!
                let mid = (left + right) >>> 1;

                if (this.Reads.compareValues(pivot, this.Reads.get(mid)) < 0) {
                    right = mid
                } else {
                    left = mid + 1
                }
            }
            /*
             * The invariants still hold: pivot >= all in [lo, left) and
             * pivot < all in [left, start), so pivot belongs at left.  Note
             * that if there are elements equal to pivot, left points to the
             * first slot after them -- that's why this sort is stable.
             * Slide elements over to make room for pivot.
             */
            let n = start - left;  // The number of elements to move
            // Switch is just an optimization for arraycopy in default case
            switch (n) {
                case 2:
                    this.Writes.write(left + 2, this.Reads.get(left + 1));
                case 1:
                    this.Writes.write(left + 1, this.Reads.get(left));
                    break;
                default:
                    this.Writes.reverseArrayCopy(-1, left, -1, left + 1, n);
            }
            this.Writes.write(left, pivot);
        }
    }


    // binarySort(lo, hi, start){
    //     let insertionSort = new InsertionSort(this.arrayVisualizer)
    //     insertionSort.runSort(lo, hi)
    // }
/**
 * Returns the length of the run beginning at the specified position in
 * the specified array and reverses the run if it is descending (ensuring
 * that the run will always be ascending when the method returns).
 *
 * A run is the longest ascending sequence with:
 *
 *    a[lo] <= a[lo + 1] <= a[lo + 2] <= ...
 *
 * or the longest descending sequence with:
 *
 *    a[lo] >  a[lo + 1] >  a[lo + 2] >  ...
 *
 * For its intended use in a stable mergesort, the strictness of the
 * definition of "descending" is needed so that the call can safely
 * reverse a descending sequence without violating stability.
 *
 * @param a the array in which a run is to be counted and possibly reversed
 * @param lo index of the first element in the run
 * @param hi index after the last element that may be contained in the run.
 It is required that @code{lo < hi}.
 * @param c the comparator to used for the sort
 * @return  the length of the run beginning at the specified position in
 *          the specified array
 */
countRunAndMakeAscending(lo, hi) {
    let runHi = lo + 1;
    if (runHi === hi)
        return 1;

    // Find end of run, and reverse range if descending
    if (this.Reads.compareInArr(runHi++, lo) < 0) { // Descending
        while(runHi < hi && this.Reads.compareInArr(runHi, runHi - 1) < 0) {
            runHi++;
        }
        this.reverseRange(lo, runHi);
    } else {                              // Ascending
        while (runHi < hi && this.Reads.compareInArr(runHi, runHi - 1) >= 0) {
            runHi++;
        }
    }
    return runHi - lo;
}

/**
 * Reverse the specified range of the specified array.
 *
 * @param a the array in which a range is to be reversed
 * @param lo the index of the first element in the range to be reversed
 * @param hi the index after the last element in the range to be reversed
 */

reverseRange(lo, hi) {
    let start = lo
    let length = hi
    for (let i = start; i < start + ((length - start + 1) / 2); i++) {
        this.Writes.swap(i, start + length - i);
    }
}

/**
 * Returns the minimum acceptable run length for an array of the specified
 * length. Natural runs shorter than this will be extended with
 * {@link #binarySort}.
 *
 * Roughly speaking, the computation is:
 *
 *  If n < MIN_MERGE, return n (it's too small to bother with fancy stuff).
 *  Else if n is an exact power of 2, return MIN_MERGE/2.
 *  Else return an int k, MIN_MERGE/2 <= k <= MIN_MERGE, such that n/k
 *   is close to, but strictly less than, an exact power of 2.
 *
 * For the rationale, see listsort.txt.
 *
 * @param n the length of the array to be sorted
 * @return the length of the minimum run to be merged
 */
minRunLength(n) {
    let r = 0;      // Becomes 1 if any 1 bits are shifted off
    while (n >= this.MIN_MERGE) {
        r |= (n & 1);
        n >>= 1;
    }
    return n + r;
}

/**
 * Pushes the specified run onto the pending-run stack.
 *
 * @param runBase index of the first element in the run
 * @param runLen  the number of elements in the run
 */
pushRun(runBase, runLen) {
    this.runBase[this.stackSize] = runBase;
    this.runLen[this.stackSize] = runLen;
    this.stackSize++;
}

/**
 * Examines the stack of runs waiting to be merged and merges adjacent runs
 * until the stack invariants are reestablished:
 *
 *     1. runLen[i - 3] > runLen[i - 2] + runLen[i - 1]
 *     2. runLen[i - 2] > runLen[i - 1]
 *
 * This method is called each time a new run is pushed onto the stack,
 * so the invariants are guaranteed to hold for i < stackSize upon
 * entry to the method.
 *
 * Thanks to Stijn de Gouw, Jurriaan Rot, Frank S. de Boer,
 * Richard Bubel and Reiner Hahnle, this is fixed with respect to
 * the analysis in "On the Worst-Case Complexity of TimSort" by
 * Nicolas Auger, Vincent Jug, Cyril Nicaud, and Carine Pivoteau.
 */
mergeCollapse() {
    while (this.stackSize > 1) {
        let n = this.stackSize - 2;
        if ((n >= 1 && this.runLen[n-1] <= this.runLen[n] + this.runLen[n+1]) ||
            (n >= 2 && this.runLen[n-2] <= this.runLen[n] + this.runLen[n-1])) {
            if (this.runLen[n - 1] < this.runLen[n + 1])
                n--;
        } else if (this.runLen[n] > this.runLen[n + 1]) {
            break; // Invariant is established
        }
        this.mergeAt(n);
    }
}

/**
 * Merges all runs on the stack until only one remains.  This method is
 * called once, to complete the sort.
 */
mergeForceCollapse() {
    while (this.stackSize > 1) {
        let n = this.stackSize - 2;
        if (n > 0 && this.runLen[n - 1] < this.runLen[n + 1])
            n--;
        this.mergeAt(n);
    }
}

/**
 * Merges the two runs at stack indices i and i+1.  Run i must be
 * the penultimate or antepenultimate run on the stack.  In other words,
 * i must be equal to stackSize-2 or stackSize-3.
 *
 * @param i stack index of the first of the two runs to merge
 */
mergeAt(i) {


    let base1 = this.runBase[i];
    let len1 = this.runLen[i];
    let base2 = this.runBase[i + 1];
    let len2 = this.runLen[i + 1];

    /*
     * Record the length of the combined runs; if i is the 3rd-last
     * run now, also slide over the last run (which isn't involved
     * in this merge).  The current run (i+1) goes away in any case.
     */
    this.runLen[i] = len1 + len2;
    if (i === this.stackSize - 3) {
        this.runBase[i + 1] = this.runBase[i + 2];
        this.runLen[i + 1] = this.runLen[i + 2];
    }
    this.stackSize--;

    /*
     * Find where the first element of run2 goes in run1. Prior elements
     * in run1 can be ignored (because they're already in place).
     */
    let k = this.gallopRight(this.Reads.readValue(base2), -1, base1, len1, 0);
    base1 += k;
    len1 -= k;
    if (len1 === 0)
        return;

    /*
     * Find where the last element of run1 goes in run2. Subsequent elements
     * in run2 can be ignored (because they're already in place).
     */
    len2 = this.gallopLeft(this.Reads.readValue(base1 + len1 - 1), -1, base2, len2, len2 - 1);
    if (len2 === 0)
        return;

    // Merge remaining runs, using tmp array with min(len1, len2) elements
    if (len1 <= len2)
        this.mergeLo(base1, len1, base2, len2);
    else
        this.mergeHi(base1, len1, base2, len2);
}

/**
 * Locates the position at which to insert the specified key into the
 * specified sorted range; if the range contains an element equal to key,
 * returns the index of the leftmost equal element.
 *
 * @param key the key whose insertion point to search for
 * @param a the array in which to search
 * @param base the index of the first element in the range
 * @param len the length of the range; must be > 0
 * @param hint the index at which to begin the search, 0 <= hint < n.
 *     The closer hint is to the result, the faster this method will run.
 * @param c the comparator used to order the range, and to search
 * @return the int k,  0 <= k <= n such that a[b + k - 1] < key <= a[b + k],
 *    pretending that a[b - 1] is minus infinity and a[b + n] is infinity.
 *    In other words, key belongs at index b + k; or in other words,
 *    the first k elements of a should precede key, and the last n - k
 *    should follow it.
 */
gallopLeft(key, a, base, len, hint) {
    let lastOfs = 0;
    let ofs = 1;

    if(a===-1) {
        // if (this.Reads.compareValues(key, a[base + hint]) > 0) {
        if (this.Reads.compareValues(key, this.Reads.get(base+hint)) > 0) {
            // Gallop right until a[base+hint+lastOfs] < key <= a[base+hint+ofs]
            let maxOfs = len - hint;

            while (ofs < maxOfs && this.Reads.compareValues(key, this.Reads.get(base+hint+ofs)) > 0) {
                lastOfs = ofs;
                ofs = (ofs * 2) + 1;
                if (ofs <= 0)   // int overflow
                    ofs = maxOfs;

            }
            if (ofs > maxOfs)
                ofs = maxOfs;

            // Make offsets relative to base
            lastOfs += hint;
            ofs += hint;
        } else { // key <= a[base + hint]
            // Gallop left until a[base+hint-ofs] < key <= a[base+hint-lastOfs]
            let maxOfs = hint + 1;

            while (ofs < maxOfs && this.Reads.compareValues(key, this.Reads.get(base + hint - ofs)) <= 0) {
                lastOfs = ofs;
                ofs = (ofs * 2) + 1;
                if (ofs <= 0)   // int overflow
                    ofs = maxOfs;

            }
            if (ofs > maxOfs)
                ofs = maxOfs;

            // Make offsets relative to base
            let tmp = lastOfs;
            lastOfs = hint - ofs;
            ofs = hint - tmp;
        }

        /*
         * Now a[base+lastOfs] < key <= a[base+ofs], so key belongs somewhere
         * to the right of lastOfs but no farther right than ofs.  Do a binary
         * search, with invariant a[base + lastOfs - 1] < key <= a[base + ofs].
         */
        lastOfs++;
        while (lastOfs < ofs) {
            let m = lastOfs + ((ofs - lastOfs) >>> 1);

            if (this.Reads.compareValues(key, this.Reads.get(base + m)) > 0)
                lastOfs = m + 1;  // a[base + m] < key
            else
                ofs = m;          // key <= a[base + m]
        }
    }else{
        if (this.Reads.compareValues(key, this.Reads.auxGet(base+hint, a)) > 0) {
            // Gallop right until a[base+hint+lastOfs] < key <= a[base+hint+ofs]
            let maxOfs = len - hint;

            while (ofs < maxOfs && this.Reads.compareValues(key, this.Reads.auxGet(base+hint+ofs, a)) > 0) {
                lastOfs = ofs;
                ofs = (ofs * 2) + 1;
                if (ofs <= 0)   // int overflow
                    ofs = maxOfs;

            }
            if (ofs > maxOfs)
                ofs = maxOfs;

            // Make offsets relative to base
            lastOfs += hint;
            ofs += hint;
        } else { // key <= a[base + hint]
            // Gallop left until a[base+hint-ofs] < key <= a[base+hint-lastOfs]
            let maxOfs = hint + 1;

            while (ofs < maxOfs && this.Reads.compareValues(key, this.Reads.auxGet(base + hint - ofs, a)) <= 0) {
                lastOfs = ofs;
                ofs = (ofs * 2) + 1;
                if (ofs <= 0)   // int overflow
                    ofs = maxOfs;

            }
            if (ofs > maxOfs)
                ofs = maxOfs;

            // Make offsets relative to base
            let tmp = lastOfs;
            lastOfs = hint - ofs;
            ofs = hint - tmp;
        }

        /*
         * Now a[base+lastOfs] < key <= a[base+ofs], so key belongs somewhere
         * to the right of lastOfs but no farther right than ofs.  Do a binary
         * search, with invariant a[base + lastOfs - 1] < key <= a[base + ofs].
         */
        lastOfs++;
        while (lastOfs < ofs) {
            let m = lastOfs + ((ofs - lastOfs) >>> 1);

            if (this.Reads.compareValues(key, this.Reads.auxGet(base + m, a)) > 0)
                lastOfs = m + 1;  // a[base + m] < key
            else
                ofs = m;          // key <= a[base + m]
        }
    }
    return ofs;
}
/**
 * Like gallopLeft, except that if the range contains an element equal to
 * key, gallopRight returns the index after the rightmost equal element.
 *
 * @param key the key whose insertion point to search for
 * @param a the array in which to search
 * @param base the index of the first element in the range
 * @param len the length of the range; must be > 0
 * @param hint the index at which to begin the search, 0 <= hint < n.
 *     The closer hint is to the result, the faster this method will run.
 * @param c the comparator used to order the range, and to search
 * @return the int k,  0 <= k <= n such that a[b + k - 1] <= key < a[b + k]
 */
gallopRight(key, a, base, len, hint) {
    let ofs = 1;
    let lastOfs = 0;

    if(a===-1) {
        if (this.Reads.compareValues(key, this.Reads.get(base + hint)) < 0) {
            // Gallop left until a[b+hint - ofs] <= key < a[b+hint - lastOfs]
            let maxOfs = hint + 1;

            while (ofs < maxOfs && this.Reads.compareValues(key, this.Reads.get(base + hint - ofs)) < 0) {
                lastOfs = ofs;
                ofs = (ofs * 2) + 1;
                if (ofs <= 0)   // int overflow
                    ofs = maxOfs;

            }
            if (ofs > maxOfs)
                ofs = maxOfs;

            // Make offsets relative to b
            let tmp = lastOfs;
            lastOfs = hint - ofs;
            ofs = hint - tmp;
        } else { // a[b + hint] <= key
            // Gallop right until a[b+hint + lastOfs] <= key < a[b+hint + ofs]
            let maxOfs = len - hint;


            while (ofs < maxOfs && this.Reads.compareValues(key, this.Reads.get(base + hint + ofs)) >= 0) {
                lastOfs = ofs;
                ofs = (ofs * 2) + 1;
                if (ofs <= 0)   // int overflow
                    ofs = maxOfs;

            }
            if (ofs > maxOfs)
                ofs = maxOfs;

            // Make offsets relative to b
            lastOfs += hint;
            ofs += hint;
        }

        /*
         * Now a[b + lastOfs] <= key < a[b + ofs], so key belongs somewhere to
         * the right of lastOfs but no farther right than ofs.  Do a binary
         * search, with invariant a[b + lastOfs - 1] <= key < a[b + ofs].
         */
        lastOfs++;
        while (lastOfs < ofs) {
            let m = lastOfs + ((ofs - lastOfs) >>> 1);

            if (this.Reads.compareValues(key, this.Reads.get(base + m)) < 0)
                ofs = m;          // key < a[b + m]
            else
                lastOfs = m + 1;  // a[b + m] <= key
        }
    }else{
        if (this.Reads.compareValues(key, this.Reads.auxGet(base + hint, a)) < 0) {
            // Gallop left until a[b+hint - ofs] <= key < a[b+hint - lastOfs]
            let maxOfs = hint + 1;

            while (ofs < maxOfs && this.Reads.compareValues(key, this.Reads.auxGet(base + hint - ofs, a)) < 0) {
                lastOfs = ofs;
                ofs = (ofs * 2) + 1;
                if (ofs <= 0)   // int overflow
                    ofs = maxOfs;

            }
            if (ofs > maxOfs)
                ofs = maxOfs;

            // Make offsets relative to b
            let tmp = lastOfs;
            lastOfs = hint - ofs;
            ofs = hint - tmp;
        } else { // a[b + hint] <= key
            // Gallop right until a[b+hint + lastOfs] <= key < a[b+hint + ofs]
            let maxOfs = len - hint;


            while (ofs < maxOfs && this.Reads.compareValues(key, this.Reads.auxGet(base + hint + ofs, a)) >= 0) {
                lastOfs = ofs;
                ofs = (ofs * 2) + 1;
                if (ofs <= 0)   // int overflow
                    ofs = maxOfs;

            }
            if (ofs > maxOfs)
                ofs = maxOfs;

            // Make offsets relative to b
            lastOfs += hint;
            ofs += hint;
        }

        /*
         * Now a[b + lastOfs] <= key < a[b + ofs], so key belongs somewhere to
         * the right of lastOfs but no farther right than ofs.  Do a binary
         * search, with invariant a[b + lastOfs - 1] <= key < a[b + ofs].
         */
        lastOfs++;
        while (lastOfs < ofs) {
            let m = lastOfs + ((ofs - lastOfs) >>> 1);

            if (this.Reads.compareValues(key, this.Reads.auxGet(base + m, a)) < 0)
                ofs = m;          // key < a[b + m]
            else
                lastOfs = m + 1;  // a[b + m] <= key
        }
    }
    return ofs;
}
/**
 * Merges two adjacent runs in place, in a stable fashion.  The first
 * element of the first run must be greater than the first element of the
 * second run (a[base1] > a[base2]), and the last element of the first run
 * (a[base1 + len1-1]) must be greater than all elements of the second run.
 *
 * For performance, this method should be called only when len1 <= len2;
 * its twin, mergeHi should be called if len1 >= len2.  (Either method
 * may be called if len1 == len2.)
 *
 * @param base1 index of first element in first run to be merged
 * @param len1  length of first run to be merged (must be > 0)
 * @param base2 index of first element in second run to be merged
 *        (must be aBase + aLen)
 * @param len2  length of second run to be merged (must be > 0)
 */
mergeLo(base1, len1, base2, len2) {
    // Copy first run into temp array

    // int[] a = ts.a; // For performance
    // int[] tmp = ensureCapacity(len1);

    this.Writes.arrayCopy(-1, base1, this.tmp, 0, len1);

    let cursor1 = 0;       // Indexes into tmp array
    let cursor2 = base2;   // Indexes int a
    let dest = base1;      // Indexes int a

    // Move first element of second run and deal with degenerate cases
    this.Writes.write(dest++, this.Reads.get(cursor2++));

    if (--len2 === 0) {
        this.Writes.arraycopy(this.tmp, cursor1, -1, dest, len1);
        return;
    }
    if (len1 === 1) {
        this.Writes.arraycopy(-1, cursor2, -1, dest, len2);
        this.Writes.write(dest + len2, this.Reads.auxGet(cursor1, this.tmp)); // Last elt of run 1 to end of merge
        return;
    }

    let minGallop = this.minGallop;    //  "    "       "     "      "
    outer:
        while (true) {
            let count1 = 0; // Number of times in a row that first run won
            let count2 = 0; // Number of times in a row that second run won
            /*
             * Do the straightforward thing until (if ever) one run starts
             * winning consistently.
             */
            do {
                if (this.Reads.compareValues(this.Reads.get(cursor2), this.Reads.auxGet(cursor1, this.tmp)) < 0) {
                    this.Writes.write(dest++, this.Reads.get(cursor2++));
                    count2++;
                    count1 = 0;
                    if (--len2 === 0)
                        break outer;
                } else {
                    this.Writes.write(dest++, this.Reads.auxGet(cursor1++, this.tmp));
                    count1++;
                    count2 = 0;
                    if (--len1 === 1)
                        break outer;
                }
            } while ((count1 | count2) < minGallop);

            /*
             * One run is winning so consistently that galloping may be a
             * huge win. So try that, and continue galloping until (if ever)
             * neither run appears to be winning consistently anymore.
             */
            do {
                count1 = this.gallopRight(this.Reads.readValue(cursor2), this.tmp, cursor1, len1, 0);
                if (count1 !== 0) {
                    this.Writes.arrayCopy(this.tmp, cursor1, -1, dest, count1);
                    dest += count1;
                    cursor1 += count1;
                    len1 -= count1;
                    if (len1 <= 1) // len1 == 1 || len1 == 0
                        break outer;
                }
                this.Writes.write(dest++, this.Reads.get(cursor2++));

                if (--len2 === 0)
                    break outer;

                count2 = this.gallopLeft(this.Reads.auxReadValue(cursor1, this.tmp), -1, cursor2, len2, 0);
                if (count2 !== 0) {
                    this.Writes.arrayCopy(-1, cursor2, -1, dest, count2);
                    dest += count2;
                    cursor2 += count2;
                    len2 -= count2;
                    if (len2 === 0)
                        break outer;
                }
                this.Writes.write(dest++, this.Reads.get(cursor1++));

                if (--len1 === 1)
                    break outer;
                minGallop--;
            } while (count1 >= this.MIN_GALLOP || count2 >= this.MIN_GALLOP);
            if (minGallop < 0)
                minGallop = 0;
            minGallop += 2;  // Penalize for leaving gallop mode
        }  // End of "outer" loop
    this.minGallop = minGallop < 1 ? 1 : minGallop;  // Write back to field

    if (len1 === 1) {
        this.Writes.arrayCopy(-1, cursor2, -1, dest, len2, 1, true, false);
        this.Writes.write(dest + len2, this.Reads.auxGet(cursor1, this.tmp)); //  Last elt of run 1 to end of merge
    } else if (len1 === 0) {
        throw new Error(
            "Comparison method violates its general contract!");
    } else {
        this.Writes.arrayCopy(this.tmp, cursor1, -1, dest, len1);
    }
}

/**
 * Like mergeLo, except that this method should be called only if
 * len1 >= len2; mergeLo should be called if len1 <= len2.  (Either method
 * may be called if len1 == len2.)
 *
 * @param base1 index of first element in first run to be merged
 * @param len1  length of first run to be merged (must be > 0)
 * @param base2 index of first element in second run to be merged
 *        (must be aBase + aLen)
 * @param len2  length of second run to be merged (must be > 0)
 */
mergeHi(base1, len1, base2, len2) {

    this.Writes.arrayCopy(-1, base2, this.tmp, 0, len2);

    let cursor1 = base1 + len1 - 1;  // Indexes into a
    let cursor2 = len2 - 1;          // Indexes into tmp array
    let dest = base2 + len2 - 1;     // Indexes into a

    // Move last element of first run and deal with degenerate cases
    this.Writes.write(dest--, this.Reads.get(cursor1--));

    if (--len1 === 0) {
        this.Writes.reverseArrayCopy(this.tmp, 0, -1, dest - (len2 - 1), len2);
        return;
    }
    if (len2 === 1) {
        dest -= len1;
        cursor1 -= len1;
        this.Writes.reverseArrayCopy(-1, cursor1 + 1, -1, dest + 1, len1);
        this.Writes.write(dest, this.Reads.auxGet(cursor2, this.tmp));
        return;
    }

    let minGallop = this.minGallop;    //  "    "       "     "      "
    outer:
        while (true) {
            let count1 = 0; // Number of times in a row that first run won
            let count2 = 0; // Number of times in a row that second run won

            /*
             * Do the straightforward thing until (if ever) one run
             * appears to win consistently.
             */
            do {
                if (this.Reads.compareValues(this.Reads.auxGet(cursor2, this.tmp), this.Reads.get(cursor1)) < 0) {
                    this.Writes.write(dest--, this.Reads.get(cursor1--));

                    count1++;
                    count2 = 0;
                    if (--len1 === 0)
                        break outer;
                } else {
                    this.Writes.write(dest--, this.Reads.auxGet(cursor2--, this.tmp));

                    count2++;
                    count1 = 0;
                    if (--len2 === 1)
                        break outer;
                }
            } while ((count1 | count2) < minGallop);

            /*
             * One run is winning so consistently that galloping may be a
             * huge win. So try that, and continue galloping until (if ever)
             * neither run appears to be winning consistently anymore.
             */
            do {
                count1 = len1 - this.gallopRight(this.Reads.auxReadValue(cursor2, this.tmp), -1, base1, len1, len1 - 1);
                if (count1 !== 0) {
                    dest -= count1;
                    cursor1 -= count1;
                    len1 -= count1;
                    this.Writes.reverseArrayCopy(-1, cursor1 + 1, -1, dest + 1, count1);
                    if (len1 === 0)
                        break outer;
                }
                this.Writes.write(dest--, this.Reads.auxGet(cursor2--, this.tmp));
                if (--len2 === 1)
                    break outer;

                count2 = len2 - this.gallopLeft(this.Reads.readValue(cursor1), this.tmp, 0, len2, len2 - 1);
                if (count2 !== 0) {
                    dest -= count2;
                    cursor2 -= count2;
                    len2 -= count2;
                    this.Writes.reverseArrayCopy(this.tmp, cursor2 + 1, -1, dest + 1, count2, 1, true, false);
                    if (len2 <= 1)  // len2 == 1 || len2 == 0
                        break outer;
                }
                this.Writes.write(dest--, this.Reads.get(cursor1--));

                if (--len1 === 0)
                    break outer;
                minGallop--;
            } while (count1 >= this.MIN_GALLOP || count2 >= this.MIN_GALLOP);
            if (minGallop < 0)
                minGallop = 0;
            minGallop += 2;  // Penalize for leaving gallop mode
        }  // End of "outer" loop
    this.minGallop = minGallop < 1 ? 1 : minGallop;  // Write back to field

    if (len2 === 1) {
        dest -= len1;
        cursor1 -= len1;
        this.Writes.reverseArrayCopy(-1, cursor1 + 1, -1, dest + 1, len1);
        this.Writes.write(dest, this.Reads.auxGet(cursor2, this.tmp)); // Move first elt of run2 to front of merge
    } else if (len2 === 0) {
        throw new Error(
            "Comparison method violates its general contract!");
    } else {
        this.Writes.reverseArrayCopy(this.tmp, 0, -1, dest - (len2 - 1), len2, 1, true, false);
    }
}
/**
 * Ensures that the external array tmp has at least the specified
 * number of elements, increasing its size if necessary.  The size
 * increases exponentially to ensure amortized linear time complexity.
 *
 * @param minCapacity the minimum required capacity of the tmp array
 * @return tmp, whether or not it grew
 */
ensureCapacity(minCapacity) {
    if (this.tmp.length < minCapacity) {
        // Compute smallest power of 2 > minCapacity
        let newSize = minCapacity;
        newSize |= newSize >> 1;
        newSize |= newSize >> 2;
        newSize |= newSize >> 4;
        newSize |= newSize >> 8;
        newSize |= newSize >> 16;
        newSize++;
        if (newSize < 0) // Not bloody likely!
            newSize = minCapacity;
        else
            newSize = Math.min(newSize, this.len >>> 1);
        let newArray = this.Writes.createAuxArray(newSize);
        this.Writes.removeAuxArray(this.tmp);
        this.tmp = newArray;
    }
    return this.tmp;
}
}