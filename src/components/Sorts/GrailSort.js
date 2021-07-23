/*
 * MIT License
 * 
 * Copyright (c) 2013 Andrey Astrelin
 * Copyright (c) 2020 The Holy Grail Sort Project
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/*
 * The Holy Grail Sort Project
 * Project Manager:      Summer Dragonfly
 * Project Contributors: 666666t
 *                       Anonymous0726
 *                       aphitorite
 *                       dani_dlg
 *                       EilrahcF
 *                       Enver
 *                       lovebuny
 *                       MP
 *                       phoenixbound
 *                       thatsOven
 *                       
 * Special thanks to "The Studio" Discord community!
 */

// Credit to phoenixbound for this clever idea

import {Sort} from "./Sort";

const Subarray = {
    LEFT: 1,
    RIGHT: 2,
};

// REWRITTEN GRAILSORT FOR JAVASCRIPT - A heavily refactored C/C++-to-JavaScript version of
//                                      Andrey Astrelin's GrailSort.h, aiming to be as
//                                      readable and intuitive as possible.
//
// ** Written and maintained by The Holy Grail Sort Project
//
// Primary author: Enver
//
// Current status: Finished. Potentially 100% working... Passing most tests, some tests capped by V8 Engine memory allocation limits

export class GrailSort extends Sort {
    // static GRAIL_STATIC_EXT_BUF_LEN = 512;

    externalBuffer
    externalBufferLen

    constructor(arrayVisualizer) {
        super(arrayVisualizer);
        this.sortName = "GrailSort"
        this.isNeedBuffer = true;
    }

    grailSwap(a, b) {
        // let temp = array[a];
        // array[a] = array[b];
        // array[b] = temp;
        this.Writes.swap(a, b)
    }

    grailBlockSwap(a, b, blockLen) {
        for (let i = 0; i < blockLen; i++) {
            this.grailSwap(a + i, b + i);
        }
    }

    // Object src, int srcPos, Object dest, int destPos, int length
    // Custom method for copying parts of the array either:
    //      within itself to a different destination, or
    //      to another array
    arraycopy(srcArray, srcPos, destArray, destPos, copyLen) {
        this.Writes.arrayCopy(srcArray, srcPos, destArray, destPos, copyLen)
    }

    grailRotate(start, leftLen, rightLen) {
        while (leftLen > 0 && rightLen > 0) {
            if (leftLen <= rightLen) {
                this.grailBlockSwap(start, start + leftLen, leftLen);
                start += leftLen;
                rightLen -= leftLen;
            } else {
                this.grailBlockSwap(start + leftLen - rightLen, start + leftLen, rightLen);
                leftLen -= rightLen;
            }
        }
    }

    // Variant of Insertion Sort that utilizes swaps instead of overwrites.
    // Also known as "Optimized Gnomesort".
    grailInsertSort(start, length) {
        for (let item = 1; item < length; item++) {
            let left = start + item - 1;
            let right = start + item;

            while (left >= start && this.Reads.compareInArr(left,
                right) > 0) {
                this.grailSwap(left, right);
                left--;
                right--;
            }
        }
    }

    grailBinarySearchLeft(start, length, target) {
        let left = 0;
        let right = length;
        while (left < right) {
            let middle = left + parseInt((right - left) / 2);
            if (this.Reads.compareValues(this.Reads.readValue(start + middle), target) < 0) {
                left = middle + 1;
            } else {
                right = middle;
            }
        }
        return left;
    }

    // Credit to Anonymous0726 for debugging
    grailBinarySearchRight(start, length, target) {
        let left = 0;
        let right = length;
        while (left < right) {
            let middle = left + parseInt((right - left) / 2);
            if (this.Reads.compareValues(this.Reads.readValue(start + middle), target) > 0) {
                right = middle;
            } else {
                left = middle + 1;
            }
        }
        // OFF-BY-ONE BUG FIXED: used to be `return right - 1;`
        return right;
    }

    // cost: 2 * length + idealKeys^2 / 2
    grailCollectKeys(start, length, idealKeys) {
        let keysFound = 1; // by itself, the first item in the array is our first unique key
        let firstKey = 0; // the first item in the array is at the first position in the array
        let currentKey = 1; // the index used for finding potentially unique items ("keys") in the array

        while (currentKey < length && keysFound < idealKeys) {

            // Find the location in the key-buffer where our current key can be inserted in sorted order.
            // If the key at insertPos is equal to currentKey, then currentKey isn't unique and we move on.
            let insertPos = this.grailBinarySearchLeft(start + firstKey, keysFound, this.Reads.readValue(start + currentKey));

            // The second part of this conditional does the equal check we were just talking about; however,
            // if currentKey is larger than everything in the key-buffer (meaning insertPos == keysFound),
            // then that also tells us it wasn't *equal* to anything in the key-buffer. Magic! :) 
            if (insertPos === keysFound || this.Reads.compareInArr(start + currentKey,
                start + firstKey + insertPos) !== 0) {

                // First, rotate the key-buffer over to currentKey's immediate left...
                // (this helps save a TON of swaps/writes!!!)
                this.grailRotate(start + firstKey, keysFound, currentKey - (firstKey + keysFound));

                // Update the new position of firstKey...
                firstKey = currentKey - keysFound;

                // Then, "insertion sort" currentKey to its spot in the key-buffer!
                this.grailRotate(start + firstKey + insertPos, keysFound - insertPos, 1);

                // One step closer to idealKeys.
                keysFound++;
            }
            // Move on and test the next key...
            currentKey++;
        }

        // Bring however many keys we found back to the beginning of our array,
        // and return the number of keys collected.
        this.grailRotate(start, firstKey, keysFound);
        return keysFound;
    }

