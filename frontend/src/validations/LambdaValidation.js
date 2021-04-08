import * as yup from "yup";
const FILE_SIZE = 2000000;
export const lambdaSchema = yup.object().shape({
  lambdaName: yup.string().required("Required!"),
  handlerName: yup.string().required("Required!"),
  runtime: yup.string().required("Required!"),
  lambdaHandlerFile: yup
    .mixed()
    .test(
      "fileSize",
      "File Size is too large",
      (value) => value.size <= FILE_SIZE
    )
    .required("Required!"),
  requirementFile: yup
    .mixed()
    .test(
      "fileSize",
      "File Size is too large",
      (value) => value.size <= FILE_SIZE
    )
    .required("Required!"),
});
