import * as d3Shape from "d3-shape";
import { Charts } from "../../charts";
import * as d3SC from 'd3-scale';
import * as d3Axis from 'd3-axis';
import * as d3Array from 'd3-array';
import * as d3 from 'd3-selection';

import { Station } from '../../station';
import { Place } from 'src/app/place';


export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export class StackedBarChart implements Charts {
  stations: Station[];
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

  constructor() {
  }

  // select 'svg' object to set chart components height,width,colors and other scaling attributes
  private initSvg() {
    this.mr = { top: 20, right: 20, bottom: 150, left: 40 };
    this.svg = d3.select('svg');
    this.width = +this.svg.attr('width') - this.mr.left - this.mr.right;
    this.height = +this.svg.attr('height') - this.mr.top - this.mr.bottom;
    this.g = this.svg.append('g').attr('transform', 'translate(' + this.mr.left + ',' + this.mr.top + ')');

  }
  public initAxis() {
    this.x = d3SC.scaleBand()
      .rangeRound([0, this.width])
      .paddingInner(0.05)
      .padding(.751)
      .align(0.1);
    this.y = d3SC.scaleLinear()
      .rangeRound([this.height, 0]);
      //.ticks(10000);
    this.z = d3SC.scaleOrdinal()
      .range(['lightskyblue', 'steelblue', '#7b6888', '#6b486b', '#a05d56', '#d0743c', '#ff8c00']);
  }

  drawChart(data, x, y, g) {
    this.initSvg();
    this.initAxis();
    let keys = Object.getOwnPropertyNames(data[0]).slice(1);
    keys = keys.slice(1, 3);
    data = data.map(v => {
      v.total = keys.map(key => v[key]).reduce((a, b) => a + b, 0);
      return v;
    });
    data.sort((a: any, b: any) => b.total - a.total);
    this.x.domain(data.map((d: any) => d.stationName));
    this.y.domain([0, d3Array.max(data, (d: any) => d.total)]).nice();
    this.z.domain(keys);
    this.g.append('g')
      .selectAll('g')
      .data(d3Shape.stack().keys(keys)(data))
      .enter().append('g')
      .attr('fill', d => this.z(d.key))
      .selectAll('rect')
      .data(d => d)
      .enter().append('rect')
      .attr('x', d => this.x(d.data.stationName))
      .attr('y', d => this.y(d[1]))
      .attr('height', d => this.y(d[0]) - this.y(d[1]))
      .attr('width', this.x.bandwidth());
    this.g.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(d3Axis.axisBottom(this.x))
      .selectAll("text")
      .attr("y", 0)
      .attr("x", 9)
      .attr("dy", ".35em")
      .attr("transform", "rotate(60)")
      .style("text-anchor", "start");
    this.g.append('g')
      .attr('class', 'axis')
      .call(d3Axis.axisLeft(this.y).ticks( d3Array.max(data, (d: any) => d.total)))
      .append('text')
      .attr('x', 2)
      .attr('y', this.y(this.y.ticks().pop()))
      .attr('dy', '0.32em')
      .attr('fill', '#000')
      .attr('font-weight', 'bold')
      .attr('text-anchor', 'start');

    this.g.append("text")
      .attr("x", "340px")
      .attr("y", this.height + 20)
      .style("text-anchor", "middle")
      .text("Station Name");

    //text label for y axis
    this.g.append("text")
      .attr("transform", "rotate(-90)")
      //
      .attr("y", "-28px")
      .attr("x", "-150px")
      .style("text-anchor", "middle")
      .text("Docks");
    let legend = this.g.append('g')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 10)
      .attr('text-anchor', 'end')
      .selectAll('g')
      .data(keys.slice().reverse())
      .enter().append('g')
      .attr('transform', (d, i) => 'translate(0,' + i * 20 + ')');

    legend.append('rect')
      .attr('x', this.width - 19)
      .attr('width', 19)
      .attr('height', 19)
      .attr('fill', this.z);
    legend.append('text')
      .attr('x', this.width - 24)
      .attr('y', 9.5)
      .attr('dy', '0.32em')
      .text(d => d);
  }
}