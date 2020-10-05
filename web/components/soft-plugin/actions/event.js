export function onBase(e, fn) {
    var tmpResult;
    for (var _i = 0, fn_1 = fn; _i < fn_1.length; _i++) {
        var f = fn_1[_i];
        tmpResult = f(e, tmpResult);
    }
}
export function onChange(e, fn) {
    onBase(e, fn);
}
export function onClick(e, fn) {
    onBase(e, fn);
}
