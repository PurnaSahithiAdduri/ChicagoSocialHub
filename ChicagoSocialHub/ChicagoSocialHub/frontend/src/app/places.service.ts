////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////


/// This file and the source code provided can be used only for
/// the projects and assignments of this course

/// Last Edit by Purna Sahithi Adduri: 1/30/2019


////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////



import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Place } from './place';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class PlacesService {

  uri = 'http://localhost:4000';
  intervalId;
  realTimeEmmiter;

  constructor(private http: HttpClient) {
  }

  getPlaces(): Observable<Place[]> {
    return this.http.get<Place[]>(`${this.uri}/places`);
  }

  getPlaceSelected() {
    return this.http.get(`${this.uri}/place_selected`);
  }

  getStations() {
    return this.http.get(`${this.uri}/stations`);
  }

  getAllStations() {
    return this.http.get(`${this.uri}/stations`);
  }

  getStationslog() {
    return this.http.get(`${this.uri}/logs`);
  }

  getAllDivvyStationslogs() {
    return this.http.get(`${this.uri}/allstations`);
  }



  fetchStationslogSMA = (stationName): Observable<Response> => {
    return Observable.create(observer => {
      this.realTimeEmmiter = observer;
      this.intervalId = setInterval(() => {
        observer.next({
          fetchStationslog(stationName, where) {
            const find_stations_at = {
              placeName: stationName,
              where: where
            };
            var str = JSON.stringify(find_stations_at, null, 2);
            return this.http.post(`${this.uri}/logs/findlog`, find_stations_at, httpOptions);
          }
        });
      }, 6000);
    });
  }


  findPlaces(find, where) {
    const find_places_at = {
      find: find,
      where: where
    };
    return this.http.post(`${this.uri}/places/find`, find_places_at, httpOptions);

  }



  findStations(placeName) {
    const find_stations_at = {
      placeName: placeName
    };
    var str = JSON.stringify(find_stations_at, null, 2);
    return this.http.post(`${this.uri}/stations/find`, find_stations_at, httpOptions);
  }

  fetchStationslog(stationName, where) {
    const find_stations_at = {
      placeName: stationName,
      where: where
    };
    var str = JSON.stringify(find_stations_at, null, 2);
    return this.http.post(`${this.uri}/logs/find`, find_stations_at, httpOptions);
  }

  realTimeStationLog = (stationName, where): Observable<Response> => {
    return Observable.create(observer => {
      this.realTimeEmmiter = observer;
      this.intervalId = setInterval(() => {
        observer.next({
          fetchStationslog(stationName, where) {
            const find_stations_at = {
              placeName: stationName,
              where: where
            };
            var str = JSON.stringify(find_stations_at, null, 2);
            return this.http.post(`${this.uri}/logs/find`, find_stations_at, httpOptions);

          }
        });
      }, 6000);
    });
  }


  allStationLog = (where): Observable<Response> => {
    return Observable.create(observer => {
      this.realTimeEmmiter = observer;
      this.intervalId = setInterval(() => {
        observer.next({
          fetchAllStationslog(where) {
            const find_stations_at = {
              where: where
            };
            var str = JSON.stringify(find_stations_at, null, 2);
            return this.http.post(`${this.uri}/alllogs/findall`, find_stations_at, httpOptions);
          }
        });
      }, 1000);
    });
  }

  allStationLog1 = (where): Observable<Response> => {
    return Observable.create(observer => {
      this.realTimeEmmiter = observer;
      this.intervalId = setInterval(() => {
        observer.next({
          getAllDivvyStationsLogs(name) {
            const find_stations_at = {
              placeName: name
            };
            var str = JSON.stringify(find_stations_at, null, 2);
            return this.http.post(`${this.uri}/allstations/find`, find_stations_at, httpOptions);
          }
        });
      }, 6000);
    });
  }

  refreshHeatMap = (where): Observable<Response> => {
    return Observable.create(observer => {
      this.realTimeEmmiter = observer;
      this.intervalId = setInterval(() => {
        observer.next({
          fetchAllStationslog(where, time) {

            const find_stations_at = {
              where: where,
              time: time
            };
            var str = JSON.stringify(find_stations_at, null, 2);
            return this.http.post(`${this.uri}/alllogs/findall`, find_stations_at, httpOptions);
          }
        });
      }, 240000);
    });
  }

  getallStationslog() {
    return this.http.get(`${this.uri}/alllogs`);
  }



  fetchAllStationslog(where, time) {
    const find_stations_at = {
      where: where,
      time: time
    };
    var str = JSON.stringify(find_stations_at, null, 2);

    return this.http.post(`${this.uri}/alllogs/findall`, find_stations_at, httpOptions);
  }

  getAllDivvyStationsLogs(name) {
    const find_stations_at = {
      placeName: name
    };
    var str = JSON.stringify(find_stations_at, null, 2);
    return this.http.post(`${this.uri}/allstations/find`, find_stations_at, httpOptions);
  }


}
