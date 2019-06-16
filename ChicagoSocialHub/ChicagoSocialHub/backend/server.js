////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////


/// This file and the source code provided can be used only for
/// the projects and assignments of this course

/// Last Edit by Purna Sahithi Adduri : 5/29/2019


////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
//////////////////////              SETUP NEEDED                ////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

//  Install Nodejs (the bundle includes the npm) from the following website:
//      https://nodejs.org/en/download/


//  Before you start nodejs make sure you install from the
//  command line window/terminal the following packages:
//      1. npm install express
//      2. npm install pg
//      3. npm install pg-format
//      4. npm install moment --save
//      5. npm install elasticsearch


//  Read the docs for the following packages:
//      1. https://node-postgres.com/
//      2.  result API:
//              https://node-postgres.com/api/result
//      3. Nearest Neighbor Search
//              https://postgis.net/workshops/postgis-intro/knn.html
//      4. https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/quick-start.html
//      5. https://momentjs.com/
//      6. http://momentjs.com/docs/#/displaying/format/


////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////


const express = require('express');

var pg = require('pg');

var bodyParser = require('body-parser');

const moment = require('moment');


// Connect to elasticsearch Server

const elasticsearch = require('elasticsearch');
const esClient = new elasticsearch.Client({
  host: '127.0.0.1:9200',
  log: 'error'
});


// Connect to PostgreSQL server

var conString = "pg://postgres:root@127.0.0.1:5432/chicago_divvy_stations";
var pgClient = new pg.Client(conString);
pgClient.connect();

var find_places_task_completed = false;


const app = express();
const router = express.Router();


app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

router.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});




var places_found = [];
var stations_found = [];
var stations_logs = [];
var place_selected;
var date;
var newDate;
var one;
var all_stations_found_log = [];
var allRecords = []



/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////

//////   The following are the routes received from NG/Browser client        ////////

/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////



router.route('/places').get((req, res) => {

  res.json(places_found)

});



router.route('/place_selected').get((req, res) => {
  res.json(place_selected)

});



router.route('/allPlaces').get((req, res) => {

  res.json(places_found)

});




router.route('/stations').get((req, res) => {
  res.json(stations_found)

});


router.route('/allstations').get((req, res) => {
  res.json(stations_found)

});



router.route('/places/find').post((req, res) => {

  var str = JSON.stringify(req.body, null, 4);
  find_places_task_completed = false;
  find_places_from_yelp(req.body.find, req.body.where).then(function (response) {
    var hits = response;
    res.json(places_found);
  });

});

router.route('/stations/find').post((req, res) => {

  var str = JSON.stringify(req.body, null, 4);

  for (var i = 0, len = places_found.length; i < len; i++) {

    if (places_found[i].name === req.body.placeName) { // strict equality test

      place_selected = places_found[i];

      break;
    }
  }

  const query = {
    // give the query a unique name
    name: 'fetch-divvy',
    text: ' SELECT * FROM divvy_stations_status ORDER BY (divvy_stations_status.where_is <-> ST_POINT($1,$2)) LIMIT 3',
    values: [place_selected.latitude, place_selected.longitude]
  }


  find_stations_from_divvy(query).then(function (response) {
    var hits = response;
    res.json({ 'stations_found': 'Added successfully' });
  });


});

router.route('/allstations/find').post((req, res) => {
  var str = JSON.stringify(req.body, null, 4);

  for (var i = 0, len = places_found.length; i < len; i++) {

    if (places_found[i].name === req.body.placeName) { // strict equality test

      place_selected = places_found[i];

      break;
    }
  }

  const query = {
    // give the query a unique name
    name: 'fetch-divvy1',
    text: ' SELECT * FROM divvy_stations_status ORDER BY (divvy_stations_status.where_is <-> ST_POINT($1,$2))',
    values: [place_selected.latitude, place_selected.longitude]
  }


  find_stations_from_divvy(query).then(function (response) {
    var hits = response;
    res.json({ 'stations_found': 'Added successfully' });
  });


});

