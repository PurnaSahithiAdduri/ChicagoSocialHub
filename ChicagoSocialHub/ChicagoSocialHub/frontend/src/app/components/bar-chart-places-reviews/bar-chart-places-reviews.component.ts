import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';
import { STATISTICS  } from '../../shared';

import { Place } from '../../place';
import { PlacesService } from '../../places.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ChartsFactory } from "../../chartsFactory"

@Component({
  selector: 'app-bar-chart-places-reviews',
  templateUrl: './bar-chart-places-reviews.component.html',
  styleUrls: ['./bar-chart-places-reviews.component.css']
})
export class BarChartPlacesReviewsComponent implements OnInit {

  title = 'Bar Chart';

  private width: number;
  private height: number;
  public margin = { top: 20, right: 20, bottom: 150, left: 50 };
  private x: any;
  private y: any;
  private svg: any;
  private g: any;
  places: Place[]=[];
  barChart;

  constructor(private placesService: PlacesService, private router: Router, private http: HttpClient) {}

  ngOnInit() {

    //Creates object for the factory class
    const chartsFactory = new ChartsFactory();

    //Factory class returns object for the bar chart
    this.barChart = chartsFactory.createBarChart();
    this.fetchPlaces();
  }

  fetchPlaces() {
    this.placesService
      .getPlaces()
      .subscribe((data: Place[]) => {
        this.places = data;
        this.barChart.drawChart(this.places,this.x,this.y,this.g);
      });
  }

}
