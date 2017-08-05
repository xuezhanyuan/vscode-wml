/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import * as assert from 'assert';
import * as embeddedSupport from '../modes/embeddedSupport';
import { TextDocument } from 'vscode-languageserver-types';
import { getLanguageService } from 'vscode-wml-languageservice';

suite('WML Embedded Support', () => {

	var wmlLanguageService = getLanguageService();

	function assertLanguageId(value: string, expectedLanguageId: string): void {
		let offset = value.indexOf('|');
		value = value.substr(0, offset) + value.substr(offset + 1);

		let document = TextDocument.create('test://test/test.wml.xml', 'wml', 0, value);

		let position = document.positionAt(offset);

		let docRegions = embeddedSupport.getDocumentRegions(wmlLanguageService, document);
		let languageId = docRegions.getLanguageAtPosition(position);

		assert.equal(languageId, expectedLanguageId);
	}

	function assertEmbeddedLanguageContent(value: string, languageId: string, expectedContent: string): void {
		let document = TextDocument.create('test://test/test.wml.xml', 'wml', 0, value);

		let docRegions = embeddedSupport.getDocumentRegions(wmlLanguageService, document);
		let content = docRegions.getEmbeddedDocument(languageId);
		assert.equal(content.getText(), expectedContent);
	}

	test('Styles', function (): any {
		assertLanguageId('|<page><style>foo { }</style></page>', 'page');
		assertLanguageId('<page|><style>foo { }</style></page>', 'page');
		assertLanguageId('<page><st|yle>foo { }</style></page>', 'page');
		assertLanguageId('<page><style>|foo { }</style></page>', 'css');
		assertLanguageId('<page><style>foo| { }</style></page>', 'css');
		assertLanguageId('<page><style>foo { }|</style></page>', 'css');
		assertLanguageId('<page><style>foo { }</sty|le></page>', 'page');
	});

	test('Styles - Incomplete WML', function (): any {
		assertLanguageId('|<page><style>foo { }', 'wml');
		assertLanguageId('<page><style>fo|o { }', 'css');
		assertLanguageId('<page><style>foo { }|', 'css');
	});

	test('Style in attribute', function (): any {
		assertLanguageId('<div id="xy" |style="color: red"/>', 'wml');
		assertLanguageId('<div id="xy" styl|e="color: red"/>', 'wml');
		assertLanguageId('<div id="xy" style=|"color: red"/>', 'wml');
		assertLanguageId('<div id="xy" style="|color: red"/>', 'css');
		assertLanguageId('<div id="xy" style="color|: red"/>', 'css');
		assertLanguageId('<div id="xy" style="color: red|"/>', 'css');
		assertLanguageId('<div id="xy" style="color: red"|/>', 'wml');
		assertLanguageId('<div id="xy" style=\'color: r|ed\'/>', 'css');
		assertLanguageId('<div id="xy" style|=color:red/>', 'wml');
		assertLanguageId('<div id="xy" style=|color:red/>', 'css');
		assertLanguageId('<div id="xy" style=color:r|ed/>', 'css');
		assertLanguageId('<div id="xy" style=color:red|/>', 'css');
		assertLanguageId('<div id="xy" style=color:red/|>', 'wml');
	});

	test('Style content', function (): any {
		assertEmbeddedLanguageContent('<page><style>foo { }</style></page>', 'css', '             foo { }               ');
		assertEmbeddedLanguageContent('<page><script>var i = 0;</script></page>', 'css', '                                        ');
		assertEmbeddedLanguageContent('<page><style>foo { }</style>Hello<style>foo { }</style></page>', 'css', '             foo { }                    foo { }               ');
		assertEmbeddedLanguageContent('<page>\n  <style>\n    foo { }  \n  </style>\n</page>\n', 'css', '\n         \n    foo { }  \n  \n\n');

		assertEmbeddedLanguageContent('<div style="color: red"></div>', 'css', '         __{color: red}       ');
		assertEmbeddedLanguageContent('<div style=color:red></div>', 'css', '        __{color:red}      ');
	});

	test('Scripts', function (): any {
		assertLanguageId('|<page><script>var i = 0;</script></page>', 'wml');
		assertLanguageId('<page|><script>var i = 0;</script></page>', 'wml');
		assertLanguageId('<page><scr|ipt>var i = 0;</script></page>', 'wml');
		assertLanguageId('<page><script>|var i = 0;</script></page>', 'javascript');
		assertLanguageId('<page><script>var| i = 0;</script></page>', 'javascript');
		assertLanguageId('<page><script>var i = 0;|</script></page>', 'javascript');
		assertLanguageId('<page><script>var i = 0;</scr|ipt></page>', 'wml');

		assertLanguageId('<script type="text/javascript">var| i = 0;</script>', 'javascript');
		assertLanguageId('<script type="text/ecmascript">var| i = 0;</script>', 'javascript');
		assertLanguageId('<script type="application/javascript">var| i = 0;</script>', 'javascript');
		assertLanguageId('<script type="application/ecmascript">var| i = 0;</script>', 'javascript');
		assertLanguageId('<script type="application/typescript">var| i = 0;</script>', void 0);
		assertLanguageId('<script type=\'text/javascript\'>var| i = 0;</script>', 'javascript');
	});

	test('Scripts in attribute', function (): any {
		assertLanguageId('<div |onKeyUp="foo()" onkeydown=\'bar()\'/>', 'wml');
		assertLanguageId('<div onKeyUp=|"foo()" onkeydown=\'bar()\'/>', 'wml');
		assertLanguageId('<div onKeyUp="|foo()" onkeydown=\'bar()\'/>', 'javascript');
		assertLanguageId('<div onKeyUp="foo(|)" onkeydown=\'bar()\'/>', 'javascript');
		assertLanguageId('<div onKeyUp="foo()|" onkeydown=\'bar()\'/>', 'javascript');
		assertLanguageId('<div onKeyUp="foo()"| onkeydown=\'bar()\'/>', 'wml');
		assertLanguageId('<div onKeyUp="foo()" onkeydown=|\'bar()\'/>', 'wml');
		assertLanguageId('<div onKeyUp="foo()" onkeydown=\'|bar()\'/>', 'javascript');
		assertLanguageId('<div onKeyUp="foo()" onkeydown=\'bar()|\'/>', 'javascript');
		assertLanguageId('<div onKeyUp="foo()" onkeydown=\'bar()\'|/>', 'wml');

		assertLanguageId('<DIV ONKEYUP|=foo()</DIV>', 'wml');
		assertLanguageId('<DIV ONKEYUP=|foo()</DIV>', 'javascript');
		assertLanguageId('<DIV ONKEYUP=f|oo()</DIV>', 'javascript');
		assertLanguageId('<DIV ONKEYUP=foo(|)</DIV>', 'javascript');
		assertLanguageId('<DIV ONKEYUP=foo()|</DIV>', 'javascript');
		assertLanguageId('<DIV ONKEYUP=foo()<|/DIV>', 'wml');

		assertLanguageId('<label data-content="|Checkbox"/>', 'wml');
		assertLanguageId('<label on="|Checkbox"/>', 'wml');
	});

	test('Script content', function (): any {
		assertEmbeddedLanguageContent('<page><script>var i = 0;</script></page>', 'javascript', '              var i = 0;                ');
		assertEmbeddedLanguageContent('<script type="text/javascript">var i = 0;</script>', 'javascript', '                               var i = 0;         ');

		assertEmbeddedLanguageContent('<div onKeyUp="foo()" onkeydown="bar()"/>', 'javascript', '              foo();            bar();  ');
	});

});