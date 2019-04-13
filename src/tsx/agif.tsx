import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import AgifAppBar from './agifappbar';
import AgifForm from './agifform';

export default function Agif() {
  return (
    <Grid container justify="center" spacing={5}>
      <Grid item xs={12}>
        <AgifAppBar />
      </Grid>
      <Grid item xs={12}>
        <AgifForm />
      </Grid>
    </Grid>
  );
};
