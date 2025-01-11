
// Base class for actions
export abstract class BaseAction {
    // Constructor for common setup (if any)
    constructor() {
        console.log("BaseAction initialized");
    }

    // Abstract method that must be implemented in subclasses
    abstract performClickAction(x: number, y: number): Promise<string>;
    // Abstract method that must be implemented in subclasses
    abstract performRightClickAction(x: number, y: number): Promise<string>;
}