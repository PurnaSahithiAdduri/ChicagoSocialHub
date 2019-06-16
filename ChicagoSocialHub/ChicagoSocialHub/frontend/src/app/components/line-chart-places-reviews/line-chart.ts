
import { Charts } from "../../charts";
import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';

import { Place } from '../../place';

export class LineChart implements Charts{
  places: Place[]=[];
 
  private width: number;
    private height: number;
    public margin = { top: 20, right: 20, bottom: 150, left: 50 };
    private x: any;
    private y: any;
    private svg: any;
    private g: any;
    //places: Place[]=[];
    barChart;
    line1;

    private initSvg() {
        this.svg = d3.select('svg');
        this.width = +this.svg.attr('width') - this.margin.left - this.margin.right;
        this.height = +this.svg.attr('height') - this.margin.top - this.margin.bottom;
        this.g = this.svg.append('g')
            .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
}

    public processPlaces(data){
        let names = [];
        let places = [];
       for(var i=0; i<data.length;i++){
        let name = data[i].name;
        let review_count = data[i].review_count;
        if (names.includes(name)){
            name = name+' ';
        }
        names.push(name);
        places.push({name:name,review_count:review_count});
     }
     this.places = places;
    }

    private initAxis(data) {
        this.processPlaces(data);
        this.x = d3Scale.scaleBand().rangeRound([0, this.width]).padding(1.40);
        this.y = d3Scale.scaleLinear().rangeRound([this.height, .099]);
          this.x.domain(this.places.map((d) => d.name));
          this.y.domain([0, d3Array.max(this.places, (d) => Number(d.review_count))]);
      }

      private drawAxis() {
        this.g.append('g')
            .attr('class', 'axis axis--x')
            .attr('transform', 'translate(0,' + this.height + ')')
            .call(d3Axis.axisBottom(this.x))
            .selectAll("text")
            .attr("y", 0)
            .attr("x", 9)
            .attr("dy", ".35em")
            .attr("transform", "rotate(60)")
            .style("text-anchor", "start");
        this.g.append('g')
            .attr('class', 'axis axis--y')
            .call(d3Axis.axisLeft(this.y))
            .append("text")
            .attr("transform", "rotate(90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text("Frequency");
    this.svg.append("text")
            .attr("x", "295px")
            .attr("y", this.height + 110)
            .style("text-anchor", "middle")
            .text("Name");
      //text label for y axis
     /* this.svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -16)
      .attr("x",0 - (this.height / 2))
      .style("text-anchor", "middle")
      .text("Review Count");
*/
          //text label for y axis
          this.g.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", "-38px")
          .attr("x", "-160px")
          .style("text-anchor", "middle")
          .text("Docks");
    }

  drawChart(data,x,y,svg) {
   // this.places = data;
    this.initSvg();
        this.initAxis(data);
        this.drawAxis();

        this.line1 = d3Shape.line()
        .x((d: any) => this.x(d.name))
        .y((d: any) => this.y(d.review_count));
  
      this.svg.append('path')
        .style('fill', 'none')
        .style('stroke', 'steelblue')
        .datum(this.places)
  
        .attr('d', this.line1);
    }
}