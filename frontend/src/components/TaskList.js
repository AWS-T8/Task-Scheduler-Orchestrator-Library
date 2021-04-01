import { React, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Task from "./Helpers/Task";
import axios from "axios";
import env from "react-dotenv";
import notify from "./Helpers/Notification";
import { Link } from "react-router-dom";
import Dropdown from "./Helpers/Dropdown";
import Modal from "./Helpers/Modal";
import RefreshIcon from "@material-ui/icons/Refresh";
import AddIcon from "@material-ui/icons/Add";

const TaskList = () => {
  const [displayTasks, setdisplayTasks] = useState([]);
  const [totalTasks, setTotalTasks] = useState(0);
  const [scheduledTasks, setScheduledTasks] = useState(0);
  const [cancelledTask, setCancelledTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [failedTasks, setFailedTasks] = useState(0);
  const [runningTasks, setRunningTasks] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [showError, setShowError] = useState(false);
  const [dispStatus, setdispStatus] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [newTimeDelay, setNewTimeDelay] = useState(0);
  const [modifyID, setModifyID] = useState(-1);

  const userLogin = useSelector((state) => state.userLogin);
  const toggleRefresh = () => {
    setRefresh(!refresh);
  };

  const onCancelHandler = (id) => {
    // console.log(id);
    setLoading(true);

    fetch(`${env.BACKEND_URL}/task/cancel/${id}`, {
      method: "PATCH", // or 'PUT'
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userLogin.user.token}`,
      },
    })
      .then((res) => {
        if (res.status === 200) {
          notify("success", "Task Cancelled!");
        } else if (res.status === 403) {
          notify("error", "Task Cannot Be Cancelled!");
        } else if (res.status === 500) {
          notify("error", "Internal Server Error!");
        } else {
          notify("error", "Something Went Wrong!");
        }
        toggleRefresh();
      })
      .catch((err) => {
        notify("error", "Something Went Wrong!");
        toggleRefresh();
        console.log(err);
      });
  };

  const toggleModal = (id) => {
    setModifyID(id);
    setShowModal(true);
  };

  const onModifyHandler = () => {
    const changeID = modifyID;
    setModifyID(-1);
    setShowModal(false);
    setLoading(true);
    const url = `${env.BACKEND_URL}/task/${changeID}`;
    const data = {
      timeDelay: newTimeDelay,
    };
    const config = {
      method: "PATCH", // or 'PUT'
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userLogin.user.token}`,
      },
      body: JSON.stringify(data),
    };
    fetch(url, config)
      .then((res) => {
        if (res.status === 200) {
          notify("success", "Task Modified!");
        } else if (res.status === 406) {
          notify("warning", "Please Enter Valid Data!");
        } else if (res.status === 403) {
          notify("error", "Task Cannot Be Modified!");
        } else {
          notify("error", "Something Went Wrong!");
        }
        toggleRefresh();
      })
      .catch((err) => {
        toggleRefresh();
        notify("error", "Something Went Wrong!");
      });
  };

  const getAllTasks = () => {
    setLoading(true);
    let url = `${env.BACKEND_URL}/tasks`;
    const selectedStatus = dispStatus.toLowerCase();
    // if (dispStatus !== 'All') url += `/${dispStatus.toLowerCase()}`;
    axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${userLogin.user.token}`,
        },
      })
      .then((res) => res.data)
      .then(async (data) => {
        let scheduledTasksCount = 0,
          cancelledTasksCount = 0,
          completedTasksCount = 0,
          failedTasksCount = 0,
          totalTasksCount = 0,
          runningTasksCount = 0;
        let tasks = await data.reduce((accumulator, task) => {
          totalTasksCount++;
          if (task.status === "scheduled") scheduledTasksCount++;
          else if (task.status === "running") runningTasksCount++;
          else if (task.status === "failed") failedTasksCount++;
          else if (task.status === "cancelled") cancelledTasksCount++;
          else if (task.status === "completed") completedTasksCount++;
          if (task.status === selectedStatus || selectedStatus === "all") {
            accumulator.push(
              <Task
                key={task.id}
                id={task.id}
                name={task.name}
                URL={task.url}
                ScheduleTime={task.scheduledTime}
                Status={task.status}
                onCancelHandler={onCancelHandler}
                toggleModal={toggleModal}
              />
            );
          }
          return accumulator;
        }, []);
        console.log(tasks.length);
        if (tasks.length === 0) {
          tasks = (
            <div className="self-center">
              <p>No Tasks Found!</p>
            </div>
          );
        }
        setTotalTasks(totalTasksCount);
        setScheduledTasks(scheduledTasksCount);
        setRunningTasks(runningTasksCount);
        setCompletedTasks(completedTasksCount);
        setFailedTasks(failedTasksCount);
        setCancelledTasks(cancelledTasksCount);
        setdisplayTasks(tasks);
        setLoading(false);
      })
      .catch((err) => {
        setShowError(true);
        notify("error", "Something Went Wrong!");
        setLoading(false);
        console.log(err);
      });
  };

  const onStatusChangedHandler = (status) => {
    setdispStatus(status);
    toggleRefresh();
  };

  useEffect(() => {
    getAllTasks();
  }, [refresh]);

  return (
    <>
      {showError ? (
        <div className="self-center mt-28 md:mt-4 flex-grow flex flex-col md:flex-row mx-8 sm:mx-16 justify-center mb-4">
          <img
            src="https://i.pinimg.com/originals/d7/46/65/d74665c97dba34fe828ead80e30264a7.png"
            alt="Error"
          ></img>
        </div>
      ) : (
        <div>
          {loading ? (
            <div className="self-center mt-28 md:mt-4 flex-grow flex flex-col md:flex-row mx-8 sm:mx-16 justify-center mb-4">
              <img
                className="object-contain"
                src="https://thumbs.gfycat.com/DearWellinformedDalmatian-size_restricted.gif"
                alt="Loader"
              ></img>
            </div>
          ) : (
            <div className="mt-28 flex-grow flex flex-col-reverse lg:flex-row mx-8 sm:mx-16 justify-between mb-4">
              {showModal ? (
                <Modal
                  newTimeDelay={newTimeDelay}
                  setNewTimeDelay={setNewTimeDelay}
                  setShowModal={setShowModal}
                  onModifyHandler={onModifyHandler}
                />
              ) : null}
              {/* Task List */}
              <div className="lg:w-3/5 flex flex-col justify-around">
                {displayTasks}
              </div>
              {/* Dashboard */}
              <div className=" md:inline flex flex-col justify-start mb-8 lg:mb-0 w-full lg:w-1/3 lg:h-1/4 self-start">
                <div className="self-center mb-4 flex justify-start">
                  <div className="self-center mr-2">
                    <p>Show Status:</p>
                  </div>
                  <Dropdown
                    statusList={[
                      "All",
                      "Scheduled",
                      "Completed",
                      "Failed",
                      "Running",
                      "Cancelled",
                    ]}
                    onStatusChangedHandler={onStatusChangedHandler}
                    dispStatus={dispStatus}
                  />
                </div>
                <div className="flex justify-between mb-4">
                  <button
                    onClick={toggleRefresh}
                    type="button"
                    className="focus:outline-none  text-sm py-2.5 px-5 rounded-md border border-gray-600 hover:bg-gray-50 flex items-center"
                  >
                    <RefreshIcon fontSize="small" />
                    <p className="ml-1">Refresh</p>
                  </button>
                  <Link to="/createTask">
                    <button
                      onClick={toggleRefresh}
                      type="button"
                      className="focus:outline-none  text-sm py-2.5 px-5 rounded-md border border-gray-600 hover:bg-gray-50 flex items-center"
                    >
                      <AddIcon fontSize="small" />
                      <p className="ml-1">Create Task</p>
                    </button>
                  </Link>
                </div>

                <div className="bg-white shadow shadow-xl border  px-4 py-4 divide-y-4 divide-black-700">
                  <div>
                    <p className="font-semibold text-2xl">
                      Total Tasks: {totalTasks}
                    </p>
                  </div>
                  <div className="font-normal text-lg my-2 ">
                    <p className="my-2">Scheduled: {scheduledTasks}</p>
                    <p className="my-2">Completed: {completedTasks}</p>
                    <p className="my-2">Cancelled: {cancelledTask}</p>
                    <p className="my-2">Failed: {failedTasks}</p>
                    <p className="">Running: {runningTasks}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default TaskList;
