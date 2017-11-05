// Address Type Sub
var addressSub = {
	"avenue": "ave",
	"road": "rd",
	"street": "st",
	"drive": "dr",
	"crescent": "cres",
	"boulevard": "boul"
}


function spinSearch(){
	search = $("#search-button")

	search.removeClass("fa-search")
	search.addClass("fa-spinner fa-spin")
}

function spinStop(){
	search = $("#search-button")

	search.removeClass("fa-spinner fa-spin");
	search.addClass("fa-search");
}


function searchGeoOttawa(){

		$("#results").empty();

		var data = $("#pin").val(),
		address = $("#address_name").val().toUpperCase();

		if( address[address.length-1] === "."){
			address = address.slice(0, -1);
		}

		for (var i in addressSub){
			address = address.replace(i.toUpperCase() , addressSub[i].toUpperCase())
		}


		//Append Table
		// $("#results").append("<table id='rtable' class='table'><thead><tr><th>Address</th><th>Pin#</th><th>Zoning</th><th>Ward</th></tr></thead><tbody id='resultbody'></tbody></table>");

		// Determine if search for pin or address by checking if number
		// If number that means pin
		var points = [];

		if( isNaN(address) == false){
			var feature = pinSearch(address)

			for ( var i = 0; i < feature.length; i++){
				var pin = feature[i].attributes.PIN_NUMBER,
				zoning = zoningLookUp(0,0, feature[i].geometry),
				zoneCode = zoning.ZONE_CODE,
				zoningLink = zoning.URL,
				ward = feature[i].attributes.WARD,
				fulladdress = feature[i].attributes.ADDRESS_NUMBER + ' ' + feature[i].attributes.ROAD_NAME + ' ' + feature[i].attributes.SUFFIX + ' ' + ( (feature[i].attributes.DIR == null ) ? '' : feature[i].attributes.DIR);


				$("#resultbody").append("<tr><td>" + fulladdress + "</td><td>" + pin + "</td><td><a href='http://www.ottawa.ca" + zoningLink +"' target='_blank'>"+ zoneCode + "</a></td><td>" + ward + "</td></tr>")
			}

		} else {
			var feature = addressSearch(address)
			for (var i = 0; i < feature.length; i++){


				var fulladdress = feature[i].address;
				// pin = pinGeoLookUp(feature[i].x, feature[i].y)[0].attributes.PIN_NUMBER;

				// ward = feature[i].attributes.WARD,
				// id = feature[i].attributes.Ref_ID;

				// Add Points to dict for mapping
				// var point = { "coordinates" : [feature[i].x, feature[i].y], "fullAddress": fulladdress, "zoning": zoneCode, "zoneLink": zoningLink, "ward": ward };
				if( feature[i].attributes.Loc_name == "Address"){
					var zoning = zoningLookUp(feature[i].location.x, feature[i].location.y, ''),
					zoneCode = zoning.ZONE_CODE,
					zoningLink = zoning.URL;
					console.log("zoning")
					console.log(zoning)
					var point = { "coordinates" : [feature[i].location.x, feature[i].location.y], "fullAddress": fulladdress, 'zoning': zoneCode, 'zoningLink': zoningLink }
					points.push(point);			
					
					// var address = "<div class='row address'><div class='col-md-12'><div class='row'><div class='col-md-12 h4'>"+ fulladdress + "</div></div><div classs='row'><div class='col-md-4'> Zoning: " + zoneCode + "</div></div></div><div class='row'><div class='col-md-12'><button class='btn btn-secondart pull-md-right'>Detail</button></div></div></div>"

					// $("#results").append(address)
				}



			
				// $("#resultbody").append("<tr><td>" + fulladdress + "</td><td>" + pin + "</td><td><a href='http://www.ottawa.ca" + zoningLink +"' target='_blank'>"+ zoneCode + "</a></td><td>" + ward + "</td></tr>")
			}

		}

		plotResults(points);

		map.invalidateSize();
	}

	//Iniate Search on submit
	$("#parcelSearch").submit(function(){

		event.preventDefault();

		spinSearch();

		setTimeout(function(){

			searchGeoOttawa();

			spinStop();

		}, 50)


		})


	// Ajax Query
	var query = function(url){

		var feature;

		$.ajax({
			url: url,
			type: "GET",
			success: function(results){

				feature = results;
				
			},
			error: function(err){
				$("#error").empty().append("<p>" + err.responseText + "</p>")
			},
			dataType: "JSON",
			async: false

		})

		return feature;
	}


	// address search
	var addressSearch = function(address){
		var url = "https://maps.ottawa.ca/arcgis/rest/services/compositeLocator/GeocodeServer/findAddressCandidates?SingleKey=" + address + "&State=&ZIP=&SingleLine=&category=&outFields=*&maxLocations=&outSR=&searchExtent=&location=&distance=&magicKey=&f=pjson"

		var feature = query(url);

		return feature.candidates
	}


	//Pin Search
	var pinGeoLookUp = function(x, y){

		var url = "http://maps.ottawa.ca/arcgis/rest/services/Property_Parcels/MapServer/2/query?where=&text=&objectIds=&time=&geometry=" + x + "," + y +"%0D%0A&geometryType=esriGeometryPoint&inSR=&spatialRel=esriSpatialRelWithin&relationParam=&outFields=ADDRESS_NUMBER%2CROAD_NAME%2CSUFFIX%2CPIN_NUMBER%2CADDRESS_TYPE_ID%2CADDRESS_STATUS%2COBJECTID%2CShape_Area&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=pjson";

		var get = query(url);

		return get
	}

	// External
	// http://maps.ottawa.ca/arcgis/rest/services/Property_Parcels/MapServer
	// Internal
	// http://geoservices/arcgis/rest/services/internal/Property_Parcels/MapServer

	var pinSearch = function(pin){

		var url = "http://maps.ottawa.ca/arcgis/rest/services/Property_Parcels/MapServer/2/query?where=PIN_NUMBER%3D%27" + pin + "%27&text=&objectIds=&time=&geometry=&geometryType=esriGeometryPoint&inSR=&spatialRel=esriSpatialRelWithin&relationParam=&outFields=ADDRESS_NUMBER%2CROAD_NAME%2CSUFFIX%2CPIN_NUMBER%2CADDRESS_TYPE_ID%2CADDRESS_STATUS%2COBJECTID%2CDIR &returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=pjson";

		var get = query(url);

		console.log(get);

		return get

	}


