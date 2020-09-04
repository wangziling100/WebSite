var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
import { Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
//import '../css/tailwind.css'
//import 'antd/dist/antd.css';
import * as React from 'react';
import { useState } from 'react';
import * as io from '../lib/io';
import cn from 'classnames';
import { stateManager } from '@wangziling100/state-manager';
export default (function (props) {
    //console.log(props, 'props')
    var onLoaded = props.onLoaded;
    var _a = useState(false), succeed = _a[0], setSucceed = _a[1];
    var _b = useState(false), loaded = _b[0], setLoaded = _b[1];
    var titleCSS = ['text-sm', 'font-semibold'];
    var textCSS = ['text-sm', 'text-red-500', 'ml-2', 'font-light', 'mt-1'];
    function loadConfig(_a) {
        var file = _a.file;
        console.log(file, 'data');
        var reader = new FileReader();
        reader.readAsText(file, 'utf-8');
        reader.onload = function () {
            console.log(this.result);
            var config = io.readConfig(this.result);
            console.log(config, 'config');
            if (config !== null) {
                console.log(config);
                setSucceed(true);
                var configs = stateManager.getState('soft-plugin-index', 'configs');
                var name_1 = config.name;
                var storedConfig = {};
                storedConfig[name_1] = config;
                configs = Object.assign(configs);
                var setConfigs = stateManager.getFunction('soft-plugin-index', 'setConfigs');
                setConfigs(Object.assign(configs, storedConfig));
                stateManager.writeLocal('soft-plugin-index');
                if (props !== undefined) {
                    props.setConfig(config);
                }
                onLoaded();
            }
            else {
                setSucceed(false);
            }
            setLoaded(true);
        };
    }
    function onClick() {
        setLoaded(false);
        setSucceed(false);
    }
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: cn.apply(void 0, titleCSS) }, " Load a plugin"),
        React.createElement("div", { className: 'flex mt-2' },
            React.createElement(Upload, { showUploadList: false, customRequest: loadConfig },
                React.createElement(Button, { onClick: onClick },
                    React.createElement("div", { className: 'flex' },
                        React.createElement("div", { className: 'mr-1' },
                            React.createElement(UploadOutlined, null)),
                        React.createElement("div", { className: 'text-xs ml-1' }, "Click to Upload")))),
            React.createElement("div", { className: cn.apply(void 0, __spreadArrays([{ 'hidden': !loaded || !succeed }], textCSS)) }, " succeed!"),
            React.createElement("div", { className: cn.apply(void 0, __spreadArrays([{ 'hidden': !loaded || succeed }], textCSS)) }, " failed!"))));
});
