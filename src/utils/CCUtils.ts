import { Asset, Component, find, Material, Node, Prefab, SpriteFrame, Texture2D, __private } from "cc";

export class BaseComponent extends Component{
    protected Get(path:string):Node|null;
    protected Get<T extends Component>(path:string, classConstructor: __private.Constructor<T>):T|null;
    protected Get(path:string, classConstructor?:any):any{
        if(classConstructor===undefined){
            return find(path,this.node);
        }
        var _node = find(path, this.node);
        if(_node===null) return null;
        return _node.getComponent(classConstructor);
    }
}

export function mapString2CCAssetType(classname:string):__private.cocos_core_asset_manager_shared_AssetType{
    let _ccclass:__private.cocos_core_asset_manager_shared_AssetType = Asset;
    switch (classname) {
        case 'Prefab':
            _ccclass=Prefab;
            break;
        case 'SpriteFrame':
            _ccclass = SpriteFrame;
            break;
        case 'Texture2D':
            _ccclass = Texture2D;
            break;
        case 'Material':
            _ccclass = Material;
            break;
        default:
            break;
    }
    return _ccclass;
}