var zoningLookUp = function(x,y, geomtry){


		if (geomtry){
			console.log("geom")
			var url = "http://maps.ottawa.ca/arcgis/rest/services/Zoning/MapServer/3/query?where=&text=&objectIds=&time=&geometry=" + JSON.stringify(geomtry) + "&geometryType=esriGeometryPolygon&inSR=&spatialRel=esriSpatialRelWithin&relationParam=&outFields=ZONINGTYPE%2CZONE_CODE%2CZONE_MAIN%2CPIN%2C+URL+&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=pjson"

			var get = query(url);

		} else {
			var url = "http://maps.ottawa.ca/arcgis/rest/services/Zoning/MapServer/3/query?where=&text=&objectIds=&time=&geometry=" + x + ", " + y +"&geometryType=esriGeometryPoint&inSR=&spatialRel=esriSpatialRelWithin&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=pjson"
			console.log(url)
			var get = query(url);			
		}

		try{
			var attr = get.features[0].attributes
		} catch (err){
			var  attr = ''
		}		
		
		return attr	



	}

// External
//http://maps.ottawa.ca/arcgis/rest/services/Property_Parcels/MapServer

//////////////
// Base Maps

var road = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}),
googleSat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
}),
googleRoad = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
}),
topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	maxZoom: 17,
	attribution: 'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});


