// https://developer.chrome.com/articles/bluetooth

let colorFail = "LightCoral";
let colorPass = "PaleGreen";
let colorNote = "SkyBlue";
let debugBody = document.getElementById("debugBody");
let debugButton = document.getElementById("debugButton");

function _print(title, value, color) {
	let logMsg = document.createElement("div");
	logMsg.innerHTML = "<b>" + title + ":</b> " + value;
	logMsg.style.backgroundColor = color;
	logMsg.style.display = "grid";
	logMsg.style.borderTop = "1px black solid";
	debugBody.appendChild(logMsg);
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
    _dep = [],
    _rf = function(obj,n,_n,_a,_k,_i,_ws,_f,_e){
        if(typeof obj != "object") return false;
        if(typeof _a === "undefined") _a = "null/undefined/self-reference";
        _dep.push(obj),
        _f = (_dep.length < 1) ? function(){} : function(_z,_x){
            for(_x = 0; _x <= _dep.length; _x++){
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
        for(var _i in obj){
            if(typeof obj[_i] !== "object"){
            if(typeof obj[_i] === "string") obj[_i] = "'"+obj[_i].toString()+"'";
            if(typeof obj[_i] === "boolean") obj[_i] = obj[_i].toString() + " (boolean)";
            response += _ws + _i + " : " + obj[_i].toString();
            response += "\n";
            continue;
        }
            response += (_f(_i)) ? _ws + _i + " : "+ _a +" (prevent loop)\n" : _ws + _i + " : " + _rf(obj[_i],n+_n,_n,_a);
        }
    if(_n != n) response += _ws;
    	return response +="} \n";
    }
	_res = _rf(_o,_m);
	_dep = [];
	return _res;
}

function printBluetoothDevice(device) {
	console.log(device);

	if (!(device instanceof BluetoothDevice)) {
		printLog("printBluetoothDevice", "Incorrect type", false);
		return;
	}

	let printElement = document.createElement("pre");
	printElement.textContent = "BluetoothDevice\n" + OBJtoString(device, 4);
	printElement.style.backgroundColor = colorNote;
	printElement.style.display = "grid";
	printElement.style.borderTop = "1px black solid";
	printElement.style.margin = 0;
	debugBody.appendChild(printElement);
}



// User gesture required (touch/mouse-click) to run navigator.bluetooth.requestDevice
debugButton.addEventListener('pointerup', function(event) {

	debugBody.innerHTML = "";

	// HTTPS secure context required
	printEnabledDefined("Secure Context", isSecureContext);
	printEnabledDefined("Bluetooth", (navigator.bluetooth != undefined));

	if (navigator.bluetooth != undefined) {

		printEnabledDefined("Bluetooth.requestDevice", (navigator.bluetooth.requestDevice != undefined));
		printEnabledDefined("Bluetooth.getAvailability", (navigator.bluetooth.getAvailability != undefined));

		navigator.bluetooth.getAvailability()
		.then(availability => {
			if (availability) {
				printLog("Bluetooth Adapter", "Available");
			} else {
				printLog("Bluetooth Adapter", "Unavailable (check chrome://bluetooth-internals scan devices, check bluetooth adapter LMP version is >= 6 (Bluetooth Core Spec 4.0))", false);
			}
		}).catch(error => {
			printLog("getAvailability Error", "[" + error + "]", false);
		});

		navigator.bluetooth.requestDevice({acceptAllDevices: true})
		.then(device => {
			printBluetoothDevice(device);
		}, reject => {
			printLog("requestDevice Reject", "[" + reject + "]", false)
			printNote("If \"No compatible devices can be found\"", "Check bluetooth hardware LMP version is >=6");
		}).catch(error => {
			printLog("requestDevice Error", "[" + error + "]", false);
		});


	} else {
		printEnabledDefined("navigator.bluetooth", false);
	}

});