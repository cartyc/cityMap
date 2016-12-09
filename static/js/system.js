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



		//Append Table
		$("#results").append("<table id='rtable' class='table'><thead><tr><th>Address</th><th>Pin#</th><th>Zoning</th><th>Ward</th></tr></thead><tbody id='resultbody'></tbody></table>");

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
				var fulladdress = feature[i].attributes.FULLADDR,
				pin = feature[i].attributes.PIN_NUMBER;
				var pin = pinGeoLookUp(feature[i].geometry.x, feature[i].geometry.y)
				var zoning = zoningLookUp(feature[i].geometry.x, feature[i].geometry.y),
				zoneCode = zoning.ZONE_CODE,
				zoningLink = zoning.URL,
				ward = feature[i].attributes.WARD;

				// Add Points to dict for mapping
				var point = { "coordinates" : [feature[i].geometry.x, feature[i].geometry.y], "fullAddress": fulladdress, "pin": pin, "zoning": zoneCode, "zoneLink": zoningLink, "ward": ward };
				points.push(point);

				$("#resultbody").append("<tr><td>" + fulladdress + "</td><td>" + pin + "</td><td><a href='http://www.ottawa.ca" + zoningLink +"' target='_blank'>"+ zoneCode + "</a></td><td>" + ward + "</td></tr>")
			}

		}

		plotResults(points);
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
				feature = results.features;
				
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
		var url = "http://maps.ottawa.ca/arcgis/rest/services/Property_Parcels/MapServer/0/query?where=FULLADDR+Like%27%25" + address + "%25%27&text=&objectIds=&time=&geometry=&geometryType=esriGeometryPoint&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=FULLADDR%2C+POINTTYPE%2C+WARD&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=pjson"

		var feature = query(url);

		return feature
	}


	//Pin Search
	var pinGeoLookUp = function(x, y){

		var url = "http://maps.ottawa.ca/arcgis/rest/services/Property_Parcels/MapServer/2/query?where=&text=&objectIds=&time=&geometry=" + x + "," + y +"%0D%0A&geometryType=esriGeometryPoint&inSR=&spatialRel=esriSpatialRelWithin&relationParam=&outFields=ADDRESS_NUMBER%2CROAD_NAME%2CSUFFIX%2CPIN_NUMBER%2CADDRESS_TYPE_ID%2CADDRESS_STATUS%2COBJECTID&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=pjson";

		var get = query(url);

		return get[0].attributes.PIN_NUMBER
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


	//Mapping

var road = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png',{
  maxZoom: 19,
  attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
}),
googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s,m&x={x}&y={y}&z={z}',{
    maxZoom: 21,
    subdomains:['mt0','mt1','mt2','mt3']
}),
googleRoad = L.tileLayer('http://{s}.google.com/vt/lyrs=r,m&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
});


var roads = L.esri.dynamicMapLayer({
	url: "http://maps.ottawa.ca/arcgis/rest/services/Streets/MapServer/"
}),
	cycling = L.esri.dynamicMapLayer({
		url: "http://maps.ottawa.ca/arcgis/rest/services/CyclingMap/MapServer/"
	}),
wards = L.esri.dynamicMapLayer({
	url: "http://maps.ottawa.ca/arcgis/rest/services/Wards/MapServer/"
}),
waterSewer = L.esri.dynamicMapLayer({
	url: "http://maps.ottawa.ca/arcgis/rest/services/WaterAndSewer/MapServer"
}),
zoningMap = L.esri.dynamicMapLayer({
	url: "http://maps.ottawa.ca/arcgis/rest/services/Zoning/MapServer",
	opacity: .7
}),
parcelMap = L.esri.dynamicMapLayer({
	url: "http://maps.ottawa.ca/arcgis/rest/services/Property_Parcels/MapServer/"
}),
transit = L.esri.dynamicMapLayer({
	url: "http://maps.ottawa.ca/arcgis/rest/services/TransitServices/MapServer"
}),
trees = L.esri.featureLayer({
	url: "http://maps.ottawa.ca/arcgis/rest/services/Miscellaneous/MapServer/1",
	pointToLayer: function(geoJson, latlng) {
		console.log(geoJson)
		var diameter = geoJson.properties.DBH / 100;
		return L.circle(latlng, {radius: diameter * 5, color: "#68B684"})
	}
	
}),
neighbourhoods = L.esri.featureLayer({
	url: "http://maps.ottawa.ca/arcgis/rest/services/Neighbourhoods/MapServer/1"
}),
hospitals = L.esri.featureLayer({
	url: "http://maps.ottawa.ca/arcgis/rest/services/Hospitals/MapServer/0"
});

hospitals.bindPopup(function(feature){
	return feature.feature.properties.NAME
})

neighbourhoods.bindPopup(function(feature){
	return feature.feature.properties.NAMES
})

trees.bindPopup(function(featureLayer){
	console.log(featureLayer)
	var results = featureLayer.feature.properties;
	return "<div class='container popup'><div class='row'><div class='col-md-5'>Species</div><div class='col-md-7'>" + results['SPECIES'] + "</div></div><div class='row'><div class='col-md-5'>Diameter (cm)</div><div class='col-md-7'>" + results['DBH'] + "</div></div><div class='row'><div class='col-md-5'>Trunk Structure</div><div class='col-md-7'>" + results['TRUNCSTRCT'] + "</div></div></div>" ;
});

var baseMaps = {"Road": road, "Google Road": googleRoad, "Google Sat": googleSat};

var overlays = {"Streets": roads, 'wards': wards, 'Sewer and Water': waterSewer, "zoning": zoningMap, "Parcels": parcelMap, "Cycling": cycling, "Transit": transit, "Trees": trees, "Neighbourhoods": neighbourhoods, "Hospitals": hospitals };

var map = L.map('map', {
	layers: [road]
}).setView( [45.416667, -75.7], 15);

L.control.layers(baseMaps, overlays).addTo(map);

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

		halfMap();

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


L.Control.Contract = L.Control.extend({
	_active: false,
	options: {
		position: "topleft",
		modal: true,
		className: 'leaflet-expand-icon collapse',
		title: "shrink map"
	},
	onAdd: function(map){
		// console.log(map)
		this._map = map;
		this._container = L.DomUtil.create('div', 'leaflet-zoom-box-control leaflet-bar');
		this._container.title = this.options.title;

		var link = L.DomUtil.create('a', this.options.className, this._container);
		link.href="#";

		L.DomEvent
			.on(this._container, 'click', function(){

					if (this._active){
						this._active = false;
						fullMap();
						// L.DomUtil.removeClass(this._container, 'expand')
						// L.DomUtil.addClass(this._container, 'collapse')
						map.invalidateSize();
					} else{
						halfMap();
						this._active = true;
						L.DomUtil.removeClass(this._container, 'collapse')
						L.DomUtil.addClass(this._container, 'expand')
						map.invalidateSize();
					}
				}, this);

		return this._container;
	},
	activate: function(){
		this._active = false
		L.DomUtil.removeClass(this._container, 'expand')
		L.DomUtil.addClass(this._container, 'collapse')
		map.invalidateSize();
	}
})

L.Control.contract = function(options){
	return new L.Control.Contract(options);
}

L.Control.contract().addTo(map);
