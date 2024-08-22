import React, { useState, useEffect } from 'react';
import Slider from '@mui/material/Slider';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const TimeRangeAdjuster = ({ document }) => {
  const [timeRange, setTimeRange] = useState([0, 100]);
  const [initialRange, setInitialRange] = useState([0, 100]);

  useEffect(() => {
    console.log('Document data:', document); // Log the document data
    if (document && Array.isArray(document.date)) {
      const dates = document.date.map(date => {
        const time = new Date(date).getTime();
        console.log('Parsed date:', date, '=>', time); // Log each parsed date
        return time;
      });
      const minDate = Math.min(...dates);
      const maxDate = Math.max(...dates);
      setTimeRange([minDate, maxDate]);
      setInitialRange([minDate, maxDate]);
      console.log('Updated time range:', [minDate, maxDate]); // Log the updated time range
    }
  }, [document]);

  const handleSliderChange = (event, newValue) => {
    setTimeRange(newValue);
    console.log('Slider value changed:', newValue); // Log the slider value
  };

  return (
    <Box sx={{ width: 300 }}>
      <Slider
        value={timeRange}
        onChange={handleSliderChange}
        valueLabelDisplay="auto"
        min={initialRange[0]}
        max={initialRange[1]}
      />
      <Typography>
        Time Period: {`${new Date(timeRange[0]).toLocaleDateString()} - ${new Date(timeRange[1]).toLocaleDateString()}`}
      </Typography>
    </Box>
  );
};

export default TimeRangeAdjuster;