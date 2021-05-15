

let allocateRoundRobin = (leads, courseAdvisors) => {
    let updatedLeads = leads.slice();
    let updatedCourseAdvisors = courseAdvisors.slice();

    let lastCa = 0;

    for (let i = 0; i < leads.length; i++) {
        updatedLeads[i].allocatedCa = updatedCourseAdvisors[lastCa].id;
        updatedCourseAdvisors[lastCa].currentAllotment++;
        lastCa = (lastCa + 1) % courseAdvisors.length;
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
        let highestPropensity = -1;
        let mostSuitableCa;
        for (let caNum = 0; caNum < leads[i].courseAdvisors.length; caNum++) {
            let advisor = leads[i].courseAdvisors[caNum];
            if (!mostSuitableCa || advisor.propensity > highestPropensity || (advisor.propensity === highestPropensity && mostSuitableCa.currentAllotment > advisor.currentAllotment)) {
                mostSuitableCa = advisor;
                highestPropensity = advisor.propensity;
            }
        }
        updatedLeads[i].allocatedCa = mostSuitableCa.id;
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