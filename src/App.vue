<template>
    <div id="app">
        <SearchPanel v-if="items" :country-codes="items" />
    </div>
</template>

<script>
import * as ax from 'axios';
import SearchPanel from './components/SearchPanel.vue';
const axios = ax.default;

export default {
    name: 'App',
    components: {
        SearchPanel
    },
    data() {
        return {
            items: null
        };
    },
    mounted() {
        this.init();
    },
    methods: {
        async init() {
            const { data } = await axios.get('/api/country-codes');
            this.items = data.items;
        }
    }
};
</script>
