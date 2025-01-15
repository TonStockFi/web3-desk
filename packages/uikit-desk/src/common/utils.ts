export function generateRandomPassword( length: number = 6): string {
    let chars = 'abcdefghijklmnpqrstuvwxyz123456789';
    
    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        password += chars[randomIndex];
    }
    return password;
}

export function formatNumber(num: number): string {
    return num.toLocaleString('en', { useGrouping: true }).replace(/,/g, ' ');
}

export function generateDeviceId(): string {
    let groups = [1, 3, 3, 3];
 
    let deviceId = '';

    groups.forEach((groupLength, index) => {
        for (let i = 0; i < groupLength; i++) {
            let randomDigit = Math.floor(Math.random() * 10); // Generate a random digit (0-9)
            if (groupLength === 1 && randomDigit === 0) {
                randomDigit = 1;
            }
            deviceId += randomDigit;
        }
    });

    return deviceId;
}
export function formatTimeAgo(timestamp: number): string {
    const now = Date.now();
    const elapsed = now - timestamp;
    const ms = (elapsed / 1000).toFixed(2);
    return `${ms} s`;
}

export function deepDiff(obj1: any, obj2: any): boolean {
    let hasDifference = false;

    function findChanges(o1: any, o2: any): void {
        Object.keys(o1).forEach(key => {
            if (
                typeof o1[key] === 'object' &&
                typeof o2[key] === 'object' &&
                o1[key] !== null &&
                o2[key] !== null
            ) {
                findChanges(o1[key], o2[key]);
            } else if (o1[key] !== o2[key]) {
                hasDifference = true;
            }
        });

        Object.keys(o2).forEach(key => {
            if (!(key in o1)) {
                hasDifference = true;
            }
        });
    }

    findChanges(obj1, obj2);
    return hasDifference;
}

export function isDesktop(){
    //@ts-ignore
    return !!window.backgroundApi
}


export function isMac() {
    if(!isDesktop()){
        return false;
    }
    const userAgent = navigator.userAgent.toLowerCase();
    return userAgent.includes("mac");
}