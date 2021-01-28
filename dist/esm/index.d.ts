import { Component, Node, __private, Asset, Director, JsonAsset } from "cc";
import { Constructor as Constructor$0 } from "cc";
declare class BaseComponent extends Component {
    protected Get(path: string): Node | null;
    protected Get<T extends Component>(path: string, classConstructor: __private.Constructor<T>): T | null;
}
declare function mapString2CCAssetType(classname: string): __private.cocos_core_asset_manager_shared_AssetType;
declare class CCHelperEntry extends BaseComponent {
    private resConfig;
    private uiConfig;
    readonly initializeFunction: string;
    onLoad(): void;
    initialize(): void;
    start(): void;
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
type Constructor<T = {}> = new (...args: any[]) => T;
declare abstract class ISceneScript {
}
declare class MetaData {
    private static sceneScriptClasses;
    static IsSceneScriptRegistered(scriptName: string): boolean;
    static GetSceneScriptConstrutor(scriptName: string): Constructor | null;
    private static uiClassNamesMap;
    private static uiScriptClasses;
    static IsUIScriptRegistered(scriptName: string): boolean;
    static IsUIScriptRegistered<T extends UIBase>(scriptClass: __private.Constructor<T>): boolean;
    static GetUIScriptConstructor(scriptName: string): __private.Constructor<UIBase> | null;
    static GetUIClassRegisteredName<T extends UIBase>(uiScriptConstructor: __private.Constructor<T>): string | null;
}
declare const ui_script: <T extends UIBase>(className: string) => (target: new (...args: any[]) => T) => void;
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
    private resConfig;
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
    initialize(asset?: JsonAsset): Promise<unknown>;
    /**
     * 获取UI实例
     * @param UIKey UI名称
     * @param callback 成功获取到UI后的回调   失败无回调
     */
    Get(UIKey: string, callback?: (ui: UIBase) => void): UIBase | null;
    Get<T extends UIBase>(UIKey: Constructor$0<T>, callback?: (ui: T) => void): T | null;
    /**
     * 显示UI
     * @param UIKey UI名称
     * @param callback 成功获取到UI后的回调  失败无回调
     */
    Show(UIKey: string, callback?: (ui: UIBase) => void): UIBase | null;
    Show<T extends UIBase>(UIKey: Constructor$0<T>, callback?: (ui: T) => void): T | null;
    /**
     * 隐藏UI
     * @param UIKey UI名称
     * @param callback 成功获取到UI实例后的回调 失败无回调
     */
    Hide(UIKey: string, callback?: (ui: UIBase) => void): UIBase | null;
    Hide<T extends UIBase>(UIKey: Constructor$0<T>, callback?: (ui: T) => void): T | null;
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
}
export { CCHelperEntry, BaseComponent, mapString2CCAssetType, Platform, PersistSceneName, StartSceneName, Constructor, ISceneScript, MetaData, ui_script, scene_script, ResourceManager, SceneManager, UIType, UIBase, UIManager, Managements };
