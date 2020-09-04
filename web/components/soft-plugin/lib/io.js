import * as yaml from 'js-yaml';
export function readConfig(yamlFile) {
    try {
        console.log(yamlFile);
        var doc = yaml.safeLoad(yamlFile);
        console.log(doc);
        return objToConfig(doc);
    }
    catch (err) {
        console.log(err);
        return null;
    }
}
export function readConfigWithErrMessage(yamlFile) {
    try {
        console.log(yamlFile);
        var doc = yaml.safeLoad(yamlFile);
        console.log(doc);
        return objToConfig(doc);
    }
    catch (err) {
        console.log(err);
        return err.message;
    }
}
function objToConfig(obj) {
    var ret = {
        name: obj.name,
        lines: obj.lines
    };
    return ret;
}
