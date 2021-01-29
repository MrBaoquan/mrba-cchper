import { Component, find, Asset, Material, Texture2D, SpriteFrame, Prefab, resources, JsonAsset, director, assetManager, instantiate, _decorator, game, sys } from 'cc';
import r from 'moment';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function o(r,t,...e){if("function"==typeof r)return Reflect.apply(r,t,e);if("object"==typeof r){let n=Reflect.get(r,t,e);if(void 0===n)return;return o(n,r,...e)}return null}function e(r,t,o){let e=0,n=()=>{++e>=r.length&&o();};for(let o of r)t(o,n);}class n{static Register(r){r.info&&(this.info=r.info),r.warn&&(this.warn=r.warn),r.error&&(this.error=r.error);}static Log(r,...t){n.doLogger(this.info,r,...t);}static Warn(r,...t){n.doLogger(this.warn,r,...t);}static Error(r,...t){n.doLogger(this.error,r,...t);}static doLogger(t,o,...e){let n=r().format("YYYY-MM-DD HH:mm:ss.SSS")+": ";"string"==typeof o?t(n+o,...e):t(n,o);}}n.info=console.log,n.warn=console.warn,n.error=console.error;const c=Symbol(),i=r=>new Proxy(r,{construct:(r,t,o)=>r.prototype!==o.prototype?Reflect.construct(r,t,o):(r[c]||(r[c]=Reflect.construct(r,t,o)),r[c])});function f(r){return null!=r}

const PersistSceneName = 'Persistence';
const StartSceneName = 'SceneEntry';
class ISceneScript {
}
class MetaData {
    static IsSceneScriptRegistered(scriptName) {
        return this.sceneScriptClasses.has(scriptName);
    }
    static GetSceneScriptConstrutor(scriptName) {
        var _a;
        if (!this.IsSceneScriptRegistered(scriptName))
            return null;
        return (_a = this.sceneScriptClasses.get(scriptName)) !== null && _a !== void 0 ? _a : null;
    }
    static IsUIScriptRegistered(target) {
        if (typeof target === "string")
            return this.uiScriptClasses.has(target);
        let _className = target.prototype.constructor.name;
        if (!this.uiClassNamesMap.has(_className))
            return false;
        return this.uiScriptClasses.has(this.uiClassNamesMap.get(_className));
    }
    static GetUIScriptConstructor(scriptName) {
        var _a;
        return (_a = this.uiScriptClasses.get(scriptName)) !== null && _a !== void 0 ? _a : null;
    }
    static GetUIClassRegisteredName(uiScriptConstructor) {
        var _a;
        return (_a = this.uiClassNamesMap.get(uiScriptConstructor.prototype.constructor.name)) !== null && _a !== void 0 ? _a : null;
    }
}
MetaData.sceneScriptClasses = new Map();
MetaData.uiClassNamesMap = new Map();
MetaData.uiScriptClasses = new Map();
/**
 * 注册UI脚本
 * @param className 脚本名称
 */
const ui_script = (className) => (target) => {
    o(Reflect.get(MetaData, "uiClassNamesMap"), "set", target.prototype.constructor.name, className);
    o(Reflect.get(MetaData, "uiScriptClasses"), "set", className, target);
};
/**
 * 注册场景脚本
 * @param classname 场景脚本名称
 */
const scene_script = (classname) => (target) => {
    o(Reflect.get(MetaData, "sceneScriptClasses"), "set", classname, target);
};

class BaseComponent extends Component {
    Get(path, classConstructor) {
        if (classConstructor === undefined) {
            return find(path, this.node);
        }
        var _node = find(path, this.node);
        if (_node === null)
            return null;
        return _node.getComponent(classConstructor);
    }
}
function mapString2CCAssetType(classname) {
    let _ccclass = Asset;
    switch (classname) {
        case 'Prefab':
            _ccclass = Prefab;
            break;
        case 'SpriteFrame':
            _ccclass = SpriteFrame;
            break;
        case 'Texture2D':
            _ccclass = Texture2D;
            break;
        case 'Material':
            _ccclass = Material;
            break;
    }
    return _ccclass;
}

