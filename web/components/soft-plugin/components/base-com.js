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
import { Modal, Drawer } from 'antd';
import { strToBoolean, typeMapActionName } from '../lib/tools';
import { useState } from 'react';
import { stateManager } from '@wangziling100/state-manager';
import cn from 'classnames';
export default (function (props) {
    var main;
    // Variables
    //console.log(props, 'base props')
    var id = props.field;
    var name = props.name;
    var visibleString = props.visible;
    var initVisible = strToBoolean(visibleString, true);
    var onOk = props.onOk;
    var onCancel = props.onCancel;
    var css = props.css || [];
    //console.log(css, 'base css')
    var type = props.type;
    // States
    var _a = useState(initVisible), visible = _a[0], setVisible = _a[1];
    if (visibleString !== undefined) {
        var actionName = typeMapActionName(name, 'visible');
        stateManager.addState(id, actionName, visible);
        stateManager.addFunction(id, actionName, setVisible);
    }
    switch (type) {
        case 'modal': {
            //console.log(props, 'modal props base')
            main = React.createElement(Modal, __assign({}, props, { onOk: onOk, onCancel: onCancel, visible: visible }), props.children);
            break;
        }
        case 'line': {
            main = (React.createElement("div", __assign({}, props, { className: cn.apply(void 0, css) }), props.children));
            break;
        }
        case 'drawer': {
            console.log(props, 'base com drawer');
            main = React.createElement(Drawer, __assign({}, props, { visible: visible }), props.children);
            break;
        }
        default:
            main = React.createElement(React.Fragment, null, props.children);
            break;
    }
    return (React.createElement(React.Fragment, null, visible && main));
});
