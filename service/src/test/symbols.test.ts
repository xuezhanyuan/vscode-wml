/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import * as assert from 'assert';
import * as wmlLanguageService from '../wmlLanguageService';

import { TextDocument, SymbolInformation, SymbolKind, Location, Range, Position } from 'vscode-languageserver-types';

suite('WML Symbols', () => {

    const TEST_URI = "test://test/test.wml.xml";

	function asPromise<T>(result: T): Promise<T> {
		return Promise.resolve(result);
	}

    let assertSymbols = function (symbols: SymbolInformation[], expected: SymbolInformation[]) {
        assert.deepEqual(symbols, expected);
    }

    let testSymbolsFor = function(value: string, expected: SymbolInformation[]) {
        let ls = wmlLanguageService.getLanguageService();
		let document = TextDocument.create(TEST_URI, 'wml', 0, value);
		let wmlDoc = ls.parseWMLDocument(document);
        let symbols = ls.findDocumentSymbols(document, wmlDoc);
        assertSymbols(symbols, expected);
    }

    test('Simple', () => {
        testSymbolsFor('<div></div>', [<SymbolInformation>{ containerName: '', name: 'div', kind: <SymbolKind>SymbolKind.Field, location: Location.create(TEST_URI, Range.create(0, 0, 0, 11)) }]);
        testSymbolsFor('<div><input checked id="test" class="checkbox"></div>', [{ containerName: '', name: 'div', kind: <SymbolKind>SymbolKind.Field, location: Location.create(TEST_URI, Range.create(0, 0, 0, 53)) },
            { containerName: 'div', name: 'input#test.checkbox', kind: <SymbolKind>SymbolKind.Field, location: Location.create(TEST_URI, Range.create(0, 5, 0, 47)) }]);
    });

    test('Id and classes', function() {
		var content = '<page id=\'root\'><data id="Foo" class="bar"><div class="a b"></div></data></page>';

		var expected = [
			{ name: 'page#root', kind: SymbolKind.Field, containerName: '', location: Location.create(TEST_URI, Range.create(0, 0, 0, 80)) },
			{ name: 'data#Foo.bar', kind: SymbolKind.Field, containerName: 'page#root', location: Location.create(TEST_URI, Range.create(0, 16, 0, 73)) },
            { name: 'div.a.b', kind: SymbolKind.Field, containerName: 'data#Foo.bar', location: Location.create(TEST_URI, Range.create(0, 43, 0, 66)) },
		];

		testSymbolsFor(content, expected);
	});

 	test('Self closing', function() {
		var content = '<page><br id="Foo"><br id=Bar></page>';

		var expected = [
			{ name: 'page', kind: SymbolKind.Field, containerName: '', location: Location.create(TEST_URI, Range.create(0, 0, 0, 37)) },
			{ name: 'br#Foo', kind: SymbolKind.Field, containerName: 'page', location: Location.create(TEST_URI, Range.create(0, 6, 0, 19)) },
            { name: 'br#Bar', kind: SymbolKind.Field, containerName: 'page', location: Location.create(TEST_URI, Range.create(0, 19, 0, 30)) },
		];

		testSymbolsFor(content, expected);
	}); 

	test('No attrib', function() {
		var content = '<page><data><div></div></data></page>';

		var expected = [
			{ name: 'page', kind: SymbolKind.Field, containerName: '', location: Location.create(TEST_URI, Range.create(0, 0, 0, 37)) },
			{ name: 'data', kind: SymbolKind.Field, containerName: 'page', location: Location.create(TEST_URI, Range.create(0, 6, 0, 30)) },
			{ name: 'div', kind: SymbolKind.Field, containerName: 'data', location: Location.create(TEST_URI, Range.create(0, 12, 0, 23)) }
		];

		testSymbolsFor(content, expected);
	});         
})