//This is not used currently
router.route('/logs').get((req, res) => {
  res.json(stations_found_log)
});


router.route('/logs/findlog').post((req, res) => {
  const query = {
    // give the query a unique name
    name: 'fetch-divvy_log',
    text: ' SELECT stationName,availablebikes,availabledocks,lastcommunicationtime FROM divvy_stations_logs WHERE stationName = $1 ORDER BY lastcommunicationtime DESC',
    values: [req.body.placeName]
  }


  find_stations_from_divvy_log(query).then(function (response) {
    var hits = response;
    res.json({ 'stations_found_log': 'Added successfully' });
  });


});


//Fetches all logs(currently used in heat map)
router.route('/alllogs').get((req, res) => {
  res.json(all_stations_found_log);
});

router.route('/alllogs/findall').post((req, res) => {
  //console.log(req.body);
  var str = JSON.stringify(req.body, null, 4);
  find_places_task_completed = false;
  find_all_logs(req.body.where, req.body.time).then(function (response) {
    var hits = response;
    res.json({ 'all_stations_found_log': 'Added successfully' });

  });
});


//Feching divvy stations logs for the selected place
router.route('/logs/find').post((req, res) => {
  var str = JSON.stringify(req.body, null, 4);
  find_places_task_completed = false;
  find_docks_from_logs(req.body.placeName, req.body.where).then(function (response) {
    var hits = response;
    res.json({ 'stations_found_log': 'Added successfully' });
  });
});



/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////

////////////////////    Divvy - PostgreSQL - Client API            /////////////////

////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////


async function find_stations_from_divvy(query) {

  const response = await pgClient.query(query);

  stations_found = [];

  for (i = 0; i < 3; i++) {

    plainTextDateTime = moment(response.rows[i].lastcommunicationtime).format('YYYY-MM-DD, h:mm:ss a');


    var station = {
      "id": response.rows[i].id,
      "stationName": response.rows[i].stationname,
      "availableBikes": response.rows[i].availablebikes,
      "availableDocks": response.rows[i].availabledocks,
      "is_renting": response.rows[i].is_renting,
      "lastCommunicationTime": plainTextDateTime,
      "latitude": response.rows[i].latitude,
      "longitude": response.rows[i].longitude,
      "status": response.rows[i].status,
      "totalDocks": response.rows[i].totaldocks
    };
    stations_found.push(station);

  }


}

async function find_stations_from_divvy_log(query) {

  const response = await pgClient.query(query);
  stations_found_log = [];

  for (i = 0; i < response.rows.length; i++) {

    plainTextDateTime = moment(response.rows[i].lastcommunicationtime).format('YYYY-MM-DD, h:mm:ss a');


    var station = {
      "id": response.rows[i].id,
      "stationName": response.rows[i].stationname,
      "availableBikes": response.rows[i].availablebikes,
      "availableDocks": response.rows[i].availabledocks,
      "is_renting": response.rows[i].is_renting,
      "lastCommunicationTime": plainTextDateTime,
      "latitude": response.rows[i].latitude,
      "longitude": response.rows[i].longitude,
      "status": response.rows[i].status,
      "totalDocks": response.rows[i].totaldocks
    };

    stations_found_log.push(station);
  }


}







/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////

////////////////////    Yelp - ElasticSerch - Client API            /////////////////

////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////



