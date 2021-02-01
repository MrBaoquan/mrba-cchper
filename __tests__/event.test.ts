import { SINGLETON_KEY } from "mrba-eshper";
import { EventBase, EventManager } from "@App/index";


const _eventManager:EventManager = Reflect.get(EventManager,SINGLETON_KEY);

class EventA extends EventBase{

}

test("event",()=>{

    _eventManager.Register(EventA,_eventA=>{
        console.log("event a callback 1")
    });

    _eventManager.Register(EventA,_eventA=>{
        console.log("event a callback 2")
    });
    
    _eventManager.RegisterOnce(EventA,_eventA=>{
        console.log("event a callback once 1")
    });

    _eventManager.RegisterOnce(EventA,_eventA=>{
        console.log("event a callback once 2")
    });

    _eventManager.Fire(new EventA());
    _eventManager.Fire(new EventA());
    _eventManager.Fire(new EventA());
});