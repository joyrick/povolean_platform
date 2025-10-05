export const NodeKinds = {
  // Core nodes
  PROMPT: 'promptNode',
  LLM_OPENAI: 'openaiNode',
  LLM_GEMINI: 'geminiNode',
  ORCHESTRATOR: 'orchestratorNode',
  OUTPUT: 'outputViewerNode',
  
  // Trigger nodes
  TRIGGER_NEW_PROJECT: 'triggerNewProjectNode',
  TRIGGER_SCHEDULE_UPDATE: 'triggerScheduleUpdateNode',
  TRIGGER_BIM_REVISION: 'triggerBimRevisionNode',
  TRIGGER_COST_UPDATE: 'triggerCostUpdateNode',
  TRIGGER_DEADLINE: 'triggerDeadlineNode',
  TRIGGER_FORM_SUBMIT: 'triggerFormSubmitNode',
  TRIGGER_INSPECTION: 'triggerInspectionNode',
  TRIGGER_SAFETY_INCIDENT: 'triggerSafetyIncidentNode',
  TRIGGER_COMMENT: 'triggerCommentNode',
  
  // Action nodes
  ACTION_AUTO_FILL_PERMIT: 'actionAutoFillPermitNode',
  ACTION_EXTRACT_BIM_DATA: 'actionExtractBimDataNode',
  ACTION_UPDATE_SCHEDULE: 'actionUpdateScheduleNode',
  ACTION_PUSH_TO_SHEETS: 'actionPushToSheetsNode',
  ACTION_SEND_APPROVAL: 'actionSendApprovalNode',
  ACTION_GENERATE_REPORT: 'actionGenerateReportNode',
  ACTION_UPLOAD_DOCS: 'actionUploadDocsNode',
  ACTION_SYNC_COST_DATA: 'actionSyncCostDataNode',
  ACTION_NOTIFY_STAKEHOLDERS: 'actionNotifyStakeholdersNode',
  ACTION_CREATE_TASK: 'actionCreateTaskNode'
};

export const defaultNodes = [
  // Sample construction workflow
  {
    id: 'trigger-newProject-1',
    type: NodeKinds.TRIGGER_NEW_PROJECT,
    position: { x: 100, y: 100 },
    data: { type: 'newProject', config: { source: 'Revit/Archicad' } }
  },
  {
    id: 'action-extractData-1',
    type: NodeKinds.ACTION_EXTRACT_BIM_DATA,
    position: { x: 400, y: 100 },
    data: { type: 'extractBimData', config: { target: 'Database', format: 'JSON/CSV' } }
  },
  {
    id: 'action-autoFillPermit-1',
    type: NodeKinds.ACTION_AUTO_FILL_PERMIT,
    position: { x: 700, y: 100 },
    data: { type: 'autoFillPermit', config: { target: 'Building Authority Portal', template: 'Standard Permit' } }
  },
  
  // Sample inspection workflow
  {
    id: 'trigger-inspection-1',
    type: NodeKinds.TRIGGER_INSPECTION,
    position: { x: 100, y: 300 },
    data: { type: 'inspection', config: { source: 'Inspection System' } }
  },
  {
    id: 'action-generateReport-1',
    type: NodeKinds.ACTION_GENERATE_REPORT,
    position: { x: 400, y: 300 },
    data: { type: 'generateReport', config: { target: 'PDF Report', template: 'Compliance Template' } }
  },
  {
    id: 'action-notify-1',
    type: NodeKinds.ACTION_NOTIFY_STAKEHOLDERS,
    position: { x: 700, y: 300 },
    data: { type: 'notifyStakeholders', config: { target: 'Team Members', template: 'Notification' } }
  }
];

export const defaultEdges = [
  // Construction project workflow
  { id: 'e-newProject-extractData', source: 'trigger-newProject-1', target: 'action-extractData-1' },
  { id: 'e-extractData-autoFill', source: 'action-extractData-1', target: 'action-autoFillPermit-1' },
  
  // Inspection workflow  
  { id: 'e-inspection-report', source: 'trigger-inspection-1', target: 'action-generateReport-1' },
  { id: 'e-report-notify', source: 'action-generateReport-1', target: 'action-notify-1' }
];