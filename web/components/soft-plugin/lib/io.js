import * as yaml from 'js-yaml';
/*
export function checkStorage():boolean{
    try{
        let storage: string|null = localStorage.getItem(storageName)
        if (storage===null || storage==='') return false
        let obj = JSON.parse(storage)
        if (obj.list===undefined) return false
        if (obj.configs===undefined) return false
        if (obj.configDir===undefined) return false
    }
    catch(err){
        console.log(err)
        return false
    }
    return true
}

export function createStorage():boolean{
    let storage: IStorageObj;
    storage = {
        list: [],
        configs: {},
        configDir: '',
    };
    return writeStorage(storage)
}

export function readStorage():IStorageObj| null{
    try{
        let isExist:boolean = checkStorage()
        if (!isExist) createStorage()
        let storageString: string|null = localStorage.getItem(storageName)
        let storageObj: Object = JSON.parse(storageString as string)
        return storageObj as IStorageObj
    }
    catch(err){
        console.log(err)
        return null
    }
}

export function writeStorage(storageObj: IStorageObj): boolean{
    try{
        let storageString: string = JSON.stringify(storageObj)
        localStorage.setItem(storageName, storageString)
        return true
    }
    catch(err){
        console.log(err)
        return false
    }

}

export function addConfig(name:string, config: IConfig):boolean{
    let storage: IStorageObj|null = readStorage()
    if (storage===null) return false
    storage.configs[name] = config
    return writeStorage(storage)
}
*/
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
