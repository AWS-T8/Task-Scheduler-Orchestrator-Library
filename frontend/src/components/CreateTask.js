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
  const [name, setname] = useState("");
  const [url, seturl] = useState("");
  const [timeDelay, settimeDelay] = useState(1);
  const [showLoader, setShowLoader] = useState(false);
  const [date, setdate] = useState(`${yyyy}-${mm}-${dd}`);
  const [time, settime] = useState(`${hh}:${min}:${sec}`);
  const [retryCount, setretryCount] = useState();
  const [retrySeconds, setretrySeconds] = useState();
  const userLogin = useSelector((state) => state.userLogin);

  const createTaskHandler = async (e) => {
    e.preventDefault();
    console.log(date);
    console.log(time);
    var finalTime = `${date}T${time}+05:30`;
    console.log(finalTime);
    var finalDate = new Date(finalTime);
    console.log(finalDate);
    let formData = {
      name: name,
      url: url,
      timeDelay: finalDate,
    };
    const isValid = await taskSchema.isValid(formData);
    if (isValid === true) {
      setShowLoader(true);
      axios
        .post(
          `${env.BACKEND_URL}/task`,
          {
            name: name,
            url: url,
            timeDelay: timeDelay.toString(),
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
            setname("");
            seturl("");
            settimeDelay(0);
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

  return (
    <div className="mt-20 flex-grow flex mx-8 sm:mx-16 justify-between py-8">
      <div className="w-full lg:w-1/2 flex flex-col md:flex-col ">
        {/* <div className="ui-container flex justify-center items-center">
          <div className="flex flex-col items-center">
            <div className="flex items-baseline">
              <h1 className="text-5xl font-bold focus:outline-none focus:shadow-outline">
                Task Scheduler
              </h1>
            </div>
          </div>
        </div> */}
        <div className="bg-red ui-container py-0">
          <div className="mx-auto max-w-4xl ">
            <div className="flex justify-between flex-col md:flex-row items-baseline">
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
              <div className="mt-4">
                <div className="flex flex-col question">
                  <label className="mb-2 mt-2 py-1 px-1 w-full font-semibold text-lg">
                    Task Name
                  </label>
                  <input
                    type="textarea"
                    name="task_name"
                    id="task_name"
                    className="w-full py-2 rounded-lg px-5  focus:outline-none focus:ring focus:border-blue-300 duration-200 placeholder-gray-400 text-gray-700 border border-gray-300"
                    placeholder="Enter your task name"
                    required
                    value={name}
                    onChange={(e) => {
                      setname(e.target.value);
                    }}
                  ></input>
                  <label className="mb-2 mt-2 py-1 px-1 w-full font-semibold text-500 text-lg">
                    Task URL
                  </label>
                  <input
                    type="url"
                    name="task_URL"
                    id="task_URL"
                    className="w-full py-2 rounded-lg px-5  focus:outline-none focus:ring focus:border-blue-300 duration-200 placeholder-gray-400 text-gray-700 border border-gray-300"
                    placeholder="Enter your AWS Lambda URL"
                    value={url}
                    onChange={(e) => {
                      seturl(e.target.value);
                    }}
                    required
                  ></input>
                  <label className="mb-2 mt-2 py-1 px-1 w-full font-semibold text-500 text-lg">
                    Query Parameters
                  </label>
                  <button
                    className="mr-auto bg-blue-900 px-2 py-2 focus:shadow-outline bg-primary-dark rounded-md text-md font-semibold flex items-center justify-start text-white focus:outline-none hover:text-gray-200"
                  >
                    <span className="mr-1">Add Key & Value Pair</span>
                  </button>
                  <div className="mb-1 mt-1 w-full">
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
                  <div className="w-full">
                    <label className="mb-2 mt-2 py-1 px-1 w-full block font-semibold text-lg">
                      Retry
                    </label>
                    <input
                      type="number"
                      name="retryCount"
                      id="retryCount"
                      className="w-half mb-2 mr-2 py-2 rounded-lg px-5  focus:outline-none focus:ring focus:border-blue-300 duration-200 placeholder-gray-400 text-gray-700 border border-gray-300"
                      placeholder="Enter retry count"
                      value={retryCount}
                      onChange={(e) => {
                        setretryCount(e.target.value);
                      }}
                    ></input>
                    <input
                      type="number"
                      name="retrySeconds"
                      id="retrySeconds"
                      className="w-half py-2 rounded-lg px-5  focus:outline-none focus:ring focus:border-blue-300 duration-200 placeholder-gray-400 text-gray-700 border border-gray-300"
                      placeholder="Enter retry after seconds"
                      value={retrySeconds}
                      onChange={(e) => {
                        setretrySeconds(e.target.value);
                      }}
                    ></input>
                  </div>
                </div>
              </div>
              <div className="flex justify-center mt-10 pt-8 border-t">
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  type="submit"
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="lightning-bolt w-6 h-6 mr-2 inline"
                  >
                    <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"></path>
                  </svg>
                  Schedule Task
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
            </form>
          </div>
        </div>
      </div>
      <div className="hidden lg:inline w-2/5 min-h-full self-center z-0">
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
