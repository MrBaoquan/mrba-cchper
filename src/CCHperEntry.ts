import { _decorator, game, JsonAsset } from "cc";
import { CallFunction, Logger } from 'mrba-eshper';
const { ccclass, property, executionOrder } = _decorator;

import { UIManager } from './core/UIManager/UIManager';
import { Managements } from './facades/Managements';
import { BaseComponent } from './utils/CCUtils';
import { SYS_UPDATE } from "./core/EventManager/EventManager";


@ccclass('CCHperEntry')
@executionOrder(-1000)
export class CCHperEntry extends BaseComponent {

    @property({
        type: JsonAsset,
        tooltip:"资源配置文件, 默认加载 resources/configs/res.json"
    })
    private resConfig: JsonAsset = null;

    @property({
        type: JsonAsset,
        tooltip:"UI配置文件, 默认加载 resources/configs/uis.json"
    })
    private uiConfig: JsonAsset = null;

    readonly initializeFunction:string = "initialize";
    
    onLoad(){
        game.addPersistRootNode(this.node);
        this.initialize();
    }

    initialize(){
        let _uiManager = this.Get("UIRoot")?.addComponent(UIManager);
        Reflect.set(Managements,"UI",_uiManager);

        // 初始化依赖于固有资源的管理器
        CallFunction(Managements.Resource,this.initializeFunction, this.resConfig).then(()=>{
            CallFunction(<UIManager>_uiManager,this.initializeFunction, this.uiConfig).then(()=>{
                CallFunction(Managements.Scene,this.initializeFunction);
            });
        });
    }

    start () {
        Logger.Log("mrba-cchper start")
    }

    updateEvent:SYS_UPDATE = new SYS_UPDATE();
    update (deltaTime: number) {
        Logger.Log("mrba-cchper update", this.updateEvent)
        this.updateEvent.delta = deltaTime;
        Managements.Event.Fire(this.updateEvent);
    }
}