    grailPairwiseSwaps(start, length) {
        let index;
        for (index = 1; index < length; index += 2) {
            let left = start + index - 1;
            let right = start + index;

            if (this.Reads.compareInArr(left, right) > 0) {
                this.grailSwap(left - 2, right);
                this.grailSwap(right - 2, left);
            } else {
                this.grailSwap(left - 2, left);
                this.grailSwap(right - 2, right);
            }
        }

        let left = start + index - 1;
        if (left < start + length) {
            this.grailSwap(left - 2, left);
        }
    }

    grailPairwiseWrites(start, length) {
        let index;
        for (index = 1; index < length; index += 2) {
            let left = start + index - 1;
            let right = start + index;

            if (this.Reads.compareInArr(left, right) > 0) {
                this.Writes.write(left - 2, this.Reads.get(right))
                this.Writes.write(right - 2, this.Reads.get(left))
            } else {
                this.Writes.write(left - 2, this.Reads.get(left))
                this.Writes.write(right - 2, this.Reads.get(right))
            }
        }

        let left = start + index - 1;
        if (left < start + length) {
            this.Writes.write(left - 2, this.Reads.get(left))
        }
    }

    // array[buffer .. start - 1] <=> "scrolling buffer"
    // 
    // "scrolling buffer" + array[start, middle - 1] + array[middle, end - 1]
    // --> array[buffer, buffer + end - 1] + "scrolling buffer"
    grailMergeForwards(start, leftLen, rightLen, bufferOffset) {
        let left = start;
        let middle = start + leftLen;
        let right = middle;
        let end = middle + rightLen;
        let buffer = start - bufferOffset;

        while (right < end) {
            if (left === middle || this.Reads.compareInArr(left,
                right) > 0) {

                this.grailSwap(buffer, right);
                right++;
            } else {
                this.grailSwap(buffer, left);
                left++;
            }
            buffer++;
        }

        if (buffer !== left) {
            this.grailBlockSwap(buffer, left, middle - left);
        }
    }

    // credit to 666666t for thorough bug-checking/fixing
    grailMergeBackwards(start, leftLen, rightLen, bufferOffset) {
        let left = start + leftLen - 1;
        let middle = left;
        // OFF-BY-ONE BUG FIXED: used to be `let  right = middle + rightLen - 1;`
        let right = middle + rightLen;
        let end = start;
        // OFF-BY-ONE BUG FIXED: used to be `let buffer = right  + bufferOffset - 1;`
        let buffer = right + bufferOffset;

        while (left >= end) {
            if (right === middle || this.Reads.compareInArr(left,
                right) > 0) {

                this.grailSwap(buffer, left);
                left--;
            } else {
                this.grailSwap(buffer, right);
                right--;
            }
            buffer--;
        }

        if (right !== buffer) {
            while (right > middle) {
                this.grailSwap(buffer, right);
                buffer--;
                right--;
            }
        }
    }

    // array[buffer .. start - 1] <=> "free space"    
    //
    // "free space" + array[start, middle - 1] + array[middle, end - 1]
    // --> array[buffer, buffer + end - 1] + "free space"
    //
    // FUNCTION RENAMED: More consistent with "out-of-place" being at the end
    grailMergeOutOfPlace(start, leftLen, rightLen, bufferOffset) {
        let left = start;
        let middle = start + leftLen;
        let right = middle;
        let end = middle + rightLen;
        let buffer = start - bufferOffset;

        while (right < end) {
            if (left === middle || this.Reads.compareInArr(left,
                right) > 0) {

                this.Writes.write(buffer, this.Reads.get(right))
                right++;
            } else {
                this.Writes.write(buffer, this.Reads.get(left))
                left++;
            }
            buffer++;
        }

        if (buffer !== left) {
            while (left < middle) {
                this.Writes.write(buffer, this.Reads.get(left))
                buffer++;
                left++;
            }
        }
    }

