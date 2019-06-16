import { Component, ViewEncapsulation, OnInit, OnDestroy } from "@angular/core";

import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import * as d3 from "d3";
import * as d3Scale from "d3-scale";
import * as d3Shape from "d3-shape";
import * as d3Array from "d3-array";
import * as d3Axis from "d3-axis";

import { PlacesService } from "../../places.service";
import { Station } from "../../station";
import { VERSION } from '@angular/material';
import { ChartsFactory } from "../../chartsFactory"

export interface Time {
  value: string;
  viewValue: string;
}

@Component({
  selector: "app-line-chart",
  encapsulation: ViewEncapsulation.None,
  templateUrl: "./real-time-line-chart.component.html",
  styleUrls: ["./real-time-line-chart.component.css"]
})

export class LineChartComponent implements OnInit, OnDestroy {
  //Declaration of variables
  width: number;
  height: number;
  x: any;
  y: any;
  svg: any;
  line: d3Shape.Line<[number, number]>;
  stations: Station[];
  stationNm: any;
  dataType: any;
  title: string;
  public id: string;
  realTimeObserver: Subscription;
  simpleMovingAverage1hr: any;
  simpleMovingAverage24hr: any;
  simpleMovingAverage7days: any;
  


  realTimeDataLine: any;

  //Initialization of variables
  time: Time[] = [
    { value: "1 hr", viewValue: "1 hr" },
    { value: "24 hrs", viewValue: "24 hrs" },
    { value: "7 days", viewValue: "7 days" }
  ];
  selected = "1 hr";
  SMA1hrchecked = false;
  SMA24hrchecked = false;
  public margin = { top: 20, right: 20, bottom: 50, left: 50 };
  version = VERSION;

  // Constructor
  constructor(
    public placesService: PlacesService,
    public route1: ActivatedRoute
  ) {
    this.width = 900 - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;
  }

  // Init LifeCycle hook
  ngOnInit() {

    //Creating Object to Factory class 
    const chartsFactory = new ChartsFactory();


    // Calling createSimpleMovingAverage1hr,createSimpleMovingAverage24hr in impleMovingAverage class 
    this.simpleMovingAverage1hr = chartsFactory.createSimpleMovingAverage1hr();
    this.simpleMovingAverage24hr = chartsFactory.createSimpleMovingAverage24hr();
    this.simpleMovingAverage7days = chartsFactory.createSimpleMovingAverage7days();
    this.realTimeDataLine = chartsFactory.createRealTimeDataLine();


    this.title = "Time Line Chart for";
    this.getStationName();
    this.doAsync();
    this.plotLineChart();
  }

  //Destroy LifeCycle hook
  ngOnDestroy() {
    if (this.realTimeObserver) {
      this.realTimeObserver.unsubscribe();
    }
  }


  //To get the selected station name
  getStationName() {
    this.route1.queryParams.subscribe(paramsId => {
      this.stationNm = paramsId.stationName;
      this.dataType = paramsId.data;
    });
  }


  //To go back to the previous page
  goBack() {
    window.history.back();
  }

  //Refresh data in the chart when there is a change in original data
  doAsync = () => {
    this.realTimeObserver = this.placesService
      .realTimeStationLog(this.stationNm, this.selected)
      .subscribe(res => {
        this.plotLineChart();
      });
  };

  plotLineChart() {
    this.placesService
      .fetchStationslog(this.stationNm, this.selected)
      .subscribe((data: Station[]) => {
        this.fetchStationslog();
      });

  }

  fetchStationslog() {
    this.placesService.getStationslog().subscribe((data: Station[]) => {
      this.stations = data;
      this.updateChart();
      this.initSvg();
      this.initAxis();
      this.drawAxis();

      if (this.dataType === "SMA") {
        if(this.selected === "24 hr"){
        this.simpleMovingAverage24hr.drawChart(this.stations, this.x, this.y, this.svg);
        }else if(this.selected === "168 hr"){
         this.simpleMovingAverage7days.drawChart(this.stations, this.x, this.y, this.svg);
        }else{
          this.simpleMovingAverage1hr.drawChart(this.stations, this.x, this.y, this.svg);
        }
      }else{
        this.realTimeDataLine.drawChart(this.stations, this.x, this.y, this.svg);
      } 
    });
  }

  //---------------------------- Ploting Real Time Line Chart for the Available Docks -----------------------
  public initSvg() {
    this.svg = d3
      .select("#svg")
      .append("g")
      .attr(
        "transform",
        "translate(" + this.margin.left + "," + this.margin.top + ")"
      );
  }

  

  public initAxis() {
var currentTime = new Date();
    var datetime = new Date();
   var diffHours = this.selected == "1 hr" ?   datetime.getHours() - 1 : this.selected == "24 hr"?diffHours = datetime.getHours() - 25:  datetime.getHours() - 178;
 
    datetime.setHours(diffHours);
    datetime.setMinutes(datetime.getMinutes()-2)

    this.x = d3Scale.scaleTime().range([0, this.width]);
    this.y = d3Scale.scaleLinear().range([this.height, 0]);
    if (this.dataType == "SMA") {   
    this.x.domain(d3Array.extent(this.stations, d => new Date(d.lastCommunicationTime.replace(/-/g, '/').toString())));
  //  this.x.domain(d3Array.extent([0,new Date(currentTime.toString())]));
    }else{
    this.x.domain([new Date(datetime.toString()),new Date(currentTime.toString())]);//d3Array.max(this.stations, d => new Date(d.lastCommunicationTime.replace(/-/g, '/').toString()))]);
    }
    this.y.domain([0, d3Array.max(this.stations, d => d.availableDocks)]);
   
  }

  public drawAxis() {
    //Axis Granularity
    let str = this.selected == "1 hr" ? d3.timeMinute.every(2) : this.selected == "24 hr" ? d3.timeHour.every(1) : d3.timeHour.every(12);
    this.svg.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(d3Axis.axisBottom(this.x)
        .ticks(str))
      .selectAll("text")
      .attr("y", 0)
      .attr("x", 9)
      .attr("dy", ".35em")
      .attr("transform", "rotate(60)")
      .style("text-anchor", "start")

    //text label for y axis
    this.svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - this.margin.left)
      .attr("x", 0 - (this.height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Available Docks");
    // text label for the x axis
    this.svg.append("text")
      .attr("x", this.width / 2)
      .attr("y", this.height + 55)
      .style("text-anchor", "middle")
      .text("Time Range");
      if (this.dataType !== "SMA") {   
    this.svg
      .append("g")
      .attr("class", "axis axis--y")
      .call(d3Axis.axisLeft(this.y).ticks(d3Array.max(this.stations, d => d.availableDocks)))
      .append("text")
      .text("Docks")
      .attr("class", "axis-title")
      .attr("transform", "rotate(-90)")
      .attr("y", 0)
      .attr("dy", ".71em")
      .style("text-anchor", "end");
      }else{
        this.svg
        .append("g")
      .attr("class", "axis axis--y")
      .call(d3Axis.axisLeft(this.y).ticks(null,'s'))
      .append("text")
      .text("Docks")
      .attr("class", "axis-title")
      .attr("transform", "rotate(-90)")
      .attr("y", 0)
      .attr("dy", ".71em")
      .style("text-anchor", "end");
      }
  }
 
  public updateChart() {
    this.line = d3
      .select("#svg")
      .select("g")
      .remove()
      .exit();
  }
}
