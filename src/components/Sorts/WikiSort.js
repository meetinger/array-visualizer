/*
 *
This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <http://unlicense.org>
 *
 */

// structure to represent ranges within the array
import {Writes} from "../ArrayAccess/Writes";

const {InsertionSort} = require("./InsertionSort");
const {Sort} = require("./Sort");

class Range {
    start;
    end;

    constructor(start1 = 0, end1 = 0) {
        this.start = start1;
        this.end = end1;
    }

    set(start1, end1) {
        this.start = start1;
        this.end = end1;
    }

    length() {
        return this.end - this.start;
    }
}

class Pull {
    from
    to
    count;
    range;

    constructor() {
        this.range = new Range(0, 0);
    }

    reset() {
        this.range.set(0, 0);
        this.from = 0;
        this.to = 0;
        this.count = 0;
    }
}

// calculate how to scale the index value to the range within the array
// the bottom-up merge sort only operates on values that are powers of two,
// so scale down to that power of two, then use a fraction to scale back again
class Iterator {
    size;
    power_of_two;
    numerator;
    decimal;
    denominator;
    decimal_step;
    numerator_step;

    // 63 -> 32, 64 -> 64, etc.
    // this comes from Hacker's Delight
    FloorPowerOfTwo(value) {
        let x = value;
        x = x | (x >> 1);
        x = x | (x >> 2);
        x = x | (x >> 4);
        x = x | (x >> 8);
        x = x | (x >> 16);
        return Math.trunc(x - (x >> 1));
    }

    constructor(size2, min_level) {
        this.size = size2;
        this.power_of_two = this.FloorPowerOfTwo(this.size);
        // this.denominator = this.power_of_two / min_level;
        this.denominator = Math.trunc(this.power_of_two / min_level);
        this.numerator_step = this.size % this.denominator;
        // this.decimal_step = this.size / this.denominator;
        this.decimal_step = Math.trunc(this.size / this.denominator);
        this.begin();
    }

    begin() {
        this.numerator = this.decimal = 0;
    }

    nextRange() {
        let start = this.decimal;

        this.decimal += this.decimal_step;
        this.numerator += this.numerator_step;
        if (this.numerator >= this.denominator) {
            this.numerator -= this.denominator;
            this.decimal++;
        }

        return new Range(start, this.decimal);
    }

    finished() {
        return (this.decimal >= this.size);
    }

    nextLevel() {
        this.decimal_step += this.decimal_step;
        this.numerator_step += this.numerator_step;
        if (this.numerator_step >= this.denominator) {
            this.numerator_step -= this.denominator;
            this.decimal_step++;
        }

        return (this.decimal_step < this.size);
    }

    length() {
        return this.decimal_step;
    }
}

export class WikiSort extends Sort {
    // use a small cache to speed up some of the operations
    // since the cache size is fixed, it's still O(1) memory!
    // just keep in mind that making it too small ruins the point (nothing will fit into it),
    // and making it too large also ruins the point (so much for "low memory"!)

    cache_size = 0;
    cache = null;
    // note that you can easily modify the above to allocate a dynamically sized cache
    // good choices for the cache size are:

    // (size + 1)/2 – turns into a full-speed standard merge sort since everything fits into the cache
    // sqrt((size + 1)/2) + 1 – this will be the size of the A blocks at the largest level of merges,
    // so a buffer of this size would allow it to skip using internal or in-place merges for anything

    // Original static buffer = 512 – chosen from careful testing as a good balance between fixed-size memory use and run time
    // ArrayVisualizer static buffer = 32, as the numbers of items we use for visual purposes is relatively small

    // 0 – if the system simply cannot allocate any extra memory whatsoever, no memory works just fine

    constructor(arrayVisualizer) {
        super(arrayVisualizer)
        this.sortName = "WikiSort"
        this.isNeedBuffer = true
    }

    // if(cache_size != 0) this.cache = Writes.createExternalArray(cache_size);
    // else this.cache = null;


// public static void sort(WikiSorting WikiSort, int[] array, int currentLen) {
//     WikiSort.Sort(array, currentLen);
//     if (WikiSort.cache != null) WikiSort.Writes.deleteExternalArray(WikiSort.cache);
// }

// toolbox functions used by the sorter

// find the index of the first value within the range that is equal to array[index]
    BinaryFirst(value, range) {
        let start = range.start, end = range.end - 1;
        while (start < end) {
            let mid = Math.trunc(start + (end - start) / 2);
            // if (Reads.compareValues(array[mid], value) < 0)
            if (this.Reads.compareValues(this.Reads.get(mid), value) < 0)
                start = mid + 1;
            else
                end = mid;
        }
        // if (start === range.end - 1 && Reads.compareValues(array[start], value) < 0) start++;
        if (start === range.end - 1 && (this.Reads.compareValues(this.Reads.get(start), value) < 0)) start++;
        return start;
    }

// find the index of the last value within the range that is equal to array[index], plus 1
    BinaryLast(value, range) {
        let start = range.start, end = range.end - 1;
        while (start < end) {
            let mid = Math.trunc(start + (end - start) / 2);
            if (this.Reads.compareValues(value, this.Reads.get(mid)) >= 0)
                start = mid + 1;
            else
                end = mid;
        }
        if (start === range.end - 1 && this.Reads.compareValues(value, this.Reads.get(start)) >= 0) start++;
        return start;
    }

// combine a linear search with a binary search to reduce the number of comparisons in situations
// where have some idea as to how many unique values there are and where the next value might be
    FindFirstForward(value, range, unique) {
        if (range.length() === 0) return range.start;
        let index = Math.trunc(Math.max(range.length() / unique, 1));
        // let skip = index
        let skip = index

        for (index = range.start + skip; this.Reads.compareValues(this.Reads.get(index - 1), value) < 0; index += skip) {
            if (index >= range.end - skip)
                return this.BinaryFirst(value, new Range(index, range.end));
        }
        return this.BinaryFirst(value, new Range(index - skip, index));
    }

