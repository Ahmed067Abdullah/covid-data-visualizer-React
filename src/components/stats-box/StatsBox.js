import React from 'react';
import CountUp from 'react-countup';
import classses from './StatsBox.module.css';

const StatsBox = ({ heading, count, percentage }) => {
  return (
    <div className={classses['stats-container']}>
      <div className={classses['heading']}>{heading}</div>
      <div className={classses['count']}>
        <CountUp delay={0.5} end={count} />
      </div>
      <div className={classses['percentage']}>{!isNaN(percentage)
        ? percentage
        : 0}%</div>
    </div>
  )
}

export default StatsBox;
