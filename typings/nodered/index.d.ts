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

import * as events from 'events';

/** 
 * A meager collection of Node-RED types for TypeScript.
 * Not much more than what the Opto 22 nodes need.
 */
export interface NodeConfiguration
{
    id: string;
    type: string;
}

// https://github.com/node-red/node-red/blob/master/red/runtime/nodes/Node.js
export interface Node extends NodeConfiguration
{
    id: string;
    type: string;
    z: string;
    credentials: any;

    // Functions are marked optional so that mock nodes can 
    // be easily made.
    on(type: string, callback: () => void): void;
    on(type: 'input', callback: (msg?: any) => void): void;
    on(type: 'close', callback: (done?: Function) => void): void;
    error(errorText: any, nodeMessage: any): void;
    warn(text: string): void;
    log(text: string): void;
    status(statusObj: any): void;
    send(nodeMessage: any): void;
}

// https://github.com/node-red/node-red/blob/master/red/runtime/nodes/index.js
export class Nodes
{
    createNode(node: Node, config: any): void;
    getNode(id: string): Node;
    registerType(nodeType: string, constructor: (configuration: any) => void, opts?: any): void;
}

// https://github.com/node-red/node-red/blob/master/red/runtime/log.js
export class Log
{
    log(msg: string): void;
    info(msg: string): void;
    warn(msg: string): void;
    error(msg: string): void;
    trace(msg: string): void;
    debug(msg: string): void;
    metric(msg: string): void;
}

// https://github.com/node-red/node-red/blob/master/red/runtime/util.js
export class Util
{
    cloneMessage(msg: any): any;
    compareObjects(obj1: any, obj2: any): boolean;
    generateId(): string;
    getMessageProperty(msg: any, expr: string): void;
    setMessageProperty(msg: any, property: string, value: any, createMissing?: boolean): void | null;
    evaluateNodeProperty(value: any, type: string, node: Node, msg: any): any;
}

// https://github.com/node-red/node-red/blob/master/red/red.js
export interface RED
{
    auth: {
        needsPermission(permission: any) : any; // TODO review
    }

    comms: {
        publish(topic: any, data: any, retain: any) : any; // TODO review
    }

    events: events.EventEmitter;

    httpAdmin(req: any, res: any, next: any) : any; // TODO review

    httpNode(req: any, res: any, next: any) : any; // TODO review

    library: {
        register(type: any) : any; // TODO review
    }

    log: Log;

    nodes: Nodes;

    server: any; // TODO review

    settings: {
        userDir: string;
        // TODO much more to add
    };

    util: Util;

    version() : string;
}