/////////////////////////////
// Layers

var roads = L.esri.dynamicMapLayer({
	url: "https://maps.ottawa.ca/arcgis/rest/services/Streets/MapServer/"
}),
cycling_existing = L.esri.featureLayer({
	url: "https://maps.ottawa.ca/arcgis/rest/services/CyclingMap/MapServer/3"
}),
cycling_mountain = L.esri.featureLayer({
	url: "https://maps.ottawa.ca/arcgis/rest/services/CyclingMap/MapServer/17",
	style: {"color": "orange"}
}),
cycling_winter = L.esri.featureLayer({
	url: "https://maps.ottawa.ca/arcgis/rest/services/CyclingMap/MapServer/4"
}),
wards = L.esri.featureLayer({
	url: "https://maps.ottawa.ca/arcgis/rest/services/Wards/MapServer/0"
}),
waterSewer = L.esri.dynamicMapLayer({
	url: "https://maps.ottawa.ca/arcgis/rest/services/WaterAndSewer/MapServer"
}),
zoningMap = L.esri.dynamicMapLayer({
	url: "https://maps.ottawa.ca/arcgis/rest/services/Zoning/MapServer",
	opacity: .7
}),
transit = L.esri.dynamicMapLayer({
	url: "https://maps.ottawa.ca/arcgis/rest/services/TransitServices/MapServer"
}),
trees = L.esri.featureLayer({
	url: "https://maps.ottawa.ca/arcgis/rest/services/Miscellaneous/MapServer/1",
	pointToLayer: function(geoJson, latlng) {
		var diameter = geoJson.properties.DBH / 100;
		return L.circle(latlng, {radius: diameter * 5, color: "#68B684"})
	}
	
}),
neighbourhoods = L.esri.featureLayer({
	url: "https://maps.ottawa.ca/arcgis/rest/services/Neighbourhoods/MapServer/1"
}),
hospitals = L.esri.featureLayer({
	url: "https://maps.ottawa.ca/arcgis/rest/services/Hospitals/MapServer/0",
	pointToLayer: function(geoJson, latlng){
		return L.marker(latlng, {
			icon: L.AwesomeMarkers.icon({
		        icon: 'h-square',
		        prefix: 'fa',
		        markerColor: 'red',
		        iconColor: '#fff'
		    })
	}).addTo(map)}
}),
schools = L.esri.featureLayer({
	url: "https://maps.ottawa.ca/arcgis/rest/services/Schools/MapServer/1",
	pointToLayer: function(geoJson, latlng){
		return L.marker(latlng, {
			icon: L.AwesomeMarkers.icon({
		        icon: 'graduation-cap',
		        prefix: 'fa',
		        markerColor: 'purple',
		        iconColor: '#fff'
		    })
	}).addTo(map)}
}),
artsandculture = L.esri.featureLayer({
	url: "https://maps.ottawa.ca/arcgis/rest/services/City_Facilities/MapServer/0",
	pointToLayer: function(geoJson, latlng){
		return L.marker(latlng, {
			icon: L.AwesomeMarkers.icon({
				icon: 'language',
				prefix: 'fa',
				markerColor: 'red',
				iconColor: '#fff'
			})
		})
	}
}),
recreation = L.esri.featureLayer({
	url: "https://maps.ottawa.ca/arcgis/rest/services/City_Facilities/MapServer/5",
	pointToLayer: function(geoJson, latlng){
		return L.marker(latlng, {
			icon: L.AwesomeMarkers.icon({
				icon: 'building',
				prefix: 'fa',
				markerColor: 'purple',
				iconColor: "#fff"
			})
		})
	}
}),
developmentApps = L.esri.featureLayer({
	url: "https://maps.ottawa.ca/arcgis/rest/services/Development_Applications/MapServer/0",
	pointToLayer: function(geoJson, latlng){
	return L.marker(latlng, {
		icon: L.AwesomeMarkers.icon({
			icon: 'bullhorn',
			prefix: 'fa',
			markerColor: 'purple',
			iconColor: "#fff"
		})
	})
	}
}),
censusTracts = L.esri.featureLayer({
	url: "http://maps.ottawa.ca/arcgis/rest/services/AdministrativeAreas/MapServer/4"
})
/////////////////////////////////////
// PopUps