let ResConfig = class ResConfig {
    constructor() {
        /**
         * 资源配置
         */
        this.config = {};
        /**
         * 资源url与场景名称的映射
         */
        this.pathsGroupByScene = new Map();
        /**
         * 资源url与url文件夹下的资源列表关系映射
         */
        this.assetsGroupByUrl = new Map();
    }
    Load(asset) {
        return new Promise((resolve, reject) => {
            if (f(asset)) {
                this.build(asset);
                resolve(this.config);
                return;
            }
            resources.load("configs/res", JsonAsset, (_error, _data) => {
                if (_error !== undefined) {
                    reject(_error);
                    return;
                }
                this.build(_data);
                resolve(this.config);
            });
        });
    }
    build(asset) {
        let _obj = asset.json;
        this.config = _obj;
        this.buildPathesGroupByScene();
    }
    IsAutoRelease(sceneName) {
        var _a;
        return (_a = this.config[sceneName].autoRelease) !== null && _a !== void 0 ? _a : false;
    }
    SyncUrlAsset(url, assetKey) {
        if (!this.assetsGroupByUrl.has(url))
            this.assetsGroupByUrl.set(url, new Set());
        this.assetsGroupByUrl.get(url).add(assetKey);
    }
    GetAssetNamesByUrl(url) {
        if (!this.assetsGroupByUrl.has(url))
            return [];
        return Array.from(this.assetsGroupByUrl.get(url));
    }
    GetSceneInfo(sceneName) {
        return this.config[sceneName];
    }
    /**
     *
     * @param 获取指定场景下的资源包名称
     */
    getBundles(scene) {
        let _node = this.config[scene];
        if (_node === undefined)
            return [];
        return Array.from(new Set(_node.assets.map(_ => this.buildAssetDirInfo(_).bundleName)));
    }
    /**
     *
     * @param sceneNames 获取多个场景下的资源包 默认包含Persistence场景资源
     */
    getScenesBundles(sceneNames) {
        return Array.from(new Set(sceneNames.reduce((_bundles, _sceneName) => _bundles.concat(this.getBundles(_sceneName)), this.getBundles(PersistSceneName))));
    }
    /**
     * 获取scene场景下所有文件夹信息
     * @param scene
     */
    getSceneDirs(scene) {
        let _node = this.config[scene];
        if (_node === undefined)
            return [];
        return _node.assets.map(_ => this.buildAssetDirInfo(_));
    }
    /**
     * 获取scene场景下 bundleName包 的所有文件夹信息
     * @param scene
     * @param bundleName
     */
    getBundleDirs(scene, bundleName) {
        let _node = this.config[scene];
        if (_node === undefined)
            return [];
        return this.getSceneDirs(scene)
            .filter(_assetUrl => _assetUrl.bundleName === bundleName);
    }
    /**
     * 获取多场景下的某个bundle 对应的文件夹列表  (默认包含Persistence场景)
     * @param sceneNames 场景名称
     * @param bundleName 包名
     */
    getScenesBundleDirs(sceneNames, bundleName) {
        return sceneNames.reduce((_dirs, _sceneName) => _dirs.concat(this.getBundleDirs(_sceneName, bundleName)), this.getBundleDirs(PersistSceneName, bundleName));
    }
    /**
     *
     * @param url example  'resources://prefabs/uis'
     */
    buildAssetDirInfo(dirNode) {
        let _url = dirNode.url;
        let _bundleRegex = /.*\:\/\//;
        let _result = _bundleRegex.exec(_url);
        if (_result === null)
            return null;
        let _bundleName = _result[0].slice(0, -3);
        let _pathRegex = /\:\/\/.*/;
        _result = _pathRegex.exec(_url);
        if (_result === null)
            return null;
        let _path = _result[0].slice(3);
        return {
            sceneName: this.GetSceneNameByUrl(_url),
            url: _url,
            bundleName: _bundleName,
            path: _path,
            type: mapString2CCAssetType(dirNode.type)
        };
    }
    GetSceneNameByUrl(url) {
        var _a;
        return (_a = this.pathsGroupByScene.get(url)) !== null && _a !== void 0 ? _a : PersistSceneName;
    }
    buildPathesGroupByScene() {
        this.pathsGroupByScene.clear();
        Object.keys(this.config).forEach(_scene => {
            var _sceneAssets = this.config[_scene];
            _sceneAssets.assets.forEach(_dir => {
                this.pathsGroupByScene.set(_dir.url, _scene);
            });
        });
    }
};
ResConfig = __decorate([
    i
], ResConfig);

