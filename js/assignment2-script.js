 //Name: Janak Parajuli
 //Subject: Programming (2019/2020)
 //Assignment II

 //First of all, define some global variables and constants
 // Bounding box refers to UJI campus
 const bboxCampus = [-0.07947921752929688, 39.98619605209568, -0.04978179931640625, 40.00000497268461];

 const ANALYSIS_CENTROID = "centroid";
 const ANALYSIS_BUFFER = "buffer";
 const ANALYSIS_VORONOI = "voronoi";
 const ANALYSIS_BUFFER_RATIO = 0.3;

 let numPoints;
 let btnPoints;
 let activePoints;
 let counter, lbl, sel;
 //Call main function on loading
 window.onload = main;
 //Define all the required functions
//Define main function, this is the function that runs first
 function main() {
	 //Initialize Leaflet map
 	initMap('map-div');
	 //initGlobalVariables();
	 //Attach the listeners
 	attachListeners();
	 //toggleVisibilityComputation("hide");
	 //Add bounding box on the map
 	addBoundingBoxToMap(bboxCampus);

 }
 /** YOUT CUSTOM FUNCTIONS HERE! */
 //Define a function to create points and add them to a table
 function createPoints() {
 	numPoints = document.getElementById("num").value;
 	if (numPoints <= 0) {
 		alert("Please type a valid number >0.");
 	} else {
 		activePoints = generateRamdomTurfPoints(numPoints, bboxCampus);		//generates the number of points as per the input from the user
		updateTable(activePoints);			//update the table with the points
		//Hide those classes that are not required before points are created
		lbl = document.querySelector('#lbl-compute');
		lbl.setAttribute('class', 'hide');

		sel = document.querySelector('#sel-compute');
		sel.setAttribute('class', 'hide');
		counter = 0;
 		//}
 	}
 }
//Define a function to update points
 function updateTable(points) {
	 //Clean all the features if any
	cleanFeatures();
 	var pointsTable = document.querySelector('#tbl');
 	var tableBody = pointsTable.getElementsByTagName('tbody')[0];
 	//Clean data if exists
 	if (tableBody.rows.length > 0) {
		tableBody.innerHTML = '';
	 }
	 //Append rows as per the number of rows
 	for (var i = points.features.length - 1; i >= 0; i--) {
		 tableRow = addRow(i, points.features[i]);
		 //console.log(tableRow);
 		tableBody.appendChild(tableRow);
	 };
	//Show the table
 	document.querySelector("#table-div").className = "show";
 }
//Define a function to add row
 function addRow(id, point) {
 	let row = document.createElement('tr');
 	row.setAttribute('class', 'display-points');	//Sets the class of all points
 	row.setAttribute('id', 'point-' + id);		//Sets the id for each point
 	row.setAttribute('data-reference', id);		//Sets the data reference
 	//create first cell to fill longitude value
 	let lon = document.createElement('td');
 	lon.innerHTML = point.geometry.coordinates[0].toFixed(3);

 	//create second cell to fill latitude value
 	let lat = document.createElement('td');
 	lat.innerHTML = point.geometry.coordinates[1].toFixed(3);

 	//create a view button to show the points and pass it the point reference and attributes
 	let viewBtn = document.createElement('button');
 	viewBtn.textContent = 'View';
 	viewBtn.setAttribute('data-reference', id);
 	viewBtn.setAttribute('type', 'button');
 	viewBtn.setAttribute('id', 'btn-view-point-' + id);
 	viewBtn.setAttribute('class', 'btn-view-point');
	viewBtn.setAttribute('onclick', 'this.replaceWith("On Map")');		//on clicking each view button, it is necessary to prevent it from being reused.

 	//append all the childs
 	row.appendChild(lon);
 	row.appendChild(lat);
 	row.appendChild(viewBtn);
 	//now, return the created row each time the function is called
 	return row;
 }
//Define a function to add points to the map upon clicking of view button
 function clickView(id) {
	let point = activePoints.features[id];
 	addPointToMap(point.geometry.coordinates[0], point.geometry.coordinates[1], false);		//These points are normal, so isSpecial attribute is set to false
 }
//Define a function to attach listeners to every click events
 function attachListeners() {
	 //First, add listeners for generate button
 	btnPoints = document.getElementById("btn-points");
	btnPoints.addEventListener("click", createPoints);

 	//Now, add listeners for each view button click
	 let tbl = document.getElementById('tbl');
	 //Before clicking, set the counter to 0
 	counter = 0;
 	tbl.addEventListener('click', function (element) {
		 //if there is a table and view button, only then it can be clicked
 		if (element.target && element.target.nodeName == 'BUTTON') {
			let row = element.target.getAttribute('data-reference');
 			clickView(row);
			 counter++;			//Adds counter on each clicks
			//If the number of clicks and points are equal then display selection
 			if (counter == numPoints) {
 				lbl.setAttribute('class', 'show');
 				//console.log('The class is: '+lbl.className);

 				sel.setAttribute('class', 'show');
 				sel.addEventListener('change', calculateGeometries);
 			}

 		}
 	});
 }
//Define a function to calculate the geometries as per user choice
 function calculateGeometries() {
	 let points = activePoints.features;
	let selection = sel.value;
	 //Delete any figures, if any
 	cleanPolygon();
	cleanCentroid();
 	for (var i = 0; i < points.length; i++) {
		 //If selection is buffer, call the function that computes buffer
 		if (selection == 'buffer') {
 			let buffer = computeTurfBuffer(points[i].geometry.coordinates[0], points[i].geometry.coordinates[1], ANALYSIS_BUFFER_RATIO);
			//Add buffer to the map 
			 addCirclesToMap(buffer);
		 } 
		 	 //If selection is centroid, call the function that computes centroid
			else if (selection == 'centroid') {
			 let centroid = computeTurfCentroid(activePoints);
			 //Add centroid to map
			 addPointToMap(centroid.geometry.coordinates[0], centroid.geometry.coordinates[1],true);

		 } 
		 //If selection is voronoi, call the function that computes voronoi
		 else if (selection == 'voronoi') {
			 let voronoi = computeTurfVoronoi(activePoints);
			 //Add voronoi to the map
 			addPolygonsToMap(voronoi);
 		}
 	}
 }