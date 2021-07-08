import {Element} from "../classes/Element";
export function random(a, b) {
    return Math.random() * (b - a) + a;
}

export function randomInt(a, b) {
    return Math.trunc(random(a, b))
}

export function swapObj(json) {
    let ret = {};
    for (let key in json) {
        ret[json[key]] = key;
    }
    return ret;
}

export function sleep(ms) {
    ms += new Date().getTime();
    while (new Date() < ms) {
    }
}

export function getAllMethods(toCheck) {
    const props = [];
    let obj = toCheck;
    do {
        props.push(...Object.getOwnPropertyNames(obj));
    } while (obj = Object.getPrototypeOf(obj));

    return props.sort().filter((e, i, arr) => {
        if (e!=arr[i+1] && typeof toCheck[e] == 'function') return true;
    });
}

export function deepArrayCopy(arr){
    let out = [];
    for(let i of arr){
        let value = i.getValue();
        let type = i.getType();
        let color = i.getColor();
        out.push(new Element(value, type, color))
    }
    return out;
}