async function find_places_from_yelp(place, where) {

  places_found = [];

  //////////////////////////////////////////////////////////////////////////////////////
  // Using the business name to search for businesses will leead to incomplete results
  // better to search using categorisa/alias and title associated with the business name
  // For example one of the famous places in chicago for HotDogs is Portillos
  // However, it also offers Salad and burgers
  // Here is an example of a busness review from Yelp for Pertilos
  //               alias': 'portillos-hot-dogs-chicago-4',
  //              'categories': [{'alias': 'hotdog', 'title': 'Hot Dogs'},
  //                             {'alias': 'salad', 'title': 'Salad'},
  //                             {'alias': 'burgers', 'title': 'Burgers'}],
  //              'name': "Portillo's Hot Dogs",
  //////////////////////////////////////////////////////////////////////////////////////


  let body = {
    size: 1000,
    from: 0,
    "query": {
      "bool": {
        "must": {
          "term": { "categories.alias": place }
        },


        "filter": {
          "term": { "location.address1": where }
        },


        "must_not": {
          "range": {
            "rating": { "lte": 3 }
          }
        },

        "must_not": {
          "range": {
            "review_count": { "lte": 500 }
          }
        },

        "should": [
          { "term": { "is_closed": "false" } }
        ],
      }
    }
  }


  results = await esClient.search({ index: 'chicago_yelp_reviews', body: body });

  results.hits.hits.forEach((hit, index) => {


    var place = {
      "name": hit._source.name,
      "display_phone": hit._source.display_phone,
      "address1": hit._source.location.address1,
      "is_closed": hit._source.is_closed,
      "rating": hit._source.rating,
      "review_count": hit._source.review_count,
      "latitude": hit._source.coordinates.latitude,
      "longitude": hit._source.coordinates.longitude
    };

    places_found.push(place);

  });

  find_places_task_completed = true;

}

//This fectch logs for stations of selected place
async function find_docks_from_logs(place, where) {

  stations_found_log = [];

  var datetime = new Date();
  var targetTime = new Date(datetime);
  var tzDifference = targetTime.getTimezoneOffset();
  //convert the offset to milliseconds, add to targetTime, and make a new Date
  datetime = new Date(targetTime.getTime() - tzDifference * 60 * 1000);

  var now = datetime.toISOString().slice(0, -5).replace('Z', ' ').replace('T', ' ');

  var diffHours;

  if (where == "1 hr" ? diffHours = datetime.getHours() - 1 : where == "24 hr" ? diffHours = datetime.getHours() - 25 : diffHours = datetime.getHours() - 178);

  datetime.setHours(diffHours);
  datetime.setMinutes(datetime.getMinutes())
  var gte = datetime.toISOString().slice(0, -5).replace('Z', ' ').replace('T', ' ');

  //////////////////////////////////////////////////////////////////////////////////////
  // Using the business name to search for businesses will leead to incomplete results
  // better to search using categorisa/alias and title associated with the business name
  // For example one of the famous places in chicago for HotDogs is Portillos
  // However, it also offers Salad and burgers
  // Here is an example of a busness review from Yelp for Pertilos
  //               alias': 'portillos-hot-dogs-chicago-4',
  //              'categories': [{'alias': 'hotdog', 'title': 'Hot Dogs'},
  //                             {'alias': 'salad', 'title': 'Salad'},
  //                             {'alias': 'burgers', 'title': 'Burgers'}],
  //              'name': "Portillo's Hot Dogs",
  //////////////////////////////////////////////////////////////////////////////////////


  let body = {
    size: 100000,
    from: 0,
    "query": {

      "bool": {
        "filter":
        {
          "bool": {
            "must": [{
              "match": { "stationName.keyword": place }

            },
            {
              "range": {
                "lastCommunicationTime.keyword": {
                  "gte": gte,
                  "lt": now
                }
              }
            }
            ]
          }


        }

      }


    },
    "sort": [
      { "lastCommunicationTime.keyword": { "order": "desc" } },

    ]

  }
  results = await esClient.search({ index: 'divvy_stations_logs', scroll: '10m', body: body });
  results.hits.hits.forEach((hit, index) => {

    // plainTextDateTime =  moment(hit._source.lastcommunicationtime).format('YYYY-MM-DD, h:mm:ss a');
    var station = {
      "id": hit._source.id,
      "stationName": hit._source.stationName,
      "availableBikes": hit._source.availableBikes,
      "availableDocks": hit._source.availableDocks,
      "is_renting": hit._source.is_renting,
      "lastCommunicationTime": hit._source.lastCommunicationTime,
      "latitude": hit._source.latitude,
      "longitude": hit._source.longitude,
      "status": hit._source.status,
      "totalDocks": hit._source.totalDocks
    };

    stations_found_log.push(station);

  });
  find_places_task_completed = true;

}

