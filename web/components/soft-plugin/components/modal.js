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
import { copy } from '../lib/tools';
import Line from './line';
export default (function (props) {
    // Variables
    var childProps = copy(props);
    childProps['type'] = 'modal';
    return React.createElement(Line, __assign({}, childProps));
    /*
    const css = props.css || []
    const id = props.field
    const name = props.name
    const saveString:string = props.save
    const save = strToBoolean(saveString, false)

    // States
    // Functions
    // Init
    const {inner} = base('input', childProps)
    //<Input {...props} onChange={onChange}/>
    const main = (
        <div className={cn(...css)}>
            {inner}
        </div>
    )
 

    //{visible && main}
    return(
        <>
          {main}
        </>
    )
    */
});
