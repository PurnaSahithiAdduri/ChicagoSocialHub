import { Component, OnInit, OnDestroy } from '@angular/core';
import { google } from "google-maps";
import { Station } from '../../station';
import { PlacesService } from '../../places.service';
import { Place } from 'src/app/place';
import { Router } from '@angular/router';
import { Subscription } from "rxjs";
import * as heatmap from 'heatmap.js'
import { ChartsFactory } from "../../chartsFactory"

interface Location {
  lat: number;
  lng: number;
  zoom: number;
  address_level_1?: string;
  address_level_2?: string;
  address_country?: string;
  address_zip?: string;
  address_state?: string;
  label: string;
}

@Component({
  selector: 'app-heat-map',
  templateUrl: './heat-map.component.html',
  styleUrls: ['./heat-map.component.css']
})
export class HeatMapComponent implements OnInit, OnDestroy {
  stations: Station[];
  markers: Station[];
  heatMapData: any[];
  newHeatMapData: any[] = [];
  heatMapData1: any[];
  placeSelected: Place;
  clearHeatMapData: any[];
  google: any;
  heatMapRefresh: Subscription;
  private map: google.maps.Map = null;
  heatmap: google.maps.visualization.HeatmapLayer = null;
  realTimeObserver: Subscription;

  selected = "1 hr";
  recordingTimer: any;
  i: any;
  hourlydata: any[];
  endTime: any;
  startTime: any;
  startHour: any;
  startDay: any;
  endHour: any;
  endDay: any;
  hourCache = 0;
  dayCache = 0;

  timerForMinute;
  hourlyTimer;
  timerfor7days;


  label;
  time;
  datetime;
  now;
  deduction;
  upperBound;
  lowerBound;
  date;
  daysBack: any;
  heatMap;
  datetimeOffset;
  datetimeOffset24Hr;
  newDt;

  minuteCount;
  hourlyCount;
  dayCount

  newDate;
  one;
  myDate;




  constructor(private placesService: PlacesService, private router: Router) { }

  ngOnInit() {
    if (this.selected == "1 hr") {
      this.minuteCount = 2;
      this.hourlyCount = 1;
      this.dayCount = 1;
      this.gc();
      this.datetime = new Date();
      var targetTime = new Date(this.datetime);
      var tzDifference = targetTime.getTimezoneOffset();
      this.datetimeOffset = new Date(targetTime.getTime() - tzDifference * 60 * 1000);
      this.datetimeOffset.setHours(this.datetimeOffset.getHours() - 1);
    } else if (this.selected == "24 hr") {
      this.gc();
      this.datetime = new Date();
      var targetTime = new Date(this.datetime);
      var tzDifference = targetTime.getTimezoneOffset();
      this.datetimeOffset = new Date(targetTime.getTime() - tzDifference * 60 * 1000);
      this.datetimeOffset24Hr.setHours(this.datetimeOffset.getHours() - 24);

    } else {
      this.gc();
      this.datetime = new Date();
      var targetTime = new Date(this.datetime);
      var tzDifference = targetTime.getTimezoneOffset();
      this.datetimeOffset = new Date(targetTime.getTime() - tzDifference * 60 * 1000);
      this.datetimeOffset.setHours(this.datetimeOffset.getHours() - 168);
    }
    //Creating object for the factory class
    const chartsFactory = new ChartsFactory();

    //Return object for HeatMap Class that plot Heat Map
    this.heatMap = chartsFactory.createHeatMap();
    this.doSync();


  }

  ngOnDestroy() {
    this.stopTimer(this.hourlyTimer, "1 hr");
    this.stopTimer(this.timerForMinute, "24 hrs");
    this.stopTimer(this.timerfor7days, "168 hrs");
    if (this.heatMapRefresh !== undefined) {
      this.heatMapRefresh.unsubscribe();
    }
  }

