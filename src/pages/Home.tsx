import clsx from "clsx";
import React, { useState } from "react";
import MyDropzone from "../components/MyDropzone";
import ProgressBar from "../components/ProgressBar";
import { useDownloadManager } from "../hooks/useDownloadManager";
import { useProcessingState } from "../hooks/useProcessingState";
import { useProgressState } from "../hooks/useProgressState";

export const Home: React.FC = () => {
  const [targetGroup, setTargetGroup] = useState<"Administrators" | "Everyone">(
    "Administrators"
  );

  const { downloadUrl, filename, updateDownloadUrl, resetDownload } =
    useDownloadManager();

  const { isProcessing, startProcessing, stopProcessing } =
    useProcessingState(false);
  const { progress, updateProgress, resetProgress } = useProgressState();
  const [message, setMessage] = useState("");

  const handleReset = () => {
    resetDownload();
    resetProgress();
    setMessage("");
  };

  const showProgress = isProcessing && progress.total > 0;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
        OneTwo Security Remover
      </h1>
      <p className="text-center text-gray-600 mb-6">
        replace security groups from AppZip or XML files
      </p>

      {/* Radio buttons */}

      <div className="flex items-center justify-center gap-6 mb-6">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name="tar_group"
            value="Administrators"
            className="peer hidden"
            checked={targetGroup === "Administrators"}
            onChange={() => setTargetGroup("Administrators")}
          />
          <div className="px-4 py-2 rounded-lg border-2 border-gray-300 peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:text-blue-700 transition">
            Administrators
          </div>
        </label>

        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name="tar_group"
            value="Everyone"
            className="peer hidden"
            checked={targetGroup === "Everyone"}
            onChange={() => setTargetGroup("Everyone")}
          />
          <div className="px-4 py-2 rounded-lg border-2 border-gray-300 peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:text-blue-700 transition">
            Everyone
          </div>
        </label>
      </div>

      <MyDropzone
        className="w-full max-w-md min-h-32"
        isProcessing={isProcessing}
        onStartProcessing={() => {
          resetProgress();
          startProcessing();
          setMessage("");
        }}
        onStopProcessing={stopProcessing}
        onDownloadReady={(url, filename) => updateDownloadUrl(url, filename)}
        onProgressUpdate={updateProgress}
        onMessageUpdate={setMessage}
        targetGroup={targetGroup}
      />

      {/* Dynamic status container */}
      <div className="w-full max-w-md min-h-[170px] mt-6 flex flex-col items-center justify-start space-y-4">
        {/* Message */}
        <p
          className={clsx(
            "text-sm text-gray-700 font-medium h-5 transition-opacity duration-300",
            message ? "opacity-100 visible" : "opacity-0 invisible"
          )}
        >
          {message || "placeholder"}
        </p>

        {/* Progress */}
        <div
          className={clsx(
            "w-full transition-opacity duration-300",
            showProgress ? "opacity-100 visible" : "opacity-0 invisible"
          )}
        >
          <span className="text-gray-700 block text-center mb-1">
            Processing {progress.current}/{progress.total} files...
          </span>
          <ProgressBar current={progress.current} total={progress.total} />
        </div>

        {/* Buttons */}
        <div
          className={clsx(
            "flex space-x-4 transition-opacity duration-300",
            !isProcessing && downloadUrl
              ? "opacity-100 visible"
              : "opacity-0 invisible"
          )}
        >
          <a
            href={downloadUrl}
            download={filename}
            className="px-4 py-2 rounded bg-black text-white hover:bg-gray-800"
          >
            Download result
          </a>
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded bg-gray-300 text-gray-800 hover:bg-gray-400"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};
