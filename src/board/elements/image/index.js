import React, {PureComponent} from 'react';

import './styles.css';

class Image extends PureComponent {

    constructor(props, context) {
      super(props, context);
      this.state = {};
    }

    handleCrop = (e) => {

    }
  
    render() {
        const {elementState, data} = this.props;
        const shapeProps = {...this.props.data.styles};
        let image = null;
        let shape = null;
        if(elementState.selected) {
            shapeProps.style = {outline : `${(data.initialZoomLevel)}px dashed #5086F2`};
        }
            
        const imgStyle = {
            backgroundImage : `url(${data.imgURL})`,
            backgroundRepeat : "no-repeat",
            backgroundSize : "contain",
            backgroundPosition : "0 0",
            width : "100%"
        };
        image = (
            <foreignObject
                className="svg_imageContainer_foreignObject"
                x={shapeProps.x}
                y={shapeProps.y}
                height={shapeProps.height}
                width={shapeProps.width}
            >
                <div
                    className="svg_imageContainer"
                    style={imgStyle}
                />
            </foreignObject>
        );
        shape = <rect
            id={data.id} 
            {...shapeProps}
        />;

        
        return (
            <g 
                onDoubleClick={this.handleCrop}
                height={shapeProps.height}
                width={shapeProps.width}
            >
                {shape}
                {image}
            </g>
        );
    }
    
  }

  export default Image;