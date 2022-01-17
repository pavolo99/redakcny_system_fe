import React, {forwardRef} from "react";
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

export function MuiMessage({severity, open, onCloseMuiMessage, message}) {

  const Alert = forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  return (
      <Snackbar autoHideDuration={6000} open={open} onClose={onCloseMuiMessage}>
        <Alert onClose={onCloseMuiMessage} severity={severity}>
          {message}
        </Alert>
      </Snackbar>
  );
}
