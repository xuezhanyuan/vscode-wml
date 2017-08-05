/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import * as path from 'path';
import { languages, workspace, ExtensionContext, IndentAction } from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind, Range, RequestType } from 'vscode-languageclient';
import { EMPTY_ELEMENTS } from './wmlEmptyTagsShared';
import { activateColorDecorations } from './colorDecorators';
import TelemetryReporter from 'vscode-extension-telemetry';

import * as nls from 'vscode-nls';

let localize = nls.loadMessageBundle();


interface IPackageInfo {
	name: string;
	version: string;
	aiKey: string;
}

export function activate(context: ExtensionContext) {

	let packageInfo = getPackageInfo(context);
	let telemetryReporter: TelemetryReporter = packageInfo && new TelemetryReporter(packageInfo.name, packageInfo.version, packageInfo.aiKey);
	context.subscriptions.push(telemetryReporter);

	// The server is implemented in node
	let serverModule = context.asAbsolutePath(path.join('server', 'wmlServerMain.js'));
	// The debug options for the server
	let debugOptions = { execArgv: ['--nolazy', '--debug=6009'] };

	// If the extension is launch in debug mode the debug server options are use
	// Otherwise the run options are used
	let serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions }
	};

	let embeddedLanguages = { css: true, javascript: true };
	// Options to control the language client
	let clientOptions: LanguageClientOptions = {
		documentSelector:["wml"],
		initializationOptions: {
			embeddedLanguages
		}
	};

	// Create the language client and start the client.
	let client = new LanguageClient('wml', localize('htmlserver.name', 'WML Language Server'), serverOptions, clientOptions);
	let disposable = client.start();
	context.subscriptions.push(disposable);
	client.onReady().then(() => {
		client.onTelemetry(e => {
			if (telemetryReporter) {
				telemetryReporter.sendTelemetryEvent(e.key, e.data);
			}
		});
	});
}

function getPackageInfo(context: ExtensionContext): IPackageInfo {
	let extensionPackage = require(context.asAbsolutePath('./package.json'));
	if (extensionPackage) {
		return {
			name: extensionPackage.name,
			version: extensionPackage.version,
			aiKey: extensionPackage.aiKey
		};
	}
	return null;
}