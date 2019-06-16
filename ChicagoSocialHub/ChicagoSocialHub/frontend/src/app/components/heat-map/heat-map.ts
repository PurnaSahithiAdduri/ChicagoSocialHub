
import { Charts } from "../../charts";
import { Component, OnInit } from '@angular/core';
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

export class HeatMap implements Charts{
  heatmap;
  map;

 //Plot Heat Map 
  drawChart(heatmap,data,map,g){   
    this.heatmap = new google.maps.visualization.HeatmapLayer({
      data: data
    });
    this.heatmap.setMap(this.map);
  }

}