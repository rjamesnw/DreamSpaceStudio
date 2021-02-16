DS.appVersion = "1.0.0";

/** The bootstrap is a chain of promises that are executed when the page is loaded and ready. */
export var bootsrap = new Promise<void>((res, rej) => {
    // (always initialize first, then go from there)
    DS.init().then(() => DS.Browser.onReady.attach(res));
    // (wait for the page to load)
});