    grailBuildInPlace(start, length, currentMerge, bufferLen) {
        for (let mergeLen = currentMerge; mergeLen < bufferLen; mergeLen *= 2) {
            let mergeIndex;
            let mergeEnd = start + length - (2 * mergeLen);
            let bufferOffset = mergeLen;

            for (mergeIndex = start; mergeIndex <= mergeEnd; mergeIndex += (2 * mergeLen)) {
                this.grailMergeForwards(mergeIndex, mergeLen, mergeLen, bufferOffset);
            }

            let leftOver = length - (mergeIndex - start);

            if (leftOver > mergeLen) {
                this.grailMergeForwards(mergeIndex, mergeLen, leftOver - mergeLen, bufferOffset);
            } else {
                this.grailRotate(mergeIndex - mergeLen, mergeLen, leftOver);
            }

            start -= mergeLen;
        }

        let finalBlock = length % (2 * bufferLen);
        let finalOffset = start + length - finalBlock;

        if (finalBlock <= bufferLen) {
            this.grailRotate(finalOffset, finalBlock, bufferLen);
        } else {
            this.grailMergeBackwards(finalOffset, bufferLen, finalBlock - bufferLen, bufferLen);
        }

        for (let mergeIndex = finalOffset - (2 * bufferLen); mergeIndex >= start; mergeIndex -= (2 * bufferLen)) {
            this.grailMergeBackwards(mergeIndex, bufferLen, bufferLen, bufferLen);
        }
    }

    grailBuildOutOfPlace(start, length, bufferLen, externLen) {
        this.arraycopy(-1, start - externLen, this.externalBuffer, 0, externLen);

        this.grailPairwiseWrites(start, length);
        start -= 2;

        let mergeLen;
        for (mergeLen = 2; mergeLen < externLen; mergeLen *= 2) {
            let mergeIndex;
            let mergeEnd = start + length - (2 * mergeLen);
            let bufferOffset = mergeLen;

            for (mergeIndex = start; mergeIndex <= mergeEnd; mergeIndex += (2 * mergeLen)) {
                this.grailMergeOutOfPlace(mergeIndex, mergeLen, mergeLen, bufferOffset);
            }

            let leftOver = length - (mergeIndex - start);

            if (leftOver > mergeLen) {
                this.grailMergeOutOfPlace(mergeIndex, mergeLen, leftOver - mergeLen, bufferOffset);
            } else {
                // TODO: Is this correct??
                for (let offset = 0; offset < leftOver; offset++) {
                    // array[mergeIndex + offset - mergeLen] = array[mergeIndex + offset];
                    this.Writes.write(mergeIndex + offset - mergeLen, this.Reads.get(mergeIndex + offset))
                }
            }

            start -= mergeLen;
        }

        this.arraycopy(this.externalBuffer, 0, -1, start + length, externLen);
        this.grailBuildInPlace(start, length, mergeLen, bufferLen);
    }

    // build blocks of length 'bufferLen'
    // input: [start - mergeLen, start - 1] elements are buffer
    // output: first 'bufferLen' elements are buffer, blocks (2 * bufferLen) and last subblock sorted
    grailBuildBlocks(start, length, bufferLen) {
        if (this.externalBuffer != null) {
            let externLen;

            if (bufferLen < this.externalBufferLen) {
                externLen = bufferLen;
            } else {
                // max power of 2 -- just in case
                externLen = 1;
                while ((externLen * 2) <= this.externalBufferLen) {
                    externLen *= 2;
                }
            }

            this.grailBuildOutOfPlace(start, length, bufferLen, externLen);
        } else {
            this.grailPairwiseSwaps(start, length);
            this.grailBuildInPlace(start - 2, length, 2, bufferLen);
        }
    }

    // Returns the final position of 'medianKey'.
    grailBlockSelectSort(keys, start, medianKey, blockCount, blockLen) {
        for (let block = 1; block < blockCount; block++) {
            let left = block - 1;
            let right = left;

            for (let index = block; index < blockCount; index++) {
                let compare = this.Reads.compareInArr(start + (right * blockLen),
                    start + (index * blockLen));

                if (compare > 0 || (compare == 0 && this.Reads.compareInArr(keys + right,
                    keys + index) > 0)) {
                    right = index;
                }
            }

            if (right != left) {
                // Swap the left and right selected blocks...
                this.grailBlockSwap(start + (left * blockLen), start + (right * blockLen), blockLen);

                // Swap the keys...
                this.grailSwap(keys + left, keys + right);

                // ...and follow the 'medianKey' if it was swapped

                // ORIGINAL LOC: if(midkey==u-1 || midkey==p) midkey^=(u-1)^p;
                // MASSIVE, MASSIVE credit to lovebuny for figuring this one out!
                if (medianKey == left) {
                    medianKey = right;
                } else if (medianKey == right) {
                    medianKey = left;
                }
            }
        }

        return medianKey;
    }

    // Swaps Grailsort's "scrolling buffer" from the right side of the array all the way back to 'start'.
    // Costs O(n) operations.
    //
    // OFF-BY-ONE BUG FIXED: used to be `int index = start + resetLen`; credit to 666666t for debugging
    grailInPlaceBufferReset(start, resetLen, bufferLen) {
        for (let index = start + resetLen - 1; index >= start; index--) {
            this.grailSwap(index, index - bufferLen);
        }
    }

    // Shifts entire array over 'bufferSize' spaces to make room for the out-of-place merging buffer.
    // Costs O(n) operations.
    //
    // OFF-BY-ONE BUG FIXED: used to be `int index = start + resetLen`; credit to 666666t for debugging
    grailOutOfPlaceBufferReset(start, resetLen, bufferLen) {
        for (let index = start + resetLen - 1; index >= start; index--) {
            this.Writes.write(index, this.Reads.get(index - bufferLen))
        }
    }

