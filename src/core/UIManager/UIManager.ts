
import { _decorator, Component, Node, game, Scene, director, find, __private, Label, resources, Prefab, instantiate, Constructor, JsonAsset } from 'cc';
import { Logger, isset, CallFunction } from 'mrba-eshper';
import { ResourceManager } from '../ResourceManager/ResourceManager';
import { MetaData } from '../TypeDefinitions';
import { UIBase, UIType } from './UIBase';
import { UIConfig, UINodeInfo } from './UIConfig';
const { ccclass, property, executionOrder } = _decorator;

@ccclass
@executionOrder(-1001)
export class UIManager extends Component
{
    public static readonly Instance:UIManager;
    private StandaloneUIRoot:Node;
    private NormalUIRoot:Node;
    private PopupUIRoot:Node;
    private config:UIConfig = new UIConfig();

    private allSpawnedUICaches:Map<string,UIBase> = new Map<string,UIBase>();

    // 实时 UI 数据
    private standaloneUIs:Map<string,UIBase> = new Map<string,UIBase>();
    private normalUIs:Map<string,UIBase> = new Map<string,UIBase>();
    private popupUIs:Array<UIBase> = new Array<UIBase>();

    constructor(){
        super();
        Reflect.set(UIManager,"Instance",this);
    }
    
    onLoad(){
        Logger.Warn(UIManager.Instance);
    }

    initialize(asset?:JsonAsset){
        return new Promise((resolve,reject)=>{
            this.StandaloneUIRoot = find("StandaloneUI",this.node)!;
            this.NormalUIRoot = find("NormalUI",this.node)!;
            this.PopupUIRoot = find("PopupUI",this.node)!;

            this.config.Load(asset).then(_config=>{
               resolve(undefined);
            });
        });
    }

    /**
     * 获取UI实例
     * @param UIKey UI名称
     * @param callback 成功获取到UI后的回调   失败无回调
     */
    public Get(UIKey:string, callback?:(ui:UIBase)=>void):UIBase|null;
    public Get<T extends UIBase>(UIKey:Constructor<T>, callback?:(ui:T)=>void):T|null;
    public Get(UIKey:any, callback:(ui:any)=>void):any{
        if(typeof UIKey === "string"){
            return this.getUI(UIKey, _ui=>{
                if(isset(callback)) callback!(_ui);
            });
        }
        if(!MetaData.IsUIScriptRegistered(UIKey)) return null;

        return this.getUI(MetaData.GetUIClassRegisteredName(UIKey)!,_ui=>{
            if(isset(callback)) callback!(_ui);
        });
    }

    /**
     * 显示UI
     * @param UIKey UI名称
     * @param callback 成功获取到UI后的回调  失败无回调
     */
    public Show(UIKey:string, callback?:(ui:UIBase)=>void):UIBase|null;
    public Show<T extends UIBase>(UIKey:Constructor<T>, callback?:(ui:T)=>void):T|null;
    public Show(UIKey:any, callback:(ui:any)=>void):any
    {
        if(typeof UIKey==='string'){
            return this.showUI(UIKey,_ui=>{
                if(isset(callback))
                    callback!(_ui);
            });
        }

        if(!MetaData.IsUIScriptRegistered(UIKey)) return null;
        return this.showUI(MetaData.GetUIClassRegisteredName(UIKey)!,
            _ui=>{
                if(isset(callback))
                    callback!(_ui);
            });
    }

    /**
     * 隐藏UI
     * @param UIKey UI名称
     * @param callback 成功获取到UI实例后的回调 失败无回调
     */
    public Hide(UIKey:string, callback?:(ui:UIBase)=>void) : UIBase|null;
    public Hide<T extends UIBase>(UIKey:Constructor<T>, callback?:(ui:T)=>void):T|null;
    public Hide(UIKey:any, callback:(ui:any)=>void):any{
        if(typeof UIKey==="string"){
            return this.hideUI(UIKey,_ui=>{
                if(isset(callback)) callback!(_ui);
            });
        }

        if(!MetaData.IsUIScriptRegistered(UIKey)) return;
        return this.hideUI(MetaData.GetUIClassRegisteredName(UIKey)!,
            _ui=>{
                if(isset(callback)) callback!(_ui);
            });
    }

