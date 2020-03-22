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
                <v-row v-if="chartData && history.dataSets.length > 1">
                    <v-col cols="12">
                        <v-select
                            style="max-width: 400px"
                            v-model="selectedRegions"
                            :items="regions"
                            chips
                            multiple
                            label="Select regions"
                            @blur="regionsSelected"
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
                        <LineChart v-if="history.dataSets.length === 1" :chart-data="chartData" />
                        <BarChart v-if="history.dataSets.length > 1 && regionsIsSet" :chart-data="chartData" />
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

import LineChart from './LineChart.vue';
import BarChart from './BarChart.vue';
import { mapDataSets } from '../services/SearchService';

const axios = ax.default;
export default {
    name: 'SearchPanel',
    components: {
        LineChart,
        BarChart
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
            regions: null,
            selectedRegions: null,
            regionsIsSet: false,
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
        regionsSelected() {
            this.regionsIsSet = true;
            const datasets = this.history.dataSets.filter(d => this.selectedRegions.includes(d.province));
            const updatedDataSets = mapDataSets(datasets, this.minIndex);
            this.chartData = {
                labels: this.chartData.labels,
                datasets: updatedDataSets
            };
        },
        updateInterval() {
            const updatedLabels = [];
            for (let i = 0; i < this.history.labels.length; i++) {
                if (i >= this.minIndex) {
                    updatedLabels.push(this.history.labels[i]);
                }
            }
            const datasets = mapDataSets(this.history.dataSets, this.minIndex);
            this.chartData = {
                labels: updatedLabels,
                datasets
            };
        },
        displayDate() {
            return this.history.labels[this.minIndex];
        },
        search() {
            if (!this.country) {
                return;
            }
            axios
                .get(`/api/confirmed/${this.country}`)
                .then(({ data }) => {
                    this.error = null;
                    this.history = data;
                    this.latest = data.dataSets.map(d => d.latest).reduce((acc, current) => acc + current);
                    this.minIndex = data.labels.length - 15;
                    if (this.minIndex < 0) {
                        this.minIndex = 0;
                    }
                    const updatedLabels = [];
                    for (let i = 0; i < data.labels.length; i++) {
                        if (i >= this.minIndex) {
                            updatedLabels.push(data.labels[i]);
                        }
                    }
                    const datasets = mapDataSets(data.dataSets, this.minIndex);
                    this.chartData = {
                        labels: updatedLabels,
                        datasets
                    };
                    this.regions = data.dataSets.map(d => d.province);
                    this.regionsIsSet = false;
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
