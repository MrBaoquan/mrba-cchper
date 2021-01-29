import { __private } from "cc";
import { CallFunction } from "mrba-eshper";
import { UIBase } from "./UIManager/UIBase";

export const PersistSceneName:string = 'Persistence';
export const StartSceneName:string = 'SceneEntry';

export type Constructor<T = {}> = new (...args: any[]) => T;

export abstract class ISceneScript{}

export class MetaData{
    private static sceneScriptClasses:Map<string,Constructor> = new Map<string,Constructor>();
    public static IsSceneScriptRegistered(scriptName:string):boolean{
        return this.sceneScriptClasses.has(scriptName);
    }
    public static GetSceneScriptConstrutor(scriptName:string):Constructor|null{
        if(!this.IsSceneScriptRegistered(scriptName)) return null;
        return this.sceneScriptClasses.get(scriptName)??null;
    }

    private static uiClassNamesMap:Map<string,string> = new Map<string,string>();
    private static uiScriptClasses:Map<string,__private.Constructor<UIBase>> = new Map<string,__private.Constructor<UIBase>>();

    public static IsUIScriptRegistered(scriptName:string):boolean;
    public static IsUIScriptRegistered<T extends UIBase>(scriptClass:__private.Constructor<T>):boolean;
    public static IsUIScriptRegistered(target:any):boolean{
        if(typeof target==="string") return this.uiScriptClasses.has(target);
        let _className = target.prototype.constructor.name;
        if(!this.uiClassNamesMap.has(_className)) return false;
        return this.uiScriptClasses.has(this.uiClassNamesMap.get(_className)!);
    }

    public static GetUIScriptConstructor(scriptName:string): __private.Constructor<UIBase>|null{
        return this.uiScriptClasses.get(scriptName)??null;
    }

    public static GetUIClassRegisteredName<T extends UIBase>(uiScriptConstructor:__private.Constructor<T>):string|null{
        return this.uiClassNamesMap.get(uiScriptConstructor.prototype.constructor.name)??null;
    }
}

/**
 * 注册UI脚本
 * @param className 脚本名称
 */
export const ui_script = <T extends UIBase>(className:string)=>(target:new(...args:any[])=>T)=>{
    CallFunction(Reflect.get(MetaData,"uiClassNamesMap"),"set",target.prototype.constructor.name, className);
    CallFunction(Reflect.get(MetaData,"uiScriptClasses"),"set",className, target);
}

/**
 * 注册场景脚本
 * @param classname 场景脚本名称
 */
export const scene_script = <T extends ISceneScript>(classname:string)=>(target:new(...args:any[])=>any)=>{
    CallFunction(Reflect.get(MetaData,"sceneScriptClasses"), "set", classname,target);
}