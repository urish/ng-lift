#!/usr/bin/env node

import * as program from 'commander';
import * as fs from 'fs';
import * as updateNotifier from 'update-notifier';

import { ITemplateUpgradeOptions, upgradeTemplate } from './template-transforms';

// tslint:disable:no-console

// tslint:disable-next-line:no-var-requires
const pkg = require('../package.json');
updateNotifier({pkg}).notify();

function templateHandler(input: string, opts: {[key: string]: any}) {
    const options: Partial<ITemplateUpgradeOptions> = {};
    if (opts.controller) {
        options.controllerVars = opts.controller.split(',');
    }
    const result = upgradeTemplate(fs.readFileSync(input, 'utf-8'), options);
    if (opts.output) {
        fs.writeFileSync(opts.output, result, 'utf-8');
    } else {
        console.log(result);
    }
}

program
    .version(pkg.version)
    .command('template <source.html>')
    .option('-o, --output <filename.html>', 'Specify output filename')
    .option('-c, --controller <ctrlNames>', 'Comma-separated list of controller names (default: $ctrl)')
    .action(templateHandler);

program
    .action(() => {
        program.help();
    });

program
    .parse(process.argv);

if (program.args.length < 1) {
    program.help();
}
