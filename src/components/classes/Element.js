const types = {

}

const colors = {

}

export class Element{

    value;
    color;
    type;

    // constructor(args){
    //     this.value = args.value;
    //     this.type = args.type;
    //     this.color = args.color || colors[args.type];
    // }

    constructor(value, type, color) {
            this.value = value;
            this.type = type;
            this.color = color;
    }

    getValue(){
        return this.value;
    }
    setValue(value){
        this.value = value;
    }

    getColor(){
        return this.color;
    }
    setColor(color){
        this.color = color;
    }

    getType(){
        return this.type;
    }
    setType(type){
        this.type = type;
    }
}