import { React, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Lambda from "./Helpers/Lambda";
import axios from "axios";
import env from "react-dotenv";
import notify from "./Helpers/Notification";
import { Link } from "react-router-dom";
import RefreshIcon from "@material-ui/icons/Refresh";
import AddIcon from "@material-ui/icons/Add";

const LambdaList = () => {
  const [displayLambdas, setdisplayLambdas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [showError, setShowError] = useState(false);

  const userLogin = useSelector((state) => state.userLogin);
  const toggleRefresh = () => {
    setRefresh(!refresh);
  };

  const getAllLambdas = () => {
    setLoading(true);
    let url = `${env.BACKEND_URL}/lambda`;
    axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${userLogin.user.token}`,
        },
      })
      .then((res) => res.data)
      .then(async (data) => {
        let lambdas = await data.reduce((accumulator, lambda) => {
          accumulator.push(
            <Lambda
              key={lambda.id}
              id={lambda.id}
              name={lambda.name}
              URL={lambda.url}
              runtime={lambda.runtime}
              status={lambda.status}
            />
          );

          return accumulator;
        }, []);
        if (lambdas.length === 0) {
          lambdas = (
            <div className="self-center">
              <p>No Lambdas Found!</p>
            </div>
          );
        }
        setdisplayLambdas(lambdas);
        setLoading(false);
      })
      .catch((err) => {
        setShowError(true);
        notify("error", "Something Went Wrong!");
        setLoading(false);
        console.log(err);
      });
  };

  useEffect(() => {
    getAllLambdas();
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
            <div className="mt-28 flex-grow flex flex-col-reverse mx-8 sm:mx-16 justify-center mb-4">
              {/* Lambda List */}
              <div className="lg:w-3/5 flex flex-col justify-around self-center w-full">
                {displayLambdas}
              </div>
              {/* Utilities */}
              <div className="flex justify-around mb-4 self-center w-full mb-12">
                <div className="mr-2 md:mr-4">
                  <button
                    onClick={toggleRefresh}
                    type="button"
                    className="focus:outline-none  text-sm py-2.5 px-5 rounded-md border border-gray-600 hover:bg-gray-50 flex items-center"
                  >
                    <RefreshIcon fontSize="small" />
                    <p className="ml-1">Refresh</p>
                  </button>
                </div>
                <div className="ml-2 md:ml-4">
                  <Link to="/create-lambda">
                    <button
                      onClick={toggleRefresh}
                      type="button"
                      className="focus:outline-none  text-sm py-2.5 px-5 rounded-md border border-gray-600 hover:bg-gray-50 flex items-center"
                    >
                      <AddIcon fontSize="small" />
                      <p className="ml-1">Create Lambda</p>
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default LambdaList;