wards.bindPopup(function(feature){
	var feature = feature.feature.properties

	var body = "\
	<div class='container-fluid'>\
		<div class='row'>\
			<div class='col-md-5'>Ward</div>\
			<div class='col-md-7'>" +
				feature.WARD_EN +
			"</div>\
		</div>\
		<div class='row'>\
			<div class='col-md-5'>Councillor</div>\
			<div class='col-md-7'>" +
				feature.COUNCILLOR + 
			"</div>\
		</div>\
		<div class='row'>\
			<div class='col-md-5'>Ward Website</div>\
			<div class='col-md-7'>\
				<a href='" + feature.LINK_EN + "' target='_blank'>Link</a>\
			</div>\
		</div>\
	</div>"

	return body
})

hospitals.bindPopup(function(feature){
	console.log(feature.feature.properties)
	var feature = feature.feature.properties;
	var body = "<div class='row'><div class='col-md-12 h4'>" + feature.NAME + "</div></div>\
		<div class='row'><div class='col-md-12'>" + feature.ADDRESS + "</div></div>\
		<div class='row'><div class='col-md-12'><a href='" + feature.LINK_EN + "'>Website</a></div></div>\
	"

	return body
})

neighbourhoods.bindPopup(function(feature){
	return feature.feature.properties.NAMES
});

schools.bindPopup(function(feature){
	var feature = feature.feature.properties;
	var body = "<div class='row'><div class='col-md-12 h4'>" + feature.NAME +"</div></div>\
	<div class='row'><div class='col-md-12'>" + feature.NUM + " " + feature.STREET + "</div></div>\
	<div class='row'><div class='col-md-3'>Category</div><div class='col-md-9'>"+ feature.CATEGORY + "</div></div>\
	<div class='row'><div class='col-md-3'>Board</div><div class='col-md-9'>" + feature.FULL_BOARD +"</div></div>"
	return body
})

trees.bindPopup(function(featureLayer){
	var results = featureLayer.feature.properties;
	return "<div class='container popup'><div class='row'><div class='col-md-5'>Species</div><div class='col-md-7'>" + results['SPECIES'] + "</div></div><div class='row'><div class='col-md-5'>Diameter (cm)</div><div class='col-md-7'>" + results['DBH'] + "</div></div><div class='row'><div class='col-md-5'>Trunk Structure</div><div class='col-md-7'>" + results['TRUNCSTRCT'] + "</div></div></div>" ;
});

artsandculture.bindPopup(function(feature){
	var feature = feature.feature.properties;
	var body = '<div class="container"><div class="row"><div class="col-md-12"><h4>' + feature.BUSINESS_ENTITY_DESC + '</h4></div></div>\
	<div class="row"><div class="col-md-12">' + feature.BUILDING_TYPE + '</div></div></div>\
	'
	return body
})

recreation.bindPopup(function(feature){
	var feature = feature.feature.properties;
	var body = '<div class="row"><div class="col-md-12">' + feature.BUSINESS_ENTITY_DESC + '</div></div>\
	<div class="row"><div class="col-md-12">' + feature.BUILDING_TYPE + '</div></div>\
	'
	return body
})

developmentApps.bindPopup(function(feature){
	var feature = feature.feature.properties;

	var body = '<div class="container"><div class="row"><div class="col-md-12"><h4>' + feature.APPLICATION_TYPE_EN + '<h4></div></div>\
	<div class="row"><div class="col-md-12"><p>Address: ' + feature.ADDRESS_NUMBER_ROAD_NAME + '</br>Application # ' + feature.APPLICATION_NUMBER + '</p></div></div></div>'

	return body
})

