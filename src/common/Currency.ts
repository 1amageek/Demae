export type Currency =
	'AFN' | // Afghan Afghani, AFN*
	'ALL' | // Albanian Lek, ALL
	'DZD' | // Algerian Dinar, DZD
	'AOA' | // Angolan Kwanza, AOA*
	'ARS' | // Argentine Peso, ARS*
	'AMD' | // Armenian Dram, AMD
	'AWG' | // Aruban Florin, AWG
	'AUD' | // Australian Dollar, AUD
	'AZN' | // Azerbaijani Manat, AZN
	'BSD' | // Bahamian Dollar, BSD
	'BDT' | // Bangladeshi Taka, BDT
	'BBD' | // Barbadian Dollar, BBD
	'BZD' | // Belize Dollar, BZD
	'BMD' | // Bermudian Dollar, BMD
	'BOB' | // Bolivian Boliviano, BOB*
	'BAM' | // Bosnia & Herzegovina Convertible Mark, BAM
	'BWP' | // Botswana Pula, BWP
	'BRL' | // Brazilian Real, BRL*
	'GBP' | // British Pound, GBP
	'BND' | // Brunei Dollar, BND
	'BGN' | // Bulgarian Lev, BGN
	'BIF' | // Burundian Franc, BIF
	'KHR' | // Cambodian Riel, KHR
	'CAD' | // Canadian Dollar, CAD
	'CVE' | // Cape Verdean Escudo, CVE*
	'KYD' | // Cayman Islands Dollar, KYD
	'XAF' | // Central African Cfa Franc, XAF
	'XPF' | // Cfp Franc, XPF*
	'CLP' | // Chilean Peso, CLP*
	'CNY' | // Chinese Renminbi Yuan, CNY
	'COP' | // Colombian Peso, COP*
	'KMF' | // Comorian Franc, KMF
	'CDF' | // Congolese Franc, CDF
	'CRC' | // Costa Rican Colón, CRC*
	'HRK' | // Croatian Kuna, HRK
	'CZK' | // Czech Koruna, CZK*
	'DKK' | // Danish Krone, DKK
	'DJF' | // Djiboutian Franc, DJF*
	'DOP' | // Dominican Peso, DOP
	'XCD' | // East Caribbean Dollar, XCD
	'EGP' | // Egyptian Pound, EGP
	'ETB' | // Ethiopian Birr, ETB
	'EUR' | // Euro, EUR
	'FKP' | // Falkland Islands Pound, FKP*
	'FJD' | // Fijian Dollar, FJD
	'GMD' | // Gambian Dalasi, GMD
	'GEL' | // Georgian Lari, GEL
	'GIP' | // Gibraltar Pound, GIP
	'GTQ' | // Guatemalan Quetzal, GTQ*
	'GNF' | // Guinean Franc, GNF*
	'GYD' | // Guyanese Dollar, GYD
	'HTG' | // Haitian Gourde, HTG
	'HNL' | // Honduran Lempira, HNL*
	'HKD' | // Hong Kong Dollar, HKD
	'HUF' | // Hungarian Forint, HUF*
	'ISK' | // Icelandic Króna, ISK
	'INR' | // Indian Rupee, INR*
	'IDR' | // Indonesian Rupiah, IDR
	'ILS' | // Israeli New Sheqel, ILS
	'JMD' | // Jamaican Dollar, JMD
	'USD' | // Japanese Yen, USD
	'KZT' | // Kazakhstani Tenge, KZT
	'KES' | // Kenyan Shilling, KES
	'KGS' | // Kyrgyzstani Som, KGS
	'LAK' | // Lao Kip, LAK*
	'LBP' | // Lebanese Pound, LBP
	'LSL' | // Lesotho Loti, LSL
	'LRD' | // Liberian Dollar, LRD
	'MOP' | // Macanese Pataca, MOP
	'MKD' | // Macedonian Denar, MKD
	'MGA' | // Malagasy Ariary, MGA
	'MWK' | // Malawian Kwacha, MWK
	'MYR' | // Malaysian Ringgit, MYR
	'MVR' | // Maldivian Rufiyaa, MVR
	'MRO' | // Mauritanian Ouguiya, MRO
	'MUR' | // Mauritian Rupee, MUR*
	'MXN' | // Mexican Peso, MXN*
	'MDL' | // Moldovan Leu, MDL
	'MNT' | // Mongolian Tögrög, MNT
	'MAD' | // Moroccan Dirham, MAD
	'MZN' | // Mozambican Metical, MZN
	'MMK' | // Myanmar Kyat, MMK
	'NAD' | // Namibian Dollar, NAD
	'NPR' | // Nepalese Rupee, NPR
	'ANG' | // Netherlands Antillean Gulden, ANG
	'TWD' | // New Taiwan Dollar, TWD
	'NZD' | // New Zealand Dollar, NZD
	'NIO' | // Nicaraguan Córdoba, NIO*
	'NGN' | // Nigerian Naira, NGN
	'NOK' | // Norwegian Krone, NOK
	'PKR' | // Pakistani Rupee, PKR
	'PAB' | // Panamanian Balboa, PAB*
	'PGK' | // Papua New Guinean Kina, PGK
	'PYG' | // Paraguayan Guaraní, PYG*
	'PEN' | // Peruvian Nuevo Sol, PEN*
	'PHP' | // Philippine Peso, PHP
	'PLN' | // Polish Złoty, PLN
	'QAR' | // Qatari Riyal, QAR
	'RON' | // Romanian Leu, RON
	'RUB' | // Russian Ruble, RUB
	'RWF' | // Rwandan Franc, RWF
	'STD' | // São Tomé and Príncipe Dobra, STD
	'SHP' | // Saint Helenian Pound, SHP*
	'SVC' | // Salvadoran Colón, SVC*
	'WST' | // Samoan Tala, WST
	'SAR' | // Saudi Riyal, SAR
	'RSD' | // Serbian Dinar, RSD
	'SCR' | // Seychellois Rupee, SCR
	'SLL' | // Sierra Leonean Leone, SLL
	'SGD' | // Singapore Dollar, SGD
	'SBD' | // Solomon Islands Dollar, SBD
	'SOS' | // Somali Shilling, SOS
	'ZAR' | // South African Rand, ZAR
	'KRW' | // South Korean Won, KRW
	'LKR' | // Sri Lankan Rupee, LKR
	'SRD' | // Surinamese Dollar, SRD*
	'SZL' | // Swazi Lilangeni, SZL
	'SEK' | // Swedish Krona, SEK
	'CHF' | // Swiss Franc, CHF
	'TJS' | // Tajikistani Somoni, TJS
	'TZS' | // Tanzanian Shilling, TZS
	'THB' | // Thai Baht, THB
	'TOP' | // Tongan Paʻanga, TOP
	'TTD' | // Trinidad and Tobago Dollar, TTD
	'TRY' | // Turkish Lira, TRY
	'UGX' | // Ugandan Shilling, UGX
	'UAH' | // Ukrainian Hryvnia, UAH
	'AED' | // United Arab Emirates Dirham, AED
	'USD' | // United States Dollar, USD
	'UYU' | // Uruguayan Peso, UYU*
	'UZS' | // Uzbekistani Som, UZS
	'VUV' | // Vanuatu Vatu, VUV
	'VND' | // Vietnamese Đồng, VND
	'XOF' | // West African Cfa Franc, XOF*
	'YER' | // Yemeni Rial, YER
	'ZMW'  // Zambian Kwacha, ZMW
