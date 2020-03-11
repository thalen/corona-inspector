import * as Koa from 'koa';
import * as json from 'koa-json';
import * as KoaRouter from 'koa-router';
import * as ax from 'axios';
import * as moment from 'moment';
import { COUNTRY_CODES } from './constants/countries';

const axios = ax.default;
const app = new Koa();
const router = new KoaRouter();
app.use(json());

router.get('main', '/', ctx => {
  ctx.body = 'Welcome! To the Koala Book of Everything!';
});

router.get('confirmed', '/api/confirmed/:country', async ctx => {
  const { data } = await axios.get('https://coronavirus-tracker-api.herokuapp.com/confirmed');

  const country = data.locations.find(loc => loc.country_code === ctx.params.country);
  country.history = Object.keys(country.history).reduce((acc, current) => {
    const date = moment(current, 'MM/DD/YY').valueOf();
    acc[date] = country.history[current];
    return acc;
  }, {});

  ctx.body = {
    country
  };
});

router.get('countryCodes', '/api/country-codes', ctx => {
  const items = Object.keys(COUNTRY_CODES).map(key => {
    return {
      text: key,
      value: COUNTRY_CODES[key]
    };
  });

  ctx.body = {
    items
  };
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(5000, () => console.log('running on port 5000'));
