import { React, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import SmoothImage from "react-smooth-image";
import FormImage from "../assets/static/create-task-image.png";
import axios from "axios";
import Loader from "react-loader-spinner";
import env from "react-dotenv";
import { taskSchema } from "../validations/TaskValidation";
//Notifications
import notify from "./Helpers/Notification";
import QueryParamsComp from "./Helpers/QueryParamsComp";
import AddIcon from "@material-ui/icons/Add";
import AvTimerIcon from "@material-ui/icons/AvTimer";

const format = (str) => {
  if (str.length < 2) {
    return "0" + str;
  }
  return str;
};

const CreateTask = (props) => {
  const currentDate = new Date();
  const yyyy = format(currentDate.getFullYear().toString());
  const mm = format((currentDate.getMonth() + 1).toString());
  const dd = format(currentDate.getDate().toString());
  const hh = format(currentDate.getHours().toString());
  const min = format(currentDate.getMinutes().toString());
  const sec = format(currentDate.getSeconds().toString());
  const history = useHistory();

  const minValueDate = `${yyyy}-${mm}-${dd}`.toString();
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [showLoader, setShowLoader] = useState(false);
  const [date, setdate] = useState(`${yyyy}-${mm}-${dd}`);
  const [time, settime] = useState(`${hh}:${min}:${sec}`);
  const [retryCount, setretryCount] = useState(0);
  const [retryAfter, setRetryAfter] = useState(0);
  const userLogin = useSelector((state) => state.userLogin);
  const [queryParamsCount, setQueryParamsCount] = useState(0);
  const [queryParams, setQueryParams] = useState([]);
  const [displayQueryOptions, setDisplayQueryOptions] = useState(null);
  const [urlMatchStatus, setUrlMatchStatus] = useState(null);

  const changeUrlHandler = async () => {
    if (url.length === 0) {
      setUrlMatchStatus(null);
      return;
    }
    const checkUrl = url;
    const regexp = new RegExp(
      "((http|https)://)([a-zA-Z0-9]{1,})(.execute-api.)([a-zA-Z0-9-]{1,})(.amazonaws.com/)([a-zA-Z0-9_-]{1,})(/)([a-zA-Z0-9_]{1,})",
      "g"
    );
    const newmatches = regexp.exec(checkUrl);
    if (!newmatches || newmatches[0] !== checkUrl) {
      setUrlMatchStatus(
        <p className="text-red-500">
          This does not seem to be a valid AWS Lambda URL
        </p>
      );
    } else {
      let restId = await newmatches[3];
      let location = await newmatches[5];
      let stageName = await newmatches[7];
      let funcName = await newmatches[9];
      setUrlMatchStatus(
        <div className="text-blue-400">
          <p>REST ID: {restId}</p>
          <p>Location: {location}</p>
          <p>Stage Name: {stageName}</p>
          <p>Function Name: {funcName}</p>
        </div>
      );
    }
  };

  useEffect(() => {
    changeUrlHandler();
  }, [url]);

  const addQueryParamHandler = (e) => {
    e.preventDefault();
    let queryParamArray = [...queryParams];
    queryParamArray.push({ key: "", value: "" });
    setQueryParamsCount(queryParamsCount + 1);
    setQueryParams(queryParamArray);
  };

  const removeQueryParamHandler = (index) => {
    let queryParamArray = [...queryParams];
    queryParamArray.splice(index, 1);
    setQueryParams(queryParamArray);
    setQueryParamsCount(queryParamsCount - 1);
  };

  const createTaskHandler = async (e) => {
    e.preventDefault();
    var finalTime = `${date}T${time}+05:30`;
    var finalDate = new Date(finalTime);
    var newUrl = url;
    if (queryParamsCount > 0) {
      newUrl += "?";
      for (let i = 0; i < queryParamsCount; i++) {
        if (i > 0) {
          newUrl += "&";
        }
        newUrl += queryParams[i]["key"] + "=" + queryParams[i]["value"];
      }
    }
    console.log(newUrl);
    let formData = {
      name: name,
      url: newUrl,
      timeDelay: finalDate,
      retryCount: retryCount,
      retryAfter: retryAfter,
    };
    const isValid = await taskSchema.isValid(formData);
    if (isValid === true) {
      setShowLoader(true);
      axios
        .post(
          `${env.BACKEND_URL}/task`,
          {
            name: name,
            url: newUrl,
            timeDelay: finalDate.getTime(),
            retryCount: retryCount.toString(),
            retryAfter: retryAfter.toString(),
          },
          {
            headers: {
              Authorization: `Bearer ${userLogin.user.token}`,
            },
          }
        )
        .then((res) => {
          if (res.status === 201) {
            notify("success", "Task Scheduled!");
            setName("");
            setUrl("");
            setShowLoader(false);
            history.push("/tasks");
          }
        })
        .catch((err) => {
          notify("error", "Something Went Wrong!");
          setShowLoader(false);
          console.log(err);
        });
    } else {
      notify("warning", "Please fill all the fields correctly!");
    }
  };

  useEffect(() => {
    let queryOptions = queryParams.map((param, index) => {
      return (
        <QueryParamsComp
          key={index}
          index={index}
          removeQueryParamHandler={removeQueryParamHandler}
          queryParams={queryParams}
          setQueryParams={setQueryParams}
        />
      );
    });
    setDisplayQueryOptions(queryOptions);
  }, [queryParamsCount, queryParams]);

  return (
    <div className="mt-20 flex-grow flex mx-8 sm:mx-16 justify-between py-8">
      <div className="w-full lg:w-1/2 flex flex-col md:flex-col ">
        <div className="bg-red ui-container py-0">
          <div className="mx-auto max-w-4xl ">
            <div className="flex justify-between flex-col md:flex-row items-baseline divide-y-4">
              <div>
                <h2 className="text-2xl font-bold focus:outline-none focus:shadow-outline">
                  Schedule Task
                </h2>
                <p className="mt-4 text-lg text-gray-500 font-medium">
                  Complete below fields to create a task
                </p>
              </div>
            </div>
            <form onSubmit={createTaskHandler}>
              <div className="mt-4 divide-y-2">
                <div className="flex flex-col question divide-y">
                  <div className="mb-4 py-2">
                    <div className="mb-4">
                      <label className="my-2 py-1 px-1 w-full font-semibold text-lg">
                        Task Name
                      </label>
                      <input
                        type="textarea"
                        name="task_name"
                        id="task_name"
                        className="mt-1 w-full py-2 rounded-lg px-5  focus:outline-none focus:ring focus:border-blue-300 duration-200 placeholder-gray-400 text-gray-700 border border-gray-300"
                        placeholder="Enter your task name"
                        required
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                        }}
                      ></input>
                    </div>
                    <div className="flex flex-col">
                      <label className="mb-2 mt-2 py-1 px-1 w-full font-semibold text-500 text-lg">
                        Task URL
                      </label>
                      <input
                        type="url"
                        name="task_URL"
                        id="task_URL"
                        className="mt-1 w-full py-2 rounded-lg px-5  focus:outline-none focus:ring focus:border-blue-300 duration-200 placeholder-gray-400 text-gray-700 border border-gray-300"
                        placeholder="Enter your AWS Lambda URL"
                        value={url}
                        onChange={(e) => {
                          setUrl(e.target.value);
                        }}
                        required
                      ></input>
                      <div className="text-sm mt-2 ml-1">{urlMatchStatus}</div>
                    </div>
                  </div>
                  <div className="py-4">
                    <label className="mb-3 mt-2 py-1 px-1 w-full font-semibold text-500 text-lg">
                      Query Parameters
                    </label>
                    <button
                      onClick={addQueryParamHandler}
                      className="text-xs py-1 px-1 mt-2 mr-auto flex items-center justify-start focus:outline-none rounded-md border border-gray-400 hover:bg-gray-50 flex items-center"
                    >
                      <AddIcon fontSize="small" />
                      <span className="mx-0.5 self-center">Add Parameters</span>
                    </button>
                    <div className="flex flex-col mt-1">
                      {displayQueryOptions}
                    </div>
                  </div>
                  <div className="mb-1 mt-1 w-full py-2">
                    <label className="mb-2 mt-2 py-1 px-1 w-full block font-semibold text-lg">
                      Time Delay
                    </label>
                    <input
                      type="date"
                      name="timedelay"
                      id="timedelay"
                      className="w-half mb-2 mr-2 py-2 rounded-lg px-5  focus:outline-none focus:ring focus:border-blue-300 duration-200 placeholder-gray-400 text-gray-700 border border-gray-300"
                      placeholder="Enter your time delay"
                      min={minValueDate}
                      value={date}
                      onChange={(e) => {
                        setdate(e.target.value);
                      }}
                      required
                    ></input>
                    <input
                      type="time"
                      name="timedelay"
                      id="timedelay"
                      step="2"
                      className="w-half py-2 rounded-lg px-5  focus:outline-none focus:ring focus:border-blue-300 duration-200 placeholder-gray-400 text-gray-700 border border-gray-300"
                      placeholder="Enter your time delay"
                      value={time}
                      onChange={(e) => {
                        settime(e.target.value);
                      }}
                      required
                    ></input>
                  </div>
                  <div className="w-full py-2">
                    <label className="mt-2 py-1 px-1 w-full block font-semibold text-lg">
                      Retry
                    </label>
                    <div className="flex">
                      <div>
                        <label className="mb-1 py-1 px-1 w-full block font-normal text-sm">
                          {`Number Of Retries (<=100)`}
                        </label>
                        <input
                          type="number"
                          name="retryCount"
                          id="retryCount"
                          className="w-half mb-2 mr-2 py-2 rounded-lg px-5  focus:outline-none focus:ring focus:border-blue-300 duration-200 placeholder-gray-400 text-gray-700 border border-gray-300"
                          placeholder="Enter retry count (<=100)"
                          value={retryCount}
                          onChange={(e) => {
                            setretryCount(e.target.value);
                          }}
                        ></input>
                      </div>
                      <div>
                        <label className="mb-1 py-1 px-1 w-full block font-normal text-sm">
                          Time Between Retries (in ms)
                        </label>
                        <input
                          type="number"
                          name="retryAfter"
                          id="retryAfter"
                          className="w-half py-2 rounded-lg px-5  focus:outline-none focus:ring focus:border-blue-300 duration-200 placeholder-gray-400 text-gray-700 border border-gray-300"
                          placeholder="Enter retry after seconds"
                          value={retryAfter}
                          onChange={(e) => {
                            setRetryAfter(e.target.value);
                          }}
                        ></input>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center mt-4 pt-8 border-t">
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex"
                    type="submit"
                  >
                    <div className="mr-1">
                      <AvTimerIcon />
                    </div>
                    <p className="self-center">Schedule Task</p>
                  </button>
                  {showLoader ? (
                    <div className="ml-4">
                      <Loader
                        type="Puff"
                        color="#00BFFF"
                        height={50}
                        width={50}
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="hidden lg:inline w-2/5 min-h-full">
        <SmoothImage
          src={FormImage}
          alt="for create task"
          transitionTime={1.0}
          //Other props if you choose to use them
        />
      </div>
    </div>
  );
};

export default CreateTask;
