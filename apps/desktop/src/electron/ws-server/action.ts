import { BaseAction } from "../actions/BaseAction";
import { MacOsAction } from "../actions/MacOsAction";
import { Win32Action } from "../actions/Win32Action";


const isMac = process.platform === 'darwin';
const isWin = process.platform === 'win32';

export class Action {
    action: BaseAction;
    constructor() {
        this.action = isWin ?  new Win32Action(): new MacOsAction()
    }
    async process({ eventType, x, y }: { eventType: 'click' | 'rightClick'; x?: number; y?: number }) {
        switch(eventType){
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
