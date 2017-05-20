var stopsLayer; // Global variable where the displayed stops layer will be stored
var activeDialog;

$(document).ready(function () {
    console.log("stoplayout.js: document is ready");
    initializeStopsLayer();

    // Stop Layout Generation Controls
    $("#generate-stop-layout-form-button").click(function () {
        console.log("stoplayout.js: generate-stop-layout-form-button clicked");
        var settings = stopLayoutDialogSettings[$('#stop-layout-selection').val() - 1];
        showStopLayoutDialog(settings);
    });

    // Add, Move, Delete Controls
    $("#add-stops-button").click(function () {
        console.log("stoplayout.js: add-stops-btn clicked");
    });

    $("#move-stops-button").click(function () {
        console.log("stoplayout.js: move-stops-btn clicked");
        // TODO: Use Leaflet.Path.Transform (https://github.com/w8r/Leaflet.Path.Transform) to rotate and translate stops
    });

    $("#delete-stops-button").click(function () {
        console.log("stoplayout.js: delete-stops-btn clicked");
        // TODO: Use leaflet-area-select (https://github.com/w8r/leaflet-area-select) to select stops
    });
});

function initializeStopsLayer() {
    stopsLayer = L.featureGroup();
    stopsLayer.addTo(leafletMap);
}

function showStopLayoutDialog(settings) {
    //noinspection EqualityComparisonWithCoercionJS
    if (activeDialog != null) {
        activeDialog.remove(leafletMap);
    }

    activeDialog = L.control.dialog(settings["options"]).setContent(settings["content"]).addTo(leafletMap);
    activeDialog.layoutType = settings["name"];
    activeDialog.open();

    setupDialogGenerateButton();
    setupDialogCheckboxes();
}

function setupDialogGenerateButton() {
    $("#generate-stop-layout-dialog-button").click(function () {
        activeDialog.close();

        var layoutConfig = {};
        if (activeDialog.layoutType === "LATTICE") {
            setupLatticeLayoutConfig(layoutConfig);
        } else if (activeDialog.layoutType === "RANDOM") {
            setupRandomLayoutConfig(layoutConfig);
        } else if (activeDialog.layoutType === "N-BLOB") {
            setupNBlobLayoutConfig(layoutConfig);
        } else {
           throw "Active dialog has an invalid layout type.";
        }
    });
}

function setupDialogCheckboxes() {
    if (activeDialog.layoutType === "LATTICE") {
        var locCenterLatticeStartCheckbox = $('#loc-center-lattice-start-checkbox');
        locCenterLatticeStartCheckbox.change(function () {
            $('#lattice-start-lat-field').attr('disabled', locCenterLatticeStartCheckbox.is(':checked'));
            $('#lattice-start-lng-field').attr('disabled', locCenterLatticeStartCheckbox.is(':checked'));
        });
    } else if (activeDialog.layoutType === "N-BLOB") {
        var recommendedPredefinedMeansCheckbox = $('#recommended-predefined-means-checkbox');
        recommendedPredefinedMeansCheckbox.change(function() {
            $('#predefined-means-field').attr('disabled', recommendedPredefinedMeansCheckbox.is(':checked'));
        });
    }
}

function setupLayoutBaseConfig(layoutConfig) {
    layoutConfig.max_num_stops = $("#max-num-stops-field").val();
    layoutConfig.max_walking_dist = $("#max-walking-dist-field").val();
    layoutConfig.color = $("#stops-color-field").val();
}

function setupLatticeLayoutConfig(layoutConfig) {
    setupLayoutBaseConfig(layoutConfig);
    layoutConfig.layout_type = "LATTICE";

    if ($('#loc-center-lattice-start-checkbox').is(':checked')) {
        var locationCenterLatLng = getLocationCenterLatLng();
        layoutConfig.lattice_start_lat = locationCenterLatLng.lat;
        layoutConfig.lattice_start_lng = locationCenterLatLng.lng;
    } else {
        layoutConfig.lattice_start_lat = $('#lattice-start-lat-field').val();
        layoutConfig.lattice_start_lng = $('#lattice-start-lng-field').val();
    }

    generateStops(layoutConfig, displayStopNodes);
    console.log("stoplayout.js:setupLatticeLayoutConfig: generation of lattice layout started");
}

function getLocationCenterLatLng() {
    var locationBounds = locationBoundaryLayer.getBounds();
    var locationCenter = locationBounds.getCenter();
    console.log("stoplayout.js:getLocationCenterLatLng: location center LatLng calculated as ("
        + locationCenter.lat + ", " + locationCenter.lng + ")");
    return locationCenter;
}

function setupRandomLayoutConfig(layoutConfig) {
    setupLayoutBaseConfig(layoutConfig);
    layoutConfig.layout_type = "RANDOM";
    generateStops(layoutConfig, displayStopNodes);
    console.log("stoplayout.js:setupRandomLayoutConfig: generation of random layout started");
}

function setupNBlobLayoutConfig(layoutConfig) {
    setupLayoutBaseConfig(layoutConfig);
    layoutConfig.layout_type = "N-BLOB";

    if ($('#recommended-predefined-means-checkbox').is(':checked')) {
        getRecommendedPredefinedMeans($('#location-selection').val(),
            function(loc_recommended_predefined_means_json) {
                layoutConfig.predefined_means = loc_recommended_predefined_means_json;
                generateStops(layoutConfig, displayStopNodes);
                console.log("stoplayout.js:setupNBlobLayoutConfig: generation of n-blob layout " +
                    "using recommended predefined means started");
            }
        );
    } else {
        layoutConfig.predefined_means = '[' + $('#predefined-means-field').val() + ']';
        generateStops(layoutConfig, displayStopNodes);
        console.log("stoplayout.js:setupNBlobLayoutConfig: generation of n-blob layout " +
                    "using manually entered predefined means started");
    }
}

function generateStops(layoutConfig, callback) {
    $.post(Urls['stopgenerator:generate_stop_layout'](), layoutConfig, function (returnedData) {
        var stopLayoutNodes = returnedData['stop_layout_nodes'];
        console.log("stoplayout.js:generateStops: response from server received");
        console.log(stopLayoutNodes);
        callback(stopLayoutNodes, layoutConfig.color);
    });
}

function displayStopNodes(stopLayoutNodes, selectedColor) {
    var style = {
        radius: 5,
        fillColor: selectedColor,
        color: "#000000", // stop outline color
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    stopLayoutNodes.forEach(function(node) {
        var coord = node['coordinates'];
        var latLng = L.latLng(coord[1], coord[0]);
        var stopNodeMarker = L.circleMarker(latLng, style);
        stopsLayer.addLayer(stopNodeMarker);
    });
}