  public location: Location = {
    lat: 41.882607,
    lng: -87.643548,
    label: 'You are Here',
    zoom: 10
  };

  updateTimeRange() {
    this.clearHeatMap();
    if (this.selected == "1 hr") {
      this.gc();
      this.stopTimer(this.hourlyTimer, "1 hr");
      this.stopTimer(this.timerfor7days, "168 hrs");
      this.clearHeatMap();
      this.plotForMinute();

      this.datetime = new Date();
      var targetTime = new Date(this.datetime);
      var tzDifference = targetTime.getTimezoneOffset();
      this.datetimeOffset = new Date(targetTime.getTime() - tzDifference * 60 * 1000);
      this.clearHeatMap();
      this.datetimeOffset.setHours(this.datetimeOffset.getHours() - 1);
    }
    else if (this.selected == "24 hr") {
      this.clearHeatMap();
      this.gc();
      this.stopTimer(this.timerForMinute, "24 hrs");
      this.stopTimer(this.timerfor7days, "168 hrs");
      this.datetime = new Date();
      var targetTime = new Date(this.datetime);
      var tzDifference = targetTime.getTimezoneOffset();
      this.datetimeOffset24Hr = new Date(targetTime.getTime() - tzDifference * 60 * 1000);
      this.datetimeOffset24Hr.setTime(this.datetimeOffset24Hr.getTime() - 24 * 60 * 60 * 1000);
      this.clearHeatMap();
      this.plotHourly();


    }
    else if (this.selected == "168 hr") {
      this.clearHeatMap();
      this.gc();
      this.stopTimer(this.hourlyTimer, "1 hr");
      this.stopTimer(this.timerForMinute, "24 hrs");

      this.datetime = new Date();
      var targetTime = new Date(this.datetime);
      var tzDifference = targetTime.getTimezoneOffset();
      this.datetimeOffset = new Date(targetTime.getTime() - tzDifference * 60 * 1000);
      this.datetimeOffset.setHours(this.datetimeOffset.getHours() - 168);
      this.clearHeatMap();
      this.plotFor7Days();
    }
    else {
      console.log("Invalid Option");
    }
  }


  stopTimer(timer, timeRange) {
    for (var i = 0; i <= timer; i++) {
      clearTimeout(timer);

      if (timeRange === "1 hr") {
        this.clearHeatMap();
        clearTimeout(this.hourlyTimer);
        clearTimeout(this.timerfor7days);
        this.clearHeatMap();
        this.hourlyCount = 1;
        this.dayCount = 1;
        this.minuteCount = 2;
      } else if (timeRange === "24 hrs") {

        clearTimeout(this.timerfor7days);
        clearTimeout(this.timerForMinute);
        this.clearHeatMap();
        this.minuteCount = 60;
        this.hourlyCount = 1;
        this.dayCount = 1;
      } else {

        clearTimeout(this.hourlyTimer);
        clearTimeout(this.timerForMinute);
        this.clearHeatMap();
        this.dayCount = 7;
        this.hourlyCount = 1;
        this.minuteCount = 2;
      }
    }
  }

  plotForMinute() {

    clearTimeout(this.hourlyTimer);
    clearTimeout(this.timerfor7days);
    if (this.minuteCount < 62) {
      this.placesService.fetchAllStationslog(this.minuteCount + ' Minutes', this.datetimeOffset).subscribe((data: Station[]) => {
        this.setLablefor1Hour(this.minuteCount + ' Minutes', this.datetimeOffset);
        this.minuteCount = this.minuteCount + 2;
        this.clearHeatMap();
        this.fetchAllStationslog();
        this.timerForMinute = setTimeout(() => this.plotForMinute(), 1200);
      });

    }

  }



