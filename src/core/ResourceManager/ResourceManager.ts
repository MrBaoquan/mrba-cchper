import { Asset, AssetManager, assetManager, director, Director, JsonAsset, resources, SceneAsset, __private } from "cc";
import { isset, ParallelForEach, Logger, singleton } from "mrba-eshper";
import { PersistSceneName, StartSceneName } from "../TypeDefinitions";
import { AssetDirInfo, ResConfig } from "./ResConfig";

@singleton
export class ResourceManager
{
    public static readonly Instance:ResourceManager;
    //config:ResConfig = {};
    // 按照 bundle 名称分组资源
    private assets_gby_Bundle:Map<string,Map<string,Asset>> = new Map<string,Map<string,Asset>>();
    // 按照场景名称 分组资源
    private assets_gby_Scene:Map<string,Map<string,Asset>> = new Map<string,Map<string,Asset>>();

    private bundles:Map<string,AssetManager.Bundle> = new Map<string,AssetManager.Bundle>();
    private config:ResConfig = new ResConfig();

    constructor(){
        Reflect.set(ResourceManager,"Instance",this);
    }
    /**
     * 初始化
     */
    private initialize(asset?:JsonAsset){
        return new Promise((resolve,reject)=>{
            this.config.Load(asset).then(_config=>{
                resolve(undefined);
            }).catch();
        });
    }

 
    public loadScene(sceneName:string, progress: Director.OnLoadSceneProgress, launched:Director.OnSceneLaunched){
        if(sceneName===StartSceneName) {
            progress(1,1,undefined);
            launched(null,undefined);
            return;
        }

        let _sceneInfo = this.config.GetSceneInfo(sceneName);
        let _bundleName = _sceneInfo.bundle;
        if(!isset(_sceneInfo.bundle))
        {
            director.preloadScene(sceneName,
                (completedCount: number, totalCount: number, item: any)=>{
                    progress(completedCount, totalCount, item);
                },(error: null | Error, sceneAsset?: SceneAsset)=>{
                    director.loadScene(sceneName, launched);
                });
            return;
        }

        this.pullBundle(_bundleName!).then(_bundle=>{
            _bundle.loadScene(sceneName,
                (completedCount: number, totalCount: number, item: any)=>{
                    progress(completedCount, totalCount, item);
                },(error, sceneAsset)=>{
                    director.loadScene(sceneName, launched);
                });
        })
    }

    public LoadSceneRes(sceneNames:string[]){
        return new Promise((resolve,reject)=>{
            this.unloadSceneRes(this.curSceneName);

            this.loadNewSceneRes(sceneNames).then(()=>{
                resolve(undefined);
            }).catch(reject);
        });
    }

    private unloadSceneRes(sceneName:string){
        console.log("unload scene %s", sceneName);
        
        if(!this.config.IsAutoRelease(sceneName)) return;
        // 要卸载哪些文件夹?
        let _sceneDirs = this.config.getSceneDirs(sceneName);
        _sceneDirs.forEach(_assetDir=>{
            this.bundles.get(_assetDir.bundleName)?.release(_assetDir.path,_assetDir.type);
        });

        let _releasedAssetKeys = _sceneDirs.map(_dir=>_dir.url)
            .reduce((_assetsNames, _url)=>this.config.GetAssetNamesByUrl(_url),new Array<string>());

        let _sceneBundles = this.config.getBundles(sceneName);

        // 同步bundles资源映射
        Array.from(this.assets_gby_Bundle.keys()).filter(_bundleKey=>_sceneBundles.includes(_bundleKey)).forEach(_bundleName=>{
            Array.from(this.assets_gby_Bundle.get(_bundleName)!.keys())
                .filter(_assetKey=>_releasedAssetKeys.includes(_assetKey))
                .forEach(_assetKey=>{
                    this.assets_gby_Bundle.get(_bundleName)!.delete(_assetKey);
                    console.log("移除%s包 %s资源",_bundleName, _assetKey);
                });
        });

        // 同步场景资源映射
        if(! this.assets_gby_Scene.has(sceneName)) return;
        Array.from(this.assets_gby_Scene.get(sceneName)!.keys()).forEach(_assetKey=>{
            if(!_releasedAssetKeys.includes(_assetKey)) return;
            this.assets_gby_Scene.get(sceneName)!.delete(_assetKey);
            console.log("移除%s场景 %s资源",sceneName, _assetKey);
        });
    }

