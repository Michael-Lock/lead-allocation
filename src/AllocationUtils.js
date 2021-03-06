

export const ALLOCATION_MODES = {
    RoundRobin: {
        id: 0,
        name: "Round Robin",
        description: "Allocates leads one by one to each available CA",
        allocationFunction: allocateRoundRobin,
    },
    RoundRobinUnconstrained: {
        id: 1,
        name: "Round Robin (Unconstrained)",
        description: "Allocates leads one by one to each CA, irrespective of portfolio or working hours",
        allocationFunction: allocateRoundRobinUnconstrained,
    },
    MostSuitableUnconstrained: {
        id: 2,
        name: "Most Suitable (Unconstrained)",
        description: "Allocates leads always to the CA with the highest likelihood of conversion. Ignores portfolio and working hours constraints",
        allocationFunction: allocateMostSuitableUnconstrained,
    },
    MostSuitableAggressive: {
        id: 3,
        name: "Most Suitable (Aggressive)",
        description: "Allocates leads always to the CA with the highest likelihood of conversion. Uses lowest current allotment as a tiebreaker",
        allocationFunction: allocateMostSuitableAggressive,
    },
    MostSuitableFixedAllotmentTolerance: {
        id: 4,
        name: "Most Suitable (Fixed allotment tolerance)",
        description: "Allocates leads to the CA with the highest likelihood of conversion, so long as their allotment is not a " + 
            "given number of leads more than any other CA currently available. If all available CAs are outside of this tolerance, " +
            "picks the one with the fewest leads currently allotted",
        parameters: {
            allotmentTolerance: {
                order: 0,
                label: "Allotment Tolerance",
            },
            decayPerDay: {
                order: 1,
                label: "Lead decay per day",
            },
            cycleDecayDurationDays: {
                order: 2,
                label: "Days per sales cycle",
            },
            decayPerCycle: {
                order: 3,
                label: "Lead decay per sales cycle (%)",
            },
        },
        allocationFunction: allocateMostSuitableFixedAllotmentLimit,
    },
    MostSuitableAdvisorAllotmentTolerance: {
        id: 5,
        name: "Most Suitable (Per-CA allotment tolerance)",
        description: "Allocates leads to the CA with the highest likelihood of conversion, so long as their allotment is not a " + 
            "given number of leads more than any other CA currently available. If all available CAs are outside of this tolerance, " +
            "picks the one with the fewest leads currently allotted",
        parameters: {
            decayPerDay: {
                order: 0,
                label: "Lead decay per day",
            },
            cycleDecayDurationDays: {
                order: 1,
                label: "Days per sales cycle",
            },
            decayPerCycle: {
                order: 2,
                label: "Lead decay per sales cycle (%)",
            },
        },
        allocationFunction: allocateMostSuitableAdvisorAllotmentLimit,
    },
    MostSuitableProportionalAllotmentTolerance: {
        id: 6,
        name: "Most Suitable (Proportional allotment tolerance)",
        description: "Allocates leads to the CA with the highest likelihood of conversion, so long as their allotment is not a " + 
            "number of leads more than any other CA currently available by a given percentage. If all available CAs are outside of this tolerance, " +
            "picks the one with the fewest leads currently allotted",
        parameters: {
            allotmentTolerance: {
                order: 0,
                label: "Allotment Tolerance (%)",
            },
            decayPerDay: {
                order: 1,
                label: "Lead decay per day",
            },
            cycleDecayDurationDays: {
                order: 2,
                label: "Days per sales cycle",
            },
            decayPerCycle: {
                order: 3,
                label: "Lead decay per sales cycle (%)",
            },
        },
        allocationFunction: allocateMostSuitableProportionalAllotmentLimit,
    },
    PropensityAllotmentBalancedLinear: {
        id: 7,
        name: "Propensity vs. Allotment Balance (Linear)",
        description: "Allocates leads to the CA based on both their propensity and their current allotment. " +
        "Higher propensity will increase the preference given to the CA but a higher allotment will decrease it. " + 
        "Weightings are used to control the relative importance of choosing most suitable vs. balancing allotment",
        parameters: {
            propensityWeighting: {
                order: 0,
                label: "Propensity weighting",
            },
            allotmentWeighting: {
                order: 1,
                label: "Allotment weighting",
            },
            decayPerDay: {
                order: 2,
                label: "Lead decay per day",
            },
            cycleDecayDurationDays: {
                order: 3,
                label: "Days per sales cycle",
            },
            decayPerCycle: {
                order: 4,
                label: "Lead decay per sales cycle (%)",
            },
        },
        allocationFunction: allocatePropensityAllotmentBalancedLinear,
    },
    PropensityAllotmentBalancedProportional: {
        id: 8,
        name: "Propensity vs. Allotment Balance (Proportional)",
        description: "Allocates leads to the CA based on both their propensity and their current allotment. " +
        "Higher propensity proportionally relative to the average will increase the preference given to the CA but a higher allotment will decrease it. " + 
        "Weightings are used to control the relative importance of choosing most suitable vs. balancing allotment",
        parameters: {
            propensityWeighting: {
                order: 0,
                label: "Propensity weighting",
            },
            allotmentWeighting: {
                order: 1,
                label: "Allotment weighting",
            },
            decayPerDay: {
                order: 2,
                label: "Lead decay per day",
            },
            cycleDecayDurationDays: {
                order: 3,
                label: "Days per sales cycle",
            },
            decayPerCycle: {
                order: 4,
                label: "Lead decay per sales cycle (%)",
            },
        },
        allocationFunction: allocatePropensityAllotmentBalancedProportional,
    },
    PropensityAllotmentBalancedProportionalPerCluster: {
        id: 9,
        name: "Propensity vs. Allotment Balance (Proportional per Cluster)",
        description: "Allocates leads to the CA based on both their propensity and their current allotment. " +
        "Higher propensity proportionally relative to the average will increase the preference given to the CA but a higher allotment of leads from the same cluster will decrease it. " + 
        "Weightings are used to control the relative importance of choosing most suitable vs. balancing allotment",
        parameters: {
            propensityWeighting: {
                order: 0,
                label: "Propensity weighting",
            },
            allotmentWeighting: {
                order: 1,
                label: "Allotment weighting",
            },
            // decayPerDay: {
            //     order: 2,
            //     label: "Lead decay per day",
            // },
            // cycleDecayDurationDays: {
            //     order: 3,
            //     label: "Days per sales cycle",
            // },
            // decayPerCycle: {
            //     order: 4,
            //     label: "Lead decay per sales cycle (%)",
            // },
        },
        allocationFunction: allocatePropensityAllotmentBalancedProportionalPerCluster,
    },
    PropensityAllotmentDifficultyBalancedProportional: {
        id: 10,
        name: "Propensity vs. Allotment vs. Difficulty Balance (Proportional)",
        description: "Allocates leads to the CA based on their propensity, their current allotment, and the proportion of 'difficult' leads they are getting. " +
        "Higher propensity proportionally relative to the average will increase the preference given to the CA but a higher allotment will decrease it. " +
        "If the CA has been receiving a higher number of leads that inherently convert at a low likelihood, they will be increasingly preferred to get higher likelihood leads" + 
        "Weightings are used to control the relative importance of choosing most suitable vs. balancing allotment",
        parameters: {
            propensityWeighting: {
                order: 0,
                label: "Propensity weighting",
            },
            allotmentWeighting: {
                order: 1,
                label: "Allotment weighting",
            },
            difficultyWeighting: {
                order: 2,
                label: "Difficulty weighting",
            },
            decayPerDay: {
                order: 3,
                label: "Lead decay per day",
            },
            cycleDecayDurationDays: {
                order: 4,
                label: "Days per sales cycle",
            },
            decayPerCycle: {
                order: 5,
                label: "Lead decay per sales cycle (%)",
            },
        },
        allocationFunction: allocatePropensityAllotmentDifficultyBalancedProportional,
    },
}