var ResourceManager_1;
let ResourceManager = ResourceManager_1 = class ResourceManager {
    constructor() {
        //config:ResConfig = {};
        // 按照 bundle 名称分组资源
        this.assets_gby_Bundle = new Map();
        // 按照场景名称 分组资源
        this.assets_gby_Scene = new Map();
        this.bundles = new Map();
        this.config = new ResConfig();
        this.sceneName = "";
        Reflect.set(ResourceManager_1, "Instance", this);
    }
    /**
     * 初始化
     */
    initialize(asset) {
        return new Promise((resolve, reject) => {
            this.config.Load(asset).then(_config => {
                resolve(undefined);
            }).catch();
        });
    }
    loadScene(sceneName, progress, launched) {
        if (sceneName === StartSceneName) {
            progress(1, 1, undefined);
            launched(null, undefined);
            return;
        }
        let _sceneInfo = this.config.GetSceneInfo(sceneName);
        let _bundleName = _sceneInfo.bundle;
        if (!f(_sceneInfo.bundle)) {
            director.preloadScene(sceneName, (completedCount, totalCount, item) => {
                progress(completedCount, totalCount, item);
            }, (error, sceneAsset) => {
                director.loadScene(sceneName, launched);
            });
            return;
        }
        this.pullBundle(_bundleName).then(_bundle => {
            _bundle.loadScene(sceneName, (completedCount, totalCount, item) => {
                progress(completedCount, totalCount, item);
            }, (error, sceneAsset) => {
                director.loadScene(sceneName, launched);
            });
        });
    }
    LoadSceneRes(sceneNames) {
        return new Promise((resolve, reject) => {
            this.unloadSceneRes(this.curSceneName);
            this.loadNewSceneRes(sceneNames).then(() => {
                resolve(undefined);
            }).catch(reject);
        });
    }
    unloadSceneRes(sceneName) {
        console.log("unload scene %s", sceneName);
        if (!this.config.IsAutoRelease(sceneName))
            return;
        // 要卸载哪些文件夹?
        let _sceneDirs = this.config.getSceneDirs(sceneName);
        _sceneDirs.forEach(_assetDir => {
            var _a;
            (_a = this.bundles.get(_assetDir.bundleName)) === null || _a === void 0 ? void 0 : _a.release(_assetDir.path, _assetDir.type);
        });
        let _releasedAssetKeys = _sceneDirs.map(_dir => _dir.url)
            .reduce((_assetsNames, _url) => this.config.GetAssetNamesByUrl(_url), new Array());
        let _sceneBundles = this.config.getBundles(sceneName);
        // 同步bundles资源映射
        Array.from(this.assets_gby_Bundle.keys()).filter(_bundleKey => _sceneBundles.includes(_bundleKey)).forEach(_bundleName => {
            Array.from(this.assets_gby_Bundle.get(_bundleName).keys())
                .filter(_assetKey => _releasedAssetKeys.includes(_assetKey))
                .forEach(_assetKey => {
                this.assets_gby_Bundle.get(_bundleName).delete(_assetKey);
                console.log("移除%s包 %s资源", _bundleName, _assetKey);
            });
        });
        // 同步场景资源映射
        if (!this.assets_gby_Scene.has(sceneName))
            return;
        Array.from(this.assets_gby_Scene.get(sceneName).keys()).forEach(_assetKey => {
            if (!_releasedAssetKeys.includes(_assetKey))
                return;
            this.assets_gby_Scene.get(sceneName).delete(_assetKey);
            console.log("移除%s场景 %s资源", sceneName, _assetKey);
        });
    }
    loadNewSceneRes(sceneNames) {
        return new Promise((resolve, reject) => {
            console.log("加载自定义场景资源: ", sceneNames[0]);
            let _bundles = this.config.getScenesBundles(sceneNames);
            console.log("包列表", _bundles);
            // Start load bundles
            e(_bundles, (_key, _finishLoadBundleStep) => {
                let _bundleName = _key;
                this.pullBundle(_bundleName).then(_bundle => {
                    /// Start 加载bundle下的文件夹
                    e(this.config.getScenesBundleDirs(sceneNames, _bundleName), (_assetDir, _loadDirStepFinished) => {
                        this.loadResourceDir(_assetDir).then(assetsMap => {
                            var _a, _b;
                            let _resUrl = _assetDir.url;
                            let _resSceneKey = _assetDir.sceneName;
                            if (!this.assets_gby_Bundle.has(_bundleName)) {
                                this.assets_gby_Bundle.set(_bundleName, new Map());
                            }
                            if (!this.assets_gby_Scene.has(_resSceneKey)) {
                                this.assets_gby_Scene.set(_resSceneKey, new Map());
                            }
                            for (let _key of assetsMap.keys()) {
                                n.Log("%s load asset %s", _bundleName, _key);
                                n.Log("%s load asset %s", _resSceneKey, _key);
                                (_a = this.assets_gby_Bundle.get(_bundleName)) === null || _a === void 0 ? void 0 : _a.set(_key, assetsMap.get(_key));
                                (_b = this.assets_gby_Scene.get(_resSceneKey)) === null || _b === void 0 ? void 0 : _b.set(_key, assetsMap.get(_key));
                                this.config.SyncUrlAsset(_resUrl, _key);
                            }
                            _loadDirStepFinished();
                        });
                    }, () => {
                        _finishLoadBundleStep();
                    });
                    ///  End
                }).catch(error => {
                    reject(error);
                    _finishLoadBundleStep();
                });
            }, () => {
                console.log('finished');
                resolve(undefined);
            });
            // End load bundles
        });
    }
    get curSceneName() {
        return this.sceneName;
    }
    Get(key, sceneName) {
        console.log(this.assets_gby_Scene);
        let _asset = this.GetPersist(key);
        if (!f(_asset))
            _asset = this.GetScene(key, sceneName !== null && sceneName !== void 0 ? sceneName : this.curSceneName);
        return _asset;
    }
    GetPersist(key) {
        var _a;
        return (_a = this.assets_gby_Scene.get(PersistSceneName)) === null || _a === void 0 ? void 0 : _a.get(key);
    }
    GetScene(key, sceneName) {
        var _a;
        return (_a = this.assets_gby_Scene.get(sceneName)) === null || _a === void 0 ? void 0 : _a.get(key);
    }
    pullBundle(bundleName) {
        return new Promise((resolve, reject) => {
            if (this.bundles.has(bundleName)) {
                resolve(this.bundles.get(bundleName));
                return;
            }
            else if (bundleName === 'resources') {
                this.bundles.set("resources", resources);
                resolve(resources);
                return;
            }
            assetManager.loadBundle(bundleName, (_error, _bundle) => {
                if (f(_error))
                    reject('load bundle error');
                if (!f(_bundle))
                    reject('load bundle error');
                this.bundles.set(bundleName, _bundle);
                resolve(_bundle);
            });
        });
    }
    preloadDir(bundle, dir, type) {
        let _pathes = bundle.getDirWithPath(dir, type);
        _pathes.forEach(_path => {
            console.log(_path.path);
        });
    }
    loadResourceDir(assetDir) {
        return new Promise((resolve, reject) => {
            let _bundleName = assetDir.bundleName;
            let _resPath = assetDir.path;
            this.pullBundle(_bundleName).then(_bundle => {
                _bundle.loadDir(_resPath, assetDir.type, (_error, _data) => {
                    if (_error !== undefined) {
                        reject(_error);
                    }
                    let _res = new Map();
                    _data === null || _data === void 0 ? void 0 : _data.forEach(_item => {
                        let _info = _bundle.getAssetInfo(_item._uuid);
                        let _name = _info.path.split('/').pop();
                        if (_name === undefined)
                            return;
                        _res.set(_name, _item);
                    });
                    resolve(_res);
                });
            }).catch(reject);
        });
    }
};
ResourceManager = ResourceManager_1 = __decorate([
    i
], ResourceManager);

