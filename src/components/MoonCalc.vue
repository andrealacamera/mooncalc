<template>
  <div class="container moon-container">
    <div class="row justify-content-end" >
      <div class="col-auto">
        {{t('language')}} 
      </div>  
      <div class="col-auto locale-changer text-right">
        <span @click="lang('it')" :class="{'selected bg-primary': locale==='it'}">IT</span> | <span @click="lang('en')" :class="{'selected bg-primary': locale==='en'}">EN</span>
      </div>
    </div>
    <div class="row">
      <label for="position" class="form-label">{{t('position')}}</label>
      <div class="input-group mb-3">
        <span class="input-group-text">{{t('city')}}</span>
        <input type="text" class="form-control" aria-label="search your city" v-model="city" @keyup.enter="searchCity"> 
        <button class="btn btn-primary" @click="searchCity">{{t('search')}}</button>
      </div>
      <div>
        <div class="d-flex flex-column alert alert-success" v-if="okCity">
          <span >{{t('okCity')}}</span>
          <span >{{resCity}} - {{resCountry}} ({{resProv}})</span>
          <button class="btn btn-success" @click="okCityBtn">OK</button>
        </div>
        <div class="d-flex flex-column alert alert-warning" v-if="warningCity">
          <span>{{t('warningCity')}}</span>
          <span>{{resCity}} - {{resCountry}} ({{resProv}})</span>
          <span>{{t('CityText1')}}</span>
          <span>{{t('CityText2')}}</span>
          <button class="btn btn-warning" @click="warningCityBtn">OK</button>
        </div>
        <div class="d-flex flex-column alert alert-danger" v-if="errCity">
          <button type="button" class="btn-close float-right" aria-label="Close" @click="errCityBtn"></button>
          <span >{{t('errCity')}}</span>
          <span >{{t('CityText1')}}</span>
          <span >{{t('CityText2')}}</span>
        </div>
        <div class="d-flex flex-column alert alert-danger" v-if="serverB">
          <button type="button" class="btn-close" aria-label="Close" @click="errCityBtn"></button>
          <span >{{t('serverBusy')}}</span>
        </div>     
      </div>
      <div class="d-flex mb-3">
        <div class="input-group">
          <span class="input-group-text w-25" id="lat">Lat</span>
          <input type="text" class="form-control" id="position-lat" aria-describedby="Latitude" @change="setPosition" v-model="lat">
        </div>
        <div class="input-group">
          <span class="input-group-text w-25" id="lat">Lon</span>
          <input type="text" class="form-control" id="position-lon" aria-describedby="Longitude" @change="setPosition" v-model="lon">
        </div>
      </div>
    </div>
    <div class="row">
      <span>{{t('compute')}}</span>
      <div class="row justify-content-center">
        <div class="col-auto g-1">
          <button class="btn btn-secondary" @click="moonM1W">{{t('m1w')}}</button>
        </div>
        <div class="col-auto g-1">
          <button class="btn btn-secondary" @click="moonM1D">{{t('m1d')}}</button>
        </div>
        <div class="col-auto g-1">
          <button class="btn btn-primary" @click="moonToday">{{t('today')}}</button>
        </div>
        <div class="col-auto g-1">
          <button class="btn btn-secondary" @click="moonP1D">{{t('p1d')}}</button>
        </div>
        <div class="col-auto g-1">
          <button class="btn btn-secondary" @click="moonP1W">{{t('p1w')}}</button>
        </div>
      </div>
    </div>
    <div class="row mb-3">
      <span>{{ t('date') }}</span>
      <input type='date' class="form-control calendar" 
      v-model="datareq" @change="moon"> 
    </div>
    <div class="row">
      <div class="d-flex justify-content-center" id="moon"></div>
    </div>
    <div class="row d-flex ">
      <h4 class="order-0">{{t('ill')}} {{ill}}</h4>
      <h4 class="order-1">{{t('phase')}} {{phs}} </h4>
      <span :class="{'order-2' : riseset, 'order-3' : !riseset}">{{t('rise')}} {{rise}}</span>
      <span :class="{'order-2' : !riseset, 'order-3' : riseset}">{{t('set')}} {{set}}</span>
    </div>
  </div>
</template>

<script>
import SunCalc from 'suncalc2';
import * as d3 from 'd3';
import { useI18n } from 'vue-i18n';
import axios from 'axios';

