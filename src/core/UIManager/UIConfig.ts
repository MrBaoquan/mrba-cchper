import { JsonAsset, resources } from "cc";
import { isset, singleton } from "mrba-eshper";
import { PersistSceneName } from "../TypeDefinitions";

export interface UINodeInfo{
    name:string,
    script:string,
    asset:string,
    type:string
}

interface UIConfigDescriptor{
    [name:string]:UINodeInfo[]
}

@singleton
export class UIConfig{
    config:UIConfigDescriptor={};
    uis:Map<string,UINodeInfo> = new Map<string,UINodeInfo>();
    
    public Load(asset?:JsonAsset){
        return new Promise((resolve:(_config:UIConfigDescriptor)=>void,reject)=>{
            if(isset(asset)){
                this.build(asset!);
                resolve(this.config);
                return;
            }
            resources.load("configs/uis",JsonAsset,(_error,_data)=>{
                if(_error!==undefined){
                    reject(_error);
                    return;
                } 
                this.build(_data);
                resolve(this.config);
            });
        });
    }

    private build(asset:JsonAsset)
    {
        let _obj = asset.json;
        this.config = <UIConfigDescriptor>_obj;
        Object.keys(this.config)
            .reduce((_uis,_sceneKey)=>_uis.concat(this.config[_sceneKey]),new Array<UINodeInfo>())
            .reduce((_uis,_uiNode)=>_uis.set(_uiNode.name,_uiNode),this.uis);
    }

    public GetSceneUIs(sceneName:string) : UINodeInfo[]
    {
        return this.getPersistUIs().concat(this.customSceneUIs(sceneName));
    }

    public ConvertUIKeys2UINodeInfo(keys:string[]) : UINodeInfo[]
    {
        return keys.map(_key=>this.uis.get(_key)).filter(_ui=>isset(_ui)) as UINodeInfo[];
    }

    private getPersistUIs(){
        if(this.config[PersistSceneName]===undefined) return [];
        return this.config[PersistSceneName];
    }

    private customSceneUIs(sceneName:string){
        if(this.config[sceneName]===undefined) return [];
        return this.config[sceneName];
    }

    
}