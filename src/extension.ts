import * as vscode from 'vscode';
import { writeFileSync } from 'fs';
import { join } from 'path';
import * as net from 'net';
import { execSync } from 'child_process';

const DEBUG = true;
const MYLOG_FILE_NAME = 'H:\\1.txt';

function initLogFile() {
	if (DEBUG) {
		writeFileSync(MYLOG_FILE_NAME, '', {
			flag: 'w',
		});
	}
}

function mylog(data: string) {
	if (DEBUG) {
		writeFileSync(MYLOG_FILE_NAME, data + '\n', {
			flag: 'a',
		 });
	}
}

function writeToFile(filename: string, data: string) {
 writeFileSync(filename, data, {
	flag: 'a',
 });

 console.log(`Data written to ${filename}`);
}

const LINE_BREAKS_REGEX = /\r?\n|\r/g;

function getParentProcessId(): number {
	const pid = process.pid;
    const output = execSync(`wmic process where (ProcessId=${pid}) get ParentProcessId`).toString();
    const parentPid = parseInt(output.split('\n')[1].trim(), 10);
    return parentPid;
}


function getActiveTextEditor(): vscode.TextEditor {
	if (vscode.window.activeTextEditor) {
		return vscode.window.activeTextEditor;
	}
	throw new Error('No active text editor');
}

function getStoryLength(json: any): any {
	const editor = getActiveTextEditor();
	const text = editor.document.getText();
	const length = text.length;
	return {
		'result': length
	};

}

function getStoryText(json: any): any {
	const editor = getActiveTextEditor();
	const text = editor.document.getText();
	return {
		'result': text
	};
}

function getLineOffsets(): Array<number> {
	const editor = getActiveTextEditor();
	const text = editor.document.getText();
	const lineBreaks = text.matchAll(LINE_BREAKS_REGEX);
	const lineStartIndices = [0];
	for (const lineBreak of lineBreaks) {
		lineStartIndices .push(
			lineBreak .index as number
			+ lineBreak[0].length
		);
	}
	return lineStartIndices ;
}

function offsetToPosition(offset: number): vscode.Position {
	const lineOffsets = getLineOffsets();
	let i: number;
	for(i = 1; i < lineOffsets.length; i++) {
		if (lineOffsets[i] > offset) {
			break;
		}
	}
	const lineIndex = i - 1;
	const characterPosition = offset - lineOffsets[lineIndex ];
	const position = new vscode.Position(lineIndex, characterPosition);
	return position;
}

function setCaretOffset(json: any): any {
	const editor = getActiveTextEditor();
	const offset = json['offset'];
	const position = offsetToPosition(offset);
	const newSelection = new vscode.Selection(position, position);
	editor.selection = newSelection;
	return {
		'result': true,
	};
}

function getCaretOffset(json: any): any {
	const editor = getActiveTextEditor();
	const cursorPosition = editor.selection.active;
	const range = new vscode.Range(0, 0, cursorPosition.line, cursorPosition.character);
	const textUntilCursor = editor.document.getText(range);
	const length = textUntilCursor.length;
	return {
		'result': length
	};
}

function setSelectionOffsets(json: any): any {
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

function getSelectionOffsets(json: any): any {
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

function getStatus(json: any): any {
	if (false) {
		const focusedView = vscode.commands.executeCommand('vscode.commands.getContext', 'focusedView');
		mylog('asdf getting focused view');
		vscode.commands.executeCommand('vscode.commands.qqqgetContext', 'focusedView').then(focusedView => {
			mylog(`asdf Currently focused view: ${focusedView}`);
			// You can return the focusedView here if you need to use it elsewhere
		});
	}


	return {
		'result': {
			'focused': vscode.window.state.focused,
			'activeTextEditorPresent': vscode.window.activeTextEditor !== null,
			'title': process.title,
		}
	};
}


function handleRequest(json: any): any {
	//mylog('Received data: ' + json);
	let command;
	try {
		command = json['command'];
	} catch (error) {
		mylog('Error parsing JSON:' + error);
		throw new Error('No command field in json request');
	}
	let result;
	switch(command) {
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

function packJsonResponse(json: any): Buffer {
	const jsonString = JSON.stringify(json);
	const { Buffer } = require('buffer');
	const lengthInBytes = Buffer.byteLength(jsonString, 'utf-8');
	mylog(`packJsonResponse need ${lengthInBytes} for '${jsonString}'`);
	const buffer = Buffer.alloc(4 + lengthInBytes);
	buffer.writeUInt32LE(lengthInBytes, 0); 
	buffer.write(jsonString, 4, 'utf-8');
	return buffer;
}


export function activate(context: vscode.ExtensionContext) {
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
				} catch (error) {
					let msg = "Unknown error";
					if (error instanceof Error) {
						msg = error.toString();
					}
					mylog('Error parsing JSON:' + msg);
					socket.write(packJsonResponse({'error': msg}));
					return;
				}
				try {
					responseJson = handleRequest(requestJson);
				} catch (error) {
					let msg = "Unknown error";
					if (error instanceof Error) {
						msg = error.toString();
					}
					mylog('Error handling request:' + msg);
					socket.write(packJsonResponse({'error': msg}));
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

export function deactivate() {
	mylog("deactivate");
}
