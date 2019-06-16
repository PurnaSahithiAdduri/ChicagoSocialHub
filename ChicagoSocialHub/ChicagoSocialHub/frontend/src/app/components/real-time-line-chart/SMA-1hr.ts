import * as d3 from "d3";
import * as d3Shape from "d3-shape";
import { Charts } from "../../charts";

export class SimpleMovingAverage1hr implements Charts{

  movingAverageLine: d3Shape.Line<[number, number]>;

     //Calculate simple moving Average
  movingAverage = (data, numberOfPoints) => {
    return data.map((row, index, total) => {
      const start = Math.max(0, index - numberOfPoints);
      const end = index;
      const subset = total.slice(start, end + 1);
      const sum = subset.reduce((a, b) => {
        return a + b["availableDocks"];
      }, 0);

      return {
        lastCommunicationTime: row["lastCommunicationTime"],
        avg: sum / subset.length || 0
      };
    });
  };

        drawChart(stations,x,y,svg){
      
        this.movingAverageLine = d3Shape
            .line()
            .x((d: any) => x(new Date(d.lastCommunicationTime.replace(/-/g, '/'))))
            .y((d: any) => y(d.avg))
            .curve(d3.curveBasis);
        var movingAverageData = this.movingAverage(stations, 30);
        svg.append("path")
            .datum(movingAverageData)
            .attr("id", "movingAverageLine1")
            .style("fill", "none")
            .text("Timeframe")
            .attr("stroke", "green") 
            .attr("d", this.movingAverageLine);
    }
}