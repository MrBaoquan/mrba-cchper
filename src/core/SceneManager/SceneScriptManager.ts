import { EventManager, SYS_UPDATE, IDisposable } from "../EventManager/EventManager";
import { CallFunction, isset, Logger, singleton, SINGLETON_KEY } from "mrba-eshper";
import { Constructor, ISceneScript, MetaData, StartSceneName } from "../TypeDefinitions";

@singleton
export class SceneScriptManager
{
    private sceneName:string = '';
    private scripts:Map<string,ISceneScript> = new Map<string,ISceneScript>();

    constructor(){
        this.SceneName = StartSceneName;
    }

    public set SceneName(value:string){
        this.sceneName = value;
        let _sceneScriptName = `${this.sceneName}Script`;

        if(!MetaData.IsSceneScriptRegistered(_sceneScriptName)) return;
        let _sceneScriptConstructor:Constructor = MetaData.GetSceneScriptConstrutor(_sceneScriptName)!;
        
        this.scripts.set(this.sceneName, new _sceneScriptConstructor());
    }

    private get eventManager():EventManager{
        return Reflect.get(EventManager,SINGLETON_KEY);
    }

    updateHandler:IDisposable = null;

    public InvokeStartDelegate(){
        this.invoke('start');
        if(isset(this.updateHandler)) this.updateHandler.Dispose();
        this.updateHandler = this.eventManager.Register(SYS_UPDATE,_event=>{
            Logger.Log(_event);
            CallFunction(this.getSceneScript(this.sceneName),"update",_event.delta);
        })
    }

    public InvokeOnDestroyDelegate(){
        if(isset(this.updateHandler)) this.updateHandler.Dispose();
        this.invoke("destroy");
    }

    private getSceneScript(sceneName:string):ISceneScript{
        if(!this.scripts.get(sceneName)) return null;
        return this.scripts.get(sceneName);
    }

    private invoke(funcName:string,...args:any[]){
        let _sceneScript = this.getSceneScript(this.sceneName);
        if(!isset(_sceneScript)) return;
        CallFunction(_sceneScript,funcName);
    }

}