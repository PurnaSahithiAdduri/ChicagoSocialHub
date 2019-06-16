////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////


/// This file and the source code provided can be used only for   
/// the projects and assignments of this course

/// Last Edit by Purna Sahithi Adduri: 1/30/2019


////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////




import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material';

import { Station } from '../../station';
import { PlacesService } from '../../places.service';


import { Input, ViewChild, NgZone} from '@angular/core';
import { MapsAPILoader, AgmMap } from '@agm/core';
import { GoogleMapsAPIWrapper } from '@agm/core/services';
import { Place } from 'src/app/place';
import { ConditionalExpr } from '@angular/compiler';
import { ActivatedRoute } from "@angular/router";




interface Location {
  lat: number;
  lng: number;
  zoom: number;
  address_level_1?:string;
  address_level_2?: string;
  address_country?: string;
  address_zip?: string;
  address_state?: string;
  label: string;
}



@Component({
  selector: 'app-list-of-stations',
  templateUrl: './list-of-stations.component.html',
  styleUrls: ['./list-of-stations.component.css']
})
export class ListOfStationsComponent implements OnInit {

  stations: Station[];
  markers: Station[];
  placeSelected: Place;
  placeSelectedFromUrl;
  plot;

  displayedColumns = ['id', 'stationName', 'availableBikes', 'availableDocks', 'is_renting', 'lastCommunicationTime', 'latitude',  'longitude', 'status', 'totalDocks','stackedBar','realTime','SMA'];

  
  icon = {
    url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
    scaledSize: {
      width: 60,
      height: 60
    }
  }

  constructor(private placesService: PlacesService, private router: Router,public route1: ActivatedRoute) { 
  }
  //let recordingTimer;
  public isViewableStackedBar: boolean;

  scheduleTimer = () => {
    let recordingTimer = setTimeout(() => {
      this.fetchStations();
    }, 5000);
    clearTimeout(recordingTimer);
    };
    
  ngOnInit() {
    this.fetchStations();
    this.getPlaceSelected();
    this.isViewableStackedBar = false;
    
    this.plot = this.placeSelected 
  }

  /*hideStackedBar(){
    this.isViewableStackedBar = false; 
  }*/

  goBack() {
    window.history.back();
  }

  fetchStations() {
    this.placesService
      .getStations()
      .subscribe((data: Station[]) => {
        //this.scheduleTimer();
        this.stations = data;
        this.markers = data;
      });
  }


   getPlaceSelected() {
    this.placesService
      .getPlaceSelected()
      .subscribe((data: Place) => {
        this.placeSelected = data;   
      });
  }



clickedMarker(label: string, index: number) {
 // console.log(`clicked the marker: ${label || index}`)
}

circleRadius:number = 3000; // km

public location:Location = {
  lat: 41.882607,
  lng: -87.643548,
  label: 'You are Here',
  zoom: 13
};

findStationslogs(stationName,data){

  for (var i = 0,len = this.stations.length; i < len; i++) {

    if ( this.stations[i].stationName === stationName ) { // strict equality test

        var place_selected =  this.stations[i];

        break;
    }
  }

  //console.log("Calling placeService:fetchStationslog(stationName)from list_of_stations ... ");

  this.placesService.fetchStationslog(stationName,"450 hr").subscribe(() => {

    this.router.navigate(['/line_chart'],{ queryParams: { stationName: stationName, data: data} });
  });
}

gotoStackedBarChart(){
  this.router.navigate(['/stacked-bar-chart']);//,{ queryParams: { stationName: stationName} });
}

/*getPlaceName(){
this.route1.queryParams.subscribe(paramsId => {
  this.placeSelectedFromUrl = paramsId.placeSelected;
});
}*/




}