var UIType;
(function (UIType) {
    UIType["Standalone"] = "Standalone";
    UIType["Normal"] = "Normal";
    UIType["Popup"] = "Popup";
})(UIType || (UIType = {}));
class UIBase extends BaseComponent {
    constructor() {
        super(...arguments);
        this.__uiType = UIType.Normal;
        this.isShowing = false;
    }
    get UIKey() { return this.__uiKey; }
    get UIType() { return this.__uiType; }
    get Actived() { return this.isShowing; }
    spawned() { }
    onShow() { }
    onHide() { }
    handleShow() {
        this.isShowing = true;
        this.showAction();
        this.onShow();
    }
    handleHide() {
        this.isShowing = false;
        this.hideAction();
        this.onHide();
    }
    showAction() {
        this.node.active = true;
    }
    hideAction() {
        this.node.active = false;
    }
}

let UIConfig = class UIConfig {
    constructor() {
        this.config = {};
        this.uis = new Map();
    }
    Load(asset) {
        return new Promise((resolve, reject) => {
            if (f(asset)) {
                this.build(asset);
                resolve(this.config);
                return;
            }
            resources.load("configs/uis", JsonAsset, (_error, _data) => {
                if (_error !== undefined) {
                    reject(_error);
                    return;
                }
                this.build(_data);
                resolve(this.config);
            });
        });
    }
    build(asset) {
        let _obj = asset.json;
        this.config = _obj;
        Object.keys(this.config)
            .reduce((_uis, _sceneKey) => _uis.concat(this.config[_sceneKey]), new Array())
            .reduce((_uis, _uiNode) => _uis.set(_uiNode.name, _uiNode), this.uis);
    }
    GetSceneUIs(sceneName) {
        return this.getPersistUIs().concat(this.customSceneUIs(sceneName));
    }
    ConvertUIKeys2UINodeInfo(keys) {
        return keys.map(_key => this.uis.get(_key)).filter(_ui => f(_ui));
    }
    getPersistUIs() {
        if (this.config[PersistSceneName] === undefined)
            return [];
        return this.config[PersistSceneName];
    }
    customSceneUIs(sceneName) {
        if (this.config[sceneName] === undefined)
            return [];
        return this.config[sceneName];
    }
};
UIConfig = __decorate([
    i
], UIConfig);

