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
	
	var precision = 5;
	
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
	var map = L.map("map", {}).setView([40., 0.], 2);
	
	L.tileLayer("http://tile.openstreetmap.org/{z}/{x}/{y}.png", {
		maxZoom: 19,
		attribution: "Map data &copy; <a href=\"http://openstreetmap.org\" target=\"_newtab\">OpenStreetMap</a> contributors"
	}).addTo(map);
	
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
	
	var clipboard = new Clipboard("#copy_button", {
		text: function() {
			return $("#lon_min").text() + "," + $("#lat_min").text() + "," + $("#lon_max").text() + "," + $("#lat_max").text();
		}
	});
}