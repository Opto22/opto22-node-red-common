import fs = require('fs');

let isGroovBox: boolean;
let isGroovEpic: boolean;

export class SystemType
{
    static isSystemGroovBox()
    {
        if (isGroovBox === undefined) {
            // Look for some obvious marks of a groov Box. This is probably overkill.
            var hasMmpServer = fs.existsSync("/etc/init.d/mmpserver");
            var hasSupervisor = fs.existsSync("/usr/sbin/supervisor-get-serial-number");
            var hasOptoapps = fs.existsSync("/var/lib/jetty/optoapps");

            isGroovBox = hasMmpServer && hasSupervisor && hasOptoapps;
        }

        return isGroovBox;
    }

    static isSystemGroovEpic()
    {
        if (isGroovEpic === undefined) {
            // Look for some obvious marks of an EPIC box.
            var hasOptoApps = fs.existsSync("/usr/share/nxtio/");

            isGroovEpic = hasOptoApps;
        }

        return isGroovEpic;
    }
}