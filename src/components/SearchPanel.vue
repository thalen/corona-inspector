<template>
  <v-app>
    <v-content>
      <v-container id="input-usage" fluid>
        <v-row>
          <v-col cols="4">
            <v-autocomplete
              v-model="country"
              :items="countryCodes"
              color="blue"
              hide-no-data
              hide-selected
              label="Select a country"
              placeholder="Start typing to Search"
              append-icon="expand_more"
            />
          </v-col>
        </v-row>
        <v-row v-if="latest">
          <v-col cols="3">
            <span style="margin-top: 5px; position: absolute">Total confirmed: {{ latest }}</span>
          </v-col>
          <v-col cols="4">
            <v-slider v-model="minIndex" min="0" :max="history.length" label="Start date" @end="updateInterval" />
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
  name: 'SearchPanel',
  components: {
    Chart
  },
  props: {
    countryCodes: {
      type: Array,
      default: null
    }
  },
  data() {
    return {
      country: '',
      latest: null,
      chartData: null,
      minIndex: -1,
      dataPoints: 0,
      history: null
    };
  },
  watch: {
    country(val) {
      if (val !== '') {
        this.search();
      }
    }
  },
  methods: {
    updateInterval() {
      const updatedHistory = [];
      for (let i = 0; i < this.history.length; i++) {
        if (i >= this.minIndex) {
          updatedHistory.push(this.history[i]);
        }
      }
      this.chartData = {
        labels: updatedHistory.map(h => h.day),
        datasets: [
          {
            label: 'Confirmed',
            backgroundColor: '#f87979',
            data: updatedHistory.map(h => h.confirmed)
          }
        ]
      };
    },
    search() {
      axios.get(`/api/confirmed/${this.country}`).then(({ data }) => {
        const historyKeys = Object.keys(data.country.history).sort((n1, n2) => (Number(n1) < Number(n2) ? -1 : 1));
        const history = historyKeys
          .map(key => {
            return {
              day: moment(Number(key)).format('YYYY-MM-DD'),
              confirmed: data.country.history[key]
            };
          })
          .filter(h => Number(h.confirmed) > 0);

        this.history = history;
        this.latest = data.country.latest;
        this.minIndex = this.history.length / 2;

        const updatedHistory = [];
        for (let i = 0; i < this.history.length; i++) {
          if (i >= this.minIndex) {
            updatedHistory.push(this.history[i]);
          }
        }

        this.chartData = {
          labels: updatedHistory.map(h => h.day),
          datasets: [
            {
              label: 'Confirmed',
              backgroundColor: '#f87979',
              data: updatedHistory.map(h => h.confirmed)
            }
          ]
        };
      });
    }
  }
};
</script>
