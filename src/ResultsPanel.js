import { Table } from './Table';
import React from 'react';

const PERCENT_FORMAT_PARAMS = {style: 'percent', maximumFractionDigits: 2};

function ResultsPanel(props) {

    const CA_RESULTS_TABLE_COLUMNS = React.useMemo(
        () => [
            {
                Header: 'CA',
                accessor: 'caName',
            },
            {
                Header: 'Portfolio',
                accessor: 'portfolio'
            },
            {
                Header: 'Location',
                accessor: 'location'
            },
            {
                Header: 'Total Allotment',
                accessor: 'totalAllotment',
            },
            {
                Header: 'Final Allotment',
                accessor: 'currentAllotment',
            },
            {
                Header: 'Average Propensity',
                accessor: (row) => row ? row.averagePropensity.toLocaleString(undefined, PERCENT_FORMAT_PARAMS) : 0,
            },
            {
                Header: 'Variance to Inherent',
                accessor: (row) => row ? row.varianceToInherent.toLocaleString(undefined, PERCENT_FORMAT_PARAMS) : 0,
            },
            {
                Header: 'Predicted Conversions',
                accessor: (row) => row ? row.predictedConversions.toFixed(2) : 0,
            },
        ],
        []
    )
    
    const OVERALL_RESULTS_TABLE_COLUMNS = React.useMemo(
        () => [
            {
                Header: 'Total Leads',
                accessor: 'totalLeads',
            },
            {
                Header: 'Average Propensity',
                accessor: (row) => row ? row.averagePropensity.toLocaleString(undefined, PERCENT_FORMAT_PARAMS) : 0,
            },
            {
                Header: 'Average Variance to Inherent',
                accessor: (row) => row ? row.averageVarianceToInherent.toLocaleString(undefined, PERCENT_FORMAT_PARAMS) : 0,
            },
            {
                Header: 'Predicted Conversions',
                accessor: (row) => row ? row.predictedConversions.toFixed(2) : 0,
            },
        ],
        []
    )


    return (
        <div>
            <h3>Aggregated Results</h3>
            <Table columns={OVERALL_RESULTS_TABLE_COLUMNS} data={props.aggregatedResults ? [props.aggregatedResults] : []}/>
            <h3>Individual CA Results</h3>
            <Table columns={CA_RESULTS_TABLE_COLUMNS} data={props.courseAdvisors ? props.courseAdvisors : []}/>
        </div>
    );
}


export default ResultsPanel;