import * as d3 from "d3";
import * as d3Shape from "d3-shape";
import { Charts } from "../../charts";

export class SimpleMovingAverage24hr implements Charts {

  movingAverageLine24hr: d3Shape.Line<[number, number]>;
  //Calculate simple moving Average
  movingAverage = (data, numberOfPoints) => {
    var datetime = new Date();
    //getting time for past 24hrs
    var targetTime = new Date(datetime);
    var tzDifference = targetTime.getTimezoneOffset();
    datetime = new Date(targetTime.getTime() - tzDifference * 60 * 1000);
    var diffHours = datetime.getHours() - 25;
    datetime.setHours(diffHours);
    

var arr =[];
    for (var i = 0; i < 24; i++) {
      datetime.setHours(datetime.getHours() + 1);
      var gte2 = datetime.toISOString().slice(0, -5).replace('Z', ' ').replace('T', ' ');
      arr.push(gte2);
    }

    return data.map((row, index, total) => {
      const start = Math.max(0, index - numberOfPoints);
      const end = index;
      const subset = total.slice(start, end + 1);
      const sum = subset.reduce((a, b) => {
        return a + b["availableDocks"];
      }, 0);

      return {
        lastCommunicationTime: row["lastCommunicationTime"],
        avg: sum / subset.length
      };
    });
  };


  //drawLine(stations,x,y,svg) {
  drawChart(stations, x, y, svg) {
    var datetime = new Date();

    //getting time for past 24hrs
    var targetTime = new Date(datetime);
    var tzDifference = targetTime.getTimezoneOffset();
    datetime = new Date(targetTime.getTime() - tzDifference * 60 * 1000);
    var diffHours = datetime.getHours() - 25;
    datetime.setHours(diffHours);
    var gte1 = datetime.toISOString().slice(0, -8).replace('Z', ' ').replace('T', ' ');

var arr =[];
    for (var i = 0; i < 24; i++) {
      datetime.setHours(datetime.getHours() + 1);
      var gte2 = datetime.toISOString().slice(0, -5).replace('Z', ' ').replace('T', ' ');
      arr.push(gte2);
      /*console.log(stations.length);
        if (stations[i].lastCommunicationTime.includes(gte2)) {
          console.log("I am there");
        } else {
          console.log("I am not there...");
        }*/
    }
    this.movingAverageLine24hr = d3Shape
      .line()
      .x((d: any) => x(new Date(d.lastCommunicationTime.replace(/-/g, '/'))))
      .y((d: any) => y(d.avg))
      .curve(d3.curveBasis);
    var movingAverageData = this.movingAverage(stations, 720);
    svg.append("path")
      .datum(movingAverageData)
      .attr("id", "movingAverageLine24hr")
      .style("fill", "none")
      .attr("stroke", "#3498DB") //#3498DB - blue
      .attr("d", this.movingAverageLine24hr)
      .text("Smart");
  }
}