const PORTFOLIOS = {
    Domestic: "Domestic",
    Canada: "Canada",
}

const TIMEZONES = {
    Adelaide: {
        startHour: 9,
        endHour: 17,
        timezoneOffsetFromAdelaide: 0,
    },
    Canada: {
        startHour: 22.5,
        endHour: 6.5,
        timezoneOffsetFromAdelaide: 13.5,
    }
}


function allocateRoundRobin(leads, courseAdvisors) {
    let updatedLeads = leads.slice();
    let updatedCourseAdvisors = courseAdvisors.map((advisor) => {
        let newAdvisor = {...advisor};
        newAdvisor.lastAllocatedId = -1;
        return newAdvisor;
    });

    let domesticAdvisors = updatedCourseAdvisors.filter((advisor) => (
        (advisor.portfolio === PORTFOLIOS.Domestic)
    ));
    let canadaAdvisors = updatedCourseAdvisors.filter((advisor) => (
        (advisor.portfolio === PORTFOLIOS.Canada)
    ));

    for (let leadIndex = 0; leadIndex < leads.length; leadIndex++) {
        let lead = updatedLeads[leadIndex];
        let sortedAdvisors;
        if (lead.portfolio === PORTFOLIOS.Domestic) {
            sortedAdvisors = domesticAdvisors.sort((a,b) => a.lastAllocatedId - b.lastAllocatedId);
        }
        else if (lead.portfolio === PORTFOLIOS.Canada) {
            sortedAdvisors = canadaAdvisors.sort((a,b) => a.lastAllocatedId - b.lastAllocatedId);
        }

        let filteredAdvisors = sortedAdvisors.filter((advisor) => isInWorkingHours(lead.created, advisor.location));
        let selectedAdvisor = filteredAdvisors.length > 0 ? filteredAdvisors[0] : sortedAdvisors[0];

        selectedAdvisor.lastAllocatedId = lead.leadId;
        allocateLead(lead, selectedAdvisor, updatedCourseAdvisors);
    }

    const returnObj = {
        leads: updatedLeads,
        courseAdvisors: updatedCourseAdvisors,
    }
    return returnObj;
}


function allocateRoundRobinUnconstrained(leads, courseAdvisors) {
    let updatedLeads = leads.slice();
    let updatedCourseAdvisors = courseAdvisors.map((advisor) => {
        let newAdvisor = {...advisor};
        newAdvisor.lastAllocatedId = -1;
        return newAdvisor;
    });

    for (let leadIndex = 0; leadIndex < leads.length; leadIndex++) {
        let lead = updatedLeads[leadIndex];
        let sortedAdvisors = updatedCourseAdvisors.slice().sort((a,b) => a.lastAllocatedId - b.lastAllocatedId);;

        let selectedAdvisor = sortedAdvisors[0];

        selectedAdvisor.lastAllocatedId = lead.leadId;
        allocateLead(lead, selectedAdvisor, updatedCourseAdvisors);
    }

    const returnObj = {
        leads: updatedLeads,
        courseAdvisors: updatedCourseAdvisors,
    }
    return returnObj;
}


