[![bugsplat-github-banner-basic-outline](https://user-images.githubusercontent.com/20464226/149019306-3186103c-5315-4dad-a499-4fd1df408475.png)](https://bugsplat.com)
<br/>
# <div align="center">BugSplat</div> 
### **<div align="center">Crash and error reporting built for busy developers.</div>**
<div align="center">
    <a href="https://twitter.com/BugSplatCo">
        <img alt="Follow @bugsplatco on Twitter" src="https://img.shields.io/twitter/follow/bugsplatco?label=Follow%20BugSplat&style=social">
    </a>
    <a href="https://discord.gg/bugsplat">
        <img alt="Join BugSplat on Discord" src="https://img.shields.io/discord/664965194799251487?label=Join%20Discord&logo=Discord&style=social">
    </a>
</div>

<br/>

# pdb-guid

A nifty little library for reading unique identifiers from pdb, exe, and dll files.

## Command Line

1. Install this package globally `npm i -g @bugsplat/symbol-upload`
2. Run symbol-upload with `-h` to see the latest usage information:

```bash
bobby@BugSplat % ~ % pdb-guid -h

pdb-guid

  A command line utility and library for reading the GUID of a .pdb, .exe, or   
  .dll file.                                                                    

Usage

  --path string   Path to a .pdb, .exe, or .dll file. 
  -h, --help      Print this usage guide.             

Example

  pdb-guid path-to-exe-dll-or-pdb-file 

Links

  🐛 https://bugsplat.com                     
                                              
  💻 https://github.com/BugSplat-Git/pdb-guid 
                                              
  💌 support@bugsplat.com 
```

3. Run pdb-guid specifying a path to a pdb, exe, or dll file:

```bash
bobby@BugSplat % ~ % pdb-guid ./path/to/bugsplat.pdb
E546B55B6D214E86871B40AC35CD0D461
```

## API

1. Install this package locally `npm i @bugsplat/pdb-guid`.
2. Create a new instance of `PdbFile` by awaiting a call to the static factory function `PdbFile.createFromFile`. This method accepts files with a `.pdb` extension.

```ts
const pdbFile = await PdbFile.createFromFile('./path/to/bugsplat.pdb');
```

3. Create a new instance of `PeFile` by awaiting a call to the static factory function `PeFile.createFromFile`. This method accepts files with a `.exe` or `.dll` extension. 

```ts
const peFile = await PeFile.createFromFile('./path/to/bugsplat.exe');
```

4. The `guid` property of `PdbFile` and `PeFile` instances will contain the unique identifier for the file.

```ts
const guid = pdbFile.guid;
```

## 🐛 About

[BugSplat](https://bugsplat.com) is a software crash and error reporting service with support for [Windows Native C++](https://docs.bugsplat.com/introduction/getting-started/integrations/desktop/cplusplus), [Qt](https://docs.bugsplat.com/introduction/getting-started/integrations/cross-platform/qt), [Unreal Engine](https://docs.bugsplat.com/introduction/getting-started/integrations/game-development/unreal-engine) and [many more](https://docs.bugsplat.com/introduction/getting-started/integrations). BugSplat automatically captures critical diagnostic data such as stack traces, log files, and other runtime information. BugSplat also provides automated incident notifications, a convenient dashboard for monitoring trends and prioritizing engineering efforts, and integrations with popular development tools to maximize productivity and ship more profitable software.
