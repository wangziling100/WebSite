import * as React from 'react';
import { useState } from 'react';
import cn from 'classnames';
//import 'antd/dist/antd.css'
import { stateManager } from '@wangziling100/state-manager';
import { copy, strToBoolean, dataMapAction } from '../lib/tools';
import base from './base';
export default (function (props) {
    // Variables
    var childProps = copy(props);
    var css = props.css || [];
    var id = props.field;
    var name = props.name;
    var saveString = props.save;
    var save = strToBoolean(saveString, false);
    // States
    var _a = useState(''), data = _a[0], setData = _a[1];
    // Functions
    function onChange(e) {
        setData(e.target.value);
        var action = dataMapAction(props);
        if (action === null)
            return;
        action(e.target.value);
    }
    childProps['onChange'] = props.onChange || onChange;
    // Init
    if (name !== undefined && save) {
        stateManager.addState(id, name, data);
    }
    var inner = base('textarea', childProps).inner;
    var main = (React.createElement("div", { className: cn.apply(void 0, css) }, inner));
    return (React.createElement(React.Fragment, null, main));
});