function allocateMostSuitableUnconstrained(leads, courseAdvisors) {
    let updatedLeads = leads.slice();
    let updatedCourseAdvisors = courseAdvisors.slice();

    for (let i = 0; i < leads.length; i++) {
        let lead = updatedLeads[i];        
        let validAdvisors = updatedCourseAdvisors.slice();

        for (let caNum = 0; caNum < validAdvisors.length; caNum++) {
            let advisor = validAdvisors[caNum];
            validAdvisors[caNum] = {
                ...advisor, 
                propensity: lead.courseAdvisors[advisor.id].propensity,
            }
        }

        validAdvisors.sort((a,b) => {
            //only care about propensity. As this is an unrealistic simulation, tiebreakers are pointless
            return b.propensity - a.propensity;
        });

        let selectedAdvisor = validAdvisors[0];
        allocateLead(lead, selectedAdvisor, updatedCourseAdvisors);
    }
    
    const returnObj = {
        leads: updatedLeads,
        courseAdvisors: updatedCourseAdvisors,
    }
    return returnObj;
}


function allocateMostSuitableAggressive(leads, courseAdvisors) {
    let updatedLeads = leads.slice();
    let updatedCourseAdvisors = courseAdvisors.slice();

    for (let i = 0; i < leads.length; i++) {
        let lead = updatedLeads[i];        
        let validAdvisors = updatedCourseAdvisors.filter((advisor) => (isMatchingPortfolio(advisor, lead)));

        for (let caNum = 0; caNum < validAdvisors.length; caNum++) {
            let advisor = validAdvisors[caNum];
            let caIsInWorkingHours = isInWorkingHours(lead.created, updatedCourseAdvisors[advisor.id].location);
            validAdvisors[caNum] = {
                ...advisor, 
                propensity: lead.courseAdvisors[advisor.id].propensity,
                isInWorkingHours: caIsInWorkingHours,
            }
        }

        validAdvisors.sort((a,b) => {
            //give firm precedence to those who are currently working
            if (b.isInWorkingHours && !a.isInWorkingHours) {
                return 1;
            }
            if (a.isInWorkingHours && !b.isInWorkingHours) {
                return -1;
            }
            //otherwise pick the most suitable CA based on propensity
            if (b.propensity !== a.propensity) {
                return b.propensity - a.propensity;
            }
            //use allotment numbers as a tiebreaker
            return a.totalAllotment - b.totalAllotment;
        });

        let selectedAdvisor = validAdvisors[0];
        allocateLead(lead, selectedAdvisor, updatedCourseAdvisors);
    }
    
    const returnObj = {
        leads: updatedLeads,
        courseAdvisors: updatedCourseAdvisors,
    }
    return returnObj;
}


function allocateMostSuitableFixedAllotmentLimit(leads, courseAdvisors, parameters) {
    return allocateMostSuitableWithAllotmentLimit(leads, courseAdvisors, parameters, false);
}


function allocateMostSuitableProportionalAllotmentLimit(leads, courseAdvisors, parameters) {
    return allocateMostSuitableWithAllotmentLimit(leads, courseAdvisors, parameters, true);
}


function allocateMostSuitableWithAllotmentLimit(leads, courseAdvisors, parameters, isPercentage) {
    let updatedLeads = leads.slice();
    let updatedCourseAdvisors = courseAdvisors.slice();

    //HACK: possibly not safe as this assumes that the parameters for both methods are in the same order
    let tolerance = Number(parameters[ALLOCATION_MODES.MostSuitableFixedAllotmentTolerance.parameters.allotmentTolerance.order]);
    if (isPercentage) {
        tolerance = tolerance / 100;
    }
    const decayPerDay = Number(parameters[ALLOCATION_MODES.MostSuitableFixedAllotmentTolerance.parameters.decayPerDay.order]);
    const cycleDecayDurationDays = Number(parameters[ALLOCATION_MODES.MostSuitableFixedAllotmentTolerance.parameters.cycleDecayDurationDays.order]);
    const decayPerCycle = Number(parameters[ALLOCATION_MODES.MostSuitableFixedAllotmentTolerance.parameters.decayPerCycle.order]) / 100;
    const simulationStartDate = leads[0].created.clone().startOf('date');

    let lastDailyDecayDate = simulationStartDate.clone();
    let lastCycleDecayDate = simulationStartDate.clone();

    for (let i = 0; i < leads.length; i++) {
        let lead = updatedLeads[i];
        let lowestAllotment = Number.MAX_SAFE_INTEGER;
        let currentDate = leads[i].created.clone().startOf('date');

        lastDailyDecayDate = applyDecay(updatedCourseAdvisors, currentDate, lastCycleDecayDate, lastDailyDecayDate, cycleDecayDurationDays, decayPerCycle, decayPerDay);
        
        let validAdvisors = updatedCourseAdvisors.filter((advisor) => (isMatchingPortfolio(advisor, lead)));

        for (let caNum = 0; caNum < validAdvisors.length; caNum++) {
            let advisor = validAdvisors[caNum];
            lowestAllotment = Math.min(advisor.currentAllotment, lowestAllotment);
            
            let caIsInWorkingHours = isInWorkingHours(lead.created, updatedCourseAdvisors[advisor.id].location);
            validAdvisors[caNum] = {
                ...advisor, 
                propensity: lead.courseAdvisors[advisor.id].propensity,
                isInWorkingHours: caIsInWorkingHours,
            }
        }

        let allotmentCap;
        if (isPercentage) {  
            allotmentCap = lowestAllotment + lowestAllotment * tolerance 
        }
        else {
            allotmentCap = lowestAllotment + tolerance;
        }

        validAdvisors.sort((a,b) => {
            //give firm precedence to those who are currently working
            if (b.isInWorkingHours && !a.isInWorkingHours) {
                return 1;
            }
            if (a.isInWorkingHours && !b.isInWorkingHours) {
                return -1;
            }
            //then firm prededence to those within the tolerance range for allotment
            if (b.currentAllotment < allotmentCap && a.currentAllotment >= allotmentCap) {
                return 1;
            }
            if (a.currentAllotment < allotmentCap && b.currentAllotment >= allotmentCap) {
                return -1;
            }
            //picking the person least outside tolerance if both are
            if (a.currentAllotment >= allotmentCap && b.currentAllotment >= allotmentCap && b.currentAllotment !== a.currentAllotment) {
                return a.currentAllotment - b.currentAllotment;
            }
            //otherwise picking the most suitable CA based on propensity
            if (b.propensity !== a.propensity) {
                return b.propensity - a.propensity;
            }
            //use allotment numbers as a tiebreaker
            return a.currentAllotment - b.currentAllotment;
        });

        let selectedAdvisor = validAdvisors[0];
        allocateLead(lead, selectedAdvisor, updatedCourseAdvisors);
    }

    const returnObj = {
        leads: updatedLeads,
        courseAdvisors: updatedCourseAdvisors,
    }
    return returnObj;
}


