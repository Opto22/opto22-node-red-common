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
import * as fs from 'fs';
import * as path from 'path';
import * as NodeRed from '../typings/nodered';
import { SystemType } from './SystemType';

export function getCertFile(globalRED: NodeRed.RED, certPath: string): Buffer
{
    if (certPath && certPath.length > 0)
    {
        // See if we have an absolute or relative path
        if (!path.isAbsolute(certPath))
        {
            if (SystemType.isSystemGroovEpic())
            {
                // On EPIC, the path is fixed.
                certPath = path.join('/usr/lib/ssl/certs/', certPath);
            }
            else if (SystemType.isSystemGroovRio())
            {
                // On RIO, the path is fixed.
                // Although the user probably doesn't need to even enter it,
                // since RIO imports certifcates into the central store.
                // But just in case they give us a file name, we'll use it.
                certPath = path.join('/usr/local/share/ca-certificates/', certPath);
            }
            else
            {
                // On AR1, start from Node-RED's userDir + "/certs".
                certPath = path.join(globalRED.settings.userDir, 'certs', certPath);
            }
        }

        return fs.readFileSync(certPath);
    }

    return null;
}
