import { ALLOCATION_MODES } from './AllocationUtils';

function ConfigPanel(props) {

    let allocationModeElements = [<option key="unselected" value={null} hidden/>]
    allocationModeElements = allocationModeElements.concat(ALLOCATION_MODES.map((mode) => 
        <option key={mode.name} value={mode.id}>
            {mode.name}
        </option>));

    return (
        <div>
            <select
                onChange={(e) => props.onModeChange(e.target.value)}
            >
                {allocationModeElements}
            </select>
            <div>
                {props.selectedMode ? props.selectedMode.description : ""}
            </div>
        </div>
    );
}

export default ConfigPanel;