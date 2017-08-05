/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import * as assert from 'assert';
import * as wmlLanguageService from '../wmlLanguageService';
import {TextDocument} from 'vscode-languageserver-types';



suite('WML Highlighting', () => {


	function assertHighlights(value: string, expectedMatches: number[], elementName: string): void {
		let offset = value.indexOf('|');
		value = value.substr(0, offset) + value.substr(offset + 1);

		let document = TextDocument.create('test://test/test.wml.xml', 'wml', 0, value);

		let position = document.positionAt(offset);
		let ls = wmlLanguageService.getLanguageService();
		let wmlDoc = ls.parseWMLDocument(document);

		let highlights = ls.findDocumentHighlights(document, position, wmlDoc);
		assert.equal(highlights.length, expectedMatches.length);
		for (let i = 0; i < highlights.length; i++) {
			let actualStartOffset = document.offsetAt(highlights[i].range.start);
			assert.equal(actualStartOffset, expectedMatches[i]);
			let actualEndOffset = document.offsetAt(highlights[i].range.end);
			assert.equal(actualEndOffset, expectedMatches[i] + elementName.length);

			assert.equal(document.getText().substring(actualStartOffset, actualEndOffset).toLowerCase(), elementName);
		}
	}

	test('Single', function (): any {
		assertHighlights('|<page></page>', [], null);
		assertHighlights('<|page></page>', [1, 8], 'page');
		assertHighlights('<p|age></page>', [1, 8], 'page');
		assertHighlights('<pag|e></page>', [1, 8], 'page');
		assertHighlights('<page|></page>', [1, 8], 'page');
		assertHighlights('<page>|</page>', [], null);
		assertHighlights('<page><|/page>', [], null);
		assertHighlights('<page></|page>', [1, 8], 'page');
		assertHighlights('<page></p|age>', [1, 8], 'page');
		assertHighlights('<page></pa|ge>', [1, 8], 'page');
		assertHighlights('<page></pag|e>', [1, 8], 'page');
		assertHighlights('<page></page|>', [1, 8], 'page');
		assertHighlights('<page></page>|', [], null);
	});

	test('Nested', function (): any {
		assertHighlights('<page>|<div></div></page>', [], null);
		assertHighlights('<page><|div></div></page>', [7, 13], 'div');
		assertHighlights('<page><div>|</div></page>', [], null);
		assertHighlights('<page><div></di|v></page>', [7, 13], 'div');
		assertHighlights('<page><div><div></div></di|v></page>', [7, 24], 'div');
		assertHighlights('<page><div><div></div|></div></page>', [12, 18], 'div');
		assertHighlights('<page><div><div|></div></div></page>', [12, 18], 'div');
		assertHighlights('<page><div><div></div></div></p|age>', [1, 30], 'page');
		assertHighlights('<page><di|v></div><div></div></page>', [7, 13], 'div');
		assertHighlights('<page><div></div><div></d|iv></page>', [18, 24], 'div');
	});

	test('Selfclosed', function (): any {
		assertHighlights('<page><|div/></page>', [7], 'div');
		assertHighlights('<page><|br></page>', [7], 'br');
		assertHighlights('<page><div><d|iv/></div></page>', [12], 'div');
	});

	test('Case insensivity', function (): any {
		assertHighlights('<page><diV><Div></dIV></dI|v></page>', [7, 24], 'div');
		assertHighlights('<page><diV|><Div></dIV></dIv></page>', [7, 24], 'div');
	});
});