<script>
import { Bar, mixins } from 'vue-chartjs';
const { reactiveProp } = mixins;

export default {
    extends: Bar,
    mixins: [reactiveProp],
    data: () => ({
        options: {
            responsive: true,
            maintainAspectRatio: false,
            fill: false,
            showLine: true
        }
    }),

    mounted() {
        this.renderChart(this.chartData, this.options);
    }
};
</script>
