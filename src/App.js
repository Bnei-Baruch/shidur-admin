import React, { Component } from 'react';
import { Container, Tab } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';
import './App.css';
import {getData, putData} from "./shared/tools";
import Encoders from "./components/Encoders";
import Decoders from "./components/Decoders";
import Captures from "./components/Captures";
import Playouts from "./components/Playouts";
import Settings from "./components/Settings";
import Workflow from "./components/Workflow";
//import UDP from "./components/UDP";

class App extends Component {

    state = {
        encoders:{},
        decoders:{},
        captures:{},
        playouts:{},
        workflows:{},
        encoder_id: null,
        decoder_id: null,
        capture_id: null,
        playout_id: null,
        workflow_id: null,
    };

    componentDidMount() {
        getData(`streamer`, (streamer) => {
            console.log(":: Got streamer: ",streamer);
            const {encoders,decoders,captures,playouts,workflows} = streamer;
            this.setState({encoders,decoders,captures,playouts,workflows});
        });
    };

    getState = () => {
        getData(`streamer`, (streamer) => {
            console.log(":: Got streamer: ",streamer);
            const {encoders,decoders,captures,playouts,workflows} = streamer;
            this.setState({encoders,decoders,captures,playouts,workflows});
        });
    };

    setJsonState = (stkey, stvalue, stid) => {
        this.setState({[stkey]:{...this.state[stkey]}});
        let json = stvalue[stid];
        console.log(":: Got JsonState", json);
        putData(`streamer/${stkey}/${stid}`, json, (cb) => {
            console.log(":: Save JsonState", cb);
        })
    };

    setIdState = (idkey, idvalue) => {
        console.log(":: Got idState", idkey, idvalue);
        this.setState({[idkey]: idvalue});
    };

  render() {

      const {encoders,decoders,captures,playouts,workflows,encoder_id,decoder_id,capture_id,playout_id,workflow_id} = this.state;

      const panes = [
          { menuItem: { key: 'encoder', icon: 'photo', content: 'Encoders' },
              render: () => <Tab.Pane attached={true} >
                  <Encoders jsonState={this.setJsonState}
                            idState={this.setIdState}
                            id={encoder_id}
                            encoders={encoders} />
              </Tab.Pane> },
          { menuItem: { key: 'decoder', icon: 'record', content: 'Decoders' },
              render: () => <Tab.Pane attached={false} >
                  <Decoders jsonState={this.setJsonState}
                            idState={this.setIdState}
                            id={decoder_id}
                            decoders={decoders} />
              </Tab.Pane> },
          { menuItem: { key: 'capture', icon: 'film', content: 'Captures' },
              render: () => <Tab.Pane attached={false} >
                  <Captures jsonState={this.setJsonState}
                            idState={this.setIdState}
                            id={capture_id}
                            captures={captures} />
              </Tab.Pane> },
          { menuItem: { key: 'workflow', icon: 'hdd', content: 'Workflow' },
              render: () => <Tab.Pane attached={false} >
                  <Workflow jsonState={this.setJsonState}
                            idState={this.setIdState}
                            id={workflow_id}
                            workflows={workflows} />
              </Tab.Pane> },
          { menuItem: { key: 'playout', icon: 'play', content: 'Playout' },
              render: () => <Tab.Pane attached={false} >
                  <Playouts jsonState={this.setJsonState}
                            idState={this.setIdState}
                            id={playout_id}
                            playouts={playouts} />
              </Tab.Pane> },
          { menuItem: { key: 'settings', icon: 'settings', content: 'Settings' },
              render: () => <Tab.Pane attached={false} >
                  <Settings getState={this.getState}
                            encoders={encoders}
                            decoders={decoders}
                            captures={captures}
                            playouts={playouts}
                            workflows={workflows}/>
              </Tab.Pane> },
          // { menuItem: { key: 'udp', icon: 'network', content: 'UDP' },
          //     render: () => <Tab.Pane attached={false} >
          //         <UDP id={null} />
          //     </Tab.Pane> },
      ];

    return (
        <Container text>
            <Tab menu={{ secondary: true, pointing: true, color: "blue"}} panes={panes} />
        </Container>
    );
  }
}

export default App;
