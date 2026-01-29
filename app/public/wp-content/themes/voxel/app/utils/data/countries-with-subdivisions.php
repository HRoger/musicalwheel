<?php

namespace Voxel\Utils\Data;

if ( ! defined('ABSPATH') ) {
	exit;
}

class Countries_With_Subdivisions {

	public static function all() {
		$list = [
			'AD' => [
				'code3' => 'AND',
				'name' => __( 'Andorra', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [
					'07' => [
						'name' => __( 'Andorra la Vella', 'voxel-countries' ),
					],
					'02' => [
						'name' => __( 'Canillo', 'voxel-countries' ),
					],
					'03' => [
						'name' => __( 'Encamp', 'voxel-countries' ),
					],
					'08' => [
						'name' => __( 'Escaldes-Engordany', 'voxel-countries' ),
					],
					'04' => [
						'name' => __( 'La Massana', 'voxel-countries' ),
					],
					'05' => [
						'name' => __( 'Ordino', 'voxel-countries' ),
					],
					'06' => [
						'name' => __( 'Sant Julià de Lòria', 'voxel-countries' ),
					],
				]
			],
			'AE' => [
				'code3' => 'ARE',
				'name' => __( 'United Arab Emirates', 'voxel-countries' ),
				'continent' => 'Asia',
				'states' => [
					'AJ' => [
						'name' => __( '\'Ajmān', 'voxel-countries' ),
					],
					'AZ' => [
						'name' => __( 'Abū Z̧aby', 'voxel-countries' ),
					],
					'FU' => [
						'name' => __( 'Al Fujayrah', 'voxel-countries' ),
					],
					'SH' => [
						'name' => __( 'Ash Shāriqah', 'voxel-countries' ),
					],
					'DU' => [
						'name' => __( 'Dubayy', 'voxel-countries' ),
					],
					'RK' => [
						'name' => __( 'Ra\'s al Khaymah', 'voxel-countries' ),
					],
					'UQ' => [
						'name' => __( 'Umm al Qaywayn', 'voxel-countries' ),
					],
				]
			],
			'AF' => [
				'code3' => 'AFG',
				'name' => __( 'Afghanistan', 'voxel-countries' ),
				'continent' => 'Asia',
				'states' => [
					'BDS' => [
						'name' => __( 'Badakhshān', 'voxel-countries' ),
					],
					'BGL' => [
						'name' => __( 'Baghlān', 'voxel-countries' ),
					],
					'BAL' => [
						'name' => __( 'Balkh', 'voxel-countries' ),
					],
					'BDG' => [
						'name' => __( 'Bādghīs', 'voxel-countries' ),
					],
					'BAM' => [
						'name' => __( 'Bāmyān', 'voxel-countries' ),
					],
					'DAY' => [
						'name' => __( 'Dāykundī', 'voxel-countries' ),
					],
					'FRA' => [
						'name' => __( 'Farāh', 'voxel-countries' ),
					],
					'FYB' => [
						'name' => __( 'Fāryāb', 'voxel-countries' ),
					],
					'GHA' => [
						'name' => __( 'Ghaznī', 'voxel-countries' ),
					],
					'GHO' => [
						'name' => __( 'Ghōr', 'voxel-countries' ),
					],
					'HEL' => [
						'name' => __( 'Helmand', 'voxel-countries' ),
					],
					'HER' => [
						'name' => __( 'Herāt', 'voxel-countries' ),
					],
					'JOW' => [
						'name' => __( 'Jowzjān', 'voxel-countries' ),
					],
					'KAN' => [
						'name' => __( 'Kandahār', 'voxel-countries' ),
					],
					'KHO' => [
						'name' => __( 'Khōst', 'voxel-countries' ),
					],
					'KNR' => [
						'name' => __( 'Kunar', 'voxel-countries' ),
					],
					'KDZ' => [
						'name' => __( 'Kunduz', 'voxel-countries' ),
					],
					'KAB' => [
						'name' => __( 'Kābul', 'voxel-countries' ),
					],
					'KAP' => [
						'name' => __( 'Kāpīsā', 'voxel-countries' ),
					],
					'LAG' => [
						'name' => __( 'Laghmān', 'voxel-countries' ),
					],
					'LOG' => [
						'name' => __( 'Lōgar', 'voxel-countries' ),
					],
					'NAN' => [
						'name' => __( 'Nangarhār', 'voxel-countries' ),
					],
					'NIM' => [
						'name' => __( 'Nīmrōz', 'voxel-countries' ),
					],
					'NUR' => [
						'name' => __( 'Nūristān', 'voxel-countries' ),
					],
					'PIA' => [
						'name' => __( 'Paktiyā', 'voxel-countries' ),
					],
					'PKA' => [
						'name' => __( 'Paktīkā', 'voxel-countries' ),
					],
					'PAN' => [
						'name' => __( 'Panjshayr', 'voxel-countries' ),
					],
					'PAR' => [
						'name' => __( 'Parwān', 'voxel-countries' ),
					],
					'SAM' => [
						'name' => __( 'Samangān', 'voxel-countries' ),
					],
					'SAR' => [
						'name' => __( 'Sar-e Pul', 'voxel-countries' ),
					],
					'TAK' => [
						'name' => __( 'Takhār', 'voxel-countries' ),
					],
					'URU' => [
						'name' => __( 'Uruzgān', 'voxel-countries' ),
					],
					'WAR' => [
						'name' => __( 'Wardak', 'voxel-countries' ),
					],
					'ZAB' => [
						'name' => __( 'Zābul', 'voxel-countries' ),
					],
				]
			],
			'AG' => [
				'code3' => 'ATG',
				'name' => __( 'Antigua and Barbuda', 'voxel-countries' ),
				'continent' => 'North America',
				'states' => [
					'10' => [
						'name' => __( 'Barbuda', 'voxel-countries' ),
					],
					'11' => [
						'name' => __( 'Redonda', 'voxel-countries' ),
					],
					'03' => [
						'name' => __( 'Saint George', 'voxel-countries' ),
					],
					'04' => [
						'name' => __( 'Saint John', 'voxel-countries' ),
					],
					'05' => [
						'name' => __( 'Saint Mary', 'voxel-countries' ),
					],
					'06' => [
						'name' => __( 'Saint Paul', 'voxel-countries' ),
					],
					'07' => [
						'name' => __( 'Saint Peter', 'voxel-countries' ),
					],
					'08' => [
						'name' => __( 'Saint Philip', 'voxel-countries' ),
					],
				]
			],
			'AI' => [
				'code3' => 'AIA',
				'name' => __( 'Anguilla', 'voxel-countries' ),
				'continent' => 'North America',
				'states' => [],
			],
			'AL' => [
				'code3' => 'ALB',
				'name' => __( 'Albania', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [
					'01' => [
						'name' => __( 'Berat', 'voxel-countries' ),
					],
					'09' => [
						'name' => __( 'Dibër', 'voxel-countries' ),
					],
					'02' => [
						'name' => __( 'Durrës', 'voxel-countries' ),
					],
					'03' => [
						'name' => __( 'Elbasan', 'voxel-countries' ),
					],
					'04' => [
						'name' => __( 'Fier', 'voxel-countries' ),
					],
					'05' => [
						'name' => __( 'Gjirokastër', 'voxel-countries' ),
					],
					'06' => [
						'name' => __( 'Korçë', 'voxel-countries' ),
					],
					'07' => [
						'name' => __( 'Kukës', 'voxel-countries' ),
					],
					'08' => [
						'name' => __( 'Lezhë', 'voxel-countries' ),
					],
					'10' => [
						'name' => __( 'Shkodër', 'voxel-countries' ),
					],
					'11' => [
						'name' => __( 'Tiranë', 'voxel-countries' ),
					],
					'12' => [
						'name' => __( 'Vlorë', 'voxel-countries' ),
					],
				]
			],
			'AM' => [
				'code3' => 'ARM',
				'name' => __( 'Armenia', 'voxel-countries' ),
				'continent' => 'Asia',
				'states' => [
					'AG' => [
						'name' => __( 'Aragac̣otn', 'voxel-countries' ),
					],
					'AR' => [
						'name' => __( 'Ararat', 'voxel-countries' ),
					],
					'AV' => [
						'name' => __( 'Armavir', 'voxel-countries' ),
					],
					'ER' => [
						'name' => __( 'Erevan', 'voxel-countries' ),
					],
					'GR' => [
						'name' => __( 'Geġark\'unik\'', 'voxel-countries' ),
					],
					'KT' => [
						'name' => __( 'Kotayk\'', 'voxel-countries' ),
					],
					'LO' => [
						'name' => __( 'Loṙi', 'voxel-countries' ),
					],
					'SU' => [
						'name' => __( 'Syunik\'', 'voxel-countries' ),
					],
					'TV' => [
						'name' => __( 'Tavuš', 'voxel-countries' ),
					],
					'VD' => [
						'name' => __( 'Vayoć Jor', 'voxel-countries' ),
					],
					'SH' => [
						'name' => __( 'Širak', 'voxel-countries' ),
					],
				]
			],
			'AO' => [
				'code3' => 'AGO',
				'name' => __( 'Angola', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'BGO' => [
						'name' => __( 'Bengo', 'voxel-countries' ),
					],
					'BGU' => [
						'name' => __( 'Benguela', 'voxel-countries' ),
					],
					'BIE' => [
						'name' => __( 'Bié', 'voxel-countries' ),
					],
					'CAB' => [
						'name' => __( 'Cabinda', 'voxel-countries' ),
					],
					'CNN' => [
						'name' => __( 'Cunene', 'voxel-countries' ),
					],
					'HUA' => [
						'name' => __( 'Huambo', 'voxel-countries' ),
					],
					'HUI' => [
						'name' => __( 'Huíla', 'voxel-countries' ),
					],
					'CCU' => [
						'name' => __( 'Kuando Kubango', 'voxel-countries' ),
					],
					'CNO' => [
						'name' => __( 'Kwanza Norte', 'voxel-countries' ),
					],
					'CUS' => [
						'name' => __( 'Kwanza Sul', 'voxel-countries' ),
					],
					'LUA' => [
						'name' => __( 'Luanda', 'voxel-countries' ),
					],
					'LNO' => [
						'name' => __( 'Lunda Norte', 'voxel-countries' ),
					],
					'LSU' => [
						'name' => __( 'Lunda Sul', 'voxel-countries' ),
					],
					'MAL' => [
						'name' => __( 'Malange', 'voxel-countries' ),
					],
					'MOX' => [
						'name' => __( 'Moxico', 'voxel-countries' ),
					],
					'NAM' => [
						'name' => __( 'Namibe', 'voxel-countries' ),
					],
					'UIG' => [
						'name' => __( 'Uíge', 'voxel-countries' ),
					],
					'ZAI' => [
						'name' => __( 'Zaire', 'voxel-countries' ),
					],
				]
			],
			'AQ' => [
				'code3' => 'ATA',
				'name' => __( 'Antarctica', 'voxel-countries' ),
				'continent' => 'Antarctica',
				'states' => [],
			],
			'AR' => [
				'code3' => 'ARG',
				'name' => __( 'Argentina', 'voxel-countries' ),
				'continent' => 'South America',
				'states' => [
					'B' => [
						'name' => __( 'Buenos Aires', 'voxel-countries' ),
					],
					'K' => [
						'name' => __( 'Catamarca', 'voxel-countries' ),
					],
					'H' => [
						'name' => __( 'Chaco', 'voxel-countries' ),
					],
					'U' => [
						'name' => __( 'Chubut', 'voxel-countries' ),
					],
					'C' => [
						'name' => __( 'Ciudad Autónoma de Buenos Aires', 'voxel-countries' ),
					],
					'W' => [
						'name' => __( 'Corrientes', 'voxel-countries' ),
					],
					'X' => [
						'name' => __( 'Córdoba', 'voxel-countries' ),
					],
					'E' => [
						'name' => __( 'Entre Ríos', 'voxel-countries' ),
					],
					'P' => [
						'name' => __( 'Formosa', 'voxel-countries' ),
					],
					'Y' => [
						'name' => __( 'Jujuy', 'voxel-countries' ),
					],
					'L' => [
						'name' => __( 'La Pampa', 'voxel-countries' ),
					],
					'F' => [
						'name' => __( 'La Rioja', 'voxel-countries' ),
					],
					'M' => [
						'name' => __( 'Mendoza', 'voxel-countries' ),
					],
					'N' => [
						'name' => __( 'Misiones', 'voxel-countries' ),
					],
					'Q' => [
						'name' => __( 'Neuquén', 'voxel-countries' ),
					],
					'R' => [
						'name' => __( 'Río Negro', 'voxel-countries' ),
					],
					'A' => [
						'name' => __( 'Salta', 'voxel-countries' ),
					],
					'J' => [
						'name' => __( 'San Juan', 'voxel-countries' ),
					],
					'D' => [
						'name' => __( 'San Luis', 'voxel-countries' ),
					],
					'Z' => [
						'name' => __( 'Santa Cruz', 'voxel-countries' ),
					],
					'S' => [
						'name' => __( 'Santa Fe', 'voxel-countries' ),
					],
					'G' => [
						'name' => __( 'Santiago del Estero', 'voxel-countries' ),
					],
					'V' => [
						'name' => __( 'Tierra del Fuego', 'voxel-countries' ),
					],
					'T' => [
						'name' => __( 'Tucumán', 'voxel-countries' ),
					],
				]
			],
			'AS' => [
				'code3' => 'ASM',
				'name' => __( 'American Samoa', 'voxel-countries' ),
				'continent' => 'Oceania',
				'states' => [],
			],
			'AT' => [
				'code3' => 'AUT',
				'name' => __( 'Austria', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [
					'B' => [
						'name' => __( 'Burgenland', 'voxel-countries' ),
					],
					'K' => [
						'name' => __( 'Kärnten', 'voxel-countries' ),
					],
					'NÖ' => [
						'name' => __( 'Niederösterreich', 'voxel-countries' ),
					],
					'OÖ' => [
						'name' => __( 'Oberösterreich', 'voxel-countries' ),
					],
					'S' => [
						'name' => __( 'Salzburg', 'voxel-countries' ),
					],
					'ST' => [
						'name' => __( 'Steiermark', 'voxel-countries' ),
					],
					'T' => [
						'name' => __( 'Tirol', 'voxel-countries' ),
					],
					'V' => [
						'name' => __( 'Vorarlberg', 'voxel-countries' ),
					],
					'W' => [
						'name' => __( 'Wien', 'voxel-countries' ),
					],
				]
			],
			'AU' => [
				'code3' => 'AUS',
				'name' => __( 'Australia', 'voxel-countries' ),
				'continent' => 'Oceania',
				'states' => [
					'ACT' => [
						'name' => __( 'Australian Capital Territory', 'voxel-countries' ),
					],
					'NSW' => [
						'name' => __( 'New South Wales', 'voxel-countries' ),
					],
					'NT' => [
						'name' => __( 'Northern Territory', 'voxel-countries' ),
					],
					'QLD' => [
						'name' => __( 'Queensland', 'voxel-countries' ),
					],
					'SA' => [
						'name' => __( 'South Australia', 'voxel-countries' ),
					],
					'TAS' => [
						'name' => __( 'Tasmania', 'voxel-countries' ),
					],
					'VIC' => [
						'name' => __( 'Victoria', 'voxel-countries' ),
					],
					'WA' => [
						'name' => __( 'Western Australia', 'voxel-countries' ),
					],
				]
			],
			'AW' => [
				'code3' => 'ABW',
				'name' => __( 'Aruba', 'voxel-countries' ),
				'continent' => 'North America',
				'states' => [],
			],
			'AX' => [
				'code3' => 'ALA',
				'name' => __( 'Åland Islands', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [],
			],
			'AZ' => [
				'code3' => 'AZE',
				'name' => __( 'Azerbaijan', 'voxel-countries' ),
				'continent' => 'Asia',
				'states' => [
					'NX' => [
						'name' => __( 'Naxçıvan', 'voxel-countries' ),
					],
				]
			],
			'BA' => [
				'code3' => 'BIH',
				'name' => __( 'Bosnia and Herzegovina', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [
					'BRC' => [
						'name' => __( 'Brčko distrikt', 'voxel-countries' ),
					],
					'BIH' => [
						'name' => __( 'Federacija Bosna i Hercegovina', 'voxel-countries' ),
					],
					'SRP' => [
						'name' => __( 'Republika Srpska', 'voxel-countries' ),
					],
				]
			],
			'BB' => [
				'code3' => 'BRB',
				'name' => __( 'Barbados', 'voxel-countries' ),
				'continent' => 'North America',
				'states' => [
					'01' => [
						'name' => __( 'Christ Church', 'voxel-countries' ),
					],
					'02' => [
						'name' => __( 'Saint Andrew', 'voxel-countries' ),
					],
					'03' => [
						'name' => __( 'Saint George', 'voxel-countries' ),
					],
					'04' => [
						'name' => __( 'Saint James', 'voxel-countries' ),
					],
					'05' => [
						'name' => __( 'Saint John', 'voxel-countries' ),
					],
					'06' => [
						'name' => __( 'Saint Joseph', 'voxel-countries' ),
					],
					'07' => [
						'name' => __( 'Saint Lucy', 'voxel-countries' ),
					],
					'08' => [
						'name' => __( 'Saint Michael', 'voxel-countries' ),
					],
					'09' => [
						'name' => __( 'Saint Peter', 'voxel-countries' ),
					],
					'10' => [
						'name' => __( 'Saint Philip', 'voxel-countries' ),
					],
					'11' => [
						'name' => __( 'Saint Thomas', 'voxel-countries' ),
					],
				]
			],
			'BD' => [
				'code3' => 'BGD',
				'name' => __( 'Bangladesh', 'voxel-countries' ),
				'continent' => 'Asia',
				'states' => [
					'A' => [
						'name' => __( 'Barisal', 'voxel-countries' ),
					],
					'B' => [
						'name' => __( 'Chittagong', 'voxel-countries' ),
					],
					'C' => [
						'name' => __( 'Dhaka', 'voxel-countries' ),
					],
					'D' => [
						'name' => __( 'Khulna', 'voxel-countries' ),
					],
					'E' => [
						'name' => __( 'Rajshahi', 'voxel-countries' ),
					],
					'F' => [
						'name' => __( 'Rangpur', 'voxel-countries' ),
					],
					'G' => [
						'name' => __( 'Sylhet', 'voxel-countries' ),
					],
				]
			],
			'BE' => [
				'code3' => 'BEL',
				'name' => __( 'Belgium', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [
					'BRU' => [
						'name' => __( 'Brussels Hoofdstedelijk Gewest', 'voxel-countries' ),
					],
					'WAL' => [
						'name' => __( 'Région Wallonne', 'voxel-countries' ),
					],
					'VLG' => [
						'name' => __( 'Vlaams Gewest', 'voxel-countries' ),
					],
				]
			],
			'BF' => [
				'code3' => 'BFA',
				'name' => __( 'Burkina Faso', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'01' => [
						'name' => __( 'Boucle du Mouhoun', 'voxel-countries' ),
					],
					'02' => [
						'name' => __( 'Cascades', 'voxel-countries' ),
					],
					'03' => [
						'name' => __( 'Centre', 'voxel-countries' ),
					],
					'04' => [
						'name' => __( 'Centre-Est', 'voxel-countries' ),
					],
					'05' => [
						'name' => __( 'Centre-Nord', 'voxel-countries' ),
					],
					'06' => [
						'name' => __( 'Centre-Ouest', 'voxel-countries' ),
					],
					'07' => [
						'name' => __( 'Centre-Sud', 'voxel-countries' ),
					],
					'08' => [
						'name' => __( 'Est', 'voxel-countries' ),
					],
					'09' => [
						'name' => __( 'Hauts-Bassins', 'voxel-countries' ),
					],
					'10' => [
						'name' => __( 'Nord', 'voxel-countries' ),
					],
					'11' => [
						'name' => __( 'Plateau-Central', 'voxel-countries' ),
					],
					'12' => [
						'name' => __( 'Sahel', 'voxel-countries' ),
					],
					'13' => [
						'name' => __( 'Sud-Ouest', 'voxel-countries' ),
					],
				]
			],
			'BG' => [
				'code3' => 'BGR',
				'name' => __( 'Bulgaria', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [
					'01' => [
						'name' => __( 'Blagoevgrad', 'voxel-countries' ),
					],
					'02' => [
						'name' => __( 'Burgas', 'voxel-countries' ),
					],
					'08' => [
						'name' => __( 'Dobrich', 'voxel-countries' ),
					],
					'07' => [
						'name' => __( 'Gabrovo', 'voxel-countries' ),
					],
					'26' => [
						'name' => __( 'Haskovo', 'voxel-countries' ),
					],
					'09' => [
						'name' => __( 'Kardzhali', 'voxel-countries' ),
					],
					'10' => [
						'name' => __( 'Kyustendil', 'voxel-countries' ),
					],
					'11' => [
						'name' => __( 'Lovech', 'voxel-countries' ),
					],
					'12' => [
						'name' => __( 'Montana', 'voxel-countries' ),
					],
					'13' => [
						'name' => __( 'Pazardzhik', 'voxel-countries' ),
					],
					'14' => [
						'name' => __( 'Pernik', 'voxel-countries' ),
					],
					'15' => [
						'name' => __( 'Pleven', 'voxel-countries' ),
					],
					'16' => [
						'name' => __( 'Plovdiv', 'voxel-countries' ),
					],
					'17' => [
						'name' => __( 'Razgrad', 'voxel-countries' ),
					],
					'18' => [
						'name' => __( 'Ruse', 'voxel-countries' ),
					],
					'27' => [
						'name' => __( 'Shumen', 'voxel-countries' ),
					],
					'19' => [
						'name' => __( 'Silistra', 'voxel-countries' ),
					],
					'20' => [
						'name' => __( 'Sliven', 'voxel-countries' ),
					],
					'21' => [
						'name' => __( 'Smolyan', 'voxel-countries' ),
					],
					'23' => [
						'name' => __( 'Sofia', 'voxel-countries' ),
					],
					'22' => [
						'name' => __( 'Sofia-Grad', 'voxel-countries' ),
					],
					'24' => [
						'name' => __( 'Stara Zagora', 'voxel-countries' ),
					],
					'25' => [
						'name' => __( 'Targovishte', 'voxel-countries' ),
					],
					'03' => [
						'name' => __( 'Varna', 'voxel-countries' ),
					],
					'04' => [
						'name' => __( 'Veliko Tarnovo', 'voxel-countries' ),
					],
					'05' => [
						'name' => __( 'Vidin', 'voxel-countries' ),
					],
					'06' => [
						'name' => __( 'Vratsa', 'voxel-countries' ),
					],
					'28' => [
						'name' => __( 'Yambol', 'voxel-countries' ),
					],
				]
			],
			'BH' => [
				'code3' => 'BHR',
				'name' => __( 'Bahrain', 'voxel-countries' ),
				'continent' => 'Asia',
				'states' => [
					'14' => [
						'name' => __( 'Al Janūbīyah', 'voxel-countries' ),
					],
					'13' => [
						'name' => __( 'Al Manāmah', 'voxel-countries' ),
					],
					'15' => [
						'name' => __( 'Al Muḩarraq', 'voxel-countries' ),
					],
					'16' => [
						'name' => __( 'Al Wusţá', 'voxel-countries' ),
					],
					'17' => [
						'name' => __( 'Ash Shamālīyah', 'voxel-countries' ),
					],
				]
			],
			'BI' => [
				'code3' => 'BDI',
				'name' => __( 'Burundi', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'BB' => [
						'name' => __( 'Bubanza', 'voxel-countries' ),
					],
					'BM' => [
						'name' => __( 'Bujumbura Mairie', 'voxel-countries' ),
					],
					'BL' => [
						'name' => __( 'Bujumbura Rural', 'voxel-countries' ),
					],
					'BR' => [
						'name' => __( 'Bururi', 'voxel-countries' ),
					],
					'CA' => [
						'name' => __( 'Cankuzo', 'voxel-countries' ),
					],
					'CI' => [
						'name' => __( 'Cibitoke', 'voxel-countries' ),
					],
					'GI' => [
						'name' => __( 'Gitega', 'voxel-countries' ),
					],
					'KR' => [
						'name' => __( 'Karuzi', 'voxel-countries' ),
					],
					'KY' => [
						'name' => __( 'Kayanza', 'voxel-countries' ),
					],
					'KI' => [
						'name' => __( 'Kirundo', 'voxel-countries' ),
					],
					'MA' => [
						'name' => __( 'Makamba', 'voxel-countries' ),
					],
					'MU' => [
						'name' => __( 'Muramvya', 'voxel-countries' ),
					],
					'MY' => [
						'name' => __( 'Muyinga', 'voxel-countries' ),
					],
					'MW' => [
						'name' => __( 'Mwaro', 'voxel-countries' ),
					],
					'NG' => [
						'name' => __( 'Ngozi', 'voxel-countries' ),
					],
					'RT' => [
						'name' => __( 'Rutana', 'voxel-countries' ),
					],
					'RY' => [
						'name' => __( 'Ruyigi', 'voxel-countries' ),
					],
				]
			],
			'BJ' => [
				'code3' => 'BEN',
				'name' => __( 'Benin', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'AL' => [
						'name' => __( 'Alibori', 'voxel-countries' ),
					],
					'AK' => [
						'name' => __( 'Atakora', 'voxel-countries' ),
					],
					'AQ' => [
						'name' => __( 'Atlantique', 'voxel-countries' ),
					],
					'BO' => [
						'name' => __( 'Borgou', 'voxel-countries' ),
					],
					'CO' => [
						'name' => __( 'Collines', 'voxel-countries' ),
					],
					'DO' => [
						'name' => __( 'Donga', 'voxel-countries' ),
					],
					'KO' => [
						'name' => __( 'Kouffo', 'voxel-countries' ),
					],
					'LI' => [
						'name' => __( 'Littoral', 'voxel-countries' ),
					],
					'MO' => [
						'name' => __( 'Mono', 'voxel-countries' ),
					],
					'OU' => [
						'name' => __( 'Ouémé', 'voxel-countries' ),
					],
					'PL' => [
						'name' => __( 'Plateau', 'voxel-countries' ),
					],
					'ZO' => [
						'name' => __( 'Zou', 'voxel-countries' ),
					],
				]
			],
			'BL' => [
				'code3' => 'BLM',
				'name' => __( 'Saint Barthélemy', 'voxel-countries' ),
				'continent' => 'North America',
				'states' => [],
			],
			'BM' => [
				'code3' => 'BMU',
				'name' => __( 'Bermuda', 'voxel-countries' ),
				'continent' => 'North America',
				'states' => [],
			],
			'BN' => [
				'code3' => 'BRN',
				'name' => __( 'Brunei', 'voxel-countries' ),
				'continent' => 'Asia',
				'states' => [
					'BE' => [
						'name' => __( 'Belait', 'voxel-countries' ),
					],
					'BM' => [
						'name' => __( 'Brunei-Muara', 'voxel-countries' ),
					],
					'TE' => [
						'name' => __( 'Temburong', 'voxel-countries' ),
					],
					'TU' => [
						'name' => __( 'Tutong', 'voxel-countries' ),
					],
				]
			],
			'BO' => [
				'code3' => 'BOL',
				'name' => __( 'Bolivia', 'voxel-countries' ),
				'continent' => 'South America',
				'states' => [
					'H' => [
						'name' => __( 'Chuquisaca', 'voxel-countries' ),
					],
					'C' => [
						'name' => __( 'Cochabamba', 'voxel-countries' ),
					],
					'B' => [
						'name' => __( 'El Beni', 'voxel-countries' ),
					],
					'L' => [
						'name' => __( 'La Paz', 'voxel-countries' ),
					],
					'O' => [
						'name' => __( 'Oruro', 'voxel-countries' ),
					],
					'N' => [
						'name' => __( 'Pando', 'voxel-countries' ),
					],
					'P' => [
						'name' => __( 'Potosí', 'voxel-countries' ),
					],
					'S' => [
						'name' => __( 'Santa Cruz', 'voxel-countries' ),
					],
					'T' => [
						'name' => __( 'Tarija', 'voxel-countries' ),
					],
				]
			],
			'BQ' => [
				'code3' => 'BES',
				'name' => __( 'Bonaire', 'voxel-countries' ),
				'continent' => 'North America',
				'states' => [],
			],
			'BR' => [
				'code3' => 'BRA',
				'name' => __( 'Brazil', 'voxel-countries' ),
				'continent' => 'South America',
				'states' => [
					'AC' => [
						'name' => __( 'Acre', 'voxel-countries' ),
					],
					'AL' => [
						'name' => __( 'Alagoas', 'voxel-countries' ),
					],
					'AP' => [
						'name' => __( 'Amapá', 'voxel-countries' ),
					],
					'AM' => [
						'name' => __( 'Amazonas', 'voxel-countries' ),
					],
					'BA' => [
						'name' => __( 'Bahia', 'voxel-countries' ),
					],
					'CE' => [
						'name' => __( 'Ceará', 'voxel-countries' ),
					],
					'DF' => [
						'name' => __( 'Distrito Federal', 'voxel-countries' ),
					],
					'ES' => [
						'name' => __( 'Espírito Santo', 'voxel-countries' ),
					],
					'GO' => [
						'name' => __( 'Goiás', 'voxel-countries' ),
					],
					'MA' => [
						'name' => __( 'Maranhão', 'voxel-countries' ),
					],
					'MT' => [
						'name' => __( 'Mato Grosso', 'voxel-countries' ),
					],
					'MS' => [
						'name' => __( 'Mato Grosso do Sul', 'voxel-countries' ),
					],
					'MG' => [
						'name' => __( 'Minas Gerais', 'voxel-countries' ),
					],
					'PR' => [
						'name' => __( 'Paraná', 'voxel-countries' ),
					],
					'PB' => [
						'name' => __( 'Paraíba', 'voxel-countries' ),
					],
					'PA' => [
						'name' => __( 'Pará', 'voxel-countries' ),
					],
					'PE' => [
						'name' => __( 'Pernambuco', 'voxel-countries' ),
					],
					'PI' => [
						'name' => __( 'Piauí', 'voxel-countries' ),
					],
					'RN' => [
						'name' => __( 'Rio Grande do Norte', 'voxel-countries' ),
					],
					'RS' => [
						'name' => __( 'Rio Grande do Sul', 'voxel-countries' ),
					],
					'RJ' => [
						'name' => __( 'Rio de Janeiro', 'voxel-countries' ),
					],
					'RO' => [
						'name' => __( 'Rondônia', 'voxel-countries' ),
					],
					'RR' => [
						'name' => __( 'Roraima', 'voxel-countries' ),
					],
					'SC' => [
						'name' => __( 'Santa Catarina', 'voxel-countries' ),
					],
					'SE' => [
						'name' => __( 'Sergipe', 'voxel-countries' ),
					],
					'SP' => [
						'name' => __( 'São Paulo', 'voxel-countries' ),
					],
					'TO' => [
						'name' => __( 'Tocantins', 'voxel-countries' ),
					],
				]
			],
			'BS' => [
				'code3' => 'BHS',
				'name' => __( 'The Bahamas', 'voxel-countries' ),
				'continent' => 'North America',
				'states' => [
					'AK' => [
						'name' => __( 'Acklins', 'voxel-countries' ),
					],
					'BY' => [
						'name' => __( 'Berry Islands', 'voxel-countries' ),
					],
					'BI' => [
						'name' => __( 'Bimini', 'voxel-countries' ),
					],
					'BP' => [
						'name' => __( 'Black Point', 'voxel-countries' ),
					],
					'CI' => [
						'name' => __( 'Cat Island', 'voxel-countries' ),
					],
					'CO' => [
						'name' => __( 'Central Abaco', 'voxel-countries' ),
					],
					'CS' => [
						'name' => __( 'Central Andros', 'voxel-countries' ),
					],
					'CE' => [
						'name' => __( 'Central Eleuthera', 'voxel-countries' ),
					],
					'FP' => [
						'name' => __( 'City of Freeport', 'voxel-countries' ),
					],
					'CK' => [
						'name' => __( 'Crooked Island and Long Cay', 'voxel-countries' ),
					],
					'EG' => [
						'name' => __( 'East Grand Bahama', 'voxel-countries' ),
					],
					'EX' => [
						'name' => __( 'Exuma', 'voxel-countries' ),
					],
					'GC' => [
						'name' => __( 'Grand Cay', 'voxel-countries' ),
					],
					'HI' => [
						'name' => __( 'Harbour Island', 'voxel-countries' ),
					],
					'HT' => [
						'name' => __( 'Hope Town', 'voxel-countries' ),
					],
					'IN' => [
						'name' => __( 'Inagua', 'voxel-countries' ),
					],
					'LI' => [
						'name' => __( 'Long Island', 'voxel-countries' ),
					],
					'MC' => [
						'name' => __( 'Mangrove Cay', 'voxel-countries' ),
					],
					'MG' => [
						'name' => __( 'Mayaguana', 'voxel-countries' ),
					],
					'MI' => [
						'name' => __( 'Moores Island', 'voxel-countries' ),
					],
					'NO' => [
						'name' => __( 'North Abaco', 'voxel-countries' ),
					],
					'NS' => [
						'name' => __( 'North Andros', 'voxel-countries' ),
					],
					'NE' => [
						'name' => __( 'North Eleuthera', 'voxel-countries' ),
					],
					'RI' => [
						'name' => __( 'Ragged Island', 'voxel-countries' ),
					],
					'RC' => [
						'name' => __( 'Rum Cay', 'voxel-countries' ),
					],
					'SS' => [
						'name' => __( 'San Salvador', 'voxel-countries' ),
					],
					'SO' => [
						'name' => __( 'South Abaco', 'voxel-countries' ),
					],
					'SA' => [
						'name' => __( 'South Andros', 'voxel-countries' ),
					],
					'SE' => [
						'name' => __( 'South Eleuthera', 'voxel-countries' ),
					],
					'SW' => [
						'name' => __( 'Spanish Wells', 'voxel-countries' ),
					],
					'WG' => [
						'name' => __( 'West Grand Bahama', 'voxel-countries' ),
					],
				]
			],
			'BT' => [
				'code3' => 'BTN',
				'name' => __( 'Bhutan', 'voxel-countries' ),
				'continent' => 'Asia',
				'states' => [
					'33' => [
						'name' => __( 'Bumthang', 'voxel-countries' ),
					],
					'12' => [
						'name' => __( 'Chhukha', 'voxel-countries' ),
					],
					'22' => [
						'name' => __( 'Dagana', 'voxel-countries' ),
					],
					'GA' => [
						'name' => __( 'Gasa', 'voxel-countries' ),
					],
					'13' => [
						'name' => __( 'Ha', 'voxel-countries' ),
					],
					'44' => [
						'name' => __( 'Lhuentse', 'voxel-countries' ),
					],
					'42' => [
						'name' => __( 'Monggar', 'voxel-countries' ),
					],
					'11' => [
						'name' => __( 'Paro', 'voxel-countries' ),
					],
					'43' => [
						'name' => __( 'Pemagatshel', 'voxel-countries' ),
					],
					'23' => [
						'name' => __( 'Punakha', 'voxel-countries' ),
					],
					'45' => [
						'name' => __( 'Samdrup Jongkha', 'voxel-countries' ),
					],
					'14' => [
						'name' => __( 'Samtse', 'voxel-countries' ),
					],
					'31' => [
						'name' => __( 'Sarpang', 'voxel-countries' ),
					],
					'15' => [
						'name' => __( 'Thimphu', 'voxel-countries' ),
					],
					'TY' => [
						'name' => __( 'Trashi Yangtse', 'voxel-countries' ),
					],
					'41' => [
						'name' => __( 'Trashigang', 'voxel-countries' ),
					],
					'32' => [
						'name' => __( 'Trongsa', 'voxel-countries' ),
					],
					'21' => [
						'name' => __( 'Tsirang', 'voxel-countries' ),
					],
					'24' => [
						'name' => __( 'Wangdue Phodrang', 'voxel-countries' ),
					],
					'34' => [
						'name' => __( 'Zhemgang', 'voxel-countries' ),
					],
				]
			],
			'BV' => [
				'code3' => 'BVT',
				'name' => __( 'Bouvet Island', 'voxel-countries' ),
				'continent' => 'Asia',
				'states' => [],
			],
			'BW' => [
				'code3' => 'BWA',
				'name' => __( 'Botswana', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'CE' => [
						'name' => __( 'Central', 'voxel-countries' ),
					],
					'CH' => [
						'name' => __( 'Chobe', 'voxel-countries' ),
					],
					'FR' => [
						'name' => __( 'Francistown', 'voxel-countries' ),
					],
					'GA' => [
						'name' => __( 'Gaborone', 'voxel-countries' ),
					],
					'GH' => [
						'name' => __( 'Ghanzi', 'voxel-countries' ),
					],
					'JW' => [
						'name' => __( 'Jwaneng', 'voxel-countries' ),
					],
					'KG' => [
						'name' => __( 'Kgalagadi', 'voxel-countries' ),
					],
					'KL' => [
						'name' => __( 'Kgatleng', 'voxel-countries' ),
					],
					'KW' => [
						'name' => __( 'Kweneng', 'voxel-countries' ),
					],
					'LO' => [
						'name' => __( 'Lobatse', 'voxel-countries' ),
					],
					'NE' => [
						'name' => __( 'North-East', 'voxel-countries' ),
					],
					'NW' => [
						'name' => __( 'North-West', 'voxel-countries' ),
					],
					'SP' => [
						'name' => __( 'Selibe Phikwe', 'voxel-countries' ),
					],
					'SE' => [
						'name' => __( 'South-East', 'voxel-countries' ),
					],
					'SO' => [
						'name' => __( 'Southern', 'voxel-countries' ),
					],
					'ST' => [
						'name' => __( 'Sowa Town', 'voxel-countries' ),
					],
				]
			],
			'BY' => [
				'code3' => 'BLR',
				'name' => __( 'Belarus', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [
					'BR' => [
						'name' => __( 'Brestskaya voblasts\'', 'voxel-countries' ),
					],
					'HO' => [
						'name' => __( 'Homyel\'skaya voblasts\'', 'voxel-countries' ),
					],
					'HM' => [
						'name' => __( 'Horad Minsk', 'voxel-countries' ),
					],
					'HR' => [
						'name' => __( 'Hrodzenskaya voblasts\'', 'voxel-countries' ),
					],
					'MA' => [
						'name' => __( 'Mahilyowskaya voblasts\'', 'voxel-countries' ),
					],
					'MI' => [
						'name' => __( 'Minskaya voblasts\'', 'voxel-countries' ),
					],
					'VI' => [
						'name' => __( 'Vitsyebskaya voblasts\'', 'voxel-countries' ),
					],
				]
			],
			'BZ' => [
				'code3' => 'BLZ',
				'name' => __( 'Belize', 'voxel-countries' ),
				'continent' => 'North America',
				'states' => [
					'BZ' => [
						'name' => __( 'Belize', 'voxel-countries' ),
					],
					'CY' => [
						'name' => __( 'Cayo', 'voxel-countries' ),
					],
					'CZL' => [
						'name' => __( 'Corozal', 'voxel-countries' ),
					],
					'OW' => [
						'name' => __( 'Orange Walk', 'voxel-countries' ),
					],
					'SC' => [
						'name' => __( 'Stann Creek', 'voxel-countries' ),
					],
					'TOL' => [
						'name' => __( 'Toledo', 'voxel-countries' ),
					],
				]
			],
			'CA' => [
				'code3' => 'CAN',
				'name' => __( 'Canada', 'voxel-countries' ),
				'continent' => 'North America',
				'states' => [
					'AB' => [
						'name' => __( 'Alberta', 'voxel-countries' ),
					],
					'BC' => [
						'name' => __( 'British Columbia', 'voxel-countries' ),
					],
					'MB' => [
						'name' => __( 'Manitoba', 'voxel-countries' ),
					],
					'NB' => [
						'name' => __( 'New Brunswick', 'voxel-countries' ),
					],
					'NL' => [
						'name' => __( 'Newfoundland and Labrador', 'voxel-countries' ),
					],
					'NS' => [
						'name' => __( 'Nova Scotia', 'voxel-countries' ),
					],
					'ON' => [
						'name' => __( 'Ontario', 'voxel-countries' ),
					],
					'PE' => [
						'name' => __( 'Prince Edward Island', 'voxel-countries' ),
					],
					'QC' => [
						'name' => __( 'Quebec', 'voxel-countries' ),
					],
					'SK' => [
						'name' => __( 'Saskatchewan', 'voxel-countries' ),
					],
					'NT' => [
						'name' => __( 'Northwest Territories', 'voxel-countries' ),
					],
					'NU' => [
						'name' => __( 'Nunavut', 'voxel-countries' ),
					],
					'YT' => [
						'name' => __( 'Yukon', 'voxel-countries' ),
					],
				]
			],
			'CC' => [
				'code3' => 'CCK',
				'name' => __( 'Cocos (Keeling) Islands', 'voxel-countries' ),
				'continent' => 'Oceania',
				'states' => [],
			],
			'CD' => [
				'code3' => 'COD',
				'name' => __( 'Democratic Republic of the Congo', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'BN' => [
						'name' => __( 'Bandundu', 'voxel-countries' ),
					],
					'BC' => [
						'name' => __( 'Bas-Congo', 'voxel-countries' ),
					],
					'KW' => [
						'name' => __( 'Kasai-Occidental', 'voxel-countries' ),
					],
					'KE' => [
						'name' => __( 'Kasai-Oriental', 'voxel-countries' ),
					],
					'KA' => [
						'name' => __( 'Katanga', 'voxel-countries' ),
					],
					'KN' => [
						'name' => __( 'Kinshasa', 'voxel-countries' ),
					],
					'MA' => [
						'name' => __( 'Maniema', 'voxel-countries' ),
					],
					'NK' => [
						'name' => __( 'Nord-Kivu', 'voxel-countries' ),
					],
					'OR' => [
						'name' => __( 'Orientale', 'voxel-countries' ),
					],
					'SK' => [
						'name' => __( 'Sud-Kivu', 'voxel-countries' ),
					],
					'EQ' => [
						'name' => __( 'Équateur', 'voxel-countries' ),
					],
				]
			],
			'CF' => [
				'code3' => 'CAF',
				'name' => __( 'Central African Republic', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'BB' => [
						'name' => __( 'Bamingui-Bangoran', 'voxel-countries' ),
					],
					'BGF' => [
						'name' => __( 'Bangui', 'voxel-countries' ),
					],
					'BK' => [
						'name' => __( 'Basse-Kotto', 'voxel-countries' ),
					],
					'KB' => [
						'name' => __( 'Gribingui', 'voxel-countries' ),
					],
					'HM' => [
						'name' => __( 'Haut-Mbomou', 'voxel-countries' ),
					],
					'HK' => [
						'name' => __( 'Haute-Kotto', 'voxel-countries' ),
					],
					'HS' => [
						'name' => __( 'Haute-Sangha / Mambéré-Kadéï', 'voxel-countries' ),
					],
					'KG' => [
						'name' => __( 'Kémo-Gribingui', 'voxel-countries' ),
					],
					'LB' => [
						'name' => __( 'Lobaye', 'voxel-countries' ),
					],
					'MB' => [
						'name' => __( 'Mbomou', 'voxel-countries' ),
					],
					'NM' => [
						'name' => __( 'Nana-Mambéré', 'voxel-countries' ),
					],
					'MP' => [
						'name' => __( 'Ombella-Mpoko', 'voxel-countries' ),
					],
					'UK' => [
						'name' => __( 'Ouaka', 'voxel-countries' ),
					],
					'AC' => [
						'name' => __( 'Ouham', 'voxel-countries' ),
					],
					'OP' => [
						'name' => __( 'Ouham-Pendé', 'voxel-countries' ),
					],
					'SE' => [
						'name' => __( 'Sangha', 'voxel-countries' ),
					],
					'VK' => [
						'name' => __( 'Vakaga', 'voxel-countries' ),
					],
				]
			],
			'CG' => [
				'code3' => 'COG',
				'name' => __( 'Republic of the Congo', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'11' => [
						'name' => __( 'Bouenza', 'voxel-countries' ),
					],
					'BZV' => [
						'name' => __( 'Brazzaville', 'voxel-countries' ),
					],
					'8' => [
						'name' => __( 'Cuvette', 'voxel-countries' ),
					],
					'15' => [
						'name' => __( 'Cuvette-Ouest', 'voxel-countries' ),
					],
					'5' => [
						'name' => __( 'Kouilou', 'voxel-countries' ),
					],
					'7' => [
						'name' => __( 'Likouala', 'voxel-countries' ),
					],
					'2' => [
						'name' => __( 'Lékoumou', 'voxel-countries' ),
					],
					'9' => [
						'name' => __( 'Niari', 'voxel-countries' ),
					],
					'14' => [
						'name' => __( 'Plateaux', 'voxel-countries' ),
					],
					'16' => [
						'name' => __( 'Pointe-Noire', 'voxel-countries' ),
					],
					'12' => [
						'name' => __( 'Pool', 'voxel-countries' ),
					],
					'13' => [
						'name' => __( 'Sangha', 'voxel-countries' ),
					],
				]
			],
			'CH' => [
				'code3' => 'CHE',
				'name' => __( 'Switzerland', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [
					'AG' => [
						'name' => __( 'Aargau', 'voxel-countries' ),
					],
					'AR' => [
						'name' => __( 'Appenzell Ausserrhoden', 'voxel-countries' ),
					],
					'AI' => [
						'name' => __( 'Appenzell Innerrhoden', 'voxel-countries' ),
					],
					'BL' => [
						'name' => __( 'Basel-Landschaft', 'voxel-countries' ),
					],
					'BS' => [
						'name' => __( 'Basel-Stadt', 'voxel-countries' ),
					],
					'BE' => [
						'name' => __( 'Bern', 'voxel-countries' ),
					],
					'FR' => [
						'name' => __( 'Fribourg', 'voxel-countries' ),
					],
					'GE' => [
						'name' => __( 'Genève', 'voxel-countries' ),
					],
					'GL' => [
						'name' => __( 'Glarus', 'voxel-countries' ),
					],
					'GR' => [
						'name' => __( 'Graubünden', 'voxel-countries' ),
					],
					'JU' => [
						'name' => __( 'Jura', 'voxel-countries' ),
					],
					'LU' => [
						'name' => __( 'Luzern', 'voxel-countries' ),
					],
					'NE' => [
						'name' => __( 'Neuchâtel', 'voxel-countries' ),
					],
					'NW' => [
						'name' => __( 'Nidwalden', 'voxel-countries' ),
					],
					'OW' => [
						'name' => __( 'Obwalden', 'voxel-countries' ),
					],
					'SG' => [
						'name' => __( 'Sankt Gallen', 'voxel-countries' ),
					],
					'SH' => [
						'name' => __( 'Schaffhausen', 'voxel-countries' ),
					],
					'SZ' => [
						'name' => __( 'Schwyz', 'voxel-countries' ),
					],
					'SO' => [
						'name' => __( 'Solothurn', 'voxel-countries' ),
					],
					'TG' => [
						'name' => __( 'Thurgau', 'voxel-countries' ),
					],
					'TI' => [
						'name' => __( 'Ticino', 'voxel-countries' ),
					],
					'UR' => [
						'name' => __( 'Uri', 'voxel-countries' ),
					],
					'VS' => [
						'name' => __( 'Valais', 'voxel-countries' ),
					],
					'VD' => [
						'name' => __( 'Vaud', 'voxel-countries' ),
					],
					'ZG' => [
						'name' => __( 'Zug', 'voxel-countries' ),
					],
					'ZH' => [
						'name' => __( 'Zürich', 'voxel-countries' ),
					],
				]
			],
			'CI' => [
				'code3' => 'CIV',
				'name' => __( 'Ivory Coast', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'06' => [
						'name' => __( '18 Montagnes', 'voxel-countries' ),
					],
					'16' => [
						'name' => __( 'Agnébi', 'voxel-countries' ),
					],
					'17' => [
						'name' => __( 'Bafing', 'voxel-countries' ),
					],
					'09' => [
						'name' => __( 'Bas-Sassandra', 'voxel-countries' ),
					],
					'10' => [
						'name' => __( 'Denguélé', 'voxel-countries' ),
					],
					'18' => [
						'name' => __( 'Fromager', 'voxel-countries' ),
					],
					'02' => [
						'name' => __( 'Haut-Sassandra', 'voxel-countries' ),
					],
					'07' => [
						'name' => __( 'Lacs', 'voxel-countries' ),
					],
					'01' => [
						'name' => __( 'Lagunes', 'voxel-countries' ),
					],
					'12' => [
						'name' => __( 'Marahoué', 'voxel-countries' ),
					],
					'19' => [
						'name' => __( 'Moyen-Cavally', 'voxel-countries' ),
					],
					'05' => [
						'name' => __( 'Moyen-Comoé', 'voxel-countries' ),
					],
					'11' => [
						'name' => __( 'Nzi-Comoé', 'voxel-countries' ),
					],
					'03' => [
						'name' => __( 'Savanes', 'voxel-countries' ),
					],
					'15' => [
						'name' => __( 'Sud-Bandama', 'voxel-countries' ),
					],
					'13' => [
						'name' => __( 'Sud-Comoé', 'voxel-countries' ),
					],
					'04' => [
						'name' => __( 'Vallée du Bandama', 'voxel-countries' ),
					],
					'14' => [
						'name' => __( 'Worodougou', 'voxel-countries' ),
					],
					'08' => [
						'name' => __( 'Zanzan', 'voxel-countries' ),
					],
				]
			],
			'CK' => [
				'code3' => 'COK',
				'name' => __( 'Cook Islands', 'voxel-countries' ),
				'continent' => 'Oceania',
				'states' => [],
			],
			'CL' => [
				'code3' => 'CHL',
				'name' => __( 'Chile', 'voxel-countries' ),
				'continent' => 'South America',
				'states' => [
					'AI' => [
						'name' => __( 'Aisén del General Carlos Ibañez del Campo', 'voxel-countries' ),
					],
					'AN' => [
						'name' => __( 'Antofagasta', 'voxel-countries' ),
					],
					'AR' => [
						'name' => __( 'Araucanía', 'voxel-countries' ),
					],
					'AP' => [
						'name' => __( 'Arica y Parinacota', 'voxel-countries' ),
					],
					'AT' => [
						'name' => __( 'Atacama', 'voxel-countries' ),
					],
					'BI' => [
						'name' => __( 'Bío-Bío', 'voxel-countries' ),
					],
					'CO' => [
						'name' => __( 'Coquimbo', 'voxel-countries' ),
					],
					'LI' => [
						'name' => __( 'Libertador General Bernardo O\'Higgins', 'voxel-countries' ),
					],
					'LL' => [
						'name' => __( 'Los Lagos', 'voxel-countries' ),
					],
					'LR' => [
						'name' => __( 'Los Ríos', 'voxel-countries' ),
					],
					'MA' => [
						'name' => __( 'Magallanes', 'voxel-countries' ),
					],
					'ML' => [
						'name' => __( 'Maule', 'voxel-countries' ),
					],
					'RM' => [
						'name' => __( 'Región Metropolitana de Santiago', 'voxel-countries' ),
					],
					'TA' => [
						'name' => __( 'Tarapacá', 'voxel-countries' ),
					],
					'VS' => [
						'name' => __( 'Valparaíso', 'voxel-countries' ),
					],
				]
			],
			'CM' => [
				'code3' => 'CMR',
				'name' => __( 'Cameroon', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'AD' => [
						'name' => __( 'Adamaoua', 'voxel-countries' ),
					],
					'CE' => [
						'name' => __( 'Centre', 'voxel-countries' ),
					],
					'ES' => [
						'name' => __( 'East', 'voxel-countries' ),
					],
					'EN' => [
						'name' => __( 'Far North', 'voxel-countries' ),
					],
					'LT' => [
						'name' => __( 'Littoral', 'voxel-countries' ),
					],
					'NO' => [
						'name' => __( 'North', 'voxel-countries' ),
					],
					'NW' => [
						'name' => __( 'North-West', 'voxel-countries' ),
					],
					'SU' => [
						'name' => __( 'South', 'voxel-countries' ),
					],
					'SW' => [
						'name' => __( 'South-West', 'voxel-countries' ),
					],
					'OU' => [
						'name' => __( 'West', 'voxel-countries' ),
					],
				]
			],
			'CN' => [
				'code3' => 'CHN',
				'name' => __( 'China', 'voxel-countries' ),
				'continent' => 'Asia',
				'states' => [
					'45' => [
						'name' => __( 'Guangxi', 'voxel-countries' ),
					],
					'15' => [
						'name' => __( 'Nei Mongol', 'voxel-countries' ),
					],
					'64' => [
						'name' => __( 'Ningxia', 'voxel-countries' ),
					],
					'65' => [
						'name' => __( 'Xinjiang', 'voxel-countries' ),
					],
					'54' => [
						'name' => __( 'Xizang', 'voxel-countries' ),
					],
					'11' => [
						'name' => __( 'Beijing', 'voxel-countries' ),
					],
					'50' => [
						'name' => __( 'Chongqing', 'voxel-countries' ),
					],
					'31' => [
						'name' => __( 'Shanghai', 'voxel-countries' ),
					],
					'12' => [
						'name' => __( 'Tianjin', 'voxel-countries' ),
					],
					'34' => [
						'name' => __( 'Anhui', 'voxel-countries' ),
					],
					'35' => [
						'name' => __( 'Fujian', 'voxel-countries' ),
					],
					'62' => [
						'name' => __( 'Gansu', 'voxel-countries' ),
					],
					'44' => [
						'name' => __( 'Guangdong', 'voxel-countries' ),
					],
					'52' => [
						'name' => __( 'Guizhou', 'voxel-countries' ),
					],
					'46' => [
						'name' => __( 'Hainan', 'voxel-countries' ),
					],
					'13' => [
						'name' => __( 'Hebei', 'voxel-countries' ),
					],
					'23' => [
						'name' => __( 'Heilongjiang', 'voxel-countries' ),
					],
					'41' => [
						'name' => __( 'Henan', 'voxel-countries' ),
					],
					'42' => [
						'name' => __( 'Hubei', 'voxel-countries' ),
					],
					'43' => [
						'name' => __( 'Hunan', 'voxel-countries' ),
					],
					'32' => [
						'name' => __( 'Jiangsu', 'voxel-countries' ),
					],
					'36' => [
						'name' => __( 'Jiangxi', 'voxel-countries' ),
					],
					'22' => [
						'name' => __( 'Jilin', 'voxel-countries' ),
					],
					'21' => [
						'name' => __( 'Liaoning', 'voxel-countries' ),
					],
					'63' => [
						'name' => __( 'Qinghai', 'voxel-countries' ),
					],
					'61' => [
						'name' => __( 'Shaanxi', 'voxel-countries' ),
					],
					'37' => [
						'name' => __( 'Shandong', 'voxel-countries' ),
					],
					'14' => [
						'name' => __( 'Shanxi', 'voxel-countries' ),
					],
					'51' => [
						'name' => __( 'Sichuan', 'voxel-countries' ),
					],
					'71' => [
						'name' => __( 'Taiwan', 'voxel-countries' ),
					],
					'53' => [
						'name' => __( 'Yunnan', 'voxel-countries' ),
					],
					'33' => [
						'name' => __( 'Zhejiang', 'voxel-countries' ),
					],
					'91' => [
						'name' => __( 'Hong Kong', 'voxel-countries' ),
					],
					'92' => [
						'name' => __( 'Macao', 'voxel-countries' ),
					],
					'KOWLOON' => [
						'name' => __( 'Kowloon', 'voxel-countries' ),
					],
					'NEW TERRITORIES' => [
						'name' => __( 'New Territories', 'voxel-countries' ),
					],
				]
			],
			'CO' => [
				'code3' => 'COL',
				'name' => __( 'Colombia', 'voxel-countries' ),
				'continent' => 'South America',
				'states' => [
					'AMA' => [
						'name' => __( 'Amazonas', 'voxel-countries' ),
					],
					'ANT' => [
						'name' => __( 'Antioquia', 'voxel-countries' ),
					],
					'ARA' => [
						'name' => __( 'Arauca', 'voxel-countries' ),
					],
					'ATL' => [
						'name' => __( 'Atlántico', 'voxel-countries' ),
					],
					'BOL' => [
						'name' => __( 'Bolívar', 'voxel-countries' ),
					],
					'BOY' => [
						'name' => __( 'Boyacá', 'voxel-countries' ),
					],
					'CAL' => [
						'name' => __( 'Caldas', 'voxel-countries' ),
					],
					'CAQ' => [
						'name' => __( 'Caquetá', 'voxel-countries' ),
					],
					'CAS' => [
						'name' => __( 'Casanare', 'voxel-countries' ),
					],
					'CAU' => [
						'name' => __( 'Cauca', 'voxel-countries' ),
					],
					'CES' => [
						'name' => __( 'Cesar', 'voxel-countries' ),
					],
					'CHO' => [
						'name' => __( 'Chocó', 'voxel-countries' ),
					],
					'CUN' => [
						'name' => __( 'Cundinamarca', 'voxel-countries' ),
					],
					'COR' => [
						'name' => __( 'Córdoba', 'voxel-countries' ),
					],
					'DC' => [
						'name' => __( 'Distrito Capital de Bogotá', 'voxel-countries' ),
					],
					'GUA' => [
						'name' => __( 'Guainía', 'voxel-countries' ),
					],
					'GUV' => [
						'name' => __( 'Guaviare', 'voxel-countries' ),
					],
					'HUI' => [
						'name' => __( 'Huila', 'voxel-countries' ),
					],
					'LAG' => [
						'name' => __( 'La Guajira', 'voxel-countries' ),
					],
					'MAG' => [
						'name' => __( 'Magdalena', 'voxel-countries' ),
					],
					'MET' => [
						'name' => __( 'Meta', 'voxel-countries' ),
					],
					'NAR' => [
						'name' => __( 'Nariño', 'voxel-countries' ),
					],
					'NSA' => [
						'name' => __( 'Norte de Santander', 'voxel-countries' ),
					],
					'PUT' => [
						'name' => __( 'Putumayo', 'voxel-countries' ),
					],
					'QUI' => [
						'name' => __( 'Quindío', 'voxel-countries' ),
					],
					'RIS' => [
						'name' => __( 'Risaralda', 'voxel-countries' ),
					],
					'SAP' => [
						'name' => __( 'San Andrés, Providencia y Santa Catalina', 'voxel-countries' ),
					],
					'SAN' => [
						'name' => __( 'Santander', 'voxel-countries' ),
					],
					'SUC' => [
						'name' => __( 'Sucre', 'voxel-countries' ),
					],
					'TOL' => [
						'name' => __( 'Tolima', 'voxel-countries' ),
					],
					'VAC' => [
						'name' => __( 'Valle del Cauca', 'voxel-countries' ),
					],
					'VAU' => [
						'name' => __( 'Vaupés', 'voxel-countries' ),
					],
					'VID' => [
						'name' => __( 'Vichada', 'voxel-countries' ),
					],
				]
			],
			'CR' => [
				'code3' => 'CRI',
				'name' => __( 'Costa Rica', 'voxel-countries' ),
				'continent' => 'North America',
				'states' => [
					'A' => [
						'name' => __( 'Alajuela', 'voxel-countries' ),
					],
					'C' => [
						'name' => __( 'Cartago', 'voxel-countries' ),
					],
					'G' => [
						'name' => __( 'Guanacaste', 'voxel-countries' ),
					],
					'H' => [
						'name' => __( 'Heredia', 'voxel-countries' ),
					],
					'L' => [
						'name' => __( 'Limón', 'voxel-countries' ),
					],
					'P' => [
						'name' => __( 'Puntarenas', 'voxel-countries' ),
					],
					'SJ' => [
						'name' => __( 'San José', 'voxel-countries' ),
					],
				]
			],
			'CU' => [
				'code3' => 'CUB',
				'name' => __( 'Cuba', 'voxel-countries' ),
				'continent' => 'North America',
				'states' => [
					'15' => [
						'name' => __( 'Artemisa', 'voxel-countries' ),
					],
					'09' => [
						'name' => __( 'Camagüey', 'voxel-countries' ),
					],
					'08' => [
						'name' => __( 'Ciego de Ávila', 'voxel-countries' ),
					],
					'06' => [
						'name' => __( 'Cienfuegos', 'voxel-countries' ),
					],
					'12' => [
						'name' => __( 'Granma', 'voxel-countries' ),
					],
					'14' => [
						'name' => __( 'Guantánamo', 'voxel-countries' ),
					],
					'11' => [
						'name' => __( 'Holguín', 'voxel-countries' ),
					],
					'99' => [
						'name' => __( 'Isla de la Juventud', 'voxel-countries' ),
					],
					'03' => [
						'name' => __( 'La Habana', 'voxel-countries' ),
					],
					'10' => [
						'name' => __( 'Las Tunas', 'voxel-countries' ),
					],
					'04' => [
						'name' => __( 'Matanzas', 'voxel-countries' ),
					],
					'16' => [
						'name' => __( 'Mayabeque', 'voxel-countries' ),
					],
					'01' => [
						'name' => __( 'Pinar del Río', 'voxel-countries' ),
					],
					'07' => [
						'name' => __( 'Sancti Spíritus', 'voxel-countries' ),
					],
					'13' => [
						'name' => __( 'Santiago de Cuba', 'voxel-countries' ),
					],
					'05' => [
						'name' => __( 'Villa Clara', 'voxel-countries' ),
					],
				]
			],
			'CV' => [
				'code3' => 'CPV',
				'name' => __( 'Cape Verde', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'B' => [
						'name' => __( 'Ilhas de Barlavento', 'voxel-countries' ),
					],
					'S' => [
						'name' => __( 'Ilhas de Sotavento', 'voxel-countries' ),
					],
				]
			],
			'CW' => [
				'code3' => 'CUW',
				'name' => __( 'Curaçao', 'voxel-countries' ),
				'continent' => 'North America',
				'states' => [],
			],
			'CX' => [
				'code3' => 'CXR',
				'name' => __( 'Christmas Island', 'voxel-countries' ),
				'continent' => 'Oceania',
				'states' => [],
			],
			'CY' => [
				'code3' => 'CYP',
				'name' => __( 'Cyprus', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [
					'04' => [
						'name' => __( 'Ammochostos', 'voxel-countries' ),
					],
					'06' => [
						'name' => __( 'Keryneia', 'voxel-countries' ),
					],
					'03' => [
						'name' => __( 'Larnaka', 'voxel-countries' ),
					],
					'01' => [
						'name' => __( 'Lefkosia', 'voxel-countries' ),
					],
					'02' => [
						'name' => __( 'Lemesos', 'voxel-countries' ),
					],
					'05' => [
						'name' => __( 'Pafos', 'voxel-countries' ),
					],
				]
			],
			'CZ' => [
				'code3' => 'CZE',
				'name' => __( 'Czech Republic', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [
					'JM' => [
						'name' => __( 'Jihomoravský kraj', 'voxel-countries' ),
					],
					'JC' => [
						'name' => __( 'Jihočeský kraj', 'voxel-countries' ),
					],
					'KA' => [
						'name' => __( 'Karlovarský kraj', 'voxel-countries' ),
					],
					'KR' => [
						'name' => __( 'Královéhradecký kraj', 'voxel-countries' ),
					],
					'LI' => [
						'name' => __( 'Liberecký kraj', 'voxel-countries' ),
					],
					'MO' => [
						'name' => __( 'Moravskoslezský kraj', 'voxel-countries' ),
					],
					'OL' => [
						'name' => __( 'Olomoucký kraj', 'voxel-countries' ),
					],
					'PA' => [
						'name' => __( 'Pardubický kraj', 'voxel-countries' ),
					],
					'PL' => [
						'name' => __( 'Plzeňský kraj', 'voxel-countries' ),
					],
					'PR' => [
						'name' => __( 'Praha, hlavní město', 'voxel-countries' ),
					],
					'ST' => [
						'name' => __( 'Středočeský kraj', 'voxel-countries' ),
					],
					'VY' => [
						'name' => __( 'Vysočina', 'voxel-countries' ),
					],
					'ZL' => [
						'name' => __( 'Zlínský kraj', 'voxel-countries' ),
					],
					'US' => [
						'name' => __( 'Ústecký kraj', 'voxel-countries' ),
					],
				]
			],
			'DE' => [
				'code3' => 'DEU',
				'name' => __( 'Germany', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [
					'BW' => [
						'name' => __( 'Baden-Württemberg', 'voxel-countries' ),
					],
					'BY' => [
						'name' => __( 'Bayern', 'voxel-countries' ),
					],
					'BE' => [
						'name' => __( 'Berlin', 'voxel-countries' ),
					],
					'BB' => [
						'name' => __( 'Brandenburg', 'voxel-countries' ),
					],
					'HB' => [
						'name' => __( 'Bremen', 'voxel-countries' ),
					],
					'HH' => [
						'name' => __( 'Hamburg', 'voxel-countries' ),
					],
					'HE' => [
						'name' => __( 'Hessen', 'voxel-countries' ),
					],
					'MV' => [
						'name' => __( 'Mecklenburg-Vorpommern', 'voxel-countries' ),
					],
					'NI' => [
						'name' => __( 'Niedersachsen', 'voxel-countries' ),
					],
					'NW' => [
						'name' => __( 'Nordrhein-Westfalen', 'voxel-countries' ),
					],
					'RP' => [
						'name' => __( 'Rheinland-Pfalz', 'voxel-countries' ),
					],
					'SL' => [
						'name' => __( 'Saarland', 'voxel-countries' ),
					],
					'SN' => [
						'name' => __( 'Sachsen', 'voxel-countries' ),
					],
					'ST' => [
						'name' => __( 'Sachsen-Anhalt', 'voxel-countries' ),
					],
					'SH' => [
						'name' => __( 'Schleswig-Holstein', 'voxel-countries' ),
					],
					'TH' => [
						'name' => __( 'Thüringen', 'voxel-countries' ),
					],
				]
			],
			'DJ' => [
				'code3' => 'DJI',
				'name' => __( 'Djibouti', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'AS' => [
						'name' => __( 'Ali Sabieh', 'voxel-countries' ),
					],
					'AR' => [
						'name' => __( 'Arta', 'voxel-countries' ),
					],
					'DI' => [
						'name' => __( 'Dikhil', 'voxel-countries' ),
					],
					'DJ' => [
						'name' => __( 'Djibouti', 'voxel-countries' ),
					],
					'OB' => [
						'name' => __( 'Obock', 'voxel-countries' ),
					],
					'TA' => [
						'name' => __( 'Tadjourah', 'voxel-countries' ),
					],
				]
			],
			'DK' => [
				'code3' => 'DNK',
				'name' => __( 'Denmark', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [
					'84' => [
						'name' => __( 'Hovedstaden', 'voxel-countries' ),
					],
					'82' => [
						'name' => __( 'Midtjylland', 'voxel-countries' ),
					],
					'81' => [
						'name' => __( 'Nordjylland', 'voxel-countries' ),
					],
					'85' => [
						'name' => __( 'Sjælland', 'voxel-countries' ),
					],
					'83' => [
						'name' => __( 'Syddanmark', 'voxel-countries' ),
					],
				]
			],
			'DM' => [
				'code3' => 'DMA',
				'name' => __( 'Dominica', 'voxel-countries' ),
				'continent' => 'North America',
				'states' => [
					'02' => [
						'name' => __( 'Saint Andrew', 'voxel-countries' ),
					],
					'03' => [
						'name' => __( 'Saint David', 'voxel-countries' ),
					],
					'04' => [
						'name' => __( 'Saint George', 'voxel-countries' ),
					],
					'05' => [
						'name' => __( 'Saint John', 'voxel-countries' ),
					],
					'06' => [
						'name' => __( 'Saint Joseph', 'voxel-countries' ),
					],
					'07' => [
						'name' => __( 'Saint Luke', 'voxel-countries' ),
					],
					'08' => [
						'name' => __( 'Saint Mark', 'voxel-countries' ),
					],
					'09' => [
						'name' => __( 'Saint Patrick', 'voxel-countries' ),
					],
					'10' => [
						'name' => __( 'Saint Paul', 'voxel-countries' ),
					],
					'11' => [
						'name' => __( 'Saint Peter', 'voxel-countries' ),
					],
				]
			],
			'DO' => [
				'code3' => 'DOM',
				'name' => __( 'Dominican Republic', 'voxel-countries' ),
				'continent' => 'North America',
				'states' => [
					'33' => [
						'name' => __( 'Cibao Nordeste', 'voxel-countries' ),
					],
					'34' => [
						'name' => __( 'Cibao Noroeste', 'voxel-countries' ),
					],
					'35' => [
						'name' => __( 'Cibao Norte', 'voxel-countries' ),
					],
					'36' => [
						'name' => __( 'Cibao Sur', 'voxel-countries' ),
					],
					'37' => [
						'name' => __( 'El Valle', 'voxel-countries' ),
					],
					'38' => [
						'name' => __( 'Enriquillo', 'voxel-countries' ),
					],
					'39' => [
						'name' => __( 'Higuamo', 'voxel-countries' ),
					],
					'40' => [
						'name' => __( 'Ozama', 'voxel-countries' ),
					],
					'41' => [
						'name' => __( 'Valdesia', 'voxel-countries' ),
					],
					'42' => [
						'name' => __( 'Yuma', 'voxel-countries' ),
					],
				]
			],
			'DZ' => [
				'code3' => 'DZA',
				'name' => __( 'Algeria', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'01' => [
						'name' => __( 'Adrar', 'voxel-countries' ),
					],
					'16' => [
						'name' => __( 'Alger', 'voxel-countries' ),
					],
					'23' => [
						'name' => __( 'Annaba', 'voxel-countries' ),
					],
					'44' => [
						'name' => __( 'Aïn Defla', 'voxel-countries' ),
					],
					'46' => [
						'name' => __( 'Aïn Témouchent', 'voxel-countries' ),
					],
					'05' => [
						'name' => __( 'Batna', 'voxel-countries' ),
					],
					'07' => [
						'name' => __( 'Biskra', 'voxel-countries' ),
					],
					'09' => [
						'name' => __( 'Blida', 'voxel-countries' ),
					],
					'34' => [
						'name' => __( 'Bordj Bou Arréridj', 'voxel-countries' ),
					],
					'10' => [
						'name' => __( 'Bouira', 'voxel-countries' ),
					],
					'35' => [
						'name' => __( 'Boumerdès', 'voxel-countries' ),
					],
					'08' => [
						'name' => __( 'Béchar', 'voxel-countries' ),
					],
					'06' => [
						'name' => __( 'Béjaïa', 'voxel-countries' ),
					],
					'02' => [
						'name' => __( 'Chlef', 'voxel-countries' ),
					],
					'25' => [
						'name' => __( 'Constantine', 'voxel-countries' ),
					],
					'17' => [
						'name' => __( 'Djelfa', 'voxel-countries' ),
					],
					'32' => [
						'name' => __( 'El Bayadh', 'voxel-countries' ),
					],
					'39' => [
						'name' => __( 'El Oued', 'voxel-countries' ),
					],
					'36' => [
						'name' => __( 'El Tarf', 'voxel-countries' ),
					],
					'47' => [
						'name' => __( 'Ghardaïa', 'voxel-countries' ),
					],
					'24' => [
						'name' => __( 'Guelma', 'voxel-countries' ),
					],
					'33' => [
						'name' => __( 'Illizi', 'voxel-countries' ),
					],
					'18' => [
						'name' => __( 'Jijel', 'voxel-countries' ),
					],
					'40' => [
						'name' => __( 'Khenchela', 'voxel-countries' ),
					],
					'03' => [
						'name' => __( 'Laghouat', 'voxel-countries' ),
					],
					'29' => [
						'name' => __( 'Mascara', 'voxel-countries' ),
					],
					'43' => [
						'name' => __( 'Mila', 'voxel-countries' ),
					],
					'27' => [
						'name' => __( 'Mostaganem', 'voxel-countries' ),
					],
					'28' => [
						'name' => __( 'Msila', 'voxel-countries' ),
					],
					'26' => [
						'name' => __( 'Médéa', 'voxel-countries' ),
					],
					'45' => [
						'name' => __( 'Naama', 'voxel-countries' ),
					],
					'31' => [
						'name' => __( 'Oran', 'voxel-countries' ),
					],
					'30' => [
						'name' => __( 'Ouargla', 'voxel-countries' ),
					],
					'04' => [
						'name' => __( 'Oum el Bouaghi', 'voxel-countries' ),
					],
					'48' => [
						'name' => __( 'Relizane', 'voxel-countries' ),
					],
					'20' => [
						'name' => __( 'Saïda', 'voxel-countries' ),
					],
					'22' => [
						'name' => __( 'Sidi Bel Abbès', 'voxel-countries' ),
					],
					'21' => [
						'name' => __( 'Skikda', 'voxel-countries' ),
					],
					'41' => [
						'name' => __( 'Souk Ahras', 'voxel-countries' ),
					],
					'19' => [
						'name' => __( 'Sétif', 'voxel-countries' ),
					],
					'11' => [
						'name' => __( 'Tamanghasset', 'voxel-countries' ),
					],
					'14' => [
						'name' => __( 'Tiaret', 'voxel-countries' ),
					],
					'37' => [
						'name' => __( 'Tindouf', 'voxel-countries' ),
					],
					'42' => [
						'name' => __( 'Tipaza', 'voxel-countries' ),
					],
					'38' => [
						'name' => __( 'Tissemsilt', 'voxel-countries' ),
					],
					'15' => [
						'name' => __( 'Tizi Ouzou', 'voxel-countries' ),
					],
					'13' => [
						'name' => __( 'Tlemcen', 'voxel-countries' ),
					],
					'12' => [
						'name' => __( 'Tébessa', 'voxel-countries' ),
					],
				]
			],
			'EC' => [
				'code3' => 'ECU',
				'name' => __( 'Ecuador', 'voxel-countries' ),
				'continent' => 'South America',
				'states' => [
					'A' => [
						'name' => __( 'Azuay', 'voxel-countries' ),
					],
					'B' => [
						'name' => __( 'Bolívar', 'voxel-countries' ),
					],
					'C' => [
						'name' => __( 'Carchi', 'voxel-countries' ),
					],
					'F' => [
						'name' => __( 'Cañar', 'voxel-countries' ),
					],
					'H' => [
						'name' => __( 'Chimborazo', 'voxel-countries' ),
					],
					'X' => [
						'name' => __( 'Cotopaxi', 'voxel-countries' ),
					],
					'O' => [
						'name' => __( 'El Oro', 'voxel-countries' ),
					],
					'E' => [
						'name' => __( 'Esmeraldas', 'voxel-countries' ),
					],
					'W' => [
						'name' => __( 'Galápagos', 'voxel-countries' ),
					],
					'G' => [
						'name' => __( 'Guayas', 'voxel-countries' ),
					],
					'I' => [
						'name' => __( 'Imbabura', 'voxel-countries' ),
					],
					'L' => [
						'name' => __( 'Loja', 'voxel-countries' ),
					],
					'R' => [
						'name' => __( 'Los Ríos', 'voxel-countries' ),
					],
					'M' => [
						'name' => __( 'Manabí', 'voxel-countries' ),
					],
					'S' => [
						'name' => __( 'Morona-Santiago', 'voxel-countries' ),
					],
					'N' => [
						'name' => __( 'Napo', 'voxel-countries' ),
					],
					'D' => [
						'name' => __( 'Orellana', 'voxel-countries' ),
					],
					'Y' => [
						'name' => __( 'Pastaza', 'voxel-countries' ),
					],
					'P' => [
						'name' => __( 'Pichincha', 'voxel-countries' ),
					],
					'SE' => [
						'name' => __( 'Santa Elena', 'voxel-countries' ),
					],
					'SD' => [
						'name' => __( 'Santo Domingo de los Tsáchilas', 'voxel-countries' ),
					],
					'U' => [
						'name' => __( 'Sucumbíos', 'voxel-countries' ),
					],
					'T' => [
						'name' => __( 'Tungurahua', 'voxel-countries' ),
					],
					'Z' => [
						'name' => __( 'Zamora-Chinchipe', 'voxel-countries' ),
					],
				]
			],
			'EE' => [
				'code3' => 'EST',
				'name' => __( 'Estonia', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [
					'37' => [
						'name' => __( 'Harjumaa', 'voxel-countries' ),
					],
					'39' => [
						'name' => __( 'Hiiumaa', 'voxel-countries' ),
					],
					'44' => [
						'name' => __( 'Ida-Virumaa', 'voxel-countries' ),
					],
					'51' => [
						'name' => __( 'Järvamaa', 'voxel-countries' ),
					],
					'49' => [
						'name' => __( 'Jõgevamaa', 'voxel-countries' ),
					],
					'59' => [
						'name' => __( 'Lääne-Virumaa', 'voxel-countries' ),
					],
					'57' => [
						'name' => __( 'Läänemaa', 'voxel-countries' ),
					],
					'67' => [
						'name' => __( 'Pärnumaa', 'voxel-countries' ),
					],
					'65' => [
						'name' => __( 'Põlvamaa', 'voxel-countries' ),
					],
					'70' => [
						'name' => __( 'Raplamaa', 'voxel-countries' ),
					],
					'74' => [
						'name' => __( 'Saaremaa', 'voxel-countries' ),
					],
					'78' => [
						'name' => __( 'Tartumaa', 'voxel-countries' ),
					],
					'82' => [
						'name' => __( 'Valgamaa', 'voxel-countries' ),
					],
					'84' => [
						'name' => __( 'Viljandimaa', 'voxel-countries' ),
					],
					'86' => [
						'name' => __( 'Võrumaa', 'voxel-countries' ),
					],
				]
			],
			'EG' => [
				'code3' => 'EGY',
				'name' => __( 'Egypt', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'DK' => [
						'name' => __( 'Ad Daqahlīyah', 'voxel-countries' ),
					],
					'BA' => [
						'name' => __( 'Al Baḩr al Aḩmar', 'voxel-countries' ),
					],
					'BH' => [
						'name' => __( 'Al Buḩayrah', 'voxel-countries' ),
					],
					'FYM' => [
						'name' => __( 'Al Fayyūm', 'voxel-countries' ),
					],
					'GH' => [
						'name' => __( 'Al Gharbīyah', 'voxel-countries' ),
					],
					'ALX' => [
						'name' => __( 'Al Iskandarīyah', 'voxel-countries' ),
					],
					'IS' => [
						'name' => __( 'Al Ismāٰīlīyah', 'voxel-countries' ),
					],
					'GZ' => [
						'name' => __( 'Al Jīzah', 'voxel-countries' ),
					],
					'MN' => [
						'name' => __( 'Al Minyā', 'voxel-countries' ),
					],
					'MNF' => [
						'name' => __( 'Al Minūfīyah', 'voxel-countries' ),
					],
					'KB' => [
						'name' => __( 'Al Qalyūbīyah', 'voxel-countries' ),
					],
					'C' => [
						'name' => __( 'Al Qāhirah', 'voxel-countries' ),
					],
					'LX' => [
						'name' => __( 'Al Uqşur', 'voxel-countries' ),
					],
					'WAD' => [
						'name' => __( 'Al Wādī al Jadīd', 'voxel-countries' ),
					],
					'SUZ' => [
						'name' => __( 'As Suways', 'voxel-countries' ),
					],
					'SU' => [
						'name' => __( 'As Sādis min Uktūbar', 'voxel-countries' ),
					],
					'SHR' => [
						'name' => __( 'Ash Sharqīyah', 'voxel-countries' ),
					],
					'ASN' => [
						'name' => __( 'Aswān', 'voxel-countries' ),
					],
					'AST' => [
						'name' => __( 'Asyūţ', 'voxel-countries' ),
					],
					'BNS' => [
						'name' => __( 'Banī Suwayf', 'voxel-countries' ),
					],
					'PTS' => [
						'name' => __( 'Būr Saٰīd', 'voxel-countries' ),
					],
					'DT' => [
						'name' => __( 'Dumyāţ', 'voxel-countries' ),
					],
					'JS' => [
						'name' => __( 'Janūb Sīnā\'', 'voxel-countries' ),
					],
					'KFS' => [
						'name' => __( 'Kafr ash Shaykh', 'voxel-countries' ),
					],
					'MT' => [
						'name' => __( 'Maţrūḩ', 'voxel-countries' ),
					],
					'KN' => [
						'name' => __( 'Qinā', 'voxel-countries' ),
					],
					'SIN' => [
						'name' => __( 'Shamāl Sīnā\'', 'voxel-countries' ),
					],
					'SHG' => [
						'name' => __( 'Sūhāj', 'voxel-countries' ),
					],
					'HU' => [
						'name' => __( 'Ḩulwān', 'voxel-countries' ),
					],
				]
			],
			'EH' => [
				'code3' => 'ESH',
				'name' => __( 'Western Sahara', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [],
			],
			'ER' => [
				'code3' => 'ERI',
				'name' => __( 'Eritrea', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'MA' => [
						'name' => __( 'Al Awsaţ', 'voxel-countries' ),
					],
					'DU' => [
						'name' => __( 'Al Janūbĩ', 'voxel-countries' ),
					],
					'AN' => [
						'name' => __( 'Ansabā', 'voxel-countries' ),
					],
					'DK' => [
						'name' => __( 'Janūbī al Baḩrī al Aḩmar', 'voxel-countries' ),
					],
					'GB' => [
						'name' => __( 'Qāsh-Barkah', 'voxel-countries' ),
					],
					'SK' => [
						'name' => __( 'Shimālī al Baḩrī al Aḩmar', 'voxel-countries' ),
					],
				]
			],
			'ES' => [
				'code3' => 'ESP',
				'name' => __( 'Spain', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [
					'C' => [
						'name' => __( 'A Coruña', 'voxel-countries' ),
					],
					'AB' => [
						'name' => __( 'Albacete', 'voxel-countries' ),
					],
					'A' => [
						'name' => __( 'Alicante', 'voxel-countries' ),
					],
					'AL' => [
						'name' => __( 'Almería', 'voxel-countries' ),
					],
					'O' => [
						'name' => __( 'Asturias', 'voxel-countries' ),
					],
					'BA' => [
						'name' => __( 'Badajoz', 'voxel-countries' ),
					],
					'PM' => [
						'name' => __( 'Balears', 'voxel-countries' ),
					],
					'B' => [
						'name' => __( 'Barcelona', 'voxel-countries' ),
					],
					'BU' => [
						'name' => __( 'Burgos', 'voxel-countries' ),
					],
					'S' => [
						'name' => __( 'Cantabria', 'voxel-countries' ),
					],
					'CS' => [
						'name' => __( 'Castellón', 'voxel-countries' ),
					],
					'CR' => [
						'name' => __( 'Ciudad Real', 'voxel-countries' ),
					],
					'CU' => [
						'name' => __( 'Cuenca', 'voxel-countries' ),
					],
					'CC' => [
						'name' => __( 'Cáceres', 'voxel-countries' ),
					],
					'CA' => [
						'name' => __( 'Cádiz', 'voxel-countries' ),
					],
					'CO' => [
						'name' => __( 'Córdoba', 'voxel-countries' ),
					],
					'GI' => [
						'name' => __( 'Girona', 'voxel-countries' ),
					],
					'GR' => [
						'name' => __( 'Granada', 'voxel-countries' ),
					],
					'GU' => [
						'name' => __( 'Guadalajara', 'voxel-countries' ),
					],
					'SS' => [
						'name' => __( 'Guipúzcoa', 'voxel-countries' ),
					],
					'H' => [
						'name' => __( 'Huelva', 'voxel-countries' ),
					],
					'HU' => [
						'name' => __( 'Huesca', 'voxel-countries' ),
					],
					'J' => [
						'name' => __( 'Jaén', 'voxel-countries' ),
					],
					'LO' => [
						'name' => __( 'La Rioja', 'voxel-countries' ),
					],
					'GC' => [
						'name' => __( 'Las Palmas', 'voxel-countries' ),
					],
					'LE' => [
						'name' => __( 'León', 'voxel-countries' ),
					],
					'L' => [
						'name' => __( 'Lleida', 'voxel-countries' ),
					],
					'LU' => [
						'name' => __( 'Lugo', 'voxel-countries' ),
					],
					'M' => [
						'name' => __( 'Madrid', 'voxel-countries' ),
					],
					'MU' => [
						'name' => __( 'Murcia', 'voxel-countries' ),
					],
					'MA' => [
						'name' => __( 'Málaga', 'voxel-countries' ),
					],
					'NA' => [
						'name' => __( 'Navarra', 'voxel-countries' ),
					],
					'OR' => [
						'name' => __( 'Ourense', 'voxel-countries' ),
					],
					'P' => [
						'name' => __( 'Palencia', 'voxel-countries' ),
					],
					'PO' => [
						'name' => __( 'Pontevedra', 'voxel-countries' ),
					],
					'SA' => [
						'name' => __( 'Salamanca', 'voxel-countries' ),
					],
					'TF' => [
						'name' => __( 'Santa Cruz de Tenerife', 'voxel-countries' ),
					],
					'SG' => [
						'name' => __( 'Segovia', 'voxel-countries' ),
					],
					'SE' => [
						'name' => __( 'Sevilla', 'voxel-countries' ),
					],
					'SO' => [
						'name' => __( 'Soria', 'voxel-countries' ),
					],
					'T' => [
						'name' => __( 'Tarragona', 'voxel-countries' ),
					],
					'TE' => [
						'name' => __( 'Teruel', 'voxel-countries' ),
					],
					'TO' => [
						'name' => __( 'Toledo', 'voxel-countries' ),
					],
					'V' => [
						'name' => __( 'Valencia', 'voxel-countries' ),
					],
					'VA' => [
						'name' => __( 'Valladolid', 'voxel-countries' ),
					],
					'BI' => [
						'name' => __( 'Vizcaya', 'voxel-countries' ),
					],
					'ZA' => [
						'name' => __( 'Zamora', 'voxel-countries' ),
					],
					'Z' => [
						'name' => __( 'Zaragoza', 'voxel-countries' ),
					],
					'VI' => [
						'name' => __( 'Álava', 'voxel-countries' ),
					],
					'AV' => [
						'name' => __( 'Ávila', 'voxel-countries' ),
					],
					'CE' => [
						'name' => __( 'Ceuta', 'voxel-countries' ),
					],
					'ML' => [
						'name' => __( 'Melilla', 'voxel-countries' ),
					],
					'AN' => [
						'name' => __( 'Andalucía', 'voxel-countries' ),
					],
					'AR' => [
						'name' => __( 'Aragón', 'voxel-countries' ),
					],
					'AS' => [
						'name' => __( 'Asturias, Principado de', 'voxel-countries' ),
					],
					'CN' => [
						'name' => __( 'Canarias', 'voxel-countries' ),
					],
					'CB' => [
						'name' => __( 'Cantabria', 'voxel-countries' ),
					],
					'CL' => [
						'name' => __( 'Castilla y León', 'voxel-countries' ),
					],
					'CM' => [
						'name' => __( 'Castilla-La Mancha', 'voxel-countries' ),
					],
					'CT' => [
						'name' => __( 'Catalunya', 'voxel-countries' ),
					],
					'EX' => [
						'name' => __( 'Extremadura', 'voxel-countries' ),
					],
					'GA' => [
						'name' => __( 'Galicia', 'voxel-countries' ),
					],
					'IB' => [
						'name' => __( 'Illes Balears', 'voxel-countries' ),
					],
					'RI' => [
						'name' => __( 'La Rioja', 'voxel-countries' ),
					],
					'MD' => [
						'name' => __( 'Madrid, Comunidad de', 'voxel-countries' ),
					],
					'MC' => [
						'name' => __( 'Murcia, Región de', 'voxel-countries' ),
					],
					'NC' => [
						'name' => __( 'Navarra, Comunidad Foral de', 'voxel-countries' ),
					],
					'PV' => [
						'name' => __( 'País Vasco', 'voxel-countries' ),
					],
					'VC' => [
						'name' => __( 'Valenciana, Comunidad', 'voxel-countries' ),
					],
				]
			],
			'ET' => [
				'code3' => 'ETH',
				'name' => __( 'Ethiopia', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'BE' => [
						'name' => __( 'Bīnshangul Gumuz', 'voxel-countries' ),
					],
					'DD' => [
						'name' => __( 'Dirē Dawa', 'voxel-countries' ),
					],
					'GA' => [
						'name' => __( 'Gambēla Hizboch', 'voxel-countries' ),
					],
					'HA' => [
						'name' => __( 'Hārerī Hizb', 'voxel-countries' ),
					],
					'OR' => [
						'name' => __( 'Oromīya', 'voxel-countries' ),
					],
					'SO' => [
						'name' => __( 'Sumalē', 'voxel-countries' ),
					],
					'TI' => [
						'name' => __( 'Tigray', 'voxel-countries' ),
					],
					'SN' => [
						'name' => __( 'YeDebub Bihēroch Bihēreseboch na Hizboch', 'voxel-countries' ),
					],
					'AA' => [
						'name' => __( 'Ādīs Ābeba', 'voxel-countries' ),
					],
					'AF' => [
						'name' => __( 'Āfar', 'voxel-countries' ),
					],
					'AM' => [
						'name' => __( 'Āmara', 'voxel-countries' ),
					],
				]
			],
			'FI' => [
				'code3' => 'FIN',
				'name' => __( 'Finland', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [
					'01' => [
						'name' => __( 'Ahvenanmaan maakunta', 'voxel-countries' ),
					],
					'02' => [
						'name' => __( 'Etelä-Karjala', 'voxel-countries' ),
					],
					'03' => [
						'name' => __( 'Etelä-Pohjanmaa', 'voxel-countries' ),
					],
					'04' => [
						'name' => __( 'Etelä-Savo', 'voxel-countries' ),
					],
					'05' => [
						'name' => __( 'Kainuu', 'voxel-countries' ),
					],
					'06' => [
						'name' => __( 'Kanta-Häme', 'voxel-countries' ),
					],
					'07' => [
						'name' => __( 'Keski-Pohjanmaa', 'voxel-countries' ),
					],
					'08' => [
						'name' => __( 'Keski-Suomi', 'voxel-countries' ),
					],
					'09' => [
						'name' => __( 'Kymenlaakso', 'voxel-countries' ),
					],
					'10' => [
						'name' => __( 'Lappi', 'voxel-countries' ),
					],
					'11' => [
						'name' => __( 'Pirkanmaa', 'voxel-countries' ),
					],
					'12' => [
						'name' => __( 'Pohjanmaa', 'voxel-countries' ),
					],
					'13' => [
						'name' => __( 'Pohjois-Karjala', 'voxel-countries' ),
					],
					'14' => [
						'name' => __( 'Pohjois-Pohjanmaa', 'voxel-countries' ),
					],
					'15' => [
						'name' => __( 'Pohjois-Savo', 'voxel-countries' ),
					],
					'16' => [
						'name' => __( 'Päijät-Häme', 'voxel-countries' ),
					],
					'17' => [
						'name' => __( 'Satakunta', 'voxel-countries' ),
					],
					'18' => [
						'name' => __( 'Uusimaa', 'voxel-countries' ),
					],
					'19' => [
						'name' => __( 'Varsinais-Suomi', 'voxel-countries' ),
					],
				]
			],
			'FJ' => [
				'code3' => 'FJI',
				'name' => __( 'Fiji', 'voxel-countries' ),
				'continent' => 'Oceania',
				'states' => [
					'C' => [
						'name' => __( 'Central', 'voxel-countries' ),
					],
					'E' => [
						'name' => __( 'Eastern', 'voxel-countries' ),
					],
					'N' => [
						'name' => __( 'Northern', 'voxel-countries' ),
					],
					'R' => [
						'name' => __( 'Rotuma', 'voxel-countries' ),
					],
					'W' => [
						'name' => __( 'Western', 'voxel-countries' ),
					],
				]
			],
			'FK' => [
				'code3' => 'FLK',
				'name' => __( 'Falkland Islands', 'voxel-countries' ),
				'continent' => 'South America',
				'states' => [],
			],
			'FM' => [
				'code3' => 'FSM',
				'name' => __( 'Federated States of Micronesia', 'voxel-countries' ),
				'continent' => 'Oceania',
				'states' => [
					'TRK' => [
						'name' => __( 'Chuuk', 'voxel-countries' ),
					],
					'KSA' => [
						'name' => __( 'Kosrae', 'voxel-countries' ),
					],
					'PNI' => [
						'name' => __( 'Pohnpei', 'voxel-countries' ),
					],
					'YAP' => [
						'name' => __( 'Yap', 'voxel-countries' ),
					],
				]
			],
			'FO' => [
				'code3' => 'FRO',
				'name' => __( 'Faroe Islands', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [],
			],
			'FR' => [
				'code3' => 'FRA',
				'name' => __( 'France', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [
					'ARA' => [
						'name' => __( 'Auvergne-Rhône-Alpes', 'voxel-countries' ),
					],
					'BFC' => [
						'name' => __( 'Bourgogne-Franche-Comté', 'voxel-countries' ),
					],
					'BRE' => [
						'name' => __( 'Brittany', 'voxel-countries' ),
					],
					'CVL' => [
						'name' => __( 'Centre-Val de Loire', 'voxel-countries' ),
					],
					'COR' => [
						'name' => __( 'Corsica', 'voxel-countries' ),
					],
					'GES' => [
						'name' => __( 'Grand Est', 'voxel-countries' ),
					],
					'HDF' => [
						'name' => __( 'Hauts-de-France', 'voxel-countries' ),
					],
					'IDF' => [
						'name' => __( 'Île-de-France', 'voxel-countries' ),
					],
					'NOR' => [
						'name' => __( 'Normandy', 'voxel-countries' ),
					],
					'NAQ' => [
						'name' => __( 'Nouvelle-Aquitaine', 'voxel-countries' ),
					],
					'OCC' => [
						'name' => __( 'Occitanie', 'voxel-countries' ),
					],
					'PDL' => [
						'name' => __( 'Pays de la Loire', 'voxel-countries' ),
					],
					'PAC' => [
						'name' => __( 'Provence-Alpes-Côte d\'Azur', 'voxel-countries' ),
					],
					'GP' => [
						'name' => __( 'Guadeloupe', 'voxel-countries' ),
					],
					'GF' => [
						'name' => __( 'French Guiana', 'voxel-countries' ),
					],
					'RE' => [
						'name' => __( 'Réunion', 'voxel-countries' ),
					],
					'MQ' => [
						'name' => __( 'Martinique', 'voxel-countries' ),
					],
					'YT' => [
						'name' => __( 'Mayotte', 'voxel-countries' ),
					],
				]
			],
			'GA' => [
				'code3' => 'GAB',
				'name' => __( 'Gabon', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'1' => [
						'name' => __( 'Estuaire', 'voxel-countries' ),
					],
					'2' => [
						'name' => __( 'Haut-Ogooué', 'voxel-countries' ),
					],
					'3' => [
						'name' => __( 'Moyen-Ogooué', 'voxel-countries' ),
					],
					'4' => [
						'name' => __( 'Ngounié', 'voxel-countries' ),
					],
					'5' => [
						'name' => __( 'Nyanga', 'voxel-countries' ),
					],
					'6' => [
						'name' => __( 'Ogooué-Ivindo', 'voxel-countries' ),
					],
					'7' => [
						'name' => __( 'Ogooué-Lolo', 'voxel-countries' ),
					],
					'8' => [
						'name' => __( 'Ogooué-Maritime', 'voxel-countries' ),
					],
					'9' => [
						'name' => __( 'Woleu-Ntem', 'voxel-countries' ),
					],
				]
			],
			'GB' => [
				'code3' => 'GBR',
				'name' => __( 'United Kingdom', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [
					'BDG' => [
						'name' => __( 'Barking and Dagenham', 'voxel-countries' ),
					],
					'BNE' => [
						'name' => __( 'Barnet', 'voxel-countries' ),
					],
					'BEX' => [
						'name' => __( 'Bexley', 'voxel-countries' ),
					],
					'BEN' => [
						'name' => __( 'Brent', 'voxel-countries' ),
					],
					'BRY' => [
						'name' => __( 'Bromley', 'voxel-countries' ),
					],
					'CMD' => [
						'name' => __( 'Camden', 'voxel-countries' ),
					],
					'CRY' => [
						'name' => __( 'Croydon', 'voxel-countries' ),
					],
					'EAL' => [
						'name' => __( 'Ealing', 'voxel-countries' ),
					],
					'ENF' => [
						'name' => __( 'Enfield', 'voxel-countries' ),
					],
					'GRE' => [
						'name' => __( 'Greenwich', 'voxel-countries' ),
					],
					'HCK' => [
						'name' => __( 'Hackney', 'voxel-countries' ),
					],
					'HMF' => [
						'name' => __( 'Hammersmith and Fulham', 'voxel-countries' ),
					],
					'HRY' => [
						'name' => __( 'Haringey', 'voxel-countries' ),
					],
					'HRW' => [
						'name' => __( 'Harrow', 'voxel-countries' ),
					],
					'HAV' => [
						'name' => __( 'Havering', 'voxel-countries' ),
					],
					'HIL' => [
						'name' => __( 'Hillingdon', 'voxel-countries' ),
					],
					'HNS' => [
						'name' => __( 'Hounslow', 'voxel-countries' ),
					],
					'ISL' => [
						'name' => __( 'Islington', 'voxel-countries' ),
					],
					'KEC' => [
						'name' => __( 'Kensington and Chelsea', 'voxel-countries' ),
					],
					'KTT' => [
						'name' => __( 'Kingston upon Thames', 'voxel-countries' ),
					],
					'LBH' => [
						'name' => __( 'Lambeth', 'voxel-countries' ),
					],
					'LEW' => [
						'name' => __( 'Lewisham', 'voxel-countries' ),
					],
					'MRT' => [
						'name' => __( 'Merton', 'voxel-countries' ),
					],
					'NWM' => [
						'name' => __( 'Newham', 'voxel-countries' ),
					],
					'RDB' => [
						'name' => __( 'Redbridge', 'voxel-countries' ),
					],
					'RIC' => [
						'name' => __( 'Richmond upon Thames', 'voxel-countries' ),
					],
					'SWK' => [
						'name' => __( 'Southwark', 'voxel-countries' ),
					],
					'STN' => [
						'name' => __( 'Sutton', 'voxel-countries' ),
					],
					'TWH' => [
						'name' => __( 'Tower Hamlets', 'voxel-countries' ),
					],
					'WFT' => [
						'name' => __( 'Waltham Forest', 'voxel-countries' ),
					],
					'WND' => [
						'name' => __( 'Wandsworth', 'voxel-countries' ),
					],
					'WSM' => [
						'name' => __( 'Westminster', 'voxel-countries' ),
					],
					'EAW' => [
						'name' => __( 'England and Wales', 'voxel-countries' ),
					],
					'GBN' => [
						'name' => __( 'Great Britain', 'voxel-countries' ),
					],
					'UKM' => [
						'name' => __( 'United Kingdom', 'voxel-countries' ),
					],
					'LND' => [
						'name' => __( 'London, City of', 'voxel-countries' ),
					],
					'ABE' => [
						'name' => __( 'Aberdeen City', 'voxel-countries' ),
					],
					'ABD' => [
						'name' => __( 'Aberdeenshire', 'voxel-countries' ),
					],
					'ANS' => [
						'name' => __( 'Angus', 'voxel-countries' ),
					],
					'AGB' => [
						'name' => __( 'Argyll and Bute', 'voxel-countries' ),
					],
					'CLK' => [
						'name' => __( 'Clackmannanshire', 'voxel-countries' ),
					],
					'DGY' => [
						'name' => __( 'Dumfries and Galloway', 'voxel-countries' ),
					],
					'DND' => [
						'name' => __( 'Dundee City', 'voxel-countries' ),
					],
					'EAY' => [
						'name' => __( 'East Ayrshire', 'voxel-countries' ),
					],
					'EDU' => [
						'name' => __( 'East Dunbartonshire', 'voxel-countries' ),
					],
					'ELN' => [
						'name' => __( 'East Lothian', 'voxel-countries' ),
					],
					'ERW' => [
						'name' => __( 'East Renfrewshire', 'voxel-countries' ),
					],
					'EDH' => [
						'name' => __( 'Edinburgh, City of', 'voxel-countries' ),
					],
					'ELS' => [
						'name' => __( 'Eilean Siar', 'voxel-countries' ),
					],
					'FAL' => [
						'name' => __( 'Falkirk', 'voxel-countries' ),
					],
					'FIF' => [
						'name' => __( 'Fife', 'voxel-countries' ),
					],
					'GLG' => [
						'name' => __( 'Glasgow City', 'voxel-countries' ),
					],
					'HLD' => [
						'name' => __( 'Highland', 'voxel-countries' ),
					],
					'IVC' => [
						'name' => __( 'Inverclyde', 'voxel-countries' ),
					],
					'MLN' => [
						'name' => __( 'Midlothian', 'voxel-countries' ),
					],
					'MRY' => [
						'name' => __( 'Moray', 'voxel-countries' ),
					],
					'NAY' => [
						'name' => __( 'North Ayrshire', 'voxel-countries' ),
					],
					'NLK' => [
						'name' => __( 'North Lanarkshire', 'voxel-countries' ),
					],
					'ORK' => [
						'name' => __( 'Orkney Islands', 'voxel-countries' ),
					],
					'PKN' => [
						'name' => __( 'Perth and Kinross', 'voxel-countries' ),
					],
					'RFW' => [
						'name' => __( 'Renfrewshire', 'voxel-countries' ),
					],
					'SCB' => [
						'name' => __( 'Scottish Borders, The', 'voxel-countries' ),
					],
					'ZET' => [
						'name' => __( 'Shetland Islands', 'voxel-countries' ),
					],
					'SAY' => [
						'name' => __( 'South Ayrshire', 'voxel-countries' ),
					],
					'SLK' => [
						'name' => __( 'South Lanarkshire', 'voxel-countries' ),
					],
					'STG' => [
						'name' => __( 'Stirling', 'voxel-countries' ),
					],
					'WDU' => [
						'name' => __( 'West Dunbartonshire', 'voxel-countries' ),
					],
					'WLN' => [
						'name' => __( 'West Lothian', 'voxel-countries' ),
					],
					'ENG' => [
						'name' => __( 'England', 'voxel-countries' ),
					],
					'SCT' => [
						'name' => __( 'Scotland', 'voxel-countries' ),
					],
					'WLS' => [
						'name' => __( 'Wales', 'voxel-countries' ),
					],
					'ANT' => [
						'name' => __( 'Antrim', 'voxel-countries' ),
					],
					'ARD' => [
						'name' => __( 'Ards', 'voxel-countries' ),
					],
					'ARM' => [
						'name' => __( 'Armagh', 'voxel-countries' ),
					],
					'BLA' => [
						'name' => __( 'Ballymena', 'voxel-countries' ),
					],
					'BLY' => [
						'name' => __( 'Ballymoney', 'voxel-countries' ),
					],
					'BNB' => [
						'name' => __( 'Banbridge', 'voxel-countries' ),
					],
					'BFS' => [
						'name' => __( 'Belfast', 'voxel-countries' ),
					],
					'CKF' => [
						'name' => __( 'Carrickfergus', 'voxel-countries' ),
					],
					'CSR' => [
						'name' => __( 'Castlereagh', 'voxel-countries' ),
					],
					'CLR' => [
						'name' => __( 'Coleraine', 'voxel-countries' ),
					],
					'CKT' => [
						'name' => __( 'Cookstown', 'voxel-countries' ),
					],
					'CGV' => [
						'name' => __( 'Craigavon', 'voxel-countries' ),
					],
					'DRY' => [
						'name' => __( 'Derry', 'voxel-countries' ),
					],
					'DOW' => [
						'name' => __( 'Down', 'voxel-countries' ),
					],
					'DGN' => [
						'name' => __( 'Dungannon and South Tyrone', 'voxel-countries' ),
					],
					'FER' => [
						'name' => __( 'Fermanagh', 'voxel-countries' ),
					],
					'LRN' => [
						'name' => __( 'Larne', 'voxel-countries' ),
					],
					'LMV' => [
						'name' => __( 'Limavady', 'voxel-countries' ),
					],
					'LSB' => [
						'name' => __( 'Lisburn', 'voxel-countries' ),
					],
					'MFT' => [
						'name' => __( 'Magherafelt', 'voxel-countries' ),
					],
					'MYL' => [
						'name' => __( 'Moyle', 'voxel-countries' ),
					],
					'NYM' => [
						'name' => __( 'Newry and Mourne District', 'voxel-countries' ),
					],
					'NTA' => [
						'name' => __( 'Newtownabbey', 'voxel-countries' ),
					],
					'NDN' => [
						'name' => __( 'North Down', 'voxel-countries' ),
					],
					'OMH' => [
						'name' => __( 'Omagh', 'voxel-countries' ),
					],
					'STB' => [
						'name' => __( 'Strabane', 'voxel-countries' ),
					],
					'BNS' => [
						'name' => __( 'Barnsley', 'voxel-countries' ),
					],
					'BIR' => [
						'name' => __( 'Birmingham', 'voxel-countries' ),
					],
					'BOL' => [
						'name' => __( 'Bolton', 'voxel-countries' ),
					],
					'BRD' => [
						'name' => __( 'Bradford', 'voxel-countries' ),
					],
					'BUR' => [
						'name' => __( 'Bury', 'voxel-countries' ),
					],
					'CLD' => [
						'name' => __( 'Calderdale', 'voxel-countries' ),
					],
					'COV' => [
						'name' => __( 'Coventry', 'voxel-countries' ),
					],
					'DNC' => [
						'name' => __( 'Doncaster', 'voxel-countries' ),
					],
					'DUD' => [
						'name' => __( 'Dudley', 'voxel-countries' ),
					],
					'GAT' => [
						'name' => __( 'Gateshead', 'voxel-countries' ),
					],
					'KIR' => [
						'name' => __( 'Kirklees', 'voxel-countries' ),
					],
					'KWL' => [
						'name' => __( 'Knowsley', 'voxel-countries' ),
					],
					'LDS' => [
						'name' => __( 'Leeds', 'voxel-countries' ),
					],
					'LIV' => [
						'name' => __( 'Liverpool', 'voxel-countries' ),
					],
					'MAN' => [
						'name' => __( 'Manchester', 'voxel-countries' ),
					],
					'NET' => [
						'name' => __( 'Newcastle upon Tyne', 'voxel-countries' ),
					],
					'NTY' => [
						'name' => __( 'North Tyneside', 'voxel-countries' ),
					],
					'OLD' => [
						'name' => __( 'Oldham', 'voxel-countries' ),
					],
					'RCH' => [
						'name' => __( 'Rochdale', 'voxel-countries' ),
					],
					'ROT' => [
						'name' => __( 'Rotherham', 'voxel-countries' ),
					],
					'SLF' => [
						'name' => __( 'Salford', 'voxel-countries' ),
					],
					'SAW' => [
						'name' => __( 'Sandwell', 'voxel-countries' ),
					],
					'SFT' => [
						'name' => __( 'Sefton', 'voxel-countries' ),
					],
					'SHF' => [
						'name' => __( 'Sheffield', 'voxel-countries' ),
					],
					'SOL' => [
						'name' => __( 'Solihull', 'voxel-countries' ),
					],
					'STY' => [
						'name' => __( 'South Tyneside', 'voxel-countries' ),
					],
					'SHN' => [
						'name' => __( 'St. Helens', 'voxel-countries' ),
					],
					'SKP' => [
						'name' => __( 'Stockport', 'voxel-countries' ),
					],
					'SND' => [
						'name' => __( 'Sunderland', 'voxel-countries' ),
					],
					'TAM' => [
						'name' => __( 'Tameside', 'voxel-countries' ),
					],
					'TRF' => [
						'name' => __( 'Trafford', 'voxel-countries' ),
					],
					'WKF' => [
						'name' => __( 'Wakefield', 'voxel-countries' ),
					],
					'WLL' => [
						'name' => __( 'Walsall', 'voxel-countries' ),
					],
					'WGN' => [
						'name' => __( 'Wigan', 'voxel-countries' ),
					],
					'WRL' => [
						'name' => __( 'Wirral', 'voxel-countries' ),
					],
					'WLV' => [
						'name' => __( 'Wolverhampton', 'voxel-countries' ),
					],
					'NIR' => [
						'name' => __( 'Northern Ireland', 'voxel-countries' ),
					],
					'BKM' => [
						'name' => __( 'Buckinghamshire', 'voxel-countries' ),
					],
					'CAM' => [
						'name' => __( 'Cambridgeshire', 'voxel-countries' ),
					],
					'CMA' => [
						'name' => __( 'Cumbria', 'voxel-countries' ),
					],
					'DBY' => [
						'name' => __( 'Derbyshire', 'voxel-countries' ),
					],
					'DEV' => [
						'name' => __( 'Devon', 'voxel-countries' ),
					],
					'DOR' => [
						'name' => __( 'Dorset', 'voxel-countries' ),
					],
					'ESX' => [
						'name' => __( 'East Sussex', 'voxel-countries' ),
					],
					'ESS' => [
						'name' => __( 'Essex', 'voxel-countries' ),
					],
					'GLS' => [
						'name' => __( 'Gloucestershire', 'voxel-countries' ),
					],
					'HAM' => [
						'name' => __( 'Hampshire', 'voxel-countries' ),
					],
					'HRT' => [
						'name' => __( 'Hertfordshire', 'voxel-countries' ),
					],
					'KEN' => [
						'name' => __( 'Kent', 'voxel-countries' ),
					],
					'LAN' => [
						'name' => __( 'Lancashire', 'voxel-countries' ),
					],
					'LEC' => [
						'name' => __( 'Leicestershire', 'voxel-countries' ),
					],
					'LIN' => [
						'name' => __( 'Lincolnshire', 'voxel-countries' ),
					],
					'NFK' => [
						'name' => __( 'Norfolk', 'voxel-countries' ),
					],
					'NYK' => [
						'name' => __( 'North Yorkshire', 'voxel-countries' ),
					],
					'NTH' => [
						'name' => __( 'Northamptonshire', 'voxel-countries' ),
					],
					'NTT' => [
						'name' => __( 'Nottinghamshire', 'voxel-countries' ),
					],
					'OXF' => [
						'name' => __( 'Oxfordshire', 'voxel-countries' ),
					],
					'SOM' => [
						'name' => __( 'Somerset', 'voxel-countries' ),
					],
					'STS' => [
						'name' => __( 'Staffordshire', 'voxel-countries' ),
					],
					'SFK' => [
						'name' => __( 'Suffolk', 'voxel-countries' ),
					],
					'SRY' => [
						'name' => __( 'Surrey', 'voxel-countries' ),
					],
					'WAR' => [
						'name' => __( 'Warwickshire', 'voxel-countries' ),
					],
					'WSX' => [
						'name' => __( 'West Sussex', 'voxel-countries' ),
					],
					'WOR' => [
						'name' => __( 'Worcestershire', 'voxel-countries' ),
					],
					'BAS' => [
						'name' => __( 'Bath and North East Somerset', 'voxel-countries' ),
					],
					'BDF' => [
						'name' => __( 'Bedford', 'voxel-countries' ),
					],
					'BBD' => [
						'name' => __( 'Blackburn with Darwen', 'voxel-countries' ),
					],
					'BPL' => [
						'name' => __( 'Blackpool', 'voxel-countries' ),
					],
					'BGW' => [
						'name' => __( 'Blaenau Gwent', 'voxel-countries' ),
					],
					'BMH' => [
						'name' => __( 'Bournemouth', 'voxel-countries' ),
					],
					'BRC' => [
						'name' => __( 'Bracknell Forest', 'voxel-countries' ),
					],
					'BGE' => [
						'name' => __( 'Bridgend', 'voxel-countries' ),
					],
					'BNH' => [
						'name' => __( 'Brighton and Hove', 'voxel-countries' ),
					],
					'BST' => [
						'name' => __( 'Bristol, City of', 'voxel-countries' ),
					],
					'CAY' => [
						'name' => __( 'Caerphilly', 'voxel-countries' ),
					],
					'CRF' => [
						'name' => __( 'Cardiff', 'voxel-countries' ),
					],
					'CMN' => [
						'name' => __( 'Carmarthenshire', 'voxel-countries' ),
					],
					'CBF' => [
						'name' => __( 'Central Bedfordshire', 'voxel-countries' ),
					],
					'CGN' => [
						'name' => __( 'Ceredigion', 'voxel-countries' ),
					],
					'CHE' => [
						'name' => __( 'Cheshire East', 'voxel-countries' ),
					],
					'CHW' => [
						'name' => __( 'Cheshire West and Chester', 'voxel-countries' ),
					],
					'CWY' => [
						'name' => __( 'Conwy', 'voxel-countries' ),
					],
					'CON' => [
						'name' => __( 'Cornwall', 'voxel-countries' ),
					],
					'DAL' => [
						'name' => __( 'Darlington', 'voxel-countries' ),
					],
					'DEN' => [
						'name' => __( 'Denbighshire', 'voxel-countries' ),
					],
					'DER' => [
						'name' => __( 'Derby', 'voxel-countries' ),
					],
					'DUR' => [
						'name' => __( 'Durham, County', 'voxel-countries' ),
					],
					'ERY' => [
						'name' => __( 'East Riding of Yorkshire', 'voxel-countries' ),
					],
					'FLN' => [
						'name' => __( 'Flintshire', 'voxel-countries' ),
					],
					'GWN' => [
						'name' => __( 'Gwynedd', 'voxel-countries' ),
					],
					'HAL' => [
						'name' => __( 'Halton', 'voxel-countries' ),
					],
					'HPL' => [
						'name' => __( 'Hartlepool', 'voxel-countries' ),
					],
					'HEF' => [
						'name' => __( 'Herefordshire', 'voxel-countries' ),
					],
					'AGY' => [
						'name' => __( 'Isle of Anglesey', 'voxel-countries' ),
					],
					'IOW' => [
						'name' => __( 'Isle of Wight', 'voxel-countries' ),
					],
					'IOS' => [
						'name' => __( 'Isles of Scilly', 'voxel-countries' ),
					],
					'KHL' => [
						'name' => __( 'Kingston upon Hull', 'voxel-countries' ),
					],
					'LCE' => [
						'name' => __( 'Leicester', 'voxel-countries' ),
					],
					'LUT' => [
						'name' => __( 'Luton', 'voxel-countries' ),
					],
					'MDW' => [
						'name' => __( 'Medway', 'voxel-countries' ),
					],
					'MTY' => [
						'name' => __( 'Merthyr Tydfil', 'voxel-countries' ),
					],
					'MDB' => [
						'name' => __( 'Middlesbrough', 'voxel-countries' ),
					],
					'MIK' => [
						'name' => __( 'Milton Keynes', 'voxel-countries' ),
					],
					'MON' => [
						'name' => __( 'Monmouthshire', 'voxel-countries' ),
					],
					'NTL' => [
						'name' => __( 'Neath Port Talbot', 'voxel-countries' ),
					],
					'NWP' => [
						'name' => __( 'Newport', 'voxel-countries' ),
					],
					'NEL' => [
						'name' => __( 'North East Lincolnshire', 'voxel-countries' ),
					],
					'NLN' => [
						'name' => __( 'North Lincolnshire', 'voxel-countries' ),
					],
					'NSM' => [
						'name' => __( 'North Somerset', 'voxel-countries' ),
					],
					'NBL' => [
						'name' => __( 'Northumberland', 'voxel-countries' ),
					],
					'NGM' => [
						'name' => __( 'Nottingham', 'voxel-countries' ),
					],
					'PEM' => [
						'name' => __( 'Pembrokeshire', 'voxel-countries' ),
					],
					'PTE' => [
						'name' => __( 'Peterborough', 'voxel-countries' ),
					],
					'PLY' => [
						'name' => __( 'Plymouth', 'voxel-countries' ),
					],
					'POL' => [
						'name' => __( 'Poole', 'voxel-countries' ),
					],
					'POR' => [
						'name' => __( 'Portsmouth', 'voxel-countries' ),
					],
					'POW' => [
						'name' => __( 'Powys', 'voxel-countries' ),
					],
					'RDG' => [
						'name' => __( 'Reading', 'voxel-countries' ),
					],
					'RCC' => [
						'name' => __( 'Redcar and Cleveland', 'voxel-countries' ),
					],
					'RCT' => [
						'name' => __( 'Rhondda, Cynon, Taff', 'voxel-countries' ),
					],
					'RUT' => [
						'name' => __( 'Rutland', 'voxel-countries' ),
					],
					'SHR' => [
						'name' => __( 'Shropshire', 'voxel-countries' ),
					],
					'SLG' => [
						'name' => __( 'Slough', 'voxel-countries' ),
					],
					'SGC' => [
						'name' => __( 'South Gloucestershire', 'voxel-countries' ),
					],
					'STH' => [
						'name' => __( 'Southampton', 'voxel-countries' ),
					],
					'SOS' => [
						'name' => __( 'Southend-on-Sea', 'voxel-countries' ),
					],
					'STT' => [
						'name' => __( 'Stockton-on-Tees', 'voxel-countries' ),
					],
					'STE' => [
						'name' => __( 'Stoke-on-Trent', 'voxel-countries' ),
					],
					'SWA' => [
						'name' => __( 'Swansea', 'voxel-countries' ),
					],
					'SWD' => [
						'name' => __( 'Swindon', 'voxel-countries' ),
					],
					'TFW' => [
						'name' => __( 'Telford and Wrekin', 'voxel-countries' ),
					],
					'THR' => [
						'name' => __( 'Thurrock', 'voxel-countries' ),
					],
					'TOB' => [
						'name' => __( 'Torbay', 'voxel-countries' ),
					],
					'TOF' => [
						'name' => __( 'Torfaen', 'voxel-countries' ),
					],
					'VGL' => [
						'name' => __( 'Vale of Glamorgan, The', 'voxel-countries' ),
					],
					'WRT' => [
						'name' => __( 'Warrington', 'voxel-countries' ),
					],
					'WBK' => [
						'name' => __( 'West Berkshire', 'voxel-countries' ),
					],
					'WIL' => [
						'name' => __( 'Wiltshire', 'voxel-countries' ),
					],
					'WNM' => [
						'name' => __( 'Windsor and Maidenhead', 'voxel-countries' ),
					],
					'WOK' => [
						'name' => __( 'Wokingham', 'voxel-countries' ),
					],
					'WRX' => [
						'name' => __( 'Wrexham', 'voxel-countries' ),
					],
					'YOR' => [
						'name' => __( 'York', 'voxel-countries' ),
					],
				]
			],
			'GD' => [
				'code3' => 'GRD',
				'name' => __( 'Grenada', 'voxel-countries' ),
				'continent' => 'North America',
				'states' => [
					'01' => [
						'name' => __( 'Saint Andrew', 'voxel-countries' ),
					],
					'02' => [
						'name' => __( 'Saint David', 'voxel-countries' ),
					],
					'03' => [
						'name' => __( 'Saint George', 'voxel-countries' ),
					],
					'04' => [
						'name' => __( 'Saint John', 'voxel-countries' ),
					],
					'05' => [
						'name' => __( 'Saint Mark', 'voxel-countries' ),
					],
					'06' => [
						'name' => __( 'Saint Patrick', 'voxel-countries' ),
					],
					'10' => [
						'name' => __( 'Southern Grenadine Islands', 'voxel-countries' ),
					],
				]
			],
			'GE' => [
				'code3' => 'GEO',
				'name' => __( 'Georgia', 'voxel-countries' ),
				'continent' => 'Asia',
				'states' => [
					'AB' => [
						'name' => __( 'Abkhazia', 'voxel-countries' ),
					],
					'AJ' => [
						'name' => __( 'Ajaria', 'voxel-countries' ),
					],
					'GU' => [
						'name' => __( 'Guria', 'voxel-countries' ),
					],
					'IM' => [
						'name' => __( 'Imereti', 'voxel-countries' ),
					],
					'KA' => [
						'name' => __( 'K\'akheti', 'voxel-countries' ),
					],
					'KK' => [
						'name' => __( 'Kvemo Kartli', 'voxel-countries' ),
					],
					'MM' => [
						'name' => __( 'Mtskheta-Mtianeti', 'voxel-countries' ),
					],
					'RL' => [
						'name' => __( 'Rach\'a-Lechkhumi-Kvemo Svaneti', 'voxel-countries' ),
					],
					'SZ' => [
						'name' => __( 'Samegrelo-Zemo Svaneti', 'voxel-countries' ),
					],
					'SJ' => [
						'name' => __( 'Samtskhe-Javakheti', 'voxel-countries' ),
					],
					'SK' => [
						'name' => __( 'Shida Kartli', 'voxel-countries' ),
					],
					'TB' => [
						'name' => __( 'Tbilisi', 'voxel-countries' ),
					],
				]
			],
			'GF' => [
				'code3' => 'GUF',
				'name' => __( 'French Guiana', 'voxel-countries' ),
				'continent' => 'South America',
				'states' => [],
			],
			'GG' => [
				'code3' => 'GGY',
				'name' => __( 'Guernsey', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [],
			],
			'GH' => [
				'code3' => 'GHA',
				'name' => __( 'Ghana', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'AH' => [
						'name' => __( 'Ashanti', 'voxel-countries' ),
					],
					'BA' => [
						'name' => __( 'Brong-Ahafo', 'voxel-countries' ),
					],
					'CP' => [
						'name' => __( 'Central', 'voxel-countries' ),
					],
					'EP' => [
						'name' => __( 'Eastern', 'voxel-countries' ),
					],
					'AA' => [
						'name' => __( 'Greater Accra', 'voxel-countries' ),
					],
					'NP' => [
						'name' => __( 'Northern', 'voxel-countries' ),
					],
					'UE' => [
						'name' => __( 'Upper East', 'voxel-countries' ),
					],
					'UW' => [
						'name' => __( 'Upper West', 'voxel-countries' ),
					],
					'TV' => [
						'name' => __( 'Volta', 'voxel-countries' ),
					],
					'WP' => [
						'name' => __( 'Western', 'voxel-countries' ),
					],
				]
			],
			'GI' => [
				'code3' => 'GIB',
				'name' => __( 'Gibraltar', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [],
			],
			'GL' => [
				'code3' => 'GRL',
				'name' => __( 'Greenland', 'voxel-countries' ),
				'continent' => 'North America',
				'states' => [
					'KU' => [
						'name' => __( 'Kommune Kujalleq', 'voxel-countries' ),
					],
					'SM' => [
						'name' => __( 'Kommuneqarfik Sermersooq', 'voxel-countries' ),
					],
					'QA' => [
						'name' => __( 'Qaasuitsup Kommunia', 'voxel-countries' ),
					],
					'QE' => [
						'name' => __( 'Qeqqata Kommunia', 'voxel-countries' ),
					],
				]
			],
			'GM' => [
				'code3' => 'GMB',
				'name' => __( 'The Gambia', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'B' => [
						'name' => __( 'Banjul', 'voxel-countries' ),
					],
					'M' => [
						'name' => __( 'Central River', 'voxel-countries' ),
					],
					'L' => [
						'name' => __( 'Lower River', 'voxel-countries' ),
					],
					'N' => [
						'name' => __( 'North Bank', 'voxel-countries' ),
					],
					'U' => [
						'name' => __( 'Upper River', 'voxel-countries' ),
					],
					'W' => [
						'name' => __( 'Western', 'voxel-countries' ),
					],
				]
			],
			'GN' => [
				'code3' => 'GIN',
				'name' => __( 'Guinea', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'B' => [
						'name' => __( 'Boké', 'voxel-countries' ),
					],
					'C' => [
						'name' => __( 'Conakry', 'voxel-countries' ),
					],
					'F' => [
						'name' => __( 'Faranah', 'voxel-countries' ),
					],
					'K' => [
						'name' => __( 'Kankan', 'voxel-countries' ),
					],
					'D' => [
						'name' => __( 'Kindia', 'voxel-countries' ),
					],
					'L' => [
						'name' => __( 'Labé', 'voxel-countries' ),
					],
					'M' => [
						'name' => __( 'Mamou', 'voxel-countries' ),
					],
					'N' => [
						'name' => __( 'Nzérékoré', 'voxel-countries' ),
					],
				]
			],
			'GP' => [
				'code3' => 'GLP',
				'name' => __( 'Guadeloupe', 'voxel-countries' ),
				'continent' => 'North America',
				'states' => [],
			],
			'GQ' => [
				'code3' => 'GNQ',
				'name' => __( 'Equatorial Guinea', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'C' => [
						'name' => __( 'Región Continental', 'voxel-countries' ),
					],
					'I' => [
						'name' => __( 'Región Insular', 'voxel-countries' ),
					],
				]
			],
			'GR' => [
				'code3' => 'GRC',
				'name' => __( 'Greece', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [
					'A' => [
						'name' => __( 'Anatoliki Makedonia kai Thraki', 'voxel-countries' ),
					],
					'I' => [
						'name' => __( 'Attiki', 'voxel-countries' ),
					],
					'G' => [
						'name' => __( 'Dytiki Ellada', 'voxel-countries' ),
					],
					'C' => [
						'name' => __( 'Dytiki Makedonia', 'voxel-countries' ),
					],
					'F' => [
						'name' => __( 'Ionia Nisia', 'voxel-countries' ),
					],
					'D' => [
						'name' => __( 'Ipeiros', 'voxel-countries' ),
					],
					'B' => [
						'name' => __( 'Kentriki Makedonia', 'voxel-countries' ),
					],
					'M' => [
						'name' => __( 'Kriti', 'voxel-countries' ),
					],
					'L' => [
						'name' => __( 'Notio Aigaio', 'voxel-countries' ),
					],
					'J' => [
						'name' => __( 'Peloponnisos', 'voxel-countries' ),
					],
					'H' => [
						'name' => __( 'Sterea Ellada', 'voxel-countries' ),
					],
					'E' => [
						'name' => __( 'Thessalia', 'voxel-countries' ),
					],
					'K' => [
						'name' => __( 'Voreio Aigaio', 'voxel-countries' ),
					],
				]
			],
			'GS' => [
				'code3' => 'SGS',
				'name' => __( 'South Georgia', 'voxel-countries' ),
				'continent' => 'South America',
				'states' => [],
			],
			'GT' => [
				'code3' => 'GTM',
				'name' => __( 'Guatemala', 'voxel-countries' ),
				'continent' => 'North America',
				'states' => [
					'AV' => [
						'name' => __( 'Alta Verapaz', 'voxel-countries' ),
					],
					'BV' => [
						'name' => __( 'Baja Verapaz', 'voxel-countries' ),
					],
					'CM' => [
						'name' => __( 'Chimaltenango', 'voxel-countries' ),
					],
					'CQ' => [
						'name' => __( 'Chiquimula', 'voxel-countries' ),
					],
					'PR' => [
						'name' => __( 'El Progreso', 'voxel-countries' ),
					],
					'ES' => [
						'name' => __( 'Escuintla', 'voxel-countries' ),
					],
					'GU' => [
						'name' => __( 'Guatemala', 'voxel-countries' ),
					],
					'HU' => [
						'name' => __( 'Huehuetenango', 'voxel-countries' ),
					],
					'IZ' => [
						'name' => __( 'Izabal', 'voxel-countries' ),
					],
					'JA' => [
						'name' => __( 'Jalapa', 'voxel-countries' ),
					],
					'JU' => [
						'name' => __( 'Jutiapa', 'voxel-countries' ),
					],
					'PE' => [
						'name' => __( 'Petén', 'voxel-countries' ),
					],
					'QZ' => [
						'name' => __( 'Quetzaltenango', 'voxel-countries' ),
					],
					'QC' => [
						'name' => __( 'Quiché', 'voxel-countries' ),
					],
					'RE' => [
						'name' => __( 'Retalhuleu', 'voxel-countries' ),
					],
					'SA' => [
						'name' => __( 'Sacatepéquez', 'voxel-countries' ),
					],
					'SM' => [
						'name' => __( 'San Marcos', 'voxel-countries' ),
					],
					'SR' => [
						'name' => __( 'Santa Rosa', 'voxel-countries' ),
					],
					'SO' => [
						'name' => __( 'Sololá', 'voxel-countries' ),
					],
					'SU' => [
						'name' => __( 'Suchitepéquez', 'voxel-countries' ),
					],
					'TO' => [
						'name' => __( 'Totonicapán', 'voxel-countries' ),
					],
					'ZA' => [
						'name' => __( 'Zacapa', 'voxel-countries' ),
					],
				]
			],
			'GU' => [
				'code3' => 'GUM',
				'name' => __( 'Guam', 'voxel-countries' ),
				'continent' => 'Oceania',
				'states' => [],
			],
			'GW' => [
				'code3' => 'GNB',
				'name' => __( 'Guinea-Bissau', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'L' => [
						'name' => __( 'Leste', 'voxel-countries' ),
					],
					'N' => [
						'name' => __( 'Norte', 'voxel-countries' ),
					],
					'S' => [
						'name' => __( 'Sul', 'voxel-countries' ),
					],
				]
			],
			'GY' => [
				'code3' => 'GUY',
				'name' => __( 'Guyana', 'voxel-countries' ),
				'continent' => 'South America',
				'states' => [
					'BA' => [
						'name' => __( 'Barima-Waini', 'voxel-countries' ),
					],
					'CU' => [
						'name' => __( 'Cuyuni-Mazaruni', 'voxel-countries' ),
					],
					'DE' => [
						'name' => __( 'Demerara-Mahaica', 'voxel-countries' ),
					],
					'EB' => [
						'name' => __( 'East Berbice-Corentyne', 'voxel-countries' ),
					],
					'ES' => [
						'name' => __( 'Essequibo Islands-West Demerara', 'voxel-countries' ),
					],
					'MA' => [
						'name' => __( 'Mahaica-Berbice', 'voxel-countries' ),
					],
					'PM' => [
						'name' => __( 'Pomeroon-Supenaam', 'voxel-countries' ),
					],
					'PT' => [
						'name' => __( 'Potaro-Siparuni', 'voxel-countries' ),
					],
					'UD' => [
						'name' => __( 'Upper Demerara-Berbice', 'voxel-countries' ),
					],
					'UT' => [
						'name' => __( 'Upper Takutu-Upper Essequibo', 'voxel-countries' ),
					],
				]
			],
			'HK' => [
				'code3' => 'HKG',
				'name' => __( 'Hong Kong', 'voxel-countries' ),
				'continent' => 'Asia',
				'states' => [],
			],
			'HM' => [
				'code3' => 'HMD',
				'name' => __( 'Heard Island and McDonald Islands', 'voxel-countries' ),
				'continent' => 'Asia',
				'states' => [],
			],
			'HN' => [
				'code3' => 'HND',
				'name' => __( 'Honduras', 'voxel-countries' ),
				'continent' => 'North America',
				'states' => [
					'AT' => [
						'name' => __( 'Atlántida', 'voxel-countries' ),
					],
					'CH' => [
						'name' => __( 'Choluteca', 'voxel-countries' ),
					],
					'CL' => [
						'name' => __( 'Colón', 'voxel-countries' ),
					],
					'CM' => [
						'name' => __( 'Comayagua', 'voxel-countries' ),
					],
					'CP' => [
						'name' => __( 'Copán', 'voxel-countries' ),
					],
					'CR' => [
						'name' => __( 'Cortés', 'voxel-countries' ),
					],
					'EP' => [
						'name' => __( 'El Paraíso', 'voxel-countries' ),
					],
					'FM' => [
						'name' => __( 'Francisco Morazán', 'voxel-countries' ),
					],
					'GD' => [
						'name' => __( 'Gracias a Dios', 'voxel-countries' ),
					],
					'IN' => [
						'name' => __( 'Intibucá', 'voxel-countries' ),
					],
					'IB' => [
						'name' => __( 'Islas de la Bahía', 'voxel-countries' ),
					],
					'LP' => [
						'name' => __( 'La Paz', 'voxel-countries' ),
					],
					'LE' => [
						'name' => __( 'Lempira', 'voxel-countries' ),
					],
					'OC' => [
						'name' => __( 'Ocotepeque', 'voxel-countries' ),
					],
					'OL' => [
						'name' => __( 'Olancho', 'voxel-countries' ),
					],
					'SB' => [
						'name' => __( 'Santa Bárbara', 'voxel-countries' ),
					],
					'VA' => [
						'name' => __( 'Valle', 'voxel-countries' ),
					],
					'YO' => [
						'name' => __( 'Yoro', 'voxel-countries' ),
					],
				]
			],
			'HR' => [
				'code3' => 'HRV',
				'name' => __( 'Croatia', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [
					'07' => [
						'name' => __( 'Bjelovarsko-bilogorska županija', 'voxel-countries' ),
					],
					'12' => [
						'name' => __( 'Brodsko-posavska županija', 'voxel-countries' ),
					],
					'19' => [
						'name' => __( 'Dubrovačko-neretvanska županija', 'voxel-countries' ),
					],
					'21' => [
						'name' => __( 'Grad Zagreb', 'voxel-countries' ),
					],
					'18' => [
						'name' => __( 'Istarska županija', 'voxel-countries' ),
					],
					'04' => [
						'name' => __( 'Karlovačka županija', 'voxel-countries' ),
					],
					'06' => [
						'name' => __( 'Koprivničko-križevačka županija', 'voxel-countries' ),
					],
					'02' => [
						'name' => __( 'Krapinsko-zagorska županija', 'voxel-countries' ),
					],
					'09' => [
						'name' => __( 'Ličko-senjska županija', 'voxel-countries' ),
					],
					'20' => [
						'name' => __( 'Međimurska županija', 'voxel-countries' ),
					],
					'14' => [
						'name' => __( 'Osječko-baranjska županija', 'voxel-countries' ),
					],
					'11' => [
						'name' => __( 'Požeško-slavonska županija', 'voxel-countries' ),
					],
					'08' => [
						'name' => __( 'Primorsko-goranska županija', 'voxel-countries' ),
					],
					'03' => [
						'name' => __( 'Sisačko-moslavačka županija', 'voxel-countries' ),
					],
					'17' => [
						'name' => __( 'Splitsko-dalmatinska županija', 'voxel-countries' ),
					],
					'05' => [
						'name' => __( 'Varaždinska županija', 'voxel-countries' ),
					],
					'10' => [
						'name' => __( 'Virovitičko-podravska županija', 'voxel-countries' ),
					],
					'16' => [
						'name' => __( 'Vukovarsko-srijemska županija', 'voxel-countries' ),
					],
					'13' => [
						'name' => __( 'Zadarska županija', 'voxel-countries' ),
					],
					'01' => [
						'name' => __( 'Zagrebačka županija', 'voxel-countries' ),
					],
					'15' => [
						'name' => __( 'Šibensko-kninska županija', 'voxel-countries' ),
					],
				]
			],
			'HT' => [
				'code3' => 'HTI',
				'name' => __( 'Haiti', 'voxel-countries' ),
				'continent' => 'North America',
				'states' => [
					'AR' => [
						'name' => __( 'Artibonite', 'voxel-countries' ),
					],
					'CE' => [
						'name' => __( 'Centre', 'voxel-countries' ),
					],
					'GA' => [
						'name' => __( 'Grande-Anse', 'voxel-countries' ),
					],
					'NI' => [
						'name' => __( 'Nippes', 'voxel-countries' ),
					],
					'ND' => [
						'name' => __( 'Nord', 'voxel-countries' ),
					],
					'NE' => [
						'name' => __( 'Nord-Est', 'voxel-countries' ),
					],
					'NO' => [
						'name' => __( 'Nord-Ouest', 'voxel-countries' ),
					],
					'OU' => [
						'name' => __( 'Ouest', 'voxel-countries' ),
					],
					'SD' => [
						'name' => __( 'Sud', 'voxel-countries' ),
					],
					'SE' => [
						'name' => __( 'Sud-Est', 'voxel-countries' ),
					],
				]
			],
			'HU' => [
				'code3' => 'HUN',
				'name' => __( 'Hungary', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [
					'BA' => [
						'name' => __( 'Baranya', 'voxel-countries' ),
					],
					'BZ' => [
						'name' => __( 'Borsod-Abaúj-Zemplén', 'voxel-countries' ),
					],
					'BU' => [
						'name' => __( 'Budapest', 'voxel-countries' ),
					],
					'BK' => [
						'name' => __( 'Bács-Kiskun', 'voxel-countries' ),
					],
					'BE' => [
						'name' => __( 'Békés', 'voxel-countries' ),
					],
					'BC' => [
						'name' => __( 'Békéscsaba', 'voxel-countries' ),
					],
					'CS' => [
						'name' => __( 'Csongrád', 'voxel-countries' ),
					],
					'DE' => [
						'name' => __( 'Debrecen', 'voxel-countries' ),
					],
					'DU' => [
						'name' => __( 'Dunaújváros', 'voxel-countries' ),
					],
					'EG' => [
						'name' => __( 'Eger', 'voxel-countries' ),
					],
					'FE' => [
						'name' => __( 'Fejér', 'voxel-countries' ),
					],
					'GY' => [
						'name' => __( 'Győr', 'voxel-countries' ),
					],
					'GS' => [
						'name' => __( 'Győr-Moson-Sopron', 'voxel-countries' ),
					],
					'HB' => [
						'name' => __( 'Hajdú-Bihar', 'voxel-countries' ),
					],
					'HE' => [
						'name' => __( 'Heves', 'voxel-countries' ),
					],
					'HV' => [
						'name' => __( 'Hódmezővásárhely', 'voxel-countries' ),
					],
					'JN' => [
						'name' => __( 'Jász-Nagykun-Szolnok', 'voxel-countries' ),
					],
					'KV' => [
						'name' => __( 'Kaposvár', 'voxel-countries' ),
					],
					'KM' => [
						'name' => __( 'Kecskemét', 'voxel-countries' ),
					],
					'KE' => [
						'name' => __( 'Komárom-Esztergom', 'voxel-countries' ),
					],
					'MI' => [
						'name' => __( 'Miskolc', 'voxel-countries' ),
					],
					'NK' => [
						'name' => __( 'Nagykanizsa', 'voxel-countries' ),
					],
					'NY' => [
						'name' => __( 'Nyíregyháza', 'voxel-countries' ),
					],
					'NO' => [
						'name' => __( 'Nógrád', 'voxel-countries' ),
					],
					'PE' => [
						'name' => __( 'Pest', 'voxel-countries' ),
					],
					'PS' => [
						'name' => __( 'Pécs', 'voxel-countries' ),
					],
					'ST' => [
						'name' => __( 'Salgótarján', 'voxel-countries' ),
					],
					'SO' => [
						'name' => __( 'Somogy', 'voxel-countries' ),
					],
					'SN' => [
						'name' => __( 'Sopron', 'voxel-countries' ),
					],
					'SZ' => [
						'name' => __( 'Szabolcs-Szatmár-Bereg', 'voxel-countries' ),
					],
					'SD' => [
						'name' => __( 'Szeged', 'voxel-countries' ),
					],
					'SS' => [
						'name' => __( 'Szekszárd', 'voxel-countries' ),
					],
					'SK' => [
						'name' => __( 'Szolnok', 'voxel-countries' ),
					],
					'SH' => [
						'name' => __( 'Szombathely', 'voxel-countries' ),
					],
					'SF' => [
						'name' => __( 'Székesfehérvár', 'voxel-countries' ),
					],
					'TB' => [
						'name' => __( 'Tatabánya', 'voxel-countries' ),
					],
					'TO' => [
						'name' => __( 'Tolna', 'voxel-countries' ),
					],
					'VA' => [
						'name' => __( 'Vas', 'voxel-countries' ),
					],
					'VE' => [
						'name' => __( 'Veszprém', 'voxel-countries' ),
					],
					'VM' => [
						'name' => __( 'Veszprém', 'voxel-countries' ),
					],
					'ZA' => [
						'name' => __( 'Zala', 'voxel-countries' ),
					],
					'ZE' => [
						'name' => __( 'Zalaegerszeg', 'voxel-countries' ),
					],
					'ER' => [
						'name' => __( 'Érd', 'voxel-countries' ),
					],
				]
			],
			'ID' => [
				'code3' => 'IDN',
				'name' => __( 'Indonesia', 'voxel-countries' ),
				'continent' => 'Asia',
				'states' => [
					'JW' => [
						'name' => __( 'Jawa', 'voxel-countries' ),
					],
					'KA' => [
						'name' => __( 'Kalimantan', 'voxel-countries' ),
					],
					'ML' => [
						'name' => __( 'Maluku', 'voxel-countries' ),
					],
					'NU' => [
						'name' => __( 'Nusa Tenggara', 'voxel-countries' ),
					],
					'PP' => [
						'name' => __( 'Papua', 'voxel-countries' ),
					],
					'SL' => [
						'name' => __( 'Sulawesi', 'voxel-countries' ),
					],
					'SM' => [
						'name' => __( 'Sumatera', 'voxel-countries' ),
					],
				]
			],
			'IE' => [
				'code3' => 'IRL',
				'name' => __( 'Republic of Ireland', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [
					'C' => [
						'name' => __( 'Connaught', 'voxel-countries' ),
					],
					'L' => [
						'name' => __( 'Leinster', 'voxel-countries' ),
					],
					'M' => [
						'name' => __( 'Munster', 'voxel-countries' ),
					],
					'U' => [
						'name' => __( 'Ulster', 'voxel-countries' ),
					],
				]
			],
			'IL' => [
				'code3' => 'ISR',
				'name' => __( 'Israel', 'voxel-countries' ),
				'continent' => 'Asia',
				'states' => [
					'D' => [
						'name' => __( 'HaDarom', 'voxel-countries' ),
					],
					'M' => [
						'name' => __( 'HaMerkaz', 'voxel-countries' ),
					],
					'Z' => [
						'name' => __( 'HaTsafon', 'voxel-countries' ),
					],
					'HA' => [
						'name' => __( 'H̱efa', 'voxel-countries' ),
					],
					'TA' => [
						'name' => __( 'Tel-Aviv', 'voxel-countries' ),
					],
					'JM' => [
						'name' => __( 'Yerushalayim', 'voxel-countries' ),
					],
				]
			],
			'IM' => [
				'code3' => 'IMN',
				'name' => __( 'Isle of Man', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [],
			],
			'IN' => [
				'code3' => 'IND',
				'name' => __( 'India', 'voxel-countries' ),
				'continent' => 'Asia',
				'states' => [
					'AN' => [
						'name' => __( 'Andaman and Nicobar Islands', 'voxel-countries' ),
					],
					'CH' => [
						'name' => __( 'Chandigarh', 'voxel-countries' ),
					],
					'DN' => [
						'name' => __( 'Dadra and Nagar Haveli', 'voxel-countries' ),
					],
					'DD' => [
						'name' => __( 'Daman and Diu', 'voxel-countries' ),
					],
					'DL' => [
						'name' => __( 'Delhi', 'voxel-countries' ),
					],
					'LD' => [
						'name' => __( 'Lakshadweep', 'voxel-countries' ),
					],
					'PY' => [
						'name' => __( 'Puducherry', 'voxel-countries' ),
					],
					'AP' => [
						'name' => __( 'Andhra Pradesh', 'voxel-countries' ),
					],
					'AR' => [
						'name' => __( 'Arunachal Pradesh', 'voxel-countries' ),
					],
					'AS' => [
						'name' => __( 'Assam', 'voxel-countries' ),
					],
					'BR' => [
						'name' => __( 'Bihar', 'voxel-countries' ),
					],
					'CT' => [
						'name' => __( 'Chhattisgarh', 'voxel-countries' ),
					],
					'GA' => [
						'name' => __( 'Goa', 'voxel-countries' ),
					],
					'GJ' => [
						'name' => __( 'Gujarat', 'voxel-countries' ),
					],
					'HR' => [
						'name' => __( 'Haryana', 'voxel-countries' ),
					],
					'HP' => [
						'name' => __( 'Himachal Pradesh', 'voxel-countries' ),
					],
					'JK' => [
						'name' => __( 'Jammu and Kashmir', 'voxel-countries' ),
					],
					'JH' => [
						'name' => __( 'Jharkhand', 'voxel-countries' ),
					],
					'KA' => [
						'name' => __( 'Karnataka', 'voxel-countries' ),
					],
					'KL' => [
						'name' => __( 'Kerala', 'voxel-countries' ),
					],
					'MP' => [
						'name' => __( 'Madhya Pradesh', 'voxel-countries' ),
					],
					'MH' => [
						'name' => __( 'Maharashtra', 'voxel-countries' ),
					],
					'MN' => [
						'name' => __( 'Manipur', 'voxel-countries' ),
					],
					'ML' => [
						'name' => __( 'Meghalaya', 'voxel-countries' ),
					],
					'MZ' => [
						'name' => __( 'Mizoram', 'voxel-countries' ),
					],
					'NL' => [
						'name' => __( 'Nagaland', 'voxel-countries' ),
					],
					'OR' => [
						'name' => __( 'Odisha', 'voxel-countries' ),
					],
					'PB' => [
						'name' => __( 'Punjab', 'voxel-countries' ),
					],
					'RJ' => [
						'name' => __( 'Rajasthan', 'voxel-countries' ),
					],
					'SK' => [
						'name' => __( 'Sikkim', 'voxel-countries' ),
					],
					'TN' => [
						'name' => __( 'Tamil Nadu', 'voxel-countries' ),
					],
					'TG' => [
						'name' => __( 'Telangana', 'voxel-countries' ),
					],
					'TR' => [
						'name' => __( 'Tripura', 'voxel-countries' ),
					],
					'UP' => [
						'name' => __( 'Uttar Pradesh', 'voxel-countries' ),
					],
					'UT' => [
						'name' => __( 'Uttarakhand', 'voxel-countries' ),
					],
					'WB' => [
						'name' => __( 'West Bengal', 'voxel-countries' ),
					],
				]
			],
			'IO' => [
				'code3' => 'IOT',
				'name' => __( 'British Indian Ocean Territory', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [],
			],
			'IQ' => [
				'code3' => 'IRQ',
				'name' => __( 'Iraq', 'voxel-countries' ),
				'continent' => 'Asia',
				'states' => [
					'AN' => [
						'name' => __( 'Al Anbār', 'voxel-countries' ),
					],
					'BA' => [
						'name' => __( 'Al Başrah', 'voxel-countries' ),
					],
					'MU' => [
						'name' => __( 'Al Muthanná', 'voxel-countries' ),
					],
					'QA' => [
						'name' => __( 'Al Qādisīyah', 'voxel-countries' ),
					],
					'NA' => [
						'name' => __( 'An Najaf', 'voxel-countries' ),
					],
					'AR' => [
						'name' => __( 'Arbīl', 'voxel-countries' ),
					],
					'SU' => [
						'name' => __( 'As Sulaymānīyah', 'voxel-countries' ),
					],
					'TS' => [
						'name' => __( 'At Ta\'mīm', 'voxel-countries' ),
					],
					'BG' => [
						'name' => __( 'Baghdād', 'voxel-countries' ),
					],
					'BB' => [
						'name' => __( 'Bābil', 'voxel-countries' ),
					],
					'DA' => [
						'name' => __( 'Dahūk', 'voxel-countries' ),
					],
					'DQ' => [
						'name' => __( 'Dhī Qār', 'voxel-countries' ),
					],
					'DI' => [
						'name' => __( 'Diyālá', 'voxel-countries' ),
					],
					'KA' => [
						'name' => __( 'Karbalā\'', 'voxel-countries' ),
					],
					'MA' => [
						'name' => __( 'Maysān', 'voxel-countries' ),
					],
					'NI' => [
						'name' => __( 'Nīnawá', 'voxel-countries' ),
					],
					'WA' => [
						'name' => __( 'Wāsiţ', 'voxel-countries' ),
					],
					'SD' => [
						'name' => __( 'Şalāḩ ad Dīn', 'voxel-countries' ),
					],
				]
			],
			'IR' => [
				'code3' => 'IRN',
				'name' => __( 'Iran', 'voxel-countries' ),
				'continent' => 'Asia',
				'states' => [
					'32' => [
						'name' => __( 'Alborz', 'voxel-countries' ),
					],
					'03' => [
						'name' => __( 'Ardabīl', 'voxel-countries' ),
					],
					'06' => [
						'name' => __( 'Būshehr', 'voxel-countries' ),
					],
					'08' => [
						'name' => __( 'Chahār Maḩāll va Bakhtīārī', 'voxel-countries' ),
					],
					'04' => [
						'name' => __( 'Eşfahān', 'voxel-countries' ),
					],
					'14' => [
						'name' => __( 'Fārs', 'voxel-countries' ),
					],
					'27' => [
						'name' => __( 'Golestān', 'voxel-countries' ),
					],
					'19' => [
						'name' => __( 'Gīlān', 'voxel-countries' ),
					],
					'24' => [
						'name' => __( 'Hamadān', 'voxel-countries' ),
					],
					'23' => [
						'name' => __( 'Hormozgān', 'voxel-countries' ),
					],
					'15' => [
						'name' => __( 'Kermān', 'voxel-countries' ),
					],
					'17' => [
						'name' => __( 'Kermānshāh', 'voxel-countries' ),
					],
					'29' => [
						'name' => __( 'Khorāsān-e Janūbī', 'voxel-countries' ),
					],
					'30' => [
						'name' => __( 'Khorāsān-e Razavī', 'voxel-countries' ),
					],
					'31' => [
						'name' => __( 'Khorāsān-e Shemālī', 'voxel-countries' ),
					],
					'10' => [
						'name' => __( 'Khūzestān', 'voxel-countries' ),
					],
					'18' => [
						'name' => __( 'Kohgīlūyeh va Būyer Aḩmad', 'voxel-countries' ),
					],
					'16' => [
						'name' => __( 'Kordestān', 'voxel-countries' ),
					],
					'20' => [
						'name' => __( 'Lorestān', 'voxel-countries' ),
					],
					'22' => [
						'name' => __( 'Markazī', 'voxel-countries' ),
					],
					'21' => [
						'name' => __( 'Māzandarān', 'voxel-countries' ),
					],
					'28' => [
						'name' => __( 'Qazvīn', 'voxel-countries' ),
					],
					'26' => [
						'name' => __( 'Qom', 'voxel-countries' ),
					],
					'12' => [
						'name' => __( 'Semnān', 'voxel-countries' ),
					],
					'13' => [
						'name' => __( 'Sīstān va Balūchestān', 'voxel-countries' ),
					],
					'07' => [
						'name' => __( 'Tehrān', 'voxel-countries' ),
					],
					'25' => [
						'name' => __( 'Yazd', 'voxel-countries' ),
					],
					'11' => [
						'name' => __( 'Zanjān', 'voxel-countries' ),
					],
					'02' => [
						'name' => __( 'Āz̄arbāyjān-e Gharbī', 'voxel-countries' ),
					],
					'01' => [
						'name' => __( 'Āz̄arbāyjān-e Sharqī', 'voxel-countries' ),
					],
					'05' => [
						'name' => __( 'Īlām', 'voxel-countries' ),
					],
				]
			],
			'IS' => [
				'code3' => 'ISL',
				'name' => __( 'Iceland', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [
					'7' => [
						'name' => __( 'Austurland', 'voxel-countries' ),
					],
					'1' => [
						'name' => __( 'Höfuðborgarsvæði utan Reykjavíkur', 'voxel-countries' ),
					],
					'6' => [
						'name' => __( 'Norðurland eystra', 'voxel-countries' ),
					],
					'5' => [
						'name' => __( 'Norðurland vestra', 'voxel-countries' ),
					],
					'8' => [
						'name' => __( 'Suðurland', 'voxel-countries' ),
					],
					'2' => [
						'name' => __( 'Suðurnes', 'voxel-countries' ),
					],
					'4' => [
						'name' => __( 'Vestfirðir', 'voxel-countries' ),
					],
					'3' => [
						'name' => __( 'Vesturland', 'voxel-countries' ),
					],
				]
			],
			'IT' => [
				'code3' => 'ITA',
				'name' => __( 'Italy', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [
					'65' => [
						'name' => __( 'Abruzzo', 'voxel-countries' ),
					],
					'77' => [
						'name' => __( 'Basilicata', 'voxel-countries' ),
					],
					'78' => [
						'name' => __( 'Calabria', 'voxel-countries' ),
					],
					'72' => [
						'name' => __( 'Campania', 'voxel-countries' ),
					],
					'45' => [
						'name' => __( 'Emilia-Romagna', 'voxel-countries' ),
					],
					'36' => [
						'name' => __( 'Friuli-Venezia Giulia', 'voxel-countries' ),
					],
					'62' => [
						'name' => __( 'Lazio', 'voxel-countries' ),
					],
					'42' => [
						'name' => __( 'Liguria', 'voxel-countries' ),
					],
					'25' => [
						'name' => __( 'Lombardia', 'voxel-countries' ),
					],
					'57' => [
						'name' => __( 'Marche', 'voxel-countries' ),
					],
					'67' => [
						'name' => __( 'Molise', 'voxel-countries' ),
					],
					'21' => [
						'name' => __( 'Piemonte', 'voxel-countries' ),
					],
					'75' => [
						'name' => __( 'Puglia', 'voxel-countries' ),
					],
					'88' => [
						'name' => __( 'Sardegna', 'voxel-countries' ),
					],
					'82' => [
						'name' => __( 'Sicilia', 'voxel-countries' ),
					],
					'52' => [
						'name' => __( 'Toscana', 'voxel-countries' ),
					],
					'32' => [
						'name' => __( 'Trentino-Alto Adige', 'voxel-countries' ),
					],
					'55' => [
						'name' => __( 'Umbria', 'voxel-countries' ),
					],
					'23' => [
						'name' => __( 'Valle d\'Aosta', 'voxel-countries' ),
					],
					'34' => [
						'name' => __( 'Veneto', 'voxel-countries' ),
					],
				]
			],
			'JE' => [
				'code3' => 'JEY',
				'name' => __( 'Jersey', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [],
			],
			'JM' => [
				'code3' => 'JAM',
				'name' => __( 'Jamaica', 'voxel-countries' ),
				'continent' => 'North America',
				'states' => [
					'13' => [
						'name' => __( 'Clarendon', 'voxel-countries' ),
					],
					'09' => [
						'name' => __( 'Hanover', 'voxel-countries' ),
					],
					'01' => [
						'name' => __( 'Kingston', 'voxel-countries' ),
					],
					'12' => [
						'name' => __( 'Manchester', 'voxel-countries' ),
					],
					'04' => [
						'name' => __( 'Portland', 'voxel-countries' ),
					],
					'02' => [
						'name' => __( 'Saint Andrew', 'voxel-countries' ),
					],
					'06' => [
						'name' => __( 'Saint Ann', 'voxel-countries' ),
					],
					'14' => [
						'name' => __( 'Saint Catherine', 'voxel-countries' ),
					],
					'11' => [
						'name' => __( 'Saint Elizabeth', 'voxel-countries' ),
					],
					'08' => [
						'name' => __( 'Saint James', 'voxel-countries' ),
					],
					'05' => [
						'name' => __( 'Saint Mary', 'voxel-countries' ),
					],
					'03' => [
						'name' => __( 'Saint Thomas', 'voxel-countries' ),
					],
					'07' => [
						'name' => __( 'Trelawny', 'voxel-countries' ),
					],
					'10' => [
						'name' => __( 'Westmoreland', 'voxel-countries' ),
					],
				]
			],
			'JO' => [
				'code3' => 'JOR',
				'name' => __( 'Jordan', 'voxel-countries' ),
				'continent' => 'Asia',
				'states' => [
					'BA' => [
						'name' => __( 'Al Balqā\'', 'voxel-countries' ),
					],
					'AQ' => [
						'name' => __( 'Al ʽAqabah', 'voxel-countries' ),
					],
					'AZ' => [
						'name' => __( 'Az Zarqā\'', 'voxel-countries' ),
					],
					'AT' => [
						'name' => __( 'Aţ Ţafīlah', 'voxel-countries' ),
					],
					'IR' => [
						'name' => __( 'Irbid', 'voxel-countries' ),
					],
					'JA' => [
						'name' => __( 'Jerash', 'voxel-countries' ),
					],
					'KA' => [
						'name' => __( 'Karak', 'voxel-countries' ),
					],
					'MN' => [
						'name' => __( 'Ma\'ān', 'voxel-countries' ),
					],
					'MA' => [
						'name' => __( 'Mafraq', 'voxel-countries' ),
					],
					'MD' => [
						'name' => __( 'Mādabā', 'voxel-countries' ),
					],
					'AJ' => [
						'name' => __( 'ʽAjlūn', 'voxel-countries' ),
					],
					'AM' => [
						'name' => __( '‘Ammān', 'voxel-countries' ),
					],
				]
			],
			'JP' => [
				'code3' => 'JPN',
				'name' => __( 'Japan', 'voxel-countries' ),
				'continent' => 'Asia',
				'states' => [
					'23' => [
						'name' => __( 'Aiti', 'voxel-countries' ),
					],
					'05' => [
						'name' => __( 'Akita', 'voxel-countries' ),
					],
					'02' => [
						'name' => __( 'Aomori', 'voxel-countries' ),
					],
					'38' => [
						'name' => __( 'Ehime', 'voxel-countries' ),
					],
					'21' => [
						'name' => __( 'Gihu', 'voxel-countries' ),
					],
					'10' => [
						'name' => __( 'Gunma', 'voxel-countries' ),
					],
					'34' => [
						'name' => __( 'Hirosima', 'voxel-countries' ),
					],
					'01' => [
						'name' => __( 'Hokkaidô', 'voxel-countries' ),
					],
					'18' => [
						'name' => __( 'Hukui', 'voxel-countries' ),
					],
					'40' => [
						'name' => __( 'Hukuoka', 'voxel-countries' ),
					],
					'07' => [
						'name' => __( 'Hukusima', 'voxel-countries' ),
					],
					'28' => [
						'name' => __( 'Hyôgo', 'voxel-countries' ),
					],
					'08' => [
						'name' => __( 'Ibaraki', 'voxel-countries' ),
					],
					'17' => [
						'name' => __( 'Isikawa', 'voxel-countries' ),
					],
					'03' => [
						'name' => __( 'Iwate', 'voxel-countries' ),
					],
					'37' => [
						'name' => __( 'Kagawa', 'voxel-countries' ),
					],
					'46' => [
						'name' => __( 'Kagosima', 'voxel-countries' ),
					],
					'14' => [
						'name' => __( 'Kanagawa', 'voxel-countries' ),
					],
					'43' => [
						'name' => __( 'Kumamoto', 'voxel-countries' ),
					],
					'26' => [
						'name' => __( 'Kyôto', 'voxel-countries' ),
					],
					'39' => [
						'name' => __( 'Kôti', 'voxel-countries' ),
					],
					'24' => [
						'name' => __( 'Mie', 'voxel-countries' ),
					],
					'04' => [
						'name' => __( 'Miyagi', 'voxel-countries' ),
					],
					'45' => [
						'name' => __( 'Miyazaki', 'voxel-countries' ),
					],
					'20' => [
						'name' => __( 'Nagano', 'voxel-countries' ),
					],
					'42' => [
						'name' => __( 'Nagasaki', 'voxel-countries' ),
					],
					'29' => [
						'name' => __( 'Nara', 'voxel-countries' ),
					],
					'15' => [
						'name' => __( 'Niigata', 'voxel-countries' ),
					],
					'33' => [
						'name' => __( 'Okayama', 'voxel-countries' ),
					],
					'47' => [
						'name' => __( 'Okinawa', 'voxel-countries' ),
					],
					'41' => [
						'name' => __( 'Saga', 'voxel-countries' ),
					],
					'11' => [
						'name' => __( 'Saitama', 'voxel-countries' ),
					],
					'25' => [
						'name' => __( 'Siga', 'voxel-countries' ),
					],
					'32' => [
						'name' => __( 'Simane', 'voxel-countries' ),
					],
					'22' => [
						'name' => __( 'Sizuoka', 'voxel-countries' ),
					],
					'12' => [
						'name' => __( 'Tiba', 'voxel-countries' ),
					],
					'36' => [
						'name' => __( 'Tokusima', 'voxel-countries' ),
					],
					'09' => [
						'name' => __( 'Totigi', 'voxel-countries' ),
					],
					'31' => [
						'name' => __( 'Tottori', 'voxel-countries' ),
					],
					'16' => [
						'name' => __( 'Toyama', 'voxel-countries' ),
					],
					'13' => [
						'name' => __( 'Tôkyô', 'voxel-countries' ),
					],
					'30' => [
						'name' => __( 'Wakayama', 'voxel-countries' ),
					],
					'06' => [
						'name' => __( 'Yamagata', 'voxel-countries' ),
					],
					'35' => [
						'name' => __( 'Yamaguti', 'voxel-countries' ),
					],
					'19' => [
						'name' => __( 'Yamanasi', 'voxel-countries' ),
					],
					'44' => [
						'name' => __( 'Ôita', 'voxel-countries' ),
					],
					'27' => [
						'name' => __( 'Ôsaka', 'voxel-countries' ),
					],
				]
			],
			'KE' => [
				'code3' => 'KEN',
				'name' => __( 'Kenya', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'200' => [
						'name' => __( 'Central', 'voxel-countries' ),
					],
					'300' => [
						'name' => __( 'Coast', 'voxel-countries' ),
					],
					'400' => [
						'name' => __( 'Eastern', 'voxel-countries' ),
					],
					'110' => [
						'name' => __( 'Nairobi', 'voxel-countries' ),
					],
					'500' => [
						'name' => __( 'North-Eastern', 'voxel-countries' ),
					],
					'600' => [
						'name' => __( 'Nyanza', 'voxel-countries' ),
					],
					'700' => [
						'name' => __( 'Rift Valley', 'voxel-countries' ),
					],
					'800' => [
						'name' => __( 'Western', 'voxel-countries' ),
					],
				]
			],
			'KG' => [
				'code3' => 'KGZ',
				'name' => __( 'Kyrgyzstan', 'voxel-countries' ),
				'continent' => 'Asia',
				'states' => [
					'B' => [
						'name' => __( 'Batken', 'voxel-countries' ),
					],
					'GB' => [
						'name' => __( 'Bishkek', 'voxel-countries' ),
					],
					'C' => [
						'name' => __( 'Chü', 'voxel-countries' ),
					],
					'J' => [
						'name' => __( 'Jalal-Abad', 'voxel-countries' ),
					],
					'N' => [
						'name' => __( 'Naryn', 'voxel-countries' ),
					],
					'O' => [
						'name' => __( 'Osh', 'voxel-countries' ),
					],
					'T' => [
						'name' => __( 'Talas', 'voxel-countries' ),
					],
					'Y' => [
						'name' => __( 'Ysyk-Köl', 'voxel-countries' ),
					],
				]
			],
			'KH' => [
				'code3' => 'KHM',
				'name' => __( 'Cambodia', 'voxel-countries' ),
				'continent' => 'Asia',
				'states' => [
					'2' => [
						'name' => __( 'Baat Dambang', 'voxel-countries' ),
					],
					'1' => [
						'name' => __( 'Banteay Mean Chey', 'voxel-countries' ),
					],
					'3' => [
						'name' => __( 'Kampong Chaam', 'voxel-countries' ),
					],
					'4' => [
						'name' => __( 'Kampong Chhnang', 'voxel-countries' ),
					],
					'5' => [
						'name' => __( 'Kampong Spueu', 'voxel-countries' ),
					],
					'6' => [
						'name' => __( 'Kampong Thum', 'voxel-countries' ),
					],
					'7' => [
						'name' => __( 'Kampot', 'voxel-countries' ),
					],
					'8' => [
						'name' => __( 'Kandaal', 'voxel-countries' ),
					],
					'9' => [
						'name' => __( 'Kaoh Kong', 'voxel-countries' ),
					],
					'10' => [
						'name' => __( 'Kracheh', 'voxel-countries' ),
					],
					'23' => [
						'name' => __( 'Krong Kaeb', 'voxel-countries' ),
					],
					'24' => [
						'name' => __( 'Krong Pailin', 'voxel-countries' ),
					],
					'18' => [
						'name' => __( 'Krong Preah Sihanouk', 'voxel-countries' ),
					],
					'11' => [
						'name' => __( 'Mondol Kiri', 'voxel-countries' ),
					],
					'22' => [
						'name' => __( 'Otdar Mean Chey', 'voxel-countries' ),
					],
					'12' => [
						'name' => __( 'Phnom Penh', 'voxel-countries' ),
					],
					'15' => [
						'name' => __( 'Pousaat', 'voxel-countries' ),
					],
					'13' => [
						'name' => __( 'Preah Vihear', 'voxel-countries' ),
					],
					'14' => [
						'name' => __( 'Prey Veaeng', 'voxel-countries' ),
					],
					'16' => [
						'name' => __( 'Rotanak Kiri', 'voxel-countries' ),
					],
					'17' => [
						'name' => __( 'Siem Reab', 'voxel-countries' ),
					],
					'19' => [
						'name' => __( 'Stueng Traeng', 'voxel-countries' ),
					],
					'20' => [
						'name' => __( 'Svaay Rieng', 'voxel-countries' ),
					],
					'21' => [
						'name' => __( 'Taakaev', 'voxel-countries' ),
					],
				]
			],
			'KI' => [
				'code3' => 'KIR',
				'name' => __( 'Kiribati', 'voxel-countries' ),
				'continent' => 'Oceania',
				'states' => [
					'G' => [
						'name' => __( 'Gilbert Islands', 'voxel-countries' ),
					],
					'L' => [
						'name' => __( 'Line Islands', 'voxel-countries' ),
					],
					'P' => [
						'name' => __( 'Phoenix Islands', 'voxel-countries' ),
					],
				]
			],
			'KM' => [
				'code3' => 'COM',
				'name' => __( 'Comoros', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'A' => [
						'name' => __( 'Anjouan', 'voxel-countries' ),
					],
					'G' => [
						'name' => __( 'Grande Comore', 'voxel-countries' ),
					],
					'M' => [
						'name' => __( 'Mohéli', 'voxel-countries' ),
					],
				]
			],
			'KN' => [
				'code3' => 'KNA',
				'name' => __( 'Saint Kitts and Nevis', 'voxel-countries' ),
				'continent' => 'North America',
				'states' => [
					'N' => [
						'name' => __( 'Nevis', 'voxel-countries' ),
					],
					'K' => [
						'name' => __( 'Saint Kitts', 'voxel-countries' ),
					],
				]
			],
			'KP' => [
				'code3' => 'PRK',
				'name' => __( 'North Korea', 'voxel-countries' ),
				'continent' => 'Asia',
				'states' => [
					'04' => [
						'name' => __( 'Chagang', 'voxel-countries' ),
					],
					'07' => [
						'name' => __( 'Kangwon', 'voxel-countries' ),
					],
					'09' => [
						'name' => __( 'North Hamgyong', 'voxel-countries' ),
					],
					'06' => [
						'name' => __( 'North Hwanghae', 'voxel-countries' ),
					],
					'03' => [
						'name' => __( 'North Pyongan', 'voxel-countries' ),
					],
					'01' => [
						'name' => __( 'Pyongyang', 'voxel-countries' ),
					],
					'13' => [
						'name' => __( 'Rason', 'voxel-countries' ),
					],
					'10' => [
						'name' => __( 'Ryanggang', 'voxel-countries' ),
					],
					'08' => [
						'name' => __( 'South Hamgyong', 'voxel-countries' ),
					],
					'05' => [
						'name' => __( 'South Hwanghae', 'voxel-countries' ),
					],
					'02' => [
						'name' => __( 'South Pyongan', 'voxel-countries' ),
					],
				]
			],
			'KR' => [
				'code3' => 'KOR',
				'name' => __( 'South Korea', 'voxel-countries' ),
				'continent' => 'Asia',
				'states' => [
					'26' => [
						'name' => __( 'Busan-gwangyeoksi', 'voxel-countries' ),
					],
					'43' => [
						'name' => __( 'Chungcheongbuk-do', 'voxel-countries' ),
					],
					'44' => [
						'name' => __( 'Chungcheongnam-do', 'voxel-countries' ),
					],
					'27' => [
						'name' => __( 'Daegu-gwangyeoksi', 'voxel-countries' ),
					],
					'30' => [
						'name' => __( 'Daejeon-gwangyeoksi', 'voxel-countries' ),
					],
					'42' => [
						'name' => __( 'Gangwon-do', 'voxel-countries' ),
					],
					'29' => [
						'name' => __( 'Gwangju-gwangyeoksi', 'voxel-countries' ),
					],
					'41' => [
						'name' => __( 'Gyeonggi-do', 'voxel-countries' ),
					],
					'47' => [
						'name' => __( 'Gyeongsangbuk-do', 'voxel-countries' ),
					],
					'48' => [
						'name' => __( 'Gyeongsangnam-do', 'voxel-countries' ),
					],
					'28' => [
						'name' => __( 'Incheon-gwangyeoksi', 'voxel-countries' ),
					],
					'49' => [
						'name' => __( 'Jeju-teukbyeoljachido', 'voxel-countries' ),
					],
					'45' => [
						'name' => __( 'Jeollabuk-do', 'voxel-countries' ),
					],
					'46' => [
						'name' => __( 'Jeollanam-do', 'voxel-countries' ),
					],
					'50' => [
						'name' => __( 'Sejong', 'voxel-countries' ),
					],
					'11' => [
						'name' => __( 'Seoul-teukbyeolsi', 'voxel-countries' ),
					],
					'31' => [
						'name' => __( 'Ulsan-gwangyeoksi', 'voxel-countries' ),
					],
				]
			],
			'KW' => [
				'code3' => 'KWT',
				'name' => __( 'Kuwait', 'voxel-countries' ),
				'continent' => 'Asia',
				'states' => [
					'AH' => [
						'name' => __( 'Al Aḩmadi', 'voxel-countries' ),
					],
					'FA' => [
						'name' => __( 'Al Farwānīyah', 'voxel-countries' ),
					],
					'JA' => [
						'name' => __( 'Al Jahrā’', 'voxel-countries' ),
					],
					'KU' => [
						'name' => __( 'Al Kuwayt', 'voxel-countries' ),
					],
					'MU' => [
						'name' => __( 'Mubārak al Kabīr', 'voxel-countries' ),
					],
					'HA' => [
						'name' => __( 'Ḩawallī', 'voxel-countries' ),
					],
				]
			],
			'KY' => [
				'code3' => 'CYM',
				'name' => __( 'Cayman Islands', 'voxel-countries' ),
				'continent' => 'North America',
				'states' => [],
			],
			'KZ' => [
				'code3' => 'KAZ',
				'name' => __( 'Kazakhstan', 'voxel-countries' ),
				'continent' => 'Asia',
				'states' => [
					'ALA' => [
						'name' => __( 'Almaty', 'voxel-countries' ),
					],
					'ALM' => [
						'name' => __( 'Almaty oblysy', 'voxel-countries' ),
					],
					'AKM' => [
						'name' => __( 'Aqmola oblysy', 'voxel-countries' ),
					],
					'AKT' => [
						'name' => __( 'Aqtöbe oblysy', 'voxel-countries' ),
					],
					'AST' => [
						'name' => __( 'Astana', 'voxel-countries' ),
					],
					'ATY' => [
						'name' => __( 'Atyraū oblysy', 'voxel-countries' ),
					],
					'ZAP' => [
						'name' => __( 'Batys Qazaqstan oblysy', 'voxel-countries' ),
					],
					'MAN' => [
						'name' => __( 'Mangghystaū oblysy', 'voxel-countries' ),
					],
					'YUZ' => [
						'name' => __( 'Ongtüstik Qazaqstan oblysy', 'voxel-countries' ),
					],
					'PAV' => [
						'name' => __( 'Pavlodar oblysy', 'voxel-countries' ),
					],
					'KAR' => [
						'name' => __( 'Qaraghandy oblysy', 'voxel-countries' ),
					],
					'KUS' => [
						'name' => __( 'Qostanay oblysy', 'voxel-countries' ),
					],
					'KZY' => [
						'name' => __( 'Qyzylorda oblysy', 'voxel-countries' ),
					],
					'VOS' => [
						'name' => __( 'Shyghys Qazaqstan oblysy', 'voxel-countries' ),
					],
					'SEV' => [
						'name' => __( 'Soltüstik Qazaqstan oblysy', 'voxel-countries' ),
					],
					'ZHA' => [
						'name' => __( 'Zhambyl oblysy', 'voxel-countries' ),
					],
				]
			],
			'LA' => [
				'code3' => 'LAO',
				'name' => __( 'Laos', 'voxel-countries' ),
				'continent' => 'Asia',
				'states' => [
					'AT' => [
						'name' => __( 'Attapu', 'voxel-countries' ),
					],
					'BK' => [
						'name' => __( 'Bokèo', 'voxel-countries' ),
					],
					'BL' => [
						'name' => __( 'Bolikhamxai', 'voxel-countries' ),
					],
					'CH' => [
						'name' => __( 'Champasak', 'voxel-countries' ),
					],
					'HO' => [
						'name' => __( 'Houaphan', 'voxel-countries' ),
					],
					'KH' => [
						'name' => __( 'Khammouan', 'voxel-countries' ),
					],
					'LM' => [
						'name' => __( 'Louang Namtha', 'voxel-countries' ),
					],
					'LP' => [
						'name' => __( 'Louangphabang', 'voxel-countries' ),
					],
					'OU' => [
						'name' => __( 'Oudômxai', 'voxel-countries' ),
					],
					'PH' => [
						'name' => __( 'Phôngsali', 'voxel-countries' ),
					],
					'SL' => [
						'name' => __( 'Salavan', 'voxel-countries' ),
					],
					'SV' => [
						'name' => __( 'Savannakhét', 'voxel-countries' ),
					],
					'VT' => [
						'name' => __( 'Vientiane', 'voxel-countries' ),
					],
					'VI' => [
						'name' => __( 'Vientiane', 'voxel-countries' ),
					],
					'XA' => [
						'name' => __( 'Xaignabouli', 'voxel-countries' ),
					],
					'XN' => [
						'name' => __( 'Xaisômboun', 'voxel-countries' ),
					],
					'XI' => [
						'name' => __( 'Xiangkhoang', 'voxel-countries' ),
					],
					'XE' => [
						'name' => __( 'Xékong', 'voxel-countries' ),
					],
				]
			],
			'LB' => [
				'code3' => 'LBN',
				'name' => __( 'Lebanon', 'voxel-countries' ),
				'continent' => 'Asia',
				'states' => [
					'AK' => [
						'name' => __( 'Aakkâr', 'voxel-countries' ),
					],
					'BH' => [
						'name' => __( 'Baalbek-Hermel', 'voxel-countries' ),
					],
					'BA' => [
						'name' => __( 'Beyrouth', 'voxel-countries' ),
					],
					'BI' => [
						'name' => __( 'Béqaa', 'voxel-countries' ),
					],
					'AS' => [
						'name' => __( 'Liban-Nord', 'voxel-countries' ),
					],
					'JA' => [
						'name' => __( 'Liban-Sud', 'voxel-countries' ),
					],
					'JL' => [
						'name' => __( 'Mont-Liban', 'voxel-countries' ),
					],
					'NA' => [
						'name' => __( 'Nabatîyé', 'voxel-countries' ),
					],
				]
			],
			'LC' => [
				'code3' => 'LCA',
				'name' => __( 'Saint Lucia', 'voxel-countries' ),
				'continent' => 'North America',
				'states' => [
					'01' => [
						'name' => __( 'Anse la Raye', 'voxel-countries' ),
					],
					'02' => [
						'name' => __( 'Castries', 'voxel-countries' ),
					],
					'03' => [
						'name' => __( 'Choiseul', 'voxel-countries' ),
					],
					'04' => [
						'name' => __( 'Dauphin', 'voxel-countries' ),
					],
					'05' => [
						'name' => __( 'Dennery', 'voxel-countries' ),
					],
					'06' => [
						'name' => __( 'Gros Islet', 'voxel-countries' ),
					],
					'07' => [
						'name' => __( 'Laborie', 'voxel-countries' ),
					],
					'08' => [
						'name' => __( 'Micoud', 'voxel-countries' ),
					],
					'09' => [
						'name' => __( 'Praslin', 'voxel-countries' ),
					],
					'10' => [
						'name' => __( 'Soufrière', 'voxel-countries' ),
					],
					'11' => [
						'name' => __( 'Vieux Fort', 'voxel-countries' ),
					],
				]
			],
			'LI' => [
				'code3' => 'LIE',
				'name' => __( 'Liechtenstein', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [
					'01' => [
						'name' => __( 'Balzers', 'voxel-countries' ),
					],
					'02' => [
						'name' => __( 'Eschen', 'voxel-countries' ),
					],
					'03' => [
						'name' => __( 'Gamprin', 'voxel-countries' ),
					],
					'04' => [
						'name' => __( 'Mauren', 'voxel-countries' ),
					],
					'05' => [
						'name' => __( 'Planken', 'voxel-countries' ),
					],
					'06' => [
						'name' => __( 'Ruggell', 'voxel-countries' ),
					],
					'07' => [
						'name' => __( 'Schaan', 'voxel-countries' ),
					],
					'08' => [
						'name' => __( 'Schellenberg', 'voxel-countries' ),
					],
					'09' => [
						'name' => __( 'Triesen', 'voxel-countries' ),
					],
					'10' => [
						'name' => __( 'Triesenberg', 'voxel-countries' ),
					],
					'11' => [
						'name' => __( 'Vaduz', 'voxel-countries' ),
					],
				]
			],
			'LK' => [
				'code3' => 'LKA',
				'name' => __( 'Sri Lanka', 'voxel-countries' ),
				'continent' => 'Asia',
				'states' => [
					'2' => [
						'name' => __( 'Central Province', 'voxel-countries' ),
					],
					'5' => [
						'name' => __( 'Eastern Province', 'voxel-countries' ),
					],
					'7' => [
						'name' => __( 'North Central Province', 'voxel-countries' ),
					],
					'6' => [
						'name' => __( 'North Western Province', 'voxel-countries' ),
					],
					'4' => [
						'name' => __( 'Northern Province', 'voxel-countries' ),
					],
					'9' => [
						'name' => __( 'Sabaragamuwa Province', 'voxel-countries' ),
					],
					'3' => [
						'name' => __( 'Southern Province', 'voxel-countries' ),
					],
					'8' => [
						'name' => __( 'Uva Province', 'voxel-countries' ),
					],
					'1' => [
						'name' => __( 'Western Province', 'voxel-countries' ),
					],
				]
			],
			'LR' => [
				'code3' => 'LBR',
				'name' => __( 'Liberia', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'BM' => [
						'name' => __( 'Bomi', 'voxel-countries' ),
					],
					'BG' => [
						'name' => __( 'Bong', 'voxel-countries' ),
					],
					'GP' => [
						'name' => __( 'Gbarpolu', 'voxel-countries' ),
					],
					'GB' => [
						'name' => __( 'Grand Bassa', 'voxel-countries' ),
					],
					'CM' => [
						'name' => __( 'Grand Cape Mount', 'voxel-countries' ),
					],
					'GG' => [
						'name' => __( 'Grand Gedeh', 'voxel-countries' ),
					],
					'GK' => [
						'name' => __( 'Grand Kru', 'voxel-countries' ),
					],
					'LO' => [
						'name' => __( 'Lofa', 'voxel-countries' ),
					],
					'MG' => [
						'name' => __( 'Margibi', 'voxel-countries' ),
					],
					'MY' => [
						'name' => __( 'Maryland', 'voxel-countries' ),
					],
					'MO' => [
						'name' => __( 'Montserrado', 'voxel-countries' ),
					],
					'NI' => [
						'name' => __( 'Nimba', 'voxel-countries' ),
					],
					'RG' => [
						'name' => __( 'River Gee', 'voxel-countries' ),
					],
					'RI' => [
						'name' => __( 'Rivercess', 'voxel-countries' ),
					],
					'SI' => [
						'name' => __( 'Sinoe', 'voxel-countries' ),
					],
				]
			],
			'LS' => [
				'code3' => 'LSO',
				'name' => __( 'Lesotho', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'D' => [
						'name' => __( 'Berea', 'voxel-countries' ),
					],
					'B' => [
						'name' => __( 'Butha-Buthe', 'voxel-countries' ),
					],
					'C' => [
						'name' => __( 'Leribe', 'voxel-countries' ),
					],
					'E' => [
						'name' => __( 'Mafeteng', 'voxel-countries' ),
					],
					'A' => [
						'name' => __( 'Maseru', 'voxel-countries' ),
					],
					'F' => [
						'name' => __( 'Mohale\'s Hoek', 'voxel-countries' ),
					],
					'J' => [
						'name' => __( 'Mokhotlong', 'voxel-countries' ),
					],
					'H' => [
						'name' => __( 'Qacha\'s Nek', 'voxel-countries' ),
					],
					'G' => [
						'name' => __( 'Quthing', 'voxel-countries' ),
					],
					'K' => [
						'name' => __( 'Thaba-Tseka', 'voxel-countries' ),
					],
				]
			],
			'LT' => [
				'code3' => 'LTU',
				'name' => __( 'Lithuania', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [
					'AL' => [
						'name' => __( 'Alytaus Apskritis', 'voxel-countries' ),
					],
					'KU' => [
						'name' => __( 'Kauno Apskritis', 'voxel-countries' ),
					],
					'KL' => [
						'name' => __( 'Klaipėdos Apskritis', 'voxel-countries' ),
					],
					'MR' => [
						'name' => __( 'Marijampolės Apskritis', 'voxel-countries' ),
					],
					'PN' => [
						'name' => __( 'Panevėžio Apskritis', 'voxel-countries' ),
					],
					'TA' => [
						'name' => __( 'Tauragės Apskritis', 'voxel-countries' ),
					],
					'TE' => [
						'name' => __( 'Telšių Apskritis', 'voxel-countries' ),
					],
					'UT' => [
						'name' => __( 'Utenos Apskritis', 'voxel-countries' ),
					],
					'VL' => [
						'name' => __( 'Vilniaus Apskritis', 'voxel-countries' ),
					],
					'SA' => [
						'name' => __( 'Šiaulių Apskritis', 'voxel-countries' ),
					],
				]
			],
			'LU' => [
				'code3' => 'LUX',
				'name' => __( 'Luxembourg', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [
					'D' => [
						'name' => __( 'Diekirch', 'voxel-countries' ),
					],
					'G' => [
						'name' => __( 'Grevenmacher', 'voxel-countries' ),
					],
					'L' => [
						'name' => __( 'Luxembourg', 'voxel-countries' ),
					],
				]
			],
			'LV' => [
				'code3' => 'LVA',
				'name' => __( 'Latvia', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [
					'001' => [
						'name' => __( 'Aglonas novads', 'voxel-countries' ),
					],
					'002' => [
						'name' => __( 'Aizkraukles novads', 'voxel-countries' ),
					],
					'003' => [
						'name' => __( 'Aizputes novads', 'voxel-countries' ),
					],
					'004' => [
						'name' => __( 'Aknīstes novads', 'voxel-countries' ),
					],
					'005' => [
						'name' => __( 'Alojas novads', 'voxel-countries' ),
					],
					'006' => [
						'name' => __( 'Alsungas novads', 'voxel-countries' ),
					],
					'007' => [
						'name' => __( 'Alūksnes novads', 'voxel-countries' ),
					],
					'008' => [
						'name' => __( 'Amatas novads', 'voxel-countries' ),
					],
					'009' => [
						'name' => __( 'Apes novads', 'voxel-countries' ),
					],
					'010' => [
						'name' => __( 'Auces novads', 'voxel-countries' ),
					],
					'012' => [
						'name' => __( 'Babītes novads', 'voxel-countries' ),
					],
					'013' => [
						'name' => __( 'Baldones novads', 'voxel-countries' ),
					],
					'014' => [
						'name' => __( 'Baltinavas novads', 'voxel-countries' ),
					],
					'015' => [
						'name' => __( 'Balvu novads', 'voxel-countries' ),
					],
					'016' => [
						'name' => __( 'Bauskas novads', 'voxel-countries' ),
					],
					'017' => [
						'name' => __( 'Beverīnas novads', 'voxel-countries' ),
					],
					'018' => [
						'name' => __( 'Brocēnu novads', 'voxel-countries' ),
					],
					'019' => [
						'name' => __( 'Burtnieku novads', 'voxel-countries' ),
					],
					'020' => [
						'name' => __( 'Carnikavas novads', 'voxel-countries' ),
					],
					'021' => [
						'name' => __( 'Cesvaines novads', 'voxel-countries' ),
					],
					'023' => [
						'name' => __( 'Ciblas novads', 'voxel-countries' ),
					],
					'022' => [
						'name' => __( 'Cēsu novads', 'voxel-countries' ),
					],
					'024' => [
						'name' => __( 'Dagdas novads', 'voxel-countries' ),
					],
					'DGV' => [
						'name' => __( 'Daugavpils', 'voxel-countries' ),
					],
					'025' => [
						'name' => __( 'Daugavpils novads', 'voxel-countries' ),
					],
					'026' => [
						'name' => __( 'Dobeles novads', 'voxel-countries' ),
					],
					'027' => [
						'name' => __( 'Dundagas novads', 'voxel-countries' ),
					],
					'028' => [
						'name' => __( 'Durbes novads', 'voxel-countries' ),
					],
					'029' => [
						'name' => __( 'Engures novads', 'voxel-countries' ),
					],
					'031' => [
						'name' => __( 'Garkalnes novads', 'voxel-countries' ),
					],
					'032' => [
						'name' => __( 'Grobiņas novads', 'voxel-countries' ),
					],
					'033' => [
						'name' => __( 'Gulbenes novads', 'voxel-countries' ),
					],
					'034' => [
						'name' => __( 'Iecavas novads', 'voxel-countries' ),
					],
					'035' => [
						'name' => __( 'Ikšķiles novads', 'voxel-countries' ),
					],
					'036' => [
						'name' => __( 'Ilūkstes novads', 'voxel-countries' ),
					],
					'037' => [
						'name' => __( 'Inčukalna novads', 'voxel-countries' ),
					],
					'038' => [
						'name' => __( 'Jaunjelgavas novads', 'voxel-countries' ),
					],
					'039' => [
						'name' => __( 'Jaunpiebalgas novads', 'voxel-countries' ),
					],
					'040' => [
						'name' => __( 'Jaunpils novads', 'voxel-countries' ),
					],
					'JEL' => [
						'name' => __( 'Jelgava', 'voxel-countries' ),
					],
					'041' => [
						'name' => __( 'Jelgavas novads', 'voxel-countries' ),
					],
					'JKB' => [
						'name' => __( 'Jēkabpils', 'voxel-countries' ),
					],
					'042' => [
						'name' => __( 'Jēkabpils novads', 'voxel-countries' ),
					],
					'JUR' => [
						'name' => __( 'Jūrmala', 'voxel-countries' ),
					],
					'043' => [
						'name' => __( 'Kandavas novads', 'voxel-countries' ),
					],
					'045' => [
						'name' => __( 'Kocēnu novads', 'voxel-countries' ),
					],
					'046' => [
						'name' => __( 'Kokneses novads', 'voxel-countries' ),
					],
					'048' => [
						'name' => __( 'Krimuldas novads', 'voxel-countries' ),
					],
					'049' => [
						'name' => __( 'Krustpils novads', 'voxel-countries' ),
					],
					'047' => [
						'name' => __( 'Krāslavas novads', 'voxel-countries' ),
					],
					'050' => [
						'name' => __( 'Kuldīgas novads', 'voxel-countries' ),
					],
					'044' => [
						'name' => __( 'Kārsavas novads', 'voxel-countries' ),
					],
					'053' => [
						'name' => __( 'Lielvārdes novads', 'voxel-countries' ),
					],
					'LPX' => [
						'name' => __( 'Liepāja', 'voxel-countries' ),
					],
					'054' => [
						'name' => __( 'Limbažu novads', 'voxel-countries' ),
					],
					'057' => [
						'name' => __( 'Lubānas novads', 'voxel-countries' ),
					],
					'058' => [
						'name' => __( 'Ludzas novads', 'voxel-countries' ),
					],
					'055' => [
						'name' => __( 'Līgatnes novads', 'voxel-countries' ),
					],
					'056' => [
						'name' => __( 'Līvānu novads', 'voxel-countries' ),
					],
					'059' => [
						'name' => __( 'Madonas novads', 'voxel-countries' ),
					],
					'060' => [
						'name' => __( 'Mazsalacas novads', 'voxel-countries' ),
					],
					'061' => [
						'name' => __( 'Mālpils novads', 'voxel-countries' ),
					],
					'062' => [
						'name' => __( 'Mārupes novads', 'voxel-countries' ),
					],
					'063' => [
						'name' => __( 'Mērsraga novads', 'voxel-countries' ),
					],
					'064' => [
						'name' => __( 'Naukšēnu novads', 'voxel-countries' ),
					],
					'065' => [
						'name' => __( 'Neretas novads', 'voxel-countries' ),
					],
					'066' => [
						'name' => __( 'Nīcas novads', 'voxel-countries' ),
					],
					'067' => [
						'name' => __( 'Ogres novads', 'voxel-countries' ),
					],
					'068' => [
						'name' => __( 'Olaines novads', 'voxel-countries' ),
					],
					'069' => [
						'name' => __( 'Ozolnieku novads', 'voxel-countries' ),
					],
					'073' => [
						'name' => __( 'Preiļu novads', 'voxel-countries' ),
					],
					'074' => [
						'name' => __( 'Priekules novads', 'voxel-countries' ),
					],
					'075' => [
						'name' => __( 'Priekuļu novads', 'voxel-countries' ),
					],
					'070' => [
						'name' => __( 'Pārgaujas novads', 'voxel-countries' ),
					],
					'071' => [
						'name' => __( 'Pāvilostas novads', 'voxel-countries' ),
					],
					'072' => [
						'name' => __( 'Pļaviņu novads', 'voxel-countries' ),
					],
					'076' => [
						'name' => __( 'Raunas novads', 'voxel-countries' ),
					],
					'078' => [
						'name' => __( 'Riebiņu novads', 'voxel-countries' ),
					],
					'079' => [
						'name' => __( 'Rojas novads', 'voxel-countries' ),
					],
					'080' => [
						'name' => __( 'Ropažu novads', 'voxel-countries' ),
					],
					'081' => [
						'name' => __( 'Rucavas novads', 'voxel-countries' ),
					],
					'082' => [
						'name' => __( 'Rugāju novads', 'voxel-countries' ),
					],
					'083' => [
						'name' => __( 'Rundāles novads', 'voxel-countries' ),
					],
					'REZ' => [
						'name' => __( 'Rēzekne', 'voxel-countries' ),
					],
					'077' => [
						'name' => __( 'Rēzeknes novads', 'voxel-countries' ),
					],
					'RIX' => [
						'name' => __( 'Rīga', 'voxel-countries' ),
					],
					'084' => [
						'name' => __( 'Rūjienas novads', 'voxel-countries' ),
					],
					'086' => [
						'name' => __( 'Salacgrīvas novads', 'voxel-countries' ),
					],
					'085' => [
						'name' => __( 'Salas novads', 'voxel-countries' ),
					],
					'087' => [
						'name' => __( 'Salaspils novads', 'voxel-countries' ),
					],
					'088' => [
						'name' => __( 'Saldus novads', 'voxel-countries' ),
					],
					'089' => [
						'name' => __( 'Saulkrastu novads', 'voxel-countries' ),
					],
					'091' => [
						'name' => __( 'Siguldas novads', 'voxel-countries' ),
					],
					'093' => [
						'name' => __( 'Skrundas novads', 'voxel-countries' ),
					],
					'092' => [
						'name' => __( 'Skrīveru novads', 'voxel-countries' ),
					],
					'094' => [
						'name' => __( 'Smiltenes novads', 'voxel-countries' ),
					],
					'095' => [
						'name' => __( 'Stopiņu novads', 'voxel-countries' ),
					],
					'096' => [
						'name' => __( 'Strenču novads', 'voxel-countries' ),
					],
					'090' => [
						'name' => __( 'Sējas novads', 'voxel-countries' ),
					],
					'097' => [
						'name' => __( 'Talsu novads', 'voxel-countries' ),
					],
					'099' => [
						'name' => __( 'Tukuma novads', 'voxel-countries' ),
					],
					'098' => [
						'name' => __( 'Tērvetes novads', 'voxel-countries' ),
					],
					'100' => [
						'name' => __( 'Vaiņodes novads', 'voxel-countries' ),
					],
					'101' => [
						'name' => __( 'Valkas novads', 'voxel-countries' ),
					],
					'VMR' => [
						'name' => __( 'Valmiera', 'voxel-countries' ),
					],
					'102' => [
						'name' => __( 'Varakļānu novads', 'voxel-countries' ),
					],
					'104' => [
						'name' => __( 'Vecpiebalgas novads', 'voxel-countries' ),
					],
					'105' => [
						'name' => __( 'Vecumnieku novads', 'voxel-countries' ),
					],
					'VEN' => [
						'name' => __( 'Ventspils', 'voxel-countries' ),
					],
					'106' => [
						'name' => __( 'Ventspils novads', 'voxel-countries' ),
					],
					'107' => [
						'name' => __( 'Viesītes novads', 'voxel-countries' ),
					],
					'108' => [
						'name' => __( 'Viļakas novads', 'voxel-countries' ),
					],
					'109' => [
						'name' => __( 'Viļānu novads', 'voxel-countries' ),
					],
					'103' => [
						'name' => __( 'Vārkavas novads', 'voxel-countries' ),
					],
					'110' => [
						'name' => __( 'Zilupes novads', 'voxel-countries' ),
					],
					'011' => [
						'name' => __( 'Ādažu novads', 'voxel-countries' ),
					],
					'030' => [
						'name' => __( 'Ērgļu novads', 'voxel-countries' ),
					],
					'051' => [
						'name' => __( 'Ķeguma novads', 'voxel-countries' ),
					],
					'052' => [
						'name' => __( 'Ķekavas novads', 'voxel-countries' ),
					],
				]
			],
			'LY' => [
				'code3' => 'LBY',
				'name' => __( 'Libya', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'BU' => [
						'name' => __( 'Al Buţnān', 'voxel-countries' ),
					],
					'JA' => [
						'name' => __( 'Al Jabal al Akhḑar', 'voxel-countries' ),
					],
					'JG' => [
						'name' => __( 'Al Jabal al Gharbī', 'voxel-countries' ),
					],
					'JI' => [
						'name' => __( 'Al Jifārah', 'voxel-countries' ),
					],
					'JU' => [
						'name' => __( 'Al Jufrah', 'voxel-countries' ),
					],
					'KF' => [
						'name' => __( 'Al Kufrah', 'voxel-countries' ),
					],
					'MJ' => [
						'name' => __( 'Al Marj', 'voxel-countries' ),
					],
					'MB' => [
						'name' => __( 'Al Marqab', 'voxel-countries' ),
					],
					'WA' => [
						'name' => __( 'Al Wāḩāt', 'voxel-countries' ),
					],
					'NQ' => [
						'name' => __( 'An Nuqaţ al Khams', 'voxel-countries' ),
					],
					'ZA' => [
						'name' => __( 'Az Zāwiyah', 'voxel-countries' ),
					],
					'BA' => [
						'name' => __( 'Banghāzī', 'voxel-countries' ),
					],
					'DR' => [
						'name' => __( 'Darnah', 'voxel-countries' ),
					],
					'GT' => [
						'name' => __( 'Ghāt', 'voxel-countries' ),
					],
					'MI' => [
						'name' => __( 'Mişrātah', 'voxel-countries' ),
					],
					'MQ' => [
						'name' => __( 'Murzuq', 'voxel-countries' ),
					],
					'NL' => [
						'name' => __( 'Nālūt', 'voxel-countries' ),
					],
					'SB' => [
						'name' => __( 'Sabhā', 'voxel-countries' ),
					],
					'SR' => [
						'name' => __( 'Surt', 'voxel-countries' ),
					],
					'WD' => [
						'name' => __( 'Wādī al Ḩayāt', 'voxel-countries' ),
					],
					'WS' => [
						'name' => __( 'Wādī ash Shāţiʾ', 'voxel-countries' ),
					],
					'TB' => [
						'name' => __( 'Ţarābulus', 'voxel-countries' ),
					],
				]
			],
			'MA' => [
				'code3' => 'MAR',
				'name' => __( 'Morocco', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'09' => [
						'name' => __( 'Chaouia-Ouardigha', 'voxel-countries' ),
					],
					'10' => [
						'name' => __( 'Doukhala-Abda', 'voxel-countries' ),
					],
					'05' => [
						'name' => __( 'Fès-Boulemane', 'voxel-countries' ),
					],
					'02' => [
						'name' => __( 'Gharb-Chrarda-Beni Hssen', 'voxel-countries' ),
					],
					'08' => [
						'name' => __( 'Grand Casablanca', 'voxel-countries' ),
					],
					'14' => [
						'name' => __( 'Guelmim-Es Smara', 'voxel-countries' ),
					],
					'04' => [
						'name' => __( 'L\'Oriental', 'voxel-countries' ),
					],
					'15' => [
						'name' => __( 'Laâyoune-Boujdour-Sakia el Hamra', 'voxel-countries' ),
					],
					'11' => [
						'name' => __( 'Marrakech-Tensift-Al Haouz', 'voxel-countries' ),
					],
					'06' => [
						'name' => __( 'Meknès-Tafilalet', 'voxel-countries' ),
					],
					'16' => [
						'name' => __( 'Oued ed Dahab-Lagouira', 'voxel-countries' ),
					],
					'07' => [
						'name' => __( 'Rabat-Salé-Zemmour-Zaer', 'voxel-countries' ),
					],
					'13' => [
						'name' => __( 'Souss-Massa-Drâa', 'voxel-countries' ),
					],
					'12' => [
						'name' => __( 'Tadla-Azilal', 'voxel-countries' ),
					],
					'01' => [
						'name' => __( 'Tanger-Tétouan', 'voxel-countries' ),
					],
					'03' => [
						'name' => __( 'Taza-Al Hoceima-Taounate', 'voxel-countries' ),
					],
				]
			],
			'MC' => [
				'code3' => 'MCO',
				'name' => __( 'Monaco', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [
					'FO' => [
						'name' => __( 'Fontvieille', 'voxel-countries' ),
					],
					'JE' => [
						'name' => __( 'Jardin Exotique', 'voxel-countries' ),
					],
					'CL' => [
						'name' => __( 'La Colle', 'voxel-countries' ),
					],
					'CO' => [
						'name' => __( 'La Condamine', 'voxel-countries' ),
					],
					'GA' => [
						'name' => __( 'La Gare', 'voxel-countries' ),
					],
					'SO' => [
						'name' => __( 'La Source', 'voxel-countries' ),
					],
					'LA' => [
						'name' => __( 'Larvotto', 'voxel-countries' ),
					],
					'MA' => [
						'name' => __( 'Malbousquet', 'voxel-countries' ),
					],
					'MO' => [
						'name' => __( 'Monaco-Ville', 'voxel-countries' ),
					],
					'MG' => [
						'name' => __( 'Moneghetti', 'voxel-countries' ),
					],
					'MC' => [
						'name' => __( 'Monte-Carlo', 'voxel-countries' ),
					],
					'MU' => [
						'name' => __( 'Moulins', 'voxel-countries' ),
					],
					'PH' => [
						'name' => __( 'Port-Hercule', 'voxel-countries' ),
					],
					'SR' => [
						'name' => __( 'Saint-Roman', 'voxel-countries' ),
					],
					'SD' => [
						'name' => __( 'Sainte-Dévote', 'voxel-countries' ),
					],
					'SP' => [
						'name' => __( 'Spélugues', 'voxel-countries' ),
					],
					'VR' => [
						'name' => __( 'Vallon de la Rousse', 'voxel-countries' ),
					],
				]
			],
			'MD' => [
				'code3' => 'MDA',
				'name' => __( 'Moldova', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [
					'AN' => [
						'name' => __( 'Anenii Noi', 'voxel-countries' ),
					],
					'BS' => [
						'name' => __( 'Basarabeasca', 'voxel-countries' ),
					],
					'BR' => [
						'name' => __( 'Briceni', 'voxel-countries' ),
					],
					'BA' => [
						'name' => __( 'Bălţi', 'voxel-countries' ),
					],
					'CA' => [
						'name' => __( 'Cahul', 'voxel-countries' ),
					],
					'CT' => [
						'name' => __( 'Cantemir', 'voxel-countries' ),
					],
					'CU' => [
						'name' => __( 'Chişinău', 'voxel-countries' ),
					],
					'CM' => [
						'name' => __( 'Cimişlia', 'voxel-countries' ),
					],
					'CR' => [
						'name' => __( 'Criuleni', 'voxel-countries' ),
					],
					'CL' => [
						'name' => __( 'Călăraşi', 'voxel-countries' ),
					],
					'CS' => [
						'name' => __( 'Căuşeni', 'voxel-countries' ),
					],
					'DO' => [
						'name' => __( 'Donduşeni', 'voxel-countries' ),
					],
					'DR' => [
						'name' => __( 'Drochia', 'voxel-countries' ),
					],
					'DU' => [
						'name' => __( 'Dubăsari', 'voxel-countries' ),
					],
					'ED' => [
						'name' => __( 'Edineţ', 'voxel-countries' ),
					],
					'FL' => [
						'name' => __( 'Floreşti', 'voxel-countries' ),
					],
					'FA' => [
						'name' => __( 'Făleşti', 'voxel-countries' ),
					],
					'GL' => [
						'name' => __( 'Glodeni', 'voxel-countries' ),
					],
					'GA' => [
						'name' => __( 'Găgăuzia, Unitatea teritorială autonomă', 'voxel-countries' ),
					],
					'HI' => [
						'name' => __( 'Hînceşti', 'voxel-countries' ),
					],
					'IA' => [
						'name' => __( 'Ialoveni', 'voxel-countries' ),
					],
					'LE' => [
						'name' => __( 'Leova', 'voxel-countries' ),
					],
					'NI' => [
						'name' => __( 'Nisporeni', 'voxel-countries' ),
					],
					'OC' => [
						'name' => __( 'Ocniţa', 'voxel-countries' ),
					],
					'OR' => [
						'name' => __( 'Orhei', 'voxel-countries' ),
					],
					'RE' => [
						'name' => __( 'Rezina', 'voxel-countries' ),
					],
					'RI' => [
						'name' => __( 'Rîşcani', 'voxel-countries' ),
					],
					'SO' => [
						'name' => __( 'Soroca', 'voxel-countries' ),
					],
					'ST' => [
						'name' => __( 'Străşeni', 'voxel-countries' ),
					],
					'SN' => [
						'name' => __( 'Stînga Nistrului, unitatea teritorială din', 'voxel-countries' ),
					],
					'SI' => [
						'name' => __( 'Sîngerei', 'voxel-countries' ),
					],
					'TA' => [
						'name' => __( 'Taraclia', 'voxel-countries' ),
					],
					'TE' => [
						'name' => __( 'Teleneşti', 'voxel-countries' ),
					],
					'BD' => [
						'name' => __( 'Tighina', 'voxel-countries' ),
					],
					'UN' => [
						'name' => __( 'Ungheni', 'voxel-countries' ),
					],
					'SD' => [
						'name' => __( 'Şoldăneşti', 'voxel-countries' ),
					],
					'SV' => [
						'name' => __( 'Ştefan Vodă', 'voxel-countries' ),
					],
				]
			],
			'ME' => [
				'code3' => 'MNE',
				'name' => __( 'Montenegro', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [
					'01' => [
						'name' => __( 'Andrijevica', 'voxel-countries' ),
					],
					'02' => [
						'name' => __( 'Bar', 'voxel-countries' ),
					],
					'03' => [
						'name' => __( 'Berane', 'voxel-countries' ),
					],
					'04' => [
						'name' => __( 'Bijelo Polje', 'voxel-countries' ),
					],
					'05' => [
						'name' => __( 'Budva', 'voxel-countries' ),
					],
					'06' => [
						'name' => __( 'Cetinje', 'voxel-countries' ),
					],
					'07' => [
						'name' => __( 'Danilovgrad', 'voxel-countries' ),
					],
					'22' => [
						'name' => __( 'Gusinje', 'voxel-countries' ),
					],
					'08' => [
						'name' => __( 'Herceg-Novi', 'voxel-countries' ),
					],
					'09' => [
						'name' => __( 'Kolašin', 'voxel-countries' ),
					],
					'10' => [
						'name' => __( 'Kotor', 'voxel-countries' ),
					],
					'11' => [
						'name' => __( 'Mojkovac', 'voxel-countries' ),
					],
					'12' => [
						'name' => __( 'Nikšić', 'voxel-countries' ),
					],
					'23' => [
						'name' => __( 'Petnjica', 'voxel-countries' ),
					],
					'13' => [
						'name' => __( 'Plav', 'voxel-countries' ),
					],
					'14' => [
						'name' => __( 'Pljevlja', 'voxel-countries' ),
					],
					'15' => [
						'name' => __( 'Plužine', 'voxel-countries' ),
					],
					'16' => [
						'name' => __( 'Podgorica', 'voxel-countries' ),
					],
					'17' => [
						'name' => __( 'Rožaje', 'voxel-countries' ),
					],
					'19' => [
						'name' => __( 'Tivat', 'voxel-countries' ),
					],
					'20' => [
						'name' => __( 'Ulcinj', 'voxel-countries' ),
					],
					'18' => [
						'name' => __( 'Šavnik', 'voxel-countries' ),
					],
					'21' => [
						'name' => __( 'Žabljak', 'voxel-countries' ),
					],
				]
			],
			'MF' => [
				'code3' => 'MAF',
				'name' => __( 'Saint Martin', 'voxel-countries' ),
				'continent' => 'North America',
				'states' => [],
			],
			'MG' => [
				'code3' => 'MDG',
				'name' => __( 'Madagascar', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'T' => [
						'name' => __( 'Antananarivo', 'voxel-countries' ),
					],
					'D' => [
						'name' => __( 'Antsiranana', 'voxel-countries' ),
					],
					'F' => [
						'name' => __( 'Fianarantsoa', 'voxel-countries' ),
					],
					'M' => [
						'name' => __( 'Mahajanga', 'voxel-countries' ),
					],
					'A' => [
						'name' => __( 'Toamasina', 'voxel-countries' ),
					],
					'U' => [
						'name' => __( 'Toliara', 'voxel-countries' ),
					],
				]
			],
			'MH' => [
				'code3' => 'MHL',
				'name' => __( 'Marshall Islands', 'voxel-countries' ),
				'continent' => 'Oceania',
				'states' => [
					'L' => [
						'name' => __( 'Ralik chain', 'voxel-countries' ),
					],
					'T' => [
						'name' => __( 'Ratak chain', 'voxel-countries' ),
					],
				]
			],
			'MK' => [
				'code3' => 'MKD',
				'name' => __( 'Republic of Macedonia', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [
					'01' => [
						'name' => __( 'Aerodrom', 'voxel-countries' ),
					],
					'02' => [
						'name' => __( 'Aračinovo', 'voxel-countries' ),
					],
					'03' => [
						'name' => __( 'Berovo', 'voxel-countries' ),
					],
					'04' => [
						'name' => __( 'Bitola', 'voxel-countries' ),
					],
					'05' => [
						'name' => __( 'Bogdanci', 'voxel-countries' ),
					],
					'06' => [
						'name' => __( 'Bogovinje', 'voxel-countries' ),
					],
					'07' => [
						'name' => __( 'Bosilovo', 'voxel-countries' ),
					],
					'08' => [
						'name' => __( 'Brvenica', 'voxel-countries' ),
					],
					'09' => [
						'name' => __( 'Butel', 'voxel-countries' ),
					],
					'77' => [
						'name' => __( 'Centar', 'voxel-countries' ),
					],
					'78' => [
						'name' => __( 'Centar Župa', 'voxel-countries' ),
					],
					'21' => [
						'name' => __( 'Debar', 'voxel-countries' ),
					],
					'22' => [
						'name' => __( 'Debarca', 'voxel-countries' ),
					],
					'23' => [
						'name' => __( 'Delčevo', 'voxel-countries' ),
					],
					'25' => [
						'name' => __( 'Demir Hisar', 'voxel-countries' ),
					],
					'24' => [
						'name' => __( 'Demir Kapija', 'voxel-countries' ),
					],
					'26' => [
						'name' => __( 'Dojran', 'voxel-countries' ),
					],
					'27' => [
						'name' => __( 'Dolneni', 'voxel-countries' ),
					],
					'28' => [
						'name' => __( 'Drugovo', 'voxel-countries' ),
					],
					'17' => [
						'name' => __( 'Gazi Baba', 'voxel-countries' ),
					],
					'18' => [
						'name' => __( 'Gevgelija', 'voxel-countries' ),
					],
					'29' => [
						'name' => __( 'Gjorče Petrov', 'voxel-countries' ),
					],
					'19' => [
						'name' => __( 'Gostivar', 'voxel-countries' ),
					],
					'20' => [
						'name' => __( 'Gradsko', 'voxel-countries' ),
					],
					'34' => [
						'name' => __( 'Ilinden', 'voxel-countries' ),
					],
					'35' => [
						'name' => __( 'Jegunovce', 'voxel-countries' ),
					],
					'37' => [
						'name' => __( 'Karbinci', 'voxel-countries' ),
					],
					'38' => [
						'name' => __( 'Karpoš', 'voxel-countries' ),
					],
					'36' => [
						'name' => __( 'Kavadarci', 'voxel-countries' ),
					],
					'39' => [
						'name' => __( 'Kisela Voda', 'voxel-countries' ),
					],
					'40' => [
						'name' => __( 'Kičevo', 'voxel-countries' ),
					],
					'41' => [
						'name' => __( 'Konče', 'voxel-countries' ),
					],
					'42' => [
						'name' => __( 'Kočani', 'voxel-countries' ),
					],
					'43' => [
						'name' => __( 'Kratovo', 'voxel-countries' ),
					],
					'44' => [
						'name' => __( 'Kriva Palanka', 'voxel-countries' ),
					],
					'45' => [
						'name' => __( 'Krivogaštani', 'voxel-countries' ),
					],
					'46' => [
						'name' => __( 'Kruševo', 'voxel-countries' ),
					],
					'47' => [
						'name' => __( 'Kumanovo', 'voxel-countries' ),
					],
					'48' => [
						'name' => __( 'Lipkovo', 'voxel-countries' ),
					],
					'49' => [
						'name' => __( 'Lozovo', 'voxel-countries' ),
					],
					'51' => [
						'name' => __( 'Makedonska Kamenica', 'voxel-countries' ),
					],
					'52' => [
						'name' => __( 'Makedonski Brod', 'voxel-countries' ),
					],
					'50' => [
						'name' => __( 'Mavrovo i Rostuša', 'voxel-countries' ),
					],
					'53' => [
						'name' => __( 'Mogila', 'voxel-countries' ),
					],
					'54' => [
						'name' => __( 'Negotino', 'voxel-countries' ),
					],
					'55' => [
						'name' => __( 'Novaci', 'voxel-countries' ),
					],
					'56' => [
						'name' => __( 'Novo Selo', 'voxel-countries' ),
					],
					'58' => [
						'name' => __( 'Ohrid', 'voxel-countries' ),
					],
					'57' => [
						'name' => __( 'Oslomej', 'voxel-countries' ),
					],
					'60' => [
						'name' => __( 'Pehčevo', 'voxel-countries' ),
					],
					'59' => [
						'name' => __( 'Petrovec', 'voxel-countries' ),
					],
					'61' => [
						'name' => __( 'Plasnica', 'voxel-countries' ),
					],
					'62' => [
						'name' => __( 'Prilep', 'voxel-countries' ),
					],
					'63' => [
						'name' => __( 'Probištip', 'voxel-countries' ),
					],
					'64' => [
						'name' => __( 'Radoviš', 'voxel-countries' ),
					],
					'65' => [
						'name' => __( 'Rankovce', 'voxel-countries' ),
					],
					'66' => [
						'name' => __( 'Resen', 'voxel-countries' ),
					],
					'67' => [
						'name' => __( 'Rosoman', 'voxel-countries' ),
					],
					'68' => [
						'name' => __( 'Saraj', 'voxel-countries' ),
					],
					'70' => [
						'name' => __( 'Sopište', 'voxel-countries' ),
					],
					'71' => [
						'name' => __( 'Staro Nagoričane', 'voxel-countries' ),
					],
					'72' => [
						'name' => __( 'Struga', 'voxel-countries' ),
					],
					'73' => [
						'name' => __( 'Strumica', 'voxel-countries' ),
					],
					'74' => [
						'name' => __( 'Studeničani', 'voxel-countries' ),
					],
					'69' => [
						'name' => __( 'Sveti Nikole', 'voxel-countries' ),
					],
					'75' => [
						'name' => __( 'Tearce', 'voxel-countries' ),
					],
					'76' => [
						'name' => __( 'Tetovo', 'voxel-countries' ),
					],
					'10' => [
						'name' => __( 'Valandovo', 'voxel-countries' ),
					],
					'11' => [
						'name' => __( 'Vasilevo', 'voxel-countries' ),
					],
					'13' => [
						'name' => __( 'Veles', 'voxel-countries' ),
					],
					'12' => [
						'name' => __( 'Vevčani', 'voxel-countries' ),
					],
					'14' => [
						'name' => __( 'Vinica', 'voxel-countries' ),
					],
					'15' => [
						'name' => __( 'Vraneštica', 'voxel-countries' ),
					],
					'16' => [
						'name' => __( 'Vrapčište', 'voxel-countries' ),
					],
					'31' => [
						'name' => __( 'Zajas', 'voxel-countries' ),
					],
					'32' => [
						'name' => __( 'Zelenikovo', 'voxel-countries' ),
					],
					'33' => [
						'name' => __( 'Zrnovci', 'voxel-countries' ),
					],
					'79' => [
						'name' => __( 'Čair', 'voxel-countries' ),
					],
					'80' => [
						'name' => __( 'Čaška', 'voxel-countries' ),
					],
					'81' => [
						'name' => __( 'Češinovo-Obleševo', 'voxel-countries' ),
					],
					'82' => [
						'name' => __( 'Čučer Sandevo', 'voxel-countries' ),
					],
					'83' => [
						'name' => __( 'Štip', 'voxel-countries' ),
					],
					'84' => [
						'name' => __( 'Šuto Orizari', 'voxel-countries' ),
					],
					'30' => [
						'name' => __( 'Želino', 'voxel-countries' ),
					],
				]
			],
			'ML' => [
				'code3' => 'MLI',
				'name' => __( 'Mali', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'BKO' => [
						'name' => __( 'Bamako', 'voxel-countries' ),
					],
					'7' => [
						'name' => __( 'Gao', 'voxel-countries' ),
					],
					'1' => [
						'name' => __( 'Kayes', 'voxel-countries' ),
					],
					'8' => [
						'name' => __( 'Kidal', 'voxel-countries' ),
					],
					'2' => [
						'name' => __( 'Koulikoro', 'voxel-countries' ),
					],
					'5' => [
						'name' => __( 'Mopti', 'voxel-countries' ),
					],
					'3' => [
						'name' => __( 'Sikasso', 'voxel-countries' ),
					],
					'4' => [
						'name' => __( 'Ségou', 'voxel-countries' ),
					],
					'6' => [
						'name' => __( 'Tombouctou', 'voxel-countries' ),
					],
				]
			],
			'MM' => [
				'code3' => 'MMR',
				'name' => __( 'Myanmar', 'voxel-countries' ),
				'continent' => 'Asia',
				'states' => [
					'07' => [
						'name' => __( 'Ayeyarwady', 'voxel-countries' ),
					],
					'02' => [
						'name' => __( 'Bago', 'voxel-countries' ),
					],
					'14' => [
						'name' => __( 'Chin', 'voxel-countries' ),
					],
					'11' => [
						'name' => __( 'Kachin', 'voxel-countries' ),
					],
					'12' => [
						'name' => __( 'Kayah', 'voxel-countries' ),
					],
					'13' => [
						'name' => __( 'Kayin', 'voxel-countries' ),
					],
					'03' => [
						'name' => __( 'Magway', 'voxel-countries' ),
					],
					'04' => [
						'name' => __( 'Mandalay', 'voxel-countries' ),
					],
					'15' => [
						'name' => __( 'Mon', 'voxel-countries' ),
					],
					'16' => [
						'name' => __( 'Rakhine', 'voxel-countries' ),
					],
					'01' => [
						'name' => __( 'Sagaing', 'voxel-countries' ),
					],
					'17' => [
						'name' => __( 'Shan', 'voxel-countries' ),
					],
					'05' => [
						'name' => __( 'Tanintharyi', 'voxel-countries' ),
					],
					'06' => [
						'name' => __( 'Yangon', 'voxel-countries' ),
					],
				]
			],
			'MN' => [
				'code3' => 'MNG',
				'name' => __( 'Mongolia', 'voxel-countries' ),
				'continent' => 'Asia',
				'states' => [
					'073' => [
						'name' => __( 'Arhangay', 'voxel-countries' ),
					],
					'071' => [
						'name' => __( 'Bayan-Ölgiy', 'voxel-countries' ),
					],
					'069' => [
						'name' => __( 'Bayanhongor', 'voxel-countries' ),
					],
					'067' => [
						'name' => __( 'Bulgan', 'voxel-countries' ),
					],
					'037' => [
						'name' => __( 'Darhan uul', 'voxel-countries' ),
					],
					'061' => [
						'name' => __( 'Dornod', 'voxel-countries' ),
					],
					'063' => [
						'name' => __( 'Dornogovĭ', 'voxel-countries' ),
					],
					'059' => [
						'name' => __( 'Dundgovĭ', 'voxel-countries' ),
					],
					'057' => [
						'name' => __( 'Dzavhan', 'voxel-countries' ),
					],
					'065' => [
						'name' => __( 'Govĭ-Altay', 'voxel-countries' ),
					],
					'064' => [
						'name' => __( 'Govĭ-Sümber', 'voxel-countries' ),
					],
					'039' => [
						'name' => __( 'Hentiy', 'voxel-countries' ),
					],
					'043' => [
						'name' => __( 'Hovd', 'voxel-countries' ),
					],
					'041' => [
						'name' => __( 'Hövsgöl', 'voxel-countries' ),
					],
					'035' => [
						'name' => __( 'Orhon', 'voxel-countries' ),
					],
					'049' => [
						'name' => __( 'Selenge', 'voxel-countries' ),
					],
					'051' => [
						'name' => __( 'Sühbaatar', 'voxel-countries' ),
					],
					'047' => [
						'name' => __( 'Töv', 'voxel-countries' ),
					],
					'1' => [
						'name' => __( 'Ulaanbaatar', 'voxel-countries' ),
					],
					'046' => [
						'name' => __( 'Uvs', 'voxel-countries' ),
					],
					'053' => [
						'name' => __( 'Ömnögovĭ', 'voxel-countries' ),
					],
					'055' => [
						'name' => __( 'Övörhangay', 'voxel-countries' ),
					],
				]
			],
			'MO' => [
				'code3' => 'MAC',
				'name' => __( 'Macau', 'voxel-countries' ),
				'continent' => 'Asia',
				'states' => [],
			],
			'MP' => [
				'code3' => 'MNP',
				'name' => __( 'Northern Mariana Islands', 'voxel-countries' ),
				'continent' => 'Oceania',
				'states' => [],
			],
			'MQ' => [
				'code3' => 'MTQ',
				'name' => __( 'Martinique', 'voxel-countries' ),
				'continent' => 'North America',
				'states' => [],
			],
			'MR' => [
				'code3' => 'MRT',
				'name' => __( 'Mauritania', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'07' => [
						'name' => __( 'Adrar', 'voxel-countries' ),
					],
					'03' => [
						'name' => __( 'Assaba', 'voxel-countries' ),
					],
					'05' => [
						'name' => __( 'Brakna', 'voxel-countries' ),
					],
					'08' => [
						'name' => __( 'Dakhlet Nouâdhibou', 'voxel-countries' ),
					],
					'04' => [
						'name' => __( 'Gorgol', 'voxel-countries' ),
					],
					'10' => [
						'name' => __( 'Guidimaka', 'voxel-countries' ),
					],
					'01' => [
						'name' => __( 'Hodh ech Chargui', 'voxel-countries' ),
					],
					'02' => [
						'name' => __( 'Hodh el Gharbi', 'voxel-countries' ),
					],
					'12' => [
						'name' => __( 'Inchiri', 'voxel-countries' ),
					],
					'NKC' => [
						'name' => __( 'Nouakchott', 'voxel-countries' ),
					],
					'09' => [
						'name' => __( 'Tagant', 'voxel-countries' ),
					],
					'11' => [
						'name' => __( 'Tiris Zemmour', 'voxel-countries' ),
					],
					'06' => [
						'name' => __( 'Trarza', 'voxel-countries' ),
					],
				]
			],
			'MS' => [
				'code3' => 'MSR',
				'name' => __( 'Montserrat', 'voxel-countries' ),
				'continent' => 'North America',
				'states' => [],
			],
			'MT' => [
				'code3' => 'MLT',
				'name' => __( 'Malta', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [
					'01' => [
						'name' => __( 'Attard', 'voxel-countries' ),
					],
					'02' => [
						'name' => __( 'Balzan', 'voxel-countries' ),
					],
					'03' => [
						'name' => __( 'Birgu', 'voxel-countries' ),
					],
					'04' => [
						'name' => __( 'Birkirkara', 'voxel-countries' ),
					],
					'05' => [
						'name' => __( 'Birżebbuġa', 'voxel-countries' ),
					],
					'06' => [
						'name' => __( 'Bormla', 'voxel-countries' ),
					],
					'07' => [
						'name' => __( 'Dingli', 'voxel-countries' ),
					],
					'08' => [
						'name' => __( 'Fgura', 'voxel-countries' ),
					],
					'09' => [
						'name' => __( 'Floriana', 'voxel-countries' ),
					],
					'10' => [
						'name' => __( 'Fontana', 'voxel-countries' ),
					],
					'11' => [
						'name' => __( 'Gudja', 'voxel-countries' ),
					],
					'13' => [
						'name' => __( 'Għajnsielem', 'voxel-countries' ),
					],
					'14' => [
						'name' => __( 'Għarb', 'voxel-countries' ),
					],
					'15' => [
						'name' => __( 'Għargħur', 'voxel-countries' ),
					],
					'16' => [
						'name' => __( 'Għasri', 'voxel-countries' ),
					],
					'17' => [
						'name' => __( 'Għaxaq', 'voxel-countries' ),
					],
					'12' => [
						'name' => __( 'Gżira', 'voxel-countries' ),
					],
					'19' => [
						'name' => __( 'Iklin', 'voxel-countries' ),
					],
					'20' => [
						'name' => __( 'Isla', 'voxel-countries' ),
					],
					'21' => [
						'name' => __( 'Kalkara', 'voxel-countries' ),
					],
					'22' => [
						'name' => __( 'Kerċem', 'voxel-countries' ),
					],
					'23' => [
						'name' => __( 'Kirkop', 'voxel-countries' ),
					],
					'24' => [
						'name' => __( 'Lija', 'voxel-countries' ),
					],
					'25' => [
						'name' => __( 'Luqa', 'voxel-countries' ),
					],
					'26' => [
						'name' => __( 'Marsa', 'voxel-countries' ),
					],
					'27' => [
						'name' => __( 'Marsaskala', 'voxel-countries' ),
					],
					'28' => [
						'name' => __( 'Marsaxlokk', 'voxel-countries' ),
					],
					'29' => [
						'name' => __( 'Mdina', 'voxel-countries' ),
					],
					'30' => [
						'name' => __( 'Mellieħa', 'voxel-countries' ),
					],
					'32' => [
						'name' => __( 'Mosta', 'voxel-countries' ),
					],
					'33' => [
						'name' => __( 'Mqabba', 'voxel-countries' ),
					],
					'34' => [
						'name' => __( 'Msida', 'voxel-countries' ),
					],
					'35' => [
						'name' => __( 'Mtarfa', 'voxel-countries' ),
					],
					'36' => [
						'name' => __( 'Munxar', 'voxel-countries' ),
					],
					'31' => [
						'name' => __( 'Mġarr', 'voxel-countries' ),
					],
					'37' => [
						'name' => __( 'Nadur', 'voxel-countries' ),
					],
					'38' => [
						'name' => __( 'Naxxar', 'voxel-countries' ),
					],
					'39' => [
						'name' => __( 'Paola', 'voxel-countries' ),
					],
					'40' => [
						'name' => __( 'Pembroke', 'voxel-countries' ),
					],
					'41' => [
						'name' => __( 'Pietà', 'voxel-countries' ),
					],
					'42' => [
						'name' => __( 'Qala', 'voxel-countries' ),
					],
					'43' => [
						'name' => __( 'Qormi', 'voxel-countries' ),
					],
					'44' => [
						'name' => __( 'Qrendi', 'voxel-countries' ),
					],
					'45' => [
						'name' => __( 'Rabat Għawdex', 'voxel-countries' ),
					],
					'46' => [
						'name' => __( 'Rabat Malta', 'voxel-countries' ),
					],
					'47' => [
						'name' => __( 'Safi', 'voxel-countries' ),
					],
					'50' => [
						'name' => __( 'San Lawrenz', 'voxel-countries' ),
					],
					'51' => [
						'name' => __( 'San Pawl il-Baħar', 'voxel-countries' ),
					],
					'48' => [
						'name' => __( 'San Ġiljan', 'voxel-countries' ),
					],
					'49' => [
						'name' => __( 'San Ġwann', 'voxel-countries' ),
					],
					'52' => [
						'name' => __( 'Sannat', 'voxel-countries' ),
					],
					'53' => [
						'name' => __( 'Santa Luċija', 'voxel-countries' ),
					],
					'54' => [
						'name' => __( 'Santa Venera', 'voxel-countries' ),
					],
					'55' => [
						'name' => __( 'Siġġiewi', 'voxel-countries' ),
					],
					'56' => [
						'name' => __( 'Sliema', 'voxel-countries' ),
					],
					'57' => [
						'name' => __( 'Swieqi', 'voxel-countries' ),
					],
					'58' => [
						'name' => __( 'Ta\' Xbiex', 'voxel-countries' ),
					],
					'59' => [
						'name' => __( 'Tarxien', 'voxel-countries' ),
					],
					'60' => [
						'name' => __( 'Valletta', 'voxel-countries' ),
					],
					'61' => [
						'name' => __( 'Xagħra', 'voxel-countries' ),
					],
					'62' => [
						'name' => __( 'Xewkija', 'voxel-countries' ),
					],
					'63' => [
						'name' => __( 'Xgħajra', 'voxel-countries' ),
					],
					'18' => [
						'name' => __( 'Ħamrun', 'voxel-countries' ),
					],
					'64' => [
						'name' => __( 'Żabbar', 'voxel-countries' ),
					],
					'65' => [
						'name' => __( 'Żebbuġ Għawdex', 'voxel-countries' ),
					],
					'66' => [
						'name' => __( 'Żebbuġ Malta', 'voxel-countries' ),
					],
					'67' => [
						'name' => __( 'Żejtun', 'voxel-countries' ),
					],
					'68' => [
						'name' => __( 'Żurrieq', 'voxel-countries' ),
					],
				]
			],
			'MU' => [
				'code3' => 'MUS',
				'name' => __( 'Mauritius', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'AG' => [
						'name' => __( 'Agalega Islands', 'voxel-countries' ),
					],
					'BR' => [
						'name' => __( 'Beau Bassin-Rose Hill', 'voxel-countries' ),
					],
					'BL' => [
						'name' => __( 'Black River', 'voxel-countries' ),
					],
					'CC' => [
						'name' => __( 'Cargados Carajos Shoals', 'voxel-countries' ),
					],
					'CU' => [
						'name' => __( 'Curepipe', 'voxel-countries' ),
					],
					'FL' => [
						'name' => __( 'Flacq', 'voxel-countries' ),
					],
					'GP' => [
						'name' => __( 'Grand Port', 'voxel-countries' ),
					],
					'MO' => [
						'name' => __( 'Moka', 'voxel-countries' ),
					],
					'PA' => [
						'name' => __( 'Pamplemousses', 'voxel-countries' ),
					],
					'PW' => [
						'name' => __( 'Plaines Wilhems', 'voxel-countries' ),
					],
					'PL' => [
						'name' => __( 'Port Louis', 'voxel-countries' ),
					],
					'PU' => [
						'name' => __( 'Port Louis', 'voxel-countries' ),
					],
					'QB' => [
						'name' => __( 'Quatre Bornes', 'voxel-countries' ),
					],
					'RR' => [
						'name' => __( 'Rivière du Rempart', 'voxel-countries' ),
					],
					'RO' => [
						'name' => __( 'Rodrigues Island', 'voxel-countries' ),
					],
					'SA' => [
						'name' => __( 'Savanne', 'voxel-countries' ),
					],
					'VP' => [
						'name' => __( 'Vacoas-Phoenix', 'voxel-countries' ),
					],
				]
			],
			'MV' => [
				'code3' => 'MDV',
				'name' => __( 'Maldives', 'voxel-countries' ),
				'continent' => 'Asia',
				'states' => [
					'CE' => [
						'name' => __( 'Central', 'voxel-countries' ),
					],
					'MLE' => [
						'name' => __( 'Male', 'voxel-countries' ),
					],
					'NO' => [
						'name' => __( 'North', 'voxel-countries' ),
					],
					'NC' => [
						'name' => __( 'North Central', 'voxel-countries' ),
					],
					'SU' => [
						'name' => __( 'South', 'voxel-countries' ),
					],
					'SC' => [
						'name' => __( 'South Central', 'voxel-countries' ),
					],
					'UN' => [
						'name' => __( 'Upper North', 'voxel-countries' ),
					],
					'US' => [
						'name' => __( 'Upper South', 'voxel-countries' ),
					],
				]
			],
			'MW' => [
				'code3' => 'MWI',
				'name' => __( 'Malawi', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'C' => [
						'name' => __( 'Central Region', 'voxel-countries' ),
					],
					'N' => [
						'name' => __( 'Northern Region', 'voxel-countries' ),
					],
					'S' => [
						'name' => __( 'Southern Region', 'voxel-countries' ),
					],
				]
			],
			'MX' => [
				'code3' => 'MEX',
				'name' => __( 'Mexico', 'voxel-countries' ),
				'continent' => 'North America',
				'states' => [
					'DIF' => [
						'name' => __( 'Distrito Federal', 'voxel-countries' ),
					],
					'AGU' => [
						'name' => __( 'Aguascalientes', 'voxel-countries' ),
					],
					'BCN' => [
						'name' => __( 'Baja California', 'voxel-countries' ),
					],
					'BCS' => [
						'name' => __( 'Baja California Sur', 'voxel-countries' ),
					],
					'CAM' => [
						'name' => __( 'Campeche', 'voxel-countries' ),
					],
					'CHP' => [
						'name' => __( 'Chiapas', 'voxel-countries' ),
					],
					'CHH' => [
						'name' => __( 'Chihuahua', 'voxel-countries' ),
					],
					'COA' => [
						'name' => __( 'Coahuila', 'voxel-countries' ),
					],
					'COL' => [
						'name' => __( 'Colima', 'voxel-countries' ),
					],
					'DUR' => [
						'name' => __( 'Durango', 'voxel-countries' ),
					],
					'GUA' => [
						'name' => __( 'Guanajuato', 'voxel-countries' ),
					],
					'GRO' => [
						'name' => __( 'Guerrero', 'voxel-countries' ),
					],
					'HID' => [
						'name' => __( 'Hidalgo', 'voxel-countries' ),
					],
					'JAL' => [
						'name' => __( 'Jalisco', 'voxel-countries' ),
					],
					'MIC' => [
						'name' => __( 'Michoacán', 'voxel-countries' ),
					],
					'MOR' => [
						'name' => __( 'Morelos', 'voxel-countries' ),
					],
					'MEX' => [
						'name' => __( 'México', 'voxel-countries' ),
					],
					'NAY' => [
						'name' => __( 'Nayarit', 'voxel-countries' ),
					],
					'NLE' => [
						'name' => __( 'Nuevo León', 'voxel-countries' ),
					],
					'OAX' => [
						'name' => __( 'Oaxaca', 'voxel-countries' ),
					],
					'PUE' => [
						'name' => __( 'Puebla', 'voxel-countries' ),
					],
					'QUE' => [
						'name' => __( 'Querétaro', 'voxel-countries' ),
					],
					'ROO' => [
						'name' => __( 'Quintana Roo', 'voxel-countries' ),
					],
					'SLP' => [
						'name' => __( 'San Luis Potosí', 'voxel-countries' ),
					],
					'SIN' => [
						'name' => __( 'Sinaloa', 'voxel-countries' ),
					],
					'SON' => [
						'name' => __( 'Sonora', 'voxel-countries' ),
					],
					'TAB' => [
						'name' => __( 'Tabasco', 'voxel-countries' ),
					],
					'TAM' => [
						'name' => __( 'Tamaulipas', 'voxel-countries' ),
					],
					'TLA' => [
						'name' => __( 'Tlaxcala', 'voxel-countries' ),
					],
					'VER' => [
						'name' => __( 'Veracruz', 'voxel-countries' ),
					],
					'YUC' => [
						'name' => __( 'Yucatán', 'voxel-countries' ),
					],
					'ZAC' => [
						'name' => __( 'Zacatecas', 'voxel-countries' ),
					],
				]
			],
			'MY' => [
				'code3' => 'MYS',
				'name' => __( 'Malaysia', 'voxel-countries' ),
				'continent' => 'Asia',
				'states' => [
					'14' => [
						'name' => __( 'Wilayah Persekutuan Kuala Lumpur', 'voxel-countries' ),
					],
					'15' => [
						'name' => __( 'Wilayah Persekutuan Labuan', 'voxel-countries' ),
					],
					'16' => [
						'name' => __( 'Wilayah Persekutuan Putrajaya', 'voxel-countries' ),
					],
					'01' => [
						'name' => __( 'Johor', 'voxel-countries' ),
					],
					'02' => [
						'name' => __( 'Kedah', 'voxel-countries' ),
					],
					'03' => [
						'name' => __( 'Kelantan', 'voxel-countries' ),
					],
					'04' => [
						'name' => __( 'Melaka', 'voxel-countries' ),
					],
					'05' => [
						'name' => __( 'Negeri Sembilan', 'voxel-countries' ),
					],
					'06' => [
						'name' => __( 'Pahang', 'voxel-countries' ),
					],
					'08' => [
						'name' => __( 'Perak', 'voxel-countries' ),
					],
					'09' => [
						'name' => __( 'Perlis', 'voxel-countries' ),
					],
					'07' => [
						'name' => __( 'Pulau Pinang', 'voxel-countries' ),
					],
					'12' => [
						'name' => __( 'Sabah', 'voxel-countries' ),
					],
					'13' => [
						'name' => __( 'Sarawak', 'voxel-countries' ),
					],
					'10' => [
						'name' => __( 'Selangor', 'voxel-countries' ),
					],
					'11' => [
						'name' => __( 'Terengganu', 'voxel-countries' ),
					],
				]
			],
			'MZ' => [
				'code3' => 'MOZ',
				'name' => __( 'Mozambique', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'P' => [
						'name' => __( 'Cabo Delgado', 'voxel-countries' ),
					],
					'G' => [
						'name' => __( 'Gaza', 'voxel-countries' ),
					],
					'I' => [
						'name' => __( 'Inhambane', 'voxel-countries' ),
					],
					'B' => [
						'name' => __( 'Manica', 'voxel-countries' ),
					],
					'MPM' => [
						'name' => __( 'Maputo', 'voxel-countries' ),
					],
					'L' => [
						'name' => __( 'Maputo', 'voxel-countries' ),
					],
					'N' => [
						'name' => __( 'Nampula', 'voxel-countries' ),
					],
					'A' => [
						'name' => __( 'Niassa', 'voxel-countries' ),
					],
					'S' => [
						'name' => __( 'Sofala', 'voxel-countries' ),
					],
					'T' => [
						'name' => __( 'Tete', 'voxel-countries' ),
					],
					'Q' => [
						'name' => __( 'Zambézia', 'voxel-countries' ),
					],
				]
			],
			'NA' => [
				'code3' => 'NAM',
				'name' => __( 'Namibia', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'ER' => [
						'name' => __( 'Erongo', 'voxel-countries' ),
					],
					'HA' => [
						'name' => __( 'Hardap', 'voxel-countries' ),
					],
					'KA' => [
						'name' => __( 'Karas', 'voxel-countries' ),
					],
					'KE' => [
						'name' => __( 'Kavango East', 'voxel-countries' ),
					],
					'KW' => [
						'name' => __( 'Kavango West', 'voxel-countries' ),
					],
					'KH' => [
						'name' => __( 'Khomas', 'voxel-countries' ),
					],
					'KU' => [
						'name' => __( 'Kunene', 'voxel-countries' ),
					],
					'OW' => [
						'name' => __( 'Ohangwena', 'voxel-countries' ),
					],
					'OH' => [
						'name' => __( 'Omaheke', 'voxel-countries' ),
					],
					'OS' => [
						'name' => __( 'Omusati', 'voxel-countries' ),
					],
					'ON' => [
						'name' => __( 'Oshana', 'voxel-countries' ),
					],
					'OT' => [
						'name' => __( 'Oshikoto', 'voxel-countries' ),
					],
					'OD' => [
						'name' => __( 'Otjozondjupa', 'voxel-countries' ),
					],
					'CA' => [
						'name' => __( 'Zambezi', 'voxel-countries' ),
					],
				]
			],
			'NC' => [
				'code3' => 'NCL',
				'name' => __( 'New Caledonia', 'voxel-countries' ),
				'continent' => 'Oceania',
				'states' => [],
			],
			'NE' => [
				'code3' => 'NER',
				'name' => __( 'Niger', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'1' => [
						'name' => __( 'Agadez', 'voxel-countries' ),
					],
					'2' => [
						'name' => __( 'Diffa', 'voxel-countries' ),
					],
					'3' => [
						'name' => __( 'Dosso', 'voxel-countries' ),
					],
					'4' => [
						'name' => __( 'Maradi', 'voxel-countries' ),
					],
					'8' => [
						'name' => __( 'Niamey', 'voxel-countries' ),
					],
					'5' => [
						'name' => __( 'Tahoua', 'voxel-countries' ),
					],
					'6' => [
						'name' => __( 'Tillabéri', 'voxel-countries' ),
					],
					'7' => [
						'name' => __( 'Zinder', 'voxel-countries' ),
					],
				]
			],
			'NF' => [
				'code3' => 'NFK',
				'name' => __( 'Norfolk Island', 'voxel-countries' ),
				'continent' => 'Oceania',
				'states' => [],
			],
			'NG' => [
				'code3' => 'NGA',
				'name' => __( 'Nigeria', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'AB' => [
						'name' => __( 'Abia', 'voxel-countries' ),
					],
					'FC' => [
						'name' => __( 'Abuja Federal Capital Territory', 'voxel-countries' ),
					],
					'AD' => [
						'name' => __( 'Adamawa', 'voxel-countries' ),
					],
					'AK' => [
						'name' => __( 'Akwa Ibom', 'voxel-countries' ),
					],
					'AN' => [
						'name' => __( 'Anambra', 'voxel-countries' ),
					],
					'BA' => [
						'name' => __( 'Bauchi', 'voxel-countries' ),
					],
					'BY' => [
						'name' => __( 'Bayelsa', 'voxel-countries' ),
					],
					'BE' => [
						'name' => __( 'Benue', 'voxel-countries' ),
					],
					'BO' => [
						'name' => __( 'Borno', 'voxel-countries' ),
					],
					'CR' => [
						'name' => __( 'Cross River', 'voxel-countries' ),
					],
					'DE' => [
						'name' => __( 'Delta', 'voxel-countries' ),
					],
					'EB' => [
						'name' => __( 'Ebonyi', 'voxel-countries' ),
					],
					'ED' => [
						'name' => __( 'Edo', 'voxel-countries' ),
					],
					'EK' => [
						'name' => __( 'Ekiti', 'voxel-countries' ),
					],
					'EN' => [
						'name' => __( 'Enugu', 'voxel-countries' ),
					],
					'GO' => [
						'name' => __( 'Gombe', 'voxel-countries' ),
					],
					'IM' => [
						'name' => __( 'Imo', 'voxel-countries' ),
					],
					'JI' => [
						'name' => __( 'Jigawa', 'voxel-countries' ),
					],
					'KD' => [
						'name' => __( 'Kaduna', 'voxel-countries' ),
					],
					'KN' => [
						'name' => __( 'Kano', 'voxel-countries' ),
					],
					'KT' => [
						'name' => __( 'Katsina', 'voxel-countries' ),
					],
					'KE' => [
						'name' => __( 'Kebbi', 'voxel-countries' ),
					],
					'KO' => [
						'name' => __( 'Kogi', 'voxel-countries' ),
					],
					'KW' => [
						'name' => __( 'Kwara', 'voxel-countries' ),
					],
					'LA' => [
						'name' => __( 'Lagos', 'voxel-countries' ),
					],
					'NA' => [
						'name' => __( 'Nassarawa', 'voxel-countries' ),
					],
					'NI' => [
						'name' => __( 'Niger', 'voxel-countries' ),
					],
					'OG' => [
						'name' => __( 'Ogun', 'voxel-countries' ),
					],
					'ON' => [
						'name' => __( 'Ondo', 'voxel-countries' ),
					],
					'OS' => [
						'name' => __( 'Osun', 'voxel-countries' ),
					],
					'OY' => [
						'name' => __( 'Oyo', 'voxel-countries' ),
					],
					'PL' => [
						'name' => __( 'Plateau', 'voxel-countries' ),
					],
					'RI' => [
						'name' => __( 'Rivers', 'voxel-countries' ),
					],
					'SO' => [
						'name' => __( 'Sokoto', 'voxel-countries' ),
					],
					'TA' => [
						'name' => __( 'Taraba', 'voxel-countries' ),
					],
					'YO' => [
						'name' => __( 'Yobe', 'voxel-countries' ),
					],
					'ZA' => [
						'name' => __( 'Zamfara', 'voxel-countries' ),
					],
				]
			],
			'NI' => [
				'code3' => 'NIC',
				'name' => __( 'Nicaragua', 'voxel-countries' ),
				'continent' => 'North America',
				'states' => [
					'AN' => [
						'name' => __( 'Atlántico Norte', 'voxel-countries' ),
					],
					'AS' => [
						'name' => __( 'Atlántico Sur', 'voxel-countries' ),
					],
					'BO' => [
						'name' => __( 'Boaco', 'voxel-countries' ),
					],
					'CA' => [
						'name' => __( 'Carazo', 'voxel-countries' ),
					],
					'CI' => [
						'name' => __( 'Chinandega', 'voxel-countries' ),
					],
					'CO' => [
						'name' => __( 'Chontales', 'voxel-countries' ),
					],
					'ES' => [
						'name' => __( 'Estelí', 'voxel-countries' ),
					],
					'GR' => [
						'name' => __( 'Granada', 'voxel-countries' ),
					],
					'JI' => [
						'name' => __( 'Jinotega', 'voxel-countries' ),
					],
					'LE' => [
						'name' => __( 'León', 'voxel-countries' ),
					],
					'MD' => [
						'name' => __( 'Madriz', 'voxel-countries' ),
					],
					'MN' => [
						'name' => __( 'Managua', 'voxel-countries' ),
					],
					'MS' => [
						'name' => __( 'Masaya', 'voxel-countries' ),
					],
					'MT' => [
						'name' => __( 'Matagalpa', 'voxel-countries' ),
					],
					'NS' => [
						'name' => __( 'Nueva Segovia', 'voxel-countries' ),
					],
					'RI' => [
						'name' => __( 'Rivas', 'voxel-countries' ),
					],
					'SJ' => [
						'name' => __( 'Río San Juan', 'voxel-countries' ),
					],
				]
			],
			'NL' => [
				'code3' => 'NLD',
				'name' => __( 'Netherlands', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [
					'DR' => [
						'name' => __( 'Drenthe', 'voxel-countries' ),
					],
					'FL' => [
						'name' => __( 'Flevoland', 'voxel-countries' ),
					],
					'FR' => [
						'name' => __( 'Fryslân', 'voxel-countries' ),
					],
					'GE' => [
						'name' => __( 'Gelderland', 'voxel-countries' ),
					],
					'GR' => [
						'name' => __( 'Groningen', 'voxel-countries' ),
					],
					'LI' => [
						'name' => __( 'Limburg', 'voxel-countries' ),
					],
					'NB' => [
						'name' => __( 'Noord-Brabant', 'voxel-countries' ),
					],
					'NH' => [
						'name' => __( 'Noord-Holland', 'voxel-countries' ),
					],
					'OV' => [
						'name' => __( 'Overijssel', 'voxel-countries' ),
					],
					'UT' => [
						'name' => __( 'Utrecht', 'voxel-countries' ),
					],
					'ZE' => [
						'name' => __( 'Zeeland', 'voxel-countries' ),
					],
					'ZH' => [
						'name' => __( 'Zuid-Holland', 'voxel-countries' ),
					],
					'AW' => [
						'name' => __( 'Aruba', 'voxel-countries' ),
					],
					'CW' => [
						'name' => __( 'Curaçao', 'voxel-countries' ),
					],
					'SX' => [
						'name' => __( 'Sint Maarten', 'voxel-countries' ),
					],
					'BQ1' => [
						'name' => __( 'Bonaire', 'voxel-countries' ),
					],
					'BQ2' => [
						'name' => __( 'Saba', 'voxel-countries' ),
					],
					'BQ3' => [
						'name' => __( 'Sint Eustatius', 'voxel-countries' ),
					],
				]
			],
			'NO' => [
				'code3' => 'NOR',
				'name' => __( 'Norway', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [
					'02' => [
						'name' => __( 'Akershus', 'voxel-countries' ),
					],
					'09' => [
						'name' => __( 'Aust-Agder', 'voxel-countries' ),
					],
					'06' => [
						'name' => __( 'Buskerud', 'voxel-countries' ),
					],
					'20' => [
						'name' => __( 'Finnmark', 'voxel-countries' ),
					],
					'04' => [
						'name' => __( 'Hedmark', 'voxel-countries' ),
					],
					'12' => [
						'name' => __( 'Hordaland', 'voxel-countries' ),
					],
					'22' => [
						'name' => __( 'Jan Mayen', 'voxel-countries' ),
					],
					'15' => [
						'name' => __( 'Møre og Romsdal', 'voxel-countries' ),
					],
					'17' => [
						'name' => __( 'Nord-Trøndelag', 'voxel-countries' ),
					],
					'18' => [
						'name' => __( 'Nordland', 'voxel-countries' ),
					],
					'05' => [
						'name' => __( 'Oppland', 'voxel-countries' ),
					],
					'03' => [
						'name' => __( 'Oslo', 'voxel-countries' ),
					],
					'11' => [
						'name' => __( 'Rogaland', 'voxel-countries' ),
					],
					'14' => [
						'name' => __( 'Sogn og Fjordane', 'voxel-countries' ),
					],
					'21' => [
						'name' => __( 'Svalbard', 'voxel-countries' ),
					],
					'16' => [
						'name' => __( 'Sør-Trøndelag', 'voxel-countries' ),
					],
					'08' => [
						'name' => __( 'Telemark', 'voxel-countries' ),
					],
					'19' => [
						'name' => __( 'Troms', 'voxel-countries' ),
					],
					'10' => [
						'name' => __( 'Vest-Agder', 'voxel-countries' ),
					],
					'07' => [
						'name' => __( 'Vestfold', 'voxel-countries' ),
					],
					'01' => [
						'name' => __( 'Østfold', 'voxel-countries' ),
					],
				]
			],
			'NP' => [
				'code3' => 'NPL',
				'name' => __( 'Nepal', 'voxel-countries' ),
				'continent' => 'Asia',
				'states' => [
					'2' => [
						'name' => __( 'Madhya Pashchimanchal', 'voxel-countries' ),
					],
					'1' => [
						'name' => __( 'Madhyamanchal', 'voxel-countries' ),
					],
					'3' => [
						'name' => __( 'Pashchimanchal', 'voxel-countries' ),
					],
					'4' => [
						'name' => __( 'Purwanchal', 'voxel-countries' ),
					],
					'5' => [
						'name' => __( 'Sudur Pashchimanchal', 'voxel-countries' ),
					],
				]
			],
			'NR' => [
				'code3' => 'NRU',
				'name' => __( 'Nauru', 'voxel-countries' ),
				'continent' => 'Oceania',
				'states' => [
					'01' => [
						'name' => __( 'Aiwo', 'voxel-countries' ),
					],
					'02' => [
						'name' => __( 'Anabar', 'voxel-countries' ),
					],
					'03' => [
						'name' => __( 'Anetan', 'voxel-countries' ),
					],
					'04' => [
						'name' => __( 'Anibare', 'voxel-countries' ),
					],
					'05' => [
						'name' => __( 'Baiti', 'voxel-countries' ),
					],
					'06' => [
						'name' => __( 'Boe', 'voxel-countries' ),
					],
					'07' => [
						'name' => __( 'Buada', 'voxel-countries' ),
					],
					'08' => [
						'name' => __( 'Denigomodu', 'voxel-countries' ),
					],
					'09' => [
						'name' => __( 'Ewa', 'voxel-countries' ),
					],
					'10' => [
						'name' => __( 'Ijuw', 'voxel-countries' ),
					],
					'11' => [
						'name' => __( 'Meneng', 'voxel-countries' ),
					],
					'12' => [
						'name' => __( 'Nibok', 'voxel-countries' ),
					],
					'13' => [
						'name' => __( 'Uaboe', 'voxel-countries' ),
					],
					'14' => [
						'name' => __( 'Yaren', 'voxel-countries' ),
					],
				]
			],
			'NU' => [
				'code3' => 'NIU',
				'name' => __( 'Niue', 'voxel-countries' ),
				'continent' => 'Oceania',
				'states' => [],
			],
			'NZ' => [
				'code3' => 'NZL',
				'name' => __( 'New Zealand', 'voxel-countries' ),
				'continent' => 'Oceania',
				'states' => [
					'N' => [
						'name' => __( 'North Island', 'voxel-countries' ),
					],
					'S' => [
						'name' => __( 'South Island', 'voxel-countries' ),
					],
					'AUK' => [
						'name' => __( 'Auckland', 'voxel-countries' ),
					],
					'BOP' => [
						'name' => __( 'Bay of Plenty', 'voxel-countries' ),
					],
					'CAN' => [
						'name' => __( 'Canterbury', 'voxel-countries' ),
					],
					'HKB' => [
						'name' => __( 'Hawke\'s Bay', 'voxel-countries' ),
					],
					'MWT' => [
						'name' => __( 'Manawatu-Wanganui', 'voxel-countries' ),
					],
					'NTL' => [
						'name' => __( 'Northland', 'voxel-countries' ),
					],
					'OTA' => [
						'name' => __( 'Otago', 'voxel-countries' ),
					],
					'STL' => [
						'name' => __( 'Southland', 'voxel-countries' ),
					],
					'TKI' => [
						'name' => __( 'Taranaki', 'voxel-countries' ),
					],
					'WKO' => [
						'name' => __( 'Waikato', 'voxel-countries' ),
					],
					'WGN' => [
						'name' => __( 'Wellington', 'voxel-countries' ),
					],
					'WTC' => [
						'name' => __( 'West Coast', 'voxel-countries' ),
					],
					'CIT' => [
						'name' => __( 'Chatham Islands Territory', 'voxel-countries' ),
					],
					'GIS' => [
						'name' => __( 'Gisborne District', 'voxel-countries' ),
					],
					'MBH' => [
						'name' => __( 'Marlborough District', 'voxel-countries' ),
					],
					'NSN' => [
						'name' => __( 'Nelson City', 'voxel-countries' ),
					],
					'TAS' => [
						'name' => __( 'Tasman District', 'voxel-countries' ),
					],
				]
			],
			'OM' => [
				'code3' => 'OMN',
				'name' => __( 'Oman', 'voxel-countries' ),
				'continent' => 'Asia',
				'states' => [
					'DA' => [
						'name' => __( 'Ad Dākhilīyah', 'voxel-countries' ),
					],
					'BU' => [
						'name' => __( 'Al Buraymī', 'voxel-countries' ),
					],
					'BA' => [
						'name' => __( 'Al Bāţinah', 'voxel-countries' ),
					],
					'WU' => [
						'name' => __( 'Al Wusţá', 'voxel-countries' ),
					],
					'SH' => [
						'name' => __( 'Ash Sharqīyah', 'voxel-countries' ),
					],
					'ZA' => [
						'name' => __( 'Az̧ Z̧āhirah', 'voxel-countries' ),
					],
					'MA' => [
						'name' => __( 'Masqaţ', 'voxel-countries' ),
					],
					'MU' => [
						'name' => __( 'Musandam', 'voxel-countries' ),
					],
					'ZU' => [
						'name' => __( 'Z̧ufār', 'voxel-countries' ),
					],
				]
			],
			'PA' => [
				'code3' => 'PAN',
				'name' => __( 'Panama', 'voxel-countries' ),
				'continent' => 'North America',
				'states' => [
					'1' => [
						'name' => __( 'Bocas del Toro', 'voxel-countries' ),
					],
					'4' => [
						'name' => __( 'Chiriquí', 'voxel-countries' ),
					],
					'2' => [
						'name' => __( 'Coclé', 'voxel-countries' ),
					],
					'3' => [
						'name' => __( 'Colón', 'voxel-countries' ),
					],
					'5' => [
						'name' => __( 'Darién', 'voxel-countries' ),
					],
					'EM' => [
						'name' => __( 'Emberá', 'voxel-countries' ),
					],
					'6' => [
						'name' => __( 'Herrera', 'voxel-countries' ),
					],
					'KY' => [
						'name' => __( 'Kuna Yala', 'voxel-countries' ),
					],
					'7' => [
						'name' => __( 'Los Santos', 'voxel-countries' ),
					],
					'NB' => [
						'name' => __( 'Ngöbe-Buglé', 'voxel-countries' ),
					],
					'8' => [
						'name' => __( 'Panamá', 'voxel-countries' ),
					],
					'10' => [
						'name' => __( 'Panamá Oeste', 'voxel-countries' ),
					],
					'9' => [
						'name' => __( 'Veraguas', 'voxel-countries' ),
					],
				]
			],
			'PE' => [
				'code3' => 'PER',
				'name' => __( 'Peru', 'voxel-countries' ),
				'continent' => 'South America',
				'states' => [
					'AMA' => [
						'name' => __( 'Amazonas', 'voxel-countries' ),
					],
					'ANC' => [
						'name' => __( 'Ancash', 'voxel-countries' ),
					],
					'APU' => [
						'name' => __( 'Apurímac', 'voxel-countries' ),
					],
					'ARE' => [
						'name' => __( 'Arequipa', 'voxel-countries' ),
					],
					'AYA' => [
						'name' => __( 'Ayacucho', 'voxel-countries' ),
					],
					'CAJ' => [
						'name' => __( 'Cajamarca', 'voxel-countries' ),
					],
					'CUS' => [
						'name' => __( 'Cusco', 'voxel-countries' ),
					],
					'CAL' => [
						'name' => __( 'El Callao', 'voxel-countries' ),
					],
					'HUV' => [
						'name' => __( 'Huancavelica', 'voxel-countries' ),
					],
					'HUC' => [
						'name' => __( 'Huánuco', 'voxel-countries' ),
					],
					'ICA' => [
						'name' => __( 'Ica', 'voxel-countries' ),
					],
					'JUN' => [
						'name' => __( 'Junín', 'voxel-countries' ),
					],
					'LAL' => [
						'name' => __( 'La Libertad', 'voxel-countries' ),
					],
					'LAM' => [
						'name' => __( 'Lambayeque', 'voxel-countries' ),
					],
					'LIM' => [
						'name' => __( 'Lima', 'voxel-countries' ),
					],
					'LOR' => [
						'name' => __( 'Loreto', 'voxel-countries' ),
					],
					'MDD' => [
						'name' => __( 'Madre de Dios', 'voxel-countries' ),
					],
					'MOQ' => [
						'name' => __( 'Moquegua', 'voxel-countries' ),
					],
					'LMA' => [
						'name' => __( 'Municipalidad Metropolitana de Lima', 'voxel-countries' ),
					],
					'PAS' => [
						'name' => __( 'Pasco', 'voxel-countries' ),
					],
					'PIU' => [
						'name' => __( 'Piura', 'voxel-countries' ),
					],
					'PUN' => [
						'name' => __( 'Puno', 'voxel-countries' ),
					],
					'SAM' => [
						'name' => __( 'San Martín', 'voxel-countries' ),
					],
					'TAC' => [
						'name' => __( 'Tacna', 'voxel-countries' ),
					],
					'TUM' => [
						'name' => __( 'Tumbes', 'voxel-countries' ),
					],
					'UCA' => [
						'name' => __( 'Ucayali', 'voxel-countries' ),
					],
				]
			],
			'PF' => [
				'code3' => 'PYF',
				'name' => __( 'French Polynesia', 'voxel-countries' ),
				'continent' => 'Oceania',
				'states' => [],
			],
			'PG' => [
				'code3' => 'PNG',
				'name' => __( 'Papua New Guinea', 'voxel-countries' ),
				'continent' => 'Oceania',
				'states' => [
					'NSB' => [
						'name' => __( 'Bougainville', 'voxel-countries' ),
					],
					'CPM' => [
						'name' => __( 'Central', 'voxel-countries' ),
					],
					'CPK' => [
						'name' => __( 'Chimbu', 'voxel-countries' ),
					],
					'EBR' => [
						'name' => __( 'East New Britain', 'voxel-countries' ),
					],
					'ESW' => [
						'name' => __( 'East Sepik', 'voxel-countries' ),
					],
					'EHG' => [
						'name' => __( 'Eastern Highlands', 'voxel-countries' ),
					],
					'EPW' => [
						'name' => __( 'Enga', 'voxel-countries' ),
					],
					'GPK' => [
						'name' => __( 'Gulf', 'voxel-countries' ),
					],
					'MPM' => [
						'name' => __( 'Madang', 'voxel-countries' ),
					],
					'MRL' => [
						'name' => __( 'Manus', 'voxel-countries' ),
					],
					'MBA' => [
						'name' => __( 'Milne Bay', 'voxel-countries' ),
					],
					'MPL' => [
						'name' => __( 'Morobe', 'voxel-countries' ),
					],
					'NCD' => [
						'name' => __( 'National Capital District', 'voxel-countries' ),
					],
					'NIK' => [
						'name' => __( 'New Ireland', 'voxel-countries' ),
					],
					'NPP' => [
						'name' => __( 'Northern', 'voxel-countries' ),
					],
					'SAN' => [
						'name' => __( 'Sandaun', 'voxel-countries' ),
					],
					'SHM' => [
						'name' => __( 'Southern Highlands', 'voxel-countries' ),
					],
					'WBK' => [
						'name' => __( 'West New Britain', 'voxel-countries' ),
					],
					'WPD' => [
						'name' => __( 'Western', 'voxel-countries' ),
					],
					'WHM' => [
						'name' => __( 'Western Highlands', 'voxel-countries' ),
					],
				]
			],
			'PH' => [
				'code3' => 'PHL',
				'name' => __( 'Philippines', 'voxel-countries' ),
				'continent' => 'Asia',
				'states' => [
					'14' => [
						'name' => __( 'Autonomous Region in Muslim Mindanao', 'voxel-countries' ),
					],
					'05' => [
						'name' => __( 'Bicol', 'voxel-countries' ),
					],
					'02' => [
						'name' => __( 'Cagayan Valley', 'voxel-countries' ),
					],
					'40' => [
						'name' => __( 'Calabarzon', 'voxel-countries' ),
					],
					'13' => [
						'name' => __( 'Caraga', 'voxel-countries' ),
					],
					'03' => [
						'name' => __( 'Central Luzon', 'voxel-countries' ),
					],
					'07' => [
						'name' => __( 'Central Visayas', 'voxel-countries' ),
					],
					'15' => [
						'name' => __( 'Cordillera Administrative Region', 'voxel-countries' ),
					],
					'11' => [
						'name' => __( 'Davao', 'voxel-countries' ),
					],
					'08' => [
						'name' => __( 'Eastern Visayas', 'voxel-countries' ),
					],
					'01' => [
						'name' => __( 'Ilocos', 'voxel-countries' ),
					],
					'41' => [
						'name' => __( 'Mimaropa', 'voxel-countries' ),
					],
					'00' => [
						'name' => __( 'National Capital Region', 'voxel-countries' ),
					],
					'10' => [
						'name' => __( 'Northern Mindanao', 'voxel-countries' ),
					],
					'12' => [
						'name' => __( 'Soccsksargen', 'voxel-countries' ),
					],
					'06' => [
						'name' => __( 'Western Visayas', 'voxel-countries' ),
					],
					'09' => [
						'name' => __( 'Zamboanga Peninsula', 'voxel-countries' ),
					],
				]
			],
			'PK' => [
				'code3' => 'PAK',
				'name' => __( 'Pakistan', 'voxel-countries' ),
				'continent' => 'Asia',
				'states' => [
					'JK' => [
						'name' => __( 'Azad Kashmir', 'voxel-countries' ),
					],
					'BA' => [
						'name' => __( 'Balochistan', 'voxel-countries' ),
					],
					'TA' => [
						'name' => __( 'Federally Administered Tribal Areas', 'voxel-countries' ),
					],
					'GB' => [
						'name' => __( 'Gilgit-Baltistan', 'voxel-countries' ),
					],
					'IS' => [
						'name' => __( 'Islamabad', 'voxel-countries' ),
					],
					'KP' => [
						'name' => __( 'Khyber Pakhtunkhwa', 'voxel-countries' ),
					],
					'PB' => [
						'name' => __( 'Punjab', 'voxel-countries' ),
					],
					'SD' => [
						'name' => __( 'Sindh', 'voxel-countries' ),
					],
				]
			],
			'PL' => [
				'code3' => 'POL',
				'name' => __( 'Poland', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [
					'DS' => [
						'name' => __( 'Dolnośląskie', 'voxel-countries' ),
					],
					'KP' => [
						'name' => __( 'Kujawsko-pomorskie', 'voxel-countries' ),
					],
					'LU' => [
						'name' => __( 'Lubelskie', 'voxel-countries' ),
					],
					'LB' => [
						'name' => __( 'Lubuskie', 'voxel-countries' ),
					],
					'MZ' => [
						'name' => __( 'Mazowieckie', 'voxel-countries' ),
					],
					'MA' => [
						'name' => __( 'Małopolskie', 'voxel-countries' ),
					],
					'OP' => [
						'name' => __( 'Opolskie', 'voxel-countries' ),
					],
					'PK' => [
						'name' => __( 'Podkarpackie', 'voxel-countries' ),
					],
					'PD' => [
						'name' => __( 'Podlaskie', 'voxel-countries' ),
					],
					'PM' => [
						'name' => __( 'Pomorskie', 'voxel-countries' ),
					],
					'WN' => [
						'name' => __( 'Warmińsko-mazurskie', 'voxel-countries' ),
					],
					'WP' => [
						'name' => __( 'Wielkopolskie', 'voxel-countries' ),
					],
					'ZP' => [
						'name' => __( 'Zachodniopomorskie', 'voxel-countries' ),
					],
					'LD' => [
						'name' => __( 'Łódzkie', 'voxel-countries' ),
					],
					'SL' => [
						'name' => __( 'Śląskie', 'voxel-countries' ),
					],
					'SK' => [
						'name' => __( 'Świętokrzyskie', 'voxel-countries' ),
					],
				]
			],
			'PM' => [
				'code3' => 'SPM',
				'name' => __( 'Saint Pierre and Miquelon', 'voxel-countries' ),
				'continent' => 'North America',
				'states' => [],
			],
			'PN' => [
				'code3' => 'PCN',
				'name' => __( 'Pitcairn Islands', 'voxel-countries' ),
				'continent' => 'Oceania',
				'states' => [],
			],
			'PR' => [
				'code3' => 'PRI',
				'name' => __( 'Puerto Rico', 'voxel-countries' ),
				'continent' => 'North America',
				'states' => [],
			],
			'PS' => [
				'code3' => 'PSE',
				'name' => __( 'Palestine', 'voxel-countries' ),
				'continent' => 'Asia',
				'states' => [
					'BTH' => [
						'name' => __( 'Bethlehem', 'voxel-countries' ),
					],
					'DEB' => [
						'name' => __( 'Deir El Balah', 'voxel-countries' ),
					],
					'GZA' => [
						'name' => __( 'Gaza', 'voxel-countries' ),
					],
					'HBN' => [
						'name' => __( 'Hebron', 'voxel-countries' ),
					],
					'JEN' => [
						'name' => __( 'Jenin', 'voxel-countries' ),
					],
					'JRH' => [
						'name' => __( 'Jericho – Al Aghwar', 'voxel-countries' ),
					],
					'JEM' => [
						'name' => __( 'Jerusalem', 'voxel-countries' ),
					],
					'KYS' => [
						'name' => __( 'Khan Yunis', 'voxel-countries' ),
					],
					'NBS' => [
						'name' => __( 'Nablus', 'voxel-countries' ),
					],
					'NGZ' => [
						'name' => __( 'North Gaza', 'voxel-countries' ),
					],
					'QQA' => [
						'name' => __( 'Qalqilya', 'voxel-countries' ),
					],
					'RFH' => [
						'name' => __( 'Rafah', 'voxel-countries' ),
					],
					'RBH' => [
						'name' => __( 'Ramallah', 'voxel-countries' ),
					],
					'SLT' => [
						'name' => __( 'Salfit', 'voxel-countries' ),
					],
					'TBS' => [
						'name' => __( 'Tubas', 'voxel-countries' ),
					],
					'TKM' => [
						'name' => __( 'Tulkarm', 'voxel-countries' ),
					],
				]
			],
			'PT' => [
				'code3' => 'PRT',
				'name' => __( 'Portugal', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [
					'01' => [
						'name' => __( 'Aveiro', 'voxel-countries' ),
					],
					'02' => [
						'name' => __( 'Beja', 'voxel-countries' ),
					],
					'03' => [
						'name' => __( 'Braga', 'voxel-countries' ),
					],
					'04' => [
						'name' => __( 'Bragança', 'voxel-countries' ),
					],
					'05' => [
						'name' => __( 'Castelo Branco', 'voxel-countries' ),
					],
					'06' => [
						'name' => __( 'Coimbra', 'voxel-countries' ),
					],
					'08' => [
						'name' => __( 'Faro', 'voxel-countries' ),
					],
					'09' => [
						'name' => __( 'Guarda', 'voxel-countries' ),
					],
					'10' => [
						'name' => __( 'Leiria', 'voxel-countries' ),
					],
					'11' => [
						'name' => __( 'Lisboa', 'voxel-countries' ),
					],
					'12' => [
						'name' => __( 'Portalegre', 'voxel-countries' ),
					],
					'13' => [
						'name' => __( 'Porto', 'voxel-countries' ),
					],
					'30' => [
						'name' => __( 'Região Autónoma da Madeira', 'voxel-countries' ),
					],
					'20' => [
						'name' => __( 'Região Autónoma dos Açores', 'voxel-countries' ),
					],
					'14' => [
						'name' => __( 'Santarém', 'voxel-countries' ),
					],
					'15' => [
						'name' => __( 'Setúbal', 'voxel-countries' ),
					],
					'16' => [
						'name' => __( 'Viana do Castelo', 'voxel-countries' ),
					],
					'17' => [
						'name' => __( 'Vila Real', 'voxel-countries' ),
					],
					'18' => [
						'name' => __( 'Viseu', 'voxel-countries' ),
					],
					'07' => [
						'name' => __( 'Évora', 'voxel-countries' ),
					],
				]
			],
			'PW' => [
				'code3' => 'PLW',
				'name' => __( 'Palau', 'voxel-countries' ),
				'continent' => 'Oceania',
				'states' => [
					'002' => [
						'name' => __( 'Aimeliik', 'voxel-countries' ),
					],
					'004' => [
						'name' => __( 'Airai', 'voxel-countries' ),
					],
					'010' => [
						'name' => __( 'Angaur', 'voxel-countries' ),
					],
					'050' => [
						'name' => __( 'Hatobohei', 'voxel-countries' ),
					],
					'100' => [
						'name' => __( 'Kayangel', 'voxel-countries' ),
					],
					'150' => [
						'name' => __( 'Koror', 'voxel-countries' ),
					],
					'212' => [
						'name' => __( 'Melekeok', 'voxel-countries' ),
					],
					'214' => [
						'name' => __( 'Ngaraard', 'voxel-countries' ),
					],
					'218' => [
						'name' => __( 'Ngarchelong', 'voxel-countries' ),
					],
					'222' => [
						'name' => __( 'Ngardmau', 'voxel-countries' ),
					],
					'224' => [
						'name' => __( 'Ngatpang', 'voxel-countries' ),
					],
					'226' => [
						'name' => __( 'Ngchesar', 'voxel-countries' ),
					],
					'227' => [
						'name' => __( 'Ngeremlengui', 'voxel-countries' ),
					],
					'228' => [
						'name' => __( 'Ngiwal', 'voxel-countries' ),
					],
					'350' => [
						'name' => __( 'Peleliu', 'voxel-countries' ),
					],
					'370' => [
						'name' => __( 'Sonsorol', 'voxel-countries' ),
					],
				]
			],
			'PY' => [
				'code3' => 'PRY',
				'name' => __( 'Paraguay', 'voxel-countries' ),
				'continent' => 'South America',
				'states' => [
					'16' => [
						'name' => __( 'Alto Paraguay', 'voxel-countries' ),
					],
					'10' => [
						'name' => __( 'Alto Paraná', 'voxel-countries' ),
					],
					'13' => [
						'name' => __( 'Amambay', 'voxel-countries' ),
					],
					'ASU' => [
						'name' => __( 'Asunción', 'voxel-countries' ),
					],
					'19' => [
						'name' => __( 'Boquerón', 'voxel-countries' ),
					],
					'5' => [
						'name' => __( 'Caaguazú', 'voxel-countries' ),
					],
					'6' => [
						'name' => __( 'Caazapá', 'voxel-countries' ),
					],
					'14' => [
						'name' => __( 'Canindeyú', 'voxel-countries' ),
					],
					'11' => [
						'name' => __( 'Central', 'voxel-countries' ),
					],
					'1' => [
						'name' => __( 'Concepción', 'voxel-countries' ),
					],
					'3' => [
						'name' => __( 'Cordillera', 'voxel-countries' ),
					],
					'4' => [
						'name' => __( 'Guairá', 'voxel-countries' ),
					],
					'7' => [
						'name' => __( 'Itapúa', 'voxel-countries' ),
					],
					'8' => [
						'name' => __( 'Misiones', 'voxel-countries' ),
					],
					'9' => [
						'name' => __( 'Paraguarí', 'voxel-countries' ),
					],
					'15' => [
						'name' => __( 'Presidente Hayes', 'voxel-countries' ),
					],
					'2' => [
						'name' => __( 'San Pedro', 'voxel-countries' ),
					],
					'12' => [
						'name' => __( 'Ñeembucú', 'voxel-countries' ),
					],
				]
			],
			'QA' => [
				'code3' => 'QAT',
				'name' => __( 'Qatar', 'voxel-countries' ),
				'continent' => 'Asia',
				'states' => [
					'DA' => [
						'name' => __( 'Ad Dawḩah', 'voxel-countries' ),
					],
					'KH' => [
						'name' => __( 'Al Khawr wa adh Dhakhīrah', 'voxel-countries' ),
					],
					'WA' => [
						'name' => __( 'Al Wakrah', 'voxel-countries' ),
					],
					'RA' => [
						'name' => __( 'Ar Rayyān', 'voxel-countries' ),
					],
					'MS' => [
						'name' => __( 'Ash Shamāl', 'voxel-countries' ),
					],
					'ZA' => [
						'name' => __( 'Az̧ Za̧`āyin', 'voxel-countries' ),
					],
					'US' => [
						'name' => __( 'Umm Şalāl', 'voxel-countries' ),
					],
				]
			],
			'RE' => [
				'code3' => 'REU',
				'name' => __( 'Réunion', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [],
			],
			'RO' => [
				'code3' => 'ROU',
				'name' => __( 'Romania', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [
					'AB' => [
						'name' => __( 'Alba', 'voxel-countries' ),
					],
					'AR' => [
						'name' => __( 'Arad', 'voxel-countries' ),
					],
					'AG' => [
						'name' => __( 'Argeș', 'voxel-countries' ),
					],
					'BC' => [
						'name' => __( 'Bacău', 'voxel-countries' ),
					],
					'BH' => [
						'name' => __( 'Bihor', 'voxel-countries' ),
					],
					'BN' => [
						'name' => __( 'Bistrița-Năsăud', 'voxel-countries' ),
					],
					'BT' => [
						'name' => __( 'Botoșani', 'voxel-countries' ),
					],
					'BV' => [
						'name' => __( 'Brașov', 'voxel-countries' ),
					],
					'BR' => [
						'name' => __( 'Brăila', 'voxel-countries' ),
					],
					'B' => [
						'name' => __( 'București', 'voxel-countries' ),
					],
					'BZ' => [
						'name' => __( 'Buzău', 'voxel-countries' ),
					],
					'CS' => [
						'name' => __( 'Caraș-Severin', 'voxel-countries' ),
					],
					'CJ' => [
						'name' => __( 'Cluj', 'voxel-countries' ),
					],
					'CT' => [
						'name' => __( 'Constanța', 'voxel-countries' ),
					],
					'CV' => [
						'name' => __( 'Covasna', 'voxel-countries' ),
					],
					'CL' => [
						'name' => __( 'Călărași', 'voxel-countries' ),
					],
					'DJ' => [
						'name' => __( 'Dolj', 'voxel-countries' ),
					],
					'DB' => [
						'name' => __( 'Dâmbovița', 'voxel-countries' ),
					],
					'GL' => [
						'name' => __( 'Galați', 'voxel-countries' ),
					],
					'GR' => [
						'name' => __( 'Giurgiu', 'voxel-countries' ),
					],
					'GJ' => [
						'name' => __( 'Gorj', 'voxel-countries' ),
					],
					'HR' => [
						'name' => __( 'Harghita', 'voxel-countries' ),
					],
					'HD' => [
						'name' => __( 'Hunedoara', 'voxel-countries' ),
					],
					'IL' => [
						'name' => __( 'Ialomița', 'voxel-countries' ),
					],
					'IS' => [
						'name' => __( 'Iași', 'voxel-countries' ),
					],
					'IF' => [
						'name' => __( 'Ilfov', 'voxel-countries' ),
					],
					'MM' => [
						'name' => __( 'Maramureș', 'voxel-countries' ),
					],
					'MH' => [
						'name' => __( 'Mehedinți', 'voxel-countries' ),
					],
					'MS' => [
						'name' => __( 'Mureș', 'voxel-countries' ),
					],
					'NT' => [
						'name' => __( 'Neamț', 'voxel-countries' ),
					],
					'OT' => [
						'name' => __( 'Olt', 'voxel-countries' ),
					],
					'PH' => [
						'name' => __( 'Prahova', 'voxel-countries' ),
					],
					'SM' => [
						'name' => __( 'Satu Mare', 'voxel-countries' ),
					],
					'SB' => [
						'name' => __( 'Sibiu', 'voxel-countries' ),
					],
					'SV' => [
						'name' => __( 'Suceava', 'voxel-countries' ),
					],
					'SJ' => [
						'name' => __( 'Sălaj', 'voxel-countries' ),
					],
					'TR' => [
						'name' => __( 'Teleorman', 'voxel-countries' ),
					],
					'TM' => [
						'name' => __( 'Timiș', 'voxel-countries' ),
					],
					'TL' => [
						'name' => __( 'Tulcea', 'voxel-countries' ),
					],
					'VS' => [
						'name' => __( 'Vaslui', 'voxel-countries' ),
					],
					'VN' => [
						'name' => __( 'Vrancea', 'voxel-countries' ),
					],
					'VL' => [
						'name' => __( 'Vâlcea', 'voxel-countries' ),
					],
				]
			],
			'RS' => [
				'code3' => 'SRB',
				'name' => __( 'Serbia', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [],
			],
			'RU' => [
				'code3' => 'RUS',
				'name' => __( 'Russia', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [
					'AMU' => [
						'name' => __( 'Amurskaya oblast\'', 'voxel-countries' ),
					],
					'ARK' => [
						'name' => __( 'Arkhangel\'skaya oblast\'', 'voxel-countries' ),
					],
					'AST' => [
						'name' => __( 'Astrakhanskaya oblast\'', 'voxel-countries' ),
					],
					'BEL' => [
						'name' => __( 'Belgorodskaya oblast\'', 'voxel-countries' ),
					],
					'BRY' => [
						'name' => __( 'Bryanskaya oblast\'', 'voxel-countries' ),
					],
					'CHE' => [
						'name' => __( 'Chelyabinskaya oblast\'', 'voxel-countries' ),
					],
					'IRK' => [
						'name' => __( 'Irkutskaya oblast\'', 'voxel-countries' ),
					],
					'IVA' => [
						'name' => __( 'Ivanovskaya oblast\'', 'voxel-countries' ),
					],
					'KGD' => [
						'name' => __( 'Kaliningradskaya oblast\'', 'voxel-countries' ),
					],
					'KLU' => [
						'name' => __( 'Kaluzhskaya oblast\'', 'voxel-countries' ),
					],
					'KEM' => [
						'name' => __( 'Kemerovskaya oblast\'', 'voxel-countries' ),
					],
					'KIR' => [
						'name' => __( 'Kirovskaya oblast\'', 'voxel-countries' ),
					],
					'KOS' => [
						'name' => __( 'Kostromskaya oblast\'', 'voxel-countries' ),
					],
					'KGN' => [
						'name' => __( 'Kurganskaya oblast\'', 'voxel-countries' ),
					],
					'KRS' => [
						'name' => __( 'Kurskaya oblast\'', 'voxel-countries' ),
					],
					'LEN' => [
						'name' => __( 'Leningradskaya oblast\'', 'voxel-countries' ),
					],
					'LIP' => [
						'name' => __( 'Lipetskaya oblast\'', 'voxel-countries' ),
					],
					'MAG' => [
						'name' => __( 'Magadanskaya oblast\'', 'voxel-countries' ),
					],
					'MOS' => [
						'name' => __( 'Moskovskaya oblast\'', 'voxel-countries' ),
					],
					'MUR' => [
						'name' => __( 'Murmanskaya oblast\'', 'voxel-countries' ),
					],
					'NIZ' => [
						'name' => __( 'Nizhegorodskaya oblast\'', 'voxel-countries' ),
					],
					'NGR' => [
						'name' => __( 'Novgorodskaya oblast\'', 'voxel-countries' ),
					],
					'NVS' => [
						'name' => __( 'Novosibirskaya oblast\'', 'voxel-countries' ),
					],
					'OMS' => [
						'name' => __( 'Omskaya oblast\'', 'voxel-countries' ),
					],
					'ORE' => [
						'name' => __( 'Orenburgskaya oblast\'', 'voxel-countries' ),
					],
					'ORL' => [
						'name' => __( 'Orlovskaya oblast\'', 'voxel-countries' ),
					],
					'PNZ' => [
						'name' => __( 'Penzenskaya oblast\'', 'voxel-countries' ),
					],
					'PSK' => [
						'name' => __( 'Pskovskaya oblast\'', 'voxel-countries' ),
					],
					'ROS' => [
						'name' => __( 'Rostovskaya oblast\'', 'voxel-countries' ),
					],
					'RYA' => [
						'name' => __( 'Ryazanskaya oblast\'', 'voxel-countries' ),
					],
					'SAK' => [
						'name' => __( 'Sakhalinskaya oblast\'', 'voxel-countries' ),
					],
					'SAM' => [
						'name' => __( 'Samarskaya oblast\'', 'voxel-countries' ),
					],
					'SAR' => [
						'name' => __( 'Saratovskaya oblast\'', 'voxel-countries' ),
					],
					'SMO' => [
						'name' => __( 'Smolenskaya oblast\'', 'voxel-countries' ),
					],
					'SVE' => [
						'name' => __( 'Sverdlovskaya oblast\'', 'voxel-countries' ),
					],
					'TAM' => [
						'name' => __( 'Tambovskaya oblast\'', 'voxel-countries' ),
					],
					'TOM' => [
						'name' => __( 'Tomskaya oblast\'', 'voxel-countries' ),
					],
					'TUL' => [
						'name' => __( 'Tul\'skaya oblast\'', 'voxel-countries' ),
					],
					'TVE' => [
						'name' => __( 'Tverskaya oblast\'', 'voxel-countries' ),
					],
					'TYU' => [
						'name' => __( 'Tyumenskaya oblast\'', 'voxel-countries' ),
					],
					'ULY' => [
						'name' => __( 'Ul\'yanovskaya oblast\'', 'voxel-countries' ),
					],
					'VLA' => [
						'name' => __( 'Vladimirskaya oblast\'', 'voxel-countries' ),
					],
					'VGG' => [
						'name' => __( 'Volgogradskaya oblast\'', 'voxel-countries' ),
					],
					'VLG' => [
						'name' => __( 'Vologodskaya oblast\'', 'voxel-countries' ),
					],
					'VOR' => [
						'name' => __( 'Voronezhskaya oblast\'', 'voxel-countries' ),
					],
					'YAR' => [
						'name' => __( 'Yaroslavskaya oblast\'', 'voxel-countries' ),
					],
					'ALT' => [
						'name' => __( 'Altayskiy kray', 'voxel-countries' ),
					],
					'KAM' => [
						'name' => __( 'Kamchatskiy kray', 'voxel-countries' ),
					],
					'KHA' => [
						'name' => __( 'Khabarovskiy kray', 'voxel-countries' ),
					],
					'KDA' => [
						'name' => __( 'Krasnodarskiy kray', 'voxel-countries' ),
					],
					'KYA' => [
						'name' => __( 'Krasnoyarskiy kray', 'voxel-countries' ),
					],
					'PER' => [
						'name' => __( 'Permskiy kray', 'voxel-countries' ),
					],
					'PRI' => [
						'name' => __( 'Primorskiy kray', 'voxel-countries' ),
					],
					'STA' => [
						'name' => __( 'Stavropol\'skiy kray', 'voxel-countries' ),
					],
					'ZAB' => [
						'name' => __( 'Zabaykal\'skiy kray', 'voxel-countries' ),
					],
					'MOW' => [
						'name' => __( 'Moskva', 'voxel-countries' ),
					],
					'SPE' => [
						'name' => __( 'Sankt-Peterburg', 'voxel-countries' ),
					],
					'CHU' => [
						'name' => __( 'Chukotskiy avtonomnyy okrug', 'voxel-countries' ),
					],
					'KHM' => [
						'name' => __( 'Khanty-Mansiyskiy avtonomnyy okrug-Yugra', 'voxel-countries' ),
					],
					'NEN' => [
						'name' => __( 'Nenetskiy avtonomnyy okrug', 'voxel-countries' ),
					],
					'YAN' => [
						'name' => __( 'Yamalo-Nenetskiy avtonomnyy okrug', 'voxel-countries' ),
					],
					'YEV' => [
						'name' => __( 'Yevreyskaya avtonomnaya oblast\'', 'voxel-countries' ),
					],
					'AD' => [
						'name' => __( 'Adygeya, Respublika', 'voxel-countries' ),
					],
					'AL' => [
						'name' => __( 'Altay, Respublika', 'voxel-countries' ),
					],
					'BA' => [
						'name' => __( 'Bashkortostan, Respublika', 'voxel-countries' ),
					],
					'BU' => [
						'name' => __( 'Buryatiya, Respublika', 'voxel-countries' ),
					],
					'CE' => [
						'name' => __( 'Chechenskaya Respublika', 'voxel-countries' ),
					],
					'CU' => [
						'name' => __( 'Chuvashskaya Respublika', 'voxel-countries' ),
					],
					'DA' => [
						'name' => __( 'Dagestan, Respublika', 'voxel-countries' ),
					],
					'IN' => [
						'name' => __( 'Ingushetiya, Respublika', 'voxel-countries' ),
					],
					'KB' => [
						'name' => __( 'Kabardino-Balkarskaya Respublika', 'voxel-countries' ),
					],
					'KL' => [
						'name' => __( 'Kalmykiya, Respublika', 'voxel-countries' ),
					],
					'KC' => [
						'name' => __( 'Karachayevo-Cherkesskaya Respublika', 'voxel-countries' ),
					],
					'KR' => [
						'name' => __( 'Kareliya, Respublika', 'voxel-countries' ),
					],
					'KK' => [
						'name' => __( 'Khakasiya, Respublika', 'voxel-countries' ),
					],
					'KO' => [
						'name' => __( 'Komi, Respublika', 'voxel-countries' ),
					],
					'ME' => [
						'name' => __( 'Mariy El, Respublika', 'voxel-countries' ),
					],
					'MO' => [
						'name' => __( 'Mordoviya, Respublika', 'voxel-countries' ),
					],
					'SA' => [
						'name' => __( 'Sakha, Respublika', 'voxel-countries' ),
					],
					'SE' => [
						'name' => __( 'Severnaya Osetiya-Alaniya, Respublika', 'voxel-countries' ),
					],
					'TA' => [
						'name' => __( 'Tatarstan, Respublika', 'voxel-countries' ),
					],
					'TY' => [
						'name' => __( 'Tyva, Respublika', 'voxel-countries' ),
					],
					'UD' => [
						'name' => __( 'Udmurtskaya Respublika', 'voxel-countries' ),
					],
				]
			],
			'RW' => [
				'code3' => 'RWA',
				'name' => __( 'Rwanda', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'02' => [
						'name' => __( 'Est', 'voxel-countries' ),
					],
					'03' => [
						'name' => __( 'Nord', 'voxel-countries' ),
					],
					'04' => [
						'name' => __( 'Ouest', 'voxel-countries' ),
					],
					'05' => [
						'name' => __( 'Sud', 'voxel-countries' ),
					],
					'01' => [
						'name' => __( 'Ville de Kigali', 'voxel-countries' ),
					],
				]
			],
			'SA' => [
				'code3' => 'SAU',
				'name' => __( 'Saudi Arabia', 'voxel-countries' ),
				'continent' => 'Asia',
				'states' => [
					'11' => [
						'name' => __( 'Al Bāḩah', 'voxel-countries' ),
					],
					'12' => [
						'name' => __( 'Al Jawf', 'voxel-countries' ),
					],
					'03' => [
						'name' => __( 'Al Madīnah', 'voxel-countries' ),
					],
					'05' => [
						'name' => __( 'Al Qaşīm', 'voxel-countries' ),
					],
					'08' => [
						'name' => __( 'Al Ḩudūd ash Shamālīyah', 'voxel-countries' ),
					],
					'01' => [
						'name' => __( 'Ar Riyāḑ', 'voxel-countries' ),
					],
					'04' => [
						'name' => __( 'Ash Sharqīyah', 'voxel-countries' ),
					],
					'09' => [
						'name' => __( 'Jīzān', 'voxel-countries' ),
					],
					'02' => [
						'name' => __( 'Makkah', 'voxel-countries' ),
					],
					'10' => [
						'name' => __( 'Najrān', 'voxel-countries' ),
					],
					'07' => [
						'name' => __( 'Tabūk', 'voxel-countries' ),
					],
					'14' => [
						'name' => __( 'ٰĀsīr', 'voxel-countries' ),
					],
					'06' => [
						'name' => __( 'Ḩā\'il', 'voxel-countries' ),
					],
				]
			],
			'SB' => [
				'code3' => 'SLB',
				'name' => __( 'Solomon Islands', 'voxel-countries' ),
				'continent' => 'Oceania',
				'states' => [
					'CT' => [
						'name' => __( 'Capital Territory', 'voxel-countries' ),
					],
					'CE' => [
						'name' => __( 'Central', 'voxel-countries' ),
					],
					'CH' => [
						'name' => __( 'Choiseul', 'voxel-countries' ),
					],
					'GU' => [
						'name' => __( 'Guadalcanal', 'voxel-countries' ),
					],
					'IS' => [
						'name' => __( 'Isabel', 'voxel-countries' ),
					],
					'MK' => [
						'name' => __( 'Makira-Ulawa', 'voxel-countries' ),
					],
					'ML' => [
						'name' => __( 'Malaita', 'voxel-countries' ),
					],
					'RB' => [
						'name' => __( 'Rennell and Bellona', 'voxel-countries' ),
					],
					'TE' => [
						'name' => __( 'Temotu', 'voxel-countries' ),
					],
					'WE' => [
						'name' => __( 'Western', 'voxel-countries' ),
					],
				]
			],
			'SC' => [
				'code3' => 'SYC',
				'name' => __( 'Seychelles', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'02' => [
						'name' => __( 'Anse Boileau', 'voxel-countries' ),
					],
					'03' => [
						'name' => __( 'Anse Etoile', 'voxel-countries' ),
					],
					'05' => [
						'name' => __( 'Anse Royale', 'voxel-countries' ),
					],
					'01' => [
						'name' => __( 'Anse aux Pins', 'voxel-countries' ),
					],
					'04' => [
						'name' => __( 'Au Cap', 'voxel-countries' ),
					],
					'06' => [
						'name' => __( 'Baie Lazare', 'voxel-countries' ),
					],
					'07' => [
						'name' => __( 'Baie Sainte Anne', 'voxel-countries' ),
					],
					'08' => [
						'name' => __( 'Beau Vallon', 'voxel-countries' ),
					],
					'09' => [
						'name' => __( 'Bel Air', 'voxel-countries' ),
					],
					'10' => [
						'name' => __( 'Bel Ombre', 'voxel-countries' ),
					],
					'11' => [
						'name' => __( 'Cascade', 'voxel-countries' ),
					],
					'16' => [
						'name' => __( 'English River', 'voxel-countries' ),
					],
					'12' => [
						'name' => __( 'Glacis', 'voxel-countries' ),
					],
					'13' => [
						'name' => __( 'Grand Anse Mahe', 'voxel-countries' ),
					],
					'14' => [
						'name' => __( 'Grand Anse Praslin', 'voxel-countries' ),
					],
					'15' => [
						'name' => __( 'La Digue', 'voxel-countries' ),
					],
					'24' => [
						'name' => __( 'Les Mamelles', 'voxel-countries' ),
					],
					'17' => [
						'name' => __( 'Mont Buxton', 'voxel-countries' ),
					],
					'18' => [
						'name' => __( 'Mont Fleuri', 'voxel-countries' ),
					],
					'19' => [
						'name' => __( 'Plaisance', 'voxel-countries' ),
					],
					'20' => [
						'name' => __( 'Pointe Larue', 'voxel-countries' ),
					],
					'21' => [
						'name' => __( 'Port Glaud', 'voxel-countries' ),
					],
					'25' => [
						'name' => __( 'Roche Caiman', 'voxel-countries' ),
					],
					'22' => [
						'name' => __( 'Saint Louis', 'voxel-countries' ),
					],
					'23' => [
						'name' => __( 'Takamaka', 'voxel-countries' ),
					],
				]
			],
			'SD' => [
				'code3' => 'SDN',
				'name' => __( 'Sudan', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'RS' => [
						'name' => __( 'Al Baḩr al Aḩmar', 'voxel-countries' ),
					],
					'GZ' => [
						'name' => __( 'Al Jazīrah', 'voxel-countries' ),
					],
					'KH' => [
						'name' => __( 'Al Kharţūm', 'voxel-countries' ),
					],
					'GD' => [
						'name' => __( 'Al Qaḑārif', 'voxel-countries' ),
					],
					'NR' => [
						'name' => __( 'An Nīl', 'voxel-countries' ),
					],
					'NW' => [
						'name' => __( 'An Nīl al Abyaḑ', 'voxel-countries' ),
					],
					'NB' => [
						'name' => __( 'An Nīl al Azraq', 'voxel-countries' ),
					],
					'NO' => [
						'name' => __( 'Ash Shamālīyah', 'voxel-countries' ),
					],
					'DW' => [
						'name' => __( 'Gharb Dārfūr', 'voxel-countries' ),
					],
					'DS' => [
						'name' => __( 'Janūb Dārfūr', 'voxel-countries' ),
					],
					'KS' => [
						'name' => __( 'Janūb Kurdufān', 'voxel-countries' ),
					],
					'KA' => [
						'name' => __( 'Kassalā', 'voxel-countries' ),
					],
					'DN' => [
						'name' => __( 'Shamāl Dārfūr', 'voxel-countries' ),
					],
					'KN' => [
						'name' => __( 'Shamāl Kurdufān', 'voxel-countries' ),
					],
					'DE' => [
						'name' => __( 'Sharq Dārfūr', 'voxel-countries' ),
					],
					'SI' => [
						'name' => __( 'Sinnār', 'voxel-countries' ),
					],
					'DC' => [
						'name' => __( 'Zalingei', 'voxel-countries' ),
					],
				]
			],
			'SE' => [
				'code3' => 'SWE',
				'name' => __( 'Sweden', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [
					'K' => [
						'name' => __( 'Blekinge län', 'voxel-countries' ),
					],
					'W' => [
						'name' => __( 'Dalarnas län', 'voxel-countries' ),
					],
					'I' => [
						'name' => __( 'Gotlands län', 'voxel-countries' ),
					],
					'X' => [
						'name' => __( 'Gävleborgs län', 'voxel-countries' ),
					],
					'N' => [
						'name' => __( 'Hallands län', 'voxel-countries' ),
					],
					'Z' => [
						'name' => __( 'Jämtlands län', 'voxel-countries' ),
					],
					'F' => [
						'name' => __( 'Jönköpings län', 'voxel-countries' ),
					],
					'H' => [
						'name' => __( 'Kalmar län', 'voxel-countries' ),
					],
					'G' => [
						'name' => __( 'Kronobergs län', 'voxel-countries' ),
					],
					'BD' => [
						'name' => __( 'Norrbottens län', 'voxel-countries' ),
					],
					'M' => [
						'name' => __( 'Skåne län', 'voxel-countries' ),
					],
					'AB' => [
						'name' => __( 'Stockholms län', 'voxel-countries' ),
					],
					'D' => [
						'name' => __( 'Södermanlands län', 'voxel-countries' ),
					],
					'C' => [
						'name' => __( 'Uppsala län', 'voxel-countries' ),
					],
					'S' => [
						'name' => __( 'Värmlands län', 'voxel-countries' ),
					],
					'AC' => [
						'name' => __( 'Västerbottens län', 'voxel-countries' ),
					],
					'Y' => [
						'name' => __( 'Västernorrlands län', 'voxel-countries' ),
					],
					'U' => [
						'name' => __( 'Västmanlands län', 'voxel-countries' ),
					],
					'O' => [
						'name' => __( 'Västra Götalands län', 'voxel-countries' ),
					],
					'T' => [
						'name' => __( 'Örebro län', 'voxel-countries' ),
					],
					'E' => [
						'name' => __( 'Östergötlands län', 'voxel-countries' ),
					],
				]
			],
			'SG' => [
				'code3' => 'SGP',
				'name' => __( 'Singapore', 'voxel-countries' ),
				'continent' => 'Asia',
				'states' => [
					'01' => [
						'name' => __( 'Central Singapore', 'voxel-countries' ),
					],
					'02' => [
						'name' => __( 'North East', 'voxel-countries' ),
					],
					'03' => [
						'name' => __( 'North West', 'voxel-countries' ),
					],
					'04' => [
						'name' => __( 'South East', 'voxel-countries' ),
					],
					'05' => [
						'name' => __( 'South West', 'voxel-countries' ),
					],
				]
			],
			'SH' => [
				'code3' => 'SHN',
				'name' => __( 'Saint Helena', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'AC' => [
						'name' => __( 'Ascension', 'voxel-countries' ),
					],
					'HL' => [
						'name' => __( 'Saint Helena', 'voxel-countries' ),
					],
					'TA' => [
						'name' => __( 'Tristan da Cunha', 'voxel-countries' ),
					],
				]
			],
			'SI' => [
				'code3' => 'SVN',
				'name' => __( 'Slovenia', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [
					'001' => [
						'name' => __( 'Ajdovščina', 'voxel-countries' ),
					],
					'195' => [
						'name' => __( 'Apače', 'voxel-countries' ),
					],
					'002' => [
						'name' => __( 'Beltinci', 'voxel-countries' ),
					],
					'148' => [
						'name' => __( 'Benedikt', 'voxel-countries' ),
					],
					'149' => [
						'name' => __( 'Bistrica ob Sotli', 'voxel-countries' ),
					],
					'003' => [
						'name' => __( 'Bled', 'voxel-countries' ),
					],
					'150' => [
						'name' => __( 'Bloke', 'voxel-countries' ),
					],
					'004' => [
						'name' => __( 'Bohinj', 'voxel-countries' ),
					],
					'005' => [
						'name' => __( 'Borovnica', 'voxel-countries' ),
					],
					'006' => [
						'name' => __( 'Bovec', 'voxel-countries' ),
					],
					'151' => [
						'name' => __( 'Braslovče', 'voxel-countries' ),
					],
					'007' => [
						'name' => __( 'Brda', 'voxel-countries' ),
					],
					'008' => [
						'name' => __( 'Brezovica', 'voxel-countries' ),
					],
					'009' => [
						'name' => __( 'Brežice', 'voxel-countries' ),
					],
					'152' => [
						'name' => __( 'Cankova', 'voxel-countries' ),
					],
					'011' => [
						'name' => __( 'Celje', 'voxel-countries' ),
					],
					'012' => [
						'name' => __( 'Cerklje na Gorenjskem', 'voxel-countries' ),
					],
					'013' => [
						'name' => __( 'Cerknica', 'voxel-countries' ),
					],
					'014' => [
						'name' => __( 'Cerkno', 'voxel-countries' ),
					],
					'153' => [
						'name' => __( 'Cerkvenjak', 'voxel-countries' ),
					],
					'196' => [
						'name' => __( 'Cirkulane', 'voxel-countries' ),
					],
					'018' => [
						'name' => __( 'Destrnik', 'voxel-countries' ),
					],
					'019' => [
						'name' => __( 'Divača', 'voxel-countries' ),
					],
					'154' => [
						'name' => __( 'Dobje', 'voxel-countries' ),
					],
					'020' => [
						'name' => __( 'Dobrepolje', 'voxel-countries' ),
					],
					'155' => [
						'name' => __( 'Dobrna', 'voxel-countries' ),
					],
					'021' => [
						'name' => __( 'Dobrova–Polhov Gradec', 'voxel-countries' ),
					],
					'156' => [
						'name' => __( 'Dobrovnik', 'voxel-countries' ),
					],
					'022' => [
						'name' => __( 'Dol pri Ljubljani', 'voxel-countries' ),
					],
					'157' => [
						'name' => __( 'Dolenjske Toplice', 'voxel-countries' ),
					],
					'023' => [
						'name' => __( 'Domžale', 'voxel-countries' ),
					],
					'024' => [
						'name' => __( 'Dornava', 'voxel-countries' ),
					],
					'025' => [
						'name' => __( 'Dravograd', 'voxel-countries' ),
					],
					'026' => [
						'name' => __( 'Duplek', 'voxel-countries' ),
					],
					'027' => [
						'name' => __( 'Gorenja vas–Poljane', 'voxel-countries' ),
					],
					'028' => [
						'name' => __( 'Gorišnica', 'voxel-countries' ),
					],
					'207' => [
						'name' => __( 'Gorje', 'voxel-countries' ),
					],
					'029' => [
						'name' => __( 'Gornja Radgona', 'voxel-countries' ),
					],
					'030' => [
						'name' => __( 'Gornji Grad', 'voxel-countries' ),
					],
					'031' => [
						'name' => __( 'Gornji Petrovci', 'voxel-countries' ),
					],
					'158' => [
						'name' => __( 'Grad', 'voxel-countries' ),
					],
					'032' => [
						'name' => __( 'Grosuplje', 'voxel-countries' ),
					],
					'159' => [
						'name' => __( 'Hajdina', 'voxel-countries' ),
					],
					'161' => [
						'name' => __( 'Hodoš', 'voxel-countries' ),
					],
					'162' => [
						'name' => __( 'Horjul', 'voxel-countries' ),
					],
					'160' => [
						'name' => __( 'Hoče–Slivnica', 'voxel-countries' ),
					],
					'034' => [
						'name' => __( 'Hrastnik', 'voxel-countries' ),
					],
					'035' => [
						'name' => __( 'Hrpelje-Kozina', 'voxel-countries' ),
					],
					'036' => [
						'name' => __( 'Idrija', 'voxel-countries' ),
					],
					'037' => [
						'name' => __( 'Ig', 'voxel-countries' ),
					],
					'038' => [
						'name' => __( 'Ilirska Bistrica', 'voxel-countries' ),
					],
					'039' => [
						'name' => __( 'Ivančna Gorica', 'voxel-countries' ),
					],
					'040' => [
						'name' => __( 'Izola', 'voxel-countries' ),
					],
					'041' => [
						'name' => __( 'Jesenice', 'voxel-countries' ),
					],
					'163' => [
						'name' => __( 'Jezersko', 'voxel-countries' ),
					],
					'042' => [
						'name' => __( 'Juršinci', 'voxel-countries' ),
					],
					'043' => [
						'name' => __( 'Kamnik', 'voxel-countries' ),
					],
					'044' => [
						'name' => __( 'Kanal', 'voxel-countries' ),
					],
					'045' => [
						'name' => __( 'Kidričevo', 'voxel-countries' ),
					],
					'046' => [
						'name' => __( 'Kobarid', 'voxel-countries' ),
					],
					'047' => [
						'name' => __( 'Kobilje', 'voxel-countries' ),
					],
					'049' => [
						'name' => __( 'Komen', 'voxel-countries' ),
					],
					'164' => [
						'name' => __( 'Komenda', 'voxel-countries' ),
					],
					'050' => [
						'name' => __( 'Koper', 'voxel-countries' ),
					],
					'197' => [
						'name' => __( 'Kosanjevica na Krki', 'voxel-countries' ),
					],
					'165' => [
						'name' => __( 'Kostel', 'voxel-countries' ),
					],
					'051' => [
						'name' => __( 'Kozje', 'voxel-countries' ),
					],
					'048' => [
						'name' => __( 'Kočevje', 'voxel-countries' ),
					],
					'052' => [
						'name' => __( 'Kranj', 'voxel-countries' ),
					],
					'053' => [
						'name' => __( 'Kranjska Gora', 'voxel-countries' ),
					],
					'166' => [
						'name' => __( 'Križevci', 'voxel-countries' ),
					],
					'054' => [
						'name' => __( 'Krško', 'voxel-countries' ),
					],
					'055' => [
						'name' => __( 'Kungota', 'voxel-countries' ),
					],
					'056' => [
						'name' => __( 'Kuzma', 'voxel-countries' ),
					],
					'057' => [
						'name' => __( 'Laško', 'voxel-countries' ),
					],
					'058' => [
						'name' => __( 'Lenart', 'voxel-countries' ),
					],
					'059' => [
						'name' => __( 'Lendava', 'voxel-countries' ),
					],
					'060' => [
						'name' => __( 'Litija', 'voxel-countries' ),
					],
					'061' => [
						'name' => __( 'Ljubljana', 'voxel-countries' ),
					],
					'062' => [
						'name' => __( 'Ljubno', 'voxel-countries' ),
					],
					'063' => [
						'name' => __( 'Ljutomer', 'voxel-countries' ),
					],
					'208' => [
						'name' => __( 'Log-Dragomer', 'voxel-countries' ),
					],
					'064' => [
						'name' => __( 'Logatec', 'voxel-countries' ),
					],
					'167' => [
						'name' => __( 'Lovrenc na Pohorju', 'voxel-countries' ),
					],
					'065' => [
						'name' => __( 'Loška Dolina', 'voxel-countries' ),
					],
					'066' => [
						'name' => __( 'Loški Potok', 'voxel-countries' ),
					],
					'068' => [
						'name' => __( 'Lukovica', 'voxel-countries' ),
					],
					'067' => [
						'name' => __( 'Luče', 'voxel-countries' ),
					],
					'069' => [
						'name' => __( 'Majšperk', 'voxel-countries' ),
					],
					'198' => [
						'name' => __( 'Makole', 'voxel-countries' ),
					],
					'070' => [
						'name' => __( 'Maribor', 'voxel-countries' ),
					],
					'168' => [
						'name' => __( 'Markovci', 'voxel-countries' ),
					],
					'071' => [
						'name' => __( 'Medvode', 'voxel-countries' ),
					],
					'072' => [
						'name' => __( 'Mengeš', 'voxel-countries' ),
					],
					'073' => [
						'name' => __( 'Metlika', 'voxel-countries' ),
					],
					'074' => [
						'name' => __( 'Mežica', 'voxel-countries' ),
					],
					'169' => [
						'name' => __( 'Miklavž na Dravskem Polju', 'voxel-countries' ),
					],
					'075' => [
						'name' => __( 'Miren–Kostanjevica', 'voxel-countries' ),
					],
					'170' => [
						'name' => __( 'Mirna Peč', 'voxel-countries' ),
					],
					'076' => [
						'name' => __( 'Mislinja', 'voxel-countries' ),
					],
					'199' => [
						'name' => __( 'Mokronog–Trebelno', 'voxel-countries' ),
					],
					'078' => [
						'name' => __( 'Moravske Toplice', 'voxel-countries' ),
					],
					'077' => [
						'name' => __( 'Moravče', 'voxel-countries' ),
					],
					'079' => [
						'name' => __( 'Mozirje', 'voxel-countries' ),
					],
					'080' => [
						'name' => __( 'Murska Sobota', 'voxel-countries' ),
					],
					'081' => [
						'name' => __( 'Muta', 'voxel-countries' ),
					],
					'082' => [
						'name' => __( 'Naklo', 'voxel-countries' ),
					],
					'083' => [
						'name' => __( 'Nazarje', 'voxel-countries' ),
					],
					'084' => [
						'name' => __( 'Nova Gorica', 'voxel-countries' ),
					],
					'085' => [
						'name' => __( 'Novo Mesto', 'voxel-countries' ),
					],
					'086' => [
						'name' => __( 'Odranci', 'voxel-countries' ),
					],
					'171' => [
						'name' => __( 'Oplotnica', 'voxel-countries' ),
					],
					'087' => [
						'name' => __( 'Ormož', 'voxel-countries' ),
					],
					'088' => [
						'name' => __( 'Osilnica', 'voxel-countries' ),
					],
					'089' => [
						'name' => __( 'Pesnica', 'voxel-countries' ),
					],
					'090' => [
						'name' => __( 'Piran', 'voxel-countries' ),
					],
					'091' => [
						'name' => __( 'Pivka', 'voxel-countries' ),
					],
					'172' => [
						'name' => __( 'Podlehnik', 'voxel-countries' ),
					],
					'093' => [
						'name' => __( 'Podvelka', 'voxel-countries' ),
					],
					'092' => [
						'name' => __( 'Podčetrtek', 'voxel-countries' ),
					],
					'200' => [
						'name' => __( 'Poljčane', 'voxel-countries' ),
					],
					'173' => [
						'name' => __( 'Polzela', 'voxel-countries' ),
					],
					'094' => [
						'name' => __( 'Postojna', 'voxel-countries' ),
					],
					'174' => [
						'name' => __( 'Prebold', 'voxel-countries' ),
					],
					'095' => [
						'name' => __( 'Preddvor', 'voxel-countries' ),
					],
					'175' => [
						'name' => __( 'Prevalje', 'voxel-countries' ),
					],
					'096' => [
						'name' => __( 'Ptuj', 'voxel-countries' ),
					],
					'097' => [
						'name' => __( 'Puconci', 'voxel-countries' ),
					],
					'100' => [
						'name' => __( 'Radenci', 'voxel-countries' ),
					],
					'099' => [
						'name' => __( 'Radeče', 'voxel-countries' ),
					],
					'101' => [
						'name' => __( 'Radlje ob Dravi', 'voxel-countries' ),
					],
					'102' => [
						'name' => __( 'Radovljica', 'voxel-countries' ),
					],
					'103' => [
						'name' => __( 'Ravne na Koroškem', 'voxel-countries' ),
					],
					'176' => [
						'name' => __( 'Razkrižje', 'voxel-countries' ),
					],
					'098' => [
						'name' => __( 'Rače–Fram', 'voxel-countries' ),
					],
					'201' => [
						'name' => __( 'Renče-Vogrsko', 'voxel-countries' ),
					],
					'209' => [
						'name' => __( 'Rečica ob Savinji', 'voxel-countries' ),
					],
					'104' => [
						'name' => __( 'Ribnica', 'voxel-countries' ),
					],
					'177' => [
						'name' => __( 'Ribnica na Pohorju', 'voxel-countries' ),
					],
					'107' => [
						'name' => __( 'Rogatec', 'voxel-countries' ),
					],
					'106' => [
						'name' => __( 'Rogaška Slatina', 'voxel-countries' ),
					],
					'105' => [
						'name' => __( 'Rogašovci', 'voxel-countries' ),
					],
					'108' => [
						'name' => __( 'Ruše', 'voxel-countries' ),
					],
					'178' => [
						'name' => __( 'Selnica ob Dravi', 'voxel-countries' ),
					],
					'109' => [
						'name' => __( 'Semič', 'voxel-countries' ),
					],
					'110' => [
						'name' => __( 'Sevnica', 'voxel-countries' ),
					],
					'111' => [
						'name' => __( 'Sežana', 'voxel-countries' ),
					],
					'112' => [
						'name' => __( 'Slovenj Gradec', 'voxel-countries' ),
					],
					'113' => [
						'name' => __( 'Slovenska Bistrica', 'voxel-countries' ),
					],
					'114' => [
						'name' => __( 'Slovenske Konjice', 'voxel-countries' ),
					],
					'179' => [
						'name' => __( 'Sodražica', 'voxel-countries' ),
					],
					'180' => [
						'name' => __( 'Solčava', 'voxel-countries' ),
					],
					'202' => [
						'name' => __( 'Središče ob Dravi', 'voxel-countries' ),
					],
					'115' => [
						'name' => __( 'Starše', 'voxel-countries' ),
					],
					'203' => [
						'name' => __( 'Straža', 'voxel-countries' ),
					],
					'181' => [
						'name' => __( 'Sveta Ana', 'voxel-countries' ),
					],
					'204' => [
						'name' => __( 'Sveta Trojica v Slovenskih Goricah', 'voxel-countries' ),
					],
					'182' => [
						'name' => __( 'Sveti Andraž v Slovenskih Goricah', 'voxel-countries' ),
					],
					'116' => [
						'name' => __( 'Sveti Jurij', 'voxel-countries' ),
					],
					'210' => [
						'name' => __( 'Sveti Jurij v Slovenskih Goricah', 'voxel-countries' ),
					],
					'205' => [
						'name' => __( 'Sveti Tomaž', 'voxel-countries' ),
					],
					'184' => [
						'name' => __( 'Tabor', 'voxel-countries' ),
					],
					'010' => [
						'name' => __( 'Tišina', 'voxel-countries' ),
					],
					'128' => [
						'name' => __( 'Tolmin', 'voxel-countries' ),
					],
					'129' => [
						'name' => __( 'Trbovlje', 'voxel-countries' ),
					],
					'130' => [
						'name' => __( 'Trebnje', 'voxel-countries' ),
					],
					'185' => [
						'name' => __( 'Trnovska Vas', 'voxel-countries' ),
					],
					'186' => [
						'name' => __( 'Trzin', 'voxel-countries' ),
					],
					'131' => [
						'name' => __( 'Tržič', 'voxel-countries' ),
					],
					'132' => [
						'name' => __( 'Turnišče', 'voxel-countries' ),
					],
					'133' => [
						'name' => __( 'Velenje', 'voxel-countries' ),
					],
					'187' => [
						'name' => __( 'Velika Polana', 'voxel-countries' ),
					],
					'134' => [
						'name' => __( 'Velike Lašče', 'voxel-countries' ),
					],
					'188' => [
						'name' => __( 'Veržej', 'voxel-countries' ),
					],
					'135' => [
						'name' => __( 'Videm', 'voxel-countries' ),
					],
					'136' => [
						'name' => __( 'Vipava', 'voxel-countries' ),
					],
					'137' => [
						'name' => __( 'Vitanje', 'voxel-countries' ),
					],
					'138' => [
						'name' => __( 'Vodice', 'voxel-countries' ),
					],
					'139' => [
						'name' => __( 'Vojnik', 'voxel-countries' ),
					],
					'189' => [
						'name' => __( 'Vransko', 'voxel-countries' ),
					],
					'140' => [
						'name' => __( 'Vrhnika', 'voxel-countries' ),
					],
					'141' => [
						'name' => __( 'Vuzenica', 'voxel-countries' ),
					],
					'142' => [
						'name' => __( 'Zagorje ob Savi', 'voxel-countries' ),
					],
					'143' => [
						'name' => __( 'Zavrč', 'voxel-countries' ),
					],
					'144' => [
						'name' => __( 'Zreče', 'voxel-countries' ),
					],
					'015' => [
						'name' => __( 'Črenšovci', 'voxel-countries' ),
					],
					'016' => [
						'name' => __( 'Črna na Koroškem', 'voxel-countries' ),
					],
					'017' => [
						'name' => __( 'Črnomelj', 'voxel-countries' ),
					],
					'033' => [
						'name' => __( 'Šalovci', 'voxel-countries' ),
					],
					'183' => [
						'name' => __( 'Šempeter–Vrtojba', 'voxel-countries' ),
					],
					'118' => [
						'name' => __( 'Šentilj', 'voxel-countries' ),
					],
					'119' => [
						'name' => __( 'Šentjernej', 'voxel-countries' ),
					],
					'120' => [
						'name' => __( 'Šentjur', 'voxel-countries' ),
					],
					'211' => [
						'name' => __( 'Šentrupert', 'voxel-countries' ),
					],
					'117' => [
						'name' => __( 'Šenčur', 'voxel-countries' ),
					],
					'121' => [
						'name' => __( 'Škocjan', 'voxel-countries' ),
					],
					'122' => [
						'name' => __( 'Škofja Loka', 'voxel-countries' ),
					],
					'123' => [
						'name' => __( 'Škofljica', 'voxel-countries' ),
					],
					'124' => [
						'name' => __( 'Šmarje pri Jelšah', 'voxel-countries' ),
					],
					'206' => [
						'name' => __( 'Šmarješke Toplice', 'voxel-countries' ),
					],
					'125' => [
						'name' => __( 'Šmartno ob Paki', 'voxel-countries' ),
					],
					'194' => [
						'name' => __( 'Šmartno pri Litiji', 'voxel-countries' ),
					],
					'126' => [
						'name' => __( 'Šoštanj', 'voxel-countries' ),
					],
					'127' => [
						'name' => __( 'Štore', 'voxel-countries' ),
					],
					'190' => [
						'name' => __( 'Žalec', 'voxel-countries' ),
					],
					'146' => [
						'name' => __( 'Železniki', 'voxel-countries' ),
					],
					'191' => [
						'name' => __( 'Žetale', 'voxel-countries' ),
					],
					'147' => [
						'name' => __( 'Žiri', 'voxel-countries' ),
					],
					'192' => [
						'name' => __( 'Žirovnica', 'voxel-countries' ),
					],
					'193' => [
						'name' => __( 'Žužemberk', 'voxel-countries' ),
					],
				]
			],
			'SJ' => [
				'code3' => 'SJM',
				'name' => __( 'Svalbard and Jan Mayen', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [],
			],
			'SK' => [
				'code3' => 'SVK',
				'name' => __( 'Slovakia', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [
					'BC' => [
						'name' => __( 'Banskobystrický kraj', 'voxel-countries' ),
					],
					'BL' => [
						'name' => __( 'Bratislavský kraj', 'voxel-countries' ),
					],
					'KI' => [
						'name' => __( 'Košický kraj', 'voxel-countries' ),
					],
					'NI' => [
						'name' => __( 'Nitriansky kraj', 'voxel-countries' ),
					],
					'PV' => [
						'name' => __( 'Prešovský kraj', 'voxel-countries' ),
					],
					'TC' => [
						'name' => __( 'Trenčiansky kraj', 'voxel-countries' ),
					],
					'TA' => [
						'name' => __( 'Trnavský kraj', 'voxel-countries' ),
					],
					'ZI' => [
						'name' => __( 'Žilinský kraj', 'voxel-countries' ),
					],
				]
			],
			'SL' => [
				'code3' => 'SLE',
				'name' => __( 'Sierra Leone', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'E' => [
						'name' => __( 'Eastern', 'voxel-countries' ),
					],
					'N' => [
						'name' => __( 'Northern', 'voxel-countries' ),
					],
					'S' => [
						'name' => __( 'Southern', 'voxel-countries' ),
					],
					'W' => [
						'name' => __( 'Western Area', 'voxel-countries' ),
					],
				]
			],
			'SM' => [
				'code3' => 'SMR',
				'name' => __( 'San Marino', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [
					'01' => [
						'name' => __( 'Acquaviva', 'voxel-countries' ),
					],
					'06' => [
						'name' => __( 'Borgo Maggiore', 'voxel-countries' ),
					],
					'02' => [
						'name' => __( 'Chiesanuova', 'voxel-countries' ),
					],
					'03' => [
						'name' => __( 'Domagnano', 'voxel-countries' ),
					],
					'04' => [
						'name' => __( 'Faetano', 'voxel-countries' ),
					],
					'05' => [
						'name' => __( 'Fiorentino', 'voxel-countries' ),
					],
					'08' => [
						'name' => __( 'Montegiardino', 'voxel-countries' ),
					],
					'07' => [
						'name' => __( 'San Marino', 'voxel-countries' ),
					],
					'09' => [
						'name' => __( 'Serravalle', 'voxel-countries' ),
					],
				]
			],
			'SN' => [
				'code3' => 'SEN',
				'name' => __( 'Senegal', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'DK' => [
						'name' => __( 'Dakar', 'voxel-countries' ),
					],
					'DB' => [
						'name' => __( 'Diourbel', 'voxel-countries' ),
					],
					'FK' => [
						'name' => __( 'Fatick', 'voxel-countries' ),
					],
					'KA' => [
						'name' => __( 'Kaffrine', 'voxel-countries' ),
					],
					'KL' => [
						'name' => __( 'Kaolack', 'voxel-countries' ),
					],
					'KD' => [
						'name' => __( 'Kolda', 'voxel-countries' ),
					],
					'KE' => [
						'name' => __( 'Kédougou', 'voxel-countries' ),
					],
					'LG' => [
						'name' => __( 'Louga', 'voxel-countries' ),
					],
					'MT' => [
						'name' => __( 'Matam', 'voxel-countries' ),
					],
					'SL' => [
						'name' => __( 'Saint-Louis', 'voxel-countries' ),
					],
					'SE' => [
						'name' => __( 'Sédhiou', 'voxel-countries' ),
					],
					'TC' => [
						'name' => __( 'Tambacounda', 'voxel-countries' ),
					],
					'TH' => [
						'name' => __( 'Thiès', 'voxel-countries' ),
					],
					'ZG' => [
						'name' => __( 'Ziguinchor', 'voxel-countries' ),
					],
				]
			],
			'SO' => [
				'code3' => 'SOM',
				'name' => __( 'Somalia', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'AW' => [
						'name' => __( 'Awdal', 'voxel-countries' ),
					],
					'BK' => [
						'name' => __( 'Bakool', 'voxel-countries' ),
					],
					'BN' => [
						'name' => __( 'Banaadir', 'voxel-countries' ),
					],
					'BR' => [
						'name' => __( 'Bari', 'voxel-countries' ),
					],
					'BY' => [
						'name' => __( 'Bay', 'voxel-countries' ),
					],
					'GA' => [
						'name' => __( 'Galguduud', 'voxel-countries' ),
					],
					'GE' => [
						'name' => __( 'Gedo', 'voxel-countries' ),
					],
					'HI' => [
						'name' => __( 'Hiiraan', 'voxel-countries' ),
					],
					'JD' => [
						'name' => __( 'Jubbada Dhexe', 'voxel-countries' ),
					],
					'JH' => [
						'name' => __( 'Jubbada Hoose', 'voxel-countries' ),
					],
					'MU' => [
						'name' => __( 'Mudug', 'voxel-countries' ),
					],
					'NU' => [
						'name' => __( 'Nugaal', 'voxel-countries' ),
					],
					'SA' => [
						'name' => __( 'Sanaag', 'voxel-countries' ),
					],
					'SD' => [
						'name' => __( 'Shabeellaha Dhexe', 'voxel-countries' ),
					],
					'SH' => [
						'name' => __( 'Shabeellaha Hoose', 'voxel-countries' ),
					],
					'SO' => [
						'name' => __( 'Sool', 'voxel-countries' ),
					],
					'TO' => [
						'name' => __( 'Togdheer', 'voxel-countries' ),
					],
					'WO' => [
						'name' => __( 'Woqooyi Galbeed', 'voxel-countries' ),
					],
				]
			],
			'SR' => [
				'code3' => 'SUR',
				'name' => __( 'Suriname', 'voxel-countries' ),
				'continent' => 'South America',
				'states' => [
					'BR' => [
						'name' => __( 'Brokopondo', 'voxel-countries' ),
					],
					'CM' => [
						'name' => __( 'Commewijne', 'voxel-countries' ),
					],
					'CR' => [
						'name' => __( 'Coronie', 'voxel-countries' ),
					],
					'MA' => [
						'name' => __( 'Marowijne', 'voxel-countries' ),
					],
					'NI' => [
						'name' => __( 'Nickerie', 'voxel-countries' ),
					],
					'PR' => [
						'name' => __( 'Para', 'voxel-countries' ),
					],
					'PM' => [
						'name' => __( 'Paramaribo', 'voxel-countries' ),
					],
					'SA' => [
						'name' => __( 'Saramacca', 'voxel-countries' ),
					],
					'SI' => [
						'name' => __( 'Sipaliwini', 'voxel-countries' ),
					],
					'WA' => [
						'name' => __( 'Wanica', 'voxel-countries' ),
					],
				]
			],
			'SS' => [
				'code3' => 'SSD',
				'name' => __( 'South Sudan', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'EC' => [
						'name' => __( 'Central Equatoria', 'voxel-countries' ),
					],
					'EE' => [
						'name' => __( 'Eastern Equatoria', 'voxel-countries' ),
					],
					'JG' => [
						'name' => __( 'Jonglei', 'voxel-countries' ),
					],
					'LK' => [
						'name' => __( 'Lakes', 'voxel-countries' ),
					],
					'BN' => [
						'name' => __( 'Northern Bahr el Ghazal', 'voxel-countries' ),
					],
					'UY' => [
						'name' => __( 'Unity', 'voxel-countries' ),
					],
					'NU' => [
						'name' => __( 'Upper Nile', 'voxel-countries' ),
					],
					'WR' => [
						'name' => __( 'Warrap', 'voxel-countries' ),
					],
					'BW' => [
						'name' => __( 'Western Bahr el Ghazal', 'voxel-countries' ),
					],
					'EW' => [
						'name' => __( 'Western Equatoria', 'voxel-countries' ),
					],
				]
			],
			'ST' => [
				'code3' => 'STP',
				'name' => __( 'São Tomé and Príncipe', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'P' => [
						'name' => __( 'Príncipe', 'voxel-countries' ),
					],
					'S' => [
						'name' => __( 'São Tomé', 'voxel-countries' ),
					],
				]
			],
			'SV' => [
				'code3' => 'SLV',
				'name' => __( 'El Salvador', 'voxel-countries' ),
				'continent' => 'North America',
				'states' => [
					'AH' => [
						'name' => __( 'Ahuachapán', 'voxel-countries' ),
					],
					'CA' => [
						'name' => __( 'Cabañas', 'voxel-countries' ),
					],
					'CH' => [
						'name' => __( 'Chalatenango', 'voxel-countries' ),
					],
					'CU' => [
						'name' => __( 'Cuscatlán', 'voxel-countries' ),
					],
					'LI' => [
						'name' => __( 'La Libertad', 'voxel-countries' ),
					],
					'PA' => [
						'name' => __( 'La Paz', 'voxel-countries' ),
					],
					'UN' => [
						'name' => __( 'La Unión', 'voxel-countries' ),
					],
					'MO' => [
						'name' => __( 'Morazán', 'voxel-countries' ),
					],
					'SM' => [
						'name' => __( 'San Miguel', 'voxel-countries' ),
					],
					'SS' => [
						'name' => __( 'San Salvador', 'voxel-countries' ),
					],
					'SV' => [
						'name' => __( 'San Vicente', 'voxel-countries' ),
					],
					'SA' => [
						'name' => __( 'Santa Ana', 'voxel-countries' ),
					],
					'SO' => [
						'name' => __( 'Sonsonate', 'voxel-countries' ),
					],
					'US' => [
						'name' => __( 'Usulután', 'voxel-countries' ),
					],
				]
			],
			'SX' => [
				'code3' => 'SXM',
				'name' => __( 'Sint Maarten', 'voxel-countries' ),
				'continent' => 'North America',
				'states' => [],
			],
			'SY' => [
				'code3' => 'SYR',
				'name' => __( 'Syria', 'voxel-countries' ),
				'continent' => 'Asia',
				'states' => [
					'LA' => [
						'name' => __( 'Al Lādhiqīyah', 'voxel-countries' ),
					],
					'QU' => [
						'name' => __( 'Al Qunayţirah', 'voxel-countries' ),
					],
					'HA' => [
						'name' => __( 'Al Ḩasakah', 'voxel-countries' ),
					],
					'RA' => [
						'name' => __( 'Ar Raqqah', 'voxel-countries' ),
					],
					'SU' => [
						'name' => __( 'As Suwaydā\'', 'voxel-countries' ),
					],
					'DR' => [
						'name' => __( 'Darٰā', 'voxel-countries' ),
					],
					'DY' => [
						'name' => __( 'Dayr az Zawr', 'voxel-countries' ),
					],
					'DI' => [
						'name' => __( 'Dimashq', 'voxel-countries' ),
					],
					'ID' => [
						'name' => __( 'Idlib', 'voxel-countries' ),
					],
					'RD' => [
						'name' => __( 'Rīf Dimashq', 'voxel-countries' ),
					],
					'TA' => [
						'name' => __( 'Ţarţūs', 'voxel-countries' ),
					],
					'HL' => [
						'name' => __( 'Ḩalab', 'voxel-countries' ),
					],
					'HM' => [
						'name' => __( 'Ḩamāh', 'voxel-countries' ),
					],
					'HI' => [
						'name' => __( 'Ḩimş', 'voxel-countries' ),
					],
				]
			],
			'SZ' => [
				'code3' => 'SWZ',
				'name' => __( 'Swaziland', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'HH' => [
						'name' => __( 'Hhohho', 'voxel-countries' ),
					],
					'LU' => [
						'name' => __( 'Lubombo', 'voxel-countries' ),
					],
					'MA' => [
						'name' => __( 'Manzini', 'voxel-countries' ),
					],
					'SH' => [
						'name' => __( 'Shiselweni', 'voxel-countries' ),
					],
				]
			],
			'TC' => [
				'code3' => 'TCA',
				'name' => __( 'Turks and Caicos Islands', 'voxel-countries' ),
				'continent' => 'North America',
				'states' => [],
			],
			'TD' => [
				'code3' => 'TCD',
				'name' => __( 'Chad', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'BA' => [
						'name' => __( 'Al Baṭḩah', 'voxel-countries' ),
					],
					'LC' => [
						'name' => __( 'Al Buḩayrah', 'voxel-countries' ),
					],
					'BG' => [
						'name' => __( 'Baḩr al Ghazāl', 'voxel-countries' ),
					],
					'BO' => [
						'name' => __( 'Būrkū', 'voxel-countries' ),
					],
					'EN' => [
						'name' => __( 'Innīdī', 'voxel-countries' ),
					],
					'KA' => [
						'name' => __( 'Kānim', 'voxel-countries' ),
					],
					'LO' => [
						'name' => __( 'Lūqūn al Gharbī', 'voxel-countries' ),
					],
					'LR' => [
						'name' => __( 'Lūqūn ash Sharqī', 'voxel-countries' ),
					],
					'ND' => [
						'name' => __( 'Madīnat Injamīnā', 'voxel-countries' ),
					],
					'MA' => [
						'name' => __( 'Māndūl', 'voxel-countries' ),
					],
					'MO' => [
						'name' => __( 'Māyū Kībbī al Gharbī', 'voxel-countries' ),
					],
					'ME' => [
						'name' => __( 'Māyū Kībbī ash Sharqī', 'voxel-countries' ),
					],
					'GR' => [
						'name' => __( 'Qīrā', 'voxel-countries' ),
					],
					'SA' => [
						'name' => __( 'Salāmāt', 'voxel-countries' ),
					],
					'CB' => [
						'name' => __( 'Shārī Bāqirmī', 'voxel-countries' ),
					],
					'MC' => [
						'name' => __( 'Shārī al Awsaṭ', 'voxel-countries' ),
					],
					'SI' => [
						'name' => __( 'Sīlā', 'voxel-countries' ),
					],
					'TI' => [
						'name' => __( 'Tibastī', 'voxel-countries' ),
					],
					'TA' => [
						'name' => __( 'Tānjilī', 'voxel-countries' ),
					],
					'OD' => [
						'name' => __( 'Waddāy', 'voxel-countries' ),
					],
					'WF' => [
						'name' => __( 'Wādī Fīrā', 'voxel-countries' ),
					],
					'HL' => [
						'name' => __( 'Ḥajjar Lamīs', 'voxel-countries' ),
					],
				]
			],
			'TF' => [
				'code3' => 'ATF',
				'name' => __( 'French Southern and Antarctic Lands', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [],
			],
			'TG' => [
				'code3' => 'TGO',
				'name' => __( 'Togo', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'C' => [
						'name' => __( 'Centre', 'voxel-countries' ),
					],
					'K' => [
						'name' => __( 'Kara', 'voxel-countries' ),
					],
					'M' => [
						'name' => __( 'Maritime', 'voxel-countries' ),
					],
					'P' => [
						'name' => __( 'Plateaux', 'voxel-countries' ),
					],
					'S' => [
						'name' => __( 'Savannes', 'voxel-countries' ),
					],
				]
			],
			'TH' => [
				'code3' => 'THA',
				'name' => __( 'Thailand', 'voxel-countries' ),
				'continent' => 'Asia',
				'states' => [
					'37' => [
						'name' => __( 'Amnat Charoen', 'voxel-countries' ),
					],
					'15' => [
						'name' => __( 'Ang Thong', 'voxel-countries' ),
					],
					'38' => [
						'name' => __( 'Bueng Kan', 'voxel-countries' ),
					],
					'31' => [
						'name' => __( 'Buri Ram', 'voxel-countries' ),
					],
					'24' => [
						'name' => __( 'Chachoengsao', 'voxel-countries' ),
					],
					'18' => [
						'name' => __( 'Chai Nat', 'voxel-countries' ),
					],
					'36' => [
						'name' => __( 'Chaiyaphum', 'voxel-countries' ),
					],
					'22' => [
						'name' => __( 'Chanthaburi', 'voxel-countries' ),
					],
					'50' => [
						'name' => __( 'Chiang Mai', 'voxel-countries' ),
					],
					'57' => [
						'name' => __( 'Chiang Rai', 'voxel-countries' ),
					],
					'20' => [
						'name' => __( 'Chon Buri', 'voxel-countries' ),
					],
					'86' => [
						'name' => __( 'Chumphon', 'voxel-countries' ),
					],
					'46' => [
						'name' => __( 'Kalasin', 'voxel-countries' ),
					],
					'62' => [
						'name' => __( 'Kamphaeng Phet', 'voxel-countries' ),
					],
					'71' => [
						'name' => __( 'Kanchanaburi', 'voxel-countries' ),
					],
					'40' => [
						'name' => __( 'Khon Kaen', 'voxel-countries' ),
					],
					'81' => [
						'name' => __( 'Krabi', 'voxel-countries' ),
					],
					'10' => [
						'name' => __( 'Krung Thep Maha Nakhon', 'voxel-countries' ),
					],
					'52' => [
						'name' => __( 'Lampang', 'voxel-countries' ),
					],
					'51' => [
						'name' => __( 'Lamphun', 'voxel-countries' ),
					],
					'42' => [
						'name' => __( 'Loei', 'voxel-countries' ),
					],
					'16' => [
						'name' => __( 'Lop Buri', 'voxel-countries' ),
					],
					'58' => [
						'name' => __( 'Mae Hong Son', 'voxel-countries' ),
					],
					'44' => [
						'name' => __( 'Maha Sarakham', 'voxel-countries' ),
					],
					'49' => [
						'name' => __( 'Mukdahan', 'voxel-countries' ),
					],
					'26' => [
						'name' => __( 'Nakhon Nayok', 'voxel-countries' ),
					],
					'73' => [
						'name' => __( 'Nakhon Pathom', 'voxel-countries' ),
					],
					'48' => [
						'name' => __( 'Nakhon Phanom', 'voxel-countries' ),
					],
					'30' => [
						'name' => __( 'Nakhon Ratchasima', 'voxel-countries' ),
					],
					'60' => [
						'name' => __( 'Nakhon Sawan', 'voxel-countries' ),
					],
					'80' => [
						'name' => __( 'Nakhon Si Thammarat', 'voxel-countries' ),
					],
					'55' => [
						'name' => __( 'Nan', 'voxel-countries' ),
					],
					'96' => [
						'name' => __( 'Narathiwat', 'voxel-countries' ),
					],
					'39' => [
						'name' => __( 'Nong Bua Lam Phu', 'voxel-countries' ),
					],
					'43' => [
						'name' => __( 'Nong Khai', 'voxel-countries' ),
					],
					'12' => [
						'name' => __( 'Nonthaburi', 'voxel-countries' ),
					],
					'13' => [
						'name' => __( 'Pathum Thani', 'voxel-countries' ),
					],
					'94' => [
						'name' => __( 'Pattani', 'voxel-countries' ),
					],
					'82' => [
						'name' => __( 'Phangnga', 'voxel-countries' ),
					],
					'93' => [
						'name' => __( 'Phatthalung', 'voxel-countries' ),
					],
					'S' => [
						'name' => __( 'Phatthaya', 'voxel-countries' ),
					],
					'56' => [
						'name' => __( 'Phayao', 'voxel-countries' ),
					],
					'67' => [
						'name' => __( 'Phetchabun', 'voxel-countries' ),
					],
					'76' => [
						'name' => __( 'Phetchaburi', 'voxel-countries' ),
					],
					'66' => [
						'name' => __( 'Phichit', 'voxel-countries' ),
					],
					'65' => [
						'name' => __( 'Phitsanulok', 'voxel-countries' ),
					],
					'14' => [
						'name' => __( 'Phra Nakhon Si Ayutthaya', 'voxel-countries' ),
					],
					'54' => [
						'name' => __( 'Phrae', 'voxel-countries' ),
					],
					'83' => [
						'name' => __( 'Phuket', 'voxel-countries' ),
					],
					'25' => [
						'name' => __( 'Prachin Buri', 'voxel-countries' ),
					],
					'77' => [
						'name' => __( 'Prachuap Khiri Khan', 'voxel-countries' ),
					],
					'85' => [
						'name' => __( 'Ranong', 'voxel-countries' ),
					],
					'70' => [
						'name' => __( 'Ratchaburi', 'voxel-countries' ),
					],
					'21' => [
						'name' => __( 'Rayong', 'voxel-countries' ),
					],
					'45' => [
						'name' => __( 'Roi Et', 'voxel-countries' ),
					],
					'27' => [
						'name' => __( 'Sa Kaeo', 'voxel-countries' ),
					],
					'47' => [
						'name' => __( 'Sakon Nakhon', 'voxel-countries' ),
					],
					'11' => [
						'name' => __( 'Samut Prakan', 'voxel-countries' ),
					],
					'74' => [
						'name' => __( 'Samut Sakhon', 'voxel-countries' ),
					],
					'75' => [
						'name' => __( 'Samut Songkhram', 'voxel-countries' ),
					],
					'19' => [
						'name' => __( 'Saraburi', 'voxel-countries' ),
					],
					'91' => [
						'name' => __( 'Satun', 'voxel-countries' ),
					],
					'33' => [
						'name' => __( 'Si Sa Ket', 'voxel-countries' ),
					],
					'17' => [
						'name' => __( 'Sing Buri', 'voxel-countries' ),
					],
					'90' => [
						'name' => __( 'Songkhla', 'voxel-countries' ),
					],
					'64' => [
						'name' => __( 'Sukhothai', 'voxel-countries' ),
					],
					'72' => [
						'name' => __( 'Suphan Buri', 'voxel-countries' ),
					],
					'84' => [
						'name' => __( 'Surat Thani', 'voxel-countries' ),
					],
					'32' => [
						'name' => __( 'Surin', 'voxel-countries' ),
					],
					'63' => [
						'name' => __( 'Tak', 'voxel-countries' ),
					],
					'92' => [
						'name' => __( 'Trang', 'voxel-countries' ),
					],
					'23' => [
						'name' => __( 'Trat', 'voxel-countries' ),
					],
					'34' => [
						'name' => __( 'Ubon Ratchathani', 'voxel-countries' ),
					],
					'41' => [
						'name' => __( 'Udon Thani', 'voxel-countries' ),
					],
					'61' => [
						'name' => __( 'Uthai Thani', 'voxel-countries' ),
					],
					'53' => [
						'name' => __( 'Uttaradit', 'voxel-countries' ),
					],
					'95' => [
						'name' => __( 'Yala', 'voxel-countries' ),
					],
					'35' => [
						'name' => __( 'Yasothon', 'voxel-countries' ),
					],
				]
			],
			'TJ' => [
				'code3' => 'TJK',
				'name' => __( 'Tajikistan', 'voxel-countries' ),
				'continent' => 'Asia',
				'states' => [
					'DU' => [
						'name' => __( 'Dushanbe', 'voxel-countries' ),
					],
					'KT' => [
						'name' => __( 'Khatlon', 'voxel-countries' ),
					],
					'GB' => [
						'name' => __( 'Kŭhistoni Badakhshon', 'voxel-countries' ),
					],
					'SU' => [
						'name' => __( 'Sughd', 'voxel-countries' ),
					],
				]
			],
			'TK' => [
				'code3' => 'TKL',
				'name' => __( 'Tokelau', 'voxel-countries' ),
				'continent' => 'Oceania',
				'states' => [],
			],
			'TL' => [
				'code3' => 'TLS',
				'name' => __( 'East Timor', 'voxel-countries' ),
				'continent' => 'Asia',
				'states' => [
					'AL' => [
						'name' => __( 'Aileu', 'voxel-countries' ),
					],
					'AN' => [
						'name' => __( 'Ainaro', 'voxel-countries' ),
					],
					'BA' => [
						'name' => __( 'Baucau', 'voxel-countries' ),
					],
					'BO' => [
						'name' => __( 'Bobonaro', 'voxel-countries' ),
					],
					'CO' => [
						'name' => __( 'Cova Lima', 'voxel-countries' ),
					],
					'DI' => [
						'name' => __( 'Díli', 'voxel-countries' ),
					],
					'ER' => [
						'name' => __( 'Ermera', 'voxel-countries' ),
					],
					'LA' => [
						'name' => __( 'Lautem', 'voxel-countries' ),
					],
					'LI' => [
						'name' => __( 'Liquiça', 'voxel-countries' ),
					],
					'MT' => [
						'name' => __( 'Manatuto', 'voxel-countries' ),
					],
					'MF' => [
						'name' => __( 'Manufahi', 'voxel-countries' ),
					],
					'OE' => [
						'name' => __( 'Oecussi', 'voxel-countries' ),
					],
					'VI' => [
						'name' => __( 'Viqueque', 'voxel-countries' ),
					],
				]
			],
			'TM' => [
				'code3' => 'TKM',
				'name' => __( 'Turkmenistan', 'voxel-countries' ),
				'continent' => 'Asia',
				'states' => [
					'A' => [
						'name' => __( 'Ahal', 'voxel-countries' ),
					],
					'S' => [
						'name' => __( 'Aşgabat', 'voxel-countries' ),
					],
					'B' => [
						'name' => __( 'Balkan', 'voxel-countries' ),
					],
					'D' => [
						'name' => __( 'Daşoguz', 'voxel-countries' ),
					],
					'L' => [
						'name' => __( 'Lebap', 'voxel-countries' ),
					],
					'M' => [
						'name' => __( 'Mary', 'voxel-countries' ),
					],
				]
			],
			'TN' => [
				'code3' => 'TUN',
				'name' => __( 'Tunisia', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'12' => [
						'name' => __( 'Ariana', 'voxel-countries' ),
					],
					'13' => [
						'name' => __( 'Ben Arous', 'voxel-countries' ),
					],
					'23' => [
						'name' => __( 'Bizerte', 'voxel-countries' ),
					],
					'31' => [
						'name' => __( 'Béja', 'voxel-countries' ),
					],
					'81' => [
						'name' => __( 'Gabès', 'voxel-countries' ),
					],
					'71' => [
						'name' => __( 'Gafsa', 'voxel-countries' ),
					],
					'32' => [
						'name' => __( 'Jendouba', 'voxel-countries' ),
					],
					'41' => [
						'name' => __( 'Kairouan', 'voxel-countries' ),
					],
					'42' => [
						'name' => __( 'Kasserine', 'voxel-countries' ),
					],
					'73' => [
						'name' => __( 'Kebili', 'voxel-countries' ),
					],
					'14' => [
						'name' => __( 'La Manouba', 'voxel-countries' ),
					],
					'33' => [
						'name' => __( 'Le Kef', 'voxel-countries' ),
					],
					'53' => [
						'name' => __( 'Mahdia', 'voxel-countries' ),
					],
					'82' => [
						'name' => __( 'Medenine', 'voxel-countries' ),
					],
					'52' => [
						'name' => __( 'Monastir', 'voxel-countries' ),
					],
					'21' => [
						'name' => __( 'Nabeul', 'voxel-countries' ),
					],
					'61' => [
						'name' => __( 'Sfax', 'voxel-countries' ),
					],
					'43' => [
						'name' => __( 'Sidi Bouzid', 'voxel-countries' ),
					],
					'34' => [
						'name' => __( 'Siliana', 'voxel-countries' ),
					],
					'51' => [
						'name' => __( 'Sousse', 'voxel-countries' ),
					],
					'83' => [
						'name' => __( 'Tataouine', 'voxel-countries' ),
					],
					'72' => [
						'name' => __( 'Tozeur', 'voxel-countries' ),
					],
					'11' => [
						'name' => __( 'Tunis', 'voxel-countries' ),
					],
					'22' => [
						'name' => __( 'Zaghouan', 'voxel-countries' ),
					],
				]
			],
			'TO' => [
				'code3' => 'TON',
				'name' => __( 'Tonga', 'voxel-countries' ),
				'continent' => 'Oceania',
				'states' => [
					'01' => [
						'name' => __( '\'Eua', 'voxel-countries' ),
					],
					'02' => [
						'name' => __( 'Ha\'apai', 'voxel-countries' ),
					],
					'03' => [
						'name' => __( 'Niuas', 'voxel-countries' ),
					],
					'04' => [
						'name' => __( 'Tongatapu', 'voxel-countries' ),
					],
					'05' => [
						'name' => __( 'Vava\'u', 'voxel-countries' ),
					],
				]
			],
			'TR' => [
				'code3' => 'TUR',
				'name' => __( 'Turkey', 'voxel-countries' ),
				'continent' => 'Asia',
				'states' => [
					'01' => [
						'name' => __( 'Adana', 'voxel-countries' ),
					],
					'02' => [
						'name' => __( 'Adıyaman', 'voxel-countries' ),
					],
					'03' => [
						'name' => __( 'Afyonkarahisar', 'voxel-countries' ),
					],
					'68' => [
						'name' => __( 'Aksaray', 'voxel-countries' ),
					],
					'05' => [
						'name' => __( 'Amasya', 'voxel-countries' ),
					],
					'06' => [
						'name' => __( 'Ankara', 'voxel-countries' ),
					],
					'07' => [
						'name' => __( 'Antalya', 'voxel-countries' ),
					],
					'75' => [
						'name' => __( 'Ardahan', 'voxel-countries' ),
					],
					'08' => [
						'name' => __( 'Artvin', 'voxel-countries' ),
					],
					'09' => [
						'name' => __( 'Aydın', 'voxel-countries' ),
					],
					'04' => [
						'name' => __( 'Ağrı', 'voxel-countries' ),
					],
					'10' => [
						'name' => __( 'Balıkesir', 'voxel-countries' ),
					],
					'74' => [
						'name' => __( 'Bartın', 'voxel-countries' ),
					],
					'72' => [
						'name' => __( 'Batman', 'voxel-countries' ),
					],
					'69' => [
						'name' => __( 'Bayburt', 'voxel-countries' ),
					],
					'11' => [
						'name' => __( 'Bilecik', 'voxel-countries' ),
					],
					'12' => [
						'name' => __( 'Bingöl', 'voxel-countries' ),
					],
					'13' => [
						'name' => __( 'Bitlis', 'voxel-countries' ),
					],
					'14' => [
						'name' => __( 'Bolu', 'voxel-countries' ),
					],
					'15' => [
						'name' => __( 'Burdur', 'voxel-countries' ),
					],
					'16' => [
						'name' => __( 'Bursa', 'voxel-countries' ),
					],
					'20' => [
						'name' => __( 'Denizli', 'voxel-countries' ),
					],
					'21' => [
						'name' => __( 'Diyarbakır', 'voxel-countries' ),
					],
					'81' => [
						'name' => __( 'Düzce', 'voxel-countries' ),
					],
					'22' => [
						'name' => __( 'Edirne', 'voxel-countries' ),
					],
					'23' => [
						'name' => __( 'Elazığ', 'voxel-countries' ),
					],
					'24' => [
						'name' => __( 'Erzincan', 'voxel-countries' ),
					],
					'25' => [
						'name' => __( 'Erzurum', 'voxel-countries' ),
					],
					'26' => [
						'name' => __( 'Eskişehir', 'voxel-countries' ),
					],
					'27' => [
						'name' => __( 'Gaziantep', 'voxel-countries' ),
					],
					'28' => [
						'name' => __( 'Giresun', 'voxel-countries' ),
					],
					'29' => [
						'name' => __( 'Gümüşhane', 'voxel-countries' ),
					],
					'30' => [
						'name' => __( 'Hakkâri', 'voxel-countries' ),
					],
					'31' => [
						'name' => __( 'Hatay', 'voxel-countries' ),
					],
					'32' => [
						'name' => __( 'Isparta', 'voxel-countries' ),
					],
					'76' => [
						'name' => __( 'Iğdır', 'voxel-countries' ),
					],
					'46' => [
						'name' => __( 'Kahramanmaraş', 'voxel-countries' ),
					],
					'78' => [
						'name' => __( 'Karabük', 'voxel-countries' ),
					],
					'70' => [
						'name' => __( 'Karaman', 'voxel-countries' ),
					],
					'36' => [
						'name' => __( 'Kars', 'voxel-countries' ),
					],
					'37' => [
						'name' => __( 'Kastamonu', 'voxel-countries' ),
					],
					'38' => [
						'name' => __( 'Kayseri', 'voxel-countries' ),
					],
					'79' => [
						'name' => __( 'Kilis', 'voxel-countries' ),
					],
					'41' => [
						'name' => __( 'Kocaeli', 'voxel-countries' ),
					],
					'42' => [
						'name' => __( 'Konya', 'voxel-countries' ),
					],
					'43' => [
						'name' => __( 'Kütahya', 'voxel-countries' ),
					],
					'39' => [
						'name' => __( 'Kırklareli', 'voxel-countries' ),
					],
					'71' => [
						'name' => __( 'Kırıkkale', 'voxel-countries' ),
					],
					'40' => [
						'name' => __( 'Kırşehir', 'voxel-countries' ),
					],
					'44' => [
						'name' => __( 'Malatya', 'voxel-countries' ),
					],
					'45' => [
						'name' => __( 'Manisa', 'voxel-countries' ),
					],
					'47' => [
						'name' => __( 'Mardin', 'voxel-countries' ),
					],
					'33' => [
						'name' => __( 'Mersin', 'voxel-countries' ),
					],
					'48' => [
						'name' => __( 'Muğla', 'voxel-countries' ),
					],
					'49' => [
						'name' => __( 'Muş', 'voxel-countries' ),
					],
					'50' => [
						'name' => __( 'Nevşehir', 'voxel-countries' ),
					],
					'51' => [
						'name' => __( 'Niğde', 'voxel-countries' ),
					],
					'52' => [
						'name' => __( 'Ordu', 'voxel-countries' ),
					],
					'80' => [
						'name' => __( 'Osmaniye', 'voxel-countries' ),
					],
					'53' => [
						'name' => __( 'Rize', 'voxel-countries' ),
					],
					'54' => [
						'name' => __( 'Sakarya', 'voxel-countries' ),
					],
					'55' => [
						'name' => __( 'Samsun', 'voxel-countries' ),
					],
					'56' => [
						'name' => __( 'Siirt', 'voxel-countries' ),
					],
					'57' => [
						'name' => __( 'Sinop', 'voxel-countries' ),
					],
					'58' => [
						'name' => __( 'Sivas', 'voxel-countries' ),
					],
					'59' => [
						'name' => __( 'Tekirdağ', 'voxel-countries' ),
					],
					'60' => [
						'name' => __( 'Tokat', 'voxel-countries' ),
					],
					'61' => [
						'name' => __( 'Trabzon', 'voxel-countries' ),
					],
					'62' => [
						'name' => __( 'Tunceli', 'voxel-countries' ),
					],
					'64' => [
						'name' => __( 'Uşak', 'voxel-countries' ),
					],
					'65' => [
						'name' => __( 'Van', 'voxel-countries' ),
					],
					'77' => [
						'name' => __( 'Yalova', 'voxel-countries' ),
					],
					'66' => [
						'name' => __( 'Yozgat', 'voxel-countries' ),
					],
					'67' => [
						'name' => __( 'Zonguldak', 'voxel-countries' ),
					],
					'17' => [
						'name' => __( 'Çanakkale', 'voxel-countries' ),
					],
					'18' => [
						'name' => __( 'Çankırı', 'voxel-countries' ),
					],
					'19' => [
						'name' => __( 'Çorum', 'voxel-countries' ),
					],
					'34' => [
						'name' => __( 'İstanbul', 'voxel-countries' ),
					],
					'35' => [
						'name' => __( 'İzmir', 'voxel-countries' ),
					],
					'63' => [
						'name' => __( 'Şanlıurfa', 'voxel-countries' ),
					],
					'73' => [
						'name' => __( 'Şırnak', 'voxel-countries' ),
					],
				]
			],
			'TT' => [
				'code3' => 'TTO',
				'name' => __( 'Trinidad and Tobago', 'voxel-countries' ),
				'continent' => 'North America',
				'states' => [
					'ARI' => [
						'name' => __( 'Arima', 'voxel-countries' ),
					],
					'CHA' => [
						'name' => __( 'Chaguanas', 'voxel-countries' ),
					],
					'CTT' => [
						'name' => __( 'Couva-Tabaquite-Talparo', 'voxel-countries' ),
					],
					'DMN' => [
						'name' => __( 'Diego Martin', 'voxel-countries' ),
					],
					'ETO' => [
						'name' => __( 'Eastern Tobago', 'voxel-countries' ),
					],
					'PED' => [
						'name' => __( 'Penal-Debe', 'voxel-countries' ),
					],
					'PTF' => [
						'name' => __( 'Point Fortin', 'voxel-countries' ),
					],
					'POS' => [
						'name' => __( 'Port of Spain', 'voxel-countries' ),
					],
					'PRT' => [
						'name' => __( 'Princes Town', 'voxel-countries' ),
					],
					'RCM' => [
						'name' => __( 'Rio Claro-Mayaro', 'voxel-countries' ),
					],
					'SFO' => [
						'name' => __( 'San Fernando', 'voxel-countries' ),
					],
					'SJL' => [
						'name' => __( 'San Juan-Laventille', 'voxel-countries' ),
					],
					'SGE' => [
						'name' => __( 'Sangre Grande', 'voxel-countries' ),
					],
					'SIP' => [
						'name' => __( 'Siparia', 'voxel-countries' ),
					],
					'TUP' => [
						'name' => __( 'Tunapuna-Piarco', 'voxel-countries' ),
					],
					'WTO' => [
						'name' => __( 'Western Tobago', 'voxel-countries' ),
					],
				]
			],
			'TV' => [
				'code3' => 'TUV',
				'name' => __( 'Tuvalu', 'voxel-countries' ),
				'continent' => 'Oceania',
				'states' => [
					'FUN' => [
						'name' => __( 'Funafuti', 'voxel-countries' ),
					],
					'NMG' => [
						'name' => __( 'Nanumanga', 'voxel-countries' ),
					],
					'NMA' => [
						'name' => __( 'Nanumea', 'voxel-countries' ),
					],
					'NIT' => [
						'name' => __( 'Niutao', 'voxel-countries' ),
					],
					'NUI' => [
						'name' => __( 'Nui', 'voxel-countries' ),
					],
					'NKF' => [
						'name' => __( 'Nukufetau', 'voxel-countries' ),
					],
					'NKL' => [
						'name' => __( 'Nukulaelae', 'voxel-countries' ),
					],
					'VAI' => [
						'name' => __( 'Vaitupu', 'voxel-countries' ),
					],
				]
			],
			'TW' => [
				'code3' => 'TWN',
				'name' => __( 'Taiwan', 'voxel-countries' ),
				'continent' => 'Asia',
				'states' => [
					'CHA' => [
						'name' => __( 'Changhua', 'voxel-countries' ),
					],
					'CYQ' => [
						'name' => __( 'Chiayi', 'voxel-countries' ),
					],
					'CYI' => [
						'name' => __( 'Chiayi', 'voxel-countries' ),
					],
					'HSZ' => [
						'name' => __( 'Hsinchu', 'voxel-countries' ),
					],
					'HSQ' => [
						'name' => __( 'Hsinchu', 'voxel-countries' ),
					],
					'HUA' => [
						'name' => __( 'Hualien', 'voxel-countries' ),
					],
					'ILA' => [
						'name' => __( 'Ilan', 'voxel-countries' ),
					],
					'KHQ' => [
						'name' => __( 'Kaohsiung', 'voxel-countries' ),
					],
					'KHH' => [
						'name' => __( 'Kaohsiung', 'voxel-countries' ),
					],
					'KEE' => [
						'name' => __( 'Keelung', 'voxel-countries' ),
					],
					'MIA' => [
						'name' => __( 'Miaoli', 'voxel-countries' ),
					],
					'NAN' => [
						'name' => __( 'Nantou', 'voxel-countries' ),
					],
					'PEN' => [
						'name' => __( 'Penghu', 'voxel-countries' ),
					],
					'PIF' => [
						'name' => __( 'Pingtung', 'voxel-countries' ),
					],
					'TXG' => [
						'name' => __( 'Taichung', 'voxel-countries' ),
					],
					'TXQ' => [
						'name' => __( 'Taichung', 'voxel-countries' ),
					],
					'TNN' => [
						'name' => __( 'Tainan', 'voxel-countries' ),
					],
					'TNQ' => [
						'name' => __( 'Tainan', 'voxel-countries' ),
					],
					'TPE' => [
						'name' => __( 'Taipei', 'voxel-countries' ),
					],
					'TPQ' => [
						'name' => __( 'Taipei', 'voxel-countries' ),
					],
					'TTT' => [
						'name' => __( 'Taitung', 'voxel-countries' ),
					],
					'TAO' => [
						'name' => __( 'Taoyuan', 'voxel-countries' ),
					],
					'YUN' => [
						'name' => __( 'Yunlin', 'voxel-countries' ),
					],
				]
			],
			'TZ' => [
				'code3' => 'TZA',
				'name' => __( 'Tanzania', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'01' => [
						'name' => __( 'Arusha', 'voxel-countries' ),
					],
					'02' => [
						'name' => __( 'Dar es Salaam', 'voxel-countries' ),
					],
					'03' => [
						'name' => __( 'Dodoma', 'voxel-countries' ),
					],
					'04' => [
						'name' => __( 'Iringa', 'voxel-countries' ),
					],
					'05' => [
						'name' => __( 'Kagera', 'voxel-countries' ),
					],
					'06' => [
						'name' => __( 'Kaskazini Pemba', 'voxel-countries' ),
					],
					'07' => [
						'name' => __( 'Kaskazini Unguja', 'voxel-countries' ),
					],
					'08' => [
						'name' => __( 'Kigoma', 'voxel-countries' ),
					],
					'09' => [
						'name' => __( 'Kilimanjaro', 'voxel-countries' ),
					],
					'10' => [
						'name' => __( 'Kusini Pemba', 'voxel-countries' ),
					],
					'11' => [
						'name' => __( 'Kusini Unguja', 'voxel-countries' ),
					],
					'12' => [
						'name' => __( 'Lindi', 'voxel-countries' ),
					],
					'26' => [
						'name' => __( 'Manyara', 'voxel-countries' ),
					],
					'13' => [
						'name' => __( 'Mara', 'voxel-countries' ),
					],
					'14' => [
						'name' => __( 'Mbeya', 'voxel-countries' ),
					],
					'15' => [
						'name' => __( 'Mjini Magharibi', 'voxel-countries' ),
					],
					'16' => [
						'name' => __( 'Morogoro', 'voxel-countries' ),
					],
					'17' => [
						'name' => __( 'Mtwara', 'voxel-countries' ),
					],
					'18' => [
						'name' => __( 'Mwanza', 'voxel-countries' ),
					],
					'19' => [
						'name' => __( 'Pwani', 'voxel-countries' ),
					],
					'20' => [
						'name' => __( 'Rukwa', 'voxel-countries' ),
					],
					'21' => [
						'name' => __( 'Ruvuma', 'voxel-countries' ),
					],
					'22' => [
						'name' => __( 'Shinyanga', 'voxel-countries' ),
					],
					'23' => [
						'name' => __( 'Singida', 'voxel-countries' ),
					],
					'24' => [
						'name' => __( 'Tabora', 'voxel-countries' ),
					],
					'25' => [
						'name' => __( 'Tanga', 'voxel-countries' ),
					],
				]
			],
			'UA' => [
				'code3' => 'UKR',
				'name' => __( 'Ukraine', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [
					'43' => [
						'name' => __( 'Avtonomna Respublika Krym', 'voxel-countries' ),
					],
					'71' => [
						'name' => __( 'Cherkas\'ka Oblast\'', 'voxel-countries' ),
					],
					'74' => [
						'name' => __( 'Chernihivs\'ka Oblast\'', 'voxel-countries' ),
					],
					'77' => [
						'name' => __( 'Chernivets\'ka Oblast\'', 'voxel-countries' ),
					],
					'12' => [
						'name' => __( 'Dnipropetrovs\'ka Oblast\'', 'voxel-countries' ),
					],
					'14' => [
						'name' => __( 'Donets\'ka Oblast\'', 'voxel-countries' ),
					],
					'26' => [
						'name' => __( 'Ivano-Frankivs\'ka Oblast\'', 'voxel-countries' ),
					],
					'63' => [
						'name' => __( 'Kharkivs\'ka Oblast\'', 'voxel-countries' ),
					],
					'65' => [
						'name' => __( 'Khersons\'ka Oblast\'', 'voxel-countries' ),
					],
					'68' => [
						'name' => __( 'Khmel\'nyts\'ka Oblast\'', 'voxel-countries' ),
					],
					'35' => [
						'name' => __( 'Kirovohrads\'ka Oblast\'', 'voxel-countries' ),
					],
					'30' => [
						'name' => __( 'Kyïv', 'voxel-countries' ),
					],
					'32' => [
						'name' => __( 'Kyïvs\'ka Oblast\'', 'voxel-countries' ),
					],
					'46' => [
						'name' => __( 'L\'vivs\'ka Oblast\'', 'voxel-countries' ),
					],
					'09' => [
						'name' => __( 'Luhans\'ka Oblast\'', 'voxel-countries' ),
					],
					'48' => [
						'name' => __( 'Mykolaïvs\'ka Oblast\'', 'voxel-countries' ),
					],
					'51' => [
						'name' => __( 'Odes\'ka Oblast\'', 'voxel-countries' ),
					],
					'53' => [
						'name' => __( 'Poltavs\'ka Oblast\'', 'voxel-countries' ),
					],
					'56' => [
						'name' => __( 'Rivnens\'ka Oblast\'', 'voxel-countries' ),
					],
					'40' => [
						'name' => __( 'Sevastopol\'', 'voxel-countries' ),
					],
					'59' => [
						'name' => __( 'Sums\'ka Oblast\'', 'voxel-countries' ),
					],
					'61' => [
						'name' => __( 'Ternopil\'s\'ka Oblast\'', 'voxel-countries' ),
					],
					'05' => [
						'name' => __( 'Vinnyts\'ka Oblast\'', 'voxel-countries' ),
					],
					'07' => [
						'name' => __( 'Volyns\'ka Oblast\'', 'voxel-countries' ),
					],
					'21' => [
						'name' => __( 'Zakarpats\'ka Oblast\'', 'voxel-countries' ),
					],
					'23' => [
						'name' => __( 'Zaporiz\'ka Oblast\'', 'voxel-countries' ),
					],
					'18' => [
						'name' => __( 'Zhytomyrs\'ka Oblast\'', 'voxel-countries' ),
					],
				]
			],
			'UG' => [
				'code3' => 'UGA',
				'name' => __( 'Uganda', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'C' => [
						'name' => __( 'Central', 'voxel-countries' ),
					],
					'E' => [
						'name' => __( 'Eastern', 'voxel-countries' ),
					],
					'N' => [
						'name' => __( 'Northern', 'voxel-countries' ),
					],
					'W' => [
						'name' => __( 'Western', 'voxel-countries' ),
					],
				]
			],
			'UM' => [
				'code3' => 'UMI',
				'name' => __( 'United States Minor Outlying Islands', 'voxel-countries' ),
				'continent' => 'Oceania',
				'states' => [],
			],
			'US' => [
				'code3' => 'USA',
				'name' => __( 'United States', 'voxel-countries' ),
				'continent' => 'North America',
				'states' => [
					'DC' => [
						'name' => __( 'District of Columbia', 'voxel-countries' ),
					],
					'AL' => [
						'name' => __( 'Alabama', 'voxel-countries' ),
					],
					'AK' => [
						'name' => __( 'Alaska', 'voxel-countries' ),
					],
					'AZ' => [
						'name' => __( 'Arizona', 'voxel-countries' ),
					],
					'AR' => [
						'name' => __( 'Arkansas', 'voxel-countries' ),
					],
					'CA' => [
						'name' => __( 'California', 'voxel-countries' ),
					],
					'CO' => [
						'name' => __( 'Colorado', 'voxel-countries' ),
					],
					'CT' => [
						'name' => __( 'Connecticut', 'voxel-countries' ),
					],
					'DE' => [
						'name' => __( 'Delaware', 'voxel-countries' ),
					],
					'FL' => [
						'name' => __( 'Florida', 'voxel-countries' ),
					],
					'GA' => [
						'name' => __( 'Georgia', 'voxel-countries' ),
					],
					'HI' => [
						'name' => __( 'Hawaii', 'voxel-countries' ),
					],
					'ID' => [
						'name' => __( 'Idaho', 'voxel-countries' ),
					],
					'IL' => [
						'name' => __( 'Illinois', 'voxel-countries' ),
					],
					'IN' => [
						'name' => __( 'Indiana', 'voxel-countries' ),
					],
					'IA' => [
						'name' => __( 'Iowa', 'voxel-countries' ),
					],
					'KS' => [
						'name' => __( 'Kansas', 'voxel-countries' ),
					],
					'KY' => [
						'name' => __( 'Kentucky', 'voxel-countries' ),
					],
					'LA' => [
						'name' => __( 'Louisiana', 'voxel-countries' ),
					],
					'ME' => [
						'name' => __( 'Maine', 'voxel-countries' ),
					],
					'MD' => [
						'name' => __( 'Maryland', 'voxel-countries' ),
					],
					'MA' => [
						'name' => __( 'Massachusetts', 'voxel-countries' ),
					],
					'MI' => [
						'name' => __( 'Michigan', 'voxel-countries' ),
					],
					'MN' => [
						'name' => __( 'Minnesota', 'voxel-countries' ),
					],
					'MS' => [
						'name' => __( 'Mississippi', 'voxel-countries' ),
					],
					'MO' => [
						'name' => __( 'Missouri', 'voxel-countries' ),
					],
					'MT' => [
						'name' => __( 'Montana', 'voxel-countries' ),
					],
					'NE' => [
						'name' => __( 'Nebraska', 'voxel-countries' ),
					],
					'NV' => [
						'name' => __( 'Nevada', 'voxel-countries' ),
					],
					'NH' => [
						'name' => __( 'New Hampshire', 'voxel-countries' ),
					],
					'NJ' => [
						'name' => __( 'New Jersey', 'voxel-countries' ),
					],
					'NM' => [
						'name' => __( 'New Mexico', 'voxel-countries' ),
					],
					'NY' => [
						'name' => __( 'New York', 'voxel-countries' ),
					],
					'NC' => [
						'name' => __( 'North Carolina', 'voxel-countries' ),
					],
					'ND' => [
						'name' => __( 'North Dakota', 'voxel-countries' ),
					],
					'OH' => [
						'name' => __( 'Ohio', 'voxel-countries' ),
					],
					'OK' => [
						'name' => __( 'Oklahoma', 'voxel-countries' ),
					],
					'OR' => [
						'name' => __( 'Oregon', 'voxel-countries' ),
					],
					'PA' => [
						'name' => __( 'Pennsylvania', 'voxel-countries' ),
					],
					'RI' => [
						'name' => __( 'Rhode Island', 'voxel-countries' ),
					],
					'SC' => [
						'name' => __( 'South Carolina', 'voxel-countries' ),
					],
					'SD' => [
						'name' => __( 'South Dakota', 'voxel-countries' ),
					],
					'TN' => [
						'name' => __( 'Tennessee', 'voxel-countries' ),
					],
					'TX' => [
						'name' => __( 'Texas', 'voxel-countries' ),
					],
					'UT' => [
						'name' => __( 'Utah', 'voxel-countries' ),
					],
					'VT' => [
						'name' => __( 'Vermont', 'voxel-countries' ),
					],
					'VA' => [
						'name' => __( 'Virginia', 'voxel-countries' ),
					],
					'WA' => [
						'name' => __( 'Washington', 'voxel-countries' ),
					],
					'WV' => [
						'name' => __( 'West Virginia', 'voxel-countries' ),
					],
					'WI' => [
						'name' => __( 'Wisconsin', 'voxel-countries' ),
					],
					'WY' => [
						'name' => __( 'Wyoming', 'voxel-countries' ),
					],
				]
			],
			'UY' => [
				'code3' => 'URY',
				'name' => __( 'Uruguay', 'voxel-countries' ),
				'continent' => 'South America',
				'states' => [
					'AR' => [
						'name' => __( 'Artigas', 'voxel-countries' ),
					],
					'CA' => [
						'name' => __( 'Canelones', 'voxel-countries' ),
					],
					'CL' => [
						'name' => __( 'Cerro Largo', 'voxel-countries' ),
					],
					'CO' => [
						'name' => __( 'Colonia', 'voxel-countries' ),
					],
					'DU' => [
						'name' => __( 'Durazno', 'voxel-countries' ),
					],
					'FS' => [
						'name' => __( 'Flores', 'voxel-countries' ),
					],
					'FD' => [
						'name' => __( 'Florida', 'voxel-countries' ),
					],
					'LA' => [
						'name' => __( 'Lavalleja', 'voxel-countries' ),
					],
					'MA' => [
						'name' => __( 'Maldonado', 'voxel-countries' ),
					],
					'MO' => [
						'name' => __( 'Montevideo', 'voxel-countries' ),
					],
					'PA' => [
						'name' => __( 'Paysandú', 'voxel-countries' ),
					],
					'RV' => [
						'name' => __( 'Rivera', 'voxel-countries' ),
					],
					'RO' => [
						'name' => __( 'Rocha', 'voxel-countries' ),
					],
					'RN' => [
						'name' => __( 'Río Negro', 'voxel-countries' ),
					],
					'SA' => [
						'name' => __( 'Salto', 'voxel-countries' ),
					],
					'SJ' => [
						'name' => __( 'San José', 'voxel-countries' ),
					],
					'SO' => [
						'name' => __( 'Soriano', 'voxel-countries' ),
					],
					'TA' => [
						'name' => __( 'Tacuarembó', 'voxel-countries' ),
					],
					'TT' => [
						'name' => __( 'Treinta y Tres', 'voxel-countries' ),
					],
				]
			],
			'UZ' => [
				'code3' => 'UZB',
				'name' => __( 'Uzbekistan', 'voxel-countries' ),
				'continent' => 'Asia',
				'states' => [
					'AN' => [
						'name' => __( 'Andijon', 'voxel-countries' ),
					],
					'BU' => [
						'name' => __( 'Buxoro', 'voxel-countries' ),
					],
					'FA' => [
						'name' => __( 'Farg‘ona', 'voxel-countries' ),
					],
					'JI' => [
						'name' => __( 'Jizzax', 'voxel-countries' ),
					],
					'NG' => [
						'name' => __( 'Namangan', 'voxel-countries' ),
					],
					'NW' => [
						'name' => __( 'Navoiy', 'voxel-countries' ),
					],
					'QA' => [
						'name' => __( 'Qashqadaryo', 'voxel-countries' ),
					],
					'QR' => [
						'name' => __( 'Qoraqalpog‘iston Respublikasi', 'voxel-countries' ),
					],
					'SA' => [
						'name' => __( 'Samarqand', 'voxel-countries' ),
					],
					'SI' => [
						'name' => __( 'Sirdaryo', 'voxel-countries' ),
					],
					'SU' => [
						'name' => __( 'Surxondaryo', 'voxel-countries' ),
					],
					'TO' => [
						'name' => __( 'Toshkent', 'voxel-countries' ),
					],
					'TK' => [
						'name' => __( 'Toshkent', 'voxel-countries' ),
					],
					'XO' => [
						'name' => __( 'Xorazm', 'voxel-countries' ),
					],
				]
			],
			'VA' => [
				'code3' => 'VAT',
				'name' => __( 'Vatican City', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [],
			],
			'VC' => [
				'code3' => 'VCT',
				'name' => __( 'Saint Vincent and the Grenadines', 'voxel-countries' ),
				'continent' => 'North America',
				'states' => [
					'01' => [
						'name' => __( 'Charlotte', 'voxel-countries' ),
					],
					'06' => [
						'name' => __( 'Grenadines', 'voxel-countries' ),
					],
					'02' => [
						'name' => __( 'Saint Andrew', 'voxel-countries' ),
					],
					'03' => [
						'name' => __( 'Saint David', 'voxel-countries' ),
					],
					'04' => [
						'name' => __( 'Saint George', 'voxel-countries' ),
					],
					'05' => [
						'name' => __( 'Saint Patrick', 'voxel-countries' ),
					],
				]
			],
			'VE' => [
				'code3' => 'VEN',
				'name' => __( 'Venezuela', 'voxel-countries' ),
				'continent' => 'South America',
				'states' => [
					'Z' => [
						'name' => __( 'Amazonas', 'voxel-countries' ),
					],
					'B' => [
						'name' => __( 'Anzoátegui', 'voxel-countries' ),
					],
					'C' => [
						'name' => __( 'Apure', 'voxel-countries' ),
					],
					'D' => [
						'name' => __( 'Aragua', 'voxel-countries' ),
					],
					'E' => [
						'name' => __( 'Barinas', 'voxel-countries' ),
					],
					'F' => [
						'name' => __( 'Bolívar', 'voxel-countries' ),
					],
					'G' => [
						'name' => __( 'Carabobo', 'voxel-countries' ),
					],
					'H' => [
						'name' => __( 'Cojedes', 'voxel-countries' ),
					],
					'Y' => [
						'name' => __( 'Delta Amacuro', 'voxel-countries' ),
					],
					'W' => [
						'name' => __( 'Dependencias Federales', 'voxel-countries' ),
					],
					'A' => [
						'name' => __( 'Distrito Capital', 'voxel-countries' ),
					],
					'I' => [
						'name' => __( 'Falcón', 'voxel-countries' ),
					],
					'J' => [
						'name' => __( 'Guárico', 'voxel-countries' ),
					],
					'K' => [
						'name' => __( 'Lara', 'voxel-countries' ),
					],
					'M' => [
						'name' => __( 'Miranda', 'voxel-countries' ),
					],
					'N' => [
						'name' => __( 'Monagas', 'voxel-countries' ),
					],
					'L' => [
						'name' => __( 'Mérida', 'voxel-countries' ),
					],
					'O' => [
						'name' => __( 'Nueva Esparta', 'voxel-countries' ),
					],
					'P' => [
						'name' => __( 'Portuguesa', 'voxel-countries' ),
					],
					'R' => [
						'name' => __( 'Sucre', 'voxel-countries' ),
					],
					'T' => [
						'name' => __( 'Trujillo', 'voxel-countries' ),
					],
					'S' => [
						'name' => __( 'Táchira', 'voxel-countries' ),
					],
					'X' => [
						'name' => __( 'Vargas', 'voxel-countries' ),
					],
					'U' => [
						'name' => __( 'Yaracuy', 'voxel-countries' ),
					],
					'V' => [
						'name' => __( 'Zulia', 'voxel-countries' ),
					],
				]
			],
			'VG' => [
				'code3' => 'VGB',
				'name' => __( 'Virgin Islands (British)', 'voxel-countries' ),
				'continent' => 'North America',
				'states' => [],
			],
			'VI' => [
				'code3' => 'VIR',
				'name' => __( 'Virgin Islands, U.S.', 'voxel-countries' ),
				'continent' => 'North America',
				'states' => [],
			],
			'VN' => [
				'code3' => 'VNM',
				'name' => __( 'Vietnam', 'voxel-countries' ),
				'continent' => 'Asia',
				'states' => [
					'44' => [
						'name' => __( 'An Giang', 'voxel-countries' ),
					],
					'43' => [
						'name' => __( 'Bà Rịa–Vũng Tàu', 'voxel-countries' ),
					],
					'57' => [
						'name' => __( 'Bình Dương', 'voxel-countries' ),
					],
					'58' => [
						'name' => __( 'Bình Phước', 'voxel-countries' ),
					],
					'40' => [
						'name' => __( 'Bình Thuận', 'voxel-countries' ),
					],
					'31' => [
						'name' => __( 'Bình Định', 'voxel-countries' ),
					],
					'55' => [
						'name' => __( 'Bạc Liêu', 'voxel-countries' ),
					],
					'54' => [
						'name' => __( 'Bắc Giang', 'voxel-countries' ),
					],
					'53' => [
						'name' => __( 'Bắc Kạn', 'voxel-countries' ),
					],
					'56' => [
						'name' => __( 'Bắc Ninh', 'voxel-countries' ),
					],
					'50' => [
						'name' => __( 'Bến Tre', 'voxel-countries' ),
					],
					'04' => [
						'name' => __( 'Cao Bằng', 'voxel-countries' ),
					],
					'59' => [
						'name' => __( 'Cà Mau', 'voxel-countries' ),
					],
					'CT' => [
						'name' => __( 'Cần Thơ', 'voxel-countries' ),
					],
					'30' => [
						'name' => __( 'Gia Lai', 'voxel-countries' ),
					],
					'03' => [
						'name' => __( 'Hà Giang', 'voxel-countries' ),
					],
					'63' => [
						'name' => __( 'Hà Nam', 'voxel-countries' ),
					],
					'HN' => [
						'name' => __( 'Hà Nội', 'voxel-countries' ),
					],
					'15' => [
						'name' => __( 'Hà Tây', 'voxel-countries' ),
					],
					'23' => [
						'name' => __( 'Hà Tĩnh', 'voxel-countries' ),
					],
					'14' => [
						'name' => __( 'Hòa Bình', 'voxel-countries' ),
					],
					'66' => [
						'name' => __( 'Hưng Yên', 'voxel-countries' ),
					],
					'61' => [
						'name' => __( 'Hải Dương', 'voxel-countries' ),
					],
					'HP' => [
						'name' => __( 'Hải Phòng', 'voxel-countries' ),
					],
					'73' => [
						'name' => __( 'Hậu Giang', 'voxel-countries' ),
					],
					'SG' => [
						'name' => __( 'Hồ Chí Minh', 'voxel-countries' ),
					],
					'34' => [
						'name' => __( 'Khánh Hòa', 'voxel-countries' ),
					],
					'47' => [
						'name' => __( 'Kiên Giang', 'voxel-countries' ),
					],
					'28' => [
						'name' => __( 'Kon Tum', 'voxel-countries' ),
					],
					'01' => [
						'name' => __( 'Lai Châu', 'voxel-countries' ),
					],
					'41' => [
						'name' => __( 'Long An', 'voxel-countries' ),
					],
					'02' => [
						'name' => __( 'Lào Cai', 'voxel-countries' ),
					],
					'35' => [
						'name' => __( 'Lâm Đồng', 'voxel-countries' ),
					],
					'09' => [
						'name' => __( 'Lạng Sơn', 'voxel-countries' ),
					],
					'67' => [
						'name' => __( 'Nam Định', 'voxel-countries' ),
					],
					'22' => [
						'name' => __( 'Nghệ An', 'voxel-countries' ),
					],
					'18' => [
						'name' => __( 'Ninh Bình', 'voxel-countries' ),
					],
					'36' => [
						'name' => __( 'Ninh Thuận', 'voxel-countries' ),
					],
					'68' => [
						'name' => __( 'Phú Thọ', 'voxel-countries' ),
					],
					'32' => [
						'name' => __( 'Phú Yên', 'voxel-countries' ),
					],
					'24' => [
						'name' => __( 'Quảng Bình', 'voxel-countries' ),
					],
					'27' => [
						'name' => __( 'Quảng Nam', 'voxel-countries' ),
					],
					'29' => [
						'name' => __( 'Quảng Ngãi', 'voxel-countries' ),
					],
					'13' => [
						'name' => __( 'Quảng Ninh', 'voxel-countries' ),
					],
					'25' => [
						'name' => __( 'Quảng Trị', 'voxel-countries' ),
					],
					'52' => [
						'name' => __( 'Sóc Trăng', 'voxel-countries' ),
					],
					'05' => [
						'name' => __( 'Sơn La', 'voxel-countries' ),
					],
					'21' => [
						'name' => __( 'Thanh Hóa', 'voxel-countries' ),
					],
					'20' => [
						'name' => __( 'Thái Bình', 'voxel-countries' ),
					],
					'69' => [
						'name' => __( 'Thái Nguyên', 'voxel-countries' ),
					],
					'26' => [
						'name' => __( 'Thừa Thiên–Huế', 'voxel-countries' ),
					],
					'46' => [
						'name' => __( 'Tiền Giang', 'voxel-countries' ),
					],
					'51' => [
						'name' => __( 'Trà Vinh', 'voxel-countries' ),
					],
					'07' => [
						'name' => __( 'Tuyên Quang', 'voxel-countries' ),
					],
					'37' => [
						'name' => __( 'Tây Ninh', 'voxel-countries' ),
					],
					'49' => [
						'name' => __( 'Vĩnh Long', 'voxel-countries' ),
					],
					'70' => [
						'name' => __( 'Vĩnh Phúc', 'voxel-countries' ),
					],
					'06' => [
						'name' => __( 'Yên Bái', 'voxel-countries' ),
					],
					'71' => [
						'name' => __( 'Điện Biên', 'voxel-countries' ),
					],
					'DN' => [
						'name' => __( 'Đà Nẵng', 'voxel-countries' ),
					],
					'33' => [
						'name' => __( 'Đắk Lắk', 'voxel-countries' ),
					],
					'72' => [
						'name' => __( 'Đắk Nông', 'voxel-countries' ),
					],
					'39' => [
						'name' => __( 'Đồng Nai', 'voxel-countries' ),
					],
					'45' => [
						'name' => __( 'Đồng Tháp', 'voxel-countries' ),
					],
				]
			],
			'VU' => [
				'code3' => 'VUT',
				'name' => __( 'Vanuatu', 'voxel-countries' ),
				'continent' => 'Oceania',
				'states' => [
					'MAP' => [
						'name' => __( 'Malampa', 'voxel-countries' ),
					],
					'PAM' => [
						'name' => __( 'Pénama', 'voxel-countries' ),
					],
					'SAM' => [
						'name' => __( 'Sanma', 'voxel-countries' ),
					],
					'SEE' => [
						'name' => __( 'Shéfa', 'voxel-countries' ),
					],
					'TAE' => [
						'name' => __( 'Taféa', 'voxel-countries' ),
					],
					'TOB' => [
						'name' => __( 'Torba', 'voxel-countries' ),
					],
				]
			],
			'WF' => [
				'code3' => 'WLF',
				'name' => __( 'Wallis and Futuna', 'voxel-countries' ),
				'continent' => 'Oceania',
				'states' => [],
			],
			'WS' => [
				'code3' => 'WSM',
				'name' => __( 'Samoa', 'voxel-countries' ),
				'continent' => 'Oceania',
				'states' => [
					'AA' => [
						'name' => __( 'A\'ana', 'voxel-countries' ),
					],
					'AL' => [
						'name' => __( 'Aiga-i-le-Tai', 'voxel-countries' ),
					],
					'AT' => [
						'name' => __( 'Atua', 'voxel-countries' ),
					],
					'FA' => [
						'name' => __( 'Fa\'asaleleaga', 'voxel-countries' ),
					],
					'GE' => [
						'name' => __( 'Gaga\'emauga', 'voxel-countries' ),
					],
					'GI' => [
						'name' => __( 'Gagaifomauga', 'voxel-countries' ),
					],
					'PA' => [
						'name' => __( 'Palauli', 'voxel-countries' ),
					],
					'SA' => [
						'name' => __( 'Satupa\'itea', 'voxel-countries' ),
					],
					'TU' => [
						'name' => __( 'Tuamasaga', 'voxel-countries' ),
					],
					'VF' => [
						'name' => __( 'Va\'a-o-Fonoti', 'voxel-countries' ),
					],
					'VS' => [
						'name' => __( 'Vaisigano', 'voxel-countries' ),
					],
				]
			],
			'XK' => [
				'code3' => 'KOS',
				'name' => __( 'Republic of Kosovo', 'voxel-countries' ),
				'continent' => 'Europe',
				'states' => [],
			],
			'YE' => [
				'code3' => 'YEM',
				'name' => __( 'Yemen', 'voxel-countries' ),
				'continent' => 'Asia',
				'states' => [
					'AD' => [
						'name' => __( '\'Adan', 'voxel-countries' ),
					],
					'AM' => [
						'name' => __( '\'Amrān', 'voxel-countries' ),
					],
					'AB' => [
						'name' => __( 'Abyān', 'voxel-countries' ),
					],
					'BA' => [
						'name' => __( 'Al Bayḑā\'', 'voxel-countries' ),
					],
					'JA' => [
						'name' => __( 'Al Jawf', 'voxel-countries' ),
					],
					'MR' => [
						'name' => __( 'Al Mahrah', 'voxel-countries' ),
					],
					'MW' => [
						'name' => __( 'Al Maḩwīt', 'voxel-countries' ),
					],
					'HU' => [
						'name' => __( 'Al Ḩudaydah', 'voxel-countries' ),
					],
					'DA' => [
						'name' => __( 'Aḑ Ḑāli\'', 'voxel-countries' ),
					],
					'DH' => [
						'name' => __( 'Dhamār', 'voxel-countries' ),
					],
					'IB' => [
						'name' => __( 'Ibb', 'voxel-countries' ),
					],
					'LA' => [
						'name' => __( 'Laḩij', 'voxel-countries' ),
					],
					'MA' => [
						'name' => __( 'Ma\'rib', 'voxel-countries' ),
					],
					'RA' => [
						'name' => __( 'Raymah', 'voxel-countries' ),
					],
					'SH' => [
						'name' => __( 'Shabwah', 'voxel-countries' ),
					],
					'TA' => [
						'name' => __( 'Tā‘izz', 'voxel-countries' ),
					],
					'SA' => [
						'name' => __( 'Şan‘ā\'', 'voxel-countries' ),
					],
					'SN' => [
						'name' => __( 'Şan‘ā\'', 'voxel-countries' ),
					],
					'SD' => [
						'name' => __( 'Şā‘dah', 'voxel-countries' ),
					],
					'HJ' => [
						'name' => __( 'Ḩajjah', 'voxel-countries' ),
					],
					'HD' => [
						'name' => __( 'Ḩaḑramawt', 'voxel-countries' ),
					],
				]
			],
			'YT' => [
				'code3' => 'MYT',
				'name' => __( 'Mayotte', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [],
			],
			'ZA' => [
				'code3' => 'ZAF',
				'name' => __( 'South Africa', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'EC' => [
						'name' => __( 'Eastern Cape', 'voxel-countries' ),
					],
					'FS' => [
						'name' => __( 'Free State', 'voxel-countries' ),
					],
					'GT' => [
						'name' => __( 'Gauteng', 'voxel-countries' ),
					],
					'NL' => [
						'name' => __( 'KwaZulu-Natal', 'voxel-countries' ),
					],
					'LP' => [
						'name' => __( 'Limpopo', 'voxel-countries' ),
					],
					'MP' => [
						'name' => __( 'Mpumalanga', 'voxel-countries' ),
					],
					'NW' => [
						'name' => __( 'North West', 'voxel-countries' ),
					],
					'NC' => [
						'name' => __( 'Northern Cape', 'voxel-countries' ),
					],
					'WC' => [
						'name' => __( 'Western Cape', 'voxel-countries' ),
					],
				]
			],
			'ZM' => [
				'code3' => 'ZMB',
				'name' => __( 'Zambia', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'02' => [
						'name' => __( 'Central', 'voxel-countries' ),
					],
					'08' => [
						'name' => __( 'Copperbelt', 'voxel-countries' ),
					],
					'03' => [
						'name' => __( 'Eastern', 'voxel-countries' ),
					],
					'04' => [
						'name' => __( 'Luapula', 'voxel-countries' ),
					],
					'09' => [
						'name' => __( 'Lusaka', 'voxel-countries' ),
					],
					'06' => [
						'name' => __( 'North-Western', 'voxel-countries' ),
					],
					'05' => [
						'name' => __( 'Northern', 'voxel-countries' ),
					],
					'07' => [
						'name' => __( 'Southern', 'voxel-countries' ),
					],
					'01' => [
						'name' => __( 'Western', 'voxel-countries' ),
					],
				]
			],
			'ZW' => [
				'code3' => 'ZWE',
				'name' => __( 'Zimbabwe', 'voxel-countries' ),
				'continent' => 'Africa',
				'states' => [
					'BU' => [
						'name' => __( 'Bulawayo', 'voxel-countries' ),
					],
					'HA' => [
						'name' => __( 'Harare', 'voxel-countries' ),
					],
					'MA' => [
						'name' => __( 'Manicaland', 'voxel-countries' ),
					],
					'MC' => [
						'name' => __( 'Mashonaland Central', 'voxel-countries' ),
					],
					'ME' => [
						'name' => __( 'Mashonaland East', 'voxel-countries' ),
					],
					'MW' => [
						'name' => __( 'Mashonaland West', 'voxel-countries' ),
					],
					'MV' => [
						'name' => __( 'Masvingo', 'voxel-countries' ),
					],
					'MN' => [
						'name' => __( 'Matabeleland North', 'voxel-countries' ),
					],
					'MS' => [
						'name' => __( 'Matabeleland South', 'voxel-countries' ),
					],
					'MI' => [
						'name' => __( 'Midlands', 'voxel-countries' ),
					],
				]
			],
		];

		return apply_filters( 'voxel/data/countries', $list );
	}
}
