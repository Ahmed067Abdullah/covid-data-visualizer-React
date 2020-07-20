import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import Select from 'react-select';
import StatsModal from './components/stats-modal/StatsModal';
import TestsGraphModal from './components/tests-graph-modal/TestsGraphModal';
import getGraphOptions from './utils/graphOptions';
import apiURL from './config/apiURL';
import './App.css';

const dropdownOptions = [{ label: 'Last 30 days', value: '30' }, { label: 'Last 60 days', value: '60' }, { label: 'Last 90 days', value: '90' }, { label: 'All', value: '' },]
const defaultOption = dropdownOptions[2];

function App() {
  const [lastDay, setLastDay] = useState({})
  const [cumulativeData, setCumulativeData] = useState({});
  const [nonCumulativeData, setNonCumulativeData] = useState({});
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(defaultOption);
  const [showCumulative, setShowCumulative] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showTestsModal, setShowTestsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDataType, setShowDataType] = useState({ Active: true, Confirmed: true, Recovered: true, Deaths: true });

  useEffect(() => {
    getData(defaultOption.value);
    const data = JSON.parse(localStorage.getItem("testt"));
    setupState(data);
    setLastDay(data[data.length - 1]);
    setLoading(false);
  }, []);

  const getData = days => {
    setLoading(true);
    fetch(`${apiURL}?days=${days}`)
      .then(response => response.json())
      .then(data => {
        console.log(data)
        setupState(data);
        setLastDay(data[data.length - 1]);
        localStorage.setItem("testt", JSON.stringify(data));
        setLoading(false);
      })
      .catch(err => console.log(err));
  };

  const isDataSetOk = today => {
    const { Active, Recovered } = today;
    return Active && Recovered;
  }

  const setupState = data => {
    const len = data.length;
    const localCumulativeData = { Active: [], Confirmed: [], Deaths: [], Recovered: [], Tests: [] };
    const localNonCumulativeData = { Confirmed: [], Deaths: [], Recovered: [], Tests: [] };
    const localDates = [];

    for (let i = 1; i < len; i++) {
      const { Active, Confirmed, Deaths, Recovered, Date, Tests = 0 } = data[i];
      if (isDataSetOk(data[i])) {
        localCumulativeData.Tests.push(Tests);
        localCumulativeData.Active.push(Active);
        localCumulativeData.Confirmed.push(Confirmed);
        localCumulativeData.Deaths.push(Deaths);
        localCumulativeData.Recovered.push(Recovered);

        let j = 1;
        if (!(data[i - 1].Confirmed && data[i - 1].Deaths && data[i - 1].Recovered)) {
          j = 2;
        }
        let { Confirmed: ConfirmedPrev, Deaths: DeathsPrev, Recovered: RecoveredPrev, Tests: TestsPrev = 0 } = data[i - j]
        if (Date === '2020-06-11T00:00:00.000Z' || Date === '2020-06-14T00:00:00.000Z') { // Since data seems wrong 
          localNonCumulativeData.Confirmed.push(Confirmed - ConfirmedPrev - 6000);
        } else {
          localNonCumulativeData.Confirmed.push(Confirmed - ConfirmedPrev);
        }
        localNonCumulativeData.Tests.push(Tests - TestsPrev);
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

  const btns = ['Active', 'Confirmed', 'Recovered', 'Deaths'];

  const customStyles = {
    menu: (provided, state) => ({
      ...provided,
      textAlign: 'start',
      cursor: 'pointer',
      color: state.selectProps.menuColor,
    })
  }

  const renderTestsGraphModal = () => {
    const index = nonCumulativeData.Tests.findIndex(d => d) + 1;
    return <TestsGraphModal
      open={showTestsModal}
      handleClose={() => setShowTestsModal(false)}
      dates={dates.slice(index)}
      nonCumulativeData={(nonCumulativeData.Tests || []).slice(index)}
      cumulativeData={(cumulativeData.Tests || []).slice(index)}
    />;
  };

  return (
    <div className="App">
      {showTestsModal
        ? renderTestsGraphModal()
        : null}
      <StatsModal
        open={showModal}
        handleClose={() => setShowModal(false)}
        lastDay={lastDay}
      />
      <div className="stats-btn-container">
        <button
          className="active"
          disabled={loading}
          onClick={() => setShowTestsModal(true)}
        >View Tests Frequency</button>
        <button
          className="active"
          disabled={loading}
          onClick={() => setShowModal(true)}
        >View Stats</button>
      </div>
      <div className="data-container">
        {loading
          ? <p className='loading'>Loading...</p>
          : <div style={{ height: '100%' }}>
            <div className="select-container">
              <Select
                defaultValue={defaultOption}
                options={dropdownOptions}
                onChange={val => {
                  if (val !== selectedDate) {
                    setSelectedDate(val);
                    getData(val.value);
                  }
                }}
                value={selectedDate}
                styles={customStyles}
              />
            </div>
            <div className="graph-container">
              <ReactApexChart
                height={'100%'}
                options={getGraphOptions(dates)}
                series={graphData}
                type="line"
                width={'100%'}
              />
            </div>
          </div>}
      </div>
      <p className='updated-on-date'>
        {loading
          ? ''
          : <>Last updated on&nbsp;
          <span>{new Date(dates[dates.length - 1]).toDateString()}</span>
          </>}
      </p>
      <div className='btns-container'>
        <div>
          {btns.map(btn => <button
            className={showDataType[btn] ? 'active' : ''}
            disabled={loading || (!showCumulative && btn === 'Active')}
            key={btn}
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
