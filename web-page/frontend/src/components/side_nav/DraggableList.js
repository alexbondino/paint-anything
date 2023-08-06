import * as React from 'react';
import DraggableLayer from './DraggableLayer';
import { Droppable } from 'react-beautiful-dnd';

const DraggableList = React.memo(
  ({ layers, selectedLayer, onSelected, onDelete, onVisClick, onHSLChange }) => {
    // this chunk of code is necessary for react-beautiful-dnd to work in React18 strictmode
    const [enabled, setEnabled] = React.useState(false);
    React.useEffect(() => {
      const animation = requestAnimationFrame(() => setEnabled(true));

      return () => {
        cancelAnimationFrame(animation);
        setEnabled(false);
      };
    }, []);

    if (!enabled) {
      return null;
    }

    return (
      <Droppable droppableId="droppable">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {layers.map((layerDef, index) => (
              <DraggableLayer
                layerDef={layerDef}
                index={index}
                key={`${layerDef.id}`}
                selectedLayer={selectedLayer}
                onSelected={onSelected}
                onDelete={onDelete}
                onVisClick={onVisClick}
                onHSLChange={onHSLChange}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    );
  }
);

export default DraggableList;