    // Rewinds Grailsort's "scrolling buffer" such that any items from a left subarray block left over by a "smart merge" are moved to
    // the right of the buffer. This is used to maintain stability and to continue an ongoing merge that has run out of buffer space.
    // Costs O(sqrt n) swaps in the *absolute* worst-case. 
    //
    // NAMING IMPROVED: the left over items are in the middle of the merge while the buffer is at the end
    grailInPlaceBufferRewind(start, leftOvers, buffer) {
        while (leftOvers > start) {
            leftOvers--;
            buffer--;
            this.grailSwap(buffer, leftOvers);
        }
    }

    // Rewinds Grailsort's out-of-place buffer such that any items from a left subarray block left over by a "smart merge" are moved to
    // the right of the buffer. This is used to maintain stability and to continue an ongoing merge that has run out of buffer space.
    // Costs O(sqrt n) writes in the *absolute* worst-case.
    //
    // INCORRECT ORDER OF PARAMETERS BUG FIXED: `leftOvers` should be the middle, and `buffer` should be the end
    grailOutOfPlaceBufferRewind(start, leftOvers, buffer) {
        while (leftOvers > start) {
            leftOvers--;
            buffer--;
            // array[buffer] = array[leftOvers];
            this.Writes.write(buffer, this.Reads.get(leftOvers))
        }
    }

    grailGetSubarray(currentKey, medianKey) {
        if (this.Reads.compareInArr(currentKey, medianKey) < 0) {
            return Subarray.LEFT;
        } else {
            return Subarray.RIGHT;
        }
    }

    // FUNCTION RENAMED: more clear *which* left blocks are being counted
    grailCountFinalLeftBlocks(offset, blockCount, blockLen) {
        let leftBlocks = 0;

        let firstRightBlock = offset + (blockCount * blockLen);
        let prevLeftBlock = firstRightBlock - blockLen;

        while (leftBlocks < blockCount && this.Reads.compareInArr(firstRightBlock,
            prevLeftBlock) < 0) {
            leftBlocks++;
            prevLeftBlock -= blockLen;
        }

        return leftBlocks;
    }

    grailSmartMerge(start, leftLen, leftOrigin, rightLen, bufferOffset) {
        let left = start;
        let middle = start + leftLen;
        let right = middle;
        let end = middle + rightLen;
        let buffer = start - bufferOffset;

        if (leftOrigin == Subarray.LEFT) {
            while (left < middle && right < end) {
                if (this.Reads.compareInArr(left, right) <= 0) {
                    this.grailSwap(buffer, left);
                    left++;
                } else {
                    this.grailSwap(buffer, right);
                    right++;
                }
                buffer++;
            }
        } else {
            while (left < middle && right < end) {
                if (this.Reads.compareInArr(left, right) < 0) {
                    this.grailSwap(buffer, left);
                    left++;
                } else {
                    this.grailSwap(buffer, right);
                    right++;
                }
                buffer++;
            }
        }

        if (left < middle) {
            this.currentBlockLen = middle - left;
            this.grailInPlaceBufferRewind(left, middle, end);
        } else {
            this.currentBlockLen = end - right;
            if (leftOrigin == Subarray.LEFT) {
                this.currentBlockOrigin = Subarray.RIGHT;
            } else {
                this.currentBlockOrigin = Subarray.LEFT;
            }
        }
    }

    grailSmartLazyMerge(start, leftLen, leftOrigin, rightLen) {
        if (leftOrigin == Subarray.LEFT) {
            if (this.Reads.compareInArr(start + leftLen - 1, start + leftLen) > 0) {
                while (leftLen != 0) {
                    let insertPos = this.grailBinarySearchLeft(start + leftLen, rightLen, this.Reads.readValue(start));

                    if (insertPos != 0) {
                        this.grailRotate(start, leftLen, insertPos);
                        start += insertPos;
                        rightLen -= insertPos;
                    }

                    if (rightLen == 0) {
                        this.currentBlockLen = leftLen;
                        return;
                    } else {
                        do {
                            start++;
                            leftLen--;
                        } while (leftLen != 0 && this.Reads.compareInArr(start,
                            start + leftLen) <= 0);
                    }
                }
            }
        } else {
            if (this.Reads.compareInArr(start + leftLen - 1, start + leftLen) >= 0) {
                while (leftLen != 0) {
                    let insertPos = this.grailBinarySearchRight(start + leftLen, rightLen, this.Reads.readValue(start));

                    if (insertPos != 0) {
                        this.grailRotate(start, leftLen, insertPos);
                        start += insertPos;
                        rightLen -= insertPos;
                    }

                    if (rightLen == 0) {
                        this.currentBlockLen = leftLen;
                        return;
                    } else {
                        do {
                            start++;
                            leftLen--;
                        } while (leftLen != 0 && this.Reads.compareInArr(start,
                            start + leftLen) < 0);
                    }
                }
            }
        }

        this.currentBlockLen = rightLen;
        if (leftOrigin == Subarray.LEFT) {
            this.currentBlockOrigin = Subarray.RIGHT;
        } else {
            this.currentBlockOrigin = Subarray.LEFT;
        }
    }

