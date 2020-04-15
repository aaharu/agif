import * as React from "react";
import { withStyles, WithStyles, createStyles } from "@material-ui/core/styles";
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";

interface OwnProps {
  hoge: string;
}

const styles = (theme: Theme) => {
  return createStyles({
    layout: {
      maxWidth: 1200,
      [theme.breakpoints.up(1200)]: {
        marginLeft: "auto",
        marginRight: "auto",
      },
    },
  });
};

type Props = OwnProps & WithStyles<typeof styles>;

const AgifAppBar: React.FunctionComponent<Props> = (props: Props) => {
  const { classes } = props;

  return (
    <div className={classes.layout}>
      <AppBar position="relative">
        <Toolbar>
          <Typography variant="h5" color="inherit">
            agif
          </Typography>
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default withStyles(styles)(AgifAppBar);
