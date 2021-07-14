export class Reads{
    arrayVisualizer;
    Sounds
    constructor(arrayVisualizer){
        this.arrayVisualizer = arrayVisualizer
        this.Sounds = arrayVisualizer.getSounds()
    }

    readValue(index, arr = this.arrayVisualizer.getPseudoArray()) {
        return arr[index].getValue()
    }

    compareInArr(a, b, arr = this.arrayVisualizer.getPseudoArray()) {
        return this.compareValues(arr[a], arr[b])
    }

    get(index, arr = this.arrayVisualizer.getPseudoArray()){
        return arr[index];
    }

    compareValues(a, b){
        let tmpA = typeof a === "object" ? a.getValue() : a
        let tmpB = typeof b === "object" ? b.getValue() : b
        return tmpA - tmpB;
        // if (sign === "<") {
        //     return a.getValue() < b.getValue()
        // } else if (sign === "<=") {
        //     return a.getValue() <= b.getValue()
        // } else if (sign === ">") {
        //     return a.getValue() > b.getValue()
        // } else if (sign === ">=") {
        //     return a.getValue() >= b.getValue()
        // } else {
        //     return a.getValue() === b.getValue()
        // }
    }

    auxGet(index, arrIndex, isPseudo = true){
        if(isPseudo){
            return this.arrayVisualizer.getPseudoAuxArrays()[arrIndex][index]
        }else {
            return this.arrayVisualizer.getAuxArrays()[arrIndex][index]
        }
    }


    auxRead(index, arrIndex, isPseudo = true){
        if(isPseudo){
            return this.arrayVisualizer.getPseudoAuxArrays()[arrIndex][index].getValue()
        }else {
            return this.arrayVisualizer.getAuxArrays()[arrIndex][index].getValue()
        }
    }
}