    private loadNewSceneRes(sceneNames:string[])
    {
        return new Promise((resolve,reject)=>{
            console.log("加载自定义场景资源: ", sceneNames[0]);
            let _bundles:string[] = this.config.getScenesBundles(sceneNames);
            console.log("包列表", _bundles);
            // Start load bundles
            ParallelForEach(_bundles,(_key,_finishLoadBundleStep)=>{
                let _bundleName = _key;
                this.pullBundle(_bundleName).then(_bundle=>{
                    /// Start 加载bundle下的文件夹
                    ParallelForEach(this.config.getScenesBundleDirs(sceneNames, _bundleName),(_assetDir,_loadDirStepFinished)=>{
                        this.loadResourceDir(_assetDir).then(assetsMap=>{
                            let _resUrl = _assetDir.url;
                            let _resSceneKey:string = _assetDir.sceneName;

                            if(!this.assets_gby_Bundle.has(_bundleName)){
                                this.assets_gby_Bundle.set(_bundleName, new Map<string,Asset>());
                            }

                            if(!this.assets_gby_Scene.has(_resSceneKey)){
                                this.assets_gby_Scene.set(_resSceneKey, new Map<string,Asset>());
                            }
                            
                            for(let _key of assetsMap.keys()){
                                Logger.Log("%s load asset %s",_bundleName,_key);
                                Logger.Log("%s load asset %s",_resSceneKey,_key);
                                this.assets_gby_Bundle.get(_bundleName)?.set(_key,<Asset>assetsMap.get(_key));
                                this.assets_gby_Scene.get(_resSceneKey)?.set(_key,<Asset>assetsMap.get(_key));
                                this.config.SyncUrlAsset(_resUrl, _key);
                            }

                            _loadDirStepFinished();
                        });
                    },()=>{
                        _finishLoadBundleStep();
                    });
                    ///  End

                }).catch(error=>{
                    reject(error);
                    _finishLoadBundleStep();
                });
                
            },()=>{
                console.log('finished');
                resolve(undefined);
            });
            // End load bundles
            

        });
    }

    private sceneName:string="";
    private get curSceneName():string{
        return this.sceneName;
    }

    public Get<T extends Asset>(key:string, sceneName?:string){
        console.log(this.assets_gby_Scene);
        let _asset = this.GetPersist<T>(key);
        if(!isset(_asset))
            _asset = this.GetScene<T>(key,sceneName??this.curSceneName);
        return _asset;
    }


    public GetPersist<T extends Asset>(key:string):T|null{
        return <T>this.assets_gby_Scene.get(PersistSceneName)?.get(key);
    }

    public GetScene<T extends Asset>(key:string, sceneName:string):T|null{
        return <T>this.assets_gby_Scene.get(sceneName)?.get(key);
    }

    private pullBundle(bundleName:string)
    {
        return new Promise((resolve:(bundle:AssetManager.Bundle)=>void,reject)=>{
            
            if(this.bundles.has(bundleName)){
                resolve(<AssetManager.Bundle>this.bundles.get(bundleName));
                return;
            }else if(bundleName==='resources'){
                this.bundles.set("resources",resources);
                resolve(resources);
                return;
            }

            
            assetManager.loadBundle(bundleName,(_error,_bundle)=>{
                if(isset(_error)) reject('load bundle error');
                if(!isset(_bundle)) reject('load bundle error');

                this.bundles.set(bundleName,_bundle!);
                resolve(_bundle!);
            });
        });
    }

    private preloadDir(bundle:AssetManager.Bundle, dir:string, type:__private.cocos_core_asset_manager_shared_AssetType)
    {
        let _pathes = bundle.getDirWithPath(dir,type);
        _pathes.forEach(_path=>{
            console.log(_path.path);
        })
    }

    private loadResourceDir(assetDir:AssetDirInfo){
        return new Promise((resolve:(res:Map<string,Asset>)=>void,reject)=>{
            let _bundleName = assetDir.bundleName;
            let _resPath = assetDir.path;
            this.pullBundle(_bundleName).then(_bundle=>{
                _bundle.loadDir(_resPath, assetDir.type, (_error,_data)=>{
                    if(_error!==undefined){
                        reject(_error);
                    }
                    let _res:Map<string,Asset> = new Map<string,Asset>();
                    _data?.forEach(_item=>{
                        let _info = <{path:string,uuid:string}>_bundle.getAssetInfo(_item._uuid);
                        let _name = _info.path.split('/').pop();
                        if(_name===undefined) return;
                        _res.set(_name, _item);
                    });
                    resolve(_res);
                });

            }).catch(reject);
        });
    }
}
