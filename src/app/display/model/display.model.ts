export class DisplayModel { 
  id: number;
  msaVersionId: number;
  moduleName: string;
  moduleDescription: string;
  moduleStatus: number;
  lockedOn: any;
  version: string;
  prevVersion: string;
  lockedBy: string;
  importedBy: string;
  importDate: any;
  teamId: number;
  workflowState: number;
  commonCmfVersion: any;
  commonTemplateTypeByTemplateTypeId: any;
  commandButtonList: CommandButton[]
  constantTextList: any;
  lineList: any;
  nonMenuEntryBoxList: any;
  pagePromptList: any;
  textBlockList: any;
}

export class CommandButton {
  id: number;
  name: string;
  action: string;
  height: number;
  breadth: number;
  coordX: string;
  coordY: string;
  sizeX: number;
  sizeY: number;
}