    // FUNCTION RENAMED: more consistent with other "out-of-place" merges
    grailSmartMergeOutOfPlace(start, leftLen, leftOrigin, rightLen, bufferOffset) {
        let left = start;
        let middle = start + leftLen;
        let right = middle;
        let end = middle + rightLen;
        let buffer = start - bufferOffset;

        if (leftOrigin == Subarray.LEFT) {
            while (left < middle && right < end) {
                if (this.Reads.compareInArr(left, right) <= 0) {
                    this.Writes.write(buffer, this.Reads.get(left))
                    left++;
                } else {
                    this.Writes.write(buffer, this.Reads.get(right))
                    right++;
                }
                buffer++;
            }
        } else {
            while (left < middle && right < end) {
                if (this.Reads.compareInArr(left, right) < 0) {
                    this.Writes.write(buffer, this.Reads.get(left))
                    left++;
                } else {
                    this.Writes.write(buffer, this.Reads.get(right))
                    right++;
                }
                buffer++;
            }
        }

        if (left < middle) {
            this.currentBlockLen = middle - left;
            this.grailOutOfPlaceBufferRewind(left, middle, end);
        } else {
            this.currentBlockLen = end - right;
            if (leftOrigin == Subarray.LEFT) {
                this.currentBlockOrigin = Subarray.RIGHT;
            } else {
                this.currentBlockOrigin = Subarray.LEFT;
            }
        }
    }

    grailMergeBlocks(keys, medianKey, start, blockCount, blockLen, finalLeftBlocks, finalLen) {
        let currentBlock;
        let blockIndex = blockLen;

        this.currentBlockLen = blockLen;
        this.currentBlockOrigin = this.grailGetSubarray(keys, medianKey);

        for (let keyIndex = 1; keyIndex < blockCount; keyIndex++, blockIndex += blockLen) {
            currentBlock = blockIndex - this.currentBlockLen;

            let nextBlockOrigin = this.grailGetSubarray(keys + keyIndex, medianKey);

            if (nextBlockOrigin == this.currentBlockOrigin) {
                this.grailBlockSwap(start + currentBlock - blockLen, start + currentBlock, this.currentBlockLen);
                currentBlock = blockIndex;

                this.currentBlockLen = blockLen;
            } else {
                this.grailSmartMerge(start + currentBlock, this.currentBlockLen, this.currentBlockOrigin, blockLen, blockLen);
            }
        }

        currentBlock = blockIndex - this.currentBlockLen;

        if (finalLen != 0) {
            if (this.currentBlockOrigin == Subarray.RIGHT) {
                this.grailBlockSwap(start + currentBlock - blockLen, start + currentBlock, this.currentBlockLen);
                currentBlock = blockIndex;

                this.currentBlockLen = blockLen * finalLeftBlocks;
                this.currentBlockOrigin = Subarray.LEFT;
            } else {
                this.currentBlockLen += blockLen * finalLeftBlocks;
            }

            this.grailMergeForwards(start + currentBlock, this.currentBlockLen, finalLen, blockLen);
        } else {
            this.grailBlockSwap(start + currentBlock, start + currentBlock - blockLen, this.currentBlockLen);
        }
    }

    grailLazyMergeBlocks(keys, medianKey, start, blockCount, blockLen, finalLeftBlocks, finalLen) {
        let currentBlock;
        let blockIndex = blockLen;

        this.currentBlockLen = blockLen;
        this.currentBlockOrigin = this.grailGetSubarray(keys, medianKey);

        for (let keyIndex = 1; keyIndex < blockCount; keyIndex++, blockIndex += blockLen) {
            currentBlock = blockIndex - this.currentBlockLen;

            let nextBlockOrigin = this.grailGetSubarray(keys + keyIndex, medianKey);

            if (nextBlockOrigin == this.currentBlockOrigin) {
                currentBlock = blockIndex;

                this.currentBlockLen = blockLen;
            } else {
                // These checks were included in the original code... but why???
                if (blockLen != 0 && this.currentBlockLen != 0) {
                    this.grailSmartLazyMerge(start + currentBlock, this.currentBlockLen, this.currentBlockOrigin, blockLen);
                }
            }
        }

        currentBlock = blockIndex - this.currentBlockLen;

        if (finalLen != 0) {
            if (this.currentBlockOrigin == Subarray.RIGHT) {
                currentBlock = blockIndex;

                this.currentBlockLen = blockLen * finalLeftBlocks;
                this.currentBlockOrigin = Subarray.LEFT;
            } else {
                this.currentBlockLen += blockLen * finalLeftBlocks;
            }

            this.grailLazyMerge(start + currentBlock, this.currentBlockLen, finalLen);
        }
    }

