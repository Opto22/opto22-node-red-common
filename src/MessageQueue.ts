/*
   Copyright 2016-2019 Opto 22

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

import * as NodeRed from '../typings/nodered';

/**
 * Function pointer definition for Node msg 'input' event handlers.
 */
export interface MsgInputFunc 
{
    (msg: any): void;
}

export interface MessageHolder
{
    msg: any;
    node: NodeRed.Node;
    inputEventObject: any; // the object on which to call the callback.
    inputEventCallback: MsgInputFunc;
}

export type FullQueueBehaviorType = 'REJECT_NEW' | 'DROP_OLD';

/**
 * Class for throttling messages associated with an external resource.
 * The owner of the queue can manage the relationship between its resource and the queue.
 * The SNAP PAC nodes need it so that we can control certain error conditions, and also not overwhelm a 
 * slower controller when using HTTPS.
 */
export default class MessageQueue
{
    // The queue, as an array.
    private queue: MessageHolder[] = [];

    // The maximum length of this queue.
    private maxLength: number;

    // The current message.
    private currentMessage: MessageHolder = null;

    // Map of nodes (node.id) to message count.
    private numMessagesPerNode: number[] = [];

    private fullQueueBehaviorType: FullQueueBehaviorType;

    constructor(maxLength: number, fullQueueBehaviorType?: FullQueueBehaviorType)
    {
        this.maxLength = maxLength;
        this.fullQueueBehaviorType = fullQueueBehaviorType || 'REJECT_NEW';
    }

    /**
     * Empty the queue.
     */
    public dump()
    {
        this.queue = [];
    }

    /**
     * Returns the current message.
     */
    public getCurrentMessage(): MessageHolder
    {
        return this.currentMessage;
    }

    /**
     * Adds a message for the given node.
     */
    public add(msg: any, node: NodeRed.Node, inputEventObject: any, inputEventCallback: MsgInputFunc): number
    {
        // See if the queue is full.
        if (this.queue.length >= this.maxLength) {
            // Should we drop the new message, or the oldest in the queue?
            if (this.fullQueueBehaviorType == 'REJECT_NEW') {
                return -1;
            }
            else if (this.fullQueueBehaviorType == 'DROP_OLD') {
                // Remove the oldest message
                let msgRemoved = this.queue.shift();

                // Decrement the node's counter for the removed message.
                if (this.numMessagesPerNode[msgRemoved.node.id] !== undefined) {
                    this.numMessagesPerNode[msgRemoved.node.id] =
                        this.numMessagesPerNode[msgRemoved.node.id] - 1;
                }
            }
        }

        // Initialize and/or increment the count of messages for this node.
        this.numMessagesPerNode[node.id] = (this.numMessagesPerNode[node.id] || 0) + 1;

        var messageHolder = { msg: msg, node: node, inputEventObject: inputEventObject, inputEventCallback: inputEventCallback };

        // See if the message can be processed immediately.
        var messageSentImmediately = false;
        if (this.currentMessage === null) {

            messageSentImmediately = true;
            this.currentMessage = messageHolder;

            setImmediate(() =>
            {
                inputEventCallback.call(inputEventObject, msg);
            });
        }
        else {
            this.queue.push(messageHolder);
        }

        // Return the remaining number of queued messages for this node, not including
        // the message that might have been sent immediately.
        // This will be 0 if the node was immediately processed.
        return this.numMessagesPerNode[node.id] - (messageSentImmediately ? 1 : 0);
    }

    /**
     *  Must be called by the node handler when it's done with the message.
     */
    public done(delay: number): number
    {
        var node = this.currentMessage.node;
        this.numMessagesPerNode[node.id] = this.numMessagesPerNode[node.id] - 1;

        this.currentMessage = null;

        // See if there's another message to be handled.
        if (this.queue.length > 0) {

            var next: MessageHolder = this.queue.shift();
            this.currentMessage = next;

            // TODO: setImmediate() or process.nextTick() might be better when delay === 0.
            setTimeout(() =>
            {
                // Call the callback, on the given object and passing in the message.
                next.inputEventCallback.call(next.inputEventObject, next.msg);
            }, delay);
        }

        return this.numMessagesPerNode[node.id]; // return the remaining number of queued messages for this node
    }

    public getNumMessagesForNode(nodeId: string): number
    {
        return this.numMessagesPerNode[nodeId] || 0;
    }
}