//Fetch all logs for stations currently used for ploting heat map
async function find_all_docks_logs(when) {

  all_stations_found_log = [];

  var datetime = new Date();
  var targetTime = new Date(datetime);
  var tzDifference = targetTime.getTimezoneOffset();
  //convert the offset to milliseconds, add to targetTime, and make a new Date
  datetime = new Date(targetTime.getTime() - tzDifference * 60 * 1000);

  var now = datetime.toISOString().slice(0, -5).replace('Z', ' ').replace('T', ' ');

  var diffHours;

  if (when == "1 hr" ? diffHours = datetime.getHours() - 1 : when == "24 hr" ? diffHours = datetime.getHours() - 25 : diffHours = datetime.getHours() - 178);

  datetime.setHours(diffHours);
  datetime.setMinutes(datetime.getMinutes() - 2)
  var gte = datetime.toISOString().slice(0, -5).replace('Z', ' ').replace('T', ' ');


  //////////////////////////////////////////////////////////////////////////////////////
  // Using the business name to search for businesses will leead to incomplete results
  // better to search using categorisa/alias and title associated with the business name
  // For example one of the famous places in chicago for HotDogs is Portillos
  // However, it also offers Salad and burgers
  // Here is an example of a busness review from Yelp for Pertilos
  //               alias': 'portillos-hot-dogs-chicago-4',
  //              'categories': [{'alias': 'hotdog', 'title': 'Hot Dogs'},
  //                             {'alias': 'salad', 'title': 'Salad'},
  //                             {'alias': 'burgers', 'title': 'Burgers'}],
  //              'name': "Portillo's Hot Dogs",
  //////////////////////////////////////////////////////////////////////////////////////


  let body = {
    size: 10000,
    from: 0,
    "query": {

      "bool": {
        "filter":
        {
          "bool": {
            "must": [{

              "range": {
                "lastCommunicationTime.keyword": {
                  "gte": gte,
                  "lt": now
                }
              }

            },

            ]
          }


        }

      }


    },
    "sort": [
      { "lastCommunicationTime.keyword": { "order": "asc" } },

    ]

  }


  results = await esClient.search({ index: 'divvy_stations_logs', body: body });

  results.hits.hits.forEach((hit, index) => {

    // plainTextDateTime =  moment(hit._source.lastcommunicationtime).format('YYYY-MM-DD, h:mm:ss a');
    var station = {
      "id": hit._source.id,
      "stationName": hit._source.stationName,
      "availableBikes": hit._source.availableBikes,
      "availableDocks": hit._source.availableDocks,
      "is_renting": hit._source.is_renting,
      "lastCommunicationTime": hit._source.lastCommunicationTime,
      "latitude": hit._source.latitude,
      "longitude": hit._source.longitude,
      "status": hit._source.status,
      "totalDocks": hit._source.totalDocks

    };

    all_stations_found_log.push(station);

  });
  find_places_task_completed = true;
}

