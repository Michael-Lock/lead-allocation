import LocalFileReader from './LocalFileReader';
import { CSVDownloader } from 'react-papaparse'
import ConfigPanel from './ConfigPanel';
import React, {useState} from 'react';
import moment from 'moment';

import {ALLOCATION_MODES} from './AllocationUtils';
import ResultsPanel from './ResultsPanel';

function LeadAllocationHome() {
    const [leadData, setLeadData] = useState();
    const [courseAdvisors, setCourseAdvisors] = useState();
    const [selectedMode, setSelectedMode] = useState();
    const [aggregatedResults, setAggregatedResults] = useState();
    const [inputParameters, setInputParameters] = useState();
    const [exportData, setExportData] = useState();

    const DATE_FORMAT = "YYYY-MM-DDTHH:MMZ";


    let handleCaDataLoad = (e) => {
        let newCourseAdvisors = [];

        for (let rowNum = 0; rowNum < e.length; rowNum++) {
            let row = e[rowNum].data;
            let newCa = {
                id: row.id,
                caName: row.name,
                portfolio: row.portfolio,
                location: row.location,
                decayModifier: row.decayModifier,
                totalAllotment: 0,
                currentAllotment: 0,
                cumulativePropensity: 0,
                cumulativeInherent: 0,
                averagePropensity: 0,
                varianceToInherent: 0,
                predictedConversions: 0,
            }
            newCourseAdvisors[rowNum] = newCa;
        }

        setCourseAdvisors(newCourseAdvisors);
    }   

    let handleLeadDataLoad = (e) => {
        let leads = [];
        for (let rowNum = 0; rowNum < e.length; rowNum++) {
            let row = e[rowNum].data;
            let newLead = {
                leadId: row.leadId,
                created: moment(row.created, DATE_FORMAT),
                inherent: row.inherent,
                portfolio: row.portfolio,
            };

            newLead.courseAdvisors = [];
            let caNames = [];
            for (let caNum = 0; caNum < courseAdvisors.length; caNum++) {
                caNames[caNum] = courseAdvisors[caNum].caName;
            }
            let caNum = 0;
            for (let fieldNum = 0; fieldNum < e[rowNum].meta.fields.length; fieldNum++) {
                if (caNames.some(v => v === e[rowNum].meta.fields[fieldNum])) {
                    let newCa = {
                        id: caNum++,
                        caName: e[rowNum].meta.fields[fieldNum],
                        propensity: row[e[rowNum].meta.fields[fieldNum]],
                    }
                    newLead.courseAdvisors.push(newCa);                    
                }
            }
            leads[rowNum] = newLead;
        }
        setLeadData(leads);
    } 

    let handleFileRemove = () => {
        setLeadData();
        setCourseAdvisors();
        setAggregatedResults();
        setInputParameters();
        setExportData();
    }

    let handleModeChange = (selectedMode) => {
        setInputParameters();
        setSelectedMode(ALLOCATION_MODES[selectedMode]);
    }

    let handleParameterChange = (e, parameterOrder) => {
        let updatedInputParameters = inputParameters ? inputParameters.slice() : [];
        if (e.target.value) {
            updatedInputParameters[parameterOrder] = e.target.value;
        } 
        else {
            updatedInputParameters.splice(parameterOrder);
        }

        setInputParameters(updatedInputParameters);
    }

    let runSimulation = () => {
        const result = generateResults(selectedMode.allocationFunction(leadData, courseAdvisors, inputParameters));

        setLeadData(result.leads);
        setCourseAdvisors(result.courseAdvisors);
        setAggregatedResults(result.aggregatedResults);
        setExportData(result.exportData);
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

        let aggregatedResults = {
            totalLeads: 0,
            cumulativePropensity: 0,
            cumulativeInherent: 0,
            averagePropensity: 0,
            averageVarianceToInherent: 0,
            predictedConversions: 0,
        }
        for (let caNum = 0; caNum < updatedCourseAdvisors.length; caNum++) {
            let advisor = updatedCourseAdvisors[caNum];
            advisor.averagePropensity = advisor.totalAllotment ? advisor.cumulativePropensity / advisor.totalAllotment : 0;
            advisor.varianceToInherent = advisor.cumulativePropensity - advisor.cumulativeInherent;
            advisor.predictedConversions = advisor.totalAllotment * advisor.averagePropensity;

            aggregatedResults.totalLeads += advisor.totalAllotment;
            aggregatedResults.cumulativePropensity += advisor.cumulativePropensity;
            aggregatedResults.cumulativeInherent += advisor.cumulativeInherent;
            aggregatedResults.predictedConversions += advisor.predictedConversions;
        }
        aggregatedResults.averagePropensity = aggregatedResults.cumulativePropensity / aggregatedResults.totalLeads;
        aggregatedResults.averageVarianceToInherent = (aggregatedResults.cumulativePropensity - aggregatedResults.cumulativeInherent) / updatedCourseAdvisors.length;

        let updatedResult = {...result};
        updatedResult.courseAdvisors = updatedCourseAdvisors;
        updatedResult.aggregatedResults = aggregatedResults;

        updatedResult = generateExportData(updatedResult);

        return updatedResult;
    }


    let generateExportData = (result) => {
        let adjustedLeads = leadData.slice().map((lead) => {
            let newLead = {...lead};
            newLead.created = newLead.created.format(DATE_FORMAT);
            newLead.allocatedCa = courseAdvisors[newLead.allocatedCa].caName;
            delete newLead.courseAdvisors;

            return newLead;
        });

        let updatedResult = {...result};
        updatedResult.exportData = adjustedLeads;

        return updatedResult;
    }


    let getExportFilename = () => {
        let filename = "invalid-nodata"
        if (aggregatedResults && selectedMode) {
            filename = Object.keys(ALLOCATION_MODES)[selectedMode.id] + "-" + moment().format("YYYYMMDD-HHMM-ss")
        }
        return filename;
    }



    return (
        <div className="App">
            <header className="App-header">
                <h3>CA File</h3>
                <LocalFileReader
                // CA Data
                    onFileLoad={(e) => handleCaDataLoad(e)}
                    onFileRemove={() => handleFileRemove()}
                />
                <h3>Lead File</h3>
                <LocalFileReader
                // Lead Data
                    onFileLoad={(e) => handleLeadDataLoad(e)}
                    onFileRemove={() => handleFileRemove()}
                    disabled={!(courseAdvisors && courseAdvisors.length > 0)}
                />
                <ConfigPanel
                    selectedMode={selectedMode}
                    onModeChange={(e) => handleModeChange(e)}
                    onParameterChange={(e, parameter) => handleParameterChange(e, parameter)}
                />
                <button
                    onClick={() => runSimulation()}
                    disabled={!leadData || !selectedMode || 
                        (selectedMode.parameters && (!inputParameters || inputParameters.length < Object.keys(selectedMode.parameters).length))}
                >
                    Run Simulation
                </button>
                <CSVDownloader
                    data={exportData}
                    type={"button"}
                    filename={getExportFilename()}
                    bom={false}
                >
                    Export Results
                </CSVDownloader>
                <ResultsPanel
                    courseAdvisors={courseAdvisors}
                    aggregatedResults={aggregatedResults}
                />
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