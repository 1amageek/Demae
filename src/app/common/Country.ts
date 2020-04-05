export type Country =
	'AF' | // Afghanistan
	'AX' | // Åland Islands
	'AL' | // Albania
	'DZ' | // Algeria
	'AS' | // American Samoa
	'AD' | // Andorra
	'AO' | // Angola
	'AI' | // Anguilla
	'AQ' | // Antarctica [a]
	'AG' | // Antigua and Barbuda
	'AR' | // Argentina
	'AM' | // Armenia
	'AW' | // Aruba
	'AU' | // Australia [b]
	'AT' | // Austria
	'AZ' | // Azerbaijan
	'BS' | // Bahamas
	'BH' | // Bahrain
	'BD' | // Bangladesh
	'BB' | // Barbados
	'BY' | // Belarus
	'BE' | // Belgium
	'BZ' | // Belize
	'BJ' | // Benin
	'BM' | // Bermuda
	'BT' | // Bhutan
	'BO' | // Bolivia (Plurinational State of)
	'BQ' | // Bonaire Sint Eustatius Saba
	'BA' | // Bosnia and Herzegovina
	'BW' | // Botswana
	'BV' | // Bouvet Island
	'BR' | // Brazil
	'IO' | // British Indian Ocean Territory
	'BN' | // Brunei Darussalam [e]
	'BG' | // Bulgaria
	'BF' | // Burkina Faso
	'BI' | // Burundi
	'CV' | // Cabo Verde [f]
	'KH' | // Cambodia
	'CM' | // Cameroon
	'CA' | // Canada
	'KY' | // Cayman Islands
	'CF' | // Central African Republic
	'TD' | // Chad
	'CL' | // Chile
	'CN' | // China
	'CX' | // Christmas Island
	'CC' | // Cocos (Keeling) Islands
	'CO' | // Colombia
	'KM' | // Comoros
	'CD' | // Congo (the Democratic Republic of the)
	'CG' | // Congo [g]
	'CK' | // Cook Islands
	'CR' | // Costa Rica
	'CI' | // Côte d'Ivoire [h]
	'HR' | // Croatia
	'CU' | // Cuba
	'CW' | // Curaçao
	'CY' | // Cyprus
	'CZ' | // Czechia [i]
	'DK' | // Denmark
	'DJ' | // Djibouti
	'DM' | // Dominica
	'DO' | // Dominican Republic
	'EC' | // Ecuador
	'EG' | // Egypt
	'SV' | // El Salvador
	'GQ' | // Equatorial Guinea
	'ER' | // Eritrea
	'EE' | // Estonia
	'SZ' | // Eswatini [j]
	'ET' | // Ethiopia
	'FK' | // Falkland Islands [Malvinas] [k]
	'FO' | // Faroe Islands
	'FJ' | // Fiji
	'FI' | // Finland
	'FR' | // France [l]
	'GF' | // French Guiana
	'PF' | // French Polynesia
	'TF' | // French Southern Territories [m]
	'GA' | // Gabon
	'GM' | // Gambia
	'GE' | // Georgia
	'DE' | // Germany
	'GH' | // Ghana
	'GI' | // Gibraltar
	'GR' | // Greece
	'GL' | // Greenland
	'GD' | // Grenada
	'GP' | // Guadeloupe
	'GU' | // Guam
	'GT' | // Guatemala
	'GG' | // Guernsey
	'GN' | // Guinea
	'GW' | // Guinea-Bissau
	'GY' | // Guyana
	'HT' | // Haiti
	'HM' | // Heard Island and McDonald Islands
	'VA' | // Holy See [n]
	'HN' | // Honduras
	'HK' | // Hong Kong
	'HU' | // Hungary
	'IS' | // Iceland
	'IN' | // India
	'ID' | // Indonesia
	'IR' | // Iran (Islamic Republic of)
	'IQ' | // Iraq
	'IE' | // Ireland
	'IM' | // Isle of Man
	'IL' | // Israel
	'IT' | // Italy
	'JM' | // Jamaica
	'JP' | // Japan
	'JE' | // Jersey
	'JO' | // Jordan
	'KZ' | // Kazakhstan
	'KE' | // Kenya
	'KI' | // Kiribati
	'KP' | // Korea (the Democratic People's Republic of) [o]
	'KR' | // Korea (the Republic of) [p]
	'KW' | // Kuwait
	'KG' | // Kyrgyzstan
	'LA' | // Lao People's Democratic Republic [q]
	'LV' | // Latvia
	'LB' | // Lebanon
	'LS' | // Lesotho
	'LR' | // Liberia
	'LY' | // Libya
	'LI' | // Liechtenstein
	'LT' | // Lithuania
	'LU' | // Luxembourg
	'MO' | // Macao [r]
	'MK' | // North Macedonia [s]
	'MG' | // Madagascar
	'MW' | // Malawi
	'MY' | // Malaysia
	'MV' | // Maldives
	'ML' | // Mali
	'MT' | // Malta
	'MH' | // Marshall Islands
	'MQ' | // Martinique
	'MR' | // Mauritania
	'MU' | // Mauritius
	'YT' | // Mayotte
	'MX' | // Mexico
	'FM' | // Micronesia (Federated States of)
	'MD' | // Moldova (the Republic of)
	'MC' | // Monaco
	'MN' | // Mongolia
	'ME' | // Montenegro
	'MS' | // Montserrat
	'MA' | // Morocco
	'MZ' | // Mozambique
	'MM' | // Myanmar [t]
	'NA' | // Namibia
	'NR' | // Nauru
	'NP' | // Nepal
	'NL' | // Netherlands
	'NC' | // New Caledonia
	'NZ' | // New Zealand
	'NI' | // Nicaragua
	'NE' | // Niger
	'NG' | // Nigeria
	'NU' | // Niue
	'NF' | // Norfolk Island
	'MP' | // Northern Mariana Islands
	'NO' | // Norway
	'OM' | // Oman
	'PK' | // Pakistan
	'PW' | // Palau
	'PS' | // Palestine, State of
	'PA' | // Panama
	'PG' | // Papua New Guinea
	'PY' | // Paraguay
	'PE' | // Peru
	'PH' | // Philippines
	'PN' | // Pitcairn [u]
	'PL' | // Poland
	'PT' | // Portugal
	'PR' | // Puerto Rico
	'QA' | // Qatar
	'RE' | // Réunion
	'RO' | // Romania
	'RU' | // Russian Federation [v]
	'RW' | // Rwanda
	'BL' | // Saint Barthélemy
	'SH' | // Saint Helena Ascension Island Tristan da Cunha
	'KN' | // Saint Kitts and Nevis
	'LC' | // Saint Lucia
	'MF' | // Saint Martin (French part)
	'PM' | // Saint Pierre and Miquelon
	'VC' | // Saint Vincent and the Grenadines
	'WS' | // Samoa
	'SM' | // San Marino
	'ST' | // Sao Tome and Principe
	'SA' | // Saudi Arabia
	'SN' | // Senegal
	'RS' | // Serbia
	'SC' | // Seychelles
	'SL' | // Sierra Leone
	'SG' | // Singapore
	'SX' | // Sint Maarten (Dutch part)
	'SK' | // Slovakia
	'SI' | // Slovenia
	'SB' | // Solomon Islands
	'SO' | // Somalia
	'ZA' | // South Africa
	'GS' | // South Georgia and the South Sandwich Islands
	'SS' | // South Sudan
	'ES' | // Spain
	'LK' | // Sri Lanka
	'SD' | // Sudan
	'SR' | // Suriname
	'SJ' | // Svalbard Jan Mayen
	'SE' | // Sweden
	'CH' | // Switzerland
	'SY' | // Syrian Arab Republic [x]
	'TW' | // Taiwan (Province of China) [y]
	'TJ' | // Tajikistan
	'TZ' | // Tanzania, the United Republic of
	'TH' | // Thailand
	'TL' | // Timor-Leste [aa]
	'TG' | // Togo
	'TK' | // Tokelau
	'TO' | // Tonga
	'TT' | // Trinidad and Tobago
	'TN' | // Tunisia
	'TR' | // Turkey
	'TM' | // Turkmenistan
	'TC' | // Turks and Caicos Islands
	'TV' | // Tuvalu
	'UG' | // Uganda
	'UA' | // Ukraine
	'AE' | // United Arab Emirates
	'GB' | // United Kingdom of Great Britain and Northern Ireland
	'UM' | // United States Minor Outlying Islands [ac]
	'US' | // United States of America
	'UY' | // Uruguay
	'UZ' | // Uzbekistan
	'VU' | // Vanuatu
	'VE' | // Venezuela (Bolivarian Republic of)
	'VN' | // Viet Nam [ae]
	'VG' | // Virgin Islands (British) [af]
	'VI' | // Virgin Islands (U.S.) [ag]
	'WF' | // Wallis and Futuna
	'EH' | // Western Sahara [ah]
	'YE' | // Yemen
	'ZM' | // Zambia
	'ZW'   // Zimbabwe

