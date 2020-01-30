import child_process = require('child_process');
import fs = require('fs');
import os = require('os');

let isGroovBox: boolean = false;
let isGroovEpic: boolean = false;
let isGroovRio: boolean = false;

function updateSystemInfo()
{
    if (os.type() === 'Linux') {
        // Look for some obvious marks of a groov Box. This is probably overkill.
        var hasMmpServer = fs.existsSync("/etc/init.d/mmpserver");
        var hasSupervisor = fs.existsSync("/usr/sbin/supervisor-get-serial-number");
        var hasOptoapps = fs.existsSync("/var/lib/jetty/optoapps");

        isGroovBox = hasMmpServer && hasSupervisor && hasOptoapps;

        // Look for some obvious marks of an EPIC or RIO box.
        var hasNxtioApps = fs.existsSync("/usr/share/nxtio/");

        if (hasNxtioApps) {
            try {
                let output = child_process.execSync('lsb_release -i -s',
                    {
                        encoding: 'utf8',
                        stdio: ['pipe', 'pipe', 'ignore'] // don't dump errors to the console.
                    });

                output = output.trim();

                if (output.indexOf('grv-r7') == 0) {
                    isGroovRio = true;
                }
                else if (output.indexOf('grv-pr') == 0) {
                    isGroovEpic = true;
                }
            }
            catch (error) {
                // Something without lsb_release
            }
        }

    }
    else {
        isGroovBox = false; // AR1 or AT1
        isGroovEpic = false;
        isGroovRio = false;
    }

    // console.log('isGroovBox = ' + JSON.stringify(isGroovBox, undefined, 2));
    // console.log('isGroovEpic = ' + JSON.stringify(isGroovEpic, undefined, 2));
    // console.log('isGroovRio = ' + JSON.stringify(isGroovRio, undefined, 2));
}

updateSystemInfo(); // go ahead and just run it now.

export class SystemType
{
    static isSystemGroovBox()
    {
        return isGroovBox;
    }

    static isSystemGroovEpic()
    {
        return isGroovEpic;
    }

    static isSystemGroovRio()
    {
        return isGroovEpic;
    }
}