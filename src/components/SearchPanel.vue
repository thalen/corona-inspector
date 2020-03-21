<template>
    <v-app>
        <v-content>
            <v-container id="input-usage" fluid>
                <v-row>
                    <v-col cols="12" md="4">
                        <v-img src="../assets/covid-19.jpeg" aspect-ratio="2" contain></v-img>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-autocomplete
                            v-model="country"
                            style="max-width: 400px"
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
                <v-row v-if="error">
                    <v-alert type="error" icon="error" style="margin-left: 20px">
                        Failed to load statistics for country {{ country }}
                    </v-alert>
                </v-row>
                <v-row v-if="latest">
                    <v-col cols="12" md="4">
                        <span style="margin-top: 5px; position: absolute"
                            >Total confirmed: <strong>{{ latest }} </strong></span
                        >
                    </v-col>
                    <v-col cols="12" md="4">
                        <v-slider hide-details v-model="minIndex" min="0" :max="history.length" label="Start date:" @end="updateInterval">
                            <template v-slot:append>
                                <span style="width: 81px">
                                    {{ displayDate() }}
                                </span>
                            </template>
                        </v-slider>
                    </v-col>
                </v-row>
                <v-row v-if="chartData">
                    <v-col cols="12">
                        <Chart :chart-data="chartData" />
                    </v-col>
                </v-row>
            </v-container>
        </v-content>
        <v-footer color="white" app>
            <v-expansion-panels>
                <v-expansion-panel style="background-color: #2196F3; border-color: #2196F3">
                    <v-expansion-panel-header style="color: white">&copy; 2020 Thalen solutions AB</v-expansion-panel-header>
                    <v-expansion-panel-content style="color: white">
                        Graph data points are provided by
                        <a style="color:white" target="_blank" href="https://github.com/ExpDev07/coronavirus-tracker-api"
                            >Coronavirus-tracker-api</a
                        >
                        <br />
                        Data sets are collected from Johns Hopkins University Center for Systems Science and Engineering (JHU CSSE) and they
                        are updated once per day.
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-expansion-panels>
        </v-footer>
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
            history: null,
            error: null
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
        displayDate() {
            const date = this.history[this.minIndex];
            return date ? date.day : '';
        },
        search() {
            axios
                .get(`/api/confirmed/${this.country}`)
                .then(({ data }) => {
                    this.error = null;
                    this.history = data;
                    this.latest = data.dataSets.map(d => d.latest).reduce((acc, current) => acc + current);
                    this.minIndex = data.labels.length / 2;

                    const updatedLabels = [];
                    for (let i = 0; i < data.labels.length; i++) {
                        if (i >= this.minIndex) {
                            updatedLabels.push(data.labels[i]);
                        }
                    }
                    const datasets = data.dataSets.map(d => {
                        const updatedHistory = [];
                        for (let i = 0; i < d.history.length; i++) {
                            if (i >= this.minIndex) {
                                updatedHistory.push(d.history[i].confirmed);
                            }
                        }
                        return {
                            label: d.province ? `Confirmed in ${d.province}` : 'Confirmed',
                            backgroundColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
                            data: updatedHistory
                        };
                    });
                    this.chartData = {
                        labels: updatedLabels,
                        datasets
                    };
                })
                .catch(error => {
                    console.error(error);
                    this.error = true;
                    this.latest = null;
                    this.chartData = null;
                });
        }
    }
};
</script>
