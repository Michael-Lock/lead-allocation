

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
    MostSuitableProportionalAllotmentTolerance: {
        id: 5,
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
        lead.allocatedCa = selectedAdvisor.id;
        updatedCourseAdvisors[selectedAdvisor.id].totalAllotment++;
        updatedCourseAdvisors[selectedAdvisor.id].currentAllotment++;
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
        let sortedAdvisors = updatedCourseAdvisors.sort((a,b) => a.lastAllocatedId - b.lastAllocatedId);;

        let selectedAdvisor = sortedAdvisors[0];

        selectedAdvisor.lastAllocatedId = lead.leadId;
        lead.allocatedCa = selectedAdvisor.id;
        updatedCourseAdvisors[selectedAdvisor.id].totalAllotment++;
        updatedCourseAdvisors[selectedAdvisor.id].currentAllotment++;
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

        let mostSuitableCa = validAdvisors[0];
        lead.allocatedCa = mostSuitableCa.id;
        updatedCourseAdvisors[mostSuitableCa.id].totalAllotment++;
        updatedCourseAdvisors[mostSuitableCa.id].currentAllotment++;
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

        let mostSuitableCa = validAdvisors[0];
        lead.allocatedCa = mostSuitableCa.id;
        updatedCourseAdvisors[mostSuitableCa.id].totalAllotment++;
        updatedCourseAdvisors[mostSuitableCa.id].currentAllotment++;
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

        //Per cycle delay, ignore if the cycle is set to zero
        let cycleDelayDays = currentDate.diff(lastCycleDecayDate, 'days'); 
        if (cycleDecayDurationDays > 0 && cycleDelayDays >= cycleDecayDurationDays) {
            let decayCyclesPassed = Math.floor(cycleDelayDays / cycleDecayDurationDays);
            let totalDecayPercentage = decayPerCycle ^ decayCyclesPassed;
            for (let caNum = 0; caNum < updatedCourseAdvisors.length; caNum++) {
                let advisor = updatedCourseAdvisors[caNum];
                advisor.currentAllotment = advisor.currentAllotment * (1 - totalDecayPercentage);
            }
            lastCycleDecayDate.add(cycleDecayDurationDays, 'days');
        }

        //Per day delay
        let dailyDecayDays = currentDate.diff(lastDailyDecayDate, 'days');
        if (dailyDecayDays > 0) {
            for (let caNum = 0; caNum < updatedCourseAdvisors.length; caNum++) {
                let advisor = updatedCourseAdvisors[caNum];
                let decayAmount = dailyDecayDays * decayPerDay * advisor.decayModifier;
                advisor.currentAllotment = Math.max(advisor.currentAllotment - decayAmount, 0)
            }
            lastDailyDecayDate = currentDate.clone();
        }
        
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

        let mostSuitableCa = validAdvisors[0];
        lead.allocatedCa = mostSuitableCa.id;
        updatedCourseAdvisors[mostSuitableCa.id].totalAllotment++;
        updatedCourseAdvisors[mostSuitableCa.id].currentAllotment = mostSuitableCa.currentAllotment + 1;
    }

    const returnObj = {
        leads: updatedLeads,
        courseAdvisors: updatedCourseAdvisors,
    }
    return returnObj;
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