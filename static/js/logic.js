
// Make a request that retrieves the earthquake geoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {
    // Process data to be able to map
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {
    // Create a popup for each marker to display the magnitude and location of the earthquake after the marker has been created and styled
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>`);
    }

    // This function determines the radius of the earthquake marker based on its magnitude.
    function markerSize(magnitude) {
        return magnitude * 4;
    }

    // This function determines the color of the marker based on the depth of the earthquake.
    function markerColor(depth) {
        return depth > 90 ? "#FF0000" :
               depth > 70 ? "#FF8C00" :
               depth > 50 ? "#FFD700" :
               depth > 30 ? "#ADFF2F" :
               depth > 10 ? "#9ACD32" :
                            "#00FF00";
    }

    // Add a GeoJSON layer to the map once the file is loaded.
    let earthquakes = L.geoJSON(earthquakeData, {
        // Turn each feature into a circleMarker on the map.
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: markerSize(feature.properties.mag),
                fillColor: markerColor(feature.geometry.coordinates[2]),
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.65 
            });
        },
        onEachFeature: onEachFeature 
    });

    // Create map
    createMap(earthquakes);
}

function createMap(earthquakes) {
    // Create the 'basemap' tile layer that will be the background of our map.
    //let earthquake_map = 
    let map = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
    });

    // Define map layers
    let baseMap = {
        "Map": map,
    };

    let overlayMap = {
        "Earthquakes": earthquakes
    };

    // Add layers to map
    let myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 5,
        layers: [map, earthquakes]
    });

    // Add layer control to map
    L.control.layers(baseMap, overlayMap, {
        collapsed: false
    
   
    }).addTo(myMap);

    // Create a legend control object.
    let legend = L.control({ 
        position: "bottomright" });
    // Then add all the details for the legend
    legend.onAdd = function () {
        let div = L.DomUtil.create("div", "info legend");
        // Initialize depth intervals and colors for the legend
        div.style.backgroundColor = "white"; 
        div.style.padding = "6px 8px";
        div.style.fontSize = "12px";
        // Initialize depth intervals and colors for the legend
        let depths = [-10, 10, 30, 50, 70, 90];
        let colors = [
            "#00FF00",
            "#9ACD32",
            "#ADFF2F",
            "#FFD700",
            "#FF8C00",
            "#FF0000"
          ];
    
        // Loop through our depth intervals to generate a label with a colored square for each interval.
        for (let i = 0; i < depths.length; i++) {
            div.innerHTML +=
                `<i style="background:${colors[i]}; width: 12px; height: 12px; display: inline-block;"></i> ${depths[i]}${(depths[i + 1] ? '&ndash;' + depths[i + 1] : '+')}<br>`;
        }
        return div;
    };
    // Finally, add the legend to the map.
    legend.addTo(myMap);
}