export const Countries = [
	{ value: 'AF', label: 'Afghanistan' },
	{ value: 'AX', label: 'Åland Islands' },
	{ value: 'AL', label: 'Albania' },
	{ value: 'DZ', label: 'Algeria' },
	{ value: 'AS', label: 'American Samoa' },
	{ value: 'AD', label: 'Andorra' },
	{ value: 'AO', label: 'Angola' },
	{ value: 'AI', label: 'Anguilla' },
	{ value: 'AQ', label: 'Antarctica' },
	{ value: 'AG', label: 'Antigua and Barbuda' },
	{ value: 'AR', label: 'Argentina' },
	{ value: 'AM', label: 'Armenia' },
	{ value: 'AW', label: 'Aruba' },
	{ value: 'AU', label: 'Australia' },
	{ value: 'AT', label: 'Austria' },
	{ value: 'AZ', label: 'Azerbaijan' },
	{ value: 'BS', label: 'Bahamas' },
	{ value: 'BH', label: 'Bahrain' },
	{ value: 'BD', label: 'Bangladesh' },
	{ value: 'BB', label: 'Barbados' },
	{ value: 'BY', label: 'Belarus' },
	{ value: 'BE', label: 'Belgium' },
	{ value: 'BZ', label: 'Belize' },
	{ value: 'BJ', label: 'Benin' },
	{ value: 'BM', label: 'Bermuda' },
	{ value: 'BT', label: 'Bhutan' },
	{ value: 'BO', label: 'Bolivia (Plurinational State of)' },
	{ value: 'BQ', label: 'Bonaire Sint Eustatius Saba' },
	{ value: 'BA', label: 'Bosnia and Herzegovina' },
	{ value: 'BW', label: 'Botswana' },
	{ value: 'BV', label: 'Bouvet Island' },
	{ value: 'BR', label: 'Brazil' },
	{ value: 'IO', label: 'British Indian Ocean Territory' },
	{ value: 'BN', label: 'Brunei Darussalam' },
	{ value: 'BG', label: 'Bulgaria' },
	{ value: 'BF', label: 'Burkina Faso' },
	{ value: 'BI', label: 'Burundi' },
	{ value: 'CV', label: 'Cabo Verde [f]' },
	{ value: 'KH', label: 'Cambodia' },
	{ value: 'CM', label: 'Cameroon' },
	{ value: 'CA', label: 'Canada' },
	{ value: 'KY', label: 'Cayman Islands' },
	{ value: 'CF', label: 'Central African Republic' },
	{ value: 'TD', label: 'Chad' },
	{ value: 'CL', label: 'Chile' },
	{ value: 'CN', label: 'China' },
	{ value: 'CX', label: 'Christmas Island' },
	{ value: 'CC', label: 'Cocos (Keeling) Islands' },
	{ value: 'CO', label: 'Colombia' },
	{ value: 'KM', label: 'Comoros' },
	{ value: 'CD', label: 'Congo (the Democratic Republic of the)' },
	{ value: 'CG', label: 'Congo [g]' },
	{ value: 'CK', label: 'Cook Islands' },
	{ value: 'CR', label: 'Costa Rica' },
	{ value: 'CI', label: 'Côte d\'Ivoire' },
	{ value: 'HR', label: 'Croatia' },
	{ value: 'CU', label: 'Cuba' },
	{ value: 'CW', label: 'Curaçao' },
	{ value: 'CY', label: 'Cyprus' },
	{ value: 'CZ', label: 'Czechia [i]' },
	{ value: 'DK', label: 'Denmark' },
	{ value: 'DJ', label: 'Djibouti' },
	{ value: 'DM', label: 'Dominica' },
	{ value: 'DO', label: 'Dominican Republic' },
	{ value: 'EC', label: 'Ecuador' },
	{ value: 'EG', label: 'Egypt' },
	{ value: 'SV', label: 'El Salvador' },
	{ value: 'GQ', label: 'Equatorial Guinea' },
	{ value: 'ER', label: 'Eritrea' },
	{ value: 'EE', label: 'Estonia' },
	{ value: 'SZ', label: 'Eswatini [j]' },
	{ value: 'ET', label: 'Ethiopia' },
	{ value: 'FK', label: 'Falkland Islands [Malvinas]' },
	{ value: 'FO', label: 'Faroe Islands' },
	{ value: 'FJ', label: 'Fiji' },
	{ value: 'FI', label: 'Finland' },
	{ value: 'FR', label: 'France [l]' },
	{ value: 'GF', label: 'French Guiana' },
	{ value: 'PF', label: 'French Polynesia' },
	{ value: 'TF', label: 'French Southern Territories' },
	{ value: 'GA', label: 'Gabon' },
	{ value: 'GM', label: 'Gambia' },
	{ value: 'GE', label: 'Georgia' },
	{ value: 'DE', label: 'Germany' },
	{ value: 'GH', label: 'Ghana' },
	{ value: 'GI', label: 'Gibraltar' },
	{ value: 'GR', label: 'Greece' },
	{ value: 'GL', label: 'Greenland' },
	{ value: 'GD', label: 'Grenada' },
	{ value: 'GP', label: 'Guadeloupe' },
	{ value: 'GU', label: 'Guam' },
	{ value: 'GT', label: 'Guatemala' },
	{ value: 'GG', label: 'Guernsey' },
	{ value: 'GN', label: 'Guinea' },
	{ value: 'GW', label: 'Guinea-Bissau' },
	{ value: 'GY', label: 'Guyana' },
	{ value: 'HT', label: 'Haiti' },
	{ value: 'HM', label: 'Heard Island and McDonald Islands' },
	{ value: 'VA', label: 'Holy See [n]' },
	{ value: 'HN', label: 'Honduras' },
	{ value: 'HK', label: 'Hong Kong' },
	{ value: 'HU', label: 'Hungary' },
	{ value: 'IS', label: 'Iceland' },
	{ value: 'IN', label: 'India' },
	{ value: 'ID', label: 'Indonesia' },
	{ value: 'IR', label: 'Iran (Islamic Republic of)' },
	{ value: 'IQ', label: 'Iraq' },
	{ value: 'IE', label: 'Ireland' },
	{ value: 'IM', label: 'Isle of Man' },
	{ value: 'IL', label: 'Israel' },
	{ value: 'IT', label: 'Italy' },
	{ value: 'JM', label: 'Jamaica' },
	{ value: 'JP', label: 'Japan' },
	{ value: 'JE', label: 'Jersey' },
	{ value: 'JO', label: 'Jordan' },
	{ value: 'KZ', label: 'Kazakhstan' },
	{ value: 'KE', label: 'Kenya' },
	{ value: 'KI', label: 'Kiribati' },
	{ value: 'KP', label: 'Korea (the Democratic People\'s Republic of)' },
	{ value: 'KR', label: 'Korea (the Republic of) [p]' },
	{ value: 'KW', label: 'Kuwait' },
	{ value: 'KG', label: 'Kyrgyzstan' },
	{ value: 'LA', label: 'Lao People\'s Democratic Republic(the)' },
	{ value: 'LV', label: 'Latvia' },
	{ value: 'LB', label: 'Lebanon' },
	{ value: 'LS', label: 'Lesotho' },
	{ value: 'LR', label: 'Liberia' },
	{ value: 'LY', label: 'Libya' },
	{ value: 'LI', label: 'Liechtenstein' },
	{ value: 'LT', label: 'Lithuania' },
	{ value: 'LU', label: 'Luxembourg' },
	{ value: 'MO', label: 'Macao [r]' },
	{ value: 'MK', label: 'North Macedonia' },
	{ value: 'MG', label: 'Madagascar' },
	{ value: 'MW', label: 'Malawi' },
	{ value: 'MY', label: 'Malaysia' },
	{ value: 'MV', label: 'Maldives' },
	{ value: 'ML', label: 'Mali' },
	{ value: 'MT', label: 'Malta' },
	{ value: 'MH', label: 'Marshall Islands' },
	{ value: 'MQ', label: 'Martinique' },
	{ value: 'MR', label: 'Mauritania' },
	{ value: 'MU', label: 'Mauritius' },
	{ value: 'YT', label: 'Mayotte' },
	{ value: 'MX', label: 'Mexico' },
	{ value: 'FM', label: 'Micronesia (Federated States of)' },
	{ value: 'MD', label: 'Moldova (the Republic of)' },
	{ value: 'MC', label: 'Monaco' },
	{ value: 'MN', label: 'Mongolia' },
	{ value: 'ME', label: 'Montenegro' },
	{ value: 'MS', label: 'Montserrat' },
	{ value: 'MA', label: 'Morocco' },
	{ value: 'MZ', label: 'Mozambique' },
	{ value: 'MM', label: 'Myanmar [t]' },
	{ value: 'NA', label: 'Namibia' },
	{ value: 'NR', label: 'Nauru' },
	{ value: 'NP', label: 'Nepal' },
	{ value: 'NL', label: 'Netherlands' },
	{ value: 'NC', label: 'New Caledonia' },
	{ value: 'NZ', label: 'New Zealand' },
	{ value: 'NI', label: 'Nicaragua' },
	{ value: 'NE', label: 'Niger' },
	{ value: 'NG', label: 'Nigeria' },
	{ value: 'NU', label: 'Niue' },
	{ value: 'NF', label: 'Norfolk Island' },
	{ value: 'MP', label: 'Northern Mariana Islands' },
	{ value: 'NO', label: 'Norway' },
	{ value: 'OM', label: 'Oman' },
	{ value: 'PK', label: 'Pakistan' },
	{ value: 'PW', label: 'Palau' },
	{ value: 'PS', label: 'Palestine, State of' },
	{ value: 'PA', label: 'Panama' },
	{ value: 'PG', label: 'Papua New Guinea' },
	{ value: 'PY', label: 'Paraguay' },
	{ value: 'PE', label: 'Peru' },
	{ value: 'PH', label: 'Philippines' },
	{ value: 'PN', label: 'Pitcairn [u]' },
	{ value: 'PL', label: 'Poland' },
	{ value: 'PT', label: 'Portugal' },
	{ value: 'PR', label: 'Puerto Rico' },
	{ value: 'QA', label: 'Qatar' },
	{ value: 'RE', label: 'Réunion' },
	{ value: 'RO', label: 'Romania' },
	{ value: 'RU', label: 'Russian Federation' },
	{ value: 'RW', label: 'Rwanda' },
	{ value: 'BL', label: 'Saint Barthélemy' },
	{ value: 'SH', label: 'Saint Helena Ascension Island Tristan da Cunha' },
	{ value: 'KN', label: 'Saint Kitts and Nevis' },
	{ value: 'LC', label: 'Saint Lucia' },
	{ value: 'MF', label: 'Saint Martin (French part)' },
	{ value: 'PM', label: 'Saint Pierre and Miquelon' },
	{ value: 'VC', label: 'Saint Vincent and the Grenadines' },
	{ value: 'WS', label: 'Samoa' },
	{ value: 'SM', label: 'San Marino' },
	{ value: 'ST', label: 'Sao Tome and Principe' },
	{ value: 'SA', label: 'Saudi Arabia' },
	{ value: 'SN', label: 'Senegal' },
	{ value: 'RS', label: 'Serbia' },
	{ value: 'SC', label: 'Seychelles' },
	{ value: 'SL', label: 'Sierra Leone' },
	{ value: 'SG', label: 'Singapore' },
	{ value: 'SX', label: 'Sint Maarten (Dutch part)' },
	{ value: 'SK', label: 'Slovakia' },
	{ value: 'SI', label: 'Slovenia' },
	{ value: 'SB', label: 'Solomon Islands' },
	{ value: 'SO', label: 'Somalia' },
	{ value: 'ZA', label: 'South Africa' },
	{ value: 'GS', label: 'South Georgia and the South Sandwich Islands' },
	{ value: 'SS', label: 'South Sudan' },
	{ value: 'ES', label: 'Spain' },
	{ value: 'LK', label: 'Sri Lanka' },
	{ value: 'SD', label: 'Sudan' },
	{ value: 'SR', label: 'Suriname' },
	{ value: 'SJ', label: 'Svalbard Jan Mayen' },
	{ value: 'SE', label: 'Sweden' },
	{ value: 'CH', label: 'Switzerland' },
	{ value: 'SY', label: 'Syrian Arab Republic' },
	{ value: 'TW', label: 'Taiwan (Province of China)' },
	{ value: 'TJ', label: 'Tajikistan' },
	{ value: 'TZ', label: 'Tanzania, the United Republic of' },
	{ value: 'TH', label: 'Thailand' },
	{ value: 'TL', label: 'Timor-Leste' },
	{ value: 'TG', label: 'Togo' },
	{ value: 'TK', label: 'Tokelau' },
	{ value: 'TO', label: 'Tonga' },
	{ value: 'TT', label: 'Trinidad and Tobago' },
	{ value: 'TN', label: 'Tunisia' },
	{ value: 'TR', label: 'Turkey' },
	{ value: 'TM', label: 'Turkmenistan' },
	{ value: 'TC', label: 'Turks and Caicos Islands' },
	{ value: 'TV', label: 'Tuvalu' },
	{ value: 'UG', label: 'Uganda' },
	{ value: 'UA', label: 'Ukraine' },
	{ value: 'AE', label: 'United Arab Emirates' },
	{ value: 'GB', label: 'United Kingdom of Great Britain and Northern Ireland' },
	{ value: 'UM', label: 'United States Minor Outlying Islands' },
	{ value: 'US', label: 'United States of America' },
	{ value: 'UY', label: 'Uruguay' },
	{ value: 'UZ', label: 'Uzbekistan' },
	{ value: 'VU', label: 'Vanuatu' },
	{ value: 'VE', label: 'Venezuela (Bolivarian Republic of)' },
	{ value: 'VN', label: 'Viet Nam [ae]' },
	{ value: 'VG', label: 'Virgin Islands (British)' },
	{ value: 'VI', label: 'Virgin Islands (U.S.)' },
	{ value: 'WF', label: 'Wallis and Futuna' },
	{ value: 'EH', label: 'Western Sahara' },
	{ value: 'YE', label: 'Yemen' },
	{ value: 'ZM', label: 'Zambia' },
	{ value: 'ZW', label: 'Zimbabwe' }
]