// censusTracts.on("click", function(e){
// 	console.log(e);
// })

censusTracts.bindPopup(function(feature){

	var feature = feature.feature.properties;

	var body;

	body = "<div id='popup'>hi</div>"

	// makeChart(feature.CTUID, feature.CTNAME)

	return body
}, {minWidth: 400, maxHeight: 500})

censusTracts.on('click', function(e){

	var feature = e.layer.feature.properties
	var element = document.getElementsByClassName("leaflet-popup-content")[0];
	console.log(element)

	var test = document.createElement("canvas")
	var node = document.createTextNode("text")
	test.id = "chart"
	test.width = "100"
	test.height= "50"

	test.appendChild(node)

	element.appendChild(test)

	console.log(feature)

	makeChart(feature.CTUID, feature.CTNAME)

})

var makeChart = function(geo_code, ctname){

	var stats,
	filterColumns = [
        "0 to 4 years", 
        "5 to 9 years",
        "10 to 14 years",
        "15 to 19 years",
        "20 to 24 years",
        "25 to 29 years",
        "30 to 34 years",
        "35 to 39 years",
        "40 to 44 years",
        "45 to 49 years",
        "50 to 54 years",
        "55 to 59 years",
        "60 to 64 years",
        "65 to 69 years",
        "70 to 74 years",
        "75 to 79 years",
        "80 to 84 years",
        "85 years and over",
        ]	

	var element = document.getElementsByClassName("leaflet-popup-content")[0];
	element.width = "300px"
	element.height = "200px"
	console.log(element)

	var test = document.createElement("p")
	var node = document.createTextNode("text")
	test.id = 'chart'

	test.appendChild(node)

	element.appendChild(test)

	console.log(test)

	var ctx = document.getElementById('chart'),
	// var ctx = document.getElementsByClassName("leaflet-popup-content")[0],
	topic = 'Age characteristics'

    var url = "http://localhost/api/census-by-tract/?geo_code=" + geo_code + "&topic=" + topic,
    chart,
    cChart;

    console.log(url);

      // Get Ward
    $.ajax({
      url: url,
      type: 'get',
      success: function(data){
        chart = data
      },
      error: function(err){
        console.error(err)
      },
      async: false
    })    


    var cleaned = [];

    // Put all the data in a format for the chart to easily digest
    for (var i = 0 ; i < chart.length; i++){
      var check = filterColumns.indexOf(chart[i].characteristic);


      if (check >= 0){
        cleaned.push(chart[i].total);        
      }
    }

    // If filter columns is empty grab all topic columns
    if (!filterColumns){
      filterColumns = [];

      for (var i = 0; i < chart.length; i++){

        var characteristic = chart[i].characteristic,
        total = characteristic.includes("Total"),
        percent = characteristic.includes("%"),
        median = characteristic.includes("Median");

        if( total == false && percent == false && median == false){
          filterColumns.push(chart[i].characteristic)
          cleaned.push(chart[i].total)
        }
      }
    }


    if (cChart){

      cChart.data.labels = filterColumns;
      cChart.data.datasets[0].data = cleaned;
      cChart.data.datasets.splice(1,1)
      cChart.update();
    } else{

      try{
        cChart = new Chart(ctx, {
                type: "line",
                fill: false,
                data: {
                  labels: filterColumns,
                  datasets: [{
                    label: "total",
                    fill: false,
                    backgroundColor: "#B75D69",
                    borderWidth: 3,
                    borderColor: "#D72638",
                    data: cleaned,
                  }]
                },
                options: {
                  legend: {
                    display: false
                  },
                  scales: {
                    yAxes:[{
                      ticks: {
                        beginAtZero: true
                      },
                    }]
                  },
                   // Container for pan options
            pan: {
                // Boolean to enable panning
                enabled: true,

                // Panning directions. Remove the appropriate direction to disable 
                // Eg. 'y' would only allow panning in the y direction
                mode: 'xy'
            },

            // Container for zoom options
            zoom: {
                // Boolean to enable zooming
                enabled: true,

                // Zooming directions. Remove the appropriate direction to disable 
                // Eg. 'y' would only allow zooming in the y direction
                mode: 'x',
            }
                }
              })  
      } catch (e){
        console.error(e)
      }
            
    }



}