var UIManager_1;
const { ccclass, executionOrder } = _decorator;
let UIManager = UIManager_1 = class UIManager extends Component {
    constructor() {
        super();
        this.config = new UIConfig();
        this.allSpawnedUICaches = new Map();
        // 实时 UI 数据
        this.standaloneUIs = new Map();
        this.normalUIs = new Map();
        this.popupUIs = new Array();
        Reflect.set(UIManager_1, "Instance", this);
    }
    onLoad() {
        n.Warn(UIManager_1.Instance);
    }
    initialize(asset) {
        return new Promise((resolve, reject) => {
            this.StandaloneUIRoot = find("StandaloneUI", this.node);
            this.NormalUIRoot = find("NormalUI", this.node);
            this.PopupUIRoot = find("PopupUI", this.node);
            this.config.Load(asset).then(_config => {
                resolve(undefined);
            });
        });
    }
    Get(UIKey, callback) {
        if (typeof UIKey === "string") {
            return this.getUI(UIKey, _ui => {
                if (f(callback))
                    callback(_ui);
            });
        }
        if (!MetaData.IsUIScriptRegistered(UIKey))
            return null;
        return this.getUI(MetaData.GetUIClassRegisteredName(UIKey), _ui => {
            if (f(callback))
                callback(_ui);
        });
    }
    Show(UIKey, callback) {
        if (typeof UIKey === 'string') {
            return this.showUI(UIKey, _ui => {
                if (f(callback))
                    callback(_ui);
            });
        }
        if (!MetaData.IsUIScriptRegistered(UIKey))
            return null;
        return this.showUI(MetaData.GetUIClassRegisteredName(UIKey), _ui => {
            if (f(callback))
                callback(_ui);
        });
    }
    Hide(UIKey, callback) {
        if (typeof UIKey === "string") {
            return this.hideUI(UIKey, _ui => {
                if (f(callback))
                    callback(_ui);
            });
        }
        if (!MetaData.IsUIScriptRegistered(UIKey))
            return;
        return this.hideUI(MetaData.GetUIClassRegisteredName(UIKey), _ui => {
            if (f(callback))
                callback(_ui);
        });
    }
    hideUI(UIKey, callback) {
        let _uiComponent = this.getUI(UIKey);
        if (!f(_uiComponent)) {
            n.Warn("hide ui %s failed, ui not exists.", UIKey);
            return _uiComponent;
        }
        let _uiType = _uiComponent.UIType;
        switch (_uiType) {
            case UIType.Standalone:
                this.hideStandaloneUI(UIKey);
                break;
            case UIType.Normal:
                this.hideNormalUI(UIKey);
                break;
            case UIType.Popup:
                this.hidePopupUI(UIKey);
                break;
        }
        callback(_uiComponent);
        return _uiComponent;
    }
    showUI(UIKey, callback) {
        let _uiComponent = this.getUI(UIKey);
        console.log(_uiComponent);
        if (!f(_uiComponent)) {
            n.Warn("show ui %s failed, ui not exists.", UIKey);
            return _uiComponent;
        }
        console.log(_uiComponent);
        let _uiType = _uiComponent.UIType;
        console.log(_uiType);
        switch (_uiType) {
            case UIType.Standalone:
                this.showStandaloneUI(UIKey);
                break;
            case UIType.Normal:
                this.showNormalUI(UIKey);
                break;
            case UIType.Popup:
                this.showPopupUI(UIKey);
                break;
        }
        callback(_uiComponent);
        return _uiComponent;
    }
    getUI(UIKey, callback) {
        if (!this.allSpawnedUICaches.has(UIKey))
            return null;
        let _uiComponent = this.allSpawnedUICaches.get(UIKey);
        if (f(callback))
            callback(_uiComponent);
        return _uiComponent;
    }
    showStandaloneUI(uiKey) {
        let _uiComponent = this.getUI(uiKey);
        [...this.standaloneUIs.values()].filter(_ui => _ui.UIKey != uiKey).forEach(_ui => {
            o(_ui, "handleHide");
        });
        if (!_uiComponent.Actived)
            o(_uiComponent, "handleShow");
        if (this.standaloneUIs.has(uiKey))
            this.standaloneUIs.set(uiKey, _uiComponent);
    }
    hideStandaloneUI(uiKey) {
        if (!this.standaloneUIs.has(uiKey))
            return;
        let _uiComponent = this.standaloneUIs.get(uiKey);
        if (_uiComponent.Actived) {
            o(_uiComponent, "handleHide");
            this.standaloneUIs.delete(uiKey);
        }
        let _lastUIKey = Array.from(this.standaloneUIs.keys()).pop();
        if (!f(_lastUIKey))
            return;
        o(this.standaloneUIs.get(_lastUIKey), "handleShow");
    }
    showNormalUI(uiKey) {
        if (this.normalUIs.has(uiKey))
            return;
        let _uiComponent = this.getUI(uiKey);
        o(_uiComponent, "handleShow");
        this.normalUIs.set(uiKey, _uiComponent);
    }
    hideNormalUI(uiKey) {
        if (!this.normalUIs.has(uiKey))
            return;
        let _uiComponent = this.normalUIs.get(uiKey);
        o(_uiComponent, "handleHide");
        this.normalUIs.delete(uiKey);
    }
    showPopupUI(uiKey) {
        let _uiComponent = this.getUI(uiKey);
        if (!this.popupUIs.includes(_uiComponent)) {
            this.popupUIs.push(_uiComponent);
        }
        else {
            this.popupUIs.splice(this.popupUIs.indexOf(_uiComponent), 1);
            this.popupUIs.push(_uiComponent);
        }
        if (!_uiComponent.Actived) {
            o(_uiComponent, "handleShow");
        }
        let _lastSibilingIndex = _uiComponent.node.parent ? _uiComponent.node.parent.children.length - 1 : 0;
        _uiComponent.node.setSiblingIndex(_lastSibilingIndex);
    }
    hidePopupUI(uiKey) {
        if (this.popupUIs.length <= 0)
            return;
        let _uiComponent;
        if (f(uiKey)) {
            let _spawnedUI = this.allSpawnedUICaches.get(uiKey);
            if (!f(_spawnedUI))
                return;
            if (!this.popupUIs.includes(_spawnedUI))
                return;
            _uiComponent = _spawnedUI;
            this.popupUIs.splice(this.popupUIs.indexOf(_uiComponent), 1);
        }
        else
            _uiComponent = this.popupUIs.pop();
        if (f(_uiComponent))
            return;
        o(_uiComponent, "handleHide");
    }
    start() {
    }
    destroyUIs(uis) {
        // 销毁UI
        Array.from(this.allSpawnedUICaches.keys())
            .filter(_uiKey => uis.includes(_uiKey))
            .map(_uiKey => this.allSpawnedUICaches.get(_uiKey))
            .forEach(_ui => {
            this.Hide(_ui.UIKey);
            _ui.destroy();
            this.allSpawnedUICaches.delete(_ui.UIKey);
        });
        Array.from(this.standaloneUIs.keys()).filter(_uiKey => uis.includes(_uiKey))
            .forEach(_uiKey => {
            this.standaloneUIs.delete(_uiKey);
        });
        Array.from(this.normalUIs.keys()).filter(_uiKey => uis.includes(_uiKey))
            .forEach(_uiKey => {
            this.normalUIs.delete(_uiKey);
        });
        this.popupUIs
            .filter(_ui => uis.includes(_ui.UIKey))
            .forEach(_ui => {
            this.popupUIs.splice(this.popupUIs.indexOf(_ui), 1);
        });
    }
    onEnterScene(sceneName) {
        /**
         * 销毁上一场景UI   -> 创建当前场景UI
         */
        this.sceneName = sceneName;
        let _allUIs = this.config.GetSceneUIs(sceneName);
        let _newUIs = _allUIs.map(_ui => _ui.name);
        let _currentUIs = Array.from(this.allSpawnedUICaches.keys());
        let _prepare2DestroyUIs = _currentUIs.filter(_ui => !_newUIs.includes(_ui));
        this.destroyUIs(_prepare2DestroyUIs);
        let _prepare2SpawnUIs = _newUIs.filter(_ui => !_currentUIs.includes(_ui));
        console.warn(_newUIs, _currentUIs, _prepare2SpawnUIs);
        this.spawnUIs(this.config.ConvertUIKeys2UINodeInfo(_prepare2SpawnUIs));
    }
    spawnUIs(uis) {
        uis.forEach(_ui => {
            this.spawnUI(_ui);
        });
    }
    spawnUI(uiInfo) {
        var _a, _b, _c;
        let _uiKey = uiInfo.name;
        let _uiScript = (_a = uiInfo.script) !== null && _a !== void 0 ? _a : _uiKey;
        let _assetName = (_b = uiInfo.asset) !== null && _b !== void 0 ? _b : _uiKey;
        let _uiType = (_c = uiInfo.type) !== null && _c !== void 0 ? _c : UIType.Normal;
        if (!MetaData.IsUIScriptRegistered(_uiScript)) {
            console.warn("No ui script registered for ui %s", _uiScript);
        }
        let _uiPrefab = ResourceManager.Instance.Get(_assetName, this.sceneName);
        if (this.allSpawnedUICaches.has(_uiKey))
            return;
        if (!f(_uiPrefab)) {
            console.log("can not find asset %s", _assetName);
            return;
        }
        _uiPrefab = _uiPrefab;
        const _uiNode = instantiate(_uiPrefab);
        _uiNode.parent = this.getParentNode(_uiType);
        let _component = _uiNode.addComponent(MetaData.GetUIScriptConstructor(_uiScript));
        o(_component, "spawned");
        Reflect.set(_component, "__uiKey", _uiKey);
        Reflect.set(_component, "__uiType", _uiType);
        _component.node.active = false;
        this.allSpawnedUICaches.set(_uiKey, _component);
    }
    getParentNode(uiType) {
        if (uiType === "Normal") {
            return this.NormalUIRoot;
        }
        else if (uiType === "Standalone") {
            return this.StandaloneUIRoot;
        }
        else if (uiType === "Popup") {
            return this.PopupUIRoot;
        }
        return null;
    }
};
UIManager = UIManager_1 = __decorate([
    ccclass,
    executionOrder(-1001)
], UIManager);

