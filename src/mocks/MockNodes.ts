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
import * as should from 'should';
import * as NodeRed from '../../typings/nodered';

// Don't need test coverage for the mock classes.
/* istanbul ignore next */

export class MockNodes implements NodeRed.Nodes
{
    private nodes: NodeRed.Node[] = [];
    private credentials: NodeRed.Node[] = [];

    constructor()
    {
    }

    public addNode(node: NodeRed.Node)
    {
        this.nodes[node.id] = node;
    }

    public createNode(node: NodeRed.Node, config: any)
    {
        if (this.credentials[config.id]) {
            node.credentials = this.credentials[config.id];
        }
        else {
            node.credentials = {}
        }
    }

    public getNode(id: string)
    {
        return this.nodes[id];
    }

    public registerType(nodeType: string, constructor: (configuration: any) => void, opts?: any)
    {

    }

    public addCredentials(id: string, creds: any)
    {
        this.credentials[id] = creds;
    }

}
