jQuery(document).ready(main);


var urlParameters = 
(function (params, defaultValue) {
	var match,
		pl     = /\+/g,  // Regex for replacing addition symbol with a space
		search = /([^&=]+)=?([^&]*)/g,
		decode = function (s){
			return decodeURIComponent(s.replace(pl, " "));
		},
		query  = window.location.search.substring(1),
		urlParameters = {}
	;
	
	while (match = search.exec(query))
		urlParameters[decode(match[1])] = decode(match[2]);
	
	for(var i=0, n=params.length; i<n; i++){
		if (!(params[i] in urlParameters)) {
			urlParameters[params[i]] = defaultValue;
		}
	}
	
	return urlParameters;
})(["blender_version", "addon", "addon_version"], "unknown");


function main() {
	
	var precision = 5,
		alertTimeout = null,
		addonVersion = "addon_version" in urlParameters ? urlParameters["addon_version"] : "",
		isPremium = (addonVersion.indexOf("premium") != -1) || addonVersion.charAt(0) == "1"
	;
	
	if (!isPremium) {
		$("#news").toggle(true);
	}
	
	function update() {
		setBounds(locationFilter.isEnabled() ? locationFilter.getBounds() : map.getBounds());
		validateControls();
	}
	
	function validateControls() {
		var extent = L.latLngBounds(
				L.latLng($("#lat_min").text(), $("#lon_min").text()),
				L.latLng($("#lat_max").text(), $("#lon_max").text())
			),
			sizeOk = (extent._northEast.lat - extent._southWest.lat) * (extent._northEast.lng - extent._southWest.lng) < 0.25
		;
		$("#alert_large").toggle(!sizeOk);
		$("#copy_instructions").toggle(sizeOk);
		$("#copy_button_container").toggle(sizeOk);
	}
	
	function setBounds(bounds) {
		$("#lon_min").text(bounds.getWest().toFixed(precision));
		$("#lat_min").text(bounds.getSouth().toFixed(precision));
		$("#lon_max").text(bounds.getEast().toFixed(precision));
		$("#lat_max").text(bounds.getNorth().toFixed(precision));
	}
	
	//$("body").css("padding-top", "50px");
	
	var osmMapnik = L.tileLayer("http://tile.openstreetmap.org/{z}/{x}/{y}.png", {
		maxZoom: 19,
		noWrap: true,
		attribution: "Map data &copy; <a href=\"http://openstreetmap.org\" target=\"_newtab\">OpenStreetMap</a> contributors"
	});
	
	/*
	var osmWikimedia = L.tileLayer("https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png?lang=en", {
		maxZoom: 19,
		noWrap: true,
		attribution: "Map data &copy; <a href=\"http://openstreetmap.org\" target=\"_newtab\">OpenStreetMap</a> contributors"
	});
	*/
	
	/*
	var bingLayer = L.tileLayer.bing({
		"bingMapsKey": "ApJrJScfP69KEQ0SzUdlfAwnVpbJ4V1wij_20UEvMQ5L_euitXGy6HSNg-wzkvWu",
		"imagerySet": "AerialWithLabels"
	});
	*/
	
	/*
	var baseMaps = {
		"OSM by osm.org": osmMapnik,
		"OSM by Wikimedia": osmWikimedia,
		"Bing Satellite": bingLayer
	};
	*/
	
	var map = L.map("map", {
		maxBounds: new L.LatLngBounds(new L.LatLng(-90., -180.), new L.LatLng(90., 180.)),
		layers: [osmMapnik]
	}).setView([40., 0.], 2);
	
	L.Control.geocoder({
		defaultMarkGeocode: false,
		position: "topleft"
	})
	.on("markgeocode", function(e) {
		map.fitBounds((e.geocode || e).bbox);
	})
	.addTo(map);
	
	// the following line will also add the layer <osmWikimedia> to the <map>
	//L.control.layers(baseMaps).addTo(map);
	
	$("#rectangle_button").on("click", function(event) {
		locationFilter.setBounds(map.getBounds().pad(-0.2));
		locationFilter.enable();
		update();
		$("#drag_instructions").show();
		$("#coords").show();
	});
	
	var locationFilter = new L.LocationFilter({
		enableButton: false,
		adjustButton: false
	});
	locationFilter.on("change", update);
	map.addLayer(locationFilter);
	
	(new Clipboard("#copy_button", {
		text: function() {
			return $("#lon_min").text() + "," + $("#lat_min").text() + "," + $("#lon_max").text() + "," + $("#lat_max").text();
		}
	})).on("success", function(e) {
		if (alertTimeout) {
			clearTimeout(alertTimeout);
		}
		else {
			$("#alert_copied").show();
		}
		alertTimeout = setTimeout(
			function() {
				$("#alert_copied").hide();
				alertTimeout = null;
			}, 1500
		);
	});
	
}
