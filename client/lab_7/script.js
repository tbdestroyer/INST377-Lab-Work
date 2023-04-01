/* eslint-disable max-len */

/*
  Hook this script to index.html
  by adding `<script src="script.js">` just before your closing `</body>` tag
*/

/*
  ## Utility Functions
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

  function filterList(list, query) {
    return newArray = list.filter((item)=>{
        const lcItem = item.name.toLowerCase(); /* convert each item  name field in the retaurant list to lowercase*/
        const lcQuery = query.toLowerCase(); /* convert search string to lowercase*/
        return  lcItem.includes(lcQuery); /* find search string matches in the restaurant list name fields*/
    });
  }
  
   /*
      ## Main Event
        Separating your main programming from your side functions will help you organize your thoughts
        When you're not working in a heavily-commented "learning" file, this also is more legible
        If you separate your work, when one piece is complete, you can save it and trust it
    */
  async function mainEvent() {
   
  
    const form = document.querySelector('.main_form'); // get your main form so you can do JS with it
    //const submit = document.querySelector('button[type="submit"]'); // get a reference to your submit button
    const submit = document.querySelector('#get-resto'); // get a reference to your submit button
  
    const loadAnimation = document.querySelector('.lds-ellipsis'); // get a reference to your loading animation
    submit.style.display = 'none'; // let your submit button disappear
  
    console.log("before API fetch");
    /* Let's get some data from the API - it will take a second or two to load */
    /* the async keyword means we can make API requests */
    const results = await fetch('https://data.princegeorgescountymd.gov/resource/umjn-t2iz.json');
    const arrayFromJson = await results.json(); // here is where we get the data from our request as JSON
  
    /*
      Below this comment, we log out a table of all the results:
    */
    //console.table(arrayFromJson); # comment out if we want to see the whole downloaded info
    console.log("after API fetch");
   
    //console.table(arrayFromJson.data); /* print all array on console */
  
    // As a next step, log the first entry from your returned array of data.
    // https:/developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
    console.log(arrayFromJson[0]);
  
    // Now write a log using string interpolation - log out the name and category of your first returned entry (index [0]) to the browser console
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Property_accessors
    console.log(`${arrayFromJson[0].name} ${arrayFromJson[0].category}`);
  
    // This IF statement ensures we can't do anything if we don't have information yet
    if (arrayFromJson?.length > 0) { // the question mark in this means "if this is set at all"
      submit.style.display = 'block'; // let's turn the submit button back on by setting it to display as a block when we have data available
      loadAnimation.classList.remove('lds-ellipsis');
      loadAnimation.classList.add('lds-ellipsis_hidden');
  
      let currentList = [];
      form.addEventListener('input', (event) =>{
          //console.log(event.target.value);
          const filteredList =filterList(currentList,event.target.value)
          injectHTML(filteredList);
      });

      // And here's an eventListener! It's listening for a "submit" button specifically being clicked
      // this is a synchronous event event, because we already did our async request above, and waited for it to resolve
      form.addEventListener('submit', (submitEvent) => {
        // Using .preventDefault, stop the page from refreshing when a submit event happens
        submitEvent.preventDefault()
        // https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault
        
        // This constant will contain the value of your 15-restaurant collection when it processes
        currentList = processRestaurants(arrayFromJson);
        console.log(currentList);
  
        // And this function call will perform the "side effect" of injecting the HTML list for you
        injectHTML(currentList);
      });
    }
  }
  
  /*
    This last line actually runs first!
    It's calling the 'mainEvent' function at line 57
    It runs first because the listener is set to when your HTML content has loaded
  */
  document.addEventListener('DOMContentLoaded', async () => mainEvent()); // the async keyword means we can make API requests
  