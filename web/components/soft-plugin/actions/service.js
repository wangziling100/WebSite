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
//import { stateManager } from '@wangziling100/state-manager'
import axios from 'axios';
export function submit(url, data, method) {
    if (method === void 0) { method = 'post'; }
    try {
        switch (method) {
            case 'POST':
            case 'post': {
                console.log('post');
                return axios.post(url, __assign({}, data), {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        accept: 'application/json'
                    }
                });
            }
            default: return null;
        }
    }
    catch (err) {
        console.log(err);
        return null;
    }
}
export function processResponse(response) {
    if (response === null)
        return null;
    response
        .then(function (res) { return console.log(res); })
        .catch(function (err) { return console.error(err.response); });
}