function allocateMostSuitableAdvisorAllotmentLimit(leads, courseAdvisors, parameters, isPercentage) {
    let updatedLeads = leads.slice();
    let updatedCourseAdvisors = courseAdvisors.slice();

    const decayPerDay = Number(parameters[ALLOCATION_MODES.MostSuitableAdvisorAllotmentTolerance.parameters.decayPerDay.order]);
    const cycleDecayDurationDays = Number(parameters[ALLOCATION_MODES.MostSuitableAdvisorAllotmentTolerance.parameters.cycleDecayDurationDays.order]);
    const decayPerCycle = Number(parameters[ALLOCATION_MODES.MostSuitableAdvisorAllotmentTolerance.parameters.decayPerCycle.order]) / 100;
    const simulationStartDate = leads[0].created.clone().startOf('date');

    let lastDailyDecayDate = simulationStartDate.clone();
    let lastCycleDecayDate = simulationStartDate.clone();

    for (let i = 0; i < leads.length; i++) {
        let lead = updatedLeads[i];
        let lowestAllotment = Number.MAX_SAFE_INTEGER;
        let currentDate = leads[i].created.clone().startOf('date');

        lastDailyDecayDate = applyDecay(updatedCourseAdvisors, currentDate, lastCycleDecayDate, lastDailyDecayDate, cycleDecayDurationDays, decayPerCycle, decayPerDay);
        
        let validAdvisors = updatedCourseAdvisors.filter((advisor) => (isMatchingPortfolio(advisor, lead)));

        for (let caNum = 0; caNum < validAdvisors.length; caNum++) {
            let advisor = validAdvisors[caNum];
            lowestAllotment = Math.min(advisor.currentAllotment, lowestAllotment);
            
            let caIsInWorkingHours = isInWorkingHours(lead.created, updatedCourseAdvisors[advisor.id].location);
            validAdvisors[caNum] = {
                ...advisor, 
                propensity: lead.courseAdvisors[advisor.id].propensity,
                isInWorkingHours: caIsInWorkingHours,
            }
        }

        validAdvisors.sort((a,b) => {
            //give firm precedence to those who are currently working
            if (b.isInWorkingHours && !a.isInWorkingHours) {
                return 1;
            }
            if (a.isInWorkingHours && !b.isInWorkingHours) {
                return -1;
            }
            let allotmentCapA = lowestAllotment + a.allotmentLimit;
            let allotmentCapB = lowestAllotment + b.allotmentLimit;
            let remainingAllotmentA = allotmentCapA - a.currentAllotment;
            let remainingAllotmentB = allotmentCapB - b.currentAllotment;
            //then firm prededence to those within the tolerance range for allotment
            if (b.currentAllotment < allotmentCapB && a.currentAllotment >= allotmentCapA) {
                return 1;
            }
            if (a.currentAllotment < allotmentCapA && b.currentAllotment >= allotmentCapB) {
                return -1;
            }
            //picking the person least outside tolerance if both are
            if (a.currentAllotment >= allotmentCapA && b.currentAllotment >= allotmentCapB && remainingAllotmentB !== remainingAllotmentA) {
                return remainingAllotmentB - remainingAllotmentA;
            }
            //otherwise picking the most suitable CA based on propensity
            if (b.propensity !== a.propensity) {
                return b.propensity - a.propensity;
            }
            //use allotment numbers as a tiebreaker
            return a.currentAllotment - b.currentAllotment;
        });

        let selectedAdvisor = validAdvisors[0];
        allocateLead(lead, selectedAdvisor, updatedCourseAdvisors);
    }

    const returnObj = {
        leads: updatedLeads,
        courseAdvisors: updatedCourseAdvisors,
    }
    return returnObj;
}


