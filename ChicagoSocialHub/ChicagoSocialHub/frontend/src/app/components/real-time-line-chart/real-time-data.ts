import * as d3Shape from "d3-shape";
import { Charts } from "../../charts";

export class RealTimeLine implements Charts{
  line: d3Shape.Line<[number, number]>;

    //public drawLine(stations,x,y,svg) {
      drawChart(data,x,y,svg){
        this.line = d3Shape
          .line()
          .x((d: any) => x(new Date(d.lastCommunicationTime.replace(/-/g, '/'))))
          .y((d: any) => y(d.availableDocks));
        svg
          .append("path")
          .datum(data)
          .attr("class", "line")
          .attr("id", "line")
          .attr("d", this.line);
      }
}