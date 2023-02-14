var continentToggleContainer = document.querySelector(".continent-toggle-container");
var unitedStatesToggle = document.querySelector("#united-states");
var europeToggle = document.querySelector("#europe");
var USAbbox = [[-125, 51], [-68,20 ]];
var EUbbox = [[-12, 61], [44,30 ]];
map.changingContinent = false;

unitedStatesToggle.addEventListener("click", function(){
	toggleClass(unitedStatesToggle, europeToggle, "clicked")	
	map.once('movestart', () => { map.changingContinent = true; });
	map.fitBounds(USAbbox, {
		padding: {top: 50, bottom:20, left: 5, right: 5}
	});
	map.once('moveend', () => { map.changingContinent = false; });
});
unitedStatesToggle.addEventListener("mouseover", peekDirection);

europeToggle.addEventListener("click", function(){ 
	toggleClass(europeToggle, unitedStatesToggle, "clicked")	
	map.once('movestart', () => { map.changingContinent = true; });
	map.fitBounds(EUbbox, {
		padding: {top: 50, bottom:20, left: 5, right: 5}
	});
	map.once('moveend', () => { map.changingContinent = false; });
});
europeToggle.addEventListener("mouseover", peekDirection);

function toggleClass(elementToAdd, elementToRemove, classToToggle) {
	elementToAdd.classList.add(classToToggle);
	elementToRemove.classList.remove(classToToggle); 
}

function checkContinent() {
	const {lng, lat} = map.getCenter();
	if (lng > -30) { 
		toggleClass(europeToggle, unitedStatesToggle, "active");
		toggleClass(europeToggle, unitedStatesToggle, "clicked")	
	} 
	if (lng < -30) { 
		toggleClass(unitedStatesToggle, europeToggle, "active");
		toggleClass(unitedStatesToggle, europeToggle, "clicked")	 
	} 
}


function peekDirection() {

	initialCenter = map.getCenter();
	initialZoom = map.getZoom();
	
	var centerPoint = map.project(initialCenter);
	console.log(map);
  if( event.type == "mouseover" && event.target.classList.contains('clicked') == false && map.changingContinent == false){ // shift left
  	console.log("mouseover")
		var peekCenterPoint = [
			centerPoint.x - window.screen.width/20,
			centerPoint.y
		]
		var peekCenter = map.unproject(peekCenterPoint);
			map.easeTo({
			// center: [peekCenter.lng, peekCenter.lat],
			zoom: initialZoom -.3,
			speed: 0.2,
			curve: 1,
			duration: 5000,
			easing(t) {
				return t * (2 - t);
			}
		});
  }
  event.target.addEventListener("mouseout", function(){
  		if( event.type == "mouseout" && event.target.classList.contains('clicked') == false && map.changingContinent == false){ // return map center
		  	console.log("mouseout")	
				var unPeekCenterPoint = [
					centerPoint.x + window.screen.width/20,
					centerPoint.y
				]
				var unPeekCenter = map.unproject(unPeekCenterPoint);
				map.easeTo({
					// center: initialCenter,
					zoom: initialZoom,
					speed: 0.2,
					curve: 1,
					duration: 100,
					easing(t) {
						return t * (2 - t);
					}
				});
		  }
  });
}


function fullPopup(f, task) {

		f = f || null;	
		var main = document.querySelector('.main');

		if (task == 'clear') {
				main.innerHTML = ''; //clear main
				return; //return if clearing
		} if (task == 'create') {
				main.innerHTML = ''; //clear main
				var contentContainer = Object.assign(document.createElement('div'), { 
					className: 'content-container popup-container' 
				});
				main.appendChild(contentContainer);
				var popup = Object.assign(document.createElement('div'), { 
					className: 'popup' 
				});
				contentContainer.appendChild(popup);
				var popupHeader = Object.assign(document.createElement('div'), { 
		    	innerHTML: '<h3>' + f.properties.firm + '</h3>',
					className: 'popup-header' 
				});
				popup.appendChild(popupHeader);
				var popupBody = Object.assign(document.createElement('div'), { 
		    	innerHTML: '<h3>' + f.properties. + '</h3>',
					className: 'popup-body' 
				});
				popup.appendChild(popupBody);		
		}
}

