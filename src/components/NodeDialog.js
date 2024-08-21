import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import NodeDetails from './NodeDetails';

const NodeDialog = ({ nodeData, relatedDocuments, dialogLoading, globalFilter, setGlobalFilter }) => {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button variant="outlined" color="primary" onClick={handleClickOpen}>
        Open Node Details
      </Button>
      <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
        <DialogTitle>Node Details</DialogTitle>
        <DialogContent>
          <NodeDetails
            nodeData={nodeData}
            relatedDocuments={relatedDocuments}
            dialogLoading={dialogLoading}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default NodeDialog;