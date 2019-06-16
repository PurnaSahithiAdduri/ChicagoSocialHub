import * as d3Shape from "d3-shape";
import * as d3 from 'd3-selection';
import { Charts } from "../../charts";

import * as d3Scale from 'd3-scale';
import * as d3Axis from 'd3-axis';
import * as d3Array from 'd3-array';
import { Place } from '../../place';

export class BarChart implements Charts{
    private width: number;
    private height: number;
    public margin = { top: 20, right: 20, bottom: 150, left: 50 };
    private x: any;
    private y: any;
    private svg: any;
    private g: any;
    places: Place[]=[];
    barChart;
    data: Place[]=[];

    private initSvg() {
        this.svg = d3.select('#svgbar');
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
          this.x = d3Scale.scaleBand().rangeRound([0, this.width]).padding(.751);
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
            .attr("x", "440px")
            .attr("y", this.height + 85)
            .style("text-anchor", "middle")
            .text("Name");
      //text label for y axis
      this.svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 12)
      .attr("x",-200)
      .style("text-anchor", "middle")
      .text("Review Count");
    }
      
    drawChart(data,x,y,g) {
        this.initSvg();
        this.initAxis(data);
        this.drawAxis();
        this.g.selectAll('.bar')
        .data(this.places)
        .enter().append('rect')
        .attr('class', 'bar')
        .style('fill','steelblue')
        .attr('x', (d) => this.x(d.name) )
        .attr('y', (d) => this.y(d.review_count))
        .attr('width', this.x.bandwidth())
        .attr('height', (d) => this.height - this.y(d.review_count ));
    }
}