import React, { useEffect } from 'react';
import { Slider } from 'primereact/slider'; // Import Slider from primereact

// This is a TimeRangeAdjuster component 
// that will allow the user to adjust 
// the time range of the data displayed in the sigma graph.

// It will take in an edges array 
const TimeRangeAdjuster = ({ edges, minDate, maxDate }) => {
    const [timeRange, setTimeRange] = React.useState([minDate, maxDate]);
    const [initialRange, setInitialRange] = React.useState([minDate, maxDate]);

    useEffect(() => {
        setInitialRange([minDate, maxDate]);
        setTimeRange([minDate, maxDate]);
    }, [minDate, maxDate]);

    const handleChange = (e) => {
        setTimeRange(e.value);
    }

    const handleReset = () => {
        setTimeRange(initialRange);
    }

    return (
        <div>
            <Slider
                value={timeRange}
                onChange={handleChange}
                range
                min={minDate}
                max={maxDate}
                step={1}
                style={{ width: '100%' }}
            />
            <div>
                <span>{timeRange[0]}</span> - <span>{timeRange[1]}</span>
            </div>
            <button onClick={handleReset}>Reset</button>
        </div>
    );
}

export default TimeRangeAdjuster;