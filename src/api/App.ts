import * as Koa from 'koa';
import * as json from 'koa-json';
import * as KoaRouter from 'koa-router';
import * as ax from 'axios';
import * as moment from 'moment';

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
    const date = moment(current, 'MM/DD/YY').unix();
    acc[date] = country.history[current];
    return acc;
  }, {});

  ctx.body = {
    country
  };
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(5000, () => console.log('running on port 5000'));
