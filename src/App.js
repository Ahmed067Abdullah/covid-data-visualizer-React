import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import './App.css';

function App() {
  const [cumulativeData, setCumulativeData] = useState({});
  const [nonCumulativeData, setNonCumulativeData] = useState({});
  const [dates, setDates] = useState([]);
  const [showCumulative, setShowCumulative] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDataType, setShowDataType] = useState({ Active: true, Confirmed: true, Recovered: true, Deaths: true });

  useEffect(() => {
    fetch('https://api.covid19api.com/total/country/pakistan')
      .then(response => response.json())
      .then(data => {
        setupState(data);
        setLoading(false);
      })
      .catch(err => console.log(err));
  }, []);

  const setupState = data => {
    const len = data.length;
    const localCumulativeData = { Active: [], Confirmed: [], Deaths: [], Recovered: [] };
    const localNonCumulativeData = { Confirmed: [], Deaths: [], Recovered: [] };
    const localDates = [];
    for (let i = 1; i < len; i++) {
      const { Confirmed: ConfirmedPrev, Deaths: DeathsPrev, Recovered: RecoveredPrev } = data[i - 1];
      const { Active, Confirmed, Deaths, Recovered, Date } = data[i];
      if (Active && Date !== '2020-06-10T00:00:00Z' && Date !== '2020-06-12T00:00:00Z') { // to ignore inital dates when there were no cases
        localCumulativeData.Active.push(Active);
        localCumulativeData.Confirmed.push(Confirmed);
        localCumulativeData.Deaths.push(Deaths);
        localCumulativeData.Recovered.push(Recovered);

        if (Date === '2020-06-11T00:00:00Z' || Date === '2020-06-14T00:00:00Z') { // Since data seems wrong 
          localNonCumulativeData.Confirmed.push(Confirmed - ConfirmedPrev - 6000);
        } else {
          localNonCumulativeData.Confirmed.push(Confirmed - ConfirmedPrev);
        }
        localNonCumulativeData.Deaths.push(Deaths - DeathsPrev);
        localNonCumulativeData.Recovered.push(Recovered - RecoveredPrev);

        localDates.push(Date);
      }
    }
    setCumulativeData(localCumulativeData);
    setNonCumulativeData(localNonCumulativeData);
    setDates(localDates);
  }

  let toggleType = '';
  let dataToShow = null;
  if (showCumulative) {
    dataToShow = cumulativeData;
    toggleType = 'Non cumulative';
  } else {
    dataToShow = nonCumulativeData;
    toggleType = 'Cumulative';
  }

  let graphData = [];
  const { Active, Deaths, Recovered, Confirmed } = dataToShow;
  if (Active && showDataType.Active) {
    graphData.push({ name: "Active", data: Active });
  }
  if (showDataType.Deaths) {
    graphData.push({ name: "Deaths", data: Deaths });
  }
  if (showDataType.Recovered) {
    graphData.push({ name: "Recovered", data: Recovered });
  }
  if (showDataType.Confirmed) {
    graphData.push({ name: "Confirmed", data: Confirmed });
  }

  const options = {
    chart: {
      height: 350,
      type: 'line',
      zoom: {
        enabled: true
      }
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
    }
  };

  const btns = ['Active', 'Confirmed', 'Recovered', 'Deaths'];

  return (
    <div className="App">
      <div className="graph-container">
        {loading
          ? <p className='loading'>Loading...</p>
          : <ReactApexChart
            height={'100%'}
            options={options}
            series={graphData}
            type="line"
            width={'100%'}
          />}
      </div>
      <div className='btns-container'>
        <div>
          {btns.map(btn => <button
            className={showDataType[btn] ? 'active' : ''}
            disabled={loading}
            onClick={() => setShowDataType({
              ...showDataType,
              [btn]: !showDataType[btn]
            })}>
            {btn}
          </button>)}
        </div>
        <button
          className='cumulative-btn'
          disabled={loading}
          onClick={() => setShowCumulative(!showCumulative)}>
          {`Show ${toggleType} Data`}
        </button>
      </div>
    </div>
  );
}

export default App;
