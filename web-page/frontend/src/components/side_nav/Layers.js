import * as React from 'react';

import { reorder } from '../../helpers';
import { Droppable, DragDropContext } from 'react-beautiful-dnd';
import DraggableLayer from './DraggableLayer';

const DraggableList = ({
  layers,
  selectedLayer,
  onSelected,
  onDelete,
  onVisClick,
  onHSLChange,
}) => {
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
};

export default function Layers({
  layersDef,
  selectedLayer,
  onSelectLayer,
  onDeleteLayer,
  onVisibilityClicked,
  onHSLChange,
  onNewLayerDef,
}) {
  const onDragEnd = ({ destination, source }) => {
    console.log('onDragEnd');
    // dropped outside of the list
    if (!destination) return;
    const newLayersDef = reorder(layersDef, source.index, destination.index);
    onNewLayerDef(newLayersDef);
  };
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <DraggableList
        layers={layersDef}
        selectedLayer={selectedLayer}
        onSelected={onSelectLayer}
        onDelete={onDeleteLayer}
        onVisClick={onVisibilityClicked}
        onHSLChange={onHSLChange}
      />
    </DragDropContext>
  );
}