function allocatePropensityAllotmentBalancedLinear(leads, courseAdvisors, parameters) {
    let updatedLeads = leads.slice();
    let updatedCourseAdvisors = courseAdvisors.slice();

    const propensityWeighting = Number(parameters[ALLOCATION_MODES.PropensityAllotmentBalancedLinear.parameters.propensityWeighting.order]);
    const allotmentWeighting = Number(parameters[ALLOCATION_MODES.PropensityAllotmentBalancedLinear.parameters.allotmentWeighting.order]);
    const decayPerDay = Number(parameters[ALLOCATION_MODES.PropensityAllotmentBalancedLinear.parameters.decayPerDay.order]);
    const cycleDecayDurationDays = Number(parameters[ALLOCATION_MODES.PropensityAllotmentBalancedLinear.parameters.cycleDecayDurationDays.order]);
    const decayPerCycle = Number(parameters[ALLOCATION_MODES.PropensityAllotmentBalancedLinear.parameters.decayPerCycle.order]) / 100;
    const simulationStartDate = leads[0].created.clone().startOf('date');

    let lastDailyDecayDate = simulationStartDate.clone();
    let lastCycleDecayDate = simulationStartDate.clone();

    for (let i = 0; i < leads.length; i++) {
        let lead = updatedLeads[i];
        let totalAllotment = 0;
        let availableAdvisors = 0;
        let currentDate = leads[i].created.clone().startOf('date');

        lastDailyDecayDate = applyDecay(updatedCourseAdvisors, currentDate, lastCycleDecayDate, lastDailyDecayDate, cycleDecayDurationDays, decayPerCycle, decayPerDay);
        
        let validAdvisors = updatedCourseAdvisors.filter((advisor) => (isMatchingPortfolio(advisor, lead)));

        for (let caNum = 0; caNum < validAdvisors.length; caNum++) {
            let advisor = validAdvisors[caNum];
            totalAllotment = totalAllotment + advisor.currentAllotment;
            
            let caIsInWorkingHours = isInWorkingHours(lead.created, updatedCourseAdvisors[advisor.id].location);
            let propensityScore = lead.courseAdvisors[advisor.id].propensity * propensityWeighting;
            availableAdvisors = caIsInWorkingHours ? availableAdvisors + 1 : availableAdvisors;

            validAdvisors[caNum] = {
                ...advisor, 
                propensityScore: propensityScore,
                isInWorkingHours: caIsInWorkingHours,
            }
        }
        
        let averageAllotment;
        if (availableAdvisors > 0) {
            averageAllotment = totalAllotment / availableAdvisors;
        }
        else {
            averageAllotment = totalAllotment / validAdvisors.length;
        }

        validAdvisors.sort((a,b) => {
            //give firm precedence to those who are currently working
            if (b.isInWorkingHours && !a.isInWorkingHours) {
                return 1;
            }
            if (a.isInWorkingHours && !b.isInWorkingHours) {
                return -1;
            }

            //Otherwise choosing the CA with the best overall score
            let overallScoreA = a.propensityScore + (averageAllotment - a.currentAllotment) * allotmentWeighting;
            let overallScoreB = b.propensityScore + (averageAllotment - b.currentAllotment) * allotmentWeighting;
            if (overallScoreB !== overallScoreA) {
                return overallScoreB - overallScoreA;
            }

            //use allotment numbers as a tiebreaker
            return a.currentAllotment - b.currentAllotment;
        });

        let selectedAdvisor = validAdvisors[0];
        allocateLead(lead, selectedAdvisor, updatedCourseAdvisors);
    }

    const returnObj = {
        leads: updatedLeads,
        courseAdvisors: updatedCourseAdvisors,
    }
    return returnObj;
}


