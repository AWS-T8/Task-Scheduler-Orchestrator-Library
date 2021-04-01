import React from "react";
import RemoveCircleOutlineIcon from "@material-ui/icons/RemoveCircleOutline";

const QueryParamsComp = ({
  index,
  removeQueryParamHandler,
  queryParams,
  setQueryParams,
}) => {
  return (
    <div className="flex">
      <div>
        <label className="mb-1 mt-1 py-1 px-1 w-full block font-normal text-sm">
          Key
        </label>
        <input
          type="textarea"
          name="key"
          id="key"
          className="w-half mb-2 mr-2 py-2 rounded-lg px-5  focus:outline-none focus:ring focus:border-blue-300 duration-200 placeholder-gray-400 text-gray-700 border border-gray-300"
          placeholder="Enter Key"
          value={queryParams[index].key}
          onChange={(e) => {
            let newQueryParams = [...queryParams];
            newQueryParams[index].key = e.target.value;
            setQueryParams(newQueryParams);
          }}
          required
        ></input>
      </div>
      <div className="flex flex-col">
        <label className="mb-1 mt-1 py-1 px-1 w-full block font-normal text-sm">
          Value
        </label>
        <div className="flex">
          <input
            type="textarea"
            name="value"
            id="value"
            className="w-half py-2 rounded-lg px-5  focus:outline-none focus:ring focus:border-blue-300 duration-200 placeholder-gray-400 text-gray-700 border border-gray-300"
            placeholder="Enter Value"
            value={queryParams[index].value}
            onChange={(e) => {
              let newQueryParams = [...queryParams];
              newQueryParams[index].value = e.target.value;
              setQueryParams(newQueryParams);
            }}
            required
          ></input>
          <div
            className="self-center ml-2"
            onClick={() => removeQueryParamHandler(index)}
          >
            <RemoveCircleOutlineIcon color="secondary" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueryParamsComp;