async function find_all_logs(timeLimit, currentTime) {
  var limit = timeLimit.split(" ", 1);

  currentTime = new Date(currentTime);
  if (timeLimit.includes('Minutes')) {
    if (timeLimit === '2 Minutes') {
      one = new Date(currentTime.getTime() - limit * 60 * 1000);
      gte = currentTime.toISOString().replace('Z', '').replace('T', ' ').slice(0, -4);
      lt = one.toISOString().replace('Z', '').replace('T', ' ').slice(0, -4);
    } else {
      date = new Date();
      newDate = new Date(date - date.getTimezoneOffset() * 6e4);
      newDate = new Date(currentTime.getTime() + (limit - 2) * 60 * 1000);
      one = new Date(newDate.getTime() + 2 * 60 * 1000);
      gte = newDate.toISOString().replace('Z', '').replace('T', ' ').slice(0, -4);
      lt = one.toISOString().replace('Z', '').replace('T', ' ').slice(0, -4);
    }
  } else if (timeLimit.includes('HOUR')) {
    if (timeLimit === '1 HOUR') {
      one = new Date(currentTime);
      one.setMinutes(currentTime.getMinutes() + 30);
      gte = currentTime.toISOString().replace('Z', '').replace('T', ' ').slice(0, -4);
      lt = one.toISOString().replace('Z', '').replace('T', ' ').slice(0, -4);
    } else {
      currentTime.setMinutes(currentTime.getMinutes() + (limit * 30));
      one = new Date(currentTime);
      one.setMinutes(currentTime.getMinutes() + 30);
      gte = currentTime.toISOString().replace('Z', '').replace('T', ' ').slice(0, -4);
      lt = one.toISOString().replace('Z', '').replace('T', ' ').slice(0, -4);
    }
  } else {
    if (timeLimit === '1 DAY') {
      one = new Date(currentTime);
      one.setHours(currentTime.getHours() + 12);
      gte = currentTime.toISOString().replace('Z', '').replace('T', ' ').slice(0, -4);
      lt = one.toISOString().replace('Z', '').replace('T', ' ').slice(0, -4);
    } else {
      currentTime.setHours(currentTime.getHours() + (limit * 12));
      one = new Date(currentTime);
      one.setHours(currentTime.getHours() + 12);
      gte = currentTime.toISOString().replace('Z', '').replace('T', ' ').slice(0, -4);
      lt = one.toISOString().replace('Z', '').replace('T', ' ').slice(0, -4);
    }
  }

  var sizeVal;
  var scrollVal;
  var limit = timeLimit.split(" ", 1);
  if (timeLimit.includes('Minutes')) {
    sizeVal = 1000000;
    scrollVal = '4s';

  }
  if (timeLimit.includes('HOUR')) {
    sizeVal = 1000000;
    scrollVal = '20s';
  }
  if (timeLimit.includes('DAY')) {
    sizeVal = 1000000;
    scrollVal = '60s';
  }


  esClient.search({
    index: 'divvy_stations_logs',
    type: 'logs',
    scroll: scrollVal,
    size: 100000,
    from: 0,
    body: {

      query: {
        "bool": {
          "filter":
          {
            "bool": {
              "must": [
                {
                  "range": {
                    "lastCommunicationTime.keyword": {
                      "gte": gte,
                      "lt": lt
                    }
                  }
                }
              ]
            }


          }

        }
      }, "sort": [{ "lastCommunicationTime.keyword": { "order": "desc" } },]
    }
  }, function getMoreUntilDone(error, response) {
    // collect all the records
    if (typeof response !== 'undefined') {
      if (typeof response.hits !== 'undefined') {
        all_stations_found_log = [];
        response.hits.hits.forEach(function (hit) {
          allRecords.push(hit);
          var docks = {
            "availableDocks": hit._source.availableDocks,
            "latitude": hit._source.latitude,
            "longitude": hit._source.longitude,
            "gte": gte,
            "now": lt
          };
          all_stations_found_log.push(docks);
          allRecords = [];
        });
        //console.log(all_stations_found_log.length);

        if (response.hits.total !== allRecords.length) {
          if (timeLimit.includes('HOUR')) {
            if (all_stations_found_log.length > 8000) {

              all_stations_found_log.length = 1000;
            }
          }
          else if (timeLimit.includes('DAY')) {
            if (all_stations_found_log.length > 10000) {
              //console.log("inside hr reduced length");
              all_stations_found_log.length = 5000;
            }

          }
          else {

          }

          esClient.scroll({
            scrollId: response._scroll_id,
            scroll: scrollVal,
            size: 1000000,
            from: 0
          }, getMoreUntilDone);
        } else {
          // console.log('all done');
        }
      }
    }
  });
  find_places_task_completed = true;

}



app.use('/', router);

app.listen(4000, () => console.log('Express server running on port 4000'));
