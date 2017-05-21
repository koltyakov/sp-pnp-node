export class Utils {

    public checkNestedProperties(object: any, ...args: string[]): boolean {
        for (let i: number = 0, len: number = args.length; i < len; i += 1) {
            if (!object || !object.hasOwnProperty(args[i])) {
                return false;
            }
            object = object[args[i]];
        }
        return true;
    }

    public getCaseInsensitiveProp(object: any, propertyName: string): any {
        propertyName = propertyName.toLowerCase();
        return Object.keys(object).reduce((res: any, prop: string) => {
            if (prop.toLowerCase() === propertyName) {
                res = object[prop];
            }
            return res;
        }, undefined);
    }

}
