import { Component, Node, __private, Asset, Director } from "cc";
import { Constructor as Constructor$1 } from "cc";
import { Constructor } from "mrba-cchper/dist/cjs";
declare class BaseComponent extends Component {
    protected Get(path: string): Node | null;
    protected Get<T extends Component>(path: string, classConstructor: __private.Constructor<T>): T | null;
}
declare function mapString2CCAssetType(classname: string): __private.cocos_core_asset_manager_shared_AssetType;
interface IDisposable {
    Dispose(): void;
}
declare abstract class EventBase {
}
declare class SYS_UPDATE extends EventBase {
    delta: number;
}
declare class SYS_START extends EventBase {
}
type EventDelegate = (event: EventBase) => void;
declare class EventHandler implements IDisposable {
    private eventType;
    private eventDelegate;
    /**
     * 事件模式
     */
    private eventMode;
    get EventType(): string | null;
    get EventDelegate(): EventDelegate | null;
    /**
     * 触发事件
     */
    private Fire;
    /**
     * 销毁事件
     */
    Dispose(): void;
}
declare class EventManager {
    allEvents: Map<string, Map<EventDelegate, EventHandler>>;
    /**
     * 注册事件
     * @param eventType 事件类型
     * @param eventAction 事件响应
     */
    Register<T extends EventBase>(eventType: Constructor<T>, eventAction: (event: T) => void): IDisposable;
    /**
     * 注册事件，事件将会在触发一次后自动删除
     * @param eventType 事件类型
     * @param eventAction 事件响应
     */
    RegisterOnce<T>(eventType: Constructor<T>, eventAction: EventDelegate): IDisposable;
    /**
     * 触发事件
     * @param event 事件实例
     */
    Fire<T extends EventBase>(event: T): void;
    Unregister<T extends EventBase>(eventType: Constructor<T>, eventHandler: (event: T) => void): boolean;
    private initialize;
    private registerEvent;
    private makeEventHandler;
}
declare class CCHperEntry extends BaseComponent {
    private resConfig;
    private uiConfig;
    readonly initializeFunction: string;
    onLoad(): void;
    initialize(): void;
    start(): void;
    updateEvent: SYS_UPDATE;
    update(deltaTime: number): void;
}
declare class Platform {
    static get IsBrowser(): boolean;
}
declare enum UIType {
    Standalone = "Standalone",
    Normal = "Normal",
    Popup = "Popup"
}
declare class UIBase extends BaseComponent {
    protected __uiKey: string;
    protected __uiType: UIType;
    protected isShowing: boolean;
    get UIKey(): string;
    get UIType(): UIType;
    get Actived(): boolean;
    protected spawned(): void;
    protected onShow(): void;
    protected onHide(): void;
    private handleShow;
    private handleHide;
    protected showAction(): void;
    protected hideAction(): void;
}
declare const PersistSceneName: string;
declare const StartSceneName: string;
type Constructor$0<T = {}> = new (...args: any[]) => T;
declare abstract class ISceneScript {
}
declare class MetaData {
    private static sceneScriptClasses;
    static IsSceneScriptRegistered(scriptName: string): boolean;
    static GetSceneScriptConstrutor(scriptName: string): Constructor$0 | null;
    private static uiClassNamesMap;
    private static uiScriptClasses;
    static IsUIScriptRegistered(scriptName: string): boolean;
    static IsUIScriptRegistered<T extends UIBase>(scriptClass: __private.Constructor$0<T>): boolean;
    static GetUIScriptConstructor(scriptName: string): __private.Constructor$0<UIBase> | null;
    static GetUIClassRegisteredName<T extends UIBase>(uiScriptConstructor: __private.Constructor$0<T>): string | null;
}
/**
 * 注册UI脚本
 * @param className 脚本名称
 */
declare const ui_script: <T extends UIBase>(className: string) => (target: new (...args: any[]) => T) => void;
/**
 * 注册场景脚本
 * @param classname 场景脚本名称
 */
