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
//import './css/tailwind.css';
import * as React from 'react';
import { useState } from 'react';
import { Divider, Drawer, Empty } from 'antd';
//import 'antd/dist/antd.css';
import LoadConfig from './components/load-config';
import { stateManager, useLocal } from '@wangziling100/state-manager';
import PluginList from './components/plugin-list';
export default (function (props) {
    // States
    var _a = useState(), loadConfig = _a[0], setLoadConfig = _a[1];
    //const [visible, setVisible] = useState(false)
    var _b = useState({}), configs = _b[0], setConfigs = _b[1];
    var _c = useState(true), refresh = _c[0], setRefresh = _c[1];
    // Variables
    var id = 'soft-plugin-index';
    var data, drawerProps, visible;
    var setVisible;
    if (props !== undefined) {
        data = props.data || null;
        drawerProps = props.drawerProps || { width: 420 };
        visible = props.visible;
        setVisible = props.setVisible;
    }
    else {
        drawerProps = { width: 420 };
        visible = false;
        setVisible = function () { };
    }
    var onClose = function () {
        setVisible(false);
    };
    var onConfigLoaded = function () {
        stateManager.writeLocal(id);
    };
    // Init
    stateManager.addState(id, 'loadConfig', loadConfig);
    stateManager.addFunction(id, 'setLoadConfig', setLoadConfig);
    stateManager.addState(id, 'configs', configs);
    stateManager.addFunction(id, 'setConfigs', setConfigs);
    stateManager.addToLocalSet(id, 'configs');
    stateManager.addState(id, 'refresh', refresh);
    stateManager.addFunction(id, 'setRefresh', setRefresh);
    // Effect
    useLocal('soft-plugin-index');
    // Components
    return (React.createElement(React.Fragment, null,
        React.createElement(Drawer, __assign({ title: "Plugin System", placement: "right", closable: false, onClose: onClose, visible: visible }, drawerProps),
            React.createElement(LoadConfig, { setConfig: setLoadConfig, onLoaded: onConfigLoaded }),
            React.createElement(Divider, null, " Plugin List "),
            Object.keys(configs).length === 0
                && React.createElement(Empty, { description: 'No Plugin', image: Empty.PRESENTED_IMAGE_SIMPLE }),
            React.createElement(PluginList, { data: configs }))));
});
/*
export default (props:any) => {
  return(
    <div> Default </div>
  )
}
*/ 
