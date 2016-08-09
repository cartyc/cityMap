function searchGeoOttawa(){
		event.preventDefault();
		$("#results").empty();

		var data = $("#pin").val(),
		address = $("#address_name").val().toUpperCase();


		//Append Table
		$("#results").append("<table id='rtable' class='table'><thead><tr><th></th><th>Address</th><th>Pin#</th></tr></thead><tbody id='resultbody'></tbody></table>");

		// Determine if search for pin or address by checking if number
		// If number that means pin

		if( isNaN(address) == false){
			var feature = pinSearch(address)

			for ( var i = 0; i < feature.length; i++){
				var pin = feature[i].attributes.PIN_NUMBER,
				fulladdress = feature[i].attributes.ADDRESS_NUMBER + ' ' + feature[i].attributes.ROAD_NAME + ' ' + feature[i].attributes.SUFFIX + ' ' + ( (feature[i].attributes.DIR == null ) ? '' : feature[i].attributes.DIR)

				$("#resultbody").append("<tr><td><a href='fmp://$/interface.fmp12?script=selectParcel_fromMap&param="+pin+"'>Select</a></td><td>" + fulladdress + "</td><td>" + pin + "</td></tr>")
			}
		} else {
			var feature = addressSearch(address)

			for (var i = 0; i < feature.length; i++){
				var fulladdress = feature[i].attributes.FULLADDR,
				pin = feature[i].attributes.PIN_NUMBER;
				var parcel = pinGeoLookUp(feature[i].geometry.x, feature[i].geometry.y)
				console.log(feature[i].attributes.WARD);
				$("#resultbody").append("<tr><td><a href='fmp://$/interface.fmp12?script=selectParcel_fromMap&param="+pin+"'>Select</a></td><td>" + fulladdress + "</td><td>" + parcel + "</td></tr>")
			}

		}




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
				$("#results").empty().append("<p>" + err.responseText + "</p>")
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