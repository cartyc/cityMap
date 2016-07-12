  var leafletwrapper = function(){

    var leafletwrapper = {
      version: "0.0.1",
      author: "Chris Carty",
      email: "chriscartydev@gmail.com"
    }

    var map,
    points = {},
    layers = {},
    search = false;

    // accessors
    // Map
    this.map = function(newMap){
      if(!arguments){
        return this.map;
      } else {
        this.map = newMap;
      }

      return leafletwrapper;
    }


    //Points
    this.points = function(key, value){
      if(!arguments){
        return points;
      } else {
        this.points[key] = value;
      }

      return leafletwrapper;
    }

    // Layers
    this.layers = function(key, value){
      if(!arguments){
        return layers;
      } else {
        this.layers[key] = value;
      }

      return leafletwrapper;
    }

    // Search
    this.search = function(toggle){
      if(!arguments){
        return toggle;
      } else {
        this.search = toggle;
        if(this.search == true){
          var arcgisOnline = L.esri.Geocoding.arcgisOnlineProvider();

          var searchControl = L.esri.Geocoding.geosearch({
              providers: [
                 arcgisOnline,
               ]
              }).addTo(this.map);

          var results = L.layerGroup().addTo(this.map);

          // listen for the results event and add every result to the map
          searchControl.on("results", function(data) {
              results.clearLayers();

              for (var i = data.results.length - 1; i >= 0; i--) {
                  var info = data.results[i].properties;
                  if ( info["Score"] > 80 && info["Addr_type"] == "StreetAddress" || info["Addr_type"] == "POI"){
                    var info = data.results[i].properties;
                    results.addLayer(L.marker(data.results[i].latlng).bindPopup("<h4>" + info["StAddr"] +"</h4><p>" + info["PlaceName"] + "</p><p>"+ data.results[i].latlng + "</p><button class='btn btn-primary right-btn' id='property' onclick='addMapSelection(\"" + info["StAddr"]+ "\")'>Select</button>", info));
                  }
              }
          });
        }
      }

      return leafletwrapper;
    }

    //Initialze The Map
    this.initialize = function(selector, coords, zoom){
      this.map = L.map(selector).setView(coords, zoom);

      return leafletwrapper;
    }


    this.setTileLayer = function(tile, maxzoom, attribution){
      L.tileLayer(tile,{
        maxZoom: maxzoom,
        attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map);
    }

    // Add data points
    this.addData = function(key, data){
      var value = L.geoJson(data).addTo(this.map);
      this.points(key, value);
    }

    // Remove Data Points
    this.removeData = function(key){
      if(key !== undefined){
          this.map.removeLayer(this.points[key]);
      }
    }

    // Add layer
    this.addLayer = function(layer, layername){
      var newLayer = L.esri.dynamicMapLayer({
        url: layer,
        opacity: 0.5,
        useCors: false
      });

      this.layers(layername,newLayer);

      newLayer.addTo(this.map);

      newLayer.bindPopup(function(error, featureCollection){
        console.log(featureCollection.features[0].properties);
        return L.Util.template('<p>{ADDRESS_NUMBER}<br>{PIN}</p>', featureCollection.features[0].properties);
      })
    }

    //Remove Layer
    this.removeLayer = function(key){
      if(key !== undefined){
          this.map.removeLayer(this.layers[key]);
      }
    }

    return this
  }


  // }).addTo(map);
