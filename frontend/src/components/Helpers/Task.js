import React from "react";
import TextTruncate from "react-text-truncate";

const Task = ({
  id,
  name,
  URL,
  ScheduleTime,
  Status,
  onCancelHandler,
  toggleModal,
}) => {
  let color;
  if (Status === "scheduled") color = "#3B82F6";
  else if (Status === "running") color = "#FBBF24";
  else if (Status === "failed") color = "#F87171";
  else if (Status === "cancelled") color = "#9CA3AF";
  else if (Status === "completed") color = "#34D399";

  const StatusColor = {
    backgroundColor: color,
  };
  return (
    <div className="bg-white rounded border shadow shadow-xl flex flex-col justify-between mb-4">
      {/* Content */}
      <div className="flex justify-between px-4 py-4 ">
        <div className="flex flex-col">
          <p className="font-semibold text-2xl mb-1.5">{name}</p>
          {/* <TextTruncate line={1} element="span" truncateText="…" text={name} /> */}
          <p className="font-normal text-base mb-0.5">{ScheduleTime}</p>
          <div className="font-light text-sm font-light">
            <TextTruncate line={1} element="span" truncateText="…" text={URL} />
          </div>
          <p className="mt-1 font-light text-sm font-light">Status: {Status}</p>
        </div>
        <div className="flex flex-col justify-between">
          <button
            className="mb-1 text-sm bg-transparent hover:bg-blue-500 text-blue-700  hover:text-white py-1.5 px-2 border border-blue-500 hover:border-transparent rounded"
            onClick={() => toggleModal(id)}
          >
            Modify
          </button>
          <button
            onClick={() => onCancelHandler(id)}
            className="mt-1 text-sm bg-transparent hover:bg-red-500 text-red-700  hover:text-white py-1.5 px-2 border border-red-500 hover:border-transparent rounded"
          >
            Cancel
          </button>
        </div>
      </div>
      {/* Status Bar */}
      <div className="w-full h-3 rounded-b" style={StatusColor}></div>
    </div>
  );
};

export default Task;
