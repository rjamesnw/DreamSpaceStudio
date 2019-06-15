import { IO as IO_Import } from "../IO";
declare abstract class IO extends IO_Import {
}
declare namespace IO {
    /** This even is triggered when the user should wait for an action to complete. */
    var onBeginWait: import("./Events").IEventDispatcher<typeof IO, (msg: string) => void>;
    /** This even is triggered when the user no longer needs to wait for an action to complete. */
    var onEndWait: import("./Events").IEventDispatcher<typeof IO, () => void>;
    /**
     * Blocks user input until 'closeWait()' is called. Plugins can hook into 'onBeginWait' to receive notifications.
     * Note: Each call stacks, but the 'onBeginWait' event is triggered only once.
     * @param msg An optional message to display (default is 'Please wait...').
     */
    function wait(msg?: string): void;
    /**
     * Unblocks user input if 'wait()' was previously called. The number of 'closeWait()' calls must match the number of wait calls in order to unblock the user.
     * Plugins can hook into the 'onEndWait' event to be notified.
     * @param force If true, then the number of calls to 'wait' is ignored and the block is forcibly removed (default if false).
     */
    function closeWait(force?: boolean): void;
}
export { IO };