export default {
  name: 'MoonCalc',
  setup() {
    return useI18n()
  },
  data() {
    return {
      width: 200,
      lat: 44.68478, 
      lon: 8.88901,
      lat_tmp: null,
      lon_tmp: null,
      today: new Date().toISOString().split('T')[0],
      datareq: new Date().toISOString().split('T')[0],
      ill: '',
      mooninfo: {},
      rise: '',
      transit: '',
      set: '',
      riseset: true,
      // imgUrl: require('@/assets/LP.png'),
      imgUrl: '/wordpress/wp-content/plugins/wp-vue/img/LP.png',
      city: 'Arquata Scrivia, IT',
      okCity: false,
      resCity: '',
      resCountry: '',
      resProv: '',
      warningCity: false,
      errCity: false,
      serverB: false
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
    searchCity() {
      if (this.city.length == 0) {
        return
      }
      axios( {
        method: 'GET',
        header: {
          'Content-Type': 'application/json'
        },
        url:'https://geocode.xyz/'+encodeURI(this.city)+'/?json=1'})
      .then(res => {
        if (res.data.latt && res.data.longt) {
          if (res.data.standard.confidence > 0) {
            this.warningCity = true;
            this.okCity = false;
            this.errCity = false;
            this.serverB = false;
            if (res.data.standard.confidence > 0.5) {
              this.okCity = true;
              this.warningCity = false;
              this.errCity = false;
              this.serverB = false;
            } 
            this.resCity = res.data.standard.city || '';
            this.resCountry = res.data.standard.countryname || '';
            this.resProv = res.data.standard.prov;
            this.lat_tmp = res.data.latt;
            this.lon_tmp = res.data.longt;
          }
          else {
              this.errCity = true;
              this.okCity = false;
              this.warningCity = false;
              this.serverB = false;
          }
        }
      })
      .catch(err => {
        if(err.response.status === 403) {
          this.serverB = true;
          this.okCity = false;
          this.warningCity = false;
          this.errCity = false;
        } 
        else {
          this.errCity = true;
          this.okCity = false;
          this.warningCity = false;
          this.serverB = false;
        }
      });
    },
    okCityBtn() {
      this.okCity = false;
      this.lat = this.lat_tmp;
      this.lon = this.lon_tmp;
      this.setPosition();
    },
    warningCityBtn() {
      this.warningCity = false;
      this.lat = this.lat_tmp;
      this.lon = this.lon_tmp;
      this.setPosition();
    },
    errCityBtn() {
      this.errCity = false;
    },
    tomorrow() {
      const t = new Date(this.datareq);
      t.setDate(t.getDate()+1);
      return t;
    },
    setFill1() {
      return (this.mooninfo.phase < 0.25 || this.mooninfo.phase > 0.75) ? "#ffffdd": "#333" ;
    },
    setFill2() {
      return (this.mooninfo.phase < 0.25 || this.mooninfo.phase > 0.75) ? "#333": "#ffffdd" ;
    },
    setScaleX() {
      return 2*Math.abs(this.mooninfo.fraction - 0.5);
    },
    setFill3() {
      return (this.mooninfo.phase < 0.25 || this.mooninfo.phase > 0.75) ? "#333": "#ffffdd" ;
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
        .attr("width", this.width)
        .attr("height", this.width);
      // svg.append("defs")
      //   .append("filter") 
      //   .attr("id", "blur")
      //   .append("feGaussianBlur")
      //   .attr("stdDeviation", 6); 
      var content = svg.append("g").attr("transform",`translate(${(this.width)/2},${(this.width)/2})`);
      var ph = content.append("g");
      ph.append("circle").attr('r', this.width/2)
      .style("fill", this.setFill1());
      ph.append("circle").attr('r',this.width/2)
        .style("fill", this.setFill2())
        // .attr("filter", "url(#blur)")
        .attr("transform", `scale(${this.setScaleX()},1)`);
      ph.append("path").attr("d", this.setPath())
        .style("fill", this.setFill3());
      ph.append("svg:image")
        .attr("xlink:href", this.imgUrl)
        .attr("id", "moonID")
        .attr("x", -this.width/2)
        .attr("y", -this.width/2)
        .attr("width", this.width)
        .attr("height", this.width)
        .style("mix-blend-mode" , "multiply");
    },
    moon() {
      var o = new Date(this.datareq);
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
    setPosition() {
      this.moon();
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.moon-container {
  border: 1px solid #bfbfbf;
  /* max-width: 500px; */
  justify-content: center;
}
section[class^="post-"] .row {
  margin-top: .5em;
  margin-bottom: .5em;
}
#moonID {
  mix-blend-mode: multiply;
}
.locale-changer {
  cursor: pointer;
  color: #666;
}
.locale-changer span {
    padding: 3px;

}
.selected {
  color: #fff;
}
.calendar {
  width: 250px;
  margin: auto;
}
</style>
