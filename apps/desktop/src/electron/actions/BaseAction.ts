
// Base class for actions
export abstract class BaseAction {
    pythonPath: string;
    // Constructor for common setup (if any)
    constructor(pythonPath:string) {
        this.pythonPath = pythonPath
        console.log("BaseAction initialized");
    }
    
    abstract performKeyDownAction(keyEvent?: any): Promise<string>;
    abstract performClickAction(x: number, y: number): Promise<string>;
    abstract performRightClickAction(x: number, y: number): Promise<string>;
}