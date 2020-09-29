import * as React from 'react';
import cn from 'classnames';
import { stateManager } from '@wangziling100/state-manager';
import { strToBoolean } from '../lib/tools';
export default (function (props) {
    var css = props.css || [];
    var content = props.content || '';
    var id = props.field;
    var name = props.name;
    var saveString = props.save;
    var save = strToBoolean(saveString, false);
    if (name !== undefined && save) {
        stateManager.addState(id, name, content);
    }
    return (React.createElement("div", { className: cn.apply(void 0, css) }, content));
});
