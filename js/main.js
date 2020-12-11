// make valid url for starships API
const shipsUrl = i => `https://swapi.dev/api/starships/${i}`

// make valid url for films urls
const filmsUrl = i => `https://swapi.dev/api/films/${i}`

/**
 * define parameters to control
 * number of requests
 * and how many ships we want
 */

const neededShips = 10
const maxAPITries = floor(neededShips * 2.5)
const totalFilms = 6

/**
 * in allShipe, we save the fetched data
 * and use it on click
 */
const allShips = []

/**
 * if all of our promises fail,
 * it means that we couldn't connect to server
 * so we delete all html
 * and show an error message in red
 */
function noConnection(err) {
    document.write(`<h2 style="color:red;">cannot connect to the server because of : ${err}</h2>`)
}


/**
 * nothing but create a promise from ships jsons!
 */
function consumeShipJsons(jsons) {
    return Promise.resolve(jsons)
}

/**
 * create a url to json map
 * from responses of films api
 */
function consumeFilmJsons(jsons) {
    const allFilmsData = {}
    jsons.forEach(film => {
        allFilmsData[film.url] = film
    })
    return Promise.resolve(allFilmsData)
}

/**
 * handle array of all requests
 * remove 404s and errors
 * and just filter ok ones
 * take only "maxWanted" first answers
 */
function getAcceptedsJsons(responses, maxWanted){
    return Promise.all(
        responses
        .filter((resp)=> resp.ok) // take only accepted requests
        .slice(0, maxWanted) // limit answers to 10
        .map(resp => resp.json())
    )
}


/**
 * create array
 * create urls with the help of urlMaker
 * and fetch apis
 * and return promises
 */
function sendRequests(urlMaker, maxTries){
    return Promise.all( // combine all of promises to one single promise
        Array(maxTries) // create a big enough array for requests
        .fill()
        .map((_,i) => i+1) // fill it with  1..n
        .map((i) => urlMaker(i)) // map to that url
        .map((url) => fetch(url)) // finally, create fetch promises
    )
}


/**
 * aggreagete data:
 * connect fetched films
 * with their ships
 */
function connectShipsFilms(mat){
    const ships = mat[0]
    const films = mat[1]

    ships.forEach(ship =>{ // for each ship
        // map film urls to actual films
        ship.films = ship.films.map(filmUrl => films[filmUrl])
    })

    // also save data to global variable
    allShips.push(...ships)

    return Promise.resolve(ships)
}


/**
 * after fetching apis,
 * we should display new data in the box
 * so we hide the loading element
 */
function stopLoading(){
    [...document
        .getElementsByClassName("loadingStuff")]
        .forEach(ls => ls.classList.add("hidden"))

}


function createItemElements(){



    stopLoading()
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
        .then(r => getAcceptedsJsons(r, neededShips), noConnection)
        .then(consumeShipJsons)

    /**
     * send requests for all films
     */
    const filmPromises = sendRequests(filmsUrl, totalFilms)
        .then(r => getAcceptedsJsons(r, totalFilms), noConnection)
        .then(consumeFilmJsons)

    /**
     * aggregate responses:
     * connect films with ships
     */
    Promise.all([shipsPromises, filmPromises])
        .then(connectShipsFilms)
        .then(createItemElements)

}

main()
