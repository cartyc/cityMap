function searchGeoOttawa(){
		event.preventDefault();
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
		searchGeoOttawa();
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