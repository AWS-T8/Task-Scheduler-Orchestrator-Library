import React from "react";
import RemoveCircleOutlineIcon from "@material-ui/icons/RemoveCircleOutline";
const OrchestrationTaskList = ({
  index,
  removeTaskParamHandler,
  TaskList,
  setTaskList,
  displayDeleteButton,
}) => {
  return (
    <div className="flex flex-col w-full mb-2">
      <div className="">
        <label className="mt-2 px-1 w-full block font-normal text-sm">
          URL
        </label>
      </div>
      <div className="flex">
        <input
          type="textarea"
          name="url"
          id="url"
          className="mt-1 w-full py-2 rounded-lg px-5 self-center focus:outline-none focus:ring focus:border-blue-300 duration-200 placeholder-gray-400 text-gray-700 border border-gray-300"
          placeholder="Enter url"
          value={TaskList[index].url}
          onChange={(e) => {
            let newTaskList = [...TaskList];
            newTaskList[index].url = e.target.value;
            setTaskList(newTaskList);
          }}
          required
        ></input>
        {displayDeleteButton ? (
          <div
            className="ml-2 self-center"
            onClick={() => removeTaskParamHandler(index)}
          >
            <RemoveCircleOutlineIcon color="secondary" />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default OrchestrationTaskList;
