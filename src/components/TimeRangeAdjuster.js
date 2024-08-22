import React, { useState } from 'react';
import Slider from '@mui/material/Slider';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const TimeRangeAdjuster = () => {
  const [timeRange, setTimeRange] = useState([10, 50]);

  const handleSliderChange = (event, newValue) => {
    setTimeRange(newValue);
  };

  return (
    <Box sx={{ width: 300 }}>
      <Slider
        value={timeRange}
        onChange={handleSliderChange}
        valueLabelDisplay="auto"
        min={0}
        max={100}
      />
      <Typography>Time Period: {`${timeRange[0]} - ${timeRange[1]}`}</Typography>
    </Box>
  );
};

export default TimeRangeAdjuster;