class EventBase {
}
class SYS_UPDATE extends EventBase {
}
class SYS_START extends EventBase {
}
let EventManager = class EventManager {
    Register(eventHandler) {
        console.log("!!!!!!!!!!! Register !!!!!!!!!!!!!!!!!!");
        console.log(eventHandler);
    }
    Unregister(eventHandler) {
    }
    initialize() {
    }
};
EventManager = __decorate([
    i
], EventManager);

let SceneScriptManager = class SceneScriptManager {
    constructor() {
        this.sceneName = '';
        this.scripts = new Map();
        this.SceneName = StartSceneName;
    }
    set SceneName(value) {
        this.sceneName = value;
        let _sceneScriptName = `${this.sceneName}Script`;
        if (!MetaData.IsSceneScriptRegistered(_sceneScriptName))
            return;
        let _sceneScriptConstructor = MetaData.GetSceneScriptConstrutor(_sceneScriptName);
        this.scripts.set(this.sceneName, new _sceneScriptConstructor());
    }
    InvokeStartDelegate() {
        this.invoke('start');
    }
    invoke(funcName, ...args) {
        if (!this.scripts.get(this.sceneName))
            return;
        let _sceneScript = this.scripts.get(this.sceneName);
        let _func = Reflect.get(_sceneScript, funcName);
        if (_func !== undefined) {
            Reflect.apply(_func, _sceneScript, []);
        }
    }
};
SceneScriptManager = __decorate([
    i
], SceneScriptManager);