    FindLastForward(value, range, unique) {
        if (range.length() === 0) return range.start;
        let index = Math.trunc(Math.max(range.length() / unique, 1));
        // let skip;
        let skip = index

        for (index = range.start + skip; this.Reads.compareValues(value, this.Reads.get(index - 1)) >= 0; index += skip)
            if (index >= range.end - skip)
                return this.BinaryLast(value, new Range(index, range.end));

        return this.BinaryLast(value, new Range(index - skip, index));
    }

    FindFirstBackward(value, range, unique) {
        if (range.length() === 0) return range.start;
        let index = Math.trunc(Math.max(range.length() / unique, 1));
        let skip = index

        for (index = range.end - skip; index > range.start && this.Reads.compareValues(this.Reads.get(index - 1), value) >= 0; index -= skip)
            if (index < range.start + skip)
                return this.BinaryFirst(value, new Range(range.start, index));

        return this.BinaryFirst(value, new Range(index, index + skip));
    }

    FindLastBackward(value, range, unique) {
        if (range.length() === 0) return range.start;
        let index = Math.trunc(Math.max(range.length() / unique, 1));
        let skip = index

        for (index = range.end - skip; index > range.start && this.Reads.compareValues(value, this.Reads.get(index - 1)) < 0; index -= skip)
            if (index < range.start + skip)
                return this.BinaryLast(value, new Range(range.start, index));

        return this.BinaryLast(value, new Range(index, index + skip));
    }

// n^2 sorting algorithm used to sort tiny chunks of the full array
    InsertionSort(range) {
        // InsertSort.customInsertSort(array, range.start, range.end, 0.5, false);
        let insertionSort = new InsertionSort(this.arrayVisualizer)
        insertionSort.runSort(range.start, range.end)
    }

// reverse a range of values within the array
    Reverse(range) {
        // Writes.reversal(array, range.start, range.end - 1, 1, true, false);
        let start = range.start
        let length = range.end - 1
        // for (let i = start; i < start + ((length - start + 1) / 2); i++) {
        //     this.Writes.swap(i, start + length - i);
        // }
        this.Writes.reversal(start, length, -1)
    }

// swap a series of values in the array
    BlockSwap(start1, start2, block_size) {
        for (let index = 0; index < block_size; index++) {
            this.Writes.swap(start1 + index, start2 + index);
        }
    }

// rotate the values in an array ([0 1 2 3] becomes [1 2 3 0] if we rotate by 1)
// this assumes that 0 <= amount <= range.length()
    Rotate(amount, range, use_cache) {
        if (range.length() === 0) return;

        let split;
        if (amount >= 0)
            split = range.start + amount;
        else
            split = range.end + amount;

        let range1 = new Range(range.start, split);
        let range2 = new Range(split, range.end);

        if (use_cache) {
            // if the smaller of the two ranges fits into the cache, it's *slightly* faster copying it there and shifting the elements over
            if (range1.length() <= range2.length()) {
                if (range1.length() <= this.cache_size) {
                    if (this.cache != null) {
                        this.Writes.arrayCopy(-1, range1.start, this.cache, 0, range1.length());
                        this.Writes.arrayCopy(-1, range2.start, -1, range1.start, range2.length());
                        this.Writes.arrayCopy(this.cache, 0, -1, range1.start + range2.length(), range1.length());
                    }
                    return;
                }
            } else {
                if (range2.length() <= this.cache_size) {
                    if (this.cache != null) {
                        this.Writes.reverseArrayCopy(-1, range2.start, this.cache, 0, range2.length());
                        this.Writes.reverseArrayCopy(-1, range1.start, -1, range2.end - range1.length(), range1.length());
                        this.Writes.reverseArrayCopy(this.cache, 0, -1, range1.start, range2.length());
                    }
                    return;
                }
            }
        }

        /*
        int lenA = range1.length();
        int lenB = range2.length();
        int pos = range.start;

        while(lenA != 0 && lenB != 0) {
            if(lenA <= lenB) {
                this.BlockSwap(array, pos, pos + lenA, lenA);
                pos += lenA;
                lenB -= lenA;
            }
            else {
                this.BlockSwap(array, pos + (lenA - lenB), pos + lenA, lenB);
                lenA -= lenB;
            }
        }
        */

        this.Reverse(range1);
        this.Reverse(range2);
        this.Reverse(range);
    }

// merge two ranges from one array and save the results into a different array
    MergeInto(from, A, B, into, at_index, tempwrite) {
        let A_index = A.start;
        let B_index = B.start;
        let insert_index = at_index;
        let A_last = A.end;
        let B_last = B.end;

        if (from === -1) {
            while (true) {
                if (this.Reads.compareInArr(B_index, A_index) >= 0) {
                    this.Writes.write(insert_index, this.Reads.get(A_index), into);


                    A_index++;
                    insert_index++;
                    if (A_index === A_last) {
                        // copy the remainder of B into the final array
                        this.Writes.arrayCopy(from, B_index, into, insert_index, B_last - B_index);
                        break;
                    }
                } else {
                    this.Writes.write(insert_index, this.Reads.get(B_index), into);

                    B_index++;
                    insert_index++;
                    if (B_index === B_last) {
                        // copy the remainder of A into the final array
                        this.Writes.arrayCopy(from, A_index, into, insert_index, A_last - A_index);
                        break;
                    }
                }
            }
        } else {
            while (true) {
                // if (this.Reads.compareInArr(B_index, A_index) >= 0) {
                console.log("FROM: "+from)
                if (this.Reads.compareValues(this.Reads.readValue(B_index, from), this.Reads.readValue(A_index, from)) >= 0) {

                    this.Writes.write(insert_index, this.Reads.get(A_index, from));


                    A_index++;
                    insert_index++;
                    if (A_index === A_last) {
                        // copy the remainder of B into the final array
                        this.Writes.arrayCopy(from, B_index, into, insert_index, B_last - B_index);
                        break;
                    }
                } else {
                    this.Writes.write(insert_index, this.Reads.get(B_index, from));

                    B_index++;
                    insert_index++;
                    if (B_index === B_last) {
                        // copy the remainder of A into the final array
                        this.Writes.arrayCopy(from, A_index, into, insert_index, A_last - A_index);
                        break;
                    }
                }
            }
        }
    }

// merge operation using an external buffer,
    MergeExternal(A, B) {
        // A fits into the cache, so use that instead of the internal buffer
        let A_index = 0;
        let B_index = B.start;
        let insert_index = A.start;
        let A_last = A.length();
        let B_last = B.end;

        if (B.length() > 0 && A.length() > 0) {
            while (true) {
                if (this.Reads.compareValues(this.Reads.get(B_index), this.Reads.get(A_index, this.cache)) >= 0) {
                    this.Writes.write(insert_index, this.Reads.get(A_index, this.cache));
                    A_index++;
                    insert_index++;
                    if (A_index === A_last) break;
                } else {
                    this.Writes.write(insert_index, this.Reads.get(B_index));
                    B_index++;
                    insert_index++;
                    if (B_index === B_last) break;
                }
            }
        }


        // copy the remainder of A into the final array
        if (this.cache != null) {
            this.Writes.arrayCopy(this.cache, A_index, -1, insert_index, A_last - A_index, 1, true, false);
        }
    }

// merge operation using an internal buffer
    MergeInternal(A, B, buffer) {
        // whenever we find a value to add to the final array, swap it with the value that's already in that spot
        // when this algorithm is finished, 'buffer' will contain its original contents, but in a different order
        let A_count = 0, B_count = 0, insert = 0;

        if (B.length() > 0 && A.length() > 0) {
            while (true) {
                if (this.Reads.compareInArr(B.start + B_count, buffer.start + A_count) >= 0) {
                    this.Writes.swap(A.start + insert, buffer.start + A_count);
                    A_count++;
                    insert++;
                    if (A_count >= A.length()) break;
                } else {
                    this.Writes.swap(A.start + insert, B.start + B_count);
                    B_count++;
                    insert++;
                    if (B_count >= B.length()) break;
                }
            }
        }
        // swap the remainder of A into the final array
        this.BlockSwap(buffer.start + A_count, A.start + insert, A.length() - A_count);
    }

// merge operation without a buffer
    MergeInPlace(A, B) {
        if (A.length() === 0 || B.length() === 0) return;

        /*
            this just repeatedly binary searches into B and rotates A into position.
            the paper suggests using the 'rotation-based Hwang and Lin algorithm' here,
            but I decided to stick with this because it had better situational performance

            (Hwang and Lin is designed for merging subarrays of very different sizes,
            but WikiSort almost always uses subarrays that are roughly the same size)

            normally this is incredibly suboptimal, but this function is only called
            when none of the A or B blocks in any subarray contained 2√A unique values,
            which places a hard limit on the number of times this will ACTUALLY need
            to binary search and rotate.

            according to my analysis the worst case is √A rotations performed on √A items
            once the constant factors are removed, which ends up being O(n)

            again, this is NOT a general-purpose solution – it only works well in this case!
            kind of like how the O(n^2) insertion sort is used in some places
         */

        A = new Range(A.start, A.end);
        B = new Range(B.start, B.end);

        while (true) {
            // find the first place in B where the first item in A needs to be inserted
            let mid = this.BinaryFirst(this.Reads.readValue(A.start), B)

            // rotate A into place
            let amount = mid - A.end;
            this.Rotate(-amount, new Range(A.start, mid), true);
            if (B.end === mid) break;

            // calculate the new A and B ranges
            B.start = mid;
            A.set(A.start + amount, B.start);
            A.start = this.BinaryLast(this.Reads.readValue(A.start), A);
            if (A.length() === 0) break;
        }
    }

