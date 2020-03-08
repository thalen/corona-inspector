<template>
  <v-container id="input-usage"
fluid>
    <v-row>
      <v-col cols="8">
        <label>Landskod</label>
        <input v-model="form.country"
style="margin-left:5px;border: 1px solid;border-radius: 2px"
/>
      </v-col>
      <v-col cols="4">
        <v-btn small
v-on:click="search">
          Sök
        </v-btn>
      </v-col>
    </v-row>
    <v-row v-if="latest">
      <v-col cols="12">
Senaste: {{ latest }}
</v-col>
    </v-row>
  </v-container>
</template>

<script>
import * as ax from 'axios';

const axios = ax.default;
export default {
  name: 'HelloWorld',
  data() {
    return {
      form: {
        country: ''
      },
      latest: null
    };
  },
  methods: {
    search() {
      axios.get(`/api/confirmed/${this.form.country}`).then(({ data }) => {
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
