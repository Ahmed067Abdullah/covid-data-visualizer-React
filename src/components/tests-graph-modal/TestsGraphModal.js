import React, { useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import ReactModal from 'react-modal';
import modalStyles from '../../utils/modalStyles';
import getGraphOptions from '../../utils/graphOptions';
import classes from './TestsGraphModal.module.css';

const TestsGraphModal = ({ dates, nonCumulativeData, cumulativeData, open, handleClose }) => {
  const [showCumulative, setShowCumulative] = useState(false);

  let data = nonCumulativeData;
  let text = 'Cumulative';
  if (showCumulative) {
    data = cumulativeData;
    text = 'Non Cumulative';
  }

  return (
    <ReactModal
      isOpen={open}
      style={modalStyles}
    >
      <div className={classes['cross-icon-container']}>
        <p>Tests Frequency</p>
        <button onClick={handleClose}>&#10006;</button>
      </div>
      <div className={classes['graph-container']}>
        <div>
          <ReactApexChart
            height={'400'}
            options={getGraphOptions(dates)}
            series={[{ name: "Tests", data }]}
            type="line"
            width={'95%'}
          />
        </div>
        <button
          onClick={() => setShowCumulative(!showCumulative)}
          className={`active ${classes['button']}`}
        >Show {text}</button>
      </div>
    </ReactModal>
  )
}

export default TestsGraphModal;
