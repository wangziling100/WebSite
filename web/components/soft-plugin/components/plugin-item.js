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
import Line from './line';
import { extractProps } from '../lib/tools';
export default (function (props) {
    var config = props.data;
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
    console.log(lines, 'lines');
    var main = (React.createElement(React.Fragment, null, lines));
    return (React.createElement(React.Fragment, null, main));
});
