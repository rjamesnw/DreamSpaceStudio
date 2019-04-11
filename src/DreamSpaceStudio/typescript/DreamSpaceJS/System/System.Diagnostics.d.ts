import { Disposable } from "../Types";
import { LogTypes } from "../Logging";
/** Contains diagnostic based functions, such as those needed for logging purposes. */
declare namespace Diagnostics {
    var __logItems: ILogItem[];
    const LogItem_base: {
        new (): Object;
        super: ObjectConstructor;
        'new'?(...args: any[]): any;
        init?(o: object, isnew: boolean, ...args: any[]): void;
    } & {
        prototype: Object;
        getPrototypeOf: (o: any) => any;
        getOwnPropertyDescriptor: (o: any, p: string | number | symbol) => PropertyDescriptor;
        getOwnPropertyNames: (o: any) => string[];
        create: {
            (o: object): any;
            (o: object, properties: PropertyDescriptorMap & ThisType<any>): any;
        };
        defineProperty: (o: any, p: string | number | symbol, attributes: PropertyDescriptor & ThisType<any>) => any;
        defineProperties: (o: any, properties: PropertyDescriptorMap & ThisType<any>) => any;
        seal: <T>(o: T) => T;
        freeze: {
            <T>(a: T[]): readonly T[];
            <T extends Function>(f: T): T;
            <T>(o: T): Readonly<T>;
        };
        preventExtensions: <T>(o: T) => T;
        isSealed: (o: any) => boolean;
        isFrozen: (o: any) => boolean;
        isExtensible: (o: any) => boolean;
        keys: (o: {}) => string[];
        assign: {
            <T, U>(target: T, source: U): T & U;
            <T, U, V>(target: T, source1: U, source2: V): T & U & V;
            <T, U, V, W>(target: T, source1: U, source2: V, source3: W): T & U & V & W;
            (target: object, ...sources: any[]): any;
        };
        getOwnPropertySymbols: (o: any) => symbol[];
        is: (value1: any, value2: any) => boolean;
        setPrototypeOf: (o: any, proto: object) => any;
    };
    class LogItem extends LogItem_base {
        static 'new'(parent: ILogItem, title: string, message: string, type?: LogTypes, outputToConsole?: boolean): ILogItem;
        static init(o: ILogItem, isnew: boolean, parent: ILogItem, title: string, message: string, type?: LogTypes, outputToConsole?: boolean): void;
    }
    namespace LogItem {
        class $__type extends Disposable {
            /** The parent log item. */
            parent: ILogItem;
            /** The sequence count of this log item. */
            sequence: number;
            /** The title of this log item. */
            title: string;
            /** The message of this log item. */
            message: string;
            /** The time of this log item. */
            time: number;
            /** The type of this log item. */
            type: LogTypes;
            /** The source of the reason for this log item, if any. */
            source: {};
            subItems: ILogItem[];
            marginIndex: number;
            /** Write a message to the log without using a title and return the current log item instance. */
            write(message: string, type?: LogTypes, outputToConsole?: boolean): ILogItem;
            /** Write a message to the log. */
            write(message: any, type?: LogTypes, outputToConsole?: boolean): ILogItem;
            /** Write a message to the log without using a title and return the new log item instance, which can be used to start a related sub-log. */
            log(title: string, message: string, type?: LogTypes, outputToConsole?: boolean): ILogItem;
            /** Write a message to the log without using a title and return the new log item instance, which can be used to start a related sub-log. */
            log(title: any, message: any, type?: LogTypes, outputToConsole?: boolean): ILogItem;
            /** Causes all future log writes to be nested under this log entry.
            * This is usually called at the start of a block of code, where following function calls may trigger nested log writes. Don't forget to call 'endCapture()' when done.
            * The current instance is returned to allow chaining function calls.
            * Note: The number of calls to 'endCapture()' must match the number of calls to 'beginCapture()', or an error will occur.
            */
            beginCapture(): ILogItem;
            /** Undoes the call to 'beginCapture()', activating any previous log item that called 'beginCapture()' before this instance.
            * See 'beginCapture()' for more details.
            * Note: The number of calls to 'endCapture()' must match the number of calls to 'beginCapture()', or an error will occur.
            */
            endCapture(): void;
            toString(): string;
        }
    }
    interface ILogItem extends LogItem.$__type {
    }
    /** Starts a new diagnostics-based log entry. */
    function log(title: string, message: string, type?: LogTypes, outputToConsole?: boolean): ILogItem;
    /** Starts a new diagnostics-based log entry. */
    function log(title: any, message: any, type?: LogTypes, outputToConsole?: boolean): ILogItem;
    function getLogAsHTML(): string;
    function getLogAsText(): string;
}
export default Diagnostics;
