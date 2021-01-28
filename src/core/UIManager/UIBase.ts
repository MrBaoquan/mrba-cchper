
import { BaseComponent } from "../../utils/CCUtils";

export enum UIType{
    Standalone="Standalone",
    Normal="Normal",
    Popup="Popup"
}

export class UIBase extends BaseComponent{
    protected __uiKey:string;
    protected __uiType:UIType = UIType.Normal;
    protected isShowing:boolean = false;

    public get UIKey():string{ return this.__uiKey;}
    public get UIType():UIType{ return this.__uiType;}
    public get Actived():boolean{ return this.isShowing;}

    protected spawned(){}

    protected onShow(){}
    protected onHide(){}

    private handleShow():void{
        this.isShowing = true;
        this.showAction();
        this.onShow();
    }
    
    private handleHide():void{
        this.isShowing = false;
        this.hideAction();
        this.onHide();
    }

    protected showAction():void{
        this.node.active = true;
    }

    protected hideAction():void{
        this.node.active = false;
    }

}