function allocatePropensityAllotmentBalancedProportional(leads, courseAdvisors, parameters) {
    let updatedLeads = leads.slice();
    let updatedCourseAdvisors = courseAdvisors.slice();

    const propensityWeighting = Number(parameters[ALLOCATION_MODES.PropensityAllotmentBalancedProportional.parameters.propensityWeighting.order]);
    const allotmentWeighting = Number(parameters[ALLOCATION_MODES.PropensityAllotmentBalancedProportional.parameters.allotmentWeighting.order]);
    const decayPerDay = Number(parameters[ALLOCATION_MODES.PropensityAllotmentBalancedProportional.parameters.decayPerDay.order]);
    const cycleDecayDurationDays = Number(parameters[ALLOCATION_MODES.PropensityAllotmentBalancedProportional.parameters.cycleDecayDurationDays.order]);
    const decayPerCycle = Number(parameters[ALLOCATION_MODES.PropensityAllotmentBalancedProportional.parameters.decayPerCycle.order]) / 100;
    const simulationStartDate = leads[0].created.clone().startOf('date');

    let lastDailyDecayDate = simulationStartDate.clone();
    let lastCycleDecayDate = simulationStartDate.clone();

    for (let i = 0; i < leads.length; i++) {
        let lead = updatedLeads[i];
        let totalAllotment = 0;
        let cumulativePropensity = 0;
        let availableAdvisors = 0;
        let currentDate = leads[i].created.clone().startOf('date');

        lastDailyDecayDate = applyDecay(updatedCourseAdvisors, currentDate, lastCycleDecayDate, lastDailyDecayDate, cycleDecayDurationDays, decayPerCycle, decayPerDay);
        
        let validAdvisors = updatedCourseAdvisors.filter((advisor) => (isMatchingPortfolio(advisor, lead)));

        for (let caNum = 0; caNum < validAdvisors.length; caNum++) {
            let advisor = validAdvisors[caNum];
            totalAllotment = totalAllotment + advisor.currentAllotment;
            cumulativePropensity = cumulativePropensity + lead.courseAdvisors[advisor.id].propensity;
            
            let caIsInWorkingHours = isInWorkingHours(lead.created, updatedCourseAdvisors[advisor.id].location);
            availableAdvisors = caIsInWorkingHours ? availableAdvisors + 1 : availableAdvisors;

            validAdvisors[caNum] = {
                ...advisor, 
                propensity: lead.courseAdvisors[advisor.id].propensity,
                isInWorkingHours: caIsInWorkingHours,
            }
        }
        
        let averageAllotment;
        let averagePropensity;
        if (availableAdvisors > 0) {
            averageAllotment = totalAllotment / availableAdvisors;
            averagePropensity = cumulativePropensity / availableAdvisors;
        }
        else {
            averageAllotment = totalAllotment / validAdvisors.length;
            averagePropensity = cumulativePropensity / validAdvisors.length;
        }

        validAdvisors.sort((a,b) => {
            //give firm precedence to those who are currently working
            if (b.isInWorkingHours && !a.isInWorkingHours) {
                return 1;
            }
            if (a.isInWorkingHours && !b.isInWorkingHours) {
                return -1;
            }

            //Otherwise choosing the CA with the best overall score
            let overallScoreA = calculateOverallScore(a, averagePropensity, averageAllotment, propensityWeighting, allotmentWeighting);
            let overallScoreB = calculateOverallScore(b, averagePropensity, averageAllotment, propensityWeighting, allotmentWeighting);
            if (overallScoreB !== overallScoreA) {
                return overallScoreB - overallScoreA;
            }

            //use allotment numbers as a tiebreaker
            return a.currentAllotment - b.currentAllotment;
        });

        let selectedAdvisor = validAdvisors[0];
        allocateLead(lead, selectedAdvisor, updatedCourseAdvisors);
    }

    const returnObj = {
        leads: updatedLeads,
        courseAdvisors: updatedCourseAdvisors,
    }
    return returnObj;
}


function allocatePropensityAllotmentBalancedProportionalPerCluster(leads, courseAdvisors, parameters) {
    let updatedLeads = leads.slice();
    let updatedCourseAdvisors = courseAdvisors.slice();

    const propensityWeighting = Number(parameters[ALLOCATION_MODES.PropensityAllotmentBalancedProportional.parameters.propensityWeighting.order]);
    const allotmentWeighting = Number(parameters[ALLOCATION_MODES.PropensityAllotmentBalancedProportional.parameters.allotmentWeighting.order]);
    // const decayPerDay = Number(parameters[ALLOCATION_MODES.PropensityAllotmentBalancedProportional.parameters.decayPerDay.order]);
    // const cycleDecayDurationDays = Number(parameters[ALLOCATION_MODES.PropensityAllotmentBalancedProportional.parameters.cycleDecayDurationDays.order]);
    // const decayPerCycle = Number(parameters[ALLOCATION_MODES.PropensityAllotmentBalancedProportional.parameters.decayPerCycle.order]) / 100;
    // const simulationStartDate = leads[0].created.clone().startOf('date');

    // let lastDailyDecayDate = simulationStartDate.clone();
    // let lastCycleDecayDate = simulationStartDate.clone();
    let caLeadsInCluster = courseAdvisors.slice().map((advisor) => {
        return {
            ...advisor,
            leadsInCluster: [],
        };
    });

    for (let i = 0; i < leads.length; i++) {
        let lead = updatedLeads[i];
        let totalAllotment = 0;
        let cumulativePropensity = 0;
        let availableAdvisors = 0;
        // let currentDate = leads[i].created.clone().startOf('date');

        // lastDailyDecayDate = applyDecay(updatedCourseAdvisors, currentDate, lastCycleDecayDate, lastDailyDecayDate, cycleDecayDurationDays, decayPerCycle, decayPerDay);
        
        let validAdvisors = updatedCourseAdvisors.filter((advisor) => (isMatchingPortfolio(advisor, lead)));

        for (let caNum = 0; caNum < validAdvisors.length; caNum++) {
            let advisor = validAdvisors[caNum];
            cumulativePropensity = cumulativePropensity + lead.courseAdvisors[advisor.id].propensity;
            
            let caIsInWorkingHours = isInWorkingHours(lead.created, updatedCourseAdvisors[advisor.id].location);
            availableAdvisors = caIsInWorkingHours ? availableAdvisors + 1 : availableAdvisors;

            let caLeadsInCurrentCluster = caLeadsInCluster[advisor.id].leadsInCluster[lead.cluster] ? caLeadsInCluster[advisor.id].leadsInCluster[lead.cluster] : 0;
            totalAllotment = totalAllotment + caLeadsInCurrentCluster;

            validAdvisors[caNum] = {
                ...advisor, 
                propensity: lead.courseAdvisors[advisor.id].propensity,
                isInWorkingHours: caIsInWorkingHours,
                leadsInCluster: caLeadsInCurrentCluster,
            }
        }
        
        let averageAllotment;
        let averagePropensity;
        if (availableAdvisors > 0) {
            averageAllotment = totalAllotment / availableAdvisors;
            averagePropensity = cumulativePropensity / availableAdvisors;
        }
        else {
            averageAllotment = totalAllotment / validAdvisors.length;
            averagePropensity = cumulativePropensity / validAdvisors.length;
        }

        validAdvisors.sort((a,b) => {
            //give firm precedence to those who are currently working
            if (b.isInWorkingHours && !a.isInWorkingHours) {
                return 1;
            }
            if (a.isInWorkingHours && !b.isInWorkingHours) {
                return -1;
            }

            //Otherwise choosing the CA with the best overall score
            let overallScoreA = calculateOverallScoreClustered(a, averagePropensity, averageAllotment, propensityWeighting, allotmentWeighting);
            let overallScoreB = calculateOverallScoreClustered(b, averagePropensity, averageAllotment, propensityWeighting, allotmentWeighting);
            if (overallScoreB !== overallScoreA) {
                return overallScoreB - overallScoreA;
            }

            //use allotment numbers as a tiebreaker
            return a.currentAllotment - b.currentAllotment;
        });

        let selectedAdvisor = validAdvisors[0];
        allocateLead(lead, selectedAdvisor, updatedCourseAdvisors);
        caLeadsInCluster[selectedAdvisor.id].leadsInCluster[lead.cluster] = caLeadsInCluster[selectedAdvisor.id].leadsInCluster[lead.cluster] ? caLeadsInCluster[selectedAdvisor.id].leadsInCluster[lead.cluster] + 1 : 1;
    }

    const returnObj = {
        leads: updatedLeads,
        courseAdvisors: updatedCourseAdvisors,
    }
    return returnObj;
}


