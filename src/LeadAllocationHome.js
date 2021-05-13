

function LeadAllocationHome() {
  return (
    <div className="App">
      <header className="App-header">
        <p>
          Lead Allocation Simulator
        </p>
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