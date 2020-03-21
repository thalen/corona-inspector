import * as Koa from 'koa';
import * as json from 'koa-json';
import * as KoaRouter from 'koa-router';
import * as serve from 'koa-static';
import * as ax from 'axios';
import * as moment from 'moment';
import { COUNTRY_CODES } from './constants/countries';

const axios = ax.default;
const app = new Koa();
const router = new KoaRouter();
const port = process.env.PORT || 5000;

app.use(json());

app.use(serve('dist'));

router.get('confirmed', '/api/confirmed/:country', async ctx => {
    const { data } = await axios.get('https://coronavirus-tracker-api.herokuapp.com/confirmed');

    const result = data.locations.filter(loc => loc.country_code === ctx.params.country);
    if (result.length === 0) {
        ctx.throw(400, 'Failed to load statistics');
    } else {
        const countries = result.map(country => {
            let history = Object.keys(country.history).map(date => {
                const timestamp = moment(date, 'MM/DD/YY').valueOf();
                return {
                    timestamp,
                    day: moment(timestamp).format('YYYY-MM-DD'),
                    confirmed: country.history[date]
                };
            });
            history = history.sort((n1, n2) => (n1.timestamp < n2.timestamp ? -1 : 1));
            return {
                country: country.country,
                province: country.province,
                latest: country.latest,
                history
            };
        });

        const dataSets = {
            dataSets: countries,
            labels: countries[0].history.map(h => h.day)
        };
        ctx.body = {
            ...dataSets
        };
    }
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

app.listen(port, () => console.log(`Listening on port ${port}`));