  setLablefor1Hour(timeLimit, currentTime) {
    var date;
    var newDate;
    var one;
    var limit = timeLimit.split(" ", 1);
    if (timeLimit === '2 Minutes') {
      one = new Date(currentTime.getTime() - 4 * 60 * 100);
      var gte = currentTime.toISOString().replace('Z', '').replace('T', ' ').slice(0, -7);
      var lt = one.toISOString().replace('Z', '').replace('T', ' ').slice(0, -7);
      this.label = lt
    } else {
      date = new Date();
      newDate = new Date(currentTime.getTime() + (limit - 2) * 60 * 1000);
      one = new Date(newDate.getTime() + 2 * 60 * 1000);
      gte = newDate.toISOString().replace('Z', '').replace('T', ' ').slice(0, -7);
      lt = one.toISOString().replace('Z', '').replace('T', ' ').slice(0, -7);
      this.label = lt
      newDate.setHours(0, 0, 0, 0);
      one.setHours(0, 0, 0, 0);
    }
  }

  plotHourly() {
    clearTimeout(this.timerfor7days);
    clearTimeout(this.timerForMinute);
    const datefor24 = this.datetimeOffset24Hr;
    if (this.hourlyCount < 48) {

      this.placesService.fetchAllStationslog(this.hourlyCount + ' HOUR', this.datetimeOffset24Hr).subscribe((data: Station[]) => {
        console.log("this.hourlyCount : ", this.hourlyCount);
        this.setLablefor24Hours(this.hourlyCount + ' HOUR', this.datetimeOffset24Hr);
        this.hourlyCount = this.hourlyCount + 1;
        this.clearHeatMap();
        this.fetchAllStationslog();
        this.hourlyTimer = setTimeout(() => this.plotHourly(), 2000);
      });
    }

  }

  setLablefor24Hours(timeLimit, currentTime) {
    var limit = timeLimit.split(" ", 1);
    var newDate;
    let one = new Date(currentTime);
    if (timeLimit === '1 HOUR') {
      one = new Date(currentTime);
      one.setTime(one.getTime() + 30 * 60 * 1000);
      var gte = currentTime.toISOString().replace('Z', '').replace('T', ' ').slice(0, -7);
      var lt = one.toISOString().replace('Z', '').replace('T', ' ').slice(0, -7);
      this.label = gte

    } else {
      let one = new Date(currentTime);
      newDate = new Date(currentTime.getTime() + (30 * limit) * 60 * 1000);
      one.setTime(newDate.getTime() + 30 * 60 * 1000);
      var gte = newDate.toISOString().replace('Z', '').replace('T', ' ').slice(0, -7);
      var lt = one.toISOString().replace('Z', '').replace('T', ' ').slice(0, -7);
      console.log("lt : ", lt);
      this.label = lt

    }
  }



  plotFor7Days() {
    if (this.dayCount < 14) {
      clearTimeout(this.hourlyTimer);
      clearTimeout(this.timerForMinute);
      this.placesService.fetchAllStationslog(this.dayCount + ' DAY', this.datetimeOffset).subscribe((data: Station[]) => {
        this.dayCount = this.dayCount + 1;
        this.setLable(this.dayCount + ' DAY', this.datetimeOffset);
        this.clearHeatMap();
        this.fetchAllStationslog();
        this.timerfor7days = setTimeout(() =>
          this.plotFor7Days(),
          5000);
      });
    }
  }

  setLable(timeLimit, currentTime) {
    var date;
    var newDate;
    var one;
    var limit = timeLimit.split(" ", 1);
    if (timeLimit === '2 DAY') {
      one = new Date(currentTime);
      one.setTime(one.getTime() + 12 * 60 * 60 * 1000);
      var gte = currentTime.toISOString().replace('Z', '').replace('T', ' ').slice(0, -7);
      var lt = one.toISOString().replace('Z', '').replace('T', ' ').slice(0, -7);
      this.label = lt

    } else {

      let one = new Date(currentTime);
      newDate = new Date(currentTime.getTime() + (12 * 60 * (limit - 1)) * 60 * 1000);
      one.setTime(newDate.getTime() + 12 * 60 * 60 * 1000);
      var gte = newDate.toISOString().replace('Z', '').replace('T', ' ').slice(0, -7);
      lt = one.toISOString().replace('Z', '').replace('T', ' ').slice(0, -7);
      this.label = lt
    }
  }

