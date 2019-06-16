import { SimpleMovingAverage1hr } from "./components/real-time-line-chart/SMA-1hr";
import { SimpleMovingAverage24hr } from "./components/real-time-line-chart/SMA-24hr";
import { RealTimeLine } from "./components/real-time-line-chart/real-time-data";
import { SimpleMovingAverage7days } from "./components/real-time-line-chart/SMA-7days";
import { StackedBarChart } from './components/stacked-bar-chart/stacked-bar-chart';
import { LineChart } from './components/line-chart-places-reviews/line-chart';
import { BarChart } from './components/bar-chart-places-reviews/bar-chart';
import { HeatMap } from './components/heat-map/heat-map';

export class ChartsFactory {

  // Return Object for SimpleMovingAverage1hr class
  createSimpleMovingAverage1hr() {
    return new SimpleMovingAverage1hr();
  }

  // Return Object for SimpleMovingAverage24hr class
  createSimpleMovingAverage24hr() {
    return new SimpleMovingAverage24hr();
  }

  createSimpleMovingAverage7days() {
    return new SimpleMovingAverage7days();
  }

  // Return Object for RealTimeLine class
  createRealTimeDataLine() {
    return new RealTimeLine();
  }

  createStackedBarChart(){
    return new StackedBarChart()
  }

  createLineChart(){
    return new LineChart();
  }

  createBarChart(){
    return new BarChart();
  }

  createHeatMap(){
    return new HeatMap();
  }
}