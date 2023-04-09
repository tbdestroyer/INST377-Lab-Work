/*
  Hook this script to index.html
  by adding `<script src="script.js">` just before your closing `</body>` tag
*/

/* Copied from 
 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
 */
 function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  // The maximum is inclusive and the minimum is inclusive
  return Math.floor(Math.random() * (max - min + 1) + min); 
}

  /*
  ## JS and HTML Injection
    There are a bunch of methods to inject text or HTML into a document using JS
    Mainly, they're considered "unsafe" because they can spoof a page pretty easily
    But they're useful for starting to understand how websites work
    the usual ones are element.innerText and element.innerHTML
    Here's an article on the differences if you want to know more:
    https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent#differences_from_innertext

  ## What to do in this function
    - Accept a list of restaurant objects
    - using a .forEach method, inject a list element into your index.html for every element in the list
    - Display the name of that restaurant and what category of food it is
*/
function injectHTML(list) {
  console.log('fired injectHTML');
  const target = document.querySelector('#restaurant_list');
    if (list.length > 0)
        target.innerText =''
    else
        target.innerText = 'No matching restaurants found';
  
  const listEl =  document.createElement('ol');
  target.appendChild(listEl);

  list.forEach(item => {
    const el =  document.createElement('li');
    if(item?.name){
      el.innerText = item.name +", "+item.category+", "+item.address_line_1;  
      listEl.appendChild(el);
    }
  });

}

/*
## Process Data Separately From Injecting It
  This function should accept your 1,000 records
  then select 15 random records
  See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
  and return an object containing only the restaurant's name, category, and geocoded location
  So we can inject them using the HTML injection function

  You can find the column names by carefully looking at your single returned record
  https://data.princegeorgescountymd.gov/Health/Food-Inspection/umjn-t2iz

## What to do in this function:

- Create an array of 15 empty elements (there are a lot of fun ways to do this, and also very basic ways)
- using a .map function on that range,
- Make a list of 15 random restaurants from your list of 1000 from your data request
- Return only their name, category, and location
- Return the new list of 15 restaurants so we can work on it separately in the HTML injector
*/
function getRestList(list) {
  console.log('fired restaurants list');
  const range = [...Array(15).keys()];
  const newArray = range.map( (item)=>{
     const index = getRandomIntInclusive(0,list.length);
     return list[index];
  });
  return newArray;
}

/* Sets have unique element. Check for duplicates comparing set length of 
array to its array size, https://www.techiedelight.com/check-array-contains-duplicates-javascript*/
function hasDuplicates(arr) {
  return new Set(arr).size !== arr.length;
}

/* recreate 15 random restaurant list if duplicate establishmnet id is found
try only up to 3 times if duplicate found, if no duplicates return right away */
function processRestaurants(origArr) {

  let rest_list=[];
  let establishment_id_list =[];

  for(let i=0; i < 3; i++){ // Try up to 3 times for finding a non-duplicate list
    establishment_id_list =[];
    rest_list = getRestList(origArr); // get 15 random restaurant list
    
    /* create a list only for establishmnet ids as keys for duplicate search */
    rest_list.forEach(item => {
       if(item?.establishment_id)
          establishment_id_list.push(item.establishment_id);
    })
    

    /*check if there is any duplicate establishment ids */
    if (hasDuplicates(establishment_id_list) ) // continue looping up to 3 times
    {
      console.log('Found duplicates!!!!');
      console.log(establishment_id_list);
    }
    else{
       console.log('No duplicates in 15 restaurant list iter:' + i);
       break;  // break from loop if no duplicates 
    }

  }

  return rest_list;
}






/* A quick filter that will return something based on a matching input */
function filterList(list, query) {
  /*
    Using the .filter array method, 
    return a list that is filtered by comparing the item name in lower case
    to the query in lower case
  */

    return list.filter((item)=>{
      const lcItem = item.name.toLowerCase(); /* convert each item  name field in the retaurant list to lowercase*/
      const lcQuery = query.toLowerCase(); /* convert search string to lowercase*/
      return  lcItem.includes(lcQuery); /* find search string matches in the restaurant list name fields*/
    });

}

/* Map initialization, center it at UMD initially */
function initMap(){

  console.log("initMap");
  const map = L.map('map').setView([38.9858, -76.9373], 13);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
  return map;
}

function markerPlace(array, map) {
  console.log("markerPlace", array);
  //const marker = L.marker([51.5, -0.09]).addTo(map);
  /*remove previous markers before placing the new ones*/
  map.eachLayer((layer=>{
      if(layer instanceof L.Marker) {
          layer.remove();
      }
  }));

  const mapcenter_lat_list=[];
  const mapcenter_long_list=[];

  array.forEach((item, index)=>{
    if(typeof item?.geocoded_column_1 !== "undefined"){  // check for undefined geocodes in some entries
      //console.log("other geo info", item.geocoded_column_1.coordinates['length'])
      const {coordinates} = item.geocoded_column_1;
      //console.log(item);
      L.marker([coordinates[1], coordinates[0]]).addTo(map);

      mapcenter_long_list.push(coordinates[0]);
      mapcenter_lat_list.push(coordinates[1]);
    }
    else{
     
      if( item?.establishment_id)
         console.log("Geo location not available for establishment id: ", item.establishment_id);
      else
         console.log("establishment id and Geo location not available")
    }

  });

  //Calculate the average latitude and longitude to to use as center of map
  //so the map doesn't move too much after each list reneval
  
  //https://www.knowprogram.com/js/javascript-average-of-array/
  const longAvg = mapcenter_long_list.reduce((a,b) => a + b, 0) / mapcenter_long_list.length;
  const latAvg = mapcenter_lat_list.reduce((a,b) => a + b, 0) / mapcenter_lat_list.length;
  console.log("Map center ",longAvg, ",",latAvg);
  map.setView([latAvg, longAvg], 10);

}

async function mainEvent() { // the async keyword means we can make API requests
  const mainForm = document.querySelector('.main_form'); // This class name needs to be set on your form before you can listen for an event on it
  // Add a querySelector that targets your filter button here
  const loadDataButton = document.querySelector('.data_load');
  const clearDataButton = document.querySelector('.data_clear');
  const generateListButton = document.querySelector('.generate');
  const textField = document.querySelector('#resto');

  const loadAnimation = document.querySelector('#data_load_animation'); // get a reference to your loading animation
  loadAnimation.style.display = 'none';
  generateListButton.classList.add ('hidden');

  const pageMap = initMap();

  const storedData = localStorage.getItem("storedData");
  let parsedData = JSON.parse(storedData);
  //console.log(parsedData);
  if(parsedData?.length > 0){
    generateListButton.classList.remove('hidden');
  }

  let currentList = []; // this is "scoped" to the main event function
  
  /* We need to listen to an "event" to have something happen in our page - here we're listening for a "submit" */
  loadDataButton.addEventListener('click', async (submitEvent) => { // async has to be declared on every function that needs to "await" something
    
    // This prevents your page from becoming a list of 1000 records from the county, even if your form still has an action set on it
    //submitEvent.preventDefault(); 
    
    // this is substituting for a "breakpoint" - it prints to the browser to tell us we successfully submitted the form
    console.log('loading data'); 

    loadAnimation.style.display = 'inline-block';
    
    // Basic GET request - this replaces the form Action
    const results = await fetch('https://data.princegeorgescountymd.gov/resource/umjn-t2iz.json');

    // This changes the response from the GET into data we can use - an "object"
    const storedList = await results.json();
    localStorage.setItem('storedData', JSON.stringify(storedList));
    parsedData = storedList;

    if(parsedData?.length > 0){
      generateListButton.classList.remove('hidden');
    }

    loadAnimation.style.display = 'none';// clear the animation after the load

    //console.table(storedList);
    console.log(storedList[0], storedList.length);
  });

 
  generateListButton.addEventListener('click', (event) =>{
    console.log('generate new list');
    currentList = processRestaurants(parsedData);
    console.log(currentList);
    injectHTML(currentList);
    markerPlace(currentList, pageMap);

  });

  textField.addEventListener('input', event =>{
    console.log('input', event.target.value);
    const newList = filterList(currentList, event.target.value);
    console.log(newList);
    injectHTML(newList);
    markerPlace(newList, pageMap);
  });

  clearDataButton.addEventListener('click', (event) =>{
    console.log('clear local browserl, data length before:',(localStorage.getItem("storedData"))?.length);
    localStorage.clear();
    console.log('locaStorage check data after:',localStorage.getItem("storedData") );
  });
  

} /* end mainEvent */

/*
  This adds an event listener that fires our main event only once our page elements have loaded
  The use of the async keyword means we can "await" events before continuing in our scripts
  In this case, we load some data when the form has submitted
*/
document.addEventListener('DOMContentLoaded', async () => mainEvent()); // the async keyword means we can make API requests
