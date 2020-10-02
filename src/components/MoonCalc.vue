<template>
  <div class="container moon">
    <div class="row">
      <h1>Moon illumination</h1>
    </div>
    <div class="row">
      <label for="position" class="form-label">Position</label>
      <div class="input-group">
        <span class="input-group-text w-25" id="lat">Lat</span>
        <input type="text" class="form-control" id="position-lat" aria-describedby="Latitude" v-model="lat" placeholder="North is positive">
      </div>
      <div class="input-group mb-3">
        <span class="input-group-text w-25" id="lat">Lon</span>
        <input type="text" class="form-control" id="position-lon" aria-describedby="Longitude" v-model="lon" placeholder="East is positive">
      </div>
    </div>
    <div class="row">
      <label for="ytt">Compute for:</label>
      <div class="row justify-content-center">
        <div class="col">
          <button class="btn btn-secondary" @click="moonM1W"> -1w</button>
        </div>
        <div class="col">
          <button class="btn btn-secondary" @click="moonM1D"> -1d</button>
        </div>
        <div class="col">
          <button class="btn btn-primary" @click="moonToday">Now</button>
        </div>
        <div class="col">
          <button class="btn btn-secondary" @click="moonP1D">+1d</button>
        </div>
        <div class="col">
          <button class="btn btn-secondary" @click="moonP1W">+1w</button>
        </div>
      </div>      
      <label for="today">or choose the date:</label>
      <input type='date' id="calendar" v-model="datareq" @change="moon"> 
    </div>    
    <div class="row">
      <div class="d-flex justify-content-center" id="moon"></div>

    </div>
    <div class="row d-flex ">
      <h4 class="order-0">Illumination: {{ill}}</h4>
      <h4 class="order-1">Phase: {{phs}} </h4>
      <span :class="{'order-2' : riseset, 'order-3' : !riseset}">Rise: {{rise}} </span>
      <span :class="{'order-2' : !riseset, 'order-3' : riseset}">Set: {{set}}</span>
    </div>
  </div>
</template>

<script>
import SunCalc from 'suncalc';
import * as d3 from 'd3';
import A from 'meeusjs'

