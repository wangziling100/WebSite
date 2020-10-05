var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import * as React from 'react';
import { useState } from 'react';
import { copy, strToBoolean, extractEvents, dataMapAction } from '../lib/tools';
import Line from './line';
import { stateManager } from '@wangziling100/state-manager';
export default (function (props) {
    // Variables
    var childProps = copy(props);
    childProps['type'] = 'menu';
    var name = props.name;
    var id = props.field;
    var saveString = props.save;
    var save = strToBoolean(saveString, false);
    var actions = extractEvents(childProps).actions;
    // State
    var _a = useState(''), data = _a[0], setData = _a[1];
    // Init
    if (name !== undefined && save) {
        stateManager.addState(id, name, data);
        stateManager.addFunction(id, name, setData);
    }
    // Functions
    var onClick = function (_a) {
        var key = _a.key;
        //setData(key)
        setData(key);
        actions.onClick && actions.onClick(key);
        props.onClick && props.onClick(key);
        var action = dataMapAction(props);
        if (action === null)
            return;
        action();
    };
    childProps['onClick'] = onClick;
    return React.createElement(Line, __assign({}, childProps));
});
