import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3-selection';
import * as d3SC from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3Axis from 'd3-axis';
import * as d3Array from 'd3-array';
import { SAMPLE_DATA } from '../../shared/data04';
import { PlacesService } from '../../places.service';
import { HttpClient } from '@angular/common/http';
import { Station } from '../../station';
import { Place } from 'src/app/place';

import { ChartsFactory } from "../../chartsFactory"

import { Router } from '@angular/router';
export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

@Component({
  selector: 'app-stacked-bar-chart',
  templateUrl: './stacked-bar-chart.component.html',
  styleUrls: ['./stacked-bar-chart.component.css']
})
export class StackedBarChartComponent implements OnInit {

  
  stations: Station[];
  markers: Station[];
  placeSelected: Place;
  private mr: Margin;
  private width: number;
  private height: number;
  private svg: any;
  private x: any;
  private y: any;
  private z: any;
  private g: any;
  stackedBarChart: any;
  line: any;
  timer: any;
  placeName;
  title;

  constructor(private placesService: PlacesService, private router: Router, private http: HttpClient) {

  }

  ngOnInit() {

    // Creates the object of the factory class
    const chartsFactory = new ChartsFactory();

    //factoty class return the object of the stacked bar chart class
    this.stackedBarChart = chartsFactory.createStackedBarChart();
    this.getPlaceSelected();
    //this.scheduleTimer();
  }

  //Destroy LifeCycle hook
  ngOnDestroy() {
    clearTimeout(this.timer);
  }

  // Schedule timmer to refresh data in the chart for every 3 mins
  scheduleTimer = () => {
    this.timer = setTimeout(() => {
      this.fetchPlaceslog();
      //Schemelessly Updating graph Data for every 3minutes 
      this.updateChart();
    }, 1000);
  };

  plotStackedBarChart() {
    this.placesService
      .getAllDivvyStationslogs()
      .subscribe((data: Station[]) => {
        this.stations = data;
        this.markers = data;
        //this.g.exit().remove();
        this.stackedBarChart.drawChart(this.stations, null, null, null);
      });
  }

  fetchPlaceslog() {
    this.placesService.getAllDivvyStationsLogs(this.placeSelected.name).subscribe((data: Station[]) => {
      this.plotStackedBarChart();
    });
  }

  getPlaceSelected() {
    this.placesService
      .getPlaceSelected()
      .subscribe((data: Place) => {
        this.placeSelected = data;
        this.fetchPlaceslog();
        
    this.title = 'Stacked Bar Chart for the place : '+this.placeSelected.name;
      });
  }

  goBack() {
    window.history.back();
  }

  public updateChart() {
    this.line = d3
      .select("svg")
      .select("g")
      .remove()
      .exit();
  }

}