function allocatePropensityAllotmentDifficultyBalancedProportional(leads, courseAdvisors, parameters) {
    let updatedLeads = leads.slice();
    let updatedCourseAdvisors = courseAdvisors.slice();

    const propensityWeighting = Number(parameters[ALLOCATION_MODES.PropensityAllotmentDifficultyBalancedProportional.parameters.propensityWeighting.order]);
    const allotmentWeighting = Number(parameters[ALLOCATION_MODES.PropensityAllotmentDifficultyBalancedProportional.parameters.allotmentWeighting.order]);
    const difficultyWeighting = Number(parameters[ALLOCATION_MODES.PropensityAllotmentDifficultyBalancedProportional.parameters.difficultyWeighting.order]);
    const decayPerDay = Number(parameters[ALLOCATION_MODES.PropensityAllotmentDifficultyBalancedProportional.parameters.decayPerDay.order]);
    const cycleDecayDurationDays = Number(parameters[ALLOCATION_MODES.PropensityAllotmentDifficultyBalancedProportional.parameters.cycleDecayDurationDays.order]);
    const decayPerCycle = Number(parameters[ALLOCATION_MODES.PropensityAllotmentDifficultyBalancedProportional.parameters.decayPerCycle.order]) / 100;
    const simulationStartDate = leads[0].created.clone().startOf('date');

    let lastDailyDecayDate = simulationStartDate.clone();
    let lastCycleDecayDate = simulationStartDate.clone();
    
    let totalCumulativeInherentAtLead = 0;

    for (let i = 0; i < leads.length; i++) {
        let lead = updatedLeads[i];
        let totalAllotment = 0;
        let cumulativePropensity = 0;
        let availableAdvisors = 0;
        let currentDate = leads[i].created.clone().startOf('date');

        totalCumulativeInherentAtLead = totalCumulativeInherentAtLead + lead.inherent;

        lastDailyDecayDate = applyDecay(updatedCourseAdvisors, currentDate, lastCycleDecayDate, lastDailyDecayDate, cycleDecayDurationDays, decayPerCycle, decayPerDay);
        
        let validAdvisors = updatedCourseAdvisors.filter((advisor) => (isMatchingPortfolio(advisor, lead)));

        for (let caNum = 0; caNum < validAdvisors.length; caNum++) {
            let advisor = validAdvisors[caNum];
            totalAllotment = totalAllotment + advisor.currentAllotment;
            cumulativePropensity = cumulativePropensity + lead.courseAdvisors[advisor.id].propensity;
            
            let caIsInWorkingHours = isInWorkingHours(lead.created, updatedCourseAdvisors[advisor.id].location);
            availableAdvisors = caIsInWorkingHours ? availableAdvisors + 1 : availableAdvisors;

            validAdvisors[caNum] = {
                ...advisor, 
                propensity: lead.courseAdvisors[advisor.id].propensity,
                isInWorkingHours: caIsInWorkingHours,
            }
        }
        
        let averageAllotment;
        let averagePropensity;
        let averageInherent;
        if (availableAdvisors > 0) {
            averageAllotment = totalAllotment / availableAdvisors;
            averagePropensity = cumulativePropensity / availableAdvisors;
            averageInherent = totalCumulativeInherentAtLead / availableAdvisors;
        }
        else {
            averageAllotment = totalAllotment / validAdvisors.length;
            averagePropensity = cumulativePropensity / validAdvisors.length;
            averageInherent = totalCumulativeInherentAtLead / validAdvisors.length;
        }

        validAdvisors.sort((a,b) => {
            //give firm precedence to those who are currently working
            if (b.isInWorkingHours && !a.isInWorkingHours) {
                return 1;
            }
            if (a.isInWorkingHours && !b.isInWorkingHours) {
                return -1;
            }

            //Otherwise choosing the CA with the best overall score
            let overallScoreA = calculateOverallScoreWithDifficulty(a, averagePropensity, averageAllotment, averageInherent, propensityWeighting, allotmentWeighting, difficultyWeighting);
            let overallScoreB = calculateOverallScoreWithDifficulty(b, averagePropensity, averageAllotment, averageInherent, propensityWeighting, allotmentWeighting, difficultyWeighting);
            if (overallScoreB !== overallScoreA) {
                return overallScoreB - overallScoreA;
            }

            //use allotment numbers as a tiebreaker
            return a.currentAllotment - b.currentAllotment;
        });

        let selectedAdvisor = validAdvisors[0];
        allocateLead(lead, selectedAdvisor, updatedCourseAdvisors);
        updatedCourseAdvisors[selectedAdvisor.id].runningInherent += lead.inherent;
    }

    const returnObj = {
        leads: updatedLeads,
        courseAdvisors: updatedCourseAdvisors,
    }
    return returnObj;
}


