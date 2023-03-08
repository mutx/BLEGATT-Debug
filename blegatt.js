// https://developer.chrome.com/articles/bluetooth
// https://github.com/WebBluetoothCG/web-bluetooth/blob/main/implementation-status.md

var colorFail = "LightCoral";
var colorPass = "PaleGreen";
var colorNote = "SkyBlue";
var debugBody = document.getElementById("debugBody");
var debugButton = document.getElementById("debugButton");
var debugClipboard = "";

debugButton.style.position = "fixed";
debugButton.style.zIndex = "100";
debugButton.style.width = "100%";
debugButton.style.height = "100%";
debugButton.style.opacity = "0";

function _print(title, value, color) {
	let logMsg = document.createElement("div");
	logMsg.innerHTML = "<b>" + title + ":</b> " + value;
	logMsg.style.backgroundColor = color;
	logMsg.style.display = "grid";
	logMsg.style.borderTop = "1px black solid";
	debugBody.appendChild(logMsg);

	debugClipboard = debugClipboard + "\n\n" + title + ":\n" + value;
}

function printLog(title, value, isPass=true) {
	let color = colorPass;
	if (!isPass) {
		color = colorFail;
	}
	_print(title, value, color);
}

function printNote(title, value) {
	_print(title, value, colorNote);
}

function printEnabledDefined(title, isEnabled=true) {
	if (isEnabled) {
		printLog(title, "Enabled/Defined");
	} else {
		printLog(title, "Disabled/Undefined", false);
	}
}

var OBJtoString = function(_o,_m,_rf,_dep,_res){
    _dep = [], _rf = function(obj,n,_n,_a,_k,_i,_ws,_f,_e) {

        if(typeof obj != "object") return false;

        if(typeof _a === "undefined") _a = "null/undefined/self-reference";

        _dep.push(obj), _f = (_dep.length < 1) ? function(){} : function(_z,_x) {
            for (_x = 0; _x <= _dep.length; _x++) {
                if(obj[_z] == _dep[_x]) return true;
            }
            return false;
        }

        _ws = "";
        if(typeof n === "undefined") n = 1;
        if(typeof _n === "undefined") _n = n;

        for(_k = 0; _k <= n; _k++){
            _ws += " ";
        }

        var response ="{ \n";

        for (var _i in obj) {
            if (typeof obj[_i] !== "object") {
            	if(typeof obj[_i] === "string") obj[_i] = "'"+obj[_i].toString()+"'";
            	if(typeof obj[_i] === "boolean") obj[_i] = obj[_i].toString() + " (boolean)";
           		response += _ws + _i + " : " + obj[_i].toString();
           		response += "\n";
            	continue;
        	}

            response += (_f(_i)) ? _ws + _i + " : "+ _a +" (prevent loop)\n" : _ws + _i + " : " + _rf(obj[_i],n+_n,_n,_a);
        }

    	if(_n != n) response += _ws;

    	return response +="}";
    }

	_res = _rf(_o,_m);
	_dep = [];
	return _res;
}

function printObject(objName, obj) {
	let printElement = document.createElement("pre");
	let objStr = objName + ": " + (typeof obj) + "\n" + OBJtoString(obj, 4);
	printElement.textContent = objStr;
	printElement.style.backgroundColor = colorNote;
	printElement.style.display = "grid";
	printElement.style.borderTop = "1px black solid";
	printElement.style.margin = 0;
	debugBody.appendChild(printElement);

	debugClipboard = debugClipboard + "\n\n" + objStr;
}

// User gesture required (touch/mouse-click) to run navigator.bluetooth.requestDevice
debugButton.addEventListener('pointerup', function(event) {

	let promos = [];

	debugClipboard = "";
	debugBody.innerHTML = "";

	// HTTPS secure context required
	printEnabledDefined("Secure Context", isSecureContext);

	printEnabledDefined("BLENative", (typeof BLENative !== "undefined"));
	if (typeof BLENative !== "undefined") {
		printObject("BLENative", BLENative);

		BLENative.enable();

		let payload = {};
		payload.requestId = BLENative.generateRequestID();

		promos[promos.length] = BLENative.request(payload)
		.then(response => {
			printLog("BLENative.request responded");
			printObject(response);
		}, reject => {
			printLog("BLENative.request rejected: " + reject);
		}).catch(error => {
			printLog("BLENative.request error: " + error);
		});

	}

	printEnabledDefined("window", (typeof window !== "undefined"));
	if (typeof window !== "undefined") {
		printEnabledDefined("window['webkit']", (typeof window["webkit"] !== "undefined"));
		if (typeof window["webkit"] !== "undefined") {
			printEnabledDefined("window['webkit']['messageHandlers']", (typeof window["webkit"]["messageHandlers"] !== "undefined"));
			if (typeof window["webkit"]["messageHandlers"] !== "undefined") {
				printEnabledDefined("window['webkit']['messageHandlers']['ble']", (typeof window["webkit"]["messageHandlers"]["ble"] !== "undefined"));
				if (typeof window["webkit"]["messageHandlers"]["ble"] !== "undefined") {
					printObject(window["webkit"]["messageHandlers"]["ble"]);
				}
			}
		}
	}


	/*

	printEnabledDefined("navigator.bluetooth", (typeof navigator.bluetooth !== "undefined"));
	if (typeof navigator.bluetooth !== "undefined") {
		printObject("navigator.bluetooth", navigator.bluetooth);
	}

	if (typeof navigator.bluetooth !== "undefined") {

		printEnabledDefined("Bluetooth.getAvailability", (typeof navigator.bluetooth.getAvailability !== "undefined"));

		if (typeof navigator.bluetooth.getAvailability !== "undefined") {
			promos[promos.length] = navigator.bluetooth.getAvailability()
			.then(availability => {
				if (availability) {
					printLog("Bluetooth Adapter", "Available");
				} else {
					printLog("Bluetooth Adapter", "Unavailable (check chrome://bluetooth-internals scan devices, check bluetooth adapter LMP version is >= 6 (Bluetooth Core Spec 4.0))", false);
				}
			}).catch(error => {
				printLog("getAvailability Error", "[" + error + "]", false);
			});
		}

	} else {
		printEnabledDefined("navigator.bluetooth", false);
	}

	*/

	Promise.allSettled(promos).then(() => {
		navigator.clipboard.writeText(debugClipboard);
	});
});