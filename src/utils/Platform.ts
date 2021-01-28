import { sys } from "cc";

export class Platform{
    public static get IsBrowser():boolean{
        return sys['isBrowser']??false;
    }
}