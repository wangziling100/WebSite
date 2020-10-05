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
    var field = props.field;
    var child;
    var key = 0;
    //childProps['overlay'] = dataMapComponent(data, field, key)
    for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
        var el = data_1[_i];
        var type = Object.keys(el)[0];
        if (type === 'overlay') {
            childProps['overlay'] = dataMapComponent(el['overlay'][0], field, key);
        }
        else {
            child = dataMapComponent(el, field, key);
        }
        key++;
    }
    childProps['type'] = 'dropdown';
    //console.log(child, key, 'dropdown child')
    //console.log(childProps['overlay'], 'dropdown overlay')
    //const main = BaseCom(childProps)
    //<div className={cn(...css)}>
    return (React.createElement(BaseCom, __assign({}, childProps), child));
});
