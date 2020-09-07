import * as React from 'react';
import cn from 'classnames';
import { stateManager } from '@wangziling100/state-manager';
export default (function (props) {
    var css = props.css || [];
    var content = props.content || '';
    var id = props.field;
    var name = props.name;
    if (name !== undefined) {
        stateManager.addState(id, name, content);
    }
    return (React.createElement("div", { className: cn.apply(void 0, css) }, content));
});
