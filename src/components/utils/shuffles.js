import {randomInt} from "./utils";
import {HeapSort} from "../Sorts/HeapSort";
import {GAP_FACTOR} from "./initFunctions";
import {DualPivotQuickSort} from "../Sorts/DualPivotQuickSort";

export let shuffles = {
    FullShuffle: function (arrayVisualizer) {
        let len = arrayVisualizer.getArrLength()
        for (let i = 0; i < len; ++i) {
            let randomIndex = randomInt(i, len)
            arrayVisualizer.getWrites().swap(i, randomIndex, -1)
        }
        // return instructions
    },

    AlmostSorted: function (arrayVisualizer) {
        let len = arrayVisualizer.getArrLength()
        const AMOUNT = 0.1
        for (let i = 0; i < len * AMOUNT; ++i) {
            let randomIndexA = randomInt(i, len)
            let randomIndexB = randomInt(i, len)
            arrayVisualizer.getWrites().swap(randomIndexA, randomIndexB, -1)
        }
    },
    Reverse: function (arrayVisualizer) {
        let len = arrayVisualizer.getArrLength()
        for (let i = 0; i < Math.trunc(len / 2); ++i) {
            arrayVisualizer.getWrites().swap(i, len - i - 1, -1)
        }
    },
    BlockShuffle: function (arrayVisualizer) {
        let len = arrayVisualizer.getArrLength()
        let gap = len / GAP_FACTOR
        for (let i = 0; i < GAP_FACTOR - 1; ++i) {
            let factor = randomInt(i + 1, GAP_FACTOR)
            for (let j = 0; j < gap; ++j) {
                arrayVisualizer.getWrites().swap(j + i * gap, j + factor * gap, -1)
            }
        }
    },
    PipeOrgan: function (arrayVisualizer) {
        let len = arrayVisualizer.getArrLength()
        let Reads = arrayVisualizer.getReads()
        let temp = new Array(len);
        for (let i = 0, j = 0; i < len; i += 2) {
            temp[j++] = Reads.get(i, -1)
        }
        for (let i = 1, j = len; i < len; i += 2) {
            temp[--j] = Reads.get(i, -1)
        }
        for (let i = 0; i < len; i++) {
            arrayVisualizer.getWrites().write(i, temp[i], -1)
        }
    },
    InversedPipeOrgan: function (arrayVisualizer) {
        let len = arrayVisualizer.getArrLength()
        let Reads = arrayVisualizer.getReads()
        let temp = new Array(len);
        for (let i = 0, j = 0; i < len; i += 2) {
            temp[j++] = Reads.get(len - i - 1, -1)
        }
        for (let i = 1, j = len; i < len; i += 2) {
            temp[--j] = Reads.get(len - i - 1, -1)
        }
        for (let i = 0; i < len; i++) {
            arrayVisualizer.getWrites().write(i, temp[i], -1)
        }
    },
    Heap: function (arrayVisualizer) {
        let n = arrayVisualizer.getArrLength()
        arrayVisualizer.initPseudoArray()
        let heapSort = new HeapSort(arrayVisualizer)
        heapSort.heapify(0, n)
    },
    QuickSortKiller: function (arrayVisualizer) {
        let len = arrayVisualizer.getArrLength()
        for (let j = len - len % 2 - 2, i = j - 1; i >= 0; i -= 2, j--) {
            arrayVisualizer.getWrites().swap(i, j, -1)
        }
    },
    GrailSortKiller: function (arrayVisualizer) {
        // let Reads = arrayVisualizer.getReads()
        let Writes = arrayVisualizer.getWrites()
        let currentLen = arrayVisualizer.getArrLength()
        if (currentLen <= 16) {

            Writes.reversal(0, currentLen - 1, -1);
        } else {
            let blockLen = 1;
            while (blockLen * blockLen < currentLen) {
                blockLen *= 2;
            }
            let numKeys = Math.trunc((currentLen - 1) / blockLen) + 1;

            let keys = blockLen + numKeys;
            // shuffle(array, 0, currentLen, delay ? 0.25 : 0, Writes);

            shuffles.FullShuffle(arrayVisualizer)

            let sorter = new DualPivotQuickSort(arrayVisualizer)
            sorter.runSort(0, keys-1)
            Writes.reversal(0, keys - 1, -1);
            sorter.runSort(keys, currentLen-1)
            push(keys, currentLen, blockLen);
        }

        function rotate(a, m, b) {
            Writes.reversal(a, m - 1);
            Writes.reversal(m, b - 1);
            Writes.reversal(a, b - 1);
        }

        function push(a, b, bLen) {
            let len = b - a
            let b1 = b - len % bLen, len1 = b1 - a;
            if (len1 <= 2 * bLen) {
                return;
            }

            let m = bLen;
            while (2 * m < len) {
                m *= 2;
            }
            m += a;

            if (b1 - m < bLen) {
                push(a, m, bLen);
            } else {
                m = a + b1 - m;
                rotate(m - (bLen - 2), b1 - (bLen - 1), b1);
                Writes.multiSwap(a, m, -1);
                rotate(a, m, b1);
                m = a + b1 - m;

                push(a, m, bLen);
                push(m, b, bLen);
            }
        }
    }
}
