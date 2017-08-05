/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import {createScanner} from './parser/wmlScanner';
import {parse} from './parser/wmlParser';
import {doComplete} from './services/wmlCompletion';
import {doHover} from './services/wmlHover';
import {findDocumentLinks} from './services/wmlLinks';
import {findDocumentHighlights} from './services/wmlHighlighting';
import {findDocumentSymbols} from './services/wmlSymbolsProvider';
import {TextDocument, Position, CompletionItem, CompletionList, Hover, Range, SymbolInformation, Diagnostic, TextEdit, DocumentHighlight, FormattingOptions, MarkedString, DocumentLink } from 'vscode-languageserver-types';

export {TextDocument, Position, CompletionItem, CompletionList, Hover, Range, SymbolInformation, Diagnostic, TextEdit, DocumentHighlight, FormattingOptions, MarkedString, DocumentLink };

export interface Node {
	tag: string;
	start: number;
	end: number;
	endTagStart: number;
	children: Node[];
	parent: Node;
	attributes?: {[name: string]: string};
}


export enum TokenType {
	StartCommentTag,
	Comment,
	EndCommentTag,
	StartTagOpen,
	StartTagClose,
	StartTagSelfClose,
	StartTag,
	EndTagOpen,
	EndTagClose,
	EndTag,
	DelimiterAssign,
	AttributeName,
	AttributeValue,
	StartDoctypeTag,
	Doctype,
	EndDoctypeTag,
	Content,
	Whitespace,
	Unknown,
	Script,
	Styles,
	EOS
}

export enum ScannerState {
	WithinContent,
	AfterOpeningStartTag,
	AfterOpeningEndTag,
	WithinDoctype,
	WithinTag,
	WithinEndTag,
	WithinComment,
	WithinScriptContent,
	WithinStyleContent,
	AfterAttributeName,
	BeforeAttributeValue
}

export interface Scanner {
	scan(): TokenType;
	getTokenType(): TokenType;
	getTokenOffset(): number;
	getTokenLength(): number;
	getTokenEnd(): number;
	getTokenText(): string;
	getTokenError(): string;
	getScannerState(): ScannerState;
}

export declare type WMLDocument = {
	roots: Node[];
	findNodeBefore(offset: number): Node;
	findNodeAt(offset: number): Node;
};

export interface DocumentContext {
	resolveReference(ref: string, base?: string): string;
}

export interface LanguageService {
	createScanner(input: string): Scanner;
	parseWMLDocument(document: TextDocument): WMLDocument;
	findDocumentHighlights(document: TextDocument, position: Position, wmlDocument: WMLDocument): DocumentHighlight[];
	doComplete(document: TextDocument, position: Position, wmlDocument: WMLDocument): CompletionList;
	doHover(document: TextDocument, position: Position, wmlDocument: WMLDocument): Hover;
	findDocumentLinks(document: TextDocument, documentContext: DocumentContext): DocumentLink[];
	findDocumentSymbols(document: TextDocument, htmlDocument: WMLDocument): SymbolInformation[];
}

export function getLanguageService(): LanguageService {
	return {
		createScanner,
		parseWMLDocument: document => parse(document.getText()),
		doComplete,
		doHover,
		findDocumentHighlights,
		findDocumentLinks,
		findDocumentSymbols
	};
}