    grailMergeBlocksOutOfPlace(keys, medianKey, start, blockCount, blockLen, finalLeftBlocks, finalLen) {
        let currentBlock;
        let blockIndex = blockLen;

        this.currentBlockLen = blockLen;
        this.currentBlockOrigin = this.grailGetSubarray(keys, medianKey);

        for (let keyIndex = 1; keyIndex < blockCount; keyIndex++, blockIndex += blockLen) {
            currentBlock = blockIndex - this.currentBlockLen;

            let nextBlockOrigin = this.grailGetSubarray(keys + keyIndex, medianKey);

            if (nextBlockOrigin == this.currentBlockOrigin) {
                this.arraycopy(-1, start + currentBlock, -1, start + currentBlock - blockLen, this.currentBlockLen);
                currentBlock = blockIndex;

                this.currentBlockLen = blockLen;
            } else {
                this.grailSmartMergeOutOfPlace(start + currentBlock, this.currentBlockLen, this.currentBlockOrigin, blockLen, blockLen);
            }
        }

        currentBlock = blockIndex - this.currentBlockLen;

        if (finalLen != 0) {
            if (this.currentBlockOrigin == Subarray.RIGHT) {
                this.arraycopy(-1, start + currentBlock, -1, start + currentBlock - blockLen, this.currentBlockLen);
                currentBlock = blockIndex;

                this.currentBlockLen = blockLen * finalLeftBlocks;
                this.currentBlockOrigin = Subarray.LEFT;
            } else {
                this.currentBlockLen += blockLen * finalLeftBlocks;
            }

            this.grailMergeOutOfPlace(start + currentBlock, this.currentBlockLen, finalLen, blockLen);
        } else {
            this.arraycopy(-1, start + currentBlock, -1, start + currentBlock - blockLen, this.currentBlockLen);
        }
    }

    //TODO: Double-check "Merge Blocks" arguments
    grailCombineInPlace(keys, start, length, subarrayLen, blockLen, mergeCount, lastSubarray, buffer) {
        for (let mergeIndex = 0; mergeIndex < mergeCount; mergeIndex++) {
            let offset = start + (mergeIndex * (2 * subarrayLen));
            let blockCount = parseInt((2 * subarrayLen) / blockLen);

            this.grailInsertSort(keys, blockCount);

            // INCORRECT PARAMETER BUG FIXED: `block select sort` should be using `offset`, not `start`
            let medianKey = parseInt(subarrayLen / blockLen);
            medianKey = this.grailBlockSelectSort(keys, offset, medianKey, blockCount, blockLen);

            if (buffer) {
                this.grailMergeBlocks(keys, keys + medianKey, offset, blockCount, blockLen, 0, 0);
            } else {
                this.grailLazyMergeBlocks(keys, keys + medianKey, offset, blockCount, blockLen, 0, 0);
            }
        }

        // INCORRECT CONDITIONAL/PARAMETER BUG FIXED: Credit to 666666t for debugging.
        if (lastSubarray != 0) {
            let offset = start + (mergeCount * (2 * subarrayLen));
            let rightBlocks = parseInt(lastSubarray / blockLen);

            this.grailInsertSort(keys, rightBlocks + 1);

            // INCORRECT PARAMETER BUG FIXED: `block select sort` should be using `offset`, not `start`
            let medianKey = parseInt(subarrayLen / blockLen);
            medianKey = this.grailBlockSelectSort(keys, offset, medianKey, rightBlocks, blockLen);

            // MISSING BOUNDS CHECK BUG FIXED: `lastFragment` *can* be 0 if the `lastSubarray` is evenly
            //                                 divided into blocks. This prevents Grailsort from going
            //                                 out of bounds.
            let lastFragment = lastSubarray % blockLen;
            let leftBlocks;
            if (lastFragment != 0) {
                leftBlocks = this.grailCountFinalLeftBlocks(offset, rightBlocks, blockLen);
            } else {
                leftBlocks = 0;
            }

            let blockCount = rightBlocks - leftBlocks;

            //TODO: Double-check if this micro-optimization works correctly like the original
            if (blockCount == 0) {
                let leftLength = leftBlocks * blockLen;

                // INCORRECT PARAMETER BUG FIXED: these merges should be using `offset`, not `start`
                if (buffer) {
                    this.grailMergeForwards(offset, leftLength, lastFragment, blockLen);
                } else {
                    this.grailLazyMerge(offset, leftLength, lastFragment);
                }
            } else {
                if (buffer) {
                    this.grailMergeBlocks(keys, keys + medianKey, offset, blockCount, blockLen, leftBlocks, lastFragment);
                } else {
                    this.grailLazyMergeBlocks(keys, keys + medianKey, offset, blockCount, blockLen, leftBlocks, lastFragment);
                }
            }
        }

        if (buffer) {
            this.grailInPlaceBufferReset(start, length, blockLen);
        }
    }