  getCurrentDate() {
    this.datetime = new Date();
    var targetTime = new Date(this.datetime);
    var tzDifference = targetTime.getTimezoneOffset();
    this.datetime = new Date(targetTime.getTime() - tzDifference * 60 * 1000);
  }


  doSync() {
    this.heatMapRefresh = this.placesService.refreshHeatMap(this.selected).subscribe(res => {

      this.clearHeatMap();
      if (this.selected == "1 hr") {

        this.clearHeatMap();
        this.gc();
        this.datetime = new Date();
        var targetTime = new Date(this.datetime);
        var tzDifference = targetTime.getTimezoneOffset();
        this.datetimeOffset = new Date(targetTime.getTime() - tzDifference * 60 * 1000);
        this.datetimeOffset.setHours(this.datetimeOffset.getHours() - 1);
        if (this.minuteCount < 60) { } else {
          this.minuteCount = 2;
          this.plotForMinute()
        }
      } else if (this.selected == "24 hr") {

        this.clearHeatMap();
        this.gc();
        this.datetime = new Date();
        var targetTime = new Date(this.datetime);
        var tzDifference = targetTime.getTimezoneOffset();
        this.datetimeOffset24Hr = new Date(targetTime.getTime() - tzDifference * 60 * 1000);
        this.datetimeOffset24Hr.setTime(this.datetimeOffset24Hr.getTime() - 24 * 60 * 60 * 1000);
        this.hourlyCount = 1;
        this.clearHeatMap();
        this.plotHourly();
        if (this.hourlyCount < 48) { } else {

        }
      } else {

        this.clearHeatMap();
        this.gc();
        this.datetime = new Date();
        var targetTime = new Date(this.datetime);
        var tzDifference = targetTime.getTimezoneOffset();
        this.datetimeOffset = new Date(targetTime.getTime() - tzDifference * 60 * 1000);
        this.datetimeOffset.setHours(this.datetimeOffset.getHours() - 168);
        if (this.dayCount < 14) {

        } else {
          this.dayCount = 1;
          this.clearHeatMap();
          this.plotFor7Days();
        }
      }
    });
  }

  goBack() {
    window.history.back();
  }

  fetchAllStationslog() {
    var coordinates = [];
    var locationArry = {};
    this.placesService.getallStationslog().subscribe((data: Station[]) => {
      this.stations = data;
      for (let i = 0; i < this.stations.length; i++) {
        locationArry = {
          max: 100,
          min: 0,
          location: new google.maps.LatLng(this.stations[i].latitude, this.stations[i].longitude),
          weight: this.stations[i].availableDocks
        }
        coordinates.push(locationArry);

      }
      this.plotHeatMapWithData(coordinates);
      coordinates = null;
      this.stations = null
      locationArry = null;
    });
  }
  gc() {
    this.heatmap = null;
  }

  plotHeatMapWithData(data) {
    this.clearHeatMap();
    this.heatmap = new google.maps.visualization.HeatmapLayer({

      data: data
    });
    this.heatmap.setMap(this.map);

  }

  clearHeatMap() {
    sessionStorage.clear();
    localStorage.clear();
    if (this.heatmap) {
      this.heatmap.setMap(null);
    }
    this.heatmap = null;
  }

  plotHeatMap() {

    this.placesService
      .fetchAllStationslog(this.selected, '')
      .subscribe((data: Station[]) => {
        this.clearHeatMap();
        this.fetchAllStationslog();
      });

  }


  onMapLoad(mapInstance: google.maps.Map) {
    this.map = mapInstance;
    this.plotForMinute();
  }

}
