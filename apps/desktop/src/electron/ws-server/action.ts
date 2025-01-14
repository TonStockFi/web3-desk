import { BaseAction } from "../actions/BaseAction";
import { MacOsAction } from "../actions/MacOsAction";


const isMac = process.platform === 'darwin';
const isWin = process.platform === 'win32';

export class Action {
    action: BaseAction;
    constructor(pythonPath:string) {
        this.action =  new MacOsAction(pythonPath)
    }
    async process({ eventType, x, y,keyEvent }: { keyEvent?:any,eventType: 'click'|'keyDown' | 'rightClick'; x?: number; y?: number }) {
        switch(eventType){
            case "keyDown":{
                try {
                    const result = await this.action.performKeyDownAction(keyEvent);
                    console.log(result);
                } catch (error) {
                    console.error("Error occurred:", error);
                }
                break
            }
            case "click":{
                try {
                    const result = await this.action.performClickAction(x, y);
                    console.log(result);
                } catch (error) {
                    console.error("Error occurred:", error);
                }
                break
            }
            case "rightClick":{
                try {
                    const result = await this.action.performRightClickAction(x, y);
                    console.log(result);
                } catch (error) {
                    console.error("Error occurred:", error);
                }
                break
            }
        }
    }
}
