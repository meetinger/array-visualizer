export class Reads{
    arrayVisualizer;
    pseudoArray
    pseudoAuxArrays
    array
    auxArrays
    constructor(arrayVisualizer){
        this.arrayVisualizer = arrayVisualizer
        this.pseudoArray = arrayVisualizer.getPseudoArray()
        this.pseudoAuxArrays = arrayVisualizer.getPseudoAuxArrays()
        this.array = arrayVisualizer.getMainArray()
        this.auxArrays = arrayVisualizer.getAuxArrays()
        this.Sounds = arrayVisualizer.getSounds()
        // this.Delays = arrayVisualizer.getDelays()
    }
    auxRead(index, arrIndex, isPseudo = true){
        if(isPseudo){
            return this.arrayVisualizer.getPseudoAuxArrays()[arrIndex][index].getValue()
            // return this.pseudoAuxArrays[arrIndex][index].getValue()
        }else {
            return this.arrayVisualizer.getAuxArrays()[arrIndex][index].getValue()
            // return this.auxArrays[arrIndex][index].getValue()
        }
    }

    read(index, arr = this.arrayVisualizer.getPseudoArray()) {
        // this.markUnmarkMany([index], {type: "Default"})
        // this.instructions.push(
        //     {
        //         cmd: "read",
        //         arr: arr,
        //         index: index
        //     }
        // )
        return arr[index].getValue()
    }

    compare(a, b, sign = "<", arr = this.arrayVisualizer.getPseudoArray()) {
        // this.compMainArrWithDelay(a, b, false)
        if (sign === "<") {
            return arr[a].getValue() < arr[b].getValue()
        } else if (sign === "<=") {
            return arr[a].getValue() <= arr[b].getValue()
        } else if (sign === ">") {
            return arr[a].getValue() > arr[b].getValue()
        } else if (sign === ">=") {
            return arr[a].getValue() >= arr[b].getValue()
        } else {
            return arr[a].getValue() === arr[b].getValue()
        }
    }

}