declare const scene_script: <T extends ISceneScript>(classname: string) => (target: new (...args: any[]) => any) => void;
declare class ResourceManager {
    static readonly Instance: ResourceManager;
    //config:ResConfig = {};
    // 按照 bundle 名称分组资源
    private assets_gby_Bundle;
    // 按照场景名称 分组资源
    private assets_gby_Scene;
    private bundles;
    private config;
    constructor();
    /**
     * 初始化
     */
    private initialize;
    loadScene(sceneName: string, progress: Director.OnLoadSceneProgress, launched: Director.OnSceneLaunched): void;
    LoadSceneRes(sceneNames: string[]): Promise<unknown>;
    private unloadSceneRes;
    private loadNewSceneRes;
    private sceneName;
    private get curSceneName();
    Get<T extends Asset>(key: string, sceneName?: string): T;
    GetPersist<T extends Asset>(key: string): T | null;
    GetScene<T extends Asset>(key: string, sceneName: string): T | null;
    private pullBundle;
    private preloadDir;
    private loadResourceDir;
}
declare class SceneManager {
    private scriptManager;
    private sceneName;
    static Instance: SceneManager;
    get SceneName(): string;
    private setSceneName;
    constructor();
    private initialize;
    Load(sceneName: string, progress?: (progress: number) => void, completed?: () => void): void;
    private onSceneLoaded;
}
declare class UIManager extends Component {
    static readonly Instance: UIManager;
    private StandaloneUIRoot;
    private NormalUIRoot;
    private PopupUIRoot;
    private config;
    private allSpawnedUICaches;
    // 实时 UI 数据
    private standaloneUIs;
    private normalUIs;
    private popupUIs;
    constructor();
    onLoad(): void;
    private initialize;
    /**
     * 获取UI实例
     * @param UIKey UI名称
     * @param callback 成功获取到UI实例后的回调 失败无回调
     */
    Get(UIKey: string, callback?: (ui: UIBase) => void): UIBase | null;
    /**
     * 获取UI实例
     * @param UIClass UI类型
     * @param callback 成功获取到UI实例后的回调 失败无回调
     */
    Get<T extends UIBase>(UIClass: Constructor$1<T>, callback?: (ui: T) => void): T | null;
    /**
     * 显示UI
     * @param UIKey UI名称
     * @param callback 成功获取到UI实例后的回调 失败无回调
     */
    Show(UIKey: string, callback?: (ui: UIBase) => void): UIBase | null;
    /**
     * 显示UI
     * @param UIClass UI类型
     * @param callback 成功获取到UI实例后的回调 失败无回调
     */
    Show<T extends UIBase>(UIClass: Constructor$1<T>, callback?: (ui: T) => void): T | null;
    /**
     * 隐藏UI
     * @param UIKey UI名称
     * @param callback 成功获取到UI实例后的回调 失败无回调
     */
    Hide(UIKey: string, callback?: (ui: UIBase) => void): UIBase | null;
    /**
     * 隐藏UI
     * @param UIClass UI类型
     * @param callback 成功获取到UI实例后的回调 失败无回调
     */
    Hide<T extends UIBase>(UIClass: Constructor$1<T>, callback?: (ui: T) => void): T | null;
    private hideUI;
    private showUI;
    private getUI;
    private showStandaloneUI;
    private hideStandaloneUI;
    private showNormalUI;
    private hideNormalUI;
    private showPopupUI;
    private hidePopupUI;
    start(): void;
    private destroyUIs;
    private sceneName;
    private onEnterScene;
    private spawnUIs;
    private spawnUI;
    private getParentNode;
}
declare class Managements {
    static readonly UI: UIManager;
    static readonly Resource: ResourceManager;
    static readonly Scene: SceneManager;
    static readonly Event: EventManager;
}
export { CCHperEntry, BaseComponent, mapString2CCAssetType, Platform, PersistSceneName, StartSceneName, Constructor$0 as Constructor, ISceneScript, MetaData, ui_script, scene_script, ResourceManager, SceneManager, UIType, UIBase, UIManager, IDisposable, EventBase, SYS_UPDATE, SYS_START, EventHandler, EventManager, Managements };