    private hideUI(UIKey:string, callback:(ui:UIBase)=>void):UIBase|null{
        let _uiComponent = this.getUI(UIKey);
        if(!isset(_uiComponent)){
            Logger.Warn("hide ui %s failed, ui not exists.",UIKey);
            return _uiComponent;
        }
        let _uiType =  _uiComponent!.UIType;
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
            default:
                break;
        }
        callback(_uiComponent!);
        return _uiComponent;
    }

    private showUI(UIKey:string, callback:(ui:UIBase)=>void):UIBase|null{
        let _uiComponent = this.getUI(UIKey);
        console.log(_uiComponent);
        
        if(!isset(_uiComponent)){
            Logger.Warn("show ui %s failed, ui not exists.",UIKey);
            return _uiComponent;
        }
        console.log(_uiComponent);
        
        let _uiType =  _uiComponent!.UIType;
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
            default:
                break;
        }
        callback(_uiComponent!);
        return _uiComponent;
    }

    private getUI(UIKey:string, callback?:(ui:UIBase)=>void):UIBase|null{
        if(!this.allSpawnedUICaches.has(UIKey)) return null;
        let _uiComponent = this.allSpawnedUICaches.get(UIKey)!;
        if(isset(callback)) callback!(_uiComponent);
        return _uiComponent;
    }

    private showStandaloneUI(uiKey:string){
        let _uiComponent = this.getUI(uiKey) as UIBase;

        [...this.standaloneUIs.values()].filter(_ui=>_ui.UIKey!=uiKey).forEach(_ui=>{
            CallFunction(_ui,"handleHide");
        });

        if(!_uiComponent.Actived) 
            CallFunction(_uiComponent, "handleShow");

        if(this.standaloneUIs.has(uiKey))
            this.standaloneUIs.set(uiKey,_uiComponent);
    }

    private hideStandaloneUI(uiKey:string){
        if(!this.standaloneUIs.has(uiKey)) return;
        let _uiComponent = this.standaloneUIs.get(uiKey)!;

        if(_uiComponent.Actived){
            CallFunction(_uiComponent,"handleHide");
            this.standaloneUIs.delete(uiKey);
        }
        
        let _lastUIKey = Array.from(this.standaloneUIs.keys()).pop();
        if(!isset(_lastUIKey)) return;
        CallFunction(this.standaloneUIs.get(_lastUIKey!)!, "handleShow");
    }

    private showNormalUI(uiKey:string){
        if(this.normalUIs.has(uiKey)) return;

        let _uiComponent = this.getUI(uiKey) as UIBase;
        CallFunction(_uiComponent,"handleShow");
        this.normalUIs.set(uiKey, _uiComponent);
    }

    private hideNormalUI(uiKey:string){
        if(!this.normalUIs.has(uiKey)) return;

        let _uiComponent = this.normalUIs.get(uiKey)!;
        CallFunction(_uiComponent,"handleHide");

        this.normalUIs.delete(uiKey);
    }

    private showPopupUI(uiKey:string){
        let _uiComponent = this.getUI(uiKey) as UIBase;
        if(!this.popupUIs.includes(_uiComponent)){
            this.popupUIs.push(_uiComponent);
        }else{
            this.popupUIs.splice(this.popupUIs.indexOf(_uiComponent),1);
            this.popupUIs.push(_uiComponent);
        }

        if(!_uiComponent.Actived)
        {
            CallFunction(_uiComponent,"handleShow");
        }
        
        let _lastSibilingIndex = _uiComponent.node.parent?_uiComponent.node.parent.children.length-1:0;
        _uiComponent.node.setSiblingIndex(_lastSibilingIndex);
    }

    private hidePopupUI(uiKey?:string){
        if(this.popupUIs.length<=0) return;
        let _uiComponent:UIBase;
        if(isset(uiKey)){
            let _spawnedUI = this.allSpawnedUICaches.get(uiKey!);
            if(!isset(_spawnedUI)) return;
            if(!this.popupUIs.includes(_spawnedUI!)) return;
            _uiComponent = _spawnedUI!;
            this.popupUIs.splice(this.popupUIs.indexOf(_uiComponent),1);
        }
        else
            _uiComponent = this.popupUIs.pop()!;
        if(isset(_uiComponent)) return;
        CallFunction(_uiComponent!,"handleHide");
    }
    

    start(){
    }

    private destroyUIs(uis:string[]){
        // 销毁UI
        Array.from(this.allSpawnedUICaches.keys())
            .filter(_uiKey=>uis.includes(_uiKey))
            .map(_uiKey=>this.allSpawnedUICaches.get(_uiKey)!)
            .forEach(_ui=>{
                this.Hide(_ui.UIKey);
                _ui.destroy();
                this.allSpawnedUICaches.delete(_ui.UIKey);
            });

        Array.from(this.standaloneUIs.keys()).filter(_uiKey=>uis.includes(_uiKey))
            .forEach(_uiKey=>{
                this.standaloneUIs.delete(_uiKey);
            });

        Array.from(this.normalUIs.keys()).filter(_uiKey=>uis.includes(_uiKey))
            .forEach(_uiKey=>{
                this.normalUIs.delete(_uiKey);
            });

        this.popupUIs
            .filter(_ui=>uis.includes(_ui.UIKey))
            .forEach(_ui=>{
                this.popupUIs.splice(this.popupUIs.indexOf(_ui),1);
            });
    }

    private sceneName:string;
    private onEnterScene(sceneName:string)
    {
        /**
         * 销毁上一场景UI   -> 创建当前场景UI
         */

        this.sceneName = sceneName;
        let _allUIs = this.config.GetSceneUIs(sceneName);
        let _newUIs = _allUIs.map(_ui=>_ui.name);

        let _currentUIs = Array.from(this.allSpawnedUICaches.keys());
        let _prepare2DestroyUIs = _currentUIs.filter(_ui=>!_newUIs.includes(_ui));
        this.destroyUIs(_prepare2DestroyUIs);

        let _prepare2SpawnUIs = _newUIs.filter(_ui=>!_currentUIs.includes(_ui));
        console.warn(_newUIs, _currentUIs, _prepare2SpawnUIs);
        
        this.spawnUIs(this.config.ConvertUIKeys2UINodeInfo(_prepare2SpawnUIs));
    }

    private spawnUIs(uis:UINodeInfo[]){
        uis.forEach(_ui=>{
            this.spawnUI(_ui);
        });
    }

    private spawnUI(uiInfo:UINodeInfo){
        let _uiKey = uiInfo.name;
        let _uiScript = uiInfo.script??_uiKey;
        let _assetName = uiInfo.asset??_uiKey;
        let _uiType = uiInfo.type??UIType.Normal;

        if(!MetaData.IsUIScriptRegistered(_uiScript)){
            console.warn("No ui script registered for ui %s", _uiScript);
        }

        let _uiPrefab = ResourceManager.Instance.Get<Prefab>(_assetName, this.sceneName);
        if(this.allSpawnedUICaches.has(_uiKey)) return;
        if(!isset(_uiPrefab)){
            console.log("can not find asset %s", _assetName);
            return;
        };

        _uiPrefab = _uiPrefab!;
        const _uiNode:Node = instantiate(_uiPrefab);
        _uiNode.parent = this.getParentNode(_uiType);
        let _component:UIBase = <UIBase>_uiNode.addComponent(MetaData.GetUIScriptConstructor(_uiScript)!);

        CallFunction(_component, "spawned");

        Reflect.set(_component,"__uiKey", _uiKey);
        Reflect.set(_component,"__uiType", _uiType);

        _component.node.active = false;
        this.allSpawnedUICaches.set(_uiKey,_component);
    }

    private getParentNode(uiType:string) : Node|null{
        if(uiType === "Normal"){
            return this.NormalUIRoot;
        }else if(uiType === "Standalone"){
            return this.StandaloneUIRoot;
        }else if(uiType==="Popup"){
            return this.PopupUIRoot;
        }
        return null;
    }

    
    

}

(function(){
    console.log("require ui manager");
})();