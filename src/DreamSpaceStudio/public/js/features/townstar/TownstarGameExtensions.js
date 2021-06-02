// How to install manually:
//
// 1. Run the Town Star game.
// 2. Press F12 to open the dev console.
// 3. Click to focus the console tab.
// 4. At the top left there's a dropdown to select frames. Select the frame with the name "townstar" in it.
// 5. Paste this script into the console prompt and execute it (hit enter).
//
// How to install automatically:
// If your browser supports it, install the Tampermonkey extension or similar (for example, Tampermonkey for Chrome).
// For Tampermonkey, create a new script and overwrite the default script contents with this whole script, then you're all set!
//
// Note: You can set Tampermonkey to auto update from this link in the script's settings:
//       https://havenbot.ngrok.io/ts/tse.js
//
// * The script will be running if you see the trend arrows appear (give it a couple seconds).
// * You can edit the JSON in the code for the items to be sold, or to be sent using Jimmy.
// * You can hover your mouse over the arrows to see the trend details, which are also written to the console view if you leave it open.
// * The system only sells when you stop moving the mouse.
// * If you leave the console window open, the game will pause if there's a negative capital trend for more than 1 hour.
// * If the capital <= wages*2, the game will ignore the min gas and sell whatever it can to get ahead as a last resort.
// * The script will automatically collect the payment from the trucks as well.
// * Press S to open the sell config widow.
// * Press Del to remove items.
// * Press U to upgrade roads.
//
// ==UserScript==
// @name         Town Star Extension Scripts
// @description  Scripts to extends Town Star.
// @version      1.8.0
// @author       General Fault
// @match        *://*.sandbox-games.com/*
// @run-at document-idle
// @icon         https://www.google.com/s2/favicons?domain=gala.games
// @grant        none
// @updateURL    https://havenbot.ngrok.io/ts/tse.js
// @supportURL   https://discord.gg/eZmpyHxfnW
// ==/UserScript==
//
// Release notes: Fixes bugs and adds a new UI for target amounts.
var townstarExtensionsVersion = "1.8.0";
var townstarExtensionsBotHost = "https://havenbot.ngrok.io"; // "http://localhost:5531";
var TSAPI;
var TownstarExtensions;
(function (TownstarExtensions) {
    // Tampermonkey:
    TownstarExtensions.version = townstarExtensionsVersion;
    console.log(`Installing script ${TownstarExtensions.version} ...`);
    /** Quick custom function to execute after all extensions have been started. */
    TownstarExtensions.onStarted = [];
    /** These events trigger when a trade is made on competing towns. */
    TownstarExtensions.onOtherTrade = [];
    var oldGameExt;
    eval("if (typeof TownstarExtensions != 'undefined') oldGameExt = TownstarExtensions.API;"); // (if already defined, stop it)
    // ====================================================================================================================
    var userVerified = false;
    class API {
        static get townExists() { return !!Game.town; }
        static toNumber(value, defaultValue) {
            var num = +(value === null ? void 0 : value); // (coerce null to NaN via undefined)
            return isNaN(num) ? defaultValue : num;
        }
        static register(name, extension) {
            if (name in this.extensions) {
                console.log(`* Extension '${name}' already registered, upgrading ...`);
                this.extensions[name].wasStarted = this.extensions[name].extension.stop();
                if (this.extensions[name].wasStarted)
                    console.log(` - Extension '${name}' was already started, so we'll start it again when the upgrade completes ...`);
            }
            else {
                console.log(`* Extension '${name}' registering ...`);
                this.extensions[name] = { name, extension: null, wasStarted: false };
            }
            this.extensions[name].extension = extension.current = new extension(this.extensions[name].extension);
        }
        static _touch() {
            if (this._saveTimer)
                clearTimeout(this._saveTimer);
            this._saveTimer = setTimeout(this.save.bind(this), 1000); // (wait until writing is completed, then save after 1 sec)
        }
        static save() {
            if (this._saveTimer) {
                clearTimeout(this._saveTimer);
                this._saveTimer = void 0;
            }
            try {
                localStorage.setItem("tse_api", JSON.stringify(this.settings));
            }
            catch (err) {
                throw "Failed to save to local storage (FYI, may not work in private browsing mode): " + err;
            }
        }
        /**
         * Sets a value in the global settings. Use this to set and store persisted settings values.
         * @param name Property name to set.
         * @param value The value to set.
         */
        static set(name, value) {
            if (typeof name != 'string' || !name)
                throw "API.set(): A property name is required.";
            this.settings[name] = value;
            this._touch();
            return value;
        }
        /**
         * Gets a value from the global settings.  If not set (undefined), any supplied default value will be used.
         * @param name Property name to set.
         * @param defaultValue Value if property is missing (undefined). Note: If missing, and a default is given, it will be set and trigger a save operation.
         */
        static get(name, defaultValue) {
            var value = this.settings[name];
            if (value === void 0 && arguments.length > 1) {
                this.settings[name] = value = defaultValue;
                this._touch();
            }
            return value;
        }
        static get camTownEntity() { return Game.app.root.findByName("CameraTown"); }
        static get cameraController() { return this.camTownEntity.script.cameraController; }
        static get camera() { return Game.app.systems.camera.cameras[0]; }
        static get tradeEntity() { return Game.app.root.findByName("TradeUi"); }
        static get trade() { return this.tradeEntity.script.trade; }
        static getPlayButton() {
            return document.querySelector('#playButton');
        }
        static getViewItemsButton() {
            return [...document.querySelectorAll('button>span')].find(el => el.textContent == "View Items")?.parentElement;
        }
        static getUpgradePromptCloseButton() {
            return document.querySelector('.container:not([style*="display:none"]):not([style*="display: none"]) .upgrade .close-button');
        }
        static getCancelTradeButton() {
            return [...document.querySelectorAll('button>span')].find(el => el.textContent == "Cancel Trade")?.parentElement;
        }
        static checkPlayPrompt() {
            this.getPlayButton()?.click();
            this.getUpgradePromptCloseButton()?.click();
        }
        ;
        static checkJimmyPrompt() {
            var element = document.getElementsByClassName('hud-jimmy-button')?.[0];
            if (element?.style.display != 'none') {
                element.click();
                document.getElementById('Deliver-Request')?.getElementsByClassName('yes')?.[0]?.click();
            }
        }
        static checkAirDrop() {
            var element = document.getElementsByClassName('hud-airdrop-button')?.[0];
            if (element?.style.display != 'none') {
                element.click();
                document.getElementsByClassName('air-drop')?.[0]?.getElementsByClassName('yes')?.[0]?.click();
            }
        }
        static clickAt(x, y) {
            if (typeof x != 'number')
                this.cameraController.Tap({
                    x: x.x,
                    y: x.y
                });
            else
                this.cameraController.Tap({
                    x: x,
                    y: y
                });
        }
        ;
        static getConfig() {
            //API.configScreen = document.createElement('div');
            //API.configScreen.style.display = 'flex';
            //API.configScreen.style.flexDirection = 'column';
            if (!this.configScreen) {
                console.log("Creating new config screen ...");
                // ... the config window doesn't exist yet ...
                var style = document.createElement('style'); // (need to change the highlight style first for the inputs)
                style.innerHTML = "input::selection {background-color: #e8e8e8;}";
                document.head.appendChild(style);
                this.configScreen = document.createElement('div');
                this.configScreen.className = "container";
                //x this.configScreen.style.backgroundColor = "#000000A0";
                this.configScreen.style.color = "#1a8ca0";
                var scrollPanel = document.createElement('div');
                scrollPanel.className = "fullscreen scroll"; // (TS has this to dim the containers)
                scrollPanel.style.overflow = "auto";
                scrollPanel.style.marginRight = "16px";
                scrollPanel.style.width = "auto";
                scrollPanel.style.backgroundColor = "#FFFFFFE0";
                scrollPanel.style.padding = "8px";
                this.configScreen.appendChild(scrollPanel);
                //x this.configScreen.addEventListener('mousedown', (ev) => { ev.stopPropagation(); }, { capture: false });
                //x this.configScreen.addEventListener('mouseup', (ev) => { ev.stopPropagation(); }, { capture: false });
                //x this.configScreen.addEventListener('wheel', (ev) => { ev.stopPropagation(); }, { capture: false });
                for (var p in this.extensions) {
                    let ext = this.extensions[p];
                    let extConfig = ext.extension.getConfig();
                    if (extConfig instanceof HTMLElement)
                        scrollPanel.appendChild(API.addConfigSection(ext.extension, ext.name, extConfig));
                }
                document.body.appendChild(this.configScreen);
            }
            else
                console.log("Config screen already created.");
            return this.configScreen;
        }
        /**
         * Adds a configuration UI section and returns the root element.
         * @param title The header for the section.
         * @param section The body to present in the configuration.
         */
        static addConfigSection(owner, title, section) {
            var configSectionRoot = API.configSections.get(owner);
            if (configSectionRoot) // (remove existing first)
                configSectionRoot.parentNode.removeChild(configSectionRoot);
            configSectionRoot = document.createElement('div');
            configSectionRoot.style.marginBottom = "32px";
            configSectionRoot.addEventListener('mousedown', (ev) => { if (ev.eventPhase == ev.BUBBLING_PHASE)
                ev.stopPropagation(); }, { capture: false });
            configSectionRoot.addEventListener('mousemove', (ev) => { if (ev.eventPhase == ev.BUBBLING_PHASE)
                ev.stopPropagation(); }, { capture: false });
            //configSectionRoot.addEventListener('mouseup', (ev) => { if (ev.eventPhase == ev.BUBBLING_PHASE) ev.stopPropagation(); }, { capture: false });
            configSectionRoot.addEventListener('wheel', (ev) => { if (ev.eventPhase == ev.BUBBLING_PHASE)
                ev.stopPropagation(); }, { capture: false });
            var header = document.createElement('h2');
            header.innerHTML = title;
            configSectionRoot.appendChild(header);
            configSectionRoot.appendChild(section);
            API.configScreen.appendChild(configSectionRoot);
            API.configSections.set(owner, configSectionRoot);
            return configSectionRoot;
        }
        static showConfigWindow() {
            var configScrn = API.getConfig();
            configScrn.style.display = "flex";
            console.log("Config window opened.");
        }
        static getWages() { return +(HUD?.instance?.laborCost?.innerText.replace(/,/g, "")) ?? 0; }
        static getStoredCrafts() {
            return Game.town.GetStoredCrafts();
            //x return typeof HUD.instance.lastStorageJson == 'object' ? HUD.instance.lastStorageJson : JSON.parse(HUD.instance.lastStorageJson);
        }
        static getItemQuantity(itemName) {
            var crafts = this.getStoredCrafts();
            return crafts && crafts[itemName] || 0;
            //return item && +item.querySelector(".quantity").innerText || 0;
        }
        static getGas() {
            return this.getItemQuantity("Gasoline");
            // return seller.getStoredCrafts()?.Gasoline || 0; /*seller.getItemQuantity(seller.getItem('Gasoline'));*/
        }
        static *getAllTownObjects() {
            for (var p in Game.town.objectDict)
                yield Game.town.objectDict[p];
        }
        static *getItemsByType(...types) {
            for (var p in Game.town.objectDict)
                if (types.indexOf(Game.town.objectDict[p].type) >= 0)
                    yield Game.town.objectDict[p];
        }
        ;
        static async hookIntoOtherTrades() {
            if (!this.__hookedTradeCreateFunction) {
                let leaders = await this.getLeaderBoard();
                Game.app.on("RealtimeTradeCreate", this.__hookedTradeCreateFunction = (data) => {
                    if (!Game.world)
                        return; // (there's no game anymore)
                    var otherTrade = data[0];
                    var town = Object.values(Game.world.towns).filter(el => el.userId == otherTrade.userId)?.[0];
                    if (town) {
                        if (otherTrade.unitType.toUpperCase() == "FREIGHT_BOAT")
                            var amount = 100;
                        else
                            var amount = 10;
                        let user = this.users[otherTrade.userId] || (this.users[otherTrade.userId] = { transactions: [] }); //.find(item => item.product.toUpperCase() == otherTown.craftType.toUpperCase())
                        let transactionDetail = { town, trade: otherTrade };
                        user.transactions.push(transactionDetail); //[otherTrade.craftType] || (user.products[otherTrade.craftType] = { count: 0, first: 0, perMin: 0, perHour: 0 });
                        if (API.isHosting)
                            API.batchTransactions.push(transactionDetail); // (note: this gets cleared frequently as it is sent)
                        // var leader = leaders.find(l => l.userId == otherTrade.userId);
                        // if (leader) { // (only log the top 10 so we don't pollute the console output)
                        //     console.log(" ");
                        //     console.log("---===" + town.name + "===---" + otherTrade.craftType + " " + product.count + " | " + product.perMin.toFixed(2) + " | " + product.perHour.toFixed(2));
                        //     console.log(" ");
                        // }
                    }
                });
                // ... need to load the map details to start tracking other players ...
                RT.view({ from: { x: 0, z: 0 }, to: { x: 5e3, z: 5e3 } });
            }
        }
        static getLeaderBoard(start = 0, end = 9) {
            return TSAPI.scoreLeaderboard(start, end);
        }
        static _startProcess() {
            // ... trigger onTimer events for all extensions ...
            for (var extName in this.extensions) {
                var ext = this.extensions[extName];
                if (!ext.process && ext.extension.onTimer)
                    ext.process = ext.extension.onTimer();
                if (ext.process && ext.extension.started && ext.process.next().done)
                    ext.process = void 0;
            }
            this._doAsyncStuff(); // (don't block the timer waiting!)
        }
        static _isNewerVersion(other) {
            var ov = typeof other == 'string' ? other.split('.').map(v => +v) : other || [];
            var thisVersion = TownstarExtensions.version.split('.').map(v => +v);
            if (ov[0] > thisVersion[0])
                return true;
            if (ov[0] == thisVersion[0]) {
                if (ov[1] > thisVersion[1])
                    return true;
                if (ov[1] == thisVersion[1] && ov[2] > thisVersion[2])
                    return true;
            }
            return false;
        }
        static async _doAsyncStuff() {
            if (--this.pingDelay < 0) {
                this.pingDelay = 60; // (create a small delay between pings)
                var response = await API.askBot("Ping", Game.userId, TownstarExtensions.version, Game.townName, navigator.userAgent || navigator.vendor || window.opera);
                var isHosting = response.isHosting || false;
                if (isHosting && !API.isHosting) // (if we just become the host, send all transactions we recorded as the first batch to make sure none were missed)
                    Object.keys(this.users).forEach(id => this.users[id].transactions && this.batchTransactions.push(...this.users[id].transactions));
                API.isHosting = isHosting;
                var scriptVersion = response.scriptVersion ? response.scriptVersion : [];
                if (this._isNewerVersion(scriptVersion)) {
                    if (--this.upgradeDelay < 0) { // (in case of issues, don't keep getting the script)
                        this.upgradeDelay = 60;
                        console.log(`*** NEW SCRIPT VERSION MAY BE AVAILABLE, CHECKING... (the current version is ${TownstarExtensions.version}) ***`);
                        // ... check if there are any script updates and apply the new script ...
                        var js = await this.getLatestScript();
                        if (js) {
                            var jsScriptVersion = (js.match(/^\/\/\s*@version.*(\d+.\d+.\d+)/gmi)?.[0].split(' ').reverse()[0] || "");
                            if (this._isNewerVersion(jsScriptVersion)) {
                                console.log(`*** NEW SCRIPT VERSION AVAILABLE: ${jsScriptVersion} ***`);
                                try {
                                    this.stop(); // (stop the current script to be on the safe side)
                                    new Function("Game", "TSAPI", "TownstarExtensions", js)(Game, TSAPI, TownstarExtensions); // (install the new script on the global scope)
                                    console.log(`*** UPGRADE TO ${jsScriptVersion} SUCCESSFUL ***`);
                                }
                                catch (err) {
                                    console.log(`*** UPGRADE TO ${jsScriptVersion} FAILED ***\r\nReason: ` + err);
                                }
                            }
                            else
                                console.log(`The downloaded script is not newer (${jsScriptVersion}), so ignoring.`);
                        }
                        else
                            console.log("Failed retrieve the script.");
                    }
                }
            }
            if (API.isHosting && --this.hostUpdatesDelay < 0) {
                this._sendGameUpdates();
                this.hostUpdatesDelay = 30; // (update every 5 seconds; after 10 a new host will be selected)
            }
        }
        static async _sendGameUpdates() {
            await this.askBot("Game Update", { userId: Game.userId, transactions: this.batchTransactions, leaders: await this.getLeaderBoard(0, 10000), craftData: Game.craftData, objectData: Game.objectData });
            this.batchTransactions.length = 0;
        }
        static onKeyEvent(e) {
            if (e.eventPhase != e.BUBBLING_PHASE)
                return;
            var keynum;
            if (window.event) { // IE                    
                keynum = e.keyCode;
            }
            else if (e.which) { // Netscape/Firefox/Opera                   
                keynum = e.which;
            }
            if (keynum == 83) { // ('S' key)
                if (!API.configScreen || API.configScreen.style.display == 'none') {
                    API.showConfigWindow();
                }
                else {
                    API.configScreen.style.display = 'none';
                    console.log("Config window closed.");
                }
            }
        }
        static start() {
            if (!userVerified)
                throw "Access denied.";
            API.checkPlayPrompt();
            if (this.timerHandle == void 0) {
                // ... trigger start on all the extensions ...
                for (var p in this.extensions) {
                    let ext = this.extensions[p];
                    if (ext.wasStarted || !oldGameExt) { // (if was started before, OR this is the first time we are running the script, then start it [i.e. don't run if re-running a new script and an extension was manually disabled])
                        ext.extension.start();
                        console.log(` - Extension '${p}' was started/restarted.`);
                    }
                }
                for (var customOnStartFn of TownstarExtensions.onStarted) {
                    if (typeof customOnStartFn == 'function')
                        customOnStartFn.call(TownstarExtensions);
                }
                TownstarExtensions.onStarted = []; // (clear, just in case)
                this.hookIntoOtherTrades();
                this.timerHandle = setInterval(() => this._startProcess(), 1000);
                document.addEventListener('keydown', this.keyboardHandler = this.onKeyEvent.bind(this), { capture: false });
                console.log("Main timer started.");
                return true;
            }
            else
                console.log("Main timer already started.");
            return false;
        }
        static stop() {
            if (this.timerHandle !== void 0) {
                clearInterval(this.timerHandle);
                this.timerHandle = void 0;
                //// ... also stop and reset all the current processes ... // instead the upgrade process will handle it
                // for (var extName in this.extensions) {
                //     var ext = this.extensions[extName];
                //     ext.extension.stop();
                //     ext.process = void 0;
                // }
                if (this.keyboardHandler) {
                    document.removeEventListener('keydown', this.keyboardHandler);
                    this.keyboardHandler = null;
                }
                if (this.__hookedTradeCreateFunction) {
                    Game.app.off(this.__hookedTradeCreateFunction);
                    this.__hookedTradeCreateFunction = null;
                }
                console.log("Main timer stopped.");
                return true;
            }
            else
                console.log("Main timer already stopped.");
            return false;
        }
        static async askBot(cmd, ...args) {
            try {
                console.log(`Contacting haven bot to send '${cmd}' ...`);
                var response = await fetch(townstarExtensionsBotHost + "/ts", {
                    method: 'POST',
                    mode: 'cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cmd: cmd, data: args })
                });
                var json = await response.json();
                console.log("Bot response:", json);
                return json;
            }
            catch (err) {
                console.error("Bot communication error: " + err);
                return void 0;
            }
        }
        static async getLatestScript() {
            try {
                console.log("Getting the latest script ...");
                var response = await fetch(townstarExtensionsBotHost + "/ts/tse.js", {
                    method: 'GET',
                    mode: 'cors',
                    headers: { 'Content-Type': 'application/javascript' }
                });
                var js = await response.text();
                console.log("Server response: ", ('' + js).substr(0, 256));
                return js;
            }
            catch (err) {
                console.error("Script download error: " + err);
                return void 0;
            }
        }
        static createTitleElement(title) {
            let titleDiv = document.createElement('div');
            titleDiv.innerHTML = `<span style='font-weight: bold'>${title}</span>`;
            return titleDiv;
        }
        static createCheckboxElement(initialState) {
            let chkbox = document.createElement('input');
            chkbox.type = 'checkbox';
            chkbox.style.width = '18px';
            chkbox.style.height = '18px';
            chkbox.checked = !!initialState;
            return chkbox;
        }
        static createInputElement(initialValue) {
            let inputEl = document.createElement(`input`);
            inputEl.type = 'text';
            inputEl.style.width = '64px';
            inputEl.style.height = '18px';
            inputEl.style.fontSize = '16px';
            inputEl.style.border = '1px solid';
            inputEl.onkeydown = ev => ev.stopPropagation();
            //inputEl.onmousedown = ev => ev.stopPropagation();
            //inputEl.onmouseup = ev => ev.stopPropagation();
            inputEl.value = '' + initialValue;
            return inputEl;
        }
    }
    API.extensions = {};
    /** This is toggled by the host for clients responsible to send game updates.  If a host goes offline, the next available game client is selected. */
    API.isHosting = false;
    API.configSections = new Map();
    API.settings = JSON.parse(localStorage.getItem("tse_api") || "{}");
    API.users = {};
    API.batchTransactions = []; // (to be sent if we are the host; batched to prevent hitting the server too frequently)
    API.pingDelay = 0;
    API.hostUpdatesDelay = 0;
    API.upgradeDelay = 0;
    TownstarExtensions.API = API;
    (function (API) {
        if (typeof debugging != 'undefined' && debugging)
            debugger;
        // ... get the timer started for the extensions ...
        if (oldGameExt) {
            console.log("Replacing previous API instance...");
            oldGameExt.stop();
            API.extensions = oldGameExt.extensions;
            if (oldGameExt.configScreen)
                oldGameExt.configScreen.parentNode.removeChild(oldGameExt.configScreen); // (get rid of config screen element so a new one can be created)
            console.log("Done.");
        }
    })(API = TownstarExtensions.API || (TownstarExtensions.API = {}));
    // ====================================================================================================================
    async function start() {
        var result = await API.askBot("Verify TownStar User", Game.userId, Game.playerName, Game.townName);
        if (!result || !result.message || result.message != "2A870F56F7BD4196B891DCEFE8FAF77E") {
            console.log("Bot response: ", JSON.stringify(result));
            const NotAuthMsg = "You are not authorized to use the Haven script. Please contact the Haven mayor to get whitelisted. When ready you can run TownstarExtensions.start() again, or refresh the page and start over. \r\nNote that you may get this error if you are no longer logged in to Gala.  If you already registered the script, then try logging in again.";
            console.log(NotAuthMsg);
            userVerified = false;
            return alert(NotAuthMsg);
        }
        userVerified = true;
        // (this prevents shutting down all UIs just because a connection is interrupted)
        Game.OnLostConnection = function OnLostConnection() { this.internetConnected && (this.internetConnected = !1, /*this.app.fire("InternetConnectionLost"),*/ this.app.autoRender = !1); };
        API.start();
    }
    TownstarExtensions.start = start;
    TownstarExtensions.ts = () => 1;
    // ====================================================================================================================
    class Analyzer {
        constructor(replacing) {
            this.currencyTrends = []; // each second (record up to 5 mins worth)
            this.itemTrends = {}; // each second (record up to 5 mins worth)
            this.avgTrends = {}; // (records the calculate trends per item for the hud)
            this.counter = 0; // (delay is if nothing is available to sell, so there's a longer wait to try again)
            this.negativeIncomeCounter = 0; // (when this hits a threshold, the game will pause as something is wrong)
            this.span = 30; // (in minutes)
            this.minGas = 0;
            this.minGasCurrency = 10000; // (will pause if < min gas and currency is met)
            this.negativeIncomeThreshold = 60 * 60; // (in seconds [counts of 'negativeIncomeCounter']; the game will pause if negative for too long; defaults to 1 hour)
            this.fistTimeRefresh = true;
            this.incomeChangeAvg = 0;
            this.started = false;
            if (replacing) {
                this.currencyTrends = replacing.currencyTrends.slice();
                this.currencyTrends = replacing.currencyTrends.slice();
                for (var p in replacing.itemTrends) {
                    this.itemTrends[p] = replacing.itemTrends[p].slice();
                    this.avgTrends[p] = replacing.avgTrends[p];
                }
                console.log("'Analyzer' was updated.");
            }
            else
                console.log("'Analyzer' was constructed.");
        }
        makeTable(nameIndexedObjectMap, headerNames) {
            var headerIndexes = {}, rows = [];
            var headers = typeof headerNames == 'string' ? headerNames.split(',').map((s, i) => (s = s.trim(), headerIndexes[s] = i, s)) : headerNames ?? [];
            for (var n in nameIndexedObjectMap) {
                var row = [n]; // (name is stored by default always as the first column)
                for (var p in nameIndexedObjectMap[n]) {
                    if (!(p in headerIndexes)) {
                        headerIndexes[p] = headers.length;
                        headers.push(p);
                    }
                    row[headerIndexes[p]] = nameIndexedObjectMap[n][p];
                }
                rows.push(row);
            }
            return [headers, ...rows];
        }
        exportTable(table) {
            var exprt = "";
            if (table.length) {
                // (data)
                for (var r = 0, rn = table.length; r < rn; ++r) {
                    var s = "";
                    for (var c = 0, cn = table[r].length; c < cn; ++c)
                        s += (s ? "\t" : "") + table[r][c];
                    exprt += (exprt ? "\r\n" : "") + s;
                }
            }
            return exprt;
        }
        exportObjectData() {
            var table = this.makeTable(Game.objectData, "Name,BlockChainID,BuildCost,CanBuildUpon,CanSelectCraft,Capacity,Class,CraftReqsMet,CraftTimeMod,Crafts,DeliverTypes,Description,DestroyCost,Destroyable,EdgeClass,EdgeRequirements,GoldCost,HasDynamicGround,Id,InStore,LaborCost,PathBase,PathMask,PathMaskType,ProximityDist,ProximityEmit,ProximityImmune,Rotatable,RotateTo,StorageType,TargetTypes,TileWith,UTValue,UnitType"); // (first row is the headers)
            return this.exportTable(table);
        }
        exportCraftData() {
            var table = this.makeTable(Game.craftData, "Name,CityPoints,CityPrice,Class,CraftingText,HexColor,Id,OnDestroy,ProximityBonus,ProximityPenalty,ProximityReverse,Req1,Req2,Req3,Time0,Time1,Time2,Time3,Type,Value1,Value2,Value3");
            return this.exportTable(table);
        }
        getChangeAvg(trends) {
            if (!trends || !trends.length)
                return 0;
            var offsetAvg = 0;
            for (var i = 0, n = trends.length - 2; i < n; ++i)
                offsetAvg += trends[i + 1] - trends[i];
            return offsetAvg /= trends.length;
        }
        rotateSVG(el, deg) {
            el.setAttribute("transform", "rotate(" + deg + ")");
        }
        addArrow(name, bankContainer, avgTrend, extent, isItem) {
            var trendNormal = Math.abs(avgTrend / extent * 60 * TownstarExtensions.ts());
            trendNormal = (trendNormal <= 1 ? trendNormal : 1) * Math.sign(avgTrend);
            if (isItem) {
                var r = Math.round(Math.abs(trendNormal) * 15);
                var g = Math.round((1 - Math.abs(trendNormal)) * 11);
                var b = Math.round((1 - Math.abs(-0.5 + Math.abs(trendNormal))) * 1);
            }
            else {
                var r = Math.round((1 - (1 + trendNormal) / 2) * 15);
                var g = Math.round((1 + trendNormal) / 2 * 11);
                var b = 0;
            }
            var rotation = trendNormal * -45;
            // console.log(avgTrend +" -> " + trendNormal + " rot: " + rotation);
            var trendsContainer = bankContainer.querySelector(".trends");
            if (this.fistTimeRefresh || !trendsContainer) { // (delete and recreate on first install)
                if (trendsContainer)
                    bankContainer.removeChild(trendsContainer);
                trendsContainer = document.createElement("div");
                bankContainer.appendChild(trendsContainer);
                trendsContainer.className = "trends";
            }
            trendsContainer.innerHTML = `<svg class="arrow" width="50px" height="30px">
			<defs>
			<marker id="arrowHead_${name}" markerWidth="4" markerHeight="4" refX="0" refY="2" orient="auto" markerUnits="strokeWidth">
				<path d="M0,0 L0,4 L4,2 z" fill="#${r.toString(16)}${g.toString(16)}${b.toString(16)}" />
			</marker>
			</defs>
			<line id="line" x1="10" y1="15" x2="30" y2="15" stroke="#${r.toString(16)}${g.toString(16)}${b.toString(16)}" stroke-width="3" marker-end="url(#arrowHead_${name})" />
			</svg>`;
            var arrow = trendsContainer.querySelector(".arrow");
            // var arrowHead = trendsContainer.querySelector("#arrowHead");
            // var line = trendsContainer.querySelector("#line");
            var trendPerSec = avgTrend * TownstarExtensions.ts();
            var msg = `Trend per sec: ${trendPerSec.toFixed(2)} / per min: ${(trendPerSec * 60).toFixed(2)} / per hour: ${(trendPerSec * 60 * 60).toFixed(2)}`;
            var wages = API.getWages();
            if (isItem) {
                var timeLeftInMins = Game.currency / wages; // (unscaled)
                var canMakeWithFundsLeft = avgTrend * 60 * timeLeftInMins;
                if (canMakeWithFundsLeft < 0)
                    canMakeWithFundsLeft = "NEGATIVE TREND!";
                msg += ' / By funds end: ' + canMakeWithFundsLeft;
            }
            else {
                msg += "\r\nCapital duration at current wage " + wages + " (mins): " + (Game.currency / wages / TownstarExtensions.ts()).toFixed(2) + " / (hrs): " + (Game.currency / wages / 60 / TownstarExtensions.ts()).toFixed(2);
            }
            trendsContainer.setAttribute("title", msg);
            trendsContainer.setAttribute('style', 'pointer-events: auto !important');
            // arrowHead.setAttribute("fill", `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`);
            //line.setAttribute("stroke", `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`);
            this.rotateSVG(arrow, rotation);
        }
        refreshHUDTrends() {
            var avgTrends = this.avgTrends;
            for (var name in avgTrends) {
                var avgTrend = avgTrends[name]; // (default colors; avg trend is per sec)
                var bankContainer = document.querySelector(`.hud-craft-display-${name} .bank`);
                if (!bankContainer)
                    continue; // (missing, there's none of this item currently)
                bankContainer.style.width = "50%";
                this.addArrow(name, bankContainer, avgTrend, 1, true);
            }
            // ... do the same for the main capital funds ...
            var bankContainer = document.querySelector(`.bank.cash`);
            if (bankContainer && this.currencyTrends.length > 2) {
                var wages = API.getWages();
                this.addArrow("capital", bankContainer, this.incomeChangeAvg, wages, false);
            }
            this.fistTimeRefresh = false;
        }
        *onTimer() {
            if (!API.townExists)
                return;
            var currencyTrends = this.currencyTrends;
            var itemTrends = this.itemTrends;
            var avgTrends = this.avgTrends;
            while (currencyTrends.length > 0 && currencyTrends.length > this.span * 60)
                currencyTrends.shift();
            //? if (!currencyTrends.length || currencyTrends.length > 0 && currencyTrends[currencyTrends.length-1] != Game.currency) // (only store changed values)
            currencyTrends.push(Game.currency); // track currency trends
            var crafts = API.getStoredCrafts();
            if (crafts)
                for (var p in crafts) {
                    var trends = itemTrends[p] || (itemTrends[p] = []);
                    while (trends.length > 0 && trends.length > this.span * 60)
                        trends.shift();
                    itemTrends[p].push(crafts[p]);
                }
            if (currencyTrends.length > 2 && this.counter % 10 == 0) {
                this.incomeChangeAvg = this.getChangeAvg(currencyTrends);
                var wages = API.getWages();
                console.log(Array(50).join("-"));
                console.log("Income trend (per min): " + (this.incomeChangeAvg * 60 * TownstarExtensions.ts()).toFixed(3));
                console.log("Capital duration at current wage " + wages + " (mins): " + (Game.currency / wages / TownstarExtensions.ts()).toFixed(3) + " / (hrs): " + (Game.currency / wages / 60 / TownstarExtensions.ts()).toFixed(3));
                // ... get same for each item ...
                for (var p in itemTrends) {
                    var trends = itemTrends[p];
                    if (trends.length > 1) {
                        var changeAvg = this.getChangeAvg(trends);
                        avgTrends[p] = p in avgTrends ? ((avgTrends[p] || 0) + changeAvg) / 2 : changeAvg;
                        console.log(`Trend for '${p}' (per min): ` + (changeAvg * 60 * TownstarExtensions.ts()).toFixed(3));
                    }
                }
            }
            ++this.counter;
            // if (seller.getGas() <= analyzer.minGas && Game.currency <= analyzer.minGasCurrency) {
            // 	console.log(`Pausing the game: Min gas was reached at ${seller.getGas()} and currency is <= ${analyzer.minGasCurrency}.`);
            // 	console.log(`Counter is now reset. Unpause to continue. The game will pause if the threshold is reached again.`);
            // 	negativeIncomeCounter = 0; // (reset the counter to allow the user more time to fix it, after they continue)
            // 	debugger; // (gas has run out, stop everything [temporary - TODO: base on long time trend])
            // }  
            if (this.incomeChangeAvg < 0 && this.negativeIncomeThreshold > 0) {
                ++this.negativeIncomeCounter;
                if (this.negativeIncomeCounter >= this.negativeIncomeThreshold) {
                    console.log(`Pausing the game: Threshold of ${this.negativeIncomeThreshold} seconds was reached due to constant negative income of ${this.incomeChangeAvg}.`);
                    console.log(`Counter is now reset. Unpause to continue. The game will pause if the threshold is reached again.`);
                    this.negativeIncomeCounter = 0; // (reset the counter to allow the user more time to fix it, after they continue)
                    debugger; // (gas has run out, stop everything [temporary - TODO: base on long time trend])
                }
                else if (this.negativeIncomeCounter >= this.negativeIncomeThreshold * 0.5 && this.negativeIncomeCounter % 10 == 0) {
                    console.log(`!!! WARNING: Currency is negative 50% of the time.  The game may pause soon. !!!`);
                    console.log(`!!! Currently ${this.negativeIncomeCounter} of threshold ${this.negativeIncomeThreshold} !!!`);
                }
            }
            else {
                if (this.negativeIncomeCounter > 0)
                    console.log("Currency was on a negative trend for awhile, but recovered.");
                this.negativeIncomeCounter = 0;
            }
            this.refreshHUDTrends();
        }
        /** Resets the analyzer to start over. */
        reset() {
            this.currencyTrends = [];
            this.itemTrends = {};
            this.avgTrends = {};
            this.incomeChangeAvg = 0;
            this.negativeIncomeCounter = 0;
        }
        getConfig() {
            if (!this.configWindow) {
                return null;
            }
            else
                console.log("Seller config screen already created.");
            return this.configWindow;
        }
        start() {
            if (!this.started) {
                this.started = true;
                console.log("Analyzing started.");
                return true;
            }
            return false;
        }
        stop() {
            if (this.started) {
                this.started = false;
                this.counter = 0;
                console.log("Analyzing stopped.");
                return true;
            }
            return false;
        }
    }
    TownstarExtensions.Analyzer = Analyzer;
    ;
    (function (Analyzer) {
        API.register("Analyzer", Analyzer);
    })(Analyzer = TownstarExtensions.Analyzer || (TownstarExtensions.Analyzer = {}));
    // ====================================================================================================================
    class KeyBindings {
        constructor(replacing) {
            this.started = false;
            if (replacing) {
                console.log("'KeyBindings' was updated.");
            }
            else
                console.log("'KeyBindings' was constructed.");
        }
        static onKeyEvent(e) {
            var keynum;
            if (window.event) { // IE                    
                keynum = e.keyCode;
            }
            else if (e.which) { // Netscape/Firefox/Opera                   
                keynum = e.which;
            }
            if (keynum == 46) { // 0x2E
                var el = document.querySelector(".menu-button.cell.menu-remove");
                if (el)
                    el.click();
            }
            else if (keynum == 85) { // 0x55
                var el = document.querySelector(".menu-button.cell.menu-upgrade");
                if (el)
                    el.click();
            }
        }
        getConfig() {
            if (!this.configWindow) {
                return null;
            }
            else
                console.log("Seller config screen already created.");
            return this.configWindow;
        }
        start() {
            if (!this.started) {
                document.addEventListener('keydown', KeyBindings.onKeyEvent);
                this.started = true;
                console.log("Key bindings added.");
                return true;
            }
            return false;
        }
        stop() {
            if (this.started) {
                this.started = false;
                document.removeEventListener('keydown', KeyBindings.onKeyEvent);
                console.log("Key bindings removed.");
                return true;
            }
            return false;
        }
    }
    TownstarExtensions.KeyBindings = KeyBindings;
    (function (KeyBindings) {
        API.register("KeyBindings", KeyBindings);
    })(KeyBindings = TownstarExtensions.KeyBindings || (TownstarExtensions.KeyBindings = {}));
    // ====================================================================================================================
    const ITEM_PROPERTY_NAMES = [['min', "Sell When >="], ['gas', "Sell when gas >="], ['minForJimmy', "Enable Jimmies when >="], ['target', "Try to keep this item count (if supported): "]];
    class Seller {
        constructor(replacing) {
            this.items = {
                "Blue_Steel": { min: 9 },
                "Steel": { min: 9 },
                "Pumpkin_Pie": { min: 9 },
                "Pinot_Noir_Vines": { min: 9 },
                "Cake": { min: 9 },
                "Batter": { min: 9 },
                "Uniforms": { min: 9 },
                "Wool_Yarn": { min: 9 },
                "Cotton_Yarn": { min: 9 },
                "Butter": { min: 9 },
                "Iron": { min: 9 },
                "Sugar": { min: 9 },
                "Flour": { min: 9 },
                "Eggs": { min: 9, gas: 3 },
                "Milk": { min: 9, gas: 3 },
                "Salt": { min: 9, gas: 3 },
                "Jet_Fuel": { min: 9, gas: 3 },
                "Lumber": { min: 9, gas: 4 },
                "Wood": { min: 10, gas: 30 },
                "Feed": { min: 9, gas: 10 },
                "Sugarcane": { min: 12, gas: 10 },
                "Wheat": { min: 9, gas: 30 },
                "Petroleum": { min: 9, gas: 30 },
                "Wool": { min: 9, gas: 10 },
                "Cotton": { min: 9, gas: 30 },
                "Water": { min: 9, gas: 39 },
                "Water_Drum": { min: 9, gas: 39 },
                "Energy": { min: 9, gas: 30 },
                "Brine": { min: 9, gas: 39 },
                "Gasoline": { min: 40, gas: 40 }
            };
            //itemMinForJimmy = { // The items to sell, and the min amount before selling
            //    "Blue_Steel": 3, // (not selling always restarts with the top most items ready to sell)
            //    "Steel": 1,
            //    "Cake": 0,
            //    "Batter": 3,
            //    "Uniforms": 3,
            //    "Wool_Yarn": 3,
            //    "Cotton_Yarn": 3,
            //    "Butter": 3,
            //    "Sugar": 11,
            //    "Flour": 19,
            //    "Eggs": 3,
            //    "Milk": 3,
            //    "Salt": 0,
            //    "Iron": 0,
            //    "Jet_Fuel": 3,
            //    "Lumber": 10,
            //    "Wood": 10,
            //    "Sugarcane": 10,
            //    "Wheat": 10,
            //    "Petroleum": 10,
            //    "Wool": 10,
            //    "Cotton": 10,
            //    "Water": 10,
            //    "Water_Drum": 10,
            //    "Energy": 10,
            //    "Brine": 10,
            //    "Gasoline": 29
            //};
            this.sellStartAt = 0; // (set with Date.now())
            //[...seller.getItemsByType("Neighbor_Delivery")][0].logicObject.SetActive(false)
            this.waitCounter = 0; // (delay is if nothing is available to sell, so there's a longer wait to try again)
            this.started = false;
            if (replacing) {
                if (replacing._mouseMoveHandler)
                    window.removeEventListener("mousemove", replacing._mouseMoveHandler);
                console.log("'Seller' was updated.");
            }
            else
                console.log("'Seller' was constructed.");
            window.addEventListener("mousemove", this._mouseMoveHandler = this.onmousemove.bind(this));
        }
        onmousemove(ev) {
            this.waitCounter = 5; // (let a bit more time to pass between mouse moves so as not to interrupt the player until they go idle)
        }
        initializeItems() {
            console.log("Initializing items ...");
            // ... build the list first from scratch (in case new items exist) then load matching ones from the local storage ...
            this.items = this.items || {};
            var savedItemsStr = localStorage.getItem("tsext_items");
            if (savedItemsStr) {
                console.log("Found saved config file, loading it.");
                var savedItems = JSON.parse(savedItemsStr);
                console.log("Loaded config: " + savedItemsStr);
            }
            // ... merged the saved items into the items collection ...
            for (var p in savedItems) {
                this.items[p] = savedItems[p];
                let savedItem = this.items[p];
                //... need to sanitize the data on load, just in case ...
                savedItem.min = API.toNumber(savedItem.min);
                savedItem.gas = API.toNumber(savedItem.gas);
                savedItem.minForJimmy = API.toNumber(savedItem.minForJimmy);
                savedItem.target = API.toNumber(savedItem.target);
            }
            for (var p in Game.craftData)
                if (!(p in this.items))
                    this.items[p] = { min: 0, craftData: Game.craftData[p], minForJimmy: 10 };
                else
                    this.items[p].craftData = Game.craftData[p];
            for (var p in this.items) {
                // ... set a reference to the craft data for the item in case we need it ...
                if (!(p in Game.craftData))
                    delete this.items[p]; // (remove invalid entries)
                else {
                    // ... also set the building types that create it ...
                    var buildingType = Object.keys(Game.objectData).filter(n => ('' + Game.objectData[n].Crafts).split(',').indexOf(p) >= 0)[0];
                    this.items[p].building = Game.objectData[buildingType];
                }
            }
            console.log("Items data ready.");
        }
        saveItems() {
            console.log("Saving config...");
            // ... update the local storage with the item configurations ...
            var items = this.items;
            var itemsToSave = {};
            for (var p in items) {
                let item = items[p];
                itemsToSave[p] = {
                    disabled: !!item.disabled,
                    min: API.toNumber(item.min),
                    gas: API.toNumber(item.gas),
                    minForJimmy: API.toNumber(item.minForJimmy),
                    target: API.toNumber(item.target)
                };
            }
            var serializedData = JSON.stringify(itemsToSave);
            console.log("Serialized config: " + serializedData);
            localStorage.setItem("tsext_items", serializedData);
            console.log("Config saved.");
        }
        getTradeItemElement(name) {
            return document.querySelector(`div[data-name='${name}']`);
        }
        canSell() {
            return document.querySelector(".menu-sell").style.display == "";
        }
        ;
        tradeIsOpen() {
            return !!document.querySelector(".container:not([style*='display:none']):not([style*='display: none']) .trade");
        }
        anyWindowOpen() {
            return !!document.querySelector(".container:not([style*='display:none']):not([style*='display: none']) .fullscreen .close-button");
        }
        openSellMenu() {
            if (!this.tradeIsOpen()) {
                console.log("Opening trade window ...");
                document.querySelector(".menu-sell").click();
            }
            else
                console.log("Trade window already open.");
        }
        sell() {
            console.log(`Clicking sell ...`);
            this.sellStartAt = Date.now();
            document.querySelector(".sell-button")?.click();
        }
        sell_RequireGas() {
            var btn = document.querySelector(".sell-button");
            var parts = btn?.innerText.split('\n');
            return parts && +parts[parts.length - 1] || 1;
        }
        compassOpen() {
            return !!document.querySelector(".trade-connection .compass");
        }
        loadingOrders() {
            return !!document.querySelector(".LoadingOrders");
        }
        *getTrucks() {
            yield* API.getItemsByType("Trade_Depot");
            yield* API.getItemsByType("Express_Depot");
        }
        ;
        *getFreightPiers() {
            yield* API.getItemsByType("Freight_Pier");
        }
        ;
        *getAllTradeObjects() {
            yield* API.getItemsByType("Trade_Depot", "Express_Depot", "Freight_Pier", "Trade_Pier");
        }
        ;
        *getAllNeighborDeliveries() {
            yield* API.getItemsByType("Neighbor_Delivery");
        }
        tradeVehicleReturned(tradeData) { return Date.now() > Date.parse(tradeData.startTime) + tradeData.duration; }
        tapAllReturnedTrades() {
            for (var tradeObj of this.getAllTradeObjects()) {
                var td = Game.town.GetActiveTradeData({
                    x: tradeObj.townX,
                    z: tradeObj.townZ
                });
                if (td && this.tradeVehicleReturned(td)) {
                    console.log('A trade has completed.');
                    API.clickAt(API.camera.worldToScreen(tradeObj.entity.position));
                    // truck.OnTapped();
                }
            }
        }
        ;
        findAvailableTrade(sellAmount) {
            var bestTrade, topSellsAt = 0;
            for (var tradeDepot of this.getAllTradeObjects()) {
                var td = Game.town.GetActiveTradeData({
                    x: tradeDepot.townX,
                    z: tradeDepot.townZ
                });
                var sellsAt = tradeDepot?.type == "Freight_Pier" ? 100 : 10; // (note: if this returns a '.type="Freight_Pier"' we need to add 90 for tests)
                if (!td && ((sellAmount || 0) >= sellsAt && sellsAt > topSellsAt)) { // (td is undefined when no trade is active)
                    topSellsAt = sellsAt; // (store to compare for the best price to sell at)
                    bestTrade = tradeDepot;
                }
            }
            if (bestTrade) { // (td is undefined when no trade is active)
                console.log(`Found an available trade depot to sell ${topSellsAt} of ${sellAmount} items: ` + bestTrade.type);
                console.log(bestTrade);
                return bestTrade;
            }
            console.log('No trade depot is available yet.');
        }
        ;
        selectTradeDepot(tradeDepot) {
            API.clickAt(API.camera.worldToScreen(tradeDepot.entity.position));
        }
        processNeighborDeliveries() {
            for (var jimmy of this.getAllNeighborDeliveries()) {
                var craft = jimmy.logicObject.data.craft; //jimmy.data.craft;
                var quantity = API.getItemQuantity(craft); // (find out how much of this we have)
                if (!isNaN(+quantity)) {
                    console.log(`Checking jimmy ${craft} (${quantity}) ...`);
                    var min = +this.items[craft]?.minForJimmy || 0;
                    if (quantity <= min)
                        jimmy.logicObject.data.active && (console.log(craft + " is too low, stopping related neighbor transports."), jimmy.logicObject.SetActive(false), true) || console.log("  - He's waiting.");
                    else
                        !jimmy.logicObject.data.active && (console.log(craft + " is higher now, starting related neighbor transports."), jimmy.logicObject.SetActive(true), true) || console.log("  - He's ok to keep going.");
                }
                77;
            }
        }
        /** Returns the items sorted in the correct order. */
        getItems(includeDisabled = false) {
            return Object.keys(this.items)
                .map(v => ({ name: v, value: this.items[v].craftData?.CityPoints || 0, settings: this.items[v] }))
                .filter(e => includeDisabled || !e.settings.disabled)
                .sort((a, b) => b.value - a.value);
        }
        *onTimer() {
            if (!API.townExists)
                return;
            this.processNeighborDeliveries(); // (this will not affect selling nor the user input, so check this asap)
            if (Math.random() > 0.25)
                return; // (add a bit of randomness to the operations)
            API.checkPlayPrompt();
            API.checkJimmyPrompt();
            API.checkAirDrop();
            if (this.waitCounter > 0) {
                --this.waitCounter;
                return;
            }
            // ... check time lapse since sell window was opened and close it after a 30 second timeout ...
            var cancelTradeBtn = API.getCancelTradeButton();
            if (cancelTradeBtn && (Date.now() - this.sellStartAt) >= 30000)
                cancelTradeBtn.click();
            if (this.compassOpen()) {
                console.log("Waiting for compass screen to close ...");
                return;
            }
            this.tapAllReturnedTrades(); // (make sure any returned trucks are tapped)
            if (API.getGas() < 1) {
                console.log("Cannot sell: Not enough gas!");
                return;
            }
            if (!this.tradeIsOpen() && this.anyWindowOpen()) {
                console.log("Cannot sell: A windows is open!");
                return;
            }
            if (this.breakOnStart) {
                this.breakOnStart = false;
                debugger;
            }
            function okToSell(q, item) {
                var gas = API.getGas(), minItem = API.toNumber(item.min, 0), minGas = API.toNumber(item.gas, 0);
                var urgent = Game.currency <= API.getWages() * 2; // (fail safe: if we are about to run out, just try to sell what we can asap!)
                return gas > minGas && q > 9 && (urgent || q >= minItem);
            }
            for (var item of this.getItems()) {
                let itemSettings = item.settings, name = item.name;
                var q = API.getItemQuantity(name);
                if (okToSell(q, itemSettings)) {
                    // ... now we need to find a trade depot to handle it ...
                    var tradeDepot = this.findAvailableTrade(q);
                    if (!tradeDepot) {
                        console.log(`Tried to sell '${name}', but no qualifying trade depot found.`);
                        continue;
                    }
                    console.log(`Selling ${name} (quantity: ${q}, min: ${itemSettings.min}) ...`);
                    yield this.selectTradeDepot(tradeDepot);
                    if (!this.canSell()) {
                        console.log("Cannot sell: No truck selected, or available to select.");
                        return;
                    }
                    yield this.openSellMenu();
                    while (this.loadingOrders()) {
                        console.log("Waiting for orders to load ...");
                        return;
                    }
                    var domItem = this.getTradeItemElement(name);
                    if (!domItem) {
                        console.log(`There is no DOM element found for item '${name}'.`);
                        return;
                    }
                    yield domItem.click();
                    var requiredGas = this.sell_RequireGas();
                    if (requiredGas > API.getGas()) {
                        console.log(`The current gas is not enough for the closest city.`);
                        return;
                    }
                    var q = API.getItemQuantity(name);
                    if (okToSell(q, itemSettings)) { // (still ok to sell? make sure, as a item may have been taken by this point, and we don't want to force it when low)
                        yield this.sell();
                        yield console.log(`Resetting trends for '${name}' ....`);
                        if (typeof Analyzer != 'undefined' && Analyzer.current) {
                            Analyzer.current.itemTrends[name] = []; // (if the analyzer exists, we need to reset the trends for this item automatically since it will be off after a sale, and that is expected.)
                            Analyzer.current.avgTrends[name] = 0;
                        }
                    }
                    else
                        console.log(`No longer ok to sell.`);
                    return; // (gas is reduced, and other things may have change, so restart the loop; always keep selling the top items) TODO: Pull selling data and sort names on that perhaps?
                }
            }
            console.log("Nothing to sell yet.");
            API.tradeEntity.enabled = false;
            this.waitCounter = 3; // (let a bit more time to pass since nothing was found to sell)
        }
        getConfig() {
            if (!this.configPanel) {
                console.log("Creating new Seller config section ...");
                // ... the config window doesn't exist yet ...
                let configPanel = document.createElement('div');
                let elements = [];
                let filterInput = document.createElement(`input`);
                filterInput.type = 'text';
                filterInput.placeholder = "Type here to filter the contents.";
                filterInput.style.width = '256px';
                filterInput.style.height = '18px';
                filterInput.style.fontSize = '16px';
                filterInput.style.border = '1px solid';
                //filterInput.onmousedown = ev => ev.stopPropagation();
                filterInput.onkeydown = ev => ev.stopPropagation();
                filterInput.onkeyup = (ev) => {
                    ev.stopPropagation();
                    let value = filterInput.value.trim().toUpperCase();
                    for (var el of elements)
                        if (el.__ts_ext_config_title?.toUpperCase().indexOf(value) >= 0)
                            el.style.display = "";
                        else
                            el.style.display = "none";
                };
                configPanel.appendChild(filterInput);
                for (let entry of this.getItems(true)) {
                    let p = entry.name;
                    let item = entry.settings;
                    let name = p.replace(/_/g, " ");
                    let titleDiv = API.createTitleElement(`<span style='font-weight: bold'>${name} (${entry.value} points and \$${entry.settings.craftData?.CityPrice} per item)</span>`);
                    let propElement = document.createElement('div');
                    propElement.innerHTML = "\xa0\xa0\xa0\xa0"; // (&nbsp; - indent a bit)
                    // ... add a checkbox to enable/disable items ...
                    let chkbox = API.createCheckboxElement(!item.disabled);
                    chkbox.onchange = (ev) => {
                        item.disabled = !chkbox.checked;
                        this.saveItems();
                    };
                    propElement.appendChild(chkbox);
                    propElement.append("\xa0"); // (&nbsp;)
                    for (let p2 of ITEM_PROPERTY_NAMES) {
                        let propName = p2[0];
                        let displayName = p2[1];
                        propElement.append(`${displayName}: `);
                        let inputEl = API.createInputElement(item[propName] !== void 0 ? item[propName] : "");
                        inputEl.onchange = (ev) => { ev.stopPropagation(); item[propName] = +inputEl.value || 0; this.saveItems(); }; // what if the property doesnt exist!
                        propElement.appendChild(inputEl);
                        propElement.append("\xa0"); // (&nbsp;)
                    }
                    titleDiv.appendChild(propElement);
                    titleDiv.__ts_ext_config_title = name;
                    elements.push(titleDiv);
                    //titleDiv.innerHTML = `<div>Min: <input type="text" style="width: 64px">&nbsp; Gas: <input type="text" style="width: 64px">&nbsp; Jimmy Min: <input type="text" style="width: 64px"></div>`;
                    configPanel.appendChild(titleDiv);
                }
                this.configPanel = configPanel;
            }
            else
                console.log("Seller config panel already created.");
            return this.configPanel;
        }
        start() {
            if (!this.started) {
                this.started = true;
                this.initializeItems(); // (this MUST be here as it requires the 'Game' reference)
                console.log("Selling started.");
                return true;
            }
            return false;
        }
        stop() {
            if (this.started) {
                this.started = false;
                console.log("Selling stopped.");
                return true;
            }
            return false;
        }
    }
    TownstarExtensions.Seller = Seller;
    ;
    (function (Seller) {
        API.register("Seller", Seller);
    })(Seller = TownstarExtensions.Seller || (TownstarExtensions.Seller = {}));
    class TownManager {
        constructor() {
            this._tasks = [];
            this._tasksByLocation = {};
            this.processing = false;
            this.started = false;
        }
        addTask(action, craftType, request, object, priority = 0.5) {
            var location = `[${object.townX}, 0, ${object.townZ}]`;
            //var currentTasks = this._tasksByLocation[location];
            // ... find out if there's any conflicting tasks ...
            var tasks = this._tasksByLocation[location];
            if (tasks)
                for (var i = tasks.length - 1; i >= 0; --i) {
                    task = tasks[i];
                    if (task.action == action) {
                        if (priority > task.priority) {
                            this._removeTask(i);
                        }
                        else
                            return; // (skip the lower priority task)
                    }
                }
            var task = { action, location, craftType, request, priority };
            if (!this._tasksByLocation[location])
                this._tasksByLocation[location] = [];
            this._tasksByLocation[location].push(task);
            this._tasks.push(task);
            return task;
        }
        _removeTask(i) {
            var task = this._tasks.splice(i, 1)[0];
            var tasks = this._tasksByLocation[task.location];
            tasks.splice(tasks.indexOf(task), 1);
            return task;
        }
        _doTask() {
            if (this._tasks.length) {
                var task = this._removeTask(0);
                var object = Game.town.objectDict[task.location];
                task.action.call(this, task, object);
            }
        }
        _task_completeBuild(task, object) {
            var logic = object?.logicObject;
            logic?.OnTapped();
        }
        _task_turn_off(task, object) {
            object.logicObject.prevCraft = object.logicObject.data.craft;
            object.logicObject.SetCraft("None");
            console.log(`Turned off a ${object.type.replace(/_/g, ' ')}.`);
        }
        _task_turn_on(task, object) {
            object.logicObject.SetCraft(task.craftType);
            console.log(`Turned on a ${object.type.replace(/_/g, ' ')}.`);
        }
        _onAmmountChanged() {
            if (this.started) {
                for (var buildingObject of API.getAllTownObjects()) {
                    // ... check if this building needs to be completed ...
                    if (buildingObject.type == "Construction_Site" && buildingObject.data.state == "Complete" && API.get("autoCompleteConstruction", false)) {
                        this.addTask(this._task_completeBuild, null, "tap", buildingObject, 1);
                        continue; // (nothing more to do here)
                    }
                    // ... check items counts and targets ...
                    if (buildingObject.objData.Crafts && buildingObject.objData.Crafts != 'None') // (only check buildings that make crafts)
                        for (var item of Seller.current.getItems())
                            if (item.settings.target > 0) { // (only check item if this is set to allow turning off for specific items)
                                var targetReached = API.getItemQuantity(item.name) >= API.toNumber(item.settings.target, 0);
                                //if (targetReached)
                                //    console.log(`Target ${item.name} reached, will try to stop production ...`);
                                //else
                                //    console.log(`${item.name} is getting too low, will try to get more ...`);
                                var buildingName = item.settings.building?.Name;
                                var targetCraft = item.name;
                                if (item.name == "Wood") { // (need to handle wood a special way)
                                    buildingName = "Windmill";
                                    targetCraft = ""; // (any)
                                    targetReached = !targetReached; // (invert this for wood - if we need more, turn off, not on!)
                                }
                                if (buildingName != buildingObject.objData.Name)
                                    continue; // (nothing to do with this building, move on)
                                //var handled = true;
                                if (targetReached) {
                                    if ((!targetCraft || buildingObject.logicObject.data.craft == targetCraft) && buildingObject.data.state == "WaitForReqs") {
                                        this.addTask(this._task_turn_off, targetCraft, "stop", buildingObject);
                                    }
                                    //else handled = false;
                                }
                                else if (buildingObject.logicObject.data.craft == "None") {
                                    let craft = buildingObject.logicObject.prevCraft || targetCraft;
                                    if (craft) {
                                        this.addTask(this._task_turn_on, targetCraft, "start", buildingObject);
                                    }
                                    else
                                        console.log(`A ${buildingName.replace(/_/g, ' ')} could not be turned on as the craft type is unknown.`);
                                }
                                //if (!handled)
                                //    console.log("No building found that can be turned on/off to help with that.");
                                // (else we can't complete the state change yet, so try next time)
                            }
                }
            }
        }
        *onTimer() {
            if (!API.townExists || this.processing)
                return;
            this.processing = true; // (just in case it takes too long and the timer triggers again)
            try {
                this._onAmmountChanged();
                this._doTask();
            }
            finally {
                this.processing = false;
            }
        }
        getConfig() {
            if (!this.configPanel) {
                var configPanel = document.createElement('div');
                var title = API.createTitleElement("Auto Complete Constructions");
                var input = API.createCheckboxElement(API.get("autoCompleteConstruction", false));
                input.onchange = (ev) => { ev.stopPropagation(); API.set("autoCompleteConstruction", input.checked); }; // what if the property doesnt exist!
                configPanel.appendChild(title);
                configPanel.appendChild(input);
            }
            this.configPanel = configPanel;
            return this.configPanel;
        }
        start() {
            if (!this.started) {
                this.started = true;
                //? Game.app.on("StorageAmountChanged", this.__onAmmountChangedHandler || (this.__onAmmountChangedHandler = this._onAmmountChanged.bind(this)));
                this._onAmmountChanged(); // (trigger it now once to make sure to get an update)
                console.log("TownManager started.");
                return true;
            }
            return false;
        }
        stop() {
            if (this.started) {
                this.started = false;
                if (this.__onAmmountChangedHandler)
                    Game.app.off(this.__onAmmountChangedHandler);
                console.log("TownManager stopped.");
                return true;
            }
            return false;
        }
    }
    TownstarExtensions.TownManager = TownManager;
    (function (TownManager) {
        API.register("Town Manager", TownManager);
    })(TownManager = TownstarExtensions.TownManager || (TownstarExtensions.TownManager = {}));
})(TownstarExtensions || (TownstarExtensions = {}));
function tryStart() {
    if (typeof Game == 'undefined') {
        console.error("You are not in the correct frame, or the game has not loaded yet.  You must select the correct from in the dropdown at the top. It should say 'townstar.sandbox-games.com' or similar in the text.");
        setTimeout(tryStart, 1000);
    }
    else if (!Game.userId || !Game.town?.GetStoredCrafts) {
        console.error("User details and current crafts not loaded yet, waiting ...");
        setTimeout(tryStart, 1000);
    }
    else {
        TSAPI = TSAPI || new Function("return API")(); // (must grab from global scope)
        TownstarExtensions.start();
        console.log("TownstarExtensions started!");
        console.log("*** Your User ID is " + Game.userId + ".  If the script doesn't work then you need to have the Haven mayor whitelist it for you.");
    }
}
setTimeout(tryStart, 1000);
// ====================================================================================================================
(function (TownstarExtensions) {
    TownstarExtensions.ts = () => 1;
    //(<any>API).removeAllEdgeRequirements = function () {
    //    for (var p in Game.objectData)
    //        if ("EdgeRequirements" in Game.objectData[p]) Game.objectData[p].EdgeRequirements = "None";
    //};
    var _start = TownstarExtensions.start;
    TownstarExtensions.start = async function () {
        await _start.call(TownstarExtensions);
    };
})(TownstarExtensions || (TownstarExtensions = {}));
// ====================================================================================================================
eval("window.TownstarExtensions = TownstarExtensions;");
// Note: Use https://obfuscator.io/ to obfuscate before sending. In "Reserved Names" make sure to add 'oldGameExt'.
// Object.values(TownstarExtensions.API.users).filter(u=>u.town.name.startsWith("Jiin"))[0]
//# sourceMappingURL=TownstarGameExtensions.js.map