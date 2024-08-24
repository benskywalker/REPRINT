import React, { useEffect } from 'react';
import Slider from '@mui/material/Slider';

//this is a TimeRangeAdjuster component 
//that will allow the user to adjust 
//the time range of the data displayed in the sigma graph.

//it will take in an edges array 
const TimeRangeAdjuster = ({ edges, minDate, maxDate }) => {
    const [timeRange, setTimeRange] = React.useState([minDate, maxDate]);
    const [initialRange, setInitialRange] = React.useState([minDate, maxDate]);

    useEffect(() => {
        setInitialRange([minDate, maxDate]);
        setTimeRange([minDate, maxDate]);
    }, [minDate, maxDate]);

    const handleChange = (event, newValue) => {
        setTimeRange(newValue);
    }

    const handleReset = () => {
        setTimeRange(initialRange);
    }

    return (
        <div>
            <Slider
                value={timeRange}
                onChange={handleChange}
                valueLabelDisplay="auto"
                min={minDate}
                max={maxDate}
                step={1}
            />
            <button onClick={handleReset}>Reset</button>
        </div>
    );
}

export default TimeRangeAdjuster;