    NetSwap(order, range, x, y) {
        let compare = this.Reads.compareInArr(range.start + x, range.start + y);
        if (compare > 0 || (this.Reads.compareValues(order[x], order[y]) > 0 && compare === 0)) {
            // console.log(range.start + x)
            // console.log(range.start + y)
            this.Writes.swap(range.start + x, range.start + y);
            let tmp = order[x]
            order[x] = order[y]
            order[y] = tmp
            // this.Writes.swap(order, x, y, 0, false, false);
        }
    }

// bottom-up merge sort combined with an in-place merge algorithm for O(1) memory use
    Sort(len) {
        let size = len;

        // if the array is of size 0, 1, 2, or 3, just sort them like so:
        if (size < 4) {
            let insertionSort = new InsertionSort(this.arrayVisualizer)
            insertionSort.runSort(0, len)
            // if (size === 3) {
            //     // hard-coded insertion sort
            //     if (Reads.compareInArr(array[1], array[0]) < 0) {
            //         Writes.swap(array, 0, 1, 1, true, false);
            //     }
            //     if (Reads.compareValues(array[2], array[1]) < 0) {
            //         Writes.swap(array, 1, 2, 1, true, false);
            //         if (Reads.compareValues(array[1], array[0]) < 0) {
            //             Writes.swap(array, 0, 1, 1, true, false);
            //         }
            //     }
            // } else if (size == 2) {
            //     // swap the items if they're out of order
            //     if (Reads.compareValues(array[1], array[0]) < 0) {
            //         Writes.swap(array, 0, 1, 1, true, false);
            //     }
            // }
            return;
        }

        // sort groups of 4-8 items at a time using an unstable sorting network,
        // but keep track of the original item orders to force it to be stable
        // http://pages.ripco.net/~jgamble/nw.html
        let iterator = new Iterator(size, 4);
        while (!iterator.finished()) {
            let order = [0, 1, 2, 3, 4, 5, 6, 7];
            let range = iterator.nextRange();

            if (range.length() === 8) {
                this.NetSwap(order, range, 0, 1);
                this.NetSwap(order, range, 2, 3);
                this.NetSwap(order, range, 4, 5);
                this.NetSwap(order, range, 6, 7);
                this.NetSwap(order, range, 0, 2);
                this.NetSwap(order, range, 1, 3);
                this.NetSwap(order, range, 4, 6);
                this.NetSwap(order, range, 5, 7);
                this.NetSwap(order, range, 1, 2);
                this.NetSwap(order, range, 5, 6);
                this.NetSwap(order, range, 0, 4);
                this.NetSwap(order, range, 3, 7);
                this.NetSwap(order, range, 1, 5);
                this.NetSwap(order, range, 2, 6);
                this.NetSwap(order, range, 1, 4);
                this.NetSwap(order, range, 3, 6);
                this.NetSwap(order, range, 2, 4);
                this.NetSwap(order, range, 3, 5);
                this.NetSwap(order, range, 3, 4);

            } else if (range.length() === 7) {
                this.NetSwap(order, range, 1, 2);
                this.NetSwap(order, range, 3, 4);
                this.NetSwap(order, range, 5, 6);
                this.NetSwap(order, range, 0, 2);
                this.NetSwap(order, range, 3, 5);
                this.NetSwap(order, range, 4, 6);
                this.NetSwap(order, range, 0, 1);
                this.NetSwap(order, range, 4, 5);
                this.NetSwap(order, range, 2, 6);
                this.NetSwap(order, range, 0, 4);
                this.NetSwap(order, range, 1, 5);
                this.NetSwap(order, range, 0, 3);
                this.NetSwap(order, range, 2, 5);
                this.NetSwap(order, range, 1, 3);
                this.NetSwap(order, range, 2, 4);
                this.NetSwap(order, range, 2, 3);

            } else if (range.length() === 6) {
                this.NetSwap(order, range, 1, 2);
                this.NetSwap(order, range, 4, 5);
                this.NetSwap(order, range, 0, 2);
                this.NetSwap(order, range, 3, 5);
                this.NetSwap(order, range, 0, 1);
                this.NetSwap(order, range, 3, 4);
                this.NetSwap(order, range, 2, 5);
                this.NetSwap(order, range, 0, 3);
                this.NetSwap(order, range, 1, 4);
                this.NetSwap(order, range, 2, 4);
                this.NetSwap(order, range, 1, 3);
                this.NetSwap(order, range, 2, 3);

            } else if (range.length() === 5) {
                this.NetSwap(order, range, 0, 1);
                this.NetSwap(order, range, 3, 4);
                this.NetSwap(order, range, 2, 4);
                this.NetSwap(order, range, 2, 3);
                this.NetSwap(order, range, 1, 4);
                this.NetSwap(order, range, 0, 3);
                this.NetSwap(order, range, 0, 2);
                this.NetSwap(order, range, 1, 3);
                this.NetSwap(order, range, 1, 2);

            } else if (range.length() === 4) {
                this.NetSwap(order, range, 0, 1);
                this.NetSwap(order, range, 2, 3);
                this.NetSwap(order, range, 0, 2);
                this.NetSwap(order, range, 1, 3);
                this.NetSwap(order, range, 1, 2);
            }
        }
        if (size < 8) return;


        // we need to keep track of a lot of ranges during this sort!
        let buffer1 = new Range(), buffer2 = new Range();
        let blockA = new Range(), blockB = new Range();
        let lastA = new Range(), lastB = new Range();
        let firstA = new Range();
        let A = new Range(), B = new Range();

        let pull = new Array(2);
        pull[0] = new Pull();
        pull[1] = new Pull();

        // then merge sort the higher levels, which can be 8-15, 16-31, 32-63, 64-127, etc.
        while (true) {

            // if every A and B block will fit into the cache, use a special branch specifically for merging with the cache
            // (we use < rather than <= since the block size might be one more than iterator.length())
            if (iterator.length() < this.cache_size) {

                // if four subarrays fit into the cache, it's faster to merge both pairs of subarrays into the cache,
                // then merge the two merged subarrays from the cache back into the original array
                if ((iterator.length() + 1) * 4 <= this.cache_size && iterator.length() * 4 <= size) {
                    iterator.begin();
                    while (!iterator.finished()) {
                        // merge A1 and B1 into the cache
                        let A1 = iterator.nextRange();
                        let B1 = iterator.nextRange();
                        let A2 = iterator.nextRange();
                        let B2 = iterator.nextRange();

                        if (this.Reads.compareInArr(B1.end - 1, A1.start) < 0) {
                            // the two ranges are in reverse order, so copy them in reverse order into the cache
                            this.Writes.arrayCopy(-1, A1.start, this.cache, B1.length(), A1.length());
                            this.Writes.arrayCopy(-1, B1.start, this.cache, 0, B1.length());
                        } else if (this.Reads.compareInArr(B1.start, A1.end - 1) < 0) {
                            // these two ranges weren't already in order, so merge them into the cache
                            this.MergeInto(-1, A1, B1, this.cache, 0, true);
                        } else {
                            // if A1, B1, A2, and B2 are all in order, skip doing anything else
                            if (this.Reads.compareInArr(B2.start, A2.end - 1) >= 0 && this.Reads.compareInArr(A2.start, B1.end - 1) >= 0) continue;

                            // copy A1 and B1 into the cache in the same order
                            this.Writes.arrayCopy(A1.start, this.cache, 0, A1.length(), 1);
                            this.Writes.arrayCopy(B1.start, this.cache, A1.length(), B1.length(), 1);
                        }
                        A1.set(A1.start, B1.end);

                        // merge A2 and B2 into the cache
                        if (this.Reads.compareInArr(B2.end - 1, A2.start) < 0) {
                            // the two ranges are in reverse order, so copy them in reverse order into the cache
                            this.Writes.arrayCopy(A2.start, this.cache, A1.length() + B2.length(), A2.length(), 1);
                            this.Writes.arrayCopy(B2.start, this.cache, A1.length(), B2.length(), 1);
                        } else if (this.Reads.compareInArr(B2.start, A2.end - 1) < 0) {
                            // these two ranges weren't already in order, so merge them into the cache
                            this.MergeInto(-1, A2, B2, this.cache, A1.length(), true);
                        } else {
                            // copy A2 and B2 into the cache in the same order
                            this.Writes.arrayCopy(A2.start, this.cache, A1.length(), A2.length(), 1);
                            this.Writes.arrayCopy(B2.start, this.cache, A1.length() + A2.length(), B2.length(), 1);
                        }
                        A2.set(A2.start, B2.end);

                        // merge A1 and A2 from the cache into the array
                        let A3 = new Range(0, A1.length());
                        let B3 = new Range(A1.length(), A1.length() + A2.length());

                        if (this.Reads.compareValues(this.Reads.readValue(B3.end - 1, this.cache), this.Reads.readValue(A3.start, this.cache)) < 0) {
                            // the two ranges are in reverse order, so copy them in reverse order into the cache
                            this.Writes.arrayCopy(this.cache, A3.start, -1, A1.start + A2.length(), A3.length(), 1, true, false);
                            this.Writes.arrayCopy(this.cache, B3.start, -1, A1.start, B3.length(), 1, true, false);
                        } else if (this.Reads.compareValues(this.Reads.readValue(B3.start, this.cache), this.Reads.readValue(A3.end - 1, this.cache)) < 0) {
                            // these two ranges weren't already in order, so merge them back into the array
                            this.MergeInto(this.cache, A3, B3, -1, A1.start, false);
                        } else {
                            // copy A3 and B3 into the array in the same order
                            this.Writes.arraycopy(this.cache, A3.start, -1, A1.start, A3.length(), 1);
                            this.Writes.arraycopy(this.cache, B3.start, -1, A1.start + A1.length(), B3.length(), 1);
                        }
                    }

                    // we merged two levels at the same time, so we're done with this level already
                    // (iterator.nextLevel() is called again at the bottom of this outer merge loop)
                    iterator.nextLevel();

                } else {
                    iterator.begin();
                    while (!iterator.finished()) {
                        A = iterator.nextRange();
                        B = iterator.nextRange();

                        if (this.Reads.compareInArr(B.end - 1, A.start) < 0) {
                            // the two ranges are in reverse order, so a simple rotation should fix it
                            this.Rotate(A.length(), new Range(A.start, B.end), true);
                        } else if (this.Reads.compareInArr(B.start, A.end - 1) < 0) {
                            // these two ranges weren't already in order, so we'll need to merge them!
                            this.Writes.arrayCopy(-1, A.start, this.cache, 0, A.length(), 1);
                            this.MergeExternal(A, B);
                        }
                    }
                }
            } else {
                // this is where the in-place merge logic starts!
                // 1. pull out two internal buffers each containing √A unique values
                //     1a. adjust block_size and buffer_size if we couldn't find enough unique values
                // 2. loop over the A and B subarrays within this level of the merge sort
                //     3. break A and B into blocks of size 'block_size'
                //     4. "tag" each of the A blocks with values from the first internal buffer
                //     5. roll the A blocks through the B blocks and drop/rotate them where they belong
                //     6. merge each A block with any B values that follow, using the cache or the second internal buffer
                // 7. sort the second internal buffer if it exists
                // 8. redistribute the two internal buffers back into the array

                let block_size = Math.trunc(Math.sqrt(iterator.length()));
                let buffer_size = Math.trunc(iterator.length() / block_size) + 1;

                // as an optimization, we really only need to pull out the internal buffers once for each level of merges
                // after that we can reuse the same buffers over and over, then redistribute it when we're finished with this level
                let index, last, count, pull_index = 0;
                buffer1.set(0, 0);
                buffer2.set(0, 0);

                pull[0].reset();
                pull[1].reset();

                // find two internal buffers of size 'buffer_size' each
                let find = buffer_size + buffer_size;
                let find_separately = false;

                if (block_size <= this.cache_size) {
                    // if every A block fits into the cache then we won't need the second internal buffer,
                    // so we really only need to find 'buffer_size' unique values
                    find = buffer_size;
                } else if (find > iterator.length()) {
                    // we can't fit both buffers into the same A or B subarray, so find two buffers separately
                    find = buffer_size;
                    find_separately = true;
                }

                // we need to find either a single contiguous space containing 2√A unique values (which will be split up into two buffers of size √A each),
                // or we need to find one buffer of < 2√A unique values, and a second buffer of √A unique values,
                // OR if we couldn't find that many unique values, we need the largest possible buffer we can get

                // in the case where it couldn't find a single buffer of at least √A unique values,
                // all of the Merge steps must be replaced by a different merge algorithm (MergeInPlace)

                iterator.begin();
                while (!iterator.finished()) {
                    A = iterator.nextRange();
                    B = iterator.nextRange();

                    // check A for the number of unique values we need to fill an internal buffer
                    // these values will be pulled out to the start of A
                    for (last = A.start, count = 1; count < find; last = index, count++) {
                        index = this.FindLastForward(this.Reads.readValue(last), new Range(last + 1, A.end), find - count);
                        if (index === A.end) break;
                    }
                    index = last;

                    if (count >= buffer_size) {
                        // keep track of the range within the array where we'll need to "pull out" these values to create the internal buffer
                        pull[pull_index].range.set(A.start, B.end);
                        pull[pull_index].count = count;
                        pull[pull_index].from = index;
                        pull[pull_index].to = A.start;
                        pull_index = 1;

                        if (count === buffer_size + buffer_size) {
                            // we were able to find a single contiguous section containing 2√A unique values,
                            // so this section can be used to contain both of the internal buffers we'll need
                            buffer1.set(A.start, A.start + buffer_size);
                            buffer2.set(A.start + buffer_size, A.start + count);
                            break;
                        } else if (find === buffer_size + buffer_size) {
                            // we found a buffer that contains at least √A unique values, but did not contain the full 2√A unique values,
                            // so we still need to find a second separate buffer of at least √A unique values
                            buffer1.set(A.start, A.start + count);
                            find = buffer_size;
                        } else if (block_size <= this.cache_size) {
                            // we found the first and only internal buffer that we need, so we're done!
                            buffer1.set(A.start, A.start + count);
                            break;
                        } else if (find_separately) {
                            // found one buffer, but now find the other one
                            buffer1 = new Range(A.start, A.start + count);
                            find_separately = false;
                        } else {
                            // we found a second buffer in an 'A' subarray containing √A unique values, so we're done!
                            buffer2.set(A.start, A.start + count);
                            break;
                        }
                    } else if (pull_index === 0 && count > buffer1.length()) {
                        // keep track of the largest buffer we were able to find
                        buffer1.set(A.start, A.start + count);

                        pull[pull_index].range.set(A.start, B.end);
                        pull[pull_index].count = count;
                        pull[pull_index].from = index;
                        pull[pull_index].to = A.start;
                    }

                    // check B for the number of unique values we need to fill an internal buffer
                    // these values will be pulled out to the end of B
                    for (last = B.end - 1, count = 1; count < find; last = index - 1, count++) {
                        index = this.FindFirstBackward(this.Reads.readValue(last), new Range(B.start, last), find - count);
                        if (index === B.start) break;
                    }
                    index = last;

                    if (count >= buffer_size) {
                        // keep track of the range within the array where we'll need to "pull out" these values to create the internal buffer
                        pull[pull_index].range.set(A.start, B.end);
                        pull[pull_index].count = count;
                        pull[pull_index].from = index;
                        pull[pull_index].to = B.end;
                        pull_index = 1;

                        if (count === buffer_size + buffer_size) {
                            // we were able to find a single contiguous section containing 2√A unique values,
                            // so this section can be used to contain both of the internal buffers we'll need
                            buffer1.set(B.end - count, B.end - buffer_size);
                            buffer2.set(B.end - buffer_size, B.end);
                            break;
                        } else if (find === buffer_size + buffer_size) {
                            // we found a buffer that contains at least √A unique values, but did not contain the full 2√A unique values,
                            // so we still need to find a second separate buffer of at least √A unique values
                            buffer1.set(B.end - count, B.end);
                            find = buffer_size;
                        } else if (block_size <= this.cache_size) {
                            // we found the first and only internal buffer that we need, so we're done!
                            buffer1.set(B.end - count, B.end);
                            break;
                        } else if (find_separately) {
                            // found one buffer, but now find the other one
                            buffer1 = new Range(B.end - count, B.end);
                            find_separately = false;
                        } else {
                            // buffer2 will be pulled out from a 'B' subarray, so if the first buffer was pulled out from the corresponding 'A' subarray,
                            // we need to adjust the end point for that A subarray so it knows to stop redistributing its values before reaching buffer2
                            if (pull[0].range.start === A.start) pull[0].range.end -= pull[1].count;

                            // we found a second buffer in an 'B' subarray containing √A unique values, so we're done!
                            buffer2.set(B.end - count, B.end);
                            break;
                        }
                    } else if (pull_index === 0 && count > buffer1.length()) {
                        // keep track of the largest buffer we were able to find
                        buffer1.set(B.end - count, B.end);

                        pull[pull_index].range.set(A.start, B.end);
                        pull[pull_index].count = count;
                        pull[pull_index].from = index;
                        pull[pull_index].to = B.end;
                    }
                }

                // pull out the two ranges so we can use them as internal buffers
                for (pull_index = 0; pull_index < 2; pull_index++) {
                    let length = pull[pull_index].count;

                    if (pull[pull_index].to < pull[pull_index].from) {
                        // we're pulling the values out to the left, which means the start of an A subarray
                        index = pull[pull_index].from;
                        for (count = 1; count < length; count++) {
                            index = this.FindFirstBackward(this.Reads.readValue(index - 1), new Range(pull[pull_index].to, pull[pull_index].from - (count - 1)), length - count);
                            let range = new Range(index + 1, pull[pull_index].from + 1);
                            this.Rotate(range.length() - count, range, true);
                            pull[pull_index].from = index + count;
                        }
                    } else if (pull[pull_index].to > pull[pull_index].from) {
                        // we're pulling values out to the right, which means the end of a B subarray
                        index = pull[pull_index].from + 1;
                        for (count = 1; count < length; count++) {
                            index = this.FindLastForward(this.Reads.readValue(index), new Range(index, pull[pull_index].to), length - count);
                            let range = new Range(pull[pull_index].from, index - 1);
                            this.Rotate(count, range, true);
                            pull[pull_index].from = index - 1 - count;
                        }
                    }
                }

                // adjust block_size and buffer_size based on the values we were able to pull out
                buffer_size = buffer1.length();
                block_size = Math.trunc(iterator.length() / buffer_size) + 1;

                // the first buffer NEEDS to be large enough to tag each of the evenly sized A blocks,
                // so this was originally here to test the math for adjusting block_size above
                //if ((iterator.length() + 1)/block_size > buffer_size) throw new RuntimeException();

                // now that the two internal buffers have been created, it's time to merge each A+B combination at this level of the merge sort!
                iterator.begin();
                while (!iterator.finished()) {
                    A = iterator.nextRange();
                    B = iterator.nextRange();

                    // remove any parts of A or B that are being used by the internal buffers
                    let start = A.start;
                    if (start === pull[0].range.start) {
                        if (pull[0].from > pull[0].to) {
                            A.start += pull[0].count;

                            // if the internal buffer takes up the entire A or B subarray, then there's nothing to merge
                            // this only happens for very small subarrays, like √4 = 2, 2 * (2 internal buffers) = 4,
                            // which also only happens when cache_size is small or 0 since it'd otherwise use MergeExternal
                            if (A.length() === 0) continue;
                        } else if (pull[0].from < pull[0].to) {
                            B.end -= pull[0].count;
                            if (B.length() === 0) continue;
                        }
                    }
                    if (start === pull[1].range.start) {
                        if (pull[1].from > pull[1].to) {
                            A.start += pull[1].count;
                            if (A.length() === 0) continue;
                        } else if (pull[1].from < pull[1].to) {
                            B.end -= pull[1].count;
                            if (B.length() === 0) continue;
                        }
                    }

                    if (this.Reads.compareInArr(B.end - 1, A.start) < 0) {
                        // the two ranges are in reverse order, so a simple rotation should fix it
                        this.Rotate(A.length(), new Range(A.start, B.end), true);
                    } else if (this.Reads.compareInArr(A.end, A.end - 1) < 0) {
                        // these two ranges weren't already in order, so we'll need to merge them!

                        // break the remainder of A into blocks. firstA is the uneven-sized first A block
                        blockA.set(A.start, A.end);
                        firstA.set(A.start, A.start + blockA.length() % block_size);

                        // swap the first value of each A block with the value in buffer1
                        let indexA = buffer1.start;
                        for (index = firstA.end; index < blockA.end; index += block_size) {
                            this.Writes.swap(indexA, index);
                            indexA++;
                        }

                        // start rolling the A blocks through the B blocks!
                        // whenever we leave an A block behind, we'll need to merge the previous A block with any B blocks that follow it, so track that information as well
                        lastA.set(firstA.start, firstA.end);
                        lastB.set(0, 0);
                        blockB.set(B.start, B.start + Math.min(block_size, B.length()));
                        blockA.start += firstA.length();
                        indexA = buffer1.start;

                        // if the first unevenly sized A block fits into the cache, copy it there for when we go to Merge it
                        // otherwise, if the second buffer is available, block swap the contents into that
                        if (lastA.length() <= this.cache_size && this.cache != null) {
                            this.Writes.arrayCopy(-1, lastA.start, this.cache, 0, lastA.length(), 1);
                        } else if (buffer2.length() > 0)
                            this.BlockSwap(lastA.start, buffer2.start, lastA.length());

                        if (blockA.length() > 0) {
                            while (true) {
                                // if there's a previous B block and the first value of the minimum A block is <= the last value of the previous B block,
                                // then drop that minimum A block behind. or if there are no B blocks left then keep dropping the remaining A blocks.
                                if ((lastB.length() > 0 && this.Reads.compareInArr(lastB.end - 1, indexA) >= 0) || blockB.length() === 0) {
                                    // figure out where to split the previous B block, and rotate it at the split
                                    let B_split = this.BinaryFirst(this.Reads.readValue(indexA), lastB);
                                    let B_remaining = lastB.end - B_split;

                                    // swap the minimum A block to the beginning of the rolling A blocks
                                    let minA = blockA.start;
                                    for (let findA = minA + block_size; findA < blockA.end; findA += block_size)
                                        if (this.Reads.compareInArr(findA, minA) < 0)
                                            minA = findA;
                                    this.BlockSwap(blockA.start, minA, block_size);

                                    // swap the first item of the previous A block back with its original value, which is stored in buffer1
                                    this.Writes.swap(blockA.start, indexA);
                                    indexA++;

                                    // locally merge the previous A block with the B values that follow it
                                    // if lastA fits into the external cache we'll use that (with MergeExternal),
                                    // or if the second internal buffer exists we'll use that (with MergeInternal),
                                    // or failing that we'll use a strictly in-place merge algorithm (MergeInPlace)
                                    if (lastA.length() <= this.cache_size)
                                        this.MergeExternal(lastA, new Range(lastA.end, B_split));
                                    else if (buffer2.length() > 0)
                                        this.MergeInternal(lastA, new Range(lastA.end, B_split), buffer2);
                                    else
                                        this.MergeInPlace(lastA, new Range(lastA.end, B_split));

                                    if (buffer2.length() > 0 || block_size <= this.cache_size) {
                                        // copy the previous A block into the cache or buffer2, since that's where we need it to be when we go to merge it anyway
                                        if (block_size <= this.cache_size) {
                                            this.Writes.arrayCopy(-1, blockA.start, this.cache, 0, block_size, 1, true, true);
                                        } else
                                            this.BlockSwap(blockA.start, buffer2.start, block_size);

                                        // this is equivalent to rotating, but faster
                                        // the area normally taken up by the A block is either the contents of buffer2, or data we don't need anymore since we memcopied it
                                        // either way, we don't need to retain the order of those items, so instead of rotating we can just block swap B to where it belongs
                                        this.BlockSwap(B_split, blockA.start + block_size - B_remaining, B_remaining);
                                    } else {
                                        // we are unable to use the 'buffer2' trick to speed up the rotation operation since buffer2 doesn't exist, so perform a normal rotation
                                        this.Rotate(blockA.start - B_split, new Range(B_split, blockA.start + block_size), true);
                                    }

                                    // update the range for the remaining A blocks, and the range remaining from the B block after it was split
                                    lastA.set(blockA.start - B_remaining, blockA.start - B_remaining + block_size);
                                    lastB.set(lastA.end, lastA.end + B_remaining);

                                    // if there are no more A blocks remaining, this step is finished!
                                    blockA.start += block_size;
                                    if (blockA.length() === 0)
                                        break;

                                } else if (blockB.length() < block_size) {
                                    // move the last B block, which is unevenly sized, to before the remaining A blocks, by using a rotation
                                    // the cache is disabled here since it might contain the contents of the previous A block
                                    this.Rotate(-blockB.length(), new Range(blockA.start, blockB.end), false);

                                    lastB.set(blockA.start, blockA.start + blockB.length());
                                    blockA.start += blockB.length();
                                    blockA.end += blockB.length();
                                    blockB.end = blockB.start;
                                } else {
                                    // roll the leftmost A block to the end by swapping it with the next B block
                                    this.BlockSwap(blockA.start, blockB.start, block_size);
                                    lastB.set(blockA.start, blockA.start + block_size);

                                    blockA.start += block_size;
                                    blockA.end += block_size;
                                    blockB.start += block_size;
                                    blockB.end += block_size;

                                    if (blockB.end > B.end)
                                        blockB.end = B.end;
                                }
                            }
                        }

                        // merge the last A block with the remaining B values
                        if (lastA.length() <= this.cache_size)
                            this.MergeExternal(lastA, new Range(lastA.end, B.end));
                        else if (buffer2.length() > 0)
                            this.MergeInternal(lastA, new Range(lastA.end, B.end), buffer2);
                        else
                            this.MergeInPlace(lastA, new Range(lastA.end, B.end));
                    }
                }


                // when we're finished with this merge step we should have the one or two internal buffers left over, where the second buffer is all jumbled up
                // insertion sort the second buffer, then redistribute the buffers back into the array using the opposite process used for creating the buffer

                // while an unstable sort like quick sort could be applied here, in benchmarks it was consistently slightly slower than a simple insertion sort,
                // even for tens of millions of items. this may be because insertion sort is quite fast when the data is already somewhat sorted, like it is here


                this.InsertionSort(buffer2)

                for (pull_index = 0; pull_index < 2; pull_index++) {
                    let unique = pull[pull_index].count * 2;
                    if (pull[pull_index].from > pull[pull_index].to) {
                        // the values were pulled out to the left, so redistribute them back to the right
                        let buffer = new Range(pull[pull_index].range.start, pull[pull_index].range.start + pull[pull_index].count);
                        while (buffer.length() > 0) {
                            index = this.FindFirstForward(this.Reads.readValue(buffer.start), new Range(buffer.end, pull[pull_index].range.end), unique);
                            let amount = index - buffer.end;
                            this.Rotate(buffer.length(), new Range(buffer.start, index), true);
                            buffer.start += (amount + 1);
                            buffer.end += amount;
                            unique -= 2;
                        }
                    } else if (pull[pull_index].from < pull[pull_index].to) {
                        // the values were pulled out to the right, so redistribute them back to the left
                        let buffer = new Range(pull[pull_index].range.end - pull[pull_index].count, pull[pull_index].range.end);
                        while (buffer.length() > 0) {
                            index = this.FindLastBackward(this.Reads.readValue(buffer.end - 1), new Range(pull[pull_index].range.start, buffer.start), unique);
                            let amount = buffer.start - index;
                            this.Rotate(amount, new Range(index, buffer.end), true);
                            buffer.start -= amount;
                            buffer.end -= (amount + 1);
                            unique -= 2;
                        }
                    }
                }
            }

            // double the size of each A and B subarray that will be merged in the next level
            if (!iterator.nextLevel()) break;
        }
    }
    runSort(low, high, bucketsNum, bufferSize){
        if(bufferSize!==0){
            this.cache_size = bufferSize
            this.cache = this.Writes.createAuxArray(bufferSize)
        }
        this.Sort(high+1)
        this.Writes.removeAuxArray(this.cache)
    }
}
