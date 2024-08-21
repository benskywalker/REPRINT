import React, { useState, useEffect } from 'react';
import Slider from '@mui/material/Slider';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const TimeRangeAdjuster = ({ data = [], onDataAdjust }) => {
  const [timeRange, setTimeRange] = useState([0, 100]);
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    if (data.length > 0) {
      // Assuming data has a 'time' property
      const minTime = Math.min(...data.map(item => item.time));
      const maxTime = Math.max(...data.map(item => item.time));
      setTimeRange([minTime, maxTime]);
    }
  }, [data]);

  useEffect(() => {
    if (data.length > 0) {
      const adjustedData = data.filter(item => item.time >= timeRange[0] && item.time <= timeRange[1]);
      setFilteredData(adjustedData);
      onDataAdjust(adjustedData);
    }
  }, [timeRange, data, onDataAdjust]);

  const handleSliderChange = (event, newValue) => {
    setTimeRange(newValue);
  };

  return (
    <Box sx={{ width: 300 }}>
      <Slider
        value={timeRange}
        onChange={handleSliderChange}
        valueLabelDisplay="auto"
        min={ 0}
        max={ 100}
      />
      <Typography>Time Period: {timeRange[0]} - {timeRange[1]}</Typography>
      
          </Box>
  );
};

export default TimeRangeAdjuster;