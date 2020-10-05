import * as React from 'react';
import { useState } from 'react';
import cn from 'classnames';
import { stateManager } from '@wangziling100/state-manager';
import { copy, strToBoolean } from '../lib/tools';
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
    }
    childProps['onChange'] = onChange;
    // Init
    if (name !== undefined && save) {
        stateManager.addState(id, name, data);
    }
    var inner = base('password', childProps).inner;
    var main = (React.createElement("div", { className: cn.apply(void 0, css) }, inner));
    return (React.createElement(React.Fragment, null, main));
});
