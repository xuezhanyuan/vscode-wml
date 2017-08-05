/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import * as assert from 'assert';
import * as wmlLanguageService from '../wmlLanguageService';
import {TextDocument} from 'vscode-languageserver-types';



suite('WML Hover', () => {

	function assertHover(value: string, expectedHoverLabel: string, expectedHoverOffset): void {
		let offset = value.indexOf('|');
		value = value.substr(0, offset) + value.substr(offset + 1);

		let document = TextDocument.create('test://test/test.wml.xml', 'wml', 0, value);

		let position = document.positionAt(offset);
		let ls = wmlLanguageService.getLanguageService();
		let wmlDoc = ls.parseWMLDocument(document);

		let hover = ls.doHover(document, position, wmlDoc);
		assert.equal(hover && hover.contents[0].value, expectedHoverLabel);
		assert.equal(hover && document.offsetAt(hover.range.start), expectedHoverOffset);
	}

	test('Single', function (): any {
		assertHover('|<page></page>', void 0, void 0);
		assertHover('<|page></page>', '<page>', 1);
		assertHover('<p|age></page>', '<page>', 1);
		assertHover('<pag|e></page>', '<page>', 1);
		assertHover('<page|></page>', '<page>', 1);
		assertHover('<page>|</page>', void 0, void 0);
		assertHover('<page><|/page>', void 0, void 0);
		assertHover('<page></|page>', '</page>', 8);
		assertHover('<page></p|age>', '</page>', 8);
		assertHover('<page></pa|ge>', '</page>', 8);
		assertHover('<page></pag|e>', '</page>', 8);
		assertHover('<page></page|>', '</page>', 8);
		assertHover('<page></page>|', void 0, void 0);
	});
});