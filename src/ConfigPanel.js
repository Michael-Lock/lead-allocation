import { ALLOCATION_MODES } from './AllocationUtils';

function ConfigPanel(props) {

    let allocationModeOptionElements = [<option key="unselected" value={null} hidden/>]
    allocationModeOptionElements = allocationModeOptionElements.concat(Object.keys(ALLOCATION_MODES).map((mode) => 
        <option key={ALLOCATION_MODES[mode].name} value={mode}>
            {ALLOCATION_MODES[mode].name}
        </option>));

    let inputParameters = [];
    if (props.selectedMode && props.selectedMode.parameters) {
        const parameters = Object.keys(props.selectedMode.parameters);
        for (let i = 0; i < parameters.length; i++) {
            let currentParameter = props.selectedMode.parameters[parameters[i]];
            inputParameters[i] = <div key={parameters[i]}>
                <label htmlFor={parameters[i]}>{currentParameter.label}</label>
                <input
                    name={parameters[i]}
                    type="number"
                    step="any"
                    onChange={props.onParameterChange}
                />
            </div>
        }
    }
        

    return (
        <div>
            <select
                onChange={(e) => props.onModeChange(e.target.value)}
            >
                {allocationModeOptionElements}
            </select>
            <div>
                {props.selectedMode ? props.selectedMode.description : ""}
            </div>
            {inputParameters}
        </div>
    );
}

export default ConfigPanel;