//////////////////////////////////
// SEMICONDUCTOR LAYER BEHAVIOR //


map.on('click', (event) => {
		console.log("click event: ", event, "zoom: ", map.getZoom());
	  const features = map.queryRenderedFeatures(event.point, {  // If the user clicked on one of your markers, get its information.
	    layers: ['semiconductors-id'] // layer name
	  });
	  if (!features.length) { // NO FEATURES CLICKED
				fullPopup('clear', 'clear');
	  		return;
	  }
	  if (features.length) { // FEATURES CLICKED
  		  const feature = features[0];
			  console.log("clicked feature: ", feature);

				map.flyTo({ // center map on point
					center: feature.geometry.coordinates
				});

				fullPopup(feature, 'create');
	  }
});


map.on("mouseenter", "semiconductors-id", (event) => {
      map.getCanvas().style.cursor = "pointer";
      const features = map.queryRenderedFeatures(event.point, { layers: ['semiconductors-id'] });
      if (!features.length) { return }
		  const feature = features[0];

			function createPopup() { // create popup
				  var popupString = "<div class='feature'>";
			  	popupString += "<p class='firm'>" + feature.properties.firm + "</p>";
			  	popupString += "</div>";

	  			previewPopup.setLngLat(feature.geometry.coordinates);
					previewPopup.setHTML(popupString);
					previewPopup.addTo(map);
			}
			createPopup();

			map.setFeatureState(
				{ source: 'semiconductors', id: 'semiconductors-id' },
				{ hover: true })
});

map.on("mouseleave", "semiconductors-id", () => {
			previewPopup.remove();
      map.getCanvas().style.cursor = "default";
});


// inspect a cluster on click
map.on('click', 'clusters-circle-id', (e) => {
		const features = map.queryRenderedFeatures(e.point, {
			layers: ['clusters-circle-id']
		});
		const clusterId = features[0].properties.cluster_id;
			map.getSource('semiconductors').getClusterExpansionZoom(
			clusterId,
			(err, zoom) => {
				if (err) return;
				map.easeTo({
					center: features[0].geometry.coordinates,
					zoom: zoom
				});
			}
		);
});
 
// Create a popup, but don't add it to the map yet.
const previewPopup = new mapboxgl.Popup({
		closeButton: false,
		closeOnClick: false,
		className: 'clusterPopup preview',
		closeOnMove: true,
		maxWidth: '300px',
		offset: 10
});


map.on('mouseenter', 'clusters-circle-id', (event) => {

		map.getCanvas().style.cursor = 'pointer';
	  var clusterId = event.features[0].properties.cluster_id;
	  var clusterCenter = event.features[0].geometry.coordinates;
	  var pointCount = event.features[0].properties.point_count;
	  var clusterSource = map.getSource('semiconductors');

	  var clusterFeatures = [];
	  clusterSource.getClusterLeaves(clusterId, pointCount, 0, function(error, features) {
	    features.forEach(feature => {
				clusterFeatures.push(feature);
			})
			createPopup(); // call popup function once array is loaded
	  });

	  function createPopup() {
	  	console.log("clusterFeatures: ", clusterFeatures);
		  var popupString = "";
		  clusterFeatures.forEach(feature => {
		  	popupString += "<div class='feature'>";
		  	popupString += "<p class='firm'>" + feature.properties.firm + "</p>";
		  	popupString += "</div>";
		  })

			previewPopup.setLngLat(clusterCenter);
			previewPopup.setHTML(popupString);
			previewPopup.addTo(map);
	  }
	  
});

map.on('mouseleave', 'clusters-circle-id', (event) => {
		map.getCanvas().style.cursor = '';
		previewPopup.remove();
});

//////////////////////////////////
//////////////////////////////////







map.on('move', () => { 
	checkContinent();
});

