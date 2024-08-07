import React, { Component } from 'react';
import { Container, Tab } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';
import './App.css';
import LoginPage from './components/LoginPage';
import mqtt from "./shared/mqtt";
import {kc} from "./components/UserManager";
import {getData, putData} from "./shared/tools";
import LiveProxy from "./components/LiveProxy";
import Encoders from "./components/Encoders";
//import Decoders from "./components/Decoders";
import Captures from "./components/Captures";
import Playouts from "./components/Playouts";
import Settings from "./components/Settings";
//import Workflow from "./components/Workflow";
import WebRTC from "./components/WebRTC";
import Galaxy from "./components/Galaxy";
import MediaProxy from "./components/MediaProxy";
import StreamProxy from "./components/StreamProxy";
//import UDP from "./components/UDP";

class App extends Component {

    state = {
        encoders:{},
        decoders:{},
        captures:{},
        playouts:{},
        workflows:{},
        restream:{},
        streamer:{},
        encoder_id: null,
        decoder_id: null,
        capture_id: null,
        playout_id: null,
        workflow_id: null,
        restream_id: null,
        shidur_admin: false,
        shidur_root: false,
        shidur_galaxy: false,
        shidur_stream: false,
        user: null,
    };

    checkPermission = (user) => {
        const shidur_admin = kc.hasRealmRole("shidur_admin");
        const shidur_root = kc.hasRealmRole("shidur_root");
        const shidur_galaxy = kc.hasRealmRole("shidur_galaxy");
        const shidur_stream = kc.hasRealmRole("shidur_stream");
        if(shidur_root || shidur_admin || shidur_galaxy || shidur_stream) {
            this.setState({user, shidur_admin, shidur_root, shidur_galaxy, shidur_stream});
            getData(`streamer`, (streamer) => {
                console.log(":: Got streamer: ",streamer);
                const {encoders,decoders,captures,playouts,workflows,restream} = streamer;
                this.setState({encoders,decoders,captures,playouts,workflows,restream,streamer});
                mqtt.init(user, (data) => {
                    console.log("[mqtt] init: ", data);
                    const watch = 'exec/service/data/#';
                    const local = true
                    const topic = local ? watch : 'bb/' + watch;
                    mqtt.join(topic);
                    mqtt.watch((message, topic) => {
                        this.cap?.onMqttMessage(message, topic);
                    }, false)
                })
            });
        } else {
            alert("Access denied!");
            kc.logout();
        }
    };

    getState = () => {
        getData(`streamer`, (streamer) => {
            console.log(":: Got streamer: ",streamer);
            const {encoders,decoders,captures,playouts,workflows,restream} = streamer;
            this.setState({encoders,decoders,captures,playouts,workflows,restream});
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

      const {user,shidur_admin,shidur_root,shidur_galaxy,shidur_stream,encoders,decoders,captures,playouts,workflows,restream,encoder_id,decoder_id,capture_id,playout_id,workflow_id,restream_id} = this.state;

      let login = (<LoginPage user={user} checkPermission={this.checkPermission} />);

      const panes = [
          { menuItem: { key: 'Home', icon: 'home', content: 'Home', disabled: false },
              render: () => <Tab.Pane attached={true} >{login}</Tab.Pane> },
          { menuItem: { key: 'mpx', icon: 'compress', content: 'MediaProxy', disabled: !shidur_root },
              render: () => <Tab.Pane attached={false} >
                  <MediaProxy jsonState={this.setJsonState}
                             idState={this.setIdState}
                             id={restream_id}
                             restream={restream} onRef={ref => (this.cap = ref)} />
              </Tab.Pane> },
          { menuItem: { key: 'restream', icon: 'sitemap', content: 'LiveProxy', disabled: !shidur_admin },
              render: () => <Tab.Pane attached={false} >
                  <LiveProxy jsonState={this.setJsonState}
                             idState={this.setIdState}
                             id={restream_id}
                             restream={restream} onRef={ref => (this.cap = ref)} />
              </Tab.Pane> },
          { menuItem: { key: 'stream', icon: 'rss', content: 'StreamProxy', disabled: !shidur_stream },
              render: () => <Tab.Pane attached={false} >
                  <StreamProxy jsonState={this.setJsonState}
                             idState={this.setIdState}
                             id={restream_id}
                             restream={restream} onRef={ref => (this.cap = ref)} />
              </Tab.Pane> },
          { menuItem: { key: 'galaxy', icon: 'users', content: 'Galaxy', disabled: !shidur_galaxy },
              render: () => <Tab.Pane attached={false} >
                  <Galaxy jsonState={this.setJsonState}
                          idState={this.setIdState}
                          id={encoder_id} shidur_galaxy={shidur_galaxy}
                          encoders={encoders} onRef={ref => (this.cap = ref)} />
              </Tab.Pane> },
          { menuItem: { key: 'encoder', icon: 'photo', content: 'Encoders', disabled: !shidur_root },
              render: () => <Tab.Pane attached={false} >
                  <Encoders jsonState={this.setJsonState}
                            idState={this.setIdState}
                            id={encoder_id} shidur_galaxy={shidur_galaxy}
                            encoders={encoders} onRef={ref => (this.cap = ref)} user={user} />
              </Tab.Pane> },
          // { menuItem: { key: 'decoder', icon: 'record', content: 'Decoders', disabled: !shidur_root },
          //     render: () => <Tab.Pane attached={false} >
          //         <Decoders jsonState={this.setJsonState}
          //                   idState={this.setIdState}
          //                   id={decoder_id}
          //                   decoders={decoders} />
          //     </Tab.Pane> },
          { menuItem: { key: 'capture', icon: 'film', content: 'Captures', disabled: !shidur_root },
              render: () => <Tab.Pane attached={false} >
                  <Captures jsonState={this.setJsonState}
                            idState={this.setIdState}
                            id={capture_id}
                            captures={captures} onRef={ref => (this.cap = ref)} />
              </Tab.Pane> },
          // { menuItem: { key: 'workflow', icon: 'hdd', content: 'Workflow', disabled: !shidur_root },
          //     render: () => <Tab.Pane attached={false} >
          //         <Workflow jsonState={this.setJsonState}
          //                   idState={this.setIdState}
          //                   id={workflow_id}
          //                   workflows={workflows} />
          //     </Tab.Pane> },
          { menuItem: { key: 'playout', icon: 'play', content: 'Playout', disabled: !shidur_root },
              render: () => <Tab.Pane attached={false} >
                  <Playouts jsonState={this.setJsonState}
                            idState={this.setIdState}
                            id={playout_id}
                            playouts={playouts} onRef={ref => (this.cap = ref)} />
              </Tab.Pane> },
          { menuItem: { key: 'webrtc', icon: 'globe', content: 'WebRTC', disabled: !shidur_root },
              render: () => <Tab.Pane attached={false} >
                  <WebRTC onRef={ref => (this.cap = ref)} />
              </Tab.Pane> },
          { menuItem: { key: 'settings', icon: 'settings', content: 'Settings', disabled: !shidur_root },
              render: () => <Tab.Pane attached={false} >
                  <Settings getState={this.getState}
                            encoders={encoders}
                            decoders={decoders}
                            captures={captures}
                            playouts={playouts}
                            workflows={workflows}/>
              </Tab.Pane> },
      ];

      const shidur_panes = panes.filter(p => !p.menuItem.disabled);

    return (
        <Container>
            <Tab menu={{ secondary: true, pointing: true, color: "blue"}} panes={shidur_panes} />
        </Container>
    );
  }
}

export default App;
