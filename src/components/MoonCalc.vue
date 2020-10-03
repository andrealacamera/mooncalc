<template>
  <div class="container moon">
    <div class="row">
      <h1>Moon illumination</h1>
      
    </div>
    <div class="row justify-content-end" >
      <div class="col-3 text-right">
        {{t('language')}} 
      </div>  
      <div class="col-3 locale-changer ">
        <span @click="lang('it')" :class="{'selected': locale==='it'}">IT</span> | <span @click="lang('en')" :class="{'selected': locale==='en'}">EN</span>
      </div>
    </div>
    <div class="row">
      <label for="position" class="form-label">{{t('position')}}</label>
      <div class="input-group">
        <span class="input-group-text w-25" id="lat">Lat</span>
        <input type="text" class="form-control" id="position-lat" aria-describedby="Latitude" v-model="lat" :placeholder="[[t('lat')]]">
      </div>
      <div class="input-group mb-3">
        <span class="input-group-text w-25" id="lat">Lon</span>
        <input type="text" class="form-control" id="position-lon" aria-describedby="Longitude" v-model="lon" :placeholder="[[t('lon')]]">
      </div>
    </div>
    <div class="row">
      <label for="ytt">{{t('compute')}}</label>
      <div class="row justify-content-center">
        <div class="col">
          <button class="btn btn-secondary" @click="moonM1W">{{t('m1w')}}</button>
        </div>
        <div class="col">
          <button class="btn btn-secondary" @click="moonM1D">{{t('m1d')}}</button>
        </div>
        <div class="col">
          <button class="btn btn-primary" @click="moonToday">{{t('today')}}</button>
        </div>
        <div class="col">
          <button class="btn btn-secondary" @click="moonP1D">{{t('p1d')}}</button>
        </div>
        <div class="col">
          <button class="btn btn-secondary" @click="moonP1W">{{t('p1w')}}</button>
        </div>
      </div>      
      <label for="today">{{t('date')}}</label>
      <input type='date' id="calendar" v-model="datareq" @change="moon"> 
    </div>    
    <div class="row">
      <div class="d-flex justify-content-center" id="moon"></div>

    </div>
    <div class="row d-flex ">
      <h4 class="order-0">{{t('ill')}} {{ill}}</h4>
      <h4 class="order-1">{{t('phase')}} {{phs}} </h4>
      <span :class="{'order-2' : riseset, 'order-3' : !riseset}">{{t('rise')}} {{rise}} </span>
      <span :class="{'order-2' : !riseset, 'order-3' : riseset}">{{t('set')}} {{set}}</span>
    </div>
  </div>
</template>

<script>
import SunCalc from 'suncalc2';
import * as d3 from 'd3';
import A from 'meeusjs'
import { useI18n } from 'vue-i18n'

export default {
  name: 'MoonCalc',
  setup() {
    return useI18n()
  },
  data() {
    return {
      width: 200,
      lat: 44.69064, 
      lon: 8.88480,
      today: new Date().toISOString().split('T')[0],
      datareq: new Date().toISOString().split('T')[0],
      ill: '',
      // phs: '',
      mooninfo: {},
      rise: '',
      transit: '',
      set: '',
      riseset: true
    }
  },
  computed: {
    phs() {
      var text='';
        if (this.mooninfo.phase < 0.03) {
          text=this.t('new_moon');
        } 
        else if (this.mooninfo.phase < 0.22) {
          text=this.t('waxing_crescent');
        } 
        else if (this.mooninfo.phase < 0.28) {
          text=this.t('first_quarter');
        } 
        else if (this.mooninfo.phase < 0.47) {
          text=this.t('waxing_gibbous');
        } 
        else if (this.mooninfo.phase < 0.53) {
          text=this.t('full_moon');
        } 
        else if (this.mooninfo.phase < 0.72) {
          text=this.t('waning_gibbous');
        } 
        else if (this.mooninfo.phase < 0.78) {
          text=this.t('last_quarter');
        } 
        else if (this.mooninfo.phase < 0.97) {
          text=this.t('waning_crescent');
        } 
        else {
          text = this.t("new_moon");
        }
        return text;
      }
  },
  mounted() {
    this.moon();
  },
  methods: {
    lang(l) {
      this.locale=l;
      this.moon();
    },
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
      this.rise = ('rise' in x) ? this.d(x.rise, 'long') : '---';
      this.set = ('set' in x) ? this.d(x.set, 'long') : '---';
      if (this.rise > this.set) {
        this.riseset=false;
      }
      else {
        this.riseset=true;
      }
      this.ill = (m.fraction*100).toFixed(1) + "%";
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
.locale-changer {
  cursor: pointer;
  color: #666;
}
.selected {
  color: initial;
}
</style>
