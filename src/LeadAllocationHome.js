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
    const [leadExportData, setLeadExportData] = useState();
    const [resultSummaryExportData, setResultSummaryExportData] = useState();

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
                allotmentLimit: row.allotmentLimit ? row.allotmentLimit : 0,
                overallPropensity: row.overallPropensity ? row.overallPropensity : 0,
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
                salesforceId: row.Id,
                created: moment(row.created, DATE_FORMAT),
                cluster: row.cluster,
                inherent: row.inherent,
                portfolio: row.portfolio,
            };

            newLead.courseAdvisors = [];
            let caNum = 0;
            for (let fieldNum = 0; fieldNum < e[rowNum].meta.fields.length; fieldNum++) {
                if (courseAdvisors.some(v => v.caName === e[rowNum].meta.fields[fieldNum])) {
                    let newCa = {
                        id: caNum,
                        caName: e[rowNum].meta.fields[fieldNum],
                        propensity: courseAdvisors[caNum].overallPropensity ? courseAdvisors[caNum].overallPropensity : row[e[rowNum].meta.fields[fieldNum]],
                        assessedPropensity: row[e[rowNum].meta.fields[fieldNum]],
                    }
                    newLead.courseAdvisors.push(newCa);
                    caNum++;
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
        setLeadExportData();
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
        setLeadExportData(result.leadExportData);
        setResultSummaryExportData(result.resultSummaryExportData);
    }

    let generateResults = (result) =>  {
        let updatedCourseAdvisors = result.courseAdvisors.slice();
        for (let leadNum = 0; leadNum < result.leads.length; leadNum++) {
            let lead = result.leads[leadNum];
            let allocatedCa = updatedCourseAdvisors[lead.allocatedCa];
            let selectedPropensity = lead.courseAdvisors[allocatedCa.id].assessedPropensity;
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
            advisor.varianceToInherent = advisor.cumulativeInherent ? (advisor.cumulativePropensity / advisor.cumulativeInherent) - 1 : 0;
            advisor.predictedConversions = advisor.totalAllotment * advisor.averagePropensity;

            aggregatedResults.totalLeads += advisor.totalAllotment;
            aggregatedResults.cumulativePropensity += advisor.cumulativePropensity;
            aggregatedResults.cumulativeInherent += advisor.cumulativeInherent;
            aggregatedResults.predictedConversions += advisor.predictedConversions;
        }
        aggregatedResults.averagePropensity = aggregatedResults.cumulativePropensity / aggregatedResults.totalLeads;
        aggregatedResults.averageVarianceToInherent = (aggregatedResults.cumulativePropensity / aggregatedResults.cumulativeInherent) - 1;

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
        updatedResult.leadExportData = adjustedLeads;

        let resultSummary = courseAdvisors.slice().map((advisor) => {
            return {
                name: advisor.caName,
                id: advisor.id,
                portfolio: advisor.portfolio,
                location: advisor.location,
                totalAllotment: advisor.totalAllotment,
                finalAllotment: advisor.currentAllotment,
                averagePropensity: advisor.averagePropensity,
                varianceToInherent: advisor.varianceToInherent,
                predictedConversions: advisor.predictedConversions,
                unmodelledPropensityUsed: advisor.overallPropensity ? advisor.overallPropensity : "-",
            }
        });

        resultSummary.push({
            name: "Total",
            totalAllotment: result.aggregatedResults.totalLeads,
            averagePropensity: result.aggregatedResults.averagePropensity,
            varianceToInherent: result.aggregatedResults.averageVarianceToInherent,
            predictedConversions: result.aggregatedResults.predictedConversions,
        });

        updatedResult.resultSummaryExportData = resultSummary;

        return updatedResult;
    }


    let getExportFilename = (type) => {
        let filename = "invalid-nodata"
        if (aggregatedResults && selectedMode) {
            filename = Object.keys(ALLOCATION_MODES)[selectedMode.id] + "-" + type + "-" + moment().format("YYYYMMDD-HHMMss")
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
                    data={leadExportData}
                    type={"button"}
                    filename={getExportFilename("LeadAllocation")}
                    bom={false}
                >
                    Export Lead Allocations
                </CSVDownloader>
                <CSVDownloader
                    data={resultSummaryExportData}
                    type={"button"}
                    filename={getExportFilename("ResultSummary")}
                    bom={false}
                >
                    Export Result Summary
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