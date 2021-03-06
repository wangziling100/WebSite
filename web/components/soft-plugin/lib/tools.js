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
import Group from '../components/group';
import Input from '../components/input';
import Password from '../components/password';
import Label from '../components/label';
import Button from '../components/button';
import Modal from '../components/modal';
import Textarea from '../components/textarea';
import Drawer from '../components/drawer';
import Builder from '../components/builder';
import Menu from '../components/menu';
import MenuItem from '../components/menu-item';
import Notification from '../components/notification';
import Dropdown from '../components/dropdown';
import * as React from 'react';
import * as Switch from '../actions/switch';
import * as IO from '../actions/io';
import * as Info from '../actions/info';
import * as Event from '../actions/event';
import * as Service from '../actions/service';
import { stateManager } from '@wangziling100/state-manager';
export function dataMapComponent(data, field, key) {
    try {
        var type = Object.keys(data)[0];
        var props = data[type];
        props['field'] = field;
        var component = void 0;
        switch (type) {
            case 'group': {
                var newProps = extractProps(props, 'group');
                newProps['field'] = field;
                component = React.createElement(Group, __assign({}, newProps, { key: key }));
                break;
            }
            case 'modal': {
                var newProps = extractProps(props, 'modal');
                newProps['field'] = field;
                newProps = xToProps(newProps);
                component = React.createElement(Modal, __assign({}, newProps, { key: key }));
                break;
            }
            case 'drawer': {
                var newProps = extractProps(props, 'drawer');
                newProps['field'] = field;
                newProps = xToProps(newProps);
                component = React.createElement(Drawer, __assign({}, newProps, { key: key }));
                break;
            }
            case 'menu': {
                var newProps = extractProps(props, 'menu');
                newProps['field'] = field;
                //newProps = xToProps(newProps)
                component = React.createElement(Menu, __assign({}, newProps, { key: key }));
                break;
            }
            case 'dropdown': {
                var newProps = extractProps(props, 'dropdown');
                newProps['field'] = field;
                newProps = xToProps(newProps);
                component = React.createElement(Dropdown, __assign({}, newProps, { key: key }));
                break;
            }
            case 'builder':
                component = React.createElement(Builder, __assign({}, props, { key: key }));
                break;
            case 'input':
                component = React.createElement(Input, __assign({}, props, { key: key }));
                break;
            case 'label':
                component = React.createElement(Label, __assign({}, props, { key: key }));
                break;
            case 'password':
                component = React.createElement(Password, __assign({}, props, { key: key }));
                break;
            case 'textarea': {
                component = React.createElement(Textarea, __assign({}, props, { key: key }));
                break;
            }
            case 'button':
                component = React.createElement(Button, __assign({}, props, { key: key }));
                break;
            case 'notification':
                component = React.createElement(Notification, __assign({}, props, { key: key }));
                break;
            case 'menu-item': {
                component = React.createElement(MenuItem, __assign({}, props, { key: props.key }));
                break;
            }
            default:
                component = null;
                break;
        }
        return component;
    }
    catch (err) {
        console.log(err);
        return null;
    }
}
export function dataMapAction(data) {
    if (data.action === undefined)
        return null;
    var actionType = data.action.type;
    var id = data.field;
    var option = data.action.option;
    var obj = data.action.object;
    var actionName = typeMapActionName(obj, actionType);
    var ret;
    ret = nameMapAction(actionName, option, id);
    return ret;
}
export function typeMapActionName(name, type) {
    var actions = ['visible', 'io', 'info', 'service'];
    var exist = false;
    for (var _i = 0, actions_1 = actions; _i < actions_1.length; _i++) {
        var n = actions_1[_i];
        if (type === n)
            exist = true;
    }
    if (!exist)
        throw ('The action ' + type + " dosen't exist");
    else
        return name + '_' + type;
}
export function extractProps(data, type) {
    var props = data[0];
    var itemName = Object.keys(props)[0];
    if (itemName !== 'props')
        throw ("The first attribute of " + type + " must be 'props'");
    props = props[itemName];
    var others = data.slice(1);
    props['data'] = others;
    return props;
}
export function extractEvents(props) {
    var ret = {};
    var field = props.field;
    var actions = props.actions;
    if (actions === undefined)
        return { succeed: false, props: props, actions: {} };
    var actionsChain = {};
    var actionsStore = {};
    for (var _i = 0, actions_2 = actions; _i < actions_2.length; _i++) {
        var act = actions_2[_i];
        // 自己的事件， 所有obj无用
        var key = Object.keys(act)[0];
        switch (key) {
            case 'onClick': {
                var action = findActionByTypeOption(field, act[key]);
                try {
                    actionsChain['onClick'].push(action);
                }
                catch (_a) {
                    actionsChain['onClick'] = [action];
                }
                actionsStore['onClick'] = function (e, input) { return Event.onClick(e, actionsChain['onClick']); };
                break;
            }
            default: break;
        }
    }
    for (var index in actionsStore) {
        props[index] = actionsStore[index];
    }
    if (Object.keys(actionsStore).length > 0) {
        return {
            succeed: true,
            props: props,
            actions: actionsStore
        };
    }
    else {
        return {
            succeed: false,
            props: props,
            actions: {}
        };
    }
}
export function findActionByTypeOption(field, action) {
    var type = action.type;
    var option = action.option;
    var obj = action.object;
    switch (type) {
        case 'io': {
            if (option === 'getAllData') {
                return function () { return IO.getAllData(field); };
            }
            else if (option === 'set') {
                return function (e, res) { return IO.setData(field, obj, obj, e); };
            }
        }
        case 'service': {
            if (option === 'submit') {
                var url_1 = action.url;
                var method_1 = action.method;
                return function (e, data) { return Service.submit(url_1, data, method_1); };
            }
            else if (option === 'process') {
                return function (e, res) { return Service.processResponse(res); };
            }
        }
    }
}
export function xToProps(props) {
    var ret = {};
    var field = props.field;
    var actions = props.actions;
    for (var index in props) {
        switch (index) {
            case 'com': {
                // TODO
                break;
            }
            case 'actions': {
                ret = extractPropsFromAction(field, actions);
                ret = Object.assign(props, ret);
                break;
            }
            default:
                ret[index] = props[index];
                break;
        }
    }
    return ret;
}
export function extractPropsFromAction(field, actions) {
    var ret = {};
    for (var index in actions) {
        var action = void 0;
        action = actions[index];
        var propName = Object.keys(action)[0];
        action = action[propName];
        var actionObj = action.object;
        var actionOption = action.option;
        var actionType = action.type;
        var actionName = typeMapActionName(actionObj, actionType);
        ret[propName] = nameMapAction(actionName, actionOption, field);
    }
    return ret;
}
export function nameMapAction(name, option, id) {
    var ret;
    switch (option) {
        case 'change':
            ret = function () { return Switch.change(id, name, name); };
            break;
        case 'turnOn':
            ret = function () { return Switch.turnOn(id, name); };
            break;
        case 'turnOff':
            ret = function () { return Switch.turnOff(id, name); };
            break;
        case 'set': {
            ret = function (value) { IO.setData(id, '', name, value, null); };
            break;
        }
        case 'notification':
            ret = function () { return Info.notificate(id, name); };
            break;
        default: throw ('It failed mapping data to action!!');
    }
    return ret;
}
export function strToBoolean(data, defaultValue) {
    if (defaultValue === void 0) { defaultValue = false; }
    if (typeof data === 'boolean') {
        return data;
    }
    else if (data === 'true')
        return true;
    else if (data === 'false')
        return false;
    else
        return defaultValue;
}
export function copy(data) {
    var ret = {};
    for (var index in data) {
        ret[index] = data[index];
    }
    return ret;
}
export function addToStore(id, name, type, value, fn) {
    var actionName = typeMapActionName(name, type);
    stateManager.addState(id, actionName, value);
    stateManager.addFunction(id, actionName, fn);
}