function allocateLead(lead, selectedAdvisor, courseAdvisors) {
    lead.allocatedCa = selectedAdvisor.id;
    lead.allotmentAtAllocation = selectedAdvisor.currentAllotment + 1;
    lead.assessedPropensity = lead.courseAdvisors[selectedAdvisor.id].assessedPropensity;
    lead.allocatedPropensity = lead.courseAdvisors[selectedAdvisor.id].propensity;
    courseAdvisors[selectedAdvisor.id].totalAllotment++;
    courseAdvisors[selectedAdvisor.id].currentAllotment++;
}


function applyDecay(updatedCourseAdvisors, currentDate, lastCycleDecayDate, lastDailyDecayDate, cycleDecayDurationDays, decayPerCycle, decayPerDay) {
    //Per cycle delay, ignore if the cycle is set to zero
    let cycleDelayDays = currentDate.diff(lastCycleDecayDate, 'days');
    if (cycleDecayDurationDays > 0 && cycleDelayDays >= cycleDecayDurationDays) {
        let decayCyclesPassed = Math.floor(cycleDelayDays / cycleDecayDurationDays);
        let totalDecayPercentage = decayPerCycle ** decayCyclesPassed;
        for (let caNum = 0; caNum < updatedCourseAdvisors.length; caNum++) {
            let advisor = updatedCourseAdvisors[caNum];
            advisor.currentAllotment = advisor.currentAllotment * (1 - totalDecayPercentage);
        }
        lastCycleDecayDate.add(cycleDecayDurationDays * decayCyclesPassed, 'days');
    }

    //Per day delay
    let dailyDecayDays = currentDate.diff(lastDailyDecayDate, 'days');
    if (dailyDecayDays > 0) {
        for (let caNum = 0; caNum < updatedCourseAdvisors.length; caNum++) {
            let advisor = updatedCourseAdvisors[caNum];
            let decayAmount = dailyDecayDays * decayPerDay * advisor.decayModifier;
            advisor.currentAllotment = Math.max(advisor.currentAllotment - decayAmount, 0);
        }
        lastDailyDecayDate = currentDate.clone();
    }
    return lastDailyDecayDate;
}

function calculateOverallScore(advisor, averagePropensity, averageAllotment, propensityWeighting, allotmentWeighting) {
    let propensityScore = averagePropensity > 0 ? (advisor.propensity - averagePropensity) / averagePropensity * propensityWeighting : 0;
    let allotmentScore = (averageAllotment - advisor.currentAllotment) * allotmentWeighting
    return propensityScore + allotmentScore;
}

function calculateOverallScoreClustered(advisor, averagePropensity, averageAllotment, propensityWeighting, allotmentWeighting) {
    let propensityScore = averagePropensity > 0 ? (advisor.propensity - averagePropensity) / averagePropensity * propensityWeighting : 0;
    let allotmentScore = (averageAllotment - advisor.leadsInCluster) * allotmentWeighting
    return propensityScore + allotmentScore;
}

function calculateOverallScoreWithDifficulty(advisor, averagePropensity, averageAllotment, averageInherent, propensityWeighting, allotmentWeighting, difficultyWeighting) {
    let propensityScore = averagePropensity > 0 ? (advisor.propensity - averagePropensity) / averagePropensity * propensityWeighting : 0;
    let allotmentScore = (averageAllotment - advisor.currentAllotment) * allotmentWeighting
    let difficultyScore = averageInherent > 0 ? (advisor.runningInherent - averageInherent / averageInherent) * difficultyWeighting : 0;
    return propensityScore + allotmentScore - difficultyScore;
}

function isMatchingPortfolio(advisor, lead) {
    return advisor.portfolio === lead.portfolio;
}

function isInWorkingHours(datetime, location) {
    let timezone = TIMEZONES[location];
    let hourOfDay = datetime.hour() + datetime.minute() / 60;

    //Return false for anything falling on a Saturday or Sunday
    let dayOfWeek = datetime.clone().subtract(timezone.timezoneOffsetFromAdelaide, 'hours').day();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        return false;
    }
    
    let effectiveEndHour = timezone.endHour;
    let effectiveHourOfDay = hourOfDay;
    if (timezone.endHour <= timezone.startHour) {
        effectiveEndHour = timezone.endHour + 24;
        if (hourOfDay < timezone.startHour) {
            effectiveHourOfDay += 24;
        }
    }

    return effectiveHourOfDay >= timezone.startHour && effectiveHourOfDay <= effectiveEndHour;
}