    grailCombineOutOfPlace(keys, start, length, subarrayLen, blockLen, mergeCount, lastSubarray) {
        this.arraycopy(-1, start - blockLen, this.externalBuffer, 0, blockLen);

        for (let mergeIndex = 0; mergeIndex < mergeCount; mergeIndex++) {
            let offset = start + (mergeIndex * (2 * subarrayLen));
            let blockCount = parseInt((2 * subarrayLen) / blockLen);

            this.grailInsertSort(keys, blockCount);

            // INCORRECT PARAMETER BUG FIXED: `block select sort` should be using `offset`, not `start`
            let medianKey = parseInt(subarrayLen / blockLen);
            medianKey = this.grailBlockSelectSort(keys, offset, medianKey, blockCount, blockLen);

            this.grailMergeBlocksOutOfPlace(keys, keys + medianKey, offset, blockCount, blockLen, 0, 0);
        }

        // INCORRECT CONDITIONAL/PARAMETER BUG FIXED: Credit to 666666t for debugging.
        if (lastSubarray != 0) {
            let offset = start + (mergeCount * (2 * subarrayLen));
            let rightBlocks = parseInt(lastSubarray / blockLen);

            this.grailInsertSort(keys, rightBlocks + 1);

            // INCORRECT PARAMETER BUG FIXED: `block select sort` should be using `offset`, not `start`
            let medianKey = subarrayLen / blockLen;
            medianKey = this.grailBlockSelectSort(keys, offset, medianKey, rightBlocks, blockLen);

            // MISSING BOUNDS CHECK BUG FIXED: `lastFragment` *can* be 0 if the `lastSubarray` is evenly
            //                                 divided into blocks. This prevents Grailsort from going
            //                                 out of bounds.
            let lastFragment = lastSubarray % blockLen;
            let leftBlocks;
            if (lastFragment != 0) {
                leftBlocks = this.grailCountFinalLeftBlocks(offset, rightBlocks, blockLen);
            } else {
                leftBlocks = 0;
            }

            let blockCount = rightBlocks - leftBlocks;

            if (blockCount == 0) {
                // INCORRECT PARAMETER BUG FIXED: this merge should be using `offset`, not `start`
                let leftLength = leftBlocks * blockLen;
                this.grailMergeOutOfPlace(offset, leftLength, lastFragment, blockLen);
            } else {
                this.grailMergeBlocksOutOfPlace(keys, keys + medianKey, offset, blockCount, blockLen, leftBlocks, lastFragment);
            }
        }

        this.grailOutOfPlaceBufferReset(start, length, blockLen);
        this.arraycopy(this.externalBuffer, 0, -1, start - blockLen, blockLen);
    }

    // 'keys' are on the left side of array. Blocks of length 'subarrayLen' combined. We'll combine them in pairs
    // 'subarrayLen' is a power of 2. (2 * subarrayLen / blockLen) keys are guaranteed
    grailCombineBlocks(keys, start, length, subarrayLen, blockLen, buffer) {
        let mergeCount = parseInt(length / (2 * subarrayLen));
        let lastSubarray = parseInt(length % (2 * subarrayLen));

        if (lastSubarray <= subarrayLen) {
            length -= lastSubarray;
            lastSubarray = 0;
        }

        // INCOMPLETE CONDITIONAL BUG FIXED: In order to combine blocks out-of-place, we must check if a full-sized
        //                                   block fits into our external buffer.
        if (buffer && blockLen <= this.externalBufferLen) {
            this.grailCombineOutOfPlace(keys, start, length, subarrayLen, blockLen, mergeCount, lastSubarray);
        } else {
            this.grailCombineInPlace(keys, start, length, subarrayLen, blockLen, mergeCount, lastSubarray, buffer);
        }
    }

    // "Classic" in-place merge sort using binary searches and rotations
    //
    // cost: min(leftLen, rightLen)^2 + max(leftLen, rightLen)
    grailLazyMerge(start, leftLen, rightLen) {
        if (leftLen < rightLen) {
            while (leftLen != 0) {
                let insertPos = this.grailBinarySearchLeft(start + leftLen, rightLen, this.Reads.readValue(start));

                if (insertPos != 0) {
                    this.grailRotate(start, leftLen, insertPos);
                    start += insertPos;
                    rightLen -= insertPos;
                }

                if (rightLen == 0) {
                    break;
                } else {
                    do {
                        start++;
                        leftLen--;
                    } while (leftLen != 0 && this.Reads.compareInArr(start,
                        start + leftLen) <= 0);
                }
            }
        } else {
            let end = start + leftLen + rightLen - 1;
            while (rightLen != 0) {
                let insertPos = this.grailBinarySearchRight(start, leftLen, this.Reads.readValue(end));

                if (insertPos != leftLen) {
                    this.grailRotate(start + insertPos, leftLen - insertPos, rightLen);
                    end -= leftLen - insertPos;
                    leftLen = insertPos;
                }

                if (leftLen == 0) {
                    break;
                } else {
                    let leftEnd = start + leftLen - 1;
                    do {
                        rightLen--;
                        end--;
                    } while (rightLen != 0 && this.Reads.compareInArr(leftEnd,
                        end) <= 0);
                }
            }
        }
    }

