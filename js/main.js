		var geojson;

		var map;

		var colorIndex = 0;

		var DEFAULT_COLOR = '#444444';

		var date;

		var waterData;

		var currentState;

		var stateLevel = true;

		var RAW = 0;

		var dataType;

		var colorArray = [
			'#D1000F',
			'#C0001A',
			'#B00126',
			'#A00231',
			'#8F033D',
			'#7F0448',
			'#6F0454',
			'#5E055F',
			'#4E066B',
			'#3E0776',
			'#2E0882'];

		function getPickerDate() {
			var catDate = "";
			catDate += $('#yeardropdown').val();
			catDate += "-";
			catDate += $('#monthdropdown').val();
			catDate += "-"
			var day = $('#daydropdown').val();
			if (day.length == 1) {
				day = "0" + day;
			}
			catDate += day;
			catDate += "T00:00:00Z";
			return catDate;
		}

		function getMaxJSON(array, property) {
			var max;
			for (var i = 0; i < arr.length; i++) {
				if (!max || parseInt(array[i][property]) > max) {
					max = array[i][property];
				}
			}
			return max;
		}

		function getMinJSON(array, property) {
			var min;
			for (var i = 0; i < arr.length; i++) {
				if (!min || parseInt(array[i][property]) < min) {
					max = array[i][property];
				}
			}
			return min;
		}

		function style(feature) {
			if (stateLevel == true) {
				var id = feature.properties.STATE;
				return {
					fillColor: colorLogicState(id, date),
					weight: 1,
					opacity: 0.7,
					color: 'white',
					dashArray: '3',
					fillOpacity: 0.7
				};
			} else {
				var id = "" + feature.properties.STATE + feature.properties.COUNTY;
				return {
					fillColor: colorLogicCounty(id, date),
					weight: 1,
					opacity: 0.7,
					color: 'white',
					dashArray: '3',
					fillOpacity: 0.7
				};
			}
		}

		function colorLogicCounty(countyID, date) {
			var key = "";
			var colorHex;
			console.log("county color");
			//if (storeJSON[date].Value) {
			if (waterData[date][countyID]) {
				//colorHex = pickColor(storeJSON[date].Value);
				console.log(waterData[date][countyID]);
				console.log("COUNTY ID: " + countyID);
				colorHex = pickColor(waterData[date][countyID]);
			} else {
				colorHex = DEFAULT_COLOR;
			}

			return colorHex;
			
		}

		function colorLogicState(stateID, date) {
			var key = "";
			//console.log("State ID: " + stateID);
			var colorHex;		
			if (waterData[date][stateID]) {
				//console.log("value: " + waterData[date][stateID]);

				colorHex = pickColor(waterData[date][stateID]);
			} else {
				colorHex = DEFAULT_COLOR;
			}

			return colorHex;
			
		}

		// dataURL is a url to a JSON object
		// Date is a date. Format to follow
		/*
		function connectData(dataURL) {
			$.getJSON(dataURL, function(data) {
				//date = date + "T00:00:00Z";
				storeJSON = data;

			});
		}
		*/

		function highlightFeature(e) {
			var layer = e.target;
			layer.setStyle({
				weight: 2,
				color: '#F00',
				fillOpacity: 1.0
			});

			if (!L.Browser.ie && !L.Browser.opera) {
				layer.bringToFront();
			}
		}

		function resetHighlight(e) {
			geojson.resetStyle(e.target);
		}

		function zoomToFeature(e) {
			map.fitBounds(e.target.getBounds());
			console.log(e.target);
			currentState = e.target.feature.properties.STATE;
			
			if (currentState) {
				var countyURL = currentState + '.json';

				changeMapData(countyURL, countyURL, false, map);
				/*
				stateLevel = false; 

				$.getJSON('data/' + currentState + '.json', function(data) {
					waterData = data;
					var url = 'geoJson_by_state/' + currentState + '.json';
					console.log(url);
					console.log("parsing in state number: " + currentState);
					geojson.clearLayers();
					attachDataToMap(url, map);
				});
				*/
				
			}
		}

		function onEachFeature(feature, layer) {
			layer.on({
				mouseover: highlightFeature,
				mouseout: resetHighlight,
				click: zoomToFeature
			});
		}
		
		function attachDataToMap(geoURL, map) {
				var geoDirectory;

				if (stateLevel) {
					geoDirectory = "geojson/";
				} else {
					geoDirectory = "geojson/counties/";
				}

				$.getJSON(geoDirectory + geoURL, function(data) {
					geojson = L.geoJson(data, {
						style: style,
						onEachFeature: onEachFeature
					}).addTo(map);
				});	
		}

		function changeColorTest(geojson) {
			if (colorIndex >= colorArray.length || colorIndex < 0) {
				console.log("resetting index!");
				colorIndex = 0;
			}

			console.log("color is " + colorArray[colorIndex]);

			geojson.setStyle({
				fillColor: colorArray[colorIndex]
			});

			colorIndex++;
		}


		function pickColor(value) {
			// DUMMY VALUES, BETWEEN 0 AND 200
			var MEDIAN;
			var MAX;
			if (stateLevel) {
				var MEDIAN = 7000.0;
				var MAX = 100000.0;
			} else {
				var MEDIAN = 30.0;
				var MAX = 70.0;
			}
			
			if (value < MEDIAN) {
				var percent = value / MEDIAN;
				return getGradientColor('#ffffd9', '#41b6c4', percent);
			} else if (value > MEDIAN && value < MAX) {
				var percent = (value - MEDIAN) / (MAX - MEDIAN);
				return getGradientColor('#41b6c4', '#081d58', percent);
			} else {
				return "#081d58";
			}
		}

		// http://stackoverflow.com/a/27709336
		function getGradientColor(start_color, end_color, percent) {
			// strip the leading # if it's there
			start_color = start_color.replace(/^\s*#|\s*$/g, '');
			end_color = end_color.replace(/^\s*#|\s*$/g, '');

			// convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
			if(start_color.length == 3){
				start_color = start_color.replace(/(.)/g, '$1$1');
			}

			if(end_color.length == 3){
				end_color = end_color.replace(/(.)/g, '$1$1');
			}

			// get colors
			var start_red = parseInt(start_color.substr(0, 2), 16),
			start_green = parseInt(start_color.substr(2, 2), 16),
			start_blue = parseInt(start_color.substr(4, 2), 16);

			var end_red = parseInt(end_color.substr(0, 2), 16),
			end_green = parseInt(end_color.substr(2, 2), 16),
			end_blue = parseInt(end_color.substr(4, 2), 16);

			// calculate new color
			var diff_red = end_red - start_red;
			var diff_green = end_green - start_green;
			var diff_blue = end_blue - start_blue;

			diff_red = ( (diff_red * percent) + start_red ).toString(16).split('.')[0];
			diff_green = ( (diff_green * percent) + start_green ).toString(16).split('.')[0];
			diff_blue = ( (diff_blue * percent) + start_blue ).toString(16).split('.')[0];

			// ensure 2 digits by color
			if( diff_red.length == 1 )
				diff_red = '0' + diff_red

			if( diff_green.length == 1 )
				diff_green = '0' + diff_green

			if( diff_blue.length == 1 )
				diff_blue = '0' + diff_blue

			return '#' + diff_red + diff_green + diff_blue;
		};

		
		// Primary function to switch
		function changeMapData(dataURL, geoJsonURL, isStateLevel, map) {
			var dataSubfolder;
			date = getPickerDate();
			console.log(date);

			if (geojson) {
				geojson.clearLayers();
			}

			switch (dataType) {
				case RAW:
					dataSubfolder = "data/raw/";
					break;
				default:
					dataSubfolder = "data/raw/";
			}

			$.getJSON(dataSubfolder + dataURL, function(data) {
				waterData = data;
				stateLevel = isStateLevel;
				attachDataToMap(geoJsonURL, map);
			});
		}

		window.onload = function() {
			dataType = RAW;

			map = L.map('map').setView([39.52, -98.4], 5);

			L.tileLayer('https://{s}.tiles.mapbox.com/v4/samjabrahams.ln53g9ef/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoic2FtamFicmFoYW1zIiwiYSI6IlFYaEFqQWcifQ.wKho1oe6MY2xAtQ1uOYWrg').addTo(map);

			//omnivore.kml('test_kml.kml').addTo(map);		

			$('#remove').click(function() {
				geojson.clearLayers();
				setTimeout(function() {
					attachDataToMap('stateGeo.json', map)
				}, 4000 );
			});

			$('#color').click(function() {
				setInterval(function() {
					changeColorTest(geojson);
				}, 17);
			});

			$('#change').click(function() {
				if (stateLevel) {
					changeMapData('USA_old.json', 'stateGeo.json', true, map);
				} else {
					var countyURL = currentState + '.json';
					changeMapData(countyURL, countyURL, false, map);
				}
			});

			$('#btn-national').click(function() {
				changeMapData('USA_old.json', 'stateGeo.json', true, map);
				map.setView([39.52, -98.4], 5);
			});

			populatedropdown("daydropdown", "monthdropdown", "yeardropdown");

			var legend = L.control({position: 'bottomright'});

			legend.onAdd = function(map) {

				console.log("adding legend to map");

				var div = L.DomUtil.create('div', 'info legend'),
					grades = [0, 100, 500, 1000, 4000, 7000, 15000, 50000, 100000],
					labels = [];

				for (var i = 0; i < grades.length; i++) {
					div.innerHTML +=
					'<i style="background:' + pickColor(grades[i] + 1) + '"></i> ' +
					grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
				}

				return div;

			};

			legend.addTo(map);

			changeMapData('USA_old.json', 'stateGeo.json', true, map);
		}	