import { stateManager } from '@wangziling100/state-manager';
export function setVisible(signal, id, stateKey, stateValue, functionKey, functionValue) {
    try {
        if (signal === undefined)
            return false;
        stateManager.addState(id, stateKey, stateValue);
        stateManager.addFunction(id, functionKey, functionValue);
        return true;
    }
    catch (err) {
        console.log(err);
        return false;
    }
}
