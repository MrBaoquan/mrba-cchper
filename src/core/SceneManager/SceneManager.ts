import { CallFunction, isset, Logger, singleton } from "mrba-eshper";
import { ResConfig } from "../ResourceManager/ResConfig";
import { ResourceManager } from "../ResourceManager/ResourceManager";
import { StartSceneName } from "../TypeDefinitions";
import { UIManager } from "../UIManager/UIManager";
import { SceneScriptManager } from "./SceneScriptManager";

@singleton
export class SceneManager
{
    private resConfig:ResConfig  = new ResConfig();
    private scriptManager:SceneScriptManager = new SceneScriptManager();
    private sceneName:string = StartSceneName;
    public static Instance:SceneManager;

    public get SceneName():string{
        return this.sceneName;
    }
    private setSceneName(val:string){
        this.sceneName = val;
        this.scriptManager.SceneName = val;
        Reflect.set(ResourceManager.Instance, "sceneName", this.sceneName);
    }

    constructor(){
        Reflect.set(SceneManager,"Instance",this);
    }

    private initialize()
    {
        this.setSceneName(StartSceneName);
        this.Load(StartSceneName);
    }

    public Load(sceneName:string, progress?:(progress:number)=>void, completed?:()=>void){
        /**
         * 预加载 场景 -> 加载场景  -> 加载场景资源 -> UI资源处理-> 场景加载完成
         */
        Logger.Log("开始加载场景 %s", sceneName);
        ResourceManager.Instance.loadScene(sceneName,(completedcount,totalCount,item)=>{
            if(isset(progress))
                progress!(completedcount / totalCount);

        },(error, sceneAsset)=>{
            // 
            Logger.Log("场景加载完成..", UIManager.Instance);
            // 加载场景自定义资源
            ResourceManager.Instance.LoadSceneRes([sceneName]).then(()=>{
                CallFunction(UIManager.Instance, "onEnterScene", sceneName);

                // 场景切换完成
                this.setSceneName(sceneName);
                this.scriptManager.InvokeStartDelegate();
                this.onSceneLoaded(sceneName);
                if(isset(progress))
                    progress!(1);
                if(isset(completed))
                    completed!();
            });
        });
    }

    private onSceneLoaded(sceneName:string){
        
    }   
}