import * as yup from "yup";
export const OrchestratorSchema = yup.object().shape({
  name: yup.string().required("Required!"),
  conditionCheckTaskUrl: yup.string().url().required("Required!"),
  initialDelay: yup.number().integer().positive().moreThan(-1),
  fallbackTaskUrl: yup.string().url().required("Required!"),
  timeDelayForConditionCheck: yup.number().integer().positive().moreThan(-1),
  conditionCheckRetries: yup.number().integer().positive().moreThan(-1),
  timeDelayBetweenRetries: yup.number().integer().positive().moreThan(-1),
  numberofTasks: yup.number().integer().positive().moreThan(1),
});

//Task URL validations missing