////////////
// Overlays


var baseMaps = {"Road": road, "ESRI": googleRoad, "Satellite": googleSat, "Topographic": topo};


var groupedOverlays = {
	"Property": {
		"Streets": roads, 
 		"Zoning": zoningMap,
		'Wards': wards,  		
 		"Neighbourhoods": neighbourhoods
	},
	"Facilities": {
		"Hospitals": hospitals, 
		"Schools": schools,
		"Arts and Culture": artsandculture,		
		"Recreation": recreation
	},
	"Cycling": {
		"Existing": cycling_existing,
		"Mountain Bike": cycling_mountain,
		"Winter": cycling_winter
	},
	"Misc":{
		"Transit": transit,
 		'Sewer and Water': waterSewer, 
		"Trees": trees,
		"Development_Applications": developmentApps,
		"Census": censusTracts
	}
}

var map = L.map('map', {
	layers: [road]
}).setView( [45.416667, -75.7], 15);

map.scrollWheelZoom.disable()

L.control.groupedLayers(baseMaps, groupedOverlays).addTo(map);

L.control.zoomBox({
	modal: true
}).addTo(map);

var points;


var getCurrentLocation = function(position){

    points = L.featureGroup().addTo(map);

	var startPos;
	var geoSuccess = function(position){

    	// try{
    	// 	console.log("remove")
	    // 	map.removeLayer(points)
    	// } catch(err){
    	// 	console.error(err)
    	// }
		startPos = position;
		var lat = position.coords.latitude,
		lng = position.coords.longitude;
		var marker = L.marker([lat, lng]);

		points.addLayer(marker)

		map.fitBounds(points.getBounds());
	}

	if (navigator.geolocation){
		try{
			navigator.geolocation.getCurrentPosition(geoSuccess);

		} catch(err){
			console.error(err)
		}
	} else{
		console.log("no geo");
	}
}

function plotResults(markers){

	try{
		console.log("remove")
    	map.removeLayer(points)
	} catch(err){
		console.error(err)
	}


    points = L.featureGroup().addTo(map);

		for( var i = 0; i < markers.length; i++){

   		//Convert the coords
   		var fromCoords = new proj4.Proj('EPSG:3857');

   		var toCoords = new proj4.Proj('EPSG:4326')

   		var output = proj4(fromCoords, toCoords, markers[i].coordinates )

   		var latlng = [output[1], output[0]];

   		marker = L.marker(latlng);
   		 marker.bindPopup(
            "<div class='row'><div class='col-md-12'><h4>" + markers[i]["fullAddress"] +"</h4></div></div><div class='row'><table class='table'><tr></tr>\
            <tr><td>Zoning</td><td><a href='http://www.ottawa.ca/" + markers[i]["zoningLink"] +"' target='_blank'>" +markers[i]["zoning"] + "</a></td></tr>\
            <tr></tr>\
            </table></div>", markers[i]);

   		points.addLayer(marker);

		}	

		// halfMap();

		map.fitBounds(points.getBounds());
    }



var halfMap = function(){ 
	$("#result-container").removeClass("hidden").show();
	$("#result-container").addClass("col-md-6"); 	
	$("#map-container").addClass("col-md-6"); 
	$("#map-container").removeClass("col-md-12", {duration: 2000});
}

var fullMap = function(){ 
	$("#result-container").addClass("hidden").hide();
	$("#map-container").addClass("col-md-12"); 
	$("#map-container").removeClass("col-md-6");
}


