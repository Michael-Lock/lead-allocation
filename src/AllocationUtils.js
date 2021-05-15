
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


let allocateRoundRobin = (leads, courseAdvisors) => {
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


let allocateMostSuitableAggressive = (leads, courseAdvisors) => {
    let updatedLeads = leads.slice();
    let updatedCourseAdvisors = courseAdvisors.slice();

    for (let i = 0; i < leads.length; i++) {
        let lead = updatedLeads[i];
        let highestPropensity = -1;
        let mostSuitableCa;
        let isAllocatedInWorkingHours = false;
        for (let caNum = 0; caNum < updatedCourseAdvisors.length; caNum++) {
            let advisor = updatedCourseAdvisors[caNum];
            let advisorPropensity = lead.courseAdvisors[caNum].propensity;
            //Hard pass if the portfolio doesn't match
            if (!isMatchingPortfolio(advisor, lead)) {
                continue;
            }
            let advisorIsInWorkingHours = isInWorkingHours(lead.created, advisor.location);
            let useNewAdvisor = !mostSuitableCa || (advisorIsInWorkingHours && !isAllocatedInWorkingHours); //always assign if there's no current allocation or the allocated CA is not available
            if (!useNewAdvisor && !(isAllocatedInWorkingHours && !advisorIsInWorkingHours)) { //ignore the CA if they're not in the right timezone and the existing selection is
                //use the new CA if they're more suitable
                useNewAdvisor = advisorPropensity > highestPropensity || (advisorPropensity === highestPropensity && mostSuitableCa.currentAllotment > advisor.currentAllotment);
            }

            if (useNewAdvisor) {
                mostSuitableCa = advisor;
                isAllocatedInWorkingHours = advisorIsInWorkingHours;
                highestPropensity = advisorPropensity;
            }
        }
        if (!mostSuitableCa) {
            console.log("No allocation?");
        }
        lead.allocatedCa = mostSuitableCa.id;
        updatedCourseAdvisors[mostSuitableCa.id].currentAllotment++;
    }
    
    const returnObj = {
        leads: updatedLeads,
        courseAdvisors: updatedCourseAdvisors,
    }
    return returnObj;
}


export const ALLOCATION_MODES = [
    {
        id: 0,
        name: "Round Robin",
        description: "Allocates leads one by one to each available CA",
        allocationFunction: allocateRoundRobin,
    },
    {
        id: 1,
        name: "Most Suitable (Aggressive)",
        description: "Allocates leads always to the CA with the highest likelihood of conversion. Lowest current allotment is used only as a tiebreaker",
        allocationFunction: allocateMostSuitableAggressive,
    }
]


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