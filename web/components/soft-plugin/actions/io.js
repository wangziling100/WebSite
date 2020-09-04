import { stateManager } from '@wangziling100/state-manager';
export function setData(id, stateKey, functionKey, value, fn) {
    if (value === void 0) { value = null; }
    if (fn === void 0) { fn = null; }
    try {
        var state = void 0, setState = void 0;
        if (value !== null) {
            state = value;
        }
        else {
            state = stateManager.getState(id, stateKey);
        }
        if (fn !== null) {
            setState = fn;
        }
        else {
            setState = stateManager.getFunction(id, functionKey);
        }
        setState(state);
        return true;
    }
    catch (err) {
        console.log(err);
        return false;
    }
}
