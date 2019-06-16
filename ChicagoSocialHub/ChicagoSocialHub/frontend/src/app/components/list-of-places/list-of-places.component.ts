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


import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';


import { Place } from '../../place';
import { PlacesService } from '../../places.service';


const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

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
  selector: 'app-list-of-places',
  templateUrl: './list-of-places.component.html',
  styleUrls: ['./list-of-places.component.css']
})


export class ListOfPlacesComponent implements OnInit {

  uri = 'http://localhost:4000';

  places: Place[] = [];
  markers: Place[];
  public isViewable: boolean;
  selected = "line";
  placeNameSelected;

  google: any;
  map: google.maps.Map = null;
  heatmap: google.maps.visualization.HeatmapLayer = null;
  heatMapData: any[];


  displayedColumns = ['name', 'display_phone', 'address1', 'is_closed', 'rating', 'review_count', 'Divvy'];

  constructor(private placesService: PlacesService, private router: Router, private http: HttpClient) {

  }


  ngOnInit() {

    this.fetchPlaces();
    this.isViewable = false;
  }

  goBack() {
    window.history.back();
  }


  //public toggle(): void { this.isViewable = !this.isViewable; }

  fetchPlaces() {
    this.placesService
      .getPlaces()
      .subscribe((data: Place[]) => {
        this.places = data;
        this.markers = data;
      });
  }




  findStations(placeName) {
    this.placeNameSelected = placeName;
    for (var i = 0, len = this.places.length; i < len; i++) {

      if (this.places[i].name === placeName) { // strict equality test

        var place_selected = this.places[i];

        break;
      }
    }


    this.placesService.findStations(placeName).subscribe(() => {

      this.router.navigate(['/list_of_stations'], { queryParams: { placeSelected: this.placeNameSelected } });
    });

  }



  clickedMarker(label: string, index: number) {
    // console.log(`clicked the marker: ${label || index}`)
  }

  circleRadius: number = 3000; // km

  onMapLoad(mapInstance: google.maps.Map) {
    this.map = mapInstance;
    this.fetchPlaces();
  }

  public location: Location = {
    lat: 41.882607,
    lng: -87.643548,
    label: 'You are Here',
    zoom: 13
  };



}
