import React, {Component} from 'react';
//UI
import Toolbar from './ui/toolbar';
import Altimeter from './ui/altimeter';
import TextEditor from './ui/textEditor';
//ELEMENTS
import Rect from './elements/rect';

import Shortid from 'shortid';

import './styles.css';


class Board extends Component {

    constructor(props, context) {
      super(props, context);
      this.state = {
        zoomLevel : 100,
        offsetX : 0,
        offsetY : 0,
        tool : "pan",
        resetTool : false,
        dragging : false,
        dragStartX :  0,
        dragStartY : 0,
        elements : {
            "sdfklsndflksndf" : {
                id : "sdfklsndflksndf",
                type : "circle",
                styles : {
                    cx : 0,
                    cy : 0,
                    r : 500,
                    fill : "grey"
                }
            }
        },
        elementState : {},
        currentElement : [],
        textEditor : null,
      };
    }
  
    handleToolSelect = (type) => {
      this.setState({"tool" : type});
    }

    handleZoom = (e) => {
        const {
            offsetX,
            offsetY,
            zoomLevel
        } = this.state;

        const dir = Math.sign(e.deltaY),
        nextZoomLevel = zoomLevel + dir > 0 ? zoomLevel + dir : 1,
        currentCursorPositionX = e.clientX*zoomLevel,
        currentCursorPositionY = e.clientY*zoomLevel,
        cursorPositionXAfterZoom = e.clientX*nextZoomLevel,
        cursorPositionYAfterZoom = e.clientY*nextZoomLevel,
        newOffsetX = offsetX - (cursorPositionXAfterZoom - currentCursorPositionX),
        newOffsetY = offsetY - (cursorPositionYAfterZoom - currentCursorPositionY);

        this.setState({
            offsetX : newOffsetX,
            offsetY : newOffsetY,
            zoomLevel : nextZoomLevel
        });

    }

    handleMouseDown = (e) => {
       
        const newState = {
            dragging : true,
            dragStartX : e.clientX,
            dragStartY : e.clientY,
        };
        
        if(this.state.tool === "shape") {
            newState.elements = {...this.state.elements};
            const newID = Shortid.generate();
            newState.elements[newID] = {
                id : newID,
                type : "rect",
                styles : {
                    x : (e.clientX*this.state.zoomLevel)+this.state.offsetX,
                    y : (e.clientY*this.state.zoomLevel)+this.state.offsetY,
                    width : 8*this.state.zoomLevel,
                    height: 8*this.state.zoomLevel,
                    fillOpacity: "0",
                    stroke : "black",
                    strokeWidth : 2*this.state.zoomLevel
                },
                text : "",
            };
            newState.elementState = {...this.state.elementState};
            newState.elementState[newID] = {};
            newState.resetTool = true;
            newState.currentElement = newID;
        }
        this.setState(newState);
        
    }

    handleMouseMove = (e) => {
        const {
            offsetX,
            offsetY,
            zoomLevel,
            dragging,
            dragStartX,
            dragStartY,
            tool,
            elements,
            currentElement
        } = this.state;
        if(dragging) {
            if(tool === "pan") {
                this.setState({
                    offsetX : offsetX + (e.movementX*-zoomLevel),
                    offsetY : offsetY + (e.movementY*-zoomLevel)
                });
            } else if (tool === "shape" && currentElement !== null) {
                const newElementGraph = {...elements};
                newElementGraph[currentElement].styles.width = (e.clientX-dragStartX)*zoomLevel;
                newElementGraph[currentElement].styles.height = (e.clientY-dragStartY)*zoomLevel;
                this.setState({
                    elements : newElementGraph
                });
            }
            
        }
    }

    handleMouseUp = (e) => {
        const resetState = {
            dragging : false,
            dragStartX : 0,
            dragStartY : 0,
            currentElement : null,
            elementState : {...this.state.elementState}
        };
        if(this.state.currentElement) {
            resetState.elementState[this.state.currentElement].drawn = true;
        }
        if(this.state.resetTool) {
            resetState.tool = "pan";
            resetState.resetTool = false;
        }
        this.setState(resetState);
    }

    handleTextEdit = (id) => {
        const newElements = {...this.state.elements};
        const elementData = {...this.state.elements[id]};
        newElements[id].text = "";
        this.setState({textEditor : elementData, elements : newElements});
    }

    handleUpdatedText = (data) => {
        const newElementsData = {...this.state.elements};
        newElementsData[data.id].text = data.newText;
        newElementsData[data.id].styles.fontSize = data.fontSize*this.state.zoomLevel;
        newElementsData[data.id].unScaledFontSize = data.fontSize;
        this.setState({
            elements : newElementsData,
            textEditor : null
        });
    }

    handleUpdatePosition = (data) => {
        const newElementsData = {...this.state.elements};
        const selectedItems = Object.keys(this.state.elementState).filter(item => {
            if(this.state.elementState[item].selected) {
                return true;
            }
            return false;
        });
        selectedItems.map(element => {
            newElementsData[element].styles.x += data.x*this.state.zoomLevel;
            newElementsData[element].styles.y += data.y*this.state.zoomLevel;
        });
        this.setState({
            elements : newElementsData
        });
    }

    handleSetCurrentElement = (elementID, selected, isMultiSelect) => {
        const newElementStateData = {...this.state.elementState};
        if(!isMultiSelect) {
            Object.keys(newElementStateData).forEach(item => {
                newElementStateData[item].selected = false;
            });
        }
        newElementStateData[elementID].selected = selected;
        this.setState({
            elementState : newElementStateData
        });
    };
  
    render() {
        const {width, height} = this.props;
        const {offsetX, offsetY, zoomLevel, tool, elements, textEditor} = this.state;
        const zoomedWidth = width*zoomLevel,
        zoomedHeight = height*zoomLevel;
        const viewBox = `${offsetX} ${offsetY} ${zoomedWidth} ${zoomedHeight}`;
        const elementNodes = Object.keys(elements).map(elementID => {
            const element = elements[elementID];
            if(element.type === "circle") {
                return (<circle
                            key={element.id} 
                            {...element.styles}
                            style={{cursor: "pointer"}} 
                    />);
            } else if (element.type === "rect") {
                return (<Rect 
                    key={element.id}
                    data={element}
                    elementState={this.state.elementState[element.id]}
                    handleTextEdit={this.handleTextEdit}
                    handleUpdatePosition={this.handleUpdatePosition}
                    handleSetCurrentElement={this.handleSetCurrentElement}
                />);
            }
            return null;
        });
        return (
            <div className={`boardWrapper ${tool}`}>
                <Altimeter zoomLevel={zoomLevel} />
                <Toolbar handleToolSelect={this.handleToolSelect} />
                <TextEditor 
                    data={textEditor}
                    gridSpace={{offsetX, offsetY, zoomLevel}}
                    handleUpdatedText={this.handleUpdatedText}
                />
                <svg id="board" 
                    width={`${width}px`}
                    height={`${height}px`}
                    viewBox={viewBox}
                    onWheel={this.handleZoom}
                    onMouseDown={this.handleMouseDown}
                    onMouseMove={this.handleMouseMove}
                    onMouseUp={this.handleMouseUp}
                    >
                    {elementNodes}
                </svg>
            </div>
        );
    }

    
  }

  export default Board;