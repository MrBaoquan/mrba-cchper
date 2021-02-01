import { Constructor } from "mrba-cchper/dist/cjs";
import { CallFunction, Logger, singleton, SINGLETON_KEY } from "mrba-cchper/node_modules/mrba-eshper";


export interface IDisposable{
    Dispose():void;
}

export abstract class EventBase{}

export class SYS_UPDATE extends EventBase{
    delta:number = 0.0
}
export class SYS_START  extends EventBase{}

type EventDelegate = (event:EventBase)=>void;

/**
 * 事件模式
 */
enum EventMode{
    Normal=1,       // 正常模式, 事件只能手动移除
    Once=2          //  一次性事件， 事件将会在触发一次后 自动移除
}

export class EventHandler implements IDisposable{
    private eventType:Constructor<EventBase>;
    private eventDelegate:EventDelegate;
    /**
     * 事件模式
     */
    private eventMode:EventMode = EventMode.Normal;

    public get EventType():string|null{
        return this.eventType?this.eventType.prototype.constructor.name:null;
    }
    public get EventDelegate():EventDelegate|null{
        return this.eventDelegate;
    }
    
    /**
     * 触发事件
     */
    private Fire(event:EventBase)
    {
        if(this.eventMode===EventMode.Once){
            CallFunction(this.eventDelegate,event);
            this.Dispose();
            return;
        }
        Logger.Log(event);
        CallFunction(this.eventDelegate,event);
    }

    /**
     * 销毁事件
     */
    public Dispose()
    {
        Reflect.get(EventManager,SINGLETON_KEY).Unregister(this.eventType,this.eventDelegate);
    }

}

@singleton
export class EventManager
{
    allEvents:Map<string,Map<EventDelegate,EventHandler>> = new Map<string,Map<EventDelegate,EventHandler>>();
    /**
     * 注册事件
     * @param eventType 事件类型
     * @param eventAction 事件响应
     */
    public Register<T extends EventBase>(eventType:Constructor<T>, eventAction:(event:T)=>void) : IDisposable
    {
        return this.registerEvent(eventType, eventAction, EventMode.Normal);
    }

    /**
     * 注册事件，事件将会在触发一次后自动删除
     * @param eventType 事件类型
     * @param eventAction 事件响应
     */
    public RegisterOnce<T>(eventType:Constructor<T>, eventAction:EventDelegate):IDisposable{
        return this.registerEvent(eventType, eventAction, EventMode.Once);
    }

    /**
     * 触发事件
     * @param event 事件实例
     */
    public Fire<T extends EventBase>(event:T){
        let _eventKey = Reflect.getPrototypeOf(event).constructor.name;

        if(!this.allEvents.has(_eventKey)){
            return;
        }

        
        this.allEvents.get(_eventKey).forEach(_eventHandler=>{
            console.log(typeof _eventHandler)
            Logger.Log(event);
            CallFunction(_eventHandler,"Fire",event);
        });
    }

    public Unregister<T extends EventBase>(eventType:Constructor<T>, eventHandler:(event:T)=>void):boolean
    {
        let _eventKey = eventType.name;
        if(!this.allEvents.has(_eventKey)){
            console.warn("不存在 " + _eventKey);
            return;
        }

        let _allEventHandlers = this.allEvents.get(_eventKey);
        if(!_allEventHandlers.has(eventHandler as EventDelegate)){
            console.warn("不存在该条事件处理器")
            return;
        }

        _allEventHandlers.delete(eventHandler as EventDelegate);
        return true;
    }

    private initialize(){

    }

    private registerEvent<T extends EventBase>(eventType:Constructor<T>, eventAction:(event:T)=>void, eventMode:EventMode=EventMode.Normal) : EventHandler
    {
        let _eventKey = eventType.name;
        if(!this.allEvents.has(_eventKey)){
            this.allEvents.set(_eventKey, new Map<EventDelegate,EventHandler>());
        }
        let _eventHandlers = this.allEvents.get(_eventKey);
        if(!_eventHandlers.has(eventAction as EventDelegate)){
            this.allEvents.get(_eventKey).set(eventAction as EventDelegate,this.makeEventHandler(
                eventType,eventAction as EventDelegate,
                eventMode
            ));
        }

        return _eventHandlers.get(eventAction as EventDelegate);
    }

    private makeEventHandler(eventType:Constructor<EventBase>,eventDelegate:EventDelegate, eventMode:EventMode=EventMode.Normal):EventHandler{
        let _eventHandler = new EventHandler();
        Reflect.set(_eventHandler,"eventType",eventType);
        Reflect.set(_eventHandler,"eventDelegate",eventDelegate);
        Reflect.set(_eventHandler,"eventMode",eventMode);
        return _eventHandler;
    }

}