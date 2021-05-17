

export const ALLOCATION_MODES = {
    RoundRobin: {
        id: 0,
        name: "Round Robin",
        description: "Allocates leads one by one to each available CA",
        allocationFunction: allocateRoundRobin,
    },
    MostSuitableAggressive: {
        id: 1,
        name: "Most Suitable (Aggressive)",
        description: "Allocates leads always to the CA with the highest likelihood of conversion. Uses lowest current allotment as a tiebreaker",
        allocationFunction: allocateMostSuitableAggressive,
    },
    MostSuitableFixedAllotmentTolerance: {
        id: 2,
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
        },
        allocationFunction: allocateMostSuitableFixedAllotmentLimit,
    },
    MostSuitableProportionalAllotmentTolerance: {
        id: 3,
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
        updatedCourseAdvisors[selectedAdvisor.id].currentAllotment++;
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
            return a.currentAllotment - b.currentAllotment;
        });

        let mostSuitableCa = validAdvisors[0];
        lead.allocatedCa = mostSuitableCa.id;
        updatedCourseAdvisors[mostSuitableCa.id].currentAllotment++;
    }
    
    const returnObj = {
        leads: updatedLeads,
        courseAdvisors: updatedCourseAdvisors,
    }
    return returnObj;
}


function allocateMostSuitableFixedAllotmentLimit(leads, courseAdvisors, parameters) {
    let updatedLeads = leads.slice();
    let updatedCourseAdvisors = courseAdvisors.slice();

    const tolerance = parameters[ALLOCATION_MODES.MostSuitableFixedAllotmentTolerance.parameters.allotmentTolerance.order];
    const decayPerDay = parameters[ALLOCATION_MODES.MostSuitableFixedAllotmentTolerance.parameters.decayPerDay.order]
    const simulationStartDate = leads[0].created.clone().startOf('date');

    for (let i = 0; i < leads.length; i++) {
        let lead = updatedLeads[i];
        let lowestAllotment = Number.MAX_SAFE_INTEGER;
        let daysFromStart = leads[i].created.clone().startOf('date').diff(simulationStartDate, 'days');
        
        let validAdvisors = updatedCourseAdvisors.filter((advisor) => (isMatchingPortfolio(advisor, lead)));

        for (let caNum = 0; caNum < validAdvisors.length; caNum++) {
            let advisor = validAdvisors[caNum];
            let advisorDecayedAllotment = Math.max(advisor.currentAllotment - daysFromStart * decayPerDay, 0);

            lowestAllotment = advisorDecayedAllotment < lowestAllotment ? advisorDecayedAllotment : lowestAllotment;
            let caIsInWorkingHours = isInWorkingHours(lead.created, updatedCourseAdvisors[advisor.id].location);
            validAdvisors[caNum] = {
                ...advisor, 
                propensity: lead.courseAdvisors[advisor.id].propensity,
                decayedAllotment: advisorDecayedAllotment,
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
            //then firm prededence to those within the tolerance range for allotment
            if (b.decayedAllotment - lowestAllotment < tolerance && a.decayedAllotment - lowestAllotment >= tolerance) {
                return 1;
            }
            if (a.decayedAllotment - lowestAllotment < tolerance && b.decayedAllotment - lowestAllotment >= tolerance) {
                return -1;
            }
            //picking the person least outside tolerance if both are
            if (a.decayedAllotment - lowestAllotment >= tolerance && b.decayedAllotment - lowestAllotment >= tolerance && b.decayedAllotment !== a.decayedAllotment) {
                return a.decayedAllotment - b.decayedAllotment;
            }
            //otherwise picking the most suitable CA based on propensity
            if (b.propensity !== a.propensity) {
                return b.propensity - a.propensity;
            }
            //use allotment numbers as a tiebreaker
            return a.decayedAllotment - b.decayedAllotment;
        });

        let mostSuitableCa = validAdvisors[0];
        lead.allocatedCa = mostSuitableCa.id;
        updatedCourseAdvisors[mostSuitableCa.id].currentAllotment++;
    }
    
    const returnObj = {
        leads: updatedLeads,
        courseAdvisors: updatedCourseAdvisors,
    }
    return returnObj;
}


function allocateMostSuitableProportionalAllotmentLimit(leads, courseAdvisors, parameters) {
    let updatedLeads = leads.slice();
    let updatedCourseAdvisors = courseAdvisors.slice();

    const tolerance = parameters[ALLOCATION_MODES.MostSuitableFixedAllotmentTolerance.parameters.allotmentTolerance.order] / 100;
    const decayPerDay = parameters[ALLOCATION_MODES.MostSuitableFixedAllotmentTolerance.parameters.decayPerDay.order]
    const simulationStartDate = leads[0].created.clone().startOf('date');

    for (let i = 0; i < leads.length; i++) {
        let lead = updatedLeads[i];
        let lowestAllotment = Number.MAX_SAFE_INTEGER;
        let daysFromStart = leads[i].created.clone().startOf('date').diff(simulationStartDate, 'days');
        
        let validAdvisors = updatedCourseAdvisors.filter((advisor) => (isMatchingPortfolio(advisor, lead)));

        for (let caNum = 0; caNum < validAdvisors.length; caNum++) {
            let advisor = validAdvisors[caNum];
            let advisorDecayedAllotment = Math.max(advisor.currentAllotment - daysFromStart * decayPerDay, 0);

            lowestAllotment = advisorDecayedAllotment < lowestAllotment ? advisorDecayedAllotment : lowestAllotment;
            let caIsInWorkingHours = isInWorkingHours(lead.created, updatedCourseAdvisors[advisor.id].location);
            validAdvisors[caNum] = {
                ...advisor, 
                propensity: lead.courseAdvisors[advisor.id].propensity,
                decayedAllotment: advisorDecayedAllotment,
                isInWorkingHours: caIsInWorkingHours,
            }
        }

        let allotmentCap = lowestAllotment + lowestAllotment * tolerance;

        validAdvisors.sort((a,b) => {
            //give firm precedence to those who are currently working
            if (b.isInWorkingHours && !a.isInWorkingHours) {
                return 1;
            }
            if (a.isInWorkingHours && !b.isInWorkingHours) {
                return -1;
            }
            //then firm prededence to those within the tolerance range for allotment
            if (b.decayedAllotment < allotmentCap && a.decayedAllotment >= allotmentCap) {
                return 1;
            }
            if (a.decayedAllotment < allotmentCap && b.decayedAllotment >= allotmentCap) {
                return -1;
            }
            //picking the person least outside tolerance if both are
            if (a.decayedAllotment >= allotmentCap && b.decayedAllotment >= allotmentCap && b.decayedAllotment !== a.decayedAllotment) {
                return a.decayedAllotment - b.decayedAllotment;
            }
            //otherwise picking the most suitable CA based on propensity
            if (b.propensity !== a.propensity) {
                return b.propensity - a.propensity;
            }
            //use allotment numbers as a tiebreaker
            return a.decayedAllotment - b.decayedAllotment;
        });

        let mostSuitableCa = validAdvisors[0];
        lead.allocatedCa = mostSuitableCa.id;
        updatedCourseAdvisors[mostSuitableCa.id].currentAllotment++;
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