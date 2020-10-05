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
import { stateManager } from '@wangziling100/state-manager';
export default (function (props) {
    // Variables
    var config = props.data;
    var lineData = config.lines;
    var field = config.name;
    var lines = [];
    // States
    // Functions
    var deleteAction = function () {
        stateManager.delete(field);
        var setConfigs = stateManager.getFunction('soft-plugin-index', 'setConfigs');
        var configs = stateManager.getState('soft-plugin-index', 'configs');
        var refresh = stateManager.getState('soft-plugin-index', 'refresh');
        var setRefresh = stateManager.getFunction('soft-plugin-index', 'setRefresh');
        delete configs[field];
        setConfigs(configs);
        stateManager.addState('soft-plugin-index', 'configs', configs);
        stateManager.writeLocal('soft-plugin-index');
        setRefresh(!refresh);
    };
    // Init
    for (var index in lineData) {
        var props_1 = extractProps(lineData[index], 'line');
        props_1['key'] = index;
        props_1['field'] = field;
        var line = React.createElement(Line, __assign({}, props_1));
        lines.push(line);
    }
    var main = (React.createElement(React.Fragment, null,
        React.createElement("div", { className: 'flex justify-end\n                   text-gray-400 hover:text-blue-300 \n                   cursor-pointer', onClick: deleteAction }, "delete"),
        lines));
    return (React.createElement(React.Fragment, null, main));
});
