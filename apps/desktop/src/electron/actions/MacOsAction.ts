import { exec } from "child_process";
import { BaseAction } from "./BaseAction";

// macOS-specific action class
export class MacOsAction extends BaseAction {
    constructor() {
        super();
        console.log("MacOsAction initialized");
    }
    
    performClickAction(x: number, y: number): Promise<string> {

        return new Promise((resolve, reject) => {
            const pythonScript = `import pyautogui;pyautogui.click(${x}, ${y})`;
            // Save the Python script to a temporary file or directly execute the command
            const command = `/usr/local/opt/python@3.11/bin/python3.11 -c "${pythonScript}"`;
            
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
            const command = `/usr/local/opt/python@3.11/bin/python3.11 -c "${pythonScript}"`;

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
