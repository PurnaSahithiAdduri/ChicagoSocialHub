import { Component, OnInit } from '@angular/core';

import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';
import { STOCKS } from '../../shared';

import { Place } from '../../place';
import { PlacesService } from '../../places.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ChartsFactory } from "../../chartsFactory"

@Component({
  selector: 'app-line-chart-places-reviews',
  templateUrl: './line-chart-places-reviews.component.html',
  styleUrls: ['./line-chart-places-reviews.component.css']
})
export class LineChartPlacesReviewsComponent implements OnInit {



  title = 'Line Chart';
  places: Place[]=[];
 

  private margin = { top: 20, right: 20, bottom: 150, left: 50 };
  private width: number;
  private height: number;
  private x: any;
  private y: any;
  private svg: any;
  private line1: any;//d3Shape.Line<[string, string]>;
  lineChart:any;

  constructor(private placesService: PlacesService, private router: Router, private http: HttpClient) {
    this.width = 900 - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;
  }

  ngOnInit() {
    //Creates object for factory class
    const chartsFactory = new ChartsFactory();

    //factory class returns object for the line chart
    this.lineChart = chartsFactory.createLineChart();
    this.fetchPlaces();
  }

  fetchPlaces() {
    this.placesService
      .getPlaces()
      .subscribe((data: Place[]) => {
        this.places = data;
        this.lineChart.drawChart(this.places,this.x,this.y,this.svg,null,null,null);
      });
  }



}
