jQuery(document).ready(main)

function main() {
	
	var precision = 5;
	
	function update() {
		setBounds(locationFilter.isEnabled() ? locationFilter.getBounds() : map.getBounds());
		validateControls();
	}
	
	function validateControls() {
		//$("#export_osm_too_large").toggle(getBounds().getSize() > OSM.MAX_REQUEST_AREA);
		//$("#export_commit").toggle(getBounds().getSize() < OSM.MAX_REQUEST_AREA);
	}
	
	function setBounds(bounds) {
		$("#lon_min").val(bounds.getWest().toFixed(precision));
		$("#lat_min").val(bounds.getSouth().toFixed(precision));
		$("#lon_max").val(bounds.getEast().toFixed(precision));
		$("#lat_max").val(bounds.getNorth().toFixed(precision));
	}
	
	
	//$("body").css("padding-top", "50px");
	var map = L.map("map", {}).setView([40., 0.], 2);
	
	L.tileLayer("http://tile.openstreetmap.org/{z}/{x}/{y}.png", {
		maxZoom: 19,
		atribution: "Map data &copy; OSM.org"
	}).addTo(map);
	
	$("#rectangle_button").on("click", function(event) {
		locationFilter.setBounds(map.getBounds().pad(-0.2));
		locationFilter.enable();
		validateControls();
	});
	
	var locationFilter = new L.LocationFilter({
		enableButton: false,
		adjustButton: false
	});
	locationFilter.on("change", update);
	map.addLayer(locationFilter);
	
	var clipboard = new Clipboard("#copy_button", {
		text: function() {
			return $("#lon_min").val() + "," + $("#lat_min").val() + "," + $("#lon_max").val() + "," + $("#lat_max").val();
		}
	});
}