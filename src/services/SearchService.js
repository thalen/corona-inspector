const mapDataSets = (dataSets, minIndex) =>
    dataSets.map(d => {
        const updatedHistory = [];
        for (let i = 0; i < d.history.length; i++) {
            if (i >= minIndex) {
                updatedHistory.push(d.history[i].confirmed);
            }
        }
        return {
            label: d.province ? `Confirmed in ${d.province}` : 'Confirmed',
            backgroundColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
            data: updatedHistory
        };
    });

export { mapDataSets };
