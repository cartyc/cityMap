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
				// var zoning = zoningLookUp(feature[i].x, feature[i].y),
				// zoneCode = zoning.ZONE_CODE,
				// zoningLink = zoning.URL,
				// ward = feature[i].attributes.WARD,
				id = feature[i].attributes.Ref_ID;

				// Add Points to dict for mapping
				// var point = { "coordinates" : [feature[i].x, feature[i].y], "fullAddress": fulladdress, "zoning": zoneCode, "zoneLink": zoningLink, "ward": ward };
				if( feature[i].attributes.Loc_name == "Address"){
					var point = { "coordinates" : [feature[i].location.x, feature[i].location.y], "fullAddress": fulladdress }
					points.push(point);			
					
					// var address = "<div class='row address' id='" + id + "'><div class='col-md-12'><div class='row'><div class='col-md-12 h4'>"+ fulladdress + "</div></div><div classs='row'><div class='col-md-4'> Zoning: " + zoneCode + "</div><div class='col-md-4'> Ward # " + ward + "</div></div></div><div class='row'><div class='col-md-12'><button class='btn btn-secondart pull-md-right' onClick='propertyModal(" + id + ")'>Detail</button></div></div></div>"

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
				console.log(results)
				feature = results.candidates;
				
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

		return feature
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

		console.log(x,y);
		console.log(geomtry);

		if (geomtry){
			console.log("geom")
			var url = "http://maps.ottawa.ca/arcgis/rest/services/Zoning/MapServer/3/query?where=&text=&objectIds=&time=&geometry=" + JSON.stringify(geomtry) + "&geometryType=esriGeometryPolygon&inSR=&spatialRel=esriSpatialRelWithin&relationParam=&outFields=ZONINGTYPE%2CZONE_CODE%2CZONE_MAIN%2CPIN%2C+URL+&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=pjson"

			var get = query(url);

		} else {
			var url = "http://maps.ottawa.ca/arcgis/rest/services/Zoning/MapServer/3/query?where=&text=&objectIds=&time=&geometry=" + x + "," + y +"&geometryType=esriGeometryPoint&inSR=&spatialRel=esriSpatialRelWithin&relationParam=&outFields=ZONINGTYPE%2CZONE_CODE%2CZONE_MAIN%2CPIN%2C+URL+&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=pjson"
			var get = query(url);			
		}


		try{
			var attr = get[0].attributes
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
	var body = '<div class="row"><div class="col-md-21">' + feature.BUSINESS_ENTITY_DESC + '</div></div>\
	<div class="row"><div class="col-md-21">' + feature.BUILDING_TYPE + '</div></div>\
	'
	return body
})

recreation.bindPopup(function(feature){
	var feature = feature.feature.properties;
	var body = '<div class="row"><div class="col-md-21">' + feature.BUSINESS_ENTITY_DESC + '</div></div>\
	<div class="row"><div class="col-md-21">' + feature.BUILDING_TYPE + '</div></div>\
	'
	return body
})

developmentApps.bindPopup(function(feature){
	var feature = feature.feature.properties;

	var body = '<div class="container"><div class="row"><div class="col-md-21"><h2>' + feature.APPLICATION_TYPE_EN + '<h2></div></div>\
	<div class="row"><div class="col-md-12"><p>' + feature.ADDRESS_NUMBER_ROAD_NAME + '</p><p>' + feature.APPLICATION_NUMBER + '</p></div></div></div>'

	return body
})
////////////
// Overlays


var baseMaps = {"Road": road, "Google Road": googleRoad, "Google Sat": googleSat};


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
		"Development_Applications": developmentApps
	}
}

var map = L.map('map', {
	layers: [road]
}).setView( [45.416667, -75.7], 15);

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
            "<div class='row'><div class='col-md-12'><h4>" + markers[i]["fullAddress"] +"</h4></div></div><div class='row'><table class='table'><tr><td>Pin</td><td>" + markers[i]["pin"] +"</td></tr>\
            <tr><td>Zoning</td><td><a href='http://www.ottawa.ca" + markers[i]["zoneLink"] +"' target='_blank'>" +markers[i]["zoning"] + "</a></td></tr>\
            <tr><td>Ward</td><td>" + markers[i]["ward"] +"</td></tr>\
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


// L.Control.Contract = L.Control.extend({
// 	_active: false,
// 	options: {
// 		position: "topleft",
// 		modal: true,
// 		className: 'leaflet-expand-icon collapse',
// 		title: "shrink map"
// 	},
// 	onAdd: function(map){
// 		// console.log(map)
// 		this._map = map;
// 		this._container = L.DomUtil.create('div', 'leaflet-zoom-box-control leaflet-bar');
// 		this._container.title = this.options.title;

// 		var link = L.DomUtil.create('a', this.options.className, this._container);
// 		link.href="#";

// 		L.DomEvent
// 			.on(this._container, 'click', function(){

// 					if (this._active){
// 						this._active = false;
// 						fullMap();
// 						// L.DomUtil.removeClass(this._container, 'expand')
// 						// L.DomUtil.addClass(this._container, 'collapse')
// 						map.invalidateSize();
// 					} else{
// 						halfMap();
// 						this._active = true;
// 						L.DomUtil.removeClass(this._container, 'collapse')
// 						L.DomUtil.addClass(this._container, 'expand')
// 						map.invalidateSize();
// 					}
// 				}, this);

// 		return this._container;
// 	},
// 	activate: function(){
// 		this._active = false
// 		L.DomUtil.removeClass(this._container, 'expand')
// 		L.DomUtil.addClass(this._container, 'collapse')
// 		map.invalidateSize();
// 	}
// })

// L.Control.contract = function(options){
// 	return new L.Control.Contract(options);
// }

// L.Control.contract().addTo(map);
