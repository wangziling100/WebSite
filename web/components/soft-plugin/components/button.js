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
import { Button } from 'antd';
import cn from 'classnames';
//import 'antd/dist/antd.css'
//import { stateManager } from '@wangziling100/state-manager'
import { dataMapAction } from '../lib/tools';
export default (function (props) {
    var css = props.css || [];
    var name = props.name;
    var content = props.content;
    function onClick(e) {
        var action = dataMapAction(props);
        action();
    }
    if (name !== undefined) {
    }
    console.log(props, 'button');
    return (React.createElement("div", { className: cn.apply(void 0, css) },
        React.createElement(Button, __assign({}, props, { onClick: onClick }), content)));
});
