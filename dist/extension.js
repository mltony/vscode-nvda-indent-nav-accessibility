/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(__webpack_require__(1));
const fs_1 = __webpack_require__(2);
const net = __importStar(__webpack_require__(3));
const child_process_1 = __webpack_require__(4);
const DEBUG = true;
const MYLOG_FILE_NAME = 'H:\\1.txt';
function initLogFile() {
    if (DEBUG) {
        (0, fs_1.writeFileSync)(MYLOG_FILE_NAME, '', {
            flag: 'w',
        });
    }
}
function mylog(data) {
    if (DEBUG) {
        (0, fs_1.writeFileSync)(MYLOG_FILE_NAME, data + '\n', {
            flag: 'a',
        });
    }
}
function writeToFile(filename, data) {
    (0, fs_1.writeFileSync)(filename, data, {
        flag: 'a',
    });
    console.log(`Data written to ${filename}`);
}
const LINE_BREAKS_REGEX = /\r?\n|\r/g;
function getParentProcessId() {
    const pid = process.pid;
    const output = (0, child_process_1.execSync)(`wmic process where (ProcessId=${pid}) get ParentProcessId`).toString();
    const parentPid = parseInt(output.split('\n')[1].trim(), 10);
    return parentPid;
}
function getActiveTextEditor() {
    if (vscode.window.activeTextEditor) {
        return vscode.window.activeTextEditor;
    }
    throw new Error('No active text editor');
}
function getStoryLength(json) {
    const editor = getActiveTextEditor();
    const text = editor.document.getText();
    const length = text.length;
    return {
        'result': length
    };
}
function getStoryText(json) {
    const editor = getActiveTextEditor();
    const text = editor.document.getText();
    return {
        'result': text
    };
}
function getLineOffsets() {
    const editor = getActiveTextEditor();
    const text = editor.document.getText();
    const lineBreaks = text.matchAll(LINE_BREAKS_REGEX);
    const lineStartIndices = [0];
    for (const lineBreak of lineBreaks) {
        lineStartIndices.push(lineBreak.index
            + lineBreak[0].length);
    }
    return lineStartIndices;
}
function offsetToPosition(offset) {
    const lineOffsets = getLineOffsets();
    let i;
    for (i = 1; i < lineOffsets.length; i++) {
        if (lineOffsets[i] > offset) {
            break;
        }
    }
    const lineIndex = i - 1;
    const characterPosition = offset - lineOffsets[lineIndex];
    const position = new vscode.Position(lineIndex, characterPosition);
    return position;
}
function setCaretOffset(json) {
    const editor = getActiveTextEditor();
    const offset = json['offset'];
    const position = offsetToPosition(offset);
    const newSelection = new vscode.Selection(position, position);
    editor.selection = newSelection;
    return {
        'result': true,
    };
}
function getCaretOffset(json) {
    const editor = getActiveTextEditor();
    const cursorPosition = editor.selection.active;
    const range = new vscode.Range(0, 0, cursorPosition.line, cursorPosition.character);
    const textUntilCursor = editor.document.getText(range);
    const length = textUntilCursor.length;
    return {
        'result': length
    };
}
function setSelectionOffsets(json) {
    const editor = getActiveTextEditor();
    const anchorOffset = json['anchorOffset'];
    const offset = json['offset'];
    const anchorPosition = offsetToPosition(anchorOffset);
    const position = offsetToPosition(offset);
    const newSelection = new vscode.Selection(anchorPosition, position);
    editor.selection = newSelection;
    return {
        'result': true,
    };
}
function getSelectionOffsets(json) {
    const editor = getActiveTextEditor();
    const cursorPosition = editor.selection.active;
    const range = new vscode.Range(0, 0, cursorPosition.line, cursorPosition.character);
    const textUntilCursor = editor.document.getText(range);
    const length = textUntilCursor.length;
    const anchorPosition = editor.selection.anchor;
    const anchorRange = new vscode.Range(0, 0, anchorPosition.line, anchorPosition.character);
    const textUntilAnchor = editor.document.getText(anchorRange);
    const anchorLength = textUntilAnchor.length;
    return {
        'result': [
            anchorLength,
            length,
        ],
    };
}
function getStatus(json) {
    if (false) {}
    return {
        'result': {
            'focused': vscode.window.state.focused,
            'activeTextEditorPresent': vscode.window.activeTextEditor !== null,
            'title': process.title,
        }
    };
}
function handleRequest(json) {
    //mylog('Received data: ' + json);
    let command;
    try {
        command = json['command'];
    }
    catch (error) {
        mylog('Error parsing JSON:' + error);
        throw new Error('No command field in json request');
    }
    let result;
    switch (command) {
        case "getStoryLength":
            result = getStoryLength(json);
            return result;
        case 'getStoryText':
            result = getStoryText(json);
            return result;
        case 'getCaretOffset':
            result = getCaretOffset(json);
            return result;
        case 'setCaretOffset':
            return setCaretOffset(json);
        case 'getSelectionOffsets':
            return getSelectionOffsets(json);
        case 'setSelectionOffsets':
            return setSelectionOffsets(json);
        case 'getStatus':
            return getStatus(json);
    }
}
function packJsonResponse(json) {
    const jsonString = JSON.stringify(json);
    const { Buffer } = __webpack_require__(5);
    const lengthInBytes = Buffer.byteLength(jsonString, 'utf-8');
    mylog(`packJsonResponse need ${lengthInBytes} for '${jsonString}'`);
    const buffer = Buffer.alloc(4 + lengthInBytes);
    buffer.writeUInt32LE(lengthInBytes, 0);
    buffer.write(jsonString, 4, 'utf-8');
    return buffer;
}
function activate(context) {
    initLogFile();
    mylog("Initializing!");
    // Create a named pipe server
    const server = net.createServer((socket) => {
        let buffer = Buffer.alloc(0);
        let expectedLength = -1;
        socket.on('data', (data) => {
            mylog('Received data: ' + data.toString());
            buffer = Buffer.concat([buffer, data]);
            if (expectedLength === -1 && buffer.length >= 4) {
                expectedLength = buffer.readUInt32LE(0);
                buffer = buffer.slice(4);
                mylog(`Read length token ${expectedLength}`);
            }
            if (expectedLength !== -1 && buffer.length >= expectedLength) {
                const jsonString = buffer.slice(0, expectedLength).toString();
                mylog(`Read request ${jsonString}`);
                buffer = buffer.slice(expectedLength);
                let requestJson, responseJson;
                try {
                    requestJson = JSON.parse(jsonString);
                }
                catch (error) {
                    let msg = "Unknown error";
                    if (error instanceof Error) {
                        msg = error.toString();
                    }
                    mylog('Error parsing JSON:' + msg);
                    socket.write(packJsonResponse({ 'error': msg }));
                    return;
                }
                try {
                    responseJson = handleRequest(requestJson);
                }
                catch (error) {
                    let msg = "Unknown error";
                    if (error instanceof Error) {
                        msg = error.toString();
                    }
                    mylog('Error handling request:' + msg);
                    socket.write(packJsonResponse({ 'error': msg }));
                    return;
                }
                mylog('Computed response: ' + JSON.stringify(responseJson));
                socket.write(packJsonResponse(responseJson));
                expectedLength = -1;
            }
        });
        socket.on('end', () => {
            mylog('Client disconnected');
        });
    });
    //const vscodePid = getParentProcessId();
    const pid = process.pid;
    const pipeName = `\\\\.\\pipe\\VSCodeIndentNavBridge${pid}`;
    server.listen(pipeName, () => {
        mylog(`Server listening on ${pipeName}`);
    });
}
exports.activate = activate;
function deactivate() {
    mylog("deactivate");
}
exports.deactivate = deactivate;


/***/ }),
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("fs");

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("net");

/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("child_process");

/***/ }),
/* 5 */
/***/ ((module) => {

module.exports = require("buffer");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=extension.js.map