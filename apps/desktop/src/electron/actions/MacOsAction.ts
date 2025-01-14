import { exec } from "child_process";
import { BaseAction } from "./BaseAction";

// macOS-specific action class
export class MacOsAction extends BaseAction {
    
    constructor(pythonPath:string) {
        super(pythonPath);
        console.log("MacOsAction initialized");
    }
    
    performKeyDownAction(keyEvent?:any): Promise<string> {
        return new Promise((resolve, reject) => {
            //code:"KeyS"
            //key:"s"
            //which or keyCode:83
            //type:"keydown"
            const { code, ctrlKey, altKeymetaKey, shiftKey, which, key, keyCode, type } = keyEvent;
            const pythonScript = `import pyautogui;pyautogui.write("${key}")`;
            const command = `${this.pythonPath} -c '${pythonScript}'`;
            
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error('Error executing Python command:', error);
                    reject(stderr);
                } else {
                    console.log('Python command output:', stdout);
                    resolve(stdout);
                }
            });
        });
    }
    performClickAction(x: number, y: number): Promise<string> {
        return new Promise((resolve, reject) => {
            const pythonScript = `import pyautogui;pyautogui.click(${x}, ${y})`;
            const command = `${this.pythonPath} -c "${pythonScript}"`;
            
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error('Error executing Python command:', error);
                    reject(stderr);
                } else {
                    console.log('Python command output:', stdout);
                    resolve(stdout);
                }
            });
        });
    }
    performRightClickAction(x: number, y: number): Promise<string> {
        return new Promise((resolve, reject) => {
            const pythonScript = `import pyautogui; pyautogui.rightClick(${x}, ${y})`;
            const command = `${this.pythonPath} -c "${pythonScript}"`;

            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error('Error executing Python command:', error);
                    reject(`Error: ${stderr || error.message}`);
                } else {
                    console.log('Python command output:', stdout);
                    resolve(stdout);
                }
            });
        });
    }
}