export default {
  name: 'MoonCalc',
  data() {
    return {
      width: 200,
      lat: 44.69064, 
      lon: 8.88480,
      today: new Date().toISOString().split('T')[0],
      datareq: new Date().toISOString().split('T')[0],
      ill: '',
      phs: '',
      mooninfo: {},
      rise: '',
      transit: '',
      set: '',
      riseset: true
    }
  },
  mounted() {
    this.moon();
  },
  methods: {
    tomorrow() {
      const t = new Date(this.datareq);
      t.setDate(t.getDate()+1);
      return t;
    },
    setFill1() {
      return (this.mooninfo.phase < 0.25 || this.mooninfo.phase > 0.75) ? "#ffffaf": "#111" ;
    },
    setFill2() {
      return (this.mooninfo.phase < 0.25 || this.mooninfo.phase > 0.75) ? "#111": "#ffffaf" ;
    },
    setScaleX() {
      return 2*Math.abs(this.mooninfo.fraction - 0.5);
    },
    setFill3() {
      return (this.mooninfo.phase < 0.25 || this.mooninfo.phase > 0.75) ? "#111": "#ffffaf" ;
    },
    setPath() {
      var arc = d3.arc().outerRadius(this.width/2);
      var x = (this.mooninfo.phase < 0.25 || (this.mooninfo.phase > 0.5 && this.mooninfo.phase < 0.75)) ?  arc.innerRadius(0).startAngle(Math.PI).endAngle(2*Math.PI)() : arc.innerRadius(0).startAngle(0).endAngle(Math.PI)();
      return x;
    },
    drawMoonPhase() {
      // clear previous svg
      var svg = d3.select("#moon>svg").remove();
      // new phase!
      svg = d3.select("#moon").append("svg")
        .attr("width", this.width+10)
        .attr("height", this.width+10);
      var content = svg.append("g").attr("transform",`translate(${(this.width+10)/2},${(this.width+10)/2})`);
      var ph = content.append("g");
      ph.append("circle").attr('r', this.width/2)
        .style("fill", this.setFill1());
      ph.append("circle").attr('r',this.width/2)
        .style("fill", this.setFill2())
        .attr("transform", `scale(${this.setScaleX()},1)`);
      ph.append("path").attr("d", this.setPath())
        .style("fill", this.setFill3());  
    },
    moon() {
      var o = new Date(this.datareq);
      // //console.log(o);
      var m = SunCalc.getMoonIllumination(o);
      var x = SunCalc.getMoonTimes(this.datareq, this.lat, this.lon);
      this.mooninfo = m;
      this.rise = ('rise' in x) ? x.rise.toTimeString() : '---';
      this.set = ('set' in x) ? x.set.toTimeString() : '---';
      if (this.rise > this.set) {
        this.riseset=false;
      }
      else {
        this.riseset=true;
      }
      this.ill = (m.fraction*100).toFixed(1) + "%";
      this.phs = this.moonPhaseText();
      var dd = new Date(this.datareq);
      var jdo = new A.JulianDay(dd);
      //console.log("JD: ", jdo);
      var coord = A.EclCoord.fromWgs84(this.lat,this.lon, 220);

      // gets the position of the moon		
      var tp = A.Moon.topocentricPosition(jdo, coord);
      // print azi and alt
      //console.log("dist:" + tp.delta); 

      // gets the rise, transit and set time of the moon for today
      var times = A.Moon.times(jdo, coord);

      // print rise, transit and set in universal time
      //console.log(times.rise);	
      console.log("rise: " + A.Coord.secondsToHMSStr(times.rise) + ", transit: " + A.Coord.secondsToHMSStr(times.transit) + ", set: " +  A.Coord.secondsToHMSStr(times.set));

      // print moon phase and illuminated
      var suneq = A.Solar.apparentTopocentric(jdo, coord);
      var i = A.MoonIllum.phaseAngleEq2(tp.eq, suneq);
      var k = A.MoonIllum.illuminated(i);
      var chi =  A.MoonIllum.positionAngle(tp.eq, suneq);
 
      console.log("phase:" + i*180/Math.PI + ", illuminated:" + k + ", angle:" + chi*180/Math.PI);

      //draw the moon phase
      this.drawMoonPhase();

    },
    moonM1W() {
      const t = new Date(this.datareq);
      t.setDate(t.getDate()-7);
      this.datareq=t.toISOString().split('T')[0];
      this.moon();
    },
    moonM1D() {
      const t = new Date(this.datareq);
      t.setDate(t.getDate()-1);
      this.datareq=t.toISOString().split('T')[0];
      this.moon();
    },
    moonToday(){
      this.datareq = this.today;
      this.moon();
    },
    moonP1D() {
      const t = new Date(this.datareq);
      t.setDate(t.getDate()+1);
      this.datareq=t.toISOString().split('T')[0];
      this.moon();
    },
    moonP1W() {
      const t = new Date(this.datareq);
      t.setDate(t.getDate()+7);
      this.datareq=t.toISOString().split('T')[0];
      this.moon();
    },
    moonPhaseText() {
      var text='';
      if (this.mooninfo.phase < 0.03) {
        text='New Moon';
      } 
      else if (this.mooninfo.phase < 0.22) {
        text='Waxing Crescent';
      } 
      else if (this.mooninfo.phase < 0.28) {
        text='First Quarter';
      } 
      else if (this.mooninfo.phase < 0.47) {
        text='Waxing Gibbous';
      } 
      else if (this.mooninfo.phase < 0.53) {
        text='Full Moon';
      } 
      else if (this.mooninfo.phase < 0.72) {
        text='Waning Gibbous';
      } 
      else if (this.mooninfo.phase < 0.78) {
        text='Last Quarter';
      } 
      else if (this.mooninfo.phase < 0.97) {
        text='Waning Crescent';
      } 
      else {
        text = "New Moon";
      }
      return text;
    }
  } 
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.moon {
  border: 1px solid #bfbfbf;
  max-width: 500px;
  justify-content: center;
}
</style>
