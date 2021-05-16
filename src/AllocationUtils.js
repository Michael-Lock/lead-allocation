
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
    MostSuitableHardAllotmentTolerance: {
        id: 2,
        name: "Most Suitable (Hard allotment tolerance)",
        description: "Allocates leads to the CA with the highest likelihood of conversion, so long as their allotment is not a given number of leads more than any other CA currently available",
        parameters: {
            allotmentTolerance: {
                order: 0,
                label: "Allotment Tolerance",
            },
        },
        allocationFunction: allocateMostSuitableHardAllotmentLimit,
    }
}

const PORTFOLIOS = {
    Domestic: "Domestic",
    Canada: "Canada",
}

const TIMEZONES = {
    Adelaide: {
        startHour: 9,
        endHour: 17,
    },
    Canada: {
        startHour: 22.5,
        endHour: 6.5,
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


function allocateMostSuitableHardAllotmentLimit(leads, courseAdvisors, parameters) {
    let updatedLeads = leads.slice();
    let updatedCourseAdvisors = courseAdvisors.slice();
    const TOLERANCE = parameters["allotmentTolerance"];

    for (let i = 0; i < leads.length; i++) {
        let lead = updatedLeads[i];
        let lowestAllotment = Number.MAX_SAFE_INTEGER;
        
        let validAdvisors = updatedCourseAdvisors.filter((advisor) => (isMatchingPortfolio(advisor, lead)));

        for (let caNum = 0; caNum < validAdvisors.length; caNum++) {
            let advisor = validAdvisors[caNum];
            lowestAllotment = advisor.currentAllotment < lowestAllotment ? advisor.currentAllotment : lowestAllotment;
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
            //then firm prededence to those within the tolerance range for allotment
            if (b.currentAllotment - lowestAllotment < TOLERANCE && a.currentAllotment - lowestAllotment >= TOLERANCE) {
                return 1;
            }
            if (a.currentAllotment - lowestAllotment < TOLERANCE && b.currentAllotment - lowestAllotment >= TOLERANCE) {
                return -1;
            }
            //picking the person least outside tolerance if both are
            if (a.currentAllotment - lowestAllotment >= TOLERANCE && b.currentAllotment - lowestAllotment >= TOLERANCE && b.currentAllotment !== a.currentAllotment) {
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