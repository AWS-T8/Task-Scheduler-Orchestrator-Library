const { default: axios } = require("axios");
let key = "gUg7iNUNn4";
let args = process.argv.slice(2);
let len = args.length;
let URL = `http://localhost:3000/api/create/${key}`;
let status,
  link = "",
  id;
if (len === 1) {
  id = args[0];
  status = "failed";
} else {
  status = "completed";
  link = args[2];
  id = args[3];
}
URL += `?id=${id}&status=${status}&url=${link}`;
axios
  .get(URL)
  .then((res) => {
    console.log(res.data);
  })
  .catch((err) => console.log(err));
