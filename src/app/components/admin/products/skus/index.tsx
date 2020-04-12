import React, { useState } from 'react';
import Product from 'models/commerce/Product'
import SKU from 'models/commerce/SKU'
import SKUsTable from './SKUsTable'
import SKUTabale from './SKUTable'

export default ({ product, skus, sku, setSKU, edit }: { product: Product, skus: SKU[], sku?: SKU, setSKU?: (newSKU: SKU | undefined) => void, edit: boolean }) => {
	if (sku) {
		return <SKUTabale product={product} sku={sku} edit={edit} setSKU={setSKU} />
	} else {
		return <SKUsTable product={product} skus={skus} setSKU={setSKU} />
	}
}
