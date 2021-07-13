export class Sort {
    arrayVisualizer;

    Reads
    Writes

    compare;
    swap;
    write;
    read;

    createAuxArray
    removeAuxArray

    auxRead
    auxWrite

    arrLength;

    sortName;
    warnLen;
    isDisabled;
    isNeedBucketsNum;


    constructor(arrayVisualizer) {
        this.arrayVisualizer = arrayVisualizer
        this.state = this.arrayVisualizer.getState()

        this.Reads = this.arrayVisualizer.getReads()
        this.Writes = this.arrayVisualizer.getWrites()

        this.compare = this.Reads.compare.bind(this.Reads)
        this.read = this.Reads.read.bind(this.Reads)
        this.auxRead = this.Reads.auxRead.bind(this.Reads)
        this.swap = this.Writes.swap.bind(this.Writes)
        this.write = this.Writes.write.bind(this.Writes)
        this.createAuxArray = this.Writes.createAuxArray.bind(this.Writes)
        this.removeAuxArray = this.Writes.removeAuxArray.bind(this.Writes)
        this.auxWrite = this.Writes.auxWrite.bind(this.Writes)
        this.arrLength = this.arrayVisualizer.getArrLength();
        this.sortName = ""
        this.warnLen = -1;
        this.isDisabled = false;
        this.isNeedBucketsNum = false;
    }

    getSortName(){
        return this.sortName
    }

    getWarnLen(){
        return this.warnLen
    }

    runSort(low, high, bucketsNum){
    }
}