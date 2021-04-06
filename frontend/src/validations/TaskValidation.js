import * as yup from "yup";
export const taskSchema = yup.object().shape({
  name: yup.string().required("Required!"),
  url: yup.string().url().required("Required!"),
  timeDelay: yup.date(),
  retryCount: yup
    .number()
    .integer("Has to be a Integer!")
    .positive("Postive Values Only!")
    .moreThan(-1)
    .max(100),
  retryAfter: yup
    .number()
    .integer("Has to be a Integer!")
    .positive("Postive Values Only!")
    .moreThan(-1),
});
