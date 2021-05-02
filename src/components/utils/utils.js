export function random(a, b) {
    return Math.random() * (b - a) + a;
}
export function randomInt(a, b){
    return Math.trunc(random(a, b))
}
export function swapObj(json){
    let ret = {};
    for(let key in json){
        ret[json[key]] = key;
    }
    return ret;
}
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}