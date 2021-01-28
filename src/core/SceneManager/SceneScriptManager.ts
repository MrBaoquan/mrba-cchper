import { singleton } from "mrba-eshper";
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

    public InvokeStartDelegate(){
        this.invoke('start');
    }

    private invoke(funcName:string,...args:any[]){
        if(!this.scripts.get(this.sceneName)) return;
        let _sceneScript:ISceneScript = this.scripts.get(this.sceneName)!;
        let _func = Reflect.get(_sceneScript,funcName);
        if(_func!==undefined){
            Reflect.apply(_func,_sceneScript,[]);
        }
    }

}