var SceneManager_1;
let SceneManager = SceneManager_1 = class SceneManager {
    constructor() {
        this.resConfig = new ResConfig();
        this.scriptManager = new SceneScriptManager();
        this.sceneName = StartSceneName;
        Reflect.set(SceneManager_1, "Instance", this);
    }
    get SceneName() {
        return this.sceneName;
    }
    setSceneName(val) {
        this.sceneName = val;
        this.scriptManager.SceneName = val;
        Reflect.set(ResourceManager.Instance, "sceneName", this.sceneName);
    }
    initialize() {
        this.setSceneName(StartSceneName);
        this.Load(StartSceneName);
    }
    Load(sceneName, progress, completed) {
        /**
         * 预加载 场景 -> 加载场景  -> 加载场景资源 -> UI资源处理-> 场景加载完成
         */
        n.Log("开始加载场景 %s", sceneName);
        ResourceManager.Instance.loadScene(sceneName, (completedcount, totalCount, item) => {
            if (f(progress))
                progress(completedcount / totalCount);
        }, (error, sceneAsset) => {
            // 
            n.Log("场景加载完成..", UIManager.Instance);
            // 加载场景自定义资源
            ResourceManager.Instance.LoadSceneRes([sceneName]).then(() => {
                o(UIManager.Instance, "onEnterScene", sceneName);
                // 场景切换完成
                this.setSceneName(sceneName);
                this.scriptManager.InvokeStartDelegate();
                this.onSceneLoaded(sceneName);
                if (f(progress))
                    progress(1);
                if (f(completed))
                    completed();
            });
        });
    }
    onSceneLoaded(sceneName) {
    }
};
SceneManager = SceneManager_1 = __decorate([
    i
], SceneManager);

