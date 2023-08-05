import * as React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import InboxIcon from '@material-ui/icons/Inbox';

const DraggableLayer = ({ layerDef, index }) => {
  return <Draggable draggableId={layerDef.id} index={index}>
    
  </Draggable>;
};
