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
import { Input, Menu } from 'antd';
import { strToBoolean, addToStore } from '../lib/tools';
import { useState } from 'react';
export default (function (type, props) {
    var main;
    // Variables
    var id = props.field;
    var name = props.name;
    var visibleString = props.visible;
    var initVisible = strToBoolean(visibleString, true);
    var onChange = props.onChange;
    var TextArea = Input.TextArea;
    // States
    var _a = useState(initVisible), visible = _a[0], setVisible = _a[1];
    if (visibleString !== undefined) {
        /*
        const actionName:string = typeMapActionName(name, 'visible')
        stateManager.addState(id, actionName, visible)
        stateManager.addFunction(id, actionName, setVisible)
        */
        addToStore(id, name, 'visible', visible, setVisible);
    }
    switch (type) {
        case 'input':
            main = visible && React.createElement(Input, __assign({}, props, { onChange: onChange }));
            break;
        case 'textarea': {
            main = visible && React.createElement(TextArea, __assign({}, props, { onChange: onChange }));
            break;
        }
        case 'password':
            main = visible && React.createElement(Input.Password, __assign({}, props, { onChange: onChange }));
            break;
        case 'menu-item': {
            main = visible && React.createElement(Menu.Item, __assign({}, props),
                " ",
                props.content);
            break;
        }
        default:
            main = null;
            break;
    }
    return { inner: main };
});
