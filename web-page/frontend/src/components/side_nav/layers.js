import './layers.scss';

import { DragDropContext } from 'react-beautiful-dnd';
import DraggableList from './DraggableList';
import { reorder } from '../../helpers';

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
