import { JsonAsset, resources, __private } from "cc";
import { isset, singleton } from "mrba-eshper";
import { mapString2CCAssetType } from "../../utils/CCUtils";
import { PersistSceneName } from "../TypeDefinitions";


interface ResNodeInfo{
    type:string,
    url:string
}

interface ResConfigDescriptor{
    [name:string]:{
        autoRelease:boolean,
        bundle:string,
        assets:ResNodeInfo[]
    }
}

export interface AssetDirInfo{
    sceneName:string,       // 所属场景
    url:string,             // 资源文件夹url
    bundleName:string,      // 所属包名
    path:string,         // 资源文件夹
    type:__private.cocos_core_asset_manager_shared_AssetType        // 资源类型
}

@singleton
export class ResConfig{ 
    /**
     * 资源配置
     */
    config:ResConfigDescriptor={};
    /**
     * 资源url与场景名称的映射
     */
    pathsGroupByScene:Map<string,string> = new Map<string,string>();

    /**
     * 资源url与url文件夹下的资源列表关系映射
     */
    assetsGroupByUrl:Map<string,Set<string>> = new Map<string,Set<string>>();

    Load(asset?:JsonAsset){
        return new Promise((resolve:(_config:ResConfigDescriptor)=>void,reject)=>{
            if(isset(asset)){
                this.build(asset!);
                resolve(this.config);
                return;
            }
            resources.load("configs/res",JsonAsset,(_error,_data)=>{
                if(_error!==undefined){
                    reject(_error);
                    return;
                } 
                this.build(_data);
                resolve(this.config);
            });
        });
    }

    private build(asset:JsonAsset){
        let _obj = asset.json;
        this.config = <ResConfigDescriptor>_obj;
        this.buildPathesGroupByScene();
    }

    public IsAutoRelease(sceneName:string):boolean{
        return this.config[sceneName].autoRelease??false;
    }

    public SyncUrlAsset(url:string,assetKey:string){
        if(!this.assetsGroupByUrl.has(url))
            this.assetsGroupByUrl.set(url, new Set<string>());
        this.assetsGroupByUrl.get(url)!.add(assetKey);
    }

    public GetAssetNamesByUrl(url:string):Array<string>{
        if(!this.assetsGroupByUrl.has(url)) return[];
        return Array.from(this.assetsGroupByUrl.get(url)!);
    }

    public GetSceneInfo(sceneName:string){
        return this.config[sceneName];
    }

    /**
     * 
     * @param 获取指定场景下的资源包名称
     */
    public getBundles(scene:string):string[]{
        let _node = this.config[scene];
        if(_node===undefined) return [];
        return Array.from(new Set(_node.assets.map(_=>this.buildAssetDirInfo(_)!.bundleName)));
    }

    /**
     * 
     * @param sceneNames 获取多个场景下的资源包 默认包含Persistence场景资源
     */
    public getScenesBundles(sceneNames:string[]):string[]{
        return Array.from(new Set(sceneNames.reduce((_bundles,_sceneName)=>
                _bundles.concat(this.getBundles(_sceneName))
            ,this.getBundles(PersistSceneName))));
    }

    /**
     * 获取scene场景下所有文件夹信息
     * @param scene 
     */
    public getSceneDirs(scene:string):AssetDirInfo[]{
        let _node = this.config[scene];
        if(_node===undefined) return[];
        return _node.assets.map(_=>this.buildAssetDirInfo(_)!)   
    }

    /**
     * 获取scene场景下 bundleName包 的所有文件夹信息
     * @param scene 
     * @param bundleName 
     */
    public getBundleDirs(scene:string, bundleName:string):AssetDirInfo[]{
        let _node = this.config[scene];
        if(_node===undefined) return[];

        return this.getSceneDirs(scene)
                .filter(_assetUrl=>_assetUrl.bundleName===bundleName);
    }

    /**
     * 获取多场景下的某个bundle 对应的文件夹列表  (默认包含Persistence场景)
     * @param sceneNames 场景名称
     * @param bundleName 包名
     */
    public getScenesBundleDirs(sceneNames:string[], bundleName:string):AssetDirInfo[]{
        return sceneNames.reduce((_dirs, _sceneName)=>
                _dirs.concat(this.getBundleDirs(_sceneName,bundleName)),
            this.getBundleDirs(PersistSceneName,bundleName));
    }

    /**
     * 
     * @param url example  'resources://prefabs/uis'
     */
    public buildAssetDirInfo(dirNode:ResNodeInfo):AssetDirInfo|null{
        let _url = dirNode.url;

        let _bundleRegex = /.*\:\/\//;
        let _result = _bundleRegex.exec(_url);
        
        if(_result===null) return null;
        let _bundleName = (<RegExpExecArray>_result)[0].slice(0,-3);

        let _pathRegex = /\:\/\/.*/;
        _result = _pathRegex.exec(_url);

        if(_result===null) return null
        let _path = (<RegExpExecArray>_result)[0].slice(3);
        return {
            sceneName:this.GetSceneNameByUrl(_url),   // TODO 赋值场景名
            url:_url,
            bundleName:_bundleName,
            path:_path,
            type:mapString2CCAssetType(dirNode.type)
        };
    }

    public GetSceneNameByUrl(url:string):string{
        return this.pathsGroupByScene.get(url)??PersistSceneName;
    }

    buildPathesGroupByScene(){
        this.pathsGroupByScene.clear();
        Object.keys(this.config).forEach(_scene=>{
            var _sceneAssets = this.config[_scene];
            _sceneAssets.assets.forEach(_dir=>{
                this.pathsGroupByScene.set(_dir.url,_scene);
            });
        });
    }
}