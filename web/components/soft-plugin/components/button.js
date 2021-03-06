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
import { Button } from 'antd';
import cn from 'classnames';
import { dataMapAction, copy, extractEvents, strToBoolean } from '../lib/tools';
import { stateManager } from '@wangziling100/state-manager';
export default (function (props) {
    var css = props.css || [];
    var name = props.name;
    var id = props.field;
    var saveString = props.save;
    var save = strToBoolean(saveString, false);
    var childProps = copy(props);
    childProps = extractEvents(childProps).props;
    // State
    var _a = useState(props.content), content = _a[0], setContent = _a[1];
    // Init
    if (name !== undefined && save) {
        stateManager.addState(id, name, content);
        stateManager.addFunction(id, name, setContent);
    }
    // Function
    function onClick(e) {
        //console.log(childProps.onClick, 'button onclick')
        childProps.onClick && childProps.onClick(e);
        var action = dataMapAction(props);
        if (action === null)
            return;
        action();
    }
    if (name !== undefined) {
    }
    return (React.createElement("div", { className: cn.apply(void 0, css) },
        React.createElement(Button, __assign({}, childProps, { onClick: onClick }), content)));
});
