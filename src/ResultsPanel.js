import { Table } from './Table';
import React from 'react';


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
                Header: 'Allotment',
                accessor: 'currentAllotment',
            },
            {
                Header: 'Average Propensity',
                accessor: (row) => row ? row.averagePropensity.toFixed(3) : 0,
            },
            {
                Header: 'Variance to Inherent',
                accessor: (row) => row ? row.varianceToInherent.toFixed(3) : 0,
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
                accessor: (row) => row ? row.averagePropensity.toFixed(3) : 0,
            },
            {
                Header: 'Average Variance to Inherent',
                accessor: (row) => row ? row.averageVarianceToInherent.toFixed(3) : 0,
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