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
//import '../css/tailwind.css'
import { dataMapComponent, copy } from '../lib/tools';
import BaseCom from './base-com';
export default (function (props) {
    var childProps = copy(props);
    var data = props.data;
    //const css = props.css || []
    var field = props.field;
    var components = [];
    var key = 0;
    for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
        var el = data_1[_i];
        var component = dataMapComponent(el, field, key);
        components.push(component);
        key++;
    }
    childProps['type'] = props.type || 'line';
    //console.log(childProps, 'line child props')
    //const main = BaseCom(childProps)
    //<div className={cn(...css)}>
    return (React.createElement(BaseCom, __assign({}, childProps), components));
});
