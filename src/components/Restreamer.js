import React, {Component} from 'react'
import { Divider, Segment, Label, Input, Button, Select } from 'semantic-ui-react'
import {getRstrData, putRstrData} from "../shared/tools";
import Streams from "./Streams";

class Restreamer extends Component {

    state = {
        name: "",
        language: "heb",
        url: "",
        db: {
            restream: []
        }
    };

    componentDidMount() {
        getRstrData(db => {
            console.log(":: Got restream: ",db);
            this.setState({db});
        });
    };

    addRestream = (del) => {
        let {db,name,language,url} = this.state;
        db.restream.push({name,language,url});
        this.saveData(db);
    };

    saveData = (db) => {
        putRstrData(db, (data) => {
            console.log(" :: Save restream callback: ", data);
            this.setState({db});
        });
    };

    render() {

        const {db,name,language} = this.state;

        const options = [
            { key: 'heb', text: 'Hebrew', value: 'heb' },
            { key: 'rus', text: 'Russian', value: 'rus' },
            { key: 'eng', text: 'English', value: 'eng' },
            { key: 'spa', text: 'Spanish', value: 'spa' },
            { key: 'fre', text: 'French', value: 'fre' },
            { key: 'ita', text: 'Italian', value: 'ita' },
            { key: 'ger', text: 'German', value: 'ger' },
            { key: 'por', text: 'Portuguese', value: 'por' },
            { key: 'ukr', text: 'Ukraine', value: 'ukr' },
        ];

        let streams = db.restream.map((stream,i) => {
            return (<Streams key={i} index={i} {...this.state} saveData={this.saveData} />);
        });

        return(
            <Segment padded textAlign='center' color='brown'>
                <Label size='big' >
                    <Select compact options={options} value={language} size='big'
                            onChange={(e, {value}) => this.setState({language: value})} />
                    <Input type='text' placeholder='Type name...'
                           value={name} action
                           onChange={e => this.setState({name: e.target.value})}>
                        <input />
                        <Button size='big' color='green' onClick={this.addRestream}>Add</Button>
                    </Input>
                </Label>
                <Divider />
                {streams}
            </Segment>
        );
    }
}

export default Restreamer;