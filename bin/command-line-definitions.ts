import { OptionDefinition as ArgDefinition } from "command-line-args";
import { OptionDefinition as UsageDefinition, Section } from "command-line-usage";

export type CommandLineDefinition = ArgDefinition & UsageDefinition;

export const argDefinitions: Array<CommandLineDefinition> = [
    {
        name: 'path',
        type: String,
        defaultOption: true,
        typeLabel: '{underline string}',
        description: 'Path to a .pdb, .exe, or .dll file.',
    },
    {
        name: 'help',
        alias: 'h',
        type: Boolean,
        description: 'Print this usage guide.'
    },
];

export const usageDefinitions: Array<Section> = [
    {
        header: 'pdb-guid',
        content: 'A command line utility and library for reading the GUID of a .pdb, .exe, or .dll file.',
    },
    {
        header: 'Usage',
        optionList: argDefinitions
    },
    {
        header: 'Example',
        content: [
            'pdb-guid {italic path-to-exe-dll-or-pdb-file}',
        ]
    },
    {
        header: 'Links',
        content: 
        [
            '🐛 {underline https://bugsplat.com}',
            '',
            '💻 {underline https://github.com/BugSplat-Git/android-dump-syms}',
            '',
            '💌 {underline support@bugsplat.com}'
        ]
    }
];