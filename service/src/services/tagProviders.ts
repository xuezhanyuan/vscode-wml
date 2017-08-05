/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import {getHTMLTagProvider, getWmlTagProvider, IWMLTagProvider} from '../parser/wmlTags';

export let allTagProviders : IWMLTagProvider[] = [
	getWmlTagProvider(),
	getHTMLTagProvider()
];

export function getAllTagProviders(pTag:string):IWMLTagProvider[]{

	if(pTag){
		return allTagProviders;
	}else{
		return [getWmlTagProvider()];
	}

}