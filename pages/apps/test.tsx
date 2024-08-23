import dynamic from 'next/dynamic';
import React, { useState, useEffect } from 'react';

const ReactApexChart = dynamic(() => import('react-apexcharts'), {
    ssr: false,
});

function Test() {
    const tableRow = [
        {
            "country": "India",
            "value1": "0",
            "value2": "0",
            "value3": "7",
            "value4": "12",
            "value5": "3",
            "value6": "1",
            "value7": "0",
            "value8": "0"
        }
    ];

    const tableColumns = [
        { "accessor": "country", "title": "Countries" },
        { "accessor": "value1", "title": "2024-08" },
        { "accessor": "value2", "title": "2024-07" },
        { "accessor": "value3", "title": "2024-06" },
        { "accessor": "value4", "title": "2024-05" },
        { "accessor": "value5", "title": "2024-04" },
        { "accessor": "value6", "title": "2024-03" },
        { "accessor": "value7", "title": "2024-02" },
        { "accessor": "value8", "title": "2024-01" }
    ];

    // Extract categories from column titles (excluding the 'Countries' column)
    const categories = tableColumns.filter(col => col.accessor !== 'country').map(col => col.title);

    // Generate series data from table row
    const seriesData = tableRow.map(row => ({
        name: row.country,
        data: categories.map((_, index) => parseFloat(row[`value${index + 1}`]) || 0)
    }));

    // State for chart data
    const [chartData, setChartData] = useState({
        series: seriesData,
        options: {
            chart: {
                type: 'bar',
                height: 350,
            },
            colors: ['#0000FF'], // You can generate colors dynamically if you have more countries or series
            plotOptions: {
                bar: {
                    horizontal: false,
                    endingShape: 'rounded',
                },
            },
            dataLabels: {
                enabled: false,
            },
            stroke: {
                show: true,
                width: 2,
                colors: ['transparent'],
            },
            xaxis: {
                categories: categories,
                title: {
                    text: 'Dates',
                },
                labels: {
                    rotate: -45,
                    trim: true
                }
            },
            yaxis: {
                title: {
                    text: 'Values',
                },
                min: 0
            },
            title: {
                text: 'Values Over Time',
            },
            tooltip: {
                shared: true,
                intersect: false,
            },
        }
    });

    return (
        <div className="panel overflow-hidden">
            <div className="mb-5 flex items-center justify-between">
                <h5 className="text-lg font-semibold dark:text-white-light">Values Over Time</h5>
            </div>
            <div className="mb-5 overflow-scroll">
                <ReactApexChart
                    series={chartData.series}
                    options={chartData.options}
                    className="rounded-lg bg-white dark:bg-black"
                    type="bar"
                    height={500}
                    width={'100%'}
                />
            </div>
        </div>
    );
}

export default Test;
