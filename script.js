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


map.on('move', () => { 
	checkContinent();
});

