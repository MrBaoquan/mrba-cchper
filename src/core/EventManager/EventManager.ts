import { Constructor } from "mrba-cchper/dist/cjs";
import { singleton } from "mrba-cchper/node_modules/mrba-eshper";


export abstract class EventBase{}

export class SYS_UPDATE extends EventBase{}
export class SYS_START  extends EventBase{}

type EventHandler = (event:EventBase)=>void;

export interface EventDisposer<T extends EventBase>{
    eventHandler:EventHandler;
    eventType:Constructor<T>
}

@singleton
export class EventManager
{

    
    allEvents:Map<string,Array<EventHandler>> = new Map<string,Array<EventHandler>>();
    public Register<T extends EventBase>(eventType:Constructor<T>, eventHandler:(event:T)=>void) : EventDisposer<T>
    {
        console.log("!!!!!!!!!!! Register !!!!!!!!!!!!!!!!!!")
        let _eventKey = eventType.prototype.constructor.name
        if(!this.allEvents.has(_eventKey)){
            this.allEvents.set(_eventKey, []);
        }
        if(!this.allEvents.get(_eventKey)?.includes(eventHandler as EventHandler)){
            console.log("不存在该类型");
            this.allEvents.get(_eventKey)?.push(eventHandler as EventHandler);
        }

        return{
            eventHandler:eventHandler as EventHandler,
            eventType:eventType
        };
    }

    public Fire<T extends EventBase>(eventType:Constructor<T>, event:T){
        let _eventKey = eventType.prototype.constructor.name
        if(!this.allEvents.has(_eventKey)){
            console.warn("不存在 " + _eventKey);
            return;
        }

        this.allEvents.get(_eventKey)?.forEach(_function=>{
            _function(event as EventBase);
        });
    }

    public Unregister<T extends EventBase>(disposer:EventDisposer<T>):boolean;
    public Unregister<T extends EventBase>(eventType:Constructor<T>, eventHandler:(event:T)=>void):boolean;
    public Unregister<T extends EventBase>(target:any, eventHandler?:any):boolean
    {
        
        // let _eventKey = eventType.prototype.constructor.name
        // if(!this.allEvents.has(_eventKey)){
        //     console.warn("不存在 " + _eventKey);
        //     return;
        // }

        // if(!this.allEvents.get(_eventKey)?.includes(eventHandler as EventHandler)){
        //     console.warn("不存在该条事件处理器")
        //     return;
        // }

        // this.allEvents.get(_eventKey)?.splice(this.allEvents.get(_eventKey)!.indexOf(eventHandler as EventHandler),1);
        return true;
    }

    private initialize(){

    }
}