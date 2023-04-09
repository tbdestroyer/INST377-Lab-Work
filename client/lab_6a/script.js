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
  target.innerText = '';
  
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

async function mainEvent() { // the async keyword means we can make API requests
  const mainForm = document.querySelector('.main_form'); // This class name needs to be set on your form before you can listen for an event on it
  // Add a querySelector that targets your filter button here
  const filterDataButton = document.querySelector('.filter');
  const loadDataButton = document.querySelector('.data_load');
  const generateListButton = document.querySelector('.generate');

  const loadAnimation = document.querySelector('#data_load_animation'); // get a reference to your loading animation
  loadAnimation.style.display = 'none';

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
    currentList = await results.json();

    loadAnimation.style.display = 'none';

    /*
      This array initially contains all 1,000 records from your request,
      but it will only be defined _after_ the request resolves - any filtering on it before that
      simply won't work.
    */
    //console.table(currentList);
    console.log(currentList[0], currentList.length);
  });

  filterDataButton.addEventListener('click', (event) => {

    console.log("Filter button clicked");
    if (currentList.length === 0)
       alert('Please click the Load Data button first to load data');
    else{
       const formData = new FormData(mainForm);
       const formProps = Object.fromEntries(formData);
       if (formProps.resto.length === 0)
          alert('Please enter a name in Restaurant Name box');
       else {
          const newList = filterList(currentList, formProps.resto);
          console.log(newList);
          injectHTML(newList);
       }
    }

  });
 
  generateListButton.addEventListener('click', (event) =>{
    console.log('generate new list');

    const restaurantList = processRestaurants(currentList);
    console.log(restaurantList);

    // And this function call will perform the "side effect" of injecting the HTML list for you
    injectHTML(restaurantList);

  });

} /* end mainEvent */

/*
  This adds an event listener that fires our main event only once our page elements have loaded
  The use of the async keyword means we can "await" events before continuing in our scripts
  In this case, we load some data when the form has submitted
*/
document.addEventListener('DOMContentLoaded', async () => mainEvent()); // the async keyword means we can make API requests
