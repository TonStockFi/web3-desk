import { exec } from "child_process";
import { BaseAction } from "./BaseAction";

// Windows-specific action class
export class Win32Action extends BaseAction {
    constructor() {
        super();
        console.log("Win32Action initialized");
    }

    // Implement the abstract method for Windows
    performClickAction(x: number, y: number): Promise<string> {
        return new Promise((resolve, reject) => {
            const command = `nircmd.exe sendmouse click ${x} ${y}`; // Example using NirCmd (external tool)
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error('Error executing Win32 command:', error);
                    reject(stderr);
                } else {
                    console.log('Win32 command output:', stdout);
                    resolve(stdout);
                }
            });
        });
    }
    performRightClickAction(x: number, y: number): Promise<string> {
        return new Promise((resolve, reject) => {
            const command = `nircmd.exe sendmouse click ${x} ${y}`; // Example using NirCmd (external tool)
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error('Error executing Win32 command:', error);
                    reject(stderr);
                } else {
                    console.log('Win32 command output:', stdout);
                    resolve(stdout);
                }
            });
        });
    }
}