class Managements {
}
Managements.UI = UIManager.Instance;
Managements.Resource = new ResourceManager();
Managements.Scene = new SceneManager();
Managements.Event = new EventManager();

const { ccclass: ccclass$1, property, executionOrder: executionOrder$1 } = _decorator;
let CCHperEntry = class CCHperEntry extends BaseComponent {
    constructor() {
        super(...arguments);
        this.resConfig = null;
        this.uiConfig = null;
        this.initializeFunction = "initialize";
    }
    onLoad() {
        game.addPersistRootNode(this.node);
        this.initialize();
    }
    initialize() {
        var _a;
        let _uiManager = (_a = this.Get("UIRoot")) === null || _a === void 0 ? void 0 : _a.addComponent(UIManager);
        Reflect.set(Managements, "UI", _uiManager);
        // 初始化依赖于固有资源的管理器
        o(Managements.Resource, this.initializeFunction, this.resConfig).then(() => {
            o(_uiManager, this.initializeFunction, this.uiConfig).then(() => {
                o(Managements.Scene, this.initializeFunction);
            });
        });
    }
    start() {
    }
    update(deltaTime) {
        // Your update function goes here.
    }
};
__decorate([
    property({
        type: JsonAsset,
        tooltip: "资源配置文件, 默认加载 resources/configs/res.json"
    })
], CCHperEntry.prototype, "resConfig", void 0);
__decorate([
    property({
        type: JsonAsset,
        tooltip: "UI配置文件, 默认加载 resources/configs/uis.json"
    })
], CCHperEntry.prototype, "uiConfig", void 0);
CCHperEntry = __decorate([
    ccclass$1('CCHperEntry'),
    executionOrder$1(-1000)
], CCHperEntry);

class Platform {
    static get IsBrowser() {
        var _a;
        return (_a = sys['isBrowser']) !== null && _a !== void 0 ? _a : false;
    }
}

export { BaseComponent, CCHperEntry, EventBase, EventManager, ISceneScript, Managements, MetaData, PersistSceneName, Platform, ResourceManager, SYS_START, SYS_UPDATE, SceneManager, StartSceneName, UIBase, UIManager, UIType, mapString2CCAssetType, scene_script, ui_script };
//# sourceMappingURL=index.mjs.map
