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
import { readConfigWithErrMessage } from '../lib/io';
import Line from './line';
import { extractProps, strToBoolean, addToStore } from '../lib/tools';
export default (function (props) {
    var id = props.field;
    var name = props.name;
    var ioString = props.allowIO;
    var allowIO = strToBoolean(ioString, true);
    var _a = useState(''), data = _a[0], setData = _a[1];
    var config = readConfigWithErrMessage(data);
    if (allowIO) {
        addToStore(id, name, 'io', data, setData);
    }
    var main;
    if (typeof config === 'string') {
        main = React.createElement(React.Fragment, null, config);
    }
    else {
        try {
            var lineData = config.lines;
            var field = config.name;
            var lines = [];
            for (var index in lineData) {
                var props_1 = extractProps(lineData[index], 'line');
                props_1['key'] = index;
                props_1['field'] = field;
                var line = React.createElement(Line, __assign({}, props_1));
                lines.push(line);
            }
            main = React.createElement(React.Fragment, null, lines);
        }
        catch (err) {
            console.log(err);
            var configJSON = JSON.stringify(config);
            main = React.createElement("div", null, configJSON);
        }
    }
    return (React.createElement(React.Fragment, null, main));
});
