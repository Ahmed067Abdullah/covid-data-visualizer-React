import React from 'react';
import modalStyles from '../../utils/modalStyles';
import ReactModal from 'react-modal';
import classes from './StatsModal.module.css';
import StatsBox from '../stats-box/StatsBox';

const StatsModal = ({ lastDay, open, handleClose }) => {

  const getPercentage = (count, total) => ((count / total) * 100).toFixed(2);

  const { Active, Confirmed, Deaths, Recovered, Tests } = lastDay;

  const stats = [
    {
      id: 0,
      heading: 'Total Tests',
      count: Tests,
      percentage: `Positive: ${getPercentage(Confirmed, Tests)}`
    },
    {
      id: 1,
      heading: 'Total Active',
      count: Active,
      percentage: getPercentage(Active, Confirmed)
    },
    {
      id: 2,
      heading: 'Total Recovered',
      count: Recovered,
      percentage: getPercentage(Recovered, Confirmed)
    },
    {
      id: 3,
      heading: 'Total Deaths',
      count: Deaths,
      percentage: getPercentage(Deaths, Confirmed)
    }
  ];

  return (
    <ReactModal
      isOpen={open}
      style={modalStyles}
    >
      <div className={classes['cross-icon-container']}>
        <p>Covid Statistics</p>
        <button onClick={handleClose}>&#10006;</button>
      </div>
      <div className={classes['all-stats-container']}>
        {stats.map(s => <StatsBox
          key={s.id}
          heading={s.heading}
          count={s.count}
          percentage={s.percentage}
        />)}
      </div>
    </ReactModal>
  )
}

export default StatsModal;
