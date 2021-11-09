import React from 'react';
import {
  IconButton,
  Drawer,
  List,
  ListSubheader,
  ListItemButton,
  ListItemText,
  Avatar,
} from '@mui/material';
import { Menu } from '@mui/icons-material';

import 'styles/GraphMenu.css';
import 'styles/GraphMenuItem.css';

import graphExamples from 'utils/graphExamples';

const imgPath = './assets/graphs';

export interface GraphMenuProps {
  importGraph: (base64Exprs: string) => void,
}

export default function GraphMenu({ importGraph }: GraphMenuProps) {
  const [open, setOpen] = React.useState(false);

  const onGraphSelect = (code: string) => () => {
    importGraph(code);
    setOpen(false); // close the menu when a graph is selected (and imported)
  };

  const examples = graphExamples.map(({ code, thumbnail, tooltip }) => {
    const absoluteThumb = `${imgPath}/${thumbnail}`;
    return (
      <ListItemButton className="graph-menu-item" onClick={onGraphSelect(code)}>
        <Avatar
          className="graph-example-thumbnail"
          src={absoluteThumb}
          variant="square"
        />
        <ListItemText>{tooltip}</ListItemText>
      </ListItemButton>
    );
  });

  return (
    <>
      <IconButton onClick={() => setOpen(true)}>
        <Menu htmlColor="lightgray" />
      </IconButton>
      <Drawer
        anchor="left"
        open={open}
        onClose={() => setOpen(false)}
      >
        <List subheader={<ListSubheader>Examples</ListSubheader>}>
          {examples}
        </List>
      </Drawer>
    </>
  );
}
