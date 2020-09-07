import * as React from 'react';
import { stateManager } from '@wangziling100/state-manager';
import { copy, typeMapActionName } from '../lib/tools';
import { notification } from 'antd';
export default (function (props) {
    // Variables
    var id = props.field;
    var name = props.name;
    var type = props.type;
    var childProps = copy(props);
    if (props.message === undefined
        || props.description === undefined) {
        childProps['message'] = 'Wrong Message';
        childProps['description'] =
            'Message or Description of this notification is undefined';
        childProps['type'] = 'error';
    }
    var noti = function () {
        var api;
        switch (type) {
            case 'success':
                api = notification.success;
                break;
            case 'error':
                api = notification.error;
                break;
            case 'info':
                api = notification.info;
                break;
            case 'warning':
                api = notification.warning;
                break;
            case 'warn':
                api = notification.warn;
                break;
            case 'open':
                api = notification.open;
                break;
            case 'close':
                api = notification.close;
                break;
            case 'destroy':
                api = notification.destroy;
                break;
            default: return;
        }
        api(childProps);
    };
    // Init
    var funcName = typeMapActionName(name, 'info');
    stateManager.addFunction(id, funcName, noti);
    return (React.createElement(React.Fragment, null));
});
