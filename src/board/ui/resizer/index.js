import React, {Component} from 'react';

import './styles.css';

class Resizer extends Component {

    handleMouseMove(e) {
        const currentState = this.state;
        const selectedElements = [];
        Object.keys(this.state.elementState).forEach(item => {
            if(this.state.elementState[item].selected) {
                selectedElements.push(this.state.elements[item]);
            }
        });
        const newState = {};
        if(selectedElements) {
            const newElementsData = {...currentState.elements};
            if(selectedElements.length > 1) {
                selectedElements.forEach(item => {
                    newElementsData[item.id].styles.width += e.movementX*currentState.zoomLevel;
                    newElementsData[item.id].styles.height += e.movementX*currentState.zoomLevel;
                });
            } else if(selectedElements.length === 1 && selectedElements[0].fixedRatio) {
                let elementID = selectedElements[0].id;
                newElementsData[elementID].styles.width += e.movementX*currentState.zoomLevel;
                newElementsData[elementID].styles.height += e.movementX*currentState.zoomLevel;
            } else if(selectedElements.length === 1) {
                let elementID = selectedElements[0].id;
                newElementsData[elementID].styles.width += e.movementX*currentState.zoomLevel;
                newElementsData[elementID].styles.height += e.movementY*currentState.zoomLevel;
            }
            this.setState({newState});
        }
        
    }

    render() {
        const { boundingBox } = this.props;

        const resizerStyles = {
            position : "absolute",
            height : `16px`,
            width : `16px`,
            top : `${(boundingBox.cy-8)}px`,
            left : `${(boundingBox.cx-8)}px`
        };

        return (
            <svg style={resizerStyles} height="16" width="16" viewBox="-8 -8 16 16">
                <circle
                id={"resizerHandle"}
                cx={0} 
                cy={0} 
                r={6}
                fill={"white"}
                stroke={"grey"}
                strokeWidth={2}
                strokeOpacity={0.5} 
                cursor={"nwse-resize"}>
                </circle>
            </svg>
        );
    }

    componentDidMount() {
        this.props.registerDragHandler("resizerHandle", {
            "dragMoveHandler" : this.handleMouseMove
        });
    }
}

export default Resizer;