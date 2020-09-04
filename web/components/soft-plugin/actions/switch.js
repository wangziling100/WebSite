import { stateManager } from '@wangziling100/state-manager';
export function change(id, stateKey, functionKey, delay) {
    if (delay === void 0) { delay = 0; }
    try {
        var state = stateManager.getState(id, stateKey);
        var setState = stateManager.getFunction(id, functionKey);
        setState(!state);
        return true;
    }
    catch (err) {
        console.log(err);
        return false;
    }
}
export function turnOn(id, functionKey) {
    try {
        var setState = stateManager.getFunction(id, functionKey);
        setState(true);
        return true;
    }
    catch (err) {
        console.log(err);
        return false;
    }
}
export function turnOff(id, functionKey) {
    try {
        var setState = stateManager.getFunction(id, functionKey);
        setState(false);
        return true;
    }
    catch (err) {
        console.log(err);
        return false;
    }
}
