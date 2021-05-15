import LocalFileReader from './LocalFileReader';
import ConfigPanel from './ConfigPanel';
import React, {useState} from 'react';

import {ALLOCATION_MODES} from './AllocationUtils';
import { Table } from './Table';

function LeadAllocationHome() {
    const [leadData, setLeadData] = useState();
    const [courseAdvisors, setCourseAdvisors] = useState();
    const [selectedMode, setSelectedMode] = useState();

    const resultsTableColumns = React.useMemo(
        () => [
            {
                Header: 'CA',
                accessor: 'caName',
            },
            {
                Header: 'Allotment',
                accessor: 'currentAllotment',
            },
            {
                Header: 'Average Propensity',
                accessor: (row) => row ? row.averagePropensity.toFixed(2) : 0,
            },
            {
                Header: 'Variance to Inherent',
                accessor: (row) => row ? row.varianceToInherent.toFixed(2) : 0,
            },
            {
                Header: 'Predicted Conversions',
                accessor: (row) => row ? row.predictedConversions.toFixed(2) : 0,
            },
        ],
        []
    )

    const NON_CA_FIELDS = ["leadId", "created", "inherent", "portfolio"];
    let handleDataLoad = (e) => {
        let leads = [];
        for (let rowNum = 0; rowNum < e.length; rowNum++) {
            let row = e[rowNum].data;
            let newLead = {
                leadId: row.leadId,
                created: row.created,
                inherent: row.inherent,
                portfolio: row.portfolio,
            };
            newLead.courseAdvisors = [];
            let caNum = 0;
            for (let fieldNum = 0; fieldNum < e[rowNum].meta.fields.length; fieldNum++) {
                if (NON_CA_FIELDS.some(v => v === e[rowNum].meta.fields[fieldNum])) {
                    continue;
                }
                let newCa = {
                    id: caNum++,
                    caName: e[rowNum].meta.fields[fieldNum],
                    propensity: row[e[rowNum].meta.fields[fieldNum]],
                }
                newLead.courseAdvisors.push(newCa);
            }
            leads[rowNum] = newLead;
        }
        setLeadData(leads);

        let newCourseAdvisors = [];
        if (leads.length > 0) {
            let leadCourseAdvisors = leads[0].courseAdvisors;
            for (let i = 0; i < leadCourseAdvisors.length; i++) {
                newCourseAdvisors[i] = {
                    id: i,
                    caName: leadCourseAdvisors[i].caName,
                    currentAllotment: 0,
                    cumulativePropensity: 0,
                    cumulativeInherent: 0,
                    averagePropensity: 0,
                    varianceToInherent: 0,
                    predictedConversions: 0,
                }
            }
        }
        setCourseAdvisors(newCourseAdvisors);
    }

    let handleFileRemove = () => {
        setLeadData(null);
        setCourseAdvisors(null);
    }

    let handleModeChange = (selectedMode) => {
        setSelectedMode(ALLOCATION_MODES[selectedMode]);
    }

    let generateResults = (result) =>  {
        let updatedCourseAdvisors = result.courseAdvisors.slice();
        for (let leadNum = 0; leadNum < result.leads.length; leadNum++) {
            let lead = result.leads[leadNum];
            let allocatedCa = updatedCourseAdvisors[lead.allocatedCa];
            let selectedPropensity = lead.courseAdvisors[allocatedCa.id].propensity;
            allocatedCa.cumulativePropensity = allocatedCa.cumulativePropensity + selectedPropensity;
            allocatedCa.cumulativeInherent = allocatedCa.cumulativeInherent + lead.inherent;
        }

        for (let caNum = 0; caNum < updatedCourseAdvisors.length; caNum++) {
            let advisor = updatedCourseAdvisors[caNum];
            advisor.averagePropensity = advisor.cumulativePropensity / advisor.currentAllotment;
            advisor.varianceToInherent = advisor.cumulativePropensity - advisor.cumulativeInherent;
            advisor.predictedConversions = advisor.currentAllotment * advisor.averagePropensity;
        }

        let updatedResult = {...result};
        updatedResult.courseAdvisors = updatedCourseAdvisors;
        return updatedResult;
    }

    let runSimulation = () => {
        const result = generateResults(selectedMode.allocationFunction(leadData, courseAdvisors));

        setLeadData(result.leads);
        setCourseAdvisors(result.courseAdvisors);
    }

    return (
        <div className="App">
            <header className="App-header">
                <p>
                    Lead Allocation Simulator
                </p>
                <LocalFileReader
                    onFileLoad={(e) => handleDataLoad(e)}
                    onFileRemove={() => handleFileRemove()}
                />
                <ConfigPanel
                    selectedMode={selectedMode}
                    onModeChange={(e) => handleModeChange(e)}
                />
                <button
                    onClick={() => runSimulation()}
                    disabled={!leadData || !selectedMode}
                >
                    Run Simulation
                </button>
            <Table columns={resultsTableColumns} data={courseAdvisors ? courseAdvisors : []}/>

            </header>
        </div>
    );
}



export default LeadAllocationHome;



/*
Allocation Mode: manual, round robin, linear weighted, polynomial weighted, optimised round robin (leeway of n)
Input data (csv load)
Randomise order
Auto-allocate

Summaries: overall result score (raw conversions, variance to inherent)

Individual leads (allocated CA [freeze], inherent, per CA propensity)

*/



/*

[
    {
        leadID: 1,
        createTime: 2021-1-1 11:03,
        inherent: 0.18
    }

]


*/