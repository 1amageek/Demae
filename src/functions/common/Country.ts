import Spec from ".//ISO3166"

export type CountryCode =
	"AF" | // Afghanistan
	"AX" | // Åland Islands
	"AL" | // Albania
	"DZ" | // Algeria
	"AS" | // American Samoa
	"AD" | // Andorra
	"AO" | // Angola
	"AI" | // Anguilla
	"AQ" | // Antarctica [a]
	"AG" | // Antigua and Barbuda
	"AR" | // Argentina
	"AM" | // Armenia
	"AW" | // Aruba
	"AU" | // Australia [b]
	"AT" | // Austria
	"AZ" | // Azerbaijan
	"BS" | // Bahamas
	"BH" | // Bahrain
	"BD" | // Bangladesh
	"BB" | // Barbados
	"BY" | // Belarus
	"BE" | // Belgium
	"BZ" | // Belize
	"BJ" | // Benin
	"BM" | // Bermuda
	"BT" | // Bhutan
	"BO" | // Bolivia (Plurinational State of)
	"BQ" | // Bonaire Sint Eustatius Saba
	"BA" | // Bosnia and Herzegovina
	"BW" | // Botswana
	"BV" | // Bouvet Island
	"BR" | // Brazil
	"IO" | // British Indian Ocean Territory
	"BN" | // Brunei Darussalam [e]
	"BG" | // Bulgaria
	"BF" | // Burkina Faso
	"BI" | // Burundi
	"CV" | // Cabo Verde [f]
	"KH" | // Cambodia
	"CM" | // Cameroon
	"CA" | // Canada
	"KY" | // Cayman Islands
	"CF" | // Central African Republic
	"TD" | // Chad
	"CL" | // Chile
	"CN" | // China
	"CX" | // Christmas Island
	"CC" | // Cocos (Keeling) Islands
	"CO" | // Colombia
	"KM" | // Comoros
	"CD" | // Congo (the Democratic Republic of the)
	"CG" | // Congo [g]
	"CK" | // Cook Islands
	"CR" | // Costa Rica
	"CI" | // Côte d"Ivoire [h]
	"HR" | // Croatia
	"CU" | // Cuba
	"CW" | // Curaçao
	"CY" | // Cyprus
	"CZ" | // Czechia [i]
	"DK" | // Denmark
	"DJ" | // Djibouti
	"DM" | // Dominica
	"DO" | // Dominican Republic
	"EC" | // Ecuador
	"EG" | // Egypt
	"SV" | // El Salvador
	"GQ" | // Equatorial Guinea
	"ER" | // Eritrea
	"EE" | // Estonia
	"SZ" | // Eswatini [j]
	"ET" | // Ethiopia
	"FK" | // Falkland Islands [Malvinas] [k]
	"FO" | // Faroe Islands
	"FJ" | // Fiji
	"FI" | // Finland
	"FR" | // France [l]
	"GF" | // French Guiana
	"PF" | // French Polynesia
	"TF" | // French Southern Territories [m]
	"GA" | // Gabon
	"GM" | // Gambia
	"GE" | // Georgia
	"DE" | // Germany
	"GH" | // Ghana
	"GI" | // Gibraltar
	"GR" | // Greece
	"GL" | // Greenland
	"GD" | // Grenada
	"GP" | // Guadeloupe
	"GU" | // Guam
	"GT" | // Guatemala
	"GG" | // Guernsey
	"GN" | // Guinea
	"GW" | // Guinea-Bissau
	"GY" | // Guyana
	"HT" | // Haiti
	"HM" | // Heard Island and McDonald Islands
	"VA" | // Holy See [n]
	"HN" | // Honduras
	"HK" | // Hong Kong
	"HU" | // Hungary
	"IS" | // Iceland
	"IN" | // India
	"ID" | // Indonesia
	"IR" | // Iran (Islamic Republic of)
	"IQ" | // Iraq
	"IE" | // Ireland
	"IM" | // Isle of Man
	"IL" | // Israel
	"IT" | // Italy
	"JM" | // Jamaica
	"JP" | // Japan
	"JE" | // Jersey
	"JO" | // Jordan
	"KZ" | // Kazakhstan
	"KE" | // Kenya
	"KI" | // Kiribati
	"KP" | // Korea (the Democratic People"s Republic of) [o]
	"KR" | // Korea (the Republic of) [p]
	"KW" | // Kuwait
	"KG" | // Kyrgyzstan
	"LA" | // Lao People"s Democratic Republic [q]
	"LV" | // Latvia
	"LB" | // Lebanon
	"LS" | // Lesotho
	"LR" | // Liberia
	"LY" | // Libya
	"LI" | // Liechtenstein
	"LT" | // Lithuania
	"LU" | // Luxembourg
	"MO" | // Macao [r]
	"MK" | // North Macedonia [s]
	"MG" | // Madagascar
	"MW" | // Malawi
	"MY" | // Malaysia
	"MV" | // Maldives
	"ML" | // Mali
	"MT" | // Malta
	"MH" | // Marshall Islands
	"MQ" | // Martinique
	"MR" | // Mauritania
	"MU" | // Mauritius
	"YT" | // Mayotte
	"MX" | // Mexico
	"FM" | // Micronesia (Federated States of)
	"MD" | // Moldova (the Republic of)
	"MC" | // Monaco
	"MN" | // Mongolia
	"ME" | // Montenegro
	"MS" | // Montserrat
	"MA" | // Morocco
	"MZ" | // Mozambique
	"MM" | // Myanmar [t]
	"NA" | // Namibia
	"NR" | // Nauru
	"NP" | // Nepal
	"NL" | // Netherlands
	"NC" | // New Caledonia
	"NZ" | // New Zealand
	"NI" | // Nicaragua
	"NE" | // Niger
	"NG" | // Nigeria
	"NU" | // Niue
	"NF" | // Norfolk Island
	"MP" | // Northern Mariana Islands
	"NO" | // Norway
	"OM" | // Oman
	"PK" | // Pakistan
	"PW" | // Palau
	"PS" | // Palestine, State of
	"PA" | // Panama
	"PG" | // Papua New Guinea
	"PY" | // Paraguay
	"PE" | // Peru
	"PH" | // Philippines
	"PN" | // Pitcairn [u]
	"PL" | // Poland
	"PT" | // Portugal
	"PR" | // Puerto Rico
	"QA" | // Qatar
	"RE" | // Réunion
	"RO" | // Romania
	"RU" | // Russian Federation [v]
	"RW" | // Rwanda
	"BL" | // Saint Barthélemy
	"SH" | // Saint Helena Ascension Island Tristan da Cunha
	"KN" | // Saint Kitts and Nevis
	"LC" | // Saint Lucia
	"MF" | // Saint Martin (French part)
	"PM" | // Saint Pierre and Miquelon
	"VC" | // Saint Vincent and the Grenadines
	"WS" | // Samoa
	"SM" | // San Marino
	"ST" | // Sao Tome and Principe
	"SA" | // Saudi Arabia
	"SN" | // Senegal
	"RS" | // Serbia
	"SC" | // Seychelles
	"SL" | // Sierra Leone
	"SG" | // Singapore
	"SX" | // Sint Maarten (Dutch part)
	"SK" | // Slovakia
	"SI" | // Slovenia
	"SB" | // Solomon Islands
	"SO" | // Somalia
	"ZA" | // South Africa
	"GS" | // South Georgia and the South Sandwich Islands
	"SS" | // South Sudan
	"ES" | // Spain
	"LK" | // Sri Lanka
	"SD" | // Sudan
	"SR" | // Suriname
	"SJ" | // Svalbard Jan Mayen
	"SE" | // Sweden
	"CH" | // Switzerland
	"SY" | // Syrian Arab Republic [x]
	"TW" | // Taiwan (Province of China) [y]
	"TJ" | // Tajikistan
	"TZ" | // Tanzania, the United Republic of
	"TH" | // Thailand
	"TL" | // Timor-Leste [aa]
	"TG" | // Togo
	"TK" | // Tokelau
	"TO" | // Tonga
	"TT" | // Trinidad and Tobago
	"TN" | // Tunisia
	"TR" | // Turkey
	"TM" | // Turkmenistan
	"TC" | // Turks and Caicos Islands
	"TV" | // Tuvalu
	"UG" | // Uganda
	"UA" | // Ukraine
	"AE" | // United Arab Emirates
	"GB" | // United Kingdom of Great Britain and Northern Ireland
	"UM" | // United States Minor Outlying Islands [ac]
	"US" | // United States of America
	"UY" | // Uruguay
	"UZ" | // Uzbekistan
	"VU" | // Vanuatu
	"VE" | // Venezuela (Bolivarian Republic of)
	"VN" | // Viet Nam [ae]
	"VG" | // Virgin Islands (British) [af]
	"VI" | // Virgin Islands (U.S.) [ag]
	"WF" | // Wallis and Futuna
	"EH" | // Western Sahara [ah]
	"YE" | // Yemen
	"ZM" | // Zambia
	"ZW"   // Zimbabwe

type CountrySpec = {
	alpha2: CountryCode,
	alpha3: string,
	number: string,
	name: string,
}


export const SupportedCounryCodes: CountryCode[] = ["US", "JP"]

export const SupportedCountries = Spec.filter(spec => SupportedCounryCodes.includes(spec.alpha2 as CountryCode)) as CountrySpec[]
