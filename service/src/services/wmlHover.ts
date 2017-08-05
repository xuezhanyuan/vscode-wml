/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { WMLDocument } from '../parser/wmlParser';
import { TokenType, createScanner } from '../parser/wmlScanner';
import { TextDocument, Range, Position, Hover, MarkedString } from 'vscode-languageserver-types';
import { getAllTagProviders } from './tagProviders';

export function doHover(document: TextDocument, position: Position, wmlDocument: WMLDocument): Hover {
	let offset = document.offsetAt(position);
	let node = wmlDocument.findNodeAt(offset);
	if (!node || !node.tag) {
		return void 0;
	}
	let pTag = node.parent.tag;
	let tagProviders = getAllTagProviders(pTag).filter(p => p.isApplicable(document.languageId));
	function getTagHover(tag: string, range: Range, open: boolean): Hover {
		tag = tag.toLowerCase();
		for (let provider of tagProviders) {
			let hover: Hover;
			provider.collectTags((t, label) => {
				if (t === tag) {
					let tagLabel = open ? '<' + tag + '>' : '</' + tag + '>';
					hover = { contents: [ { language: 'wml', value: tagLabel }, MarkedString.fromPlainText(label)], range };
				}
			});
			if (hover) {
				return hover;
			}
		}
		return void 0;
	}

	function getTagNameRange(tokenType: TokenType, startOffset: number): Range {
		let scanner = createScanner(document.getText(), startOffset);
		let token = scanner.scan();
		while (token !== TokenType.EOS && (scanner.getTokenEnd() < offset || scanner.getTokenEnd() === offset && token !== tokenType)) {
			token = scanner.scan();
		}
		if (token === tokenType && offset <= scanner.getTokenEnd()) {
			return { start: document.positionAt(scanner.getTokenOffset()), end: document.positionAt(scanner.getTokenEnd()) };
		}
		return null;
	}

	if (node.endTagStart && offset >= node.endTagStart) {
		let tagRange = getTagNameRange(TokenType.EndTag, node.endTagStart);
		if (tagRange) {
			return getTagHover(node.tag, tagRange, false);
		}
		return void 0;
	}

	let tagRange = getTagNameRange(TokenType.StartTag, node.start);
	if (tagRange) {
		return getTagHover(node.tag, tagRange, true);
	}
	return void 0;
}

