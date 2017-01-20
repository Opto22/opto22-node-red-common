/*
   Copyright 2016 Opto 22

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

var NodeRedUtil = require('node-red/red/runtime/util'); // the real Node-RED util code
import * as NodeRed  from '../../typings/nodered';
import { MockNodes } from './MockNodes';
import * as EventEmitter from 'events';

// Don't need test coverage for the mock classes.
/* istanbul ignore next */

export class MockRed implements NodeRed.RED
{
    // null properties, empty for now.
    auth: any;
    comms: any; 
    events: EventEmitter;
    httpAdmin: any;
    httpNode: any;
    library: any;
    server: any;
    version: any;

    nodes: MockNodes;
    util: NodeRed.Util;
    log: NodeRed.Log;
    settings: {
        userDir: string; // Just making the compiler happy.
    }

    constructor()
    {
        this.util = NodeRedUtil;
        this.nodes = new MockNodes();
        this.events = new EventEmitter();
        this.settings = {
            userDir: ''
        }
    }
}
