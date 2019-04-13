import * as React from 'react';
import { makeStyles } from '@material-ui/styles';
import TextField from '@material-ui/core/TextField';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    marginBottom: "1.2em",
  },
  card: {
    textDecoration: "none",
  },
});

function AgifForm() {
  const classes = useStyles();
  const [values, setValues] = React.useState({
    url: '',//https://media.giphy.com/media/BSx6mzbW1ew7K/giphy.gif
    urlInvalid: false,
  });

  const handleChange = (name: string) => (event: any) => {
    if (name === "url") {
      if (/https?:\/\/(.+\..+|localhost).*/.test(event.target.value)) {
        setValues({...values, url: event.target.value, urlInvalid: false});
      } else {
        setValues({...values, url: event.target.value, urlInvalid: true});
      }
      return;
    }
    setValues({ ...values, [name]: event.target.value });
  };

  return (
    <>
      <form className={classes.container} onSubmit={e => {e.preventDefault(); return false;}}>
        <TextField
          label="Image URL"
          error={values.urlInvalid}
          onChange={handleChange('url')}
          value={values.url}
          variant="outlined"
          fullWidth={true}
          type="url"
        />
      </form>
      <a className={classes.card} style={{ display: values.url && !values.urlInvalid ? '' : 'none' }} target="_blank" href={"/page/split#" + values.url}>
        <Card square={true}>
          <CardContent>
            <Typography>split by JavaScript</Typography>
          </CardContent>
        </Card>
      </a>
      <a className={classes.card} style={{ display: values.url && !values.urlInvalid ? '' : 'none' }} target="_blank" href={"/page/frame/" + values.url}>
        <Card square={true}>
          <CardContent>
            <Typography>split</Typography>
          </CardContent>
        </Card>
      </a>
      <a className={classes.card} style={{ display: values.url && !values.urlInvalid ? '' : 'none' }} target="_blank" href={"/page/reverse#" + values.url}>
        <Card square={true}>
          <CardContent>
            <Typography>reverse by JavaScript</Typography>
          </CardContent>
        </Card>
      </a>
      <a className={classes.card} style={{ display: values.url && !values.urlInvalid ? '' : 'none' }} target="_blank" href={"/gif/playback/" + values.url}>
        <Card square={true}>
          <CardContent>
            <Typography>playback</Typography>
          </CardContent>
        </Card>
      </a>
    </>
  );
}

export default AgifForm;
