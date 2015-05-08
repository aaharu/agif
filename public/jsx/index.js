
'use strict';

var AgifPanels = React.createClass({
  render: function () {
    if (!this.props.url) {
      return null;
    }
    return (
      <div className="pure-u-1 results">
        <div className="pure-u-1-4 bg-split">
          <a target="_blank" href={"/page/split#" + this.props.url}>split by JavaScript<br /><small>HTML</small></a>
        </div><div className="pure-u-1-4 bg-frame">
          <a target="_blank" href={"/page/frame/" + this.props.url}>split by ImageMagick<br /><small>HTML</small></a>
        </div><div className="pure-u-1-4 bg-reverse">
          <a target="_blank" href={"/page/reverse#" + this.props.url}>reverse by JavaScript<br /><small>HTML</small></a>
        </div><div className="pure-u-1-4 bg-playback">
          <a target="_blank" href={"/gif/playback/" + this.props.url}>playback by ImageMagick<br /><small>GIF</small></a>
        </div>
      </div>
    );
  }
});

var AgifForm = React.createClass({
  getInitialState: function () {
    return {url: ""};
  },
  handleChange: function (event) {
    this.setState({url: event.target.value});
  },
  render: function () {
    return (
      <div>
        <form className="pure-form pure-u-1" onChange={this.handleChange}>
          <input className="pure-input-1" type="text" placeholder="Enter an animated gif url" />
        </form>
        <br />
        <AgifPanels url={this.state.url} />
      </div>
    );
  }
});

React.render(<AgifForm />, document.getElementById("content"));
