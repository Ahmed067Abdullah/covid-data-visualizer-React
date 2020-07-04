export default dates => {
  return {
    chart: {
      height: 350,
      type: 'line',
      zoom: {
        enabled: true
      },
      toolbar: {
        tools: {
          download: false,
          selection: false,
          pan: false,
        },
      },
    },
    stroke: {
      curve: 'straight',
      width: 2,
    },
    title: {
      text: 'Covid Cases, Pakistan',
      align: 'left'
    },
    grid: {
      row: {
        colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
        opacity: 0.5
      },
    },
    xaxis: {
      type: 'datetime',
      categories: dates,
    },
    yaxis: {
      min: 0,
    }
  }
}