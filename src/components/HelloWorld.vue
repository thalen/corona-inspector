<template>
  <v-app>
    <v-content>
      <v-container id="input-usage" fluid>
        <v-row>
          <v-col cols="4">
            <label>Landskod</label>
            <input
v-model="form.country" style="margin-left:5px;border: 1px solid;border-radius: 2px" />
          </v-col>
          <v-col cols="4">
            <v-btn small color="primary" @click="search">
              Sök
            </v-btn>
          </v-col>
        </v-row>
        <v-row v-if="latest">
          <v-col cols="12">
Antal bekräftade fall: {{ latest }}
</v-col>
        </v-row>
        <v-row v-if="chartData">
          <v-col cols="12">
            <Chart :chart-data="chartData" />
          </v-col>
        </v-row>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import * as ax from 'axios';
import moment from 'moment';

import Chart from './Chart.vue';

const axios = ax.default;
export default {
  name: 'HelloWorld',
  components: {
    Chart
  },
  data() {
    return {
      form: {
        country: ''
      },
      latest: null,
      chartData: null
    };
  },
  methods: {
    search() {
      axios.get(`/api/confirmed/${this.form.country}`).then(({ data }) => {
        const historyKeys = Object.keys(data.country.history).sort((n1, n2) => (Number(n1) < Number(n2) ? -1 : 1));
        const history = historyKeys
          .map(key => {
            return {
              day: moment(Number(key)).format('YYYY-MM-DD'),
              confirmed: data.country.history[key]
            };
          })
          .filter(h => Number(h.confirmed) > 0);

        this.chartData = {
          labels: history.map(h => h.day),
          datasets: [
            {
              label: 'Bekräftade',
              backgroundColor: '#f87979',
              data: history.map(h => h.confirmed)
            }
          ]
        };

        this.latest = data.country.latest;
      });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