    grailLazyStableSort(start, length) {
        for (let index = 1; index < length; index += 2) {
            let left = start + index - 1;
            let right = start + index;

            if (this.Reads.compareInArr(left, right) > 0) {
                this.grailSwap(left, right);
            }
        }
        for (let mergeLen = 2; mergeLen < length; mergeLen *= 2) {
            let mergeIndex;
            let mergeEnd = length - (2 * mergeLen);

            for (mergeIndex = 0; mergeIndex <= mergeEnd; mergeIndex += (2 * mergeLen)) {
                this.grailLazyMerge(start + mergeIndex, mergeLen, mergeLen);
            }

            let leftOver = length - mergeIndex;
            if (leftOver > mergeLen) {
                this.grailLazyMerge(start + mergeIndex, mergeLen, leftOver - mergeLen);
            }
        }
    }

    static calcMinKeys(numKeys, blockKeysSum) {
        let minKeys = 1;
        while (minKeys < numKeys && blockKeysSum != 0) {
            minKeys *= 2;
            blockKeysSum = parseInt(blockKeysSum / 8);
        }
        return minKeys;
    }

    grailCommonSort(start, length, extBuf, extBufLen) {
        if (length < 16) {
            this.grailInsertSort(start, length);
            return;
        } else {
            let blockLen = 1;

            // find the smallest power of two greater than or equal to
            // the square root of the input's length
            while ((blockLen * blockLen) < length) {
                blockLen *= 2;
            }

            // '((a - 1) / b) + 1' is actually a clever and very efficient
            // formula for the ceiling of (a / b)
            //
            // credit to Anonymous0726 for figuring this out!
            let keyLen = parseInt((length - 1) / blockLen) + 1;

            // Grailsort is hoping to find `2 * sqrt(n)` unique items
            // throughout the array
            let idealKeys = keyLen + blockLen;

            //TODO: Clean up `start +` offsets
            let keysFound = this.grailCollectKeys(start, length, idealKeys);

            let idealBuffer;
            if (keysFound < idealKeys) {
                if (keysFound < 4) {
                    // GRAILSORT STRATEGY 3 -- No block swaps or scrolling buffer; resort to Lazy Stable Sort
                    this.grailLazyStableSort(start, length);
                    return;
                } else {
                    // GRAILSORT STRATEGY 2 -- Block swaps with small scrolling buffer and/or lazy merges
                    keyLen = blockLen;
                    blockLen = 0;
                    idealBuffer = false;

                    while (keyLen > keysFound) {
                        keyLen = parseInt(keyLen / 2);
                    }
                }
            } else {
                // GRAILSORT STRATEGY 1 -- Block swaps with scrolling buffer
                idealBuffer = true;
            }

            let bufferEnd = blockLen + keyLen;
            let bufferLen;
            if (idealBuffer) {
                bufferLen = blockLen;
            } else {
                bufferLen = keyLen;
            }

            if (idealBuffer && extBuf != null) {
                // GRAILSORT + EXTRA SPACE
                this.externalBuffer = extBuf;
                this.externalBufferLen = extBufLen;
            }

            this.grailBuildBlocks(start + bufferEnd, length - bufferEnd, bufferLen);

            while ((length - bufferEnd) > (2 * bufferLen)) {
                bufferLen *= 2;

                let currentBlockLen = blockLen;
                let scrollingBuffer = idealBuffer;

                if (!scrollingBuffer) {
                    if (keyLen > 4 && (parseInt(keyLen / 8) * keyLen) >= bufferLen) {
                        currentBlockLen = parseInt(keyLen / 2);
                        scrollingBuffer = true;
                    } else {
                        let blockKeysSum = parseInt(bufferLen * keysFound) / 2;
                        let minKeys = GrailSort.calcMinKeys(keyLen, blockKeysSum);

                        currentBlockLen = parseInt(2 * bufferLen) / minKeys;
                    }
                }

                this.grailCombineBlocks(start, start + bufferEnd, length - bufferEnd, bufferLen, currentBlockLen, scrollingBuffer);
            }

            this.grailInsertSort(start, bufferEnd);
            this.grailLazyMerge(start, bufferEnd, length - bufferEnd);
        }
    }

    grailSortInPlace(start, length) {
        this.grailCommonSort(start, length, null, 0);
    }

    /*
    grailSortStaticOOP(array, start, length) {
        let buffer = Array.newInstance(array[0].getClass(), GRAIL_STATIC_EXT_BUF_LEN);
        this.grailCommonSort(array, start, length, buffer, GRAIL_STATIC_EXT_BUF_LEN);
    }
    
    grailSortDynamicOOP(array, start, length) {
        let bufferLen = 1;
        while((bufferLen * bufferLen) < length) {
            bufferLen *= 2;
        }

        let buffer = Array.newInstance(array[0].getClass(), bufferLen);

        this.grailCommonSort(array, start, length, buffer, bufferLen);
    }*/
    runSort(low, high, bucketsNum, bufferSize) {
        // this.grailSortInPlace(low, high + 1)
        if(bufferSize === 0){
            this.grailSortInPlace(low, high + 1)
        }else{
            let buffer = this.Writes.createAuxArray(bufferSize)
            console.log("WITH BUFFER!!!")
            this.grailCommonSort(low, high + 1, buffer, bufferSize)
            this.Writes.removeAuxArray(buffer)
        }
    }
}

