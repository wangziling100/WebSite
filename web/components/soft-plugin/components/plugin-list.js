import * as React from 'react';
import { Collapse } from 'antd';
import PluginItem from './plugin-item';
export default (function (props) {
    var data = props.data;
    console.log(data, 'plugin list');
    var panels = [];
    var Panel = Collapse.Panel;
    var cnt = 1;
    for (var key in data) {
        var config = data[key];
        var panel = (React.createElement(Panel, { header: config.name, key: cnt },
            React.createElement(PluginItem, { data: config, key: cnt })));
        panels.push(panel);
        cnt++;
    }
    return (React.createElement(React.Fragment, null,
        React.createElement(Collapse, { accordion: true }, panels)));
});
