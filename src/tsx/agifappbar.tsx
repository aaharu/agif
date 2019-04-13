import * as React from 'react';
import * as PropTypes from 'prop-types';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

const styles = {
  root: {
    flexGrow: 1,
  },
};

export interface Props extends WithStyles<typeof styles> {}

function AgifAppBar(props: Props) {
  const { classes } = props;

  return (
    <div className={classes.root}>
      <AppBar position="relative">
        <Toolbar>
          <Typography variant="h5" color="inherit">
            agif
          </Typography>
        </Toolbar>
      </AppBar>
    </div>
  );
}

AgifAppBar.propTypes = {
  classes: PropTypes.object.isRequired,
} as any;

export default withStyles(styles)(AgifAppBar);
