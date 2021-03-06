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
        let markColor = i.getMarkColor();
        out.push(new Element(value, type, color, markColor))
    }
    return out;
}

export function arraysEquals(a, b){
    return a.length === b.length &&
    a.every((v, i) => v === b[i]);
}

export function objLength(obj){
    return (obj!==undefined) ? Object.keys(obj).length: 0
}

export function HSL2RGB(h, s, l){
    let r, g, b;

    if(s === 0){
        r = g = b = l;
    }else{
        let hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        let p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}