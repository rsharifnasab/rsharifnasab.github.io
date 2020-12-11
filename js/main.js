// make valid url for starships API
const shipsUrl = (i) => `https://swapi.dev/api/starships/${i}`;

// make valid url for films urls
const filmsUrl = (i) => `https://swapi.dev/api/films/${i}`;

/**
 * define parameters to control
 * number of requests
 * and how many ships we want
 */
const neededShips = 10;
const maxAPITries = Math.floor(neededShips * 2.5);
const totalFilms = 6;

/**
 * in allShipe, we save the fetched data
 * and use it on click
 */
const allShips = [];

/**
 * if all of our promises fail,
 * it means that we couldn't connect to server
 * so we delete all html
 * and show an error message in red
 * @param {String} err - an error message showing that why fetch failed
 */
function noConnection(err) {
  document.write(`<h2 style="color:red;">\
        cannot connect to the server because of : ${err}\
        </h2>`);
}


/**
 * nothing but create a promise from ships jsons!
 * @param {Object} jsons - an object containing al informations about ships
 * @return {Promise.<Object>} - promise from jsons
 */
function consumeShipJsons(jsons) {
  return Promise.resolve(jsons);
}

/**
 * create a url to json map
 * from responses of films api
 * @param {Object} jsons an object containing all film info
 * @return {Promise.<Object>} promise from jsons
 */
function consumeFilmJsons(jsons) {
  const allFilmsData = {};
  jsons.forEach((film) => {
    allFilmsData[film.url] = film;
  });
  return Promise.resolve(allFilmsData);
}

/**
 * handle array of all requests
 * remove 404s and errors
 * and just filter ok ones
 * take only "maxWanted" first answers
 * @param {Array.<Response>} responses
 * @param {Number} maxWanted - answers limit
 * @return {Promise.<Array>} promise from jsons
 */
function getAcceptedsJsons(responses, maxWanted) {
  return Promise.all(
      responses
          .filter((resp)=> resp.ok) // take only accepted requests
          .slice(0, maxWanted) // limit answers to 10
          .map((resp) => resp.json()),
  );
}


/**
 * create array
 * create urls with the help of urlMaker
 * and fetch apis
 * @param {Function} urlMaker - how to create api url
 * @param {Number} maxTries - maximum number of requests
 * @return {Promise.<Array>} promises of requests
 */
function sendRequests(urlMaker, maxTries) {
  return Promise.all( // combine all of promises to one single promise
      Array(maxTries) // create a big enough array for requests
          .fill()
          .map((_, i) => i+1) // fill it with  1..n
          .map((i) => urlMaker(i)) // map to that url
          .map((url) => fetch(url)), // finally, create fetch promises
  );
}


/**
 * aggreagete data:
 * connect fetched films
 * with their ships
 * @param {Array.<Object>} mat - array that containing ships and films object
 * @return {Promise.<Object>} - create new promise of completed ships object
 */
function connectShipsFilms(mat) {
  const ships = mat[0];
  const films = mat[1];

  ships.forEach((ship) =>{ // for each ship
    // map film urls to actual films
    ship.films = ship.films.map((filmUrl) => films[filmUrl]);
  });

  // also save data to global variable
  allShips.push(...ships);

  return Promise.resolve(ships);
}


/**
 * after fetching apis,
 * we should display new data in the box
 * so we hide the loading element
 * select all members of loadingStuff class
 * and hide them
 */
function stopLoading() {
  [...document
      .getElementsByClassName('loadingStuff')]
      .forEach((ls) => ls.classList.add('hidden'));
  d = document
      .getElementById('dataBoxID')
      .classList
      .remove('hidden');
}

/**
 * create full html element (dl)
 * that contains all needed information
 * @param {Object} ship - needed json
 * @return {HTMLElement} created element
*/
function shipToHtmlFull(ship) {
  // which keys should be added to html
  const neededKeys = ['name', 'manufacturer', 'length',
    'max_atmosphering_speed', 'cargo_capacity', 'hyperdrive_rating'];

  // create a description list to caintain all info
  const elem = document.createElement('dl');

  // add all key, values except films
  neededKeys.forEach((key) => {
    const dt = document.createElement('dt');
    dt.innerHTML = key;
    elem.appendChild(dt);

    const dd = document.createElement('dd');
    dd.innerHTML = `-> ${ship[key]}`;
    elem.appendChild(dd);
  });

  // add films too
  const dt = document.createElement('dt');
  dt.innerHTML = 'films';
  elem.appendChild(dt);

  ship.films.forEach((film) => {
    const dd = document.createElement('dd');
    dd.innerHTML = `=> ${film.title}`;
    elem.appendChild(dd);
  });

  return elem;
}

/**
 * create on click function
 * for list items,
 * on click have information about that
 * and set it
 * @param {Object} ship - needed information
 * @return {Function} onclick function
*/
function createLiOnClick(ship) {
  const parent = document.getElementById('descBox');
  return (event)=>{
    const element = shipToHtmlFull(ship);

    parent.innerHTML = '';
    parent.appendChild(element);
  };
}

/**
 *
*/
function shipToHtmlBrief(ship, ind) {
  const elem = document.createElement('li');
  elem.className = 'shipItem';
  elem.innerHTML = `${ind+1} ${ship.name}`;
  elem.onclick = createLiOnClick(ship);

  return elem;
}

/**
*/
function createItemElements(shipsData) {
  const parent = document.getElementById('shipList');

  shipsData.forEach((ship, i) => {
    parent.appendChild(shipToHtmlBrief(ship, i));
  });


  stopLoading();
}

/**
 * main function of our javascipt part
 * create array of requests
 * and handle their responses
 */
function main() {
  /**
  * send 25 ships requests
  * and remove 404s
  */
  const shipsPromises = sendRequests(shipsUrl, maxAPITries)
      .then((r) => getAcceptedsJsons(r, neededShips), noConnection)
      .then(consumeShipJsons);

  /**
   * send requests for all films
   */
  const filmPromises = sendRequests(filmsUrl, totalFilms)
      .then((r) => getAcceptedsJsons(r, totalFilms), noConnection)
      .then(consumeFilmJsons);

  /**
   * aggregate responses:
   * connect films with ships
   */
  Promise.all([shipsPromises, filmPromises])
      .then(connectShipsFilms)
      .then(createItemElements);
}

main();
