const accessToken = "pk.eyJ1IjoiY2F2YXpvc2dhcnphIiwiYSI6ImNrM2V6OHk1ZzAwc2MzZnMxbzN6b3d3OGMifQ.c_efJhiaO7yilR34-PnlUA"

var graymap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?" +
"access_token=pk.eyJ1IjoiY2F2YXpvc2dhcnphIiwiYSI6ImNrM2V6OHk1ZzAwc2MzZnMxbzN6b3d3OGMifQ.c_efJhiaO7yilR34-PnlUA");

var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?" +
"access_token=pk.eyJ1IjoiY2F2YXpvc2dhcnphIiwiYSI6ImNrM2V6OHk1ZzAwc2MzZnMxbzN6b3d3OGMifQ.c_efJhiaO7yilR34-PnlUA");

var outdoormap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoormaps-v9/tiles/256/{z}/{x}/{y}?" + 
"access_token=pk.eyJ1IjoiY2F2YXpvc2dhcnphIiwiYSI6ImNrM2V6OHk1ZzAwc2MzZnMxbzN6b3d3OGMifQ.c_efJhiaO7yilR34-PnlUA");

var maps = L.map("mapid", {
  center: [37.09, -95.71],
  zoom: 5,
  layers: [graymap, satellitemap, outdoormap]
});

graymap.addTo(map);

var plates = new L.LayerGroup();
var earthquakes = new L.LayerGroup();

// base layers
var Map_bases = {
  Satellite: satellitemap,
  Grayscale: graymap,
  outdoormaps: outdoormap
};

// overlays 
var Maps_overlay = {
  "Tectonic Plates": plates,
  "Earthquakes": earthquakes
};

// control which layers are visible.
L
  .control
  .layers(Map_bases, Maps_overlay)
  .addTo(map);

// retrieve earthquake geoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson", function(data) {


  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.properties.mag),
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }

  function getColor(magnitude) {
    switch (true) {
      case magnitude > 5:
        return "#ea2c2c";
      case magnitude > 4:
        return "#ea822c";
      case magnitude > 3:
        return "#ee9c00";
      case magnitude > 2:
        return "#eecc00";
      case magnitude > 1:
        return "#d4ee00";
      default:
        return "#98ee00";
    }
  }

  function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }

    return magnitude * 3;
  }

  L.geoJson(data, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng);
    },
    style: styleInfo,
    onEachFeature: function(feature, layer) {
      layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
    }

  }).addTo(earthquakes);

  earthquakes.addTo(map);


  var legend = L.control({
    position: "bottomright"
  });


  legend.onAdd = function() {
    var div = L
      .DomUtil
      .create("div", "info legend");

    var grades = [0, 1, 2, 3, 4, 5];
    var colors = [
      "#98ee00",
      "#d4ee00",
      "#eecc00",
      "#ee9c00",
      "#ea822c",
      "#ea2c2c"
    ];


    for (var i = 0; i < grades.length; i++) {
      div.innerHTML += "<i style='background: " + colors[i] + "'></i> " +
        grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
    }
    return div;
  };


  legend.addTo(map);

  // retrive Tectonic Plate geoJSON data.
  d3.json("https://raw.githubusercontent.com/fraxen/plates/master/GeoJSON/PB2002_boundaries.json",
    function(platedata) {
 
      L.geoJson(platedata, {
        color: "orange",
        weight: 2
      })
      .addTo(plates);

      // add the plates layer to the map.
      plates.addTo(map);
    });
});