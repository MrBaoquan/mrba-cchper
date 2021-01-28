import { ResourceManager } from "../core/ResourceManager/ResourceManager";
import { SceneManager } from "../core/SceneManager/SceneManager";
import { UIManager } from "../core/UIManager/UIManager";

export class Managements{
    public static readonly UI:UIManager = UIManager.Instance;
    public static readonly Resource:ResourceManager = new ResourceManager();
    public static readonly Scene:SceneManager = new SceneManager();
}