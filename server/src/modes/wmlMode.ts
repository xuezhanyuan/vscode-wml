/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { getLanguageModelCache } from '../languageModelCache';
import { LanguageService as WMLLanguageService, WMLDocument, DocumentContext, FormattingOptions } from 'vscode-wml-languageservice';
import { TextDocument, Position, Range } from 'vscode-languageserver-types';
import { LanguageMode } from './languageModes';

export function getWMLMode(wmlLanguageService: WMLLanguageService): LanguageMode {
	
	let wmlDocuments = getLanguageModelCache<WMLDocument>(10, 60, document => wmlLanguageService.parseWMLDocument(document));
	return {
		getId() {
			return 'wml';
		},
		doComplete(document: TextDocument, position: Position) {
			return wmlLanguageService.doComplete(document, position, wmlDocuments.get(document));
		},
		doHover(document: TextDocument, position: Position) {
			return wmlLanguageService.doHover(document, position, wmlDocuments.get(document));
		},
		findDocumentHighlight(document: TextDocument, position: Position) {
			return wmlLanguageService.findDocumentHighlights(document, position, wmlDocuments.get(document));
		},
		findDocumentLinks(document: TextDocument, documentContext: DocumentContext) {
			return wmlLanguageService.findDocumentLinks(document, documentContext);
		},
		findDocumentSymbols(document: TextDocument) {
			return wmlLanguageService.findDocumentSymbols(document, wmlDocuments.get(document));
		},
		onDocumentRemoved(document: TextDocument) {
			wmlDocuments.onDocumentRemoved(document);
		},
		dispose() {
			wmlDocuments.dispose();
		}
	};
};

function merge(src: any, dst: any): any {
	for (var key in src) {
		if (src.hasOwnProperty(key)) {
			dst[key] = src[key];